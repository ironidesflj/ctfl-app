import { describe, it, expect } from "vitest";
import {
  recordAnswer, clearProgress, toggleSaved, isSaved,
  getSRSCard, updateSRSCard, getDueItems,
  getStreak, getReadiness, checkAchievements, logExamResult,
} from "./storage.js";

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

describe("storage - streak", () => {
  it("returns streak of 3 for 3 consecutive days ending today", () => {
    const today = new Date();
    const d = (offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString().slice(0, 10);
    };
    const state = clearProgress();
    state.history = [
      { date: d(2), correct: true },
      { date: d(1), correct: true },
      { date: d(0), correct: true },
    ];
    expect(getStreak(state)).toBe(3);
  });

  it("returns 0 when there is a gap of 2+ days", () => {
    const today = new Date();
    const d = (offset) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - offset);
      return dt.toISOString().slice(0, 10);
    };
    const state = clearProgress();
    state.history = [
      { date: d(5), correct: true },
      { date: d(4), correct: true },
    ];
    expect(getStreak(state)).toBe(0);
  });
});

describe("storage - readiness", () => {
  it("returns ~60% for 5/5 correct with total=200 (k=20)", () => {
    const state = clearProgress();
    state.seen = {
      "q1": "correct", "q2": "correct", "q3": "correct", "q4": "correct", "q5": "correct",
    };
    // k = max(10, round(200*0.1)) = 20; (5 + 20*0.5) / (5 + 20) * 100 = 15/25*100 = 60
    expect(getReadiness(state, 200)).toBe(60);
  });

  it("returns 0 when no questions seen", () => {
    const state = clearProgress();
    expect(getReadiness(state, 200)).toBe(0);
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
