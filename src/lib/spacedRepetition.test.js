import { describe, it, expect } from "vitest";
import { initSM2, sm2, QUALITY, isDue } from "./spacedRepetition.js";

describe("SM-2 algorithm", () => {
  it("initializes with default values", () => {
    const card = initSM2();
    expect(card.easeFactor).toBe(2.5);
    expect(card.interval).toBe(0);
    expect(card.repetitions).toBe(0);
    expect(card.dueDate).toBeNull();
  });

  it("resets repetitions and sets interval=1 on 'again' (quality<3)", () => {
    let card = initSM2();
    card = sm2(card, QUALITY.again);
    expect(card.interval).toBe(1);
    expect(card.repetitions).toBe(0);
  });

  it("progresses interval correctly across repeated 'good' answers", () => {
    let card = initSM2();
    card = sm2(card, QUALITY.good); // repetitions=1
    expect(card.interval).toBe(1);
    card = sm2(card, QUALITY.good); // repetitions=2
    expect(card.interval).toBe(6);
    card = sm2(card, QUALITY.good); // repetitions=3, interval = round(6 * EF)
    expect(card.interval).toBeGreaterThan(6);
  });

  it("never lets easeFactor go below 1.3", () => {
    let card = initSM2();
    for (let i = 0; i < 10; i++) card = sm2(card, QUALITY.again);
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("sets dueDate to a future date matching the interval", () => {
    let card = initSM2();
    card = sm2(card, QUALITY.good);
    const today = new Date();
    const due = new Date(card.dueDate);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(card.interval - 1);
    expect(diffDays).toBeLessThanOrEqual(card.interval + 1);
  });

  it("isDue returns true for items never reviewed (dueDate null)", () => {
    const card = initSM2();
    expect(isDue(card)).toBe(true);
  });

  it("isDue returns false for items due in the future", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const card = { ...initSM2(), dueDate: future.toISOString().slice(0, 10) };
    expect(isDue(card)).toBe(false);
  });

  it("isDue returns true for items due today or in the past", () => {
    const card = { ...initSM2(), dueDate: "2020-01-01" };
    expect(isDue(card)).toBe(true);
  });
});
