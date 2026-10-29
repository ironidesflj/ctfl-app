import { beforeEach, describe, expect, it } from "vitest";
import { migrateViteProgressIfNeeded } from "./migrate";
import {
  loadProgress,
  saveProgress,
  recordAnswer,
  rateSRS,
  logExamResult,
  saveExamDraft,
  toggleSaved,
} from "../lib/storage.js";
import { setSetting } from "../lib/settings.js";

describe("migrateViteProgressIfNeeded", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("não altera nada quando não há dados antigos", () => {
    const summary = migrateViteProgressIfNeeded();
    expect(summary.migratedCerts).toEqual([]);
    expect(summary.totalAttempts).toBe(0);
    expect(summary.totalSeen).toBe(0);
    expect(localStorage.getItem("synapse.seen.v1")).toBeNull();
  });

  it("migra registros reais gerados pelas funções da 3.18 preservando capítulo, tentativas, histórico, SRS, simulado e rascunho", () => {
    // 1. Gera fixtures com as funções REAIS da 3.18
    let prog = loadProgress("ctfl");
    // Respostas: ch1-01 (capítulo 1) correta, ch1-02 errada
    prog = recordAnswer(prog, 1, true, "ch1-01");
    prog = recordAnswer(prog, 1, false, "ch1-02");
    // Questão com múltiplas tentativas: primeiro acerta, depois erra
    prog = recordAnswer(prog, 2, true, "ch2-01");
    prog = recordAnswer(prog, 2, false, "ch2-01");

    // SRS
    prog = rateSRS(prog, "ch1-01", "good");
    prog = rateSRS(prog, "ch1-02", "hard");

    // Questão salva
    prog = toggleSaved(prog, "ch1-01");

    // Simulado
    prog = logExamResult(prog, 75, true, null, {
      total: 40,
      wrongIds: ["ch1-02"],
      custom: false,
    });

    saveProgress(prog, "ctfl");

    // Rascunho com a função real da 3.18 (sem campo cert na raiz do payload)
    saveExamDraft("ctfl", {
      questionIds: ["ch1-01", "ch1-02"],
      optOrder: [
        [0, 1, 2, 3],
        [3, 2, 1, 0],
      ],
      answers: [2, null],
      idx: 1,
      timeLeft: 3500,
      savedAt: 1729000000000,
    });

    // Preferências com as funções reais da 3.18
    setSetting("goal", "20");
    setSetting("lang", "pt");
    setSetting("theme", "dark");
    setSetting("onboardingDone", "1");
    setSetting("reminderEnabled", "1");
    setSetting("reminderTime", "20:30");
    setSetting("examDate", "2026-12-01");
    localStorage.setItem("synapse.lastCert", "ctfl");

    // 2. Executa a migração
    const summary = migrateViteProgressIfNeeded();

    expect(summary.migratedCerts).toContain("ctfl");
    expect(summary.totalSeen).toBeGreaterThanOrEqual(3);
    expect(summary.totalAttempts).toBe(3);
    expect(summary.totalCards).toBe(2);
    expect(summary.totalExams).toBe(1);
    expect(summary.totalSaved).toBe(1);
    expect(summary.draftRestored).toBe(true);
    expect(summary.onboardingMarked).toBe(true);

    // 3. Validações no schema novo
    // (a) Seen com capítulo real (não hardcoded 1)
    const seen = JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}").ctfl;
    expect(seen["ch1-01"]).toBe(1);
    expect(seen["ch1-02"]).toBe(1);
    expect(seen["ch2-01"]).toBe(2);

    // (b) Attempts preservando acertos, erros e contagem
    const attempts = JSON.parse(localStorage.getItem("synapse.attempts.v1") || "{}").ctfl;
    expect(attempts["ch1-01"]).toMatchObject({
      ok: 1,
      tries: 1,
      last: true,
      ch: 1,
    });
    expect(attempts["ch1-02"]).toMatchObject({
      ok: 0,
      tries: 1,
      last: false,
      ch: 1,
    });
    expect(attempts["ch2-01"]).toMatchObject({
      ok: 1,
      tries: 2,
      last: false,
      ch: 2,
    });

    // (c) Histórico e check-ins diários
    const checkins = JSON.parse(localStorage.getItem("synapse.checkins.v1") || "[]");
    expect(checkins.length).toBeGreaterThan(0);
    const log = JSON.parse(localStorage.getItem("synapse.log.v1") || "{}").ctfl;
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].total).toBeGreaterThanOrEqual(4);

    // (d) Cartões SRS
    const cards = JSON.parse(localStorage.getItem("synapse.cards.v1") || "{}").ctfl;
    expect(cards["ch1-01"]).toMatchObject({
      ch: 1,
      streak: 1,
      reviews: 1,
    });
    expect(cards["ch1-02"]).toMatchObject({
      ch: 1,
      streak: 1,
      reviews: 1,
    });
    const srsStats = JSON.parse(localStorage.getItem("synapse.srs.v1") || "{}").ctfl;
    expect(srsStats.good).toBe(1);
    expect(srsStats.hard).toBe(1);

    // (e) Simulado incluindo campo `n`
    const exams = JSON.parse(localStorage.getItem("synapse.exams.v1") || "{}").ctfl;
    expect(exams).toHaveLength(1);
    expect(exams[0]).toMatchObject({
      n: 40,
      pct: 75,
      passed: true,
      wrongIds: ["ch1-02"],
    });

    // (f) Questões salvas
    const saved = JSON.parse(localStorage.getItem("synapse.saved.v1") || "{}").ctfl;
    expect(saved).toContain("ch1-01");

    // (g) Rascunho com cert e normalização
    const draft = JSON.parse(localStorage.getItem("synapse.examdraft.v1") || "{}");
    expect(draft.cert).toBe("ctfl");
    expect(draft.questionIds).toEqual(["ch1-01", "ch1-02"]);
    expect(draft.answers).toEqual([2, null]);
    expect(draft.idx).toBe(1);
    expect(draft.timeLeft).toBe(3500);

    // (h) Preferências
    expect(localStorage.getItem("synapse.goal")).toBe("20");
    expect(localStorage.getItem("synapse.lang.v1")).toBe("pt");
    expect(localStorage.getItem("synapse.theme.v1")).toBe("dark");
    expect(localStorage.getItem("synapse.onboarding.v2")).toBe("1");
    const settings = JSON.parse(localStorage.getItem("synapse.settings.v1") || "{}");
    expect(settings).toEqual({ enabled: true, time: "20:30" });
    const examDate = JSON.parse(localStorage.getItem("synapse.examdate.v1") || "{}");
    expect(examDate.ctfl).toBe("2026-12-01");
    expect(localStorage.getItem("synapse.cert.v1")).toBe("ctfl");

    // 4. CHAVES ANTIGAS DEVEM CONTINUAR INTACTAS
    expect(localStorage.getItem("synapse.progress.v1.ctfl")).not.toBeNull();
    expect(localStorage.getItem("synapse.examDraft.v1.ctfl")).not.toBeNull();
    expect(localStorage.getItem("synapse.goal")).toBe("20");

    // 5. IDEMPOTÊNCIA: rodar uma segunda vez não altera nem duplica dados
    const secondSummary = migrateViteProgressIfNeeded();
    expect(secondSummary.totalAttempts).toBe(0);
    expect(secondSummary.totalCards).toBe(0);
    expect(secondSummary.totalExams).toBe(0);

    const checkins2 = JSON.parse(localStorage.getItem("synapse.checkins.v1") || "[]");
    expect(checkins2).toEqual(checkins);
    const exams2 = JSON.parse(localStorage.getItem("synapse.exams.v1") || "{}").ctfl;
    expect(exams2).toHaveLength(1);
  });

  it("migra progresso CTAL-TA e CTAL-TM com mapeamento correto de capítulos", () => {
    let progTA = loadProgress("ctal-ta");
    progTA = recordAnswer(progTA, 1, true, "ctalta-01"); // cap 1
    progTA = recordAnswer(progTA, 2, true, "ctalta-19"); // cap 2
    progTA = recordAnswer(progTA, 3, false, "ctalta-27"); // cap 3
    saveProgress(progTA, "ctal-ta");

    let progTM = loadProgress("ctal-tm");
    progTM = recordAnswer(progTM, 1, true, "ctaltm-01"); // cap 1
    progTM = recordAnswer(progTM, 2, false, "ctaltm-56"); // cap 2
    progTM = recordAnswer(progTM, 3, true, "ctaltm-83"); // cap 3
    saveProgress(progTM, "ctal-tm");

    migrateViteProgressIfNeeded();

    const seenTA = JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}")["ctal-ta"];
    expect(seenTA["ctalta-01"]).toBe(1);
    expect(seenTA["ctalta-19"]).toBe(2);
    expect(seenTA["ctalta-27"]).toBe(3);

    const seenTM = JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}")["ctal-tm"];
    expect(seenTM["ctaltm-01"]).toBe(1);
    expect(seenTM["ctaltm-56"]).toBe(2);
    expect(seenTM["ctaltm-83"]).toBe(3);
  });

  it("substitui dados existentes quando overwrite: true é passado", () => {
    // 1. Estado v4.1 pré-existente
    localStorage.setItem(
      "synapse.seen.v1",
      JSON.stringify({ ctfl: { "ch1-old": 1 }, "ctal-ta": { "ctalta-keep": 1 } })
    );
    localStorage.setItem(
      "synapse.attempts.v1",
      JSON.stringify({ ctfl: { "ch1-old": { ok: 1, tries: 1, ch: 1 } } })
    );

    // 2. Dado legado novo para ctfl
    let prog = loadProgress("ctfl");
    prog = recordAnswer(prog, 1, true, "ch1-new");
    saveProgress(prog, "ctfl");

    // 3. Migração com overwrite apenas em ctfl
    migrateViteProgressIfNeeded({ overwrite: true, targetCerts: ["ctfl"] });

    const seen = JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}");
    expect(seen.ctfl["ch1-new"]).toBe(1);
    expect(seen.ctfl["ch1-old"]).toBeUndefined();
    // ctal-ta deve continuar intacto
    expect(seen["ctal-ta"]["ctalta-keep"]).toBe(1);
  });
});
