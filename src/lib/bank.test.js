import { describe, it, expect } from "vitest";
import { getBank } from "./bank.js";

describe.each(["ctfl", "ctal-ta"])("bank(%s) - distribuição do simulado", (certId) => {
  it("buildExamInLang segue os pesos oficiais por capítulo, sem filler aleatório", () => {
    const { chapters, META, buildExamInLang } = getBank(certId);
    const WEIGHTS_TOTAL = Object.values(META.chapterWeights[certId]).reduce((s, w) => s + Number(w), 0);
    const exam = buildExamInLang("pt");
    expect(exam.length).toBe(META.examFormat[certId].questions);
    const counts = {};
    exam.forEach((q) => { counts[q.chapter] = (counts[q.chapter] || 0) + 1; });
    chapters.forEach((c) => {
      const want = Math.round((META.chapterWeights[certId][String(c.chapter)] / WEIGHTS_TOTAL) * META.examFormat[certId].questions);
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
