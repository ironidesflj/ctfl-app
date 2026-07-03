import { describe, it, expect } from "vitest";
import { ALL, DOMAINS, META, byDomainInLang, byIds, buildExamInLang, shuffleOptions } from "./bank.js";

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

  it("every question belongs to a known domain", () => {
    const domainIds = DOMAINS.map((d) => d.id);
    ALL.forEach((q) => {
      expect(domainIds).toContain(q.domain);
    });
  });

  it("byDomainInLang filters correctly", () => {
    const tec = byDomainInLang("tec");
    expect(tec.every((q) => q.domain === "tec")).toBe(true);
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

describe("bank - distribuição do simulado (blueprint)", () => {
  it("buildExamInLang segue os pesos oficiais por capítulo, sem filler aleatório", () => {
    const WEIGHTS_TOTAL = Object.values(META.chapterWeights).reduce((s, w) => s + Number(w), 0);
    const exam = buildExamInLang("pt");
    expect(exam.length).toBe(META.examFormat.questions);
    const counts = {};
    exam.forEach((q) => { counts[q.chapter] = (counts[q.chapter] || 0) + 1; });
    DOMAINS.forEach((d) => {
      const want = Math.round((META.chapterWeights[String(d.chapter)] / WEIGHTS_TOTAL) * META.examFormat.questions);
      expect(counts[d.chapter] || 0).toBe(want);
    });
  });
});
