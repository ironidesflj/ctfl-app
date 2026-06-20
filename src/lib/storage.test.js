import { describe, it, expect } from "vitest";
import {
  recordAnswer, clearProgress, toggleSaved, isSaved,
  getSRSCard, updateSRSCard, getDueItems,
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
