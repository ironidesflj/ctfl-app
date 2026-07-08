import { describe, it, expect } from "vitest";
import {
  recordAnswer, clearProgress, toggleSaved, isSaved,
  getSRSCard, updateSRSCard, getDueItems,
  getStreak, getReadiness, checkAchievements, logExamResult,
} from "./storage.js";

// Helper: gera data no mesmo timezone que todayLocal() usa
const TZ = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo"; }
  catch { return "America/Sao_Paulo"; }
})();
function dayOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}
// Helper: gera N entradas de history para um dia (para satisfazer quality gate ≥5)
function dayEntries(offset, n = 5, correct = true) {
  const d = dayOffset(offset);
  return Array(n).fill(null).map(() => ({ date: d, correct }));
}

describe("storage - progress tracking", () => {
  it("recordAnswer increments total and correct counts", () => {
    let state = clearProgress();
    state = recordAnswer(state, "fund", true, "ch1-01");
    expect(state.total).toBe(1);
    expect(state.correct).toBe(1);
    state = recordAnswer(state, "fund", false, "ch1-02");
    expect(state.total).toBe(2);
    expect(state.correct).toBe(1);
  });

  it("recordAnswer tracks per-domain stats correctly", () => {
    let state = clearProgress();
    state = recordAnswer(state, "tec", true, "ch4-01");
    expect(state.byDomain.tec).toEqual({ t: 1, c: 1 });
  });

  it("toggleSaved adds and removes a question id", () => {
    let state = clearProgress();
    state = toggleSaved(state, "ch1-01");
    expect(isSaved(state, "ch1-01")).toBe(true);
    state = toggleSaved(state, "ch1-01");
    expect(isSaved(state, "ch1-01")).toBe(false);
  });
});

describe("storage - streak (Fase 2: quality gate ≥5/day)", () => {
  it("returns streak of 3 for 3 consecutive days with ≥5 answers each", () => {
    const state = clearProgress();
    state.history = [
      ...dayEntries(2), ...dayEntries(1), ...dayEntries(0),
    ];
    expect(getStreak(state)).toBe(3);
  });

  it("returns 0 when there is a gap of 2+ days", () => {
    const state = clearProgress();
    state.history = [
      ...dayEntries(5), ...dayEntries(4),
    ];
    expect(getStreak(state)).toBe(0);
  });

  it("returns 0 when days have <5 answers (quality gate not met)", () => {
    const state = clearProgress();
    // 3 consecutive days but only 1 answer each
    state.history = [
      { date: dayOffset(2), correct: true },
      { date: dayOffset(1), correct: true },
      { date: dayOffset(0), correct: true },
    ];
    expect(getStreak(state)).toBe(0);
  });

  it("counts a day with exactly 5 answers as qualifying", () => {
    const state = clearProgress();
    state.history = [
      ...dayEntries(1, 5), ...dayEntries(0, 5),
    ];
    expect(getStreak(state)).toBe(2);
  });
});

describe("storage - readiness (Fase 2: object with Wilson CI)", () => {
  it("returns point ~60% for 5/5 correct with total=200 (k=20)", () => {
    const state = clearProgress();
    state.seen = {
      "q1": "correct", "q2": "correct", "q3": "correct", "q4": "correct", "q5": "correct",
    };
    // k = max(10, round(200*0.1)) = 20; (5 + 20*0.5) / (5 + 20) * 100 = 15/25*100 = 60
    const r = getReadiness(state, 200);
    expect(r.point).toBe(60);
    expect(r.seenCount).toBe(5);
    expect(r.confidence).toBe("low"); // <20
  });

  it("returns 0 point when no questions seen", () => {
    const state = clearProgress();
    const r = getReadiness(state, 200);
    expect(r.point).toBe(0);
    expect(r.confidence).toBe("low");
  });

  it("returns Wilson CI with ciLow <= point <= ciHigh for 30/40 correct", () => {
    const state = clearProgress();
    const seen = {};
    for (let i = 0; i < 40; i++) seen[`q${i}`] = i < 30 ? "correct" : "wrong";
    state.seen = seen;
    const r = getReadiness(state, 300);
    expect(r.seenCount).toBe(40);
    expect(r.confidence).toBe("high"); // ≥40
    expect(r.minMet).toBe(true);
    expect(r.ciLow).toBeLessThanOrEqual(r.point);
    expect(r.ciHigh).toBeGreaterThanOrEqual(r.point);
    // Wilson CI for 30/40 (75%): roughly [59%, 87%]
    expect(r.ciLow).toBeGreaterThan(50);
    expect(r.ciHigh).toBeLessThan(95);
  });

  it("confidence is medium for 20≤N<40", () => {
    const state = clearProgress();
    const seen = {};
    for (let i = 0; i < 25; i++) seen[`q${i}`] = "correct";
    state.seen = seen;
    const r = getReadiness(state, 300);
    expect(r.confidence).toBe("medium");
    expect(r.minMet).toBe(false); // <40
  });
});

