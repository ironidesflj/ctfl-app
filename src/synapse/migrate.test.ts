import { beforeEach, describe, expect, it } from "vitest";
import { migrateViteProgressIfNeeded } from "./migrate";

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

  it("migra dados reais representativos do CTFL salvos na versão Vite anterior", () => {
    // Simula dados reais do localStorage da versão Vite anterior
    const fakeViteCtfl = {
      schemaVersion: 2,
      total: 10,
      correct: 8,
      byDomain: { "1": { total: 5, correct: 4 }, "2": { total: 5, correct: 4 } },
      seen: {
        "ctfl-q1": true,
        "ctfl-q2": true,
        "ctfl-q3": true,
      },
      attempts: {
        "ctfl-q1": {
          ok: true,
          last: "2026-10-25T14:30:00.000Z",
          tries: 1,
          domain: 1,
          history: [true],
        },
        "ctfl-q2": {
          ok: false,
          last: "2026-10-25T14:35:00.000Z",
          tries: 2,
          domain: 1,
          history: [false, false],
        },
        "ctfl-q3": {
          ok: true,
          last: "2026-10-26T10:00:00.000Z",
          tries: 1,
          domain: 2,
          history: [true],
        },
      },
      history: [
        { date: "2026-10-25", count: 2, correct: 1 },
        { date: "2026-10-26", count: 1, correct: 1 },
      ],
      lastStudyDate: "2026-10-26",
      srs: {
        "ctfl-q1": {
          interval: 3,
          repetitions: 2,
          easeFactor: 2.5,
          dueDate: "2026-10-29T14:30:00.000Z",
        },
      },
      srsStats: {
        again: 1,
        hard: 2,
        good: 5,
        easy: 1,
        reviews: 9,
      },
      examHistory: [
        {
          id: "exam-1",
          date: "2026-10-26T12:00:00.000Z",
          total: 40,
          correct: 30,
          pct: 75,
          passed: true,
          custom: false,
          wrongIds: ["ctfl-q10", "ctfl-q12"],
        },
      ],
    };

    localStorage.setItem("synapse.progress.v1.ctfl", JSON.stringify(fakeViteCtfl));
    localStorage.setItem("synapse.onboardingDone", "true");
    localStorage.setItem(
      "synapse.examDraft.v1.ctfl",
      JSON.stringify({
        cert: "ctfl",
        questionIds: ["ctfl-q1", "ctfl-q2"],
        optOrder: [[0, 1, 2, 3]],
        answers: { "0": 1 },
        flags: [false],
        durations: [15],
        idx: 1,
        timeLeft: 3500,
        custom: false,
        savedAt: Date.now(),
      })
    );

    const summary = migrateViteProgressIfNeeded();

    expect(summary.migratedCerts).toContain("ctfl");
    expect(summary.totalAttempts).toBe(3);
    expect(summary.totalSeen).toBe(3);
    expect(summary.totalCheckins).toBe(2);
    expect(summary.totalCards).toBe(1);
    expect(summary.totalExams).toBe(1);
    expect(summary.draftRestored).toBe(true);
    expect(summary.onboardingMarked).toBe(true);

    // Valida o schema de destino
    const seen = JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}");
    expect(seen.ctfl["ctfl-q1"]).toBe(1);
    expect(seen.ctfl["ctfl-q3"]).toBe(2);

    const attempts = JSON.parse(localStorage.getItem("synapse.attempts.v1") || "{}");
    expect(attempts.ctfl["ctfl-q1"].ok).toBe(true);
    expect(attempts.ctfl["ctfl-q2"].ok).toBe(false);
    expect(attempts.ctfl["ctfl-q2"].tries).toBe(2);

    const checkins = JSON.parse(localStorage.getItem("synapse.checkins.v1") || "[]");
    expect(checkins).toContain("2026-10-25");
    expect(checkins).toContain("2026-10-26");

    const cards = JSON.parse(localStorage.getItem("synapse.cards.v1") || "{}");
    expect(cards.ctfl["ctfl-q1"].interval).toBe(3);
    expect(cards.ctfl["ctfl-q1"].streak).toBe(2);

    const srs = JSON.parse(localStorage.getItem("synapse.srs.v1") || "{}");
    expect(srs.ctfl.good).toBe(6); // 5 good + 1 easy
    expect(srs.ctfl.again).toBe(1);

    const exams = JSON.parse(localStorage.getItem("synapse.exams.v1") || "{}");
    expect(exams.ctfl.length).toBe(1);
    expect(exams.ctfl[0].passed).toBe(true);
    expect(exams.ctfl[0].pct).toBe(75);

    const draft = JSON.parse(localStorage.getItem("synapse.examdraft.v1") || "null");
    expect(draft).not.toBeNull();
    expect(draft.cert).toBe("ctfl");
    expect(draft.idx).toBe(1);

    // Requisito essencial: as chaves originais NUNCA foram apagadas
    expect(localStorage.getItem("synapse.progress.v1.ctfl")).not.toBeNull();
    expect(localStorage.getItem("synapse.examDraft.v1.ctfl")).not.toBeNull();
  });

  it("é estritamente idempotente — rodar múltiplas vezes preserva dados sem duplicar", () => {
    const fakeViteCtfl = {
      schemaVersion: 2,
      seen: { "ctfl-q1": true },
      attempts: {
        "ctfl-q1": { ok: true, last: "2026-10-25T14:30:00.000Z", tries: 1, domain: 1 },
      },
      history: [{ date: "2026-10-25", count: 1, correct: 1 }],
      examHistory: [
        { id: "ex-1", date: "2026-10-25", total: 40, correct: 28, pct: 70, passed: true },
      ],
    };
    localStorage.setItem("synapse.progress.v1.ctfl", JSON.stringify(fakeViteCtfl));

    // Primeira execução
    migrateViteProgressIfNeeded();

    // Segunda execução
    const secondSummary = migrateViteProgressIfNeeded();
    expect(secondSummary.totalAttempts).toBe(0);
    expect(secondSummary.totalSeen).toBe(0);
    expect(secondSummary.totalExams).toBe(0);

    const exams = JSON.parse(localStorage.getItem("synapse.exams.v1") || "{}");
    expect(exams.ctfl.length).toBe(1); // Não duplicou
    const checkins = JSON.parse(localStorage.getItem("synapse.checkins.v1") || "[]");
    expect(checkins.length).toBe(1); // Não duplicou
  });

  it("migra chave legada ctfl_progress_v1 se synapse.progress.v1.ctfl não existir", () => {
    localStorage.setItem(
      "ctfl_progress_v1",
      JSON.stringify({
        schemaVersion: 1,
        seen: { "ctfl-legacy-1": true },
        attempts: {
          "ctfl-legacy-1": { ok: true, last: "2026-09-01T10:00:00.000Z", tries: 1, domain: 1 },
        },
      })
    );

    migrateViteProgressIfNeeded();

    const seen = JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}");
    expect(seen.ctfl["ctfl-legacy-1"]).toBe(1);
    expect(localStorage.getItem("ctfl_progress_v1")).not.toBeNull();
  });
});
