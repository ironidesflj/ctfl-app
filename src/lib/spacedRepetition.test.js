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

  // r16 (QA v3.14.0): dueDate em espaço LOCAL — antes vinha de toISOString()
  // (UTC) e, em fusos negativos (BR = UTC-3), um cartão avaliado antes das
  // 21:00 com intervalo 1 voltava à fila ÀS 21:00 DO MESMO DIA.
  it("dueDate é SEMPRE a data local de hoje + interval (independente do fuso)", () => {
    const cases = [
      { start: initSM2(), chain: ["good"], interval: 1 },
      { start: initSM2(), chain: ["good", "good"], interval: 6 },
      {
        start: { ...initSM2(), interval: 10, repetitions: 3 },
        chain: ["good"],
        interval: 25,
      },
    ];
    for (const { start, chain, interval } of cases) {
      let card = start;
      for (const q of chain) card = sm2(card, QUALITY[q]);
      const expected = new Date();
      expected.setDate(expected.getDate() + interval);
      const local = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(expected.getDate()).padStart(2, "0")}`;
      expect(card.interval).toBe(interval);
      expect(card.dueDate).toBe(local);
    }
  });

  it("isDue compara contra a data LOCAL (cartão 'de amanhã' não vence hoje)", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const local = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    expect(isDue({ ...initSM2(), dueDate: local })).toBe(false);
    // e um cartão vencido ontem (local) continua due
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const localY = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(yesterday.getDate()).padStart(2, "0")}`;
    expect(isDue({ ...initSM2(), dueDate: localY })).toBe(true);
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

describe("v3.15.1 (port r15): teto de intervalo do SM-2", () => {
  it("intervalo nunca passa de 365 dias (RangeError impossível)", () => {
    let card = initSM2();
    for (let i = 0; i < 60; i++) card = sm2(card, QUALITY.easy);
    expect(card.interval).toBeLessThanOrEqual(365);
    // e a data devida continua válida (parseável)
    expect(() => new Date(`${card.dueDate}T12:00:00`)).not.toThrow();
    expect(Number.isNaN(new Date(`${card.dueDate}T12:00:00`).getTime())).toBe(false);
  });

  it("sequência normal não é afetada (1 → 6 → 15)", () => {
    let card = sm2(initSM2(), QUALITY.good);
    expect(card.interval).toBe(1);
    card = sm2(card, QUALITY.good);
    expect(card.interval).toBe(6);
    card = sm2(card, QUALITY.good);
    expect(card.interval).toBe(15);
  });
});