describe("storage - schema migration (Fase 2: seen → attempts)", () => {
  it("recordAnswer accumulates attempts (count, correct, lastCorrect)", () => {
    let state = clearProgress();
    // Answer same question 3 times: wrong, correct, correct
    state = recordAnswer(state, "fund", false, "q1");
    state = recordAnswer(state, "fund", true, "q1");
    state = recordAnswer(state, "fund", true, "q1");
    const a = state.attempts["q1"];
    expect(a.count).toBe(3);
    expect(a.correct).toBe(2);
    expect(a.lastCorrect).toBe(true);
    // seen should still work (backwards-compat)
    expect(state.seen["q1"]).toBe("correct");
  });

  it("attempts firstAt is preserved across re-answers", () => {
    let state = clearProgress();
    state = recordAnswer(state, "fund", true, "q1");
    const firstAt = state.attempts["q1"].firstAt;
    state = recordAnswer(state, "fund", true, "q1");
    expect(state.attempts["q1"].firstAt).toBe(firstAt);
  });
});

describe("storage - achievements", () => {
  it("unlocks first-step after 1 answer", () => {
    let state = clearProgress();
    state = recordAnswer(state, "fund", true, "q1");
    expect(state.achievements).toContain("first-step");
  });

  it("logExamResult with pct=70 marks passed and unlocks passed-exam", () => {
    let state = clearProgress();
    state = logExamResult(state, 70);
    expect(state.examHistory[0].passed).toBe(true);
    expect(state.achievements).toContain("passed-exam");
  });

  it("logExamResult with pct=60 marks as not passed", () => {
    let state = clearProgress();
    state = logExamResult(state, 60);
    expect(state.examHistory[0].passed).toBe(false);
    expect(state.achievements).not.toContain("passed-exam");
  });
});

describe("storage - SRS integration", () => {
  it("getSRSCard returns null for unseen items", () => {
    const state = clearProgress();
    expect(getSRSCard(state, "ch1-01")).toBeNull();
  });

  it("updateSRSCard stores and retrieves a card", () => {
    let state = clearProgress();
    const card = { easeFactor: 2.5, interval: 1, repetitions: 1, dueDate: "2020-01-01" };
    state = updateSRSCard(state, "ch1-01", card);
    expect(getSRSCard(state, "ch1-01")).toEqual(card);
  });

  it("getDueItems only returns items that exist in srs AND are due", () => {
    let state = clearProgress();
    state = updateSRSCard(state, "ch1-01", { easeFactor: 2.5, interval: 1, repetitions: 1, dueDate: "2020-01-01" });
    state = updateSRSCard(state, "ch1-02", { easeFactor: 2.5, interval: 30, repetitions: 1, dueDate: "2099-01-01" });
    const due = getDueItems(state, ["ch1-01", "ch1-02", "ch1-03"]);
    expect(due).toEqual(["ch1-01"]); // só o due; ch1-02 não due; ch1-03 nunca visto (não força entrada)
  });
});
