import { describe, it, expect } from "vitest";
import { getBank } from "./bank.js";
import { loadBankFor } from "./bank.js";

/* r13 — Inváriantes dos pools exclusivos (estudo × simulado).
   O requisito central da rodada: NENHUMA questão pode Circular nos dois
   mundos. Estes testes travam o invariante em ambas as direções e em
   todos os caminhos de seleção — é o "contrato de isolamento" que o Red
   Team exige (sem ele, qualquer regressão futura no bank.js vazaria
   silenciosamente questões de prova para o estudo, ou vice-versa). */

await loadBankFor("ctfl");
await loadBankFor("ctal-ta");
await loadBankFor("ctal-tm");
const ctfl = getBank("ctfl");
const ta = getBank("ctal-ta");
const tm = getBank("ctal-tm");

describe.each([
  ["ctfl", ctfl, 300, 220, 80],
  ["ctal-ta", ta, 200, 110, 90],
  ["ctal-tm", tm, 200, 101, 99],
])("pools exclusivos — %s", (_id, bank, total, studyN, examN) => {
  it(`pool de estudo tem ${studyN} e pool de simulado ${examN} (total ${total})`, () => {
    expect(bank.ALL.length).toBe(total);
    expect(bank.STUDY.length).toBe(studyN);
    expect(bank.EXAM.length).toBe(examN);
    expect(bank.STUDY.length + bank.EXAM.length).toBe(bank.ALL.length);
  });

  it("interseção estudo × simulado é vazia (por id e por objeto)", () => {
    const studyIds = new Set(bank.STUDY.map((q) => q.id));
    const examIds = new Set(bank.EXAM.map((q) => q.id));
    for (const id of studyIds) expect(examIds.has(id)).toBe(false);
    for (const id of examIds) expect(studyIds.has(id)).toBe(false);
    // toda questão tem pool declarado e válido
    bank.ALL.forEach((q) => expect(["study", "exam"]).toContain(q.pool));
  });

  it("buildExamInLang sorteia SOMENTE do pool de simulado (30 sorteios)", () => {
    const examIds = new Set(bank.EXAM.map((q) => q.id));
    for (let i = 0; i < 30; i++) {
      const exam = bank.buildExamInLang("pt");
      expect(exam.length).toBeGreaterThan(0);
      exam.forEach((q) => expect(examIds.has(q.id)).toBe(true));
      // sem duplicatas dentro da mesma prova
      expect(new Set(exam.map((q) => q.id)).size).toBe(exam.length);
    }
  });

  it("buildExamInLang mantém o blueprint oficial intacto no pool exclusivo (células cap×K)", () => {
    const exam = bank.buildExamInLang("pt");
    const expected = bank.META.examFormat[bank.cert.id].questions;
    expect(exam.length).toBe(expected);
    const bp = bank.META.examBlueprint[bank.cert.id].chapters;
    Object.entries(bp).forEach(([ch, spec]) => {
      const got = exam.filter((q) => String(q.chapter) === String(ch)).length;
      expect(got).toBe(spec.questions);
      Object.entries(spec.kLevels || {}).forEach(([k, wantN]) => {
        const gotK = exam.filter(
          (q) => String(q.chapter) === String(ch) && "K" + q.kLevel === k
        ).length;
        expect(gotK).toBe(wantN);
      });
    });
  });

  it("byChapterInLang (estudo) nunca devolve questão do pool de simulado", () => {
    const examIds = new Set(bank.EXAM.map((q) => q.id));
    const all = bank.byChapterInLang("all", "pt");
    expect(all.length).toBe(bank.STUDY.length);
    all.forEach((q) => expect(examIds.has(q.id)).toBe(false));
    bank.chapters.forEach((c) => {
      bank.byChapterInLang(String(c.chapter), "pt").forEach((q) => {
        expect(examIds.has(q.id)).toBe(false);
      });
    });
  });

  it("buildCustomExamInLang (simulado personalizado) só usa pool de simulado", () => {
    const examIds = new Set(bank.EXAM.map((q) => q.id));
    // seleção ampla
    let custom = bank.buildCustomExamInLang("pt", { chapters: null, kLevels: [], count: 45 });
    custom.forEach((q) => expect(examIds.has(q.id)).toBe(true));
    // seleção estreita (capítulo único)
    const someChapter = String(bank.chapters[0].chapter);
    custom = bank.buildCustomExamInLang("pt", { chapters: [someChapter], kLevels: [], count: 10 });
    custom.forEach((q) => expect(examIds.has(q.id)).toBe(true));
  });

  it("buildWeakFocusInLang (pontos fracos) só usa pool de estudo", () => {
    const examIds = new Set(bank.EXAM.map((q) => q.id));
    const chapters = bank.chapters.map((c) => ({ [String(c.chapter)]: { t: 5, c: 1 } }));
    const byDomain = Object.assign({}, ...chapters);
    const out = bank.buildWeakFocusInLang("pt", byDomain, { seen: {}, wrongIds: [] });
    out.forEach((q) => expect(examIds.has(q.id)).toBe(false));
  });

  it("cobertura (capítulo e K-level) é medida sobre o pool de estudo", () => {
    const seenAll = Object.fromEntries(bank.ALL.map((q) => [q.id, 1]));
    const cov = bank.coverageByChapter(seenAll);
    Object.values(cov).forEach((v) => {
      expect(v.seen).toBe(v.total); // 100% do estudo é alcançável SEM as exclusivas
    });
    const totalSeen = Object.values(cov).reduce((s, v) => s + v.seen, 0);
    expect(totalSeen).toBe(bank.STUDY.length);
    const kcov = bank.coverageByKLevel(seenAll);
    const kTotal = Object.values(kcov).reduce((s, v) => s + v.total, 0);
    expect(kTotal).toBe(bank.STUDY.length);
  });

  it("pool de simulado equivale a 2 blueprints (F=2) e células atendem 1× no mínimo", () => {
    // r19: exceção documentada — o banco CTAL-TM tem 7 questões em cap2 K3
    // para um blueprint de 4: cada prova sorteia 4 com folga (invariante ≥want
    // acima), mas 2 provas 100% disjuntas nessa célula não são garantidas
    // (7 < 8). Limitação do acervo de 200 questões, registrada no ledger do
    // banco e no poolSplit.meta — não é regressão.
    const F2_EXCEPTIONS = { "ctal-tm:2:K3": 7 };
    const bp = bank.META.examBlueprint[bank.cert.id].chapters;
    Object.entries(bp).forEach(([ch, spec]) => {
      Object.entries(spec.kLevels || {}).forEach(([k, wantN]) => {
        const want = Number(wantN) || 0;
        if (want <= 0) return;
        const have = bank.EXAM.filter(
          (q) => String(q.chapter) === String(ch) && "K" + q.kLevel === k
        ).length;
        expect(have).toBeGreaterThanOrEqual(want); // viável
        const f2 = F2_EXCEPTIONS[`${bank.cert.id}:${ch}:${k}`];
        expect(have).toBeGreaterThanOrEqual(f2 ?? 2 * want); // F=2 garantido
      });
    });
  });

  it("gabarito do pool de simulado é balanceado entre os 4 índices", () => {
    // o partition_pools.py escolhe balanceando o gabarito — o invariante
    // sobrevive a re-partições futuras (máx 40% por índice)
    const counts = [0, 0, 0, 0];
    bank.EXAM.forEach((q) => {
      counts[q.answer]++;
    });
    const total = bank.EXAM.length;
    counts.forEach((c) => expect(c / total).toBeLessThan(0.4));
  });
});

