import { describe, it, expect } from "vitest";
import { ALL, DOMAINS, byDomain, byIds, buildExam, shuffleOptions } from "./bank.js";

describe("bank - data integrity", () => {
  it("has exactly 200 questions", () => {
    expect(ALL.length).toBe(200);
  });

  it("every question has a valid answer index within its options", () => {
    ALL.forEach((q) => {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    });
  });

  it("every question belongs to a known domain", () => {
    const domainIds = DOMAINS.map((d) => d.id);
    ALL.forEach((q) => {
      expect(domainIds).toContain(q.domain);
    });
  });

  it("byDomain filters correctly", () => {
    const tec = byDomain("tec");
    expect(tec.every((q) => q.domain === "tec")).toBe(true);
    expect(tec.length).toBeGreaterThan(0);
  });

  it("byIds returns only matching questions", () => {
    const sample = ALL.slice(0, 3).map((q) => q.id);
    const result = byIds(sample);
    expect(result.length).toBe(3);
  });

  it("buildExam returns exactly 40 questions", () => {
    const exam = buildExam();
    expect(exam.length).toBe(40);
  });

  it("buildExam returns no duplicate questions", () => {
    const exam = buildExam();
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
