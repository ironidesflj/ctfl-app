import { describe, it, expect } from "vitest";
import { getBank } from "./bank.js";

describe.each(["ctfl", "ctal-ta", "ctal-tm"])("bank(%s) - distribuição do simulado", (certId) => {
  it("buildExamInLang segue os pesos oficiais por capítulo, sem filler aleatório", () => {
    const { chapters, META, buildExamInLang } = getBank(certId);
    const WEIGHTS_TOTAL = Object.values(META.chapterWeights[certId]).reduce(
      (s, w) => s + Number(w),
      0
    );
    const exam = buildExamInLang("pt");
    expect(exam.length).toBe(META.examFormat[certId].questions);
    const counts = {};
    exam.forEach((q) => {
      counts[q.chapter] = (counts[q.chapter] || 0) + 1;
    });
    chapters.forEach((c) => {
      const want = Math.round(
        (META.chapterWeights[certId][String(c.chapter)] / WEIGHTS_TOTAL) *
          META.examFormat[certId].questions
      );
      expect(counts[c.chapter] || 0).toBe(want);
    });
  });
});

const { ALL, chapters, byChapterInLang, byIds, buildExamInLang, shuffleOptions } = getBank("ctfl");

describe("bank - data integrity", () => {
  it("has exactly 300 questions", () => {
    expect(ALL.length).toBe(300);
  });

  it("every question has a valid answer index within its options", () => {
    ALL.forEach((q) => {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    });
  });

  it("every question belongs to a known chapter", () => {
    const chapterIds = chapters.map((c) => String(c.chapter));
    ALL.forEach((q) => {
      expect(chapterIds).toContain(String(q.chapter));
    });
  });

  it("byChapterInLang filters correctly", () => {
    const tec = byChapterInLang(4);
    expect(tec.every((q) => String(q.chapter) === "4")).toBe(true);
    expect(tec.length).toBeGreaterThan(0);
  });

  it("byIds returns only matching questions", () => {
    const sample = ALL.slice(0, 3).map((q) => q.id);
    const result = byIds(sample);
    expect(result.length).toBe(3);
  });

  it("buildExamInLang returns exactly 40 questions", () => {
    const exam = buildExamInLang();
    expect(exam.length).toBe(40);
  });

  it("buildExamInLang returns no duplicate questions", () => {
    const exam = buildExamInLang();
    const ids = exam.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("shuffleOptions preserves the correct answer (exactly one marked correct)", () => {
    const q = ALL[0];
    const shuffled = shuffleOptions(q);
    const correctCount = shuffled.filter((o) => o.correct).length;
    expect(correctCount).toBe(1);
  });
});

// ─── r4: simulado personalizado (buildCustomExamInLang) ───
const bankCTFL = getBank("ctfl");
describe("bank - simulado personalizado (r4)", () => {
  it("respeita os capítulos selecionados — nada fora da seleção", () => {
    const sel = ["1", "4"];
    const exam = bankCTFL.buildCustomExamInLang("pt", { chapters: sel, kLevels: [], count: 15 });
    expect(exam.length).toBe(15);
    expect(exam.every((q) => sel.includes(String(q.chapter)))).toBe(true);
  });

  it("respeita o filtro de K-level — só questões do nível pedido", () => {
    const exam = bankCTFL.buildCustomExamInLang("pt", { chapters: null, kLevels: [3], count: 8 });
    expect(exam.length).toBe(8);
    expect(exam.every((q) => q.kLevel === 3)).toBe(true);
  });

  it("combina capítulos × K-level sem vazar nenhum dos dois filtros", () => {
    const sel = ["2", "3"];
    const exam = bankCTFL.buildCustomExamInLang("pt", {
      chapters: sel,
      kLevels: [1, 2],
      count: 12,
    });
    expect(exam.every((q) => sel.includes(String(q.chapter)))).toBe(true);
    expect(exam.every((q) => [1, 2].includes(q.kLevel))).toBe(true);
  });

  it("count maior que o pool devolve o pool inteiro, sem duplicatas nem filler", () => {
    const sel = ["6"]; // capítulo pequeno
    // r13: o simulado personalizado sorteia do POOL EXCLUSIVO — o pool de
    // referência é o EXAM do capítulo (4 questões no CTFL pós-partição),
    // não o capítulo inteiro (11 de estudo + 4 de exame = 15 no banco).
    const poolLen = bankCTFL.EXAM.filter((q) => String(q.chapter) === "6").length;
    const exam = bankCTFL.buildCustomExamInLang("pt", { chapters: sel, kLevels: [], count: 999 });
    expect(exam.length).toBe(poolLen);
    const ids = exam.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(exam.every((q) => String(q.chapter) === "6")).toBe(true);
  });

  it("seleção vazia de capítulos cai no pool completo (todos)", () => {
    const exam = bankCTFL.buildCustomExamInLang("pt", { chapters: [], kLevels: [], count: 10 });
    expect(exam.length).toBe(10);
  });

  it("filtra K-level inexistente na seleção → prova vazia (caller valida)", () => {
    const exam = bankCTFL.buildCustomExamInLang("pt", { chapters: ["6"], kLevels: [4], count: 10 });
    expect(exam.length).toBe(0);
  });

  it("amostragem proporcional: capítulo com peso maior recebe mais questões", () => {
    // ch4 tem 82 questões/peso 11; ch6 tem 15/peso 2 — numa prova de 20,
    // ch4 deve receber claramente mais que ch6
    const exam = bankCTFL.buildCustomExamInLang("pt", {
      chapters: ["4", "6"],
      kLevels: [],
      count: 20,
    });
    const c4 = exam.filter((q) => String(q.chapter) === "4").length;
    const c6 = exam.filter((q) => String(q.chapter) === "6").length;
    expect(c4).toBeGreaterThan(c6);
  });
});

// ─── r5: sessão de pontos fracos (buildWeakFocusInLang) ───
describe("bank - treinar pontos fracos (r5)", () => {
  it("vazio quando nenhum capítulo tem o mínimo de 3 respostas", () => {
    const out = bankCTFL.buildWeakFocusInLang("pt", { 1: { t: 2, c: 0 } });
    expect(out).toEqual([]);
  });

  it("vazio quando byDomain não tem dados", () => {
    expect(bankCTFL.buildWeakFocusInLang("pt", {})).toEqual([]);
    expect(bankCTFL.buildWeakFocusInLang("pt", undefined)).toEqual([]);
  });

  it("só inclui capítulos fracos (acerto < 80%) — capítulos fortes ficam fora", () => {
    const out = bankCTFL.buildWeakFocusInLang("pt", {
      1: { t: 10, c: 2 }, // 20% → foco
      4: { t: 10, c: 9 }, // 90% → fora
    });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((q) => String(q.chapter) === "1")).toBe(true);
  });

  it("quando todos os capítulos passam de 80%, usa o pior deles", () => {
    const out = bankCTFL.buildWeakFocusInLang("pt", {
      1: { t: 10, c: 9 }, // 90%
      4: { t: 10, c: 8 }, // 80% — pior, ainda vira foco
    });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((q) => String(q.chapter) === "4")).toBe(true);
  });

  it("questões erradas vêm antes das não vistas dentro do capítulo focado", () => {
    // r13: o pool do modo estudo é o STUDY — as erradas de referência vêm
    // de lá (ch1-02, p.ex., migrou para o pool exclusivo do simulado)
    const ch1 = bankCTFL.STUDY.filter((q) => String(q.chapter) === "1");
    const wrongIds = [ch1[0].id, ch1[1].id];
    const seen = { [ch1[2].id]: true };
    const out = bankCTFL.buildWeakFocusInLang("pt", { 1: { t: 5, c: 1 } }, { seen, wrongIds });
    expect(out.length).toBeGreaterThan(0);
    // as duas erradas são as primeiras da sessão (prioridade máxima)
    expect(
      out
        .slice(0, 2)
        .map((q) => q.id)
        .sort()
    ).toEqual([...wrongIds].sort());
    // e nada duplicado
    const ids = out.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("intercala capítulos fracos (round-robin): começa com o mais fraco", () => {
    const out = bankCTFL.buildWeakFocusInLang("pt", {
      1: { t: 10, c: 1 }, // 10% — mais fraco
      4: { t: 10, c: 4 }, // 40% — segundo foco
    });
    expect(out.length).toBeGreaterThan(1);
    expect(String(out[0].chapter)).toBe("1");
    expect(String(out[1].chapter)).toBe("4");
    // todos os questions vêm dos capítulos focados
    expect(out.every((q) => ["1", "4"].includes(String(q.chapter)))).toBe(true);
  });

  it("limita o foco a 3 capítulos mesmo com muitos fracos", () => {
    const byDomain = {};
    for (let ch = 1; ch <= 6; ch++) byDomain[String(ch)] = { t: 10, c: 1 };
    const out = bankCTFL.buildWeakFocusInLang("pt", byDomain);
    const used = new Set(out.map((q) => String(q.chapter)));
    expect(used.size).toBeLessThanOrEqual(3);
  });
});