describe("pools exclusivos — localização", () => {
  it("allStudyInLang/allExamInLang respeitam pool no idioma EN", () => {
    const examPt = new Set(ctfl.EXAM.map((q) => q.id));
    const studyEn = ctfl.allStudyInLang("en");
    const examEn = ctfl.allExamInLang("en");
    studyEn.forEach((q) => expect(examPt.has(q.id)).toBe(false));
    examEn.forEach((q) => expect(examPt.has(q.id)).toBe(true));
    expect(studyEn.length + examEn.length).toBe(ctfl.ALL.length);
  });

  it("localized() propaga o campo pool (estudo e simulado)", () => {
    expect(ctfl.EXAM.every((q) => q.pool === "exam")).toBe(true);
    expect(ctfl.STUDY.every((q) => q.pool === "study")).toBe(true);
  });
});

describe("pools exclusivos — examFormat oficial (r13)", () => {
  it("CTFL: contagem simples, corte 26/40, tempo nativo 60 min", () => {
    const f = ctfl.META.examFormat.ctfl;
    expect(f.scoring).toBe("count");
    expect(f.passMark).toBe(26);
    expect(f.questions).toBe(40);
    expect(f.timeMinutes).toBe(60); // BSTQB PT-BR nativo
    expect(f.timeMinutesNonNative).toBe(75);
  });

  it("CTAL-TA: pontuação ponderada, 78 pontos, corte 51, tempo nativo 120 min", () => {
    const f = ta.META.examFormat["ctal-ta"];
    expect(f.scoring).toBe("points");
    expect(f.passMark).toBe(51);
    expect(f.totalPoints).toBe(78);
    expect(f.questions).toBe(45);
    expect(f.timeMinutes).toBe(120);
    // pontos por K: K2=1, K3=2, K4=3 → 78 no blueprint
    expect(f.pointsByK).toEqual({ 2: 1, 3: 2, 4: 3 });
    const bp = ta.META.examBlueprint["ctal-ta"].chapters;
    const PTS = { K2: 1, K3: 2, K4: 3 };
    const pts = Object.values(bp).reduce((sum, spec) => {
      return (
        sum +
        Object.entries(spec.kLevels || {}).reduce((s, [k, n]) => {
          return s + (Number(n) || 0) * (PTS[k] || 0); // chaves K1:0 explícitas → 0
        }, 0)
      );
    }, 0);
    expect(pts).toBe(78);
  });
});
