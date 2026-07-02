import { describe, it, expect } from "vitest";
import { getBank } from "./bank.js";

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
