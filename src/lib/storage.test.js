import { describe, it, expect } from "vitest";
import {
  recordAnswer, clearProgress, toggleSaved, isSaved,
  getSRSCard, updateSRSCard, getDueItems,
  getStreak, getReadiness, getReadinessV2, checkAchievements, logExamResult,
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

describe("storage - getReadinessV2 (Spec 2 passo 2: blueprint gates)", () => {
  // Mock bank mínimo — replica apenas o que getReadinessV2 usa
  function makeMockBank({ certId = "ctfl", questions = [], blueprint } = {}) {
    const chapterNums = [...new Set(questions.map(q => String(q.chapter)))];
    return {
      cert: { id: certId },
      ALL: questions,
      META: blueprint !== undefined ? { examBlueprint: { [certId]: blueprint } } : {},
      coverageByChapter: (seenMap) => {
        const result = {};
        chapterNums.forEach(ch => {
          const total = questions.filter(q => String(q.chapter) === ch).length;
          const seen = questions.filter(q => String(q.chapter) === ch && seenMap[q.id]).length;
          result[ch] = { seen, total };
        });
        return result;
      },
      coverageByKLevel: (seenMap) => {
        const result = {};
        questions.forEach(q => {
          const k = "K" + q.kLevel;
          if (!result[k]) result[k] = { seen: 0, total: 0 };
          result[k].total += 1;
          if (seenMap[q.id]) result[k].seen += 1;
        });
        return result;
      },
    };
  }

  // Helper: progress com attempts (schema v2)
  function makeProgress(attempted) {
    const attempts = {};
    const seen = {};
    Object.entries(attempted).forEach(([id, correct]) => {
      attempts[id] = { count: 1, correct: correct ? 1 : 0, lastCorrect: correct, lastAt: "2026-01-01", firstAt: "2026-01-01" };
      seen[id] = correct ? "correct" : "wrong";
    });
    return { ...clearProgress(), attempts, seen };
  }

  it("1. sem blueprint → fallback statistical, source:'statistical', gatesPassed undefined", () => {
    const bank = makeMockBank({ questions: [{ id: "q1", chapter: 1, kLevel: 1 }] });
    const progress = makeProgress({ q1: true });
    const r = getReadinessV2(progress, bank);
    const base = getReadiness(progress, 1);
    expect(r.source).toBe("statistical");
    expect(r.gatesPassed).toBeUndefined();
    expect(r.point).toBe(base.point);
    expect(r.seenCount).toBe(base.seenCount);
  });

  it("2. blueprint sem chapters → fallback statistical, sem crash", () => {
    const bank = makeMockBank({
      questions: [{ id: "q1", chapter: 1, kLevel: 1 }],
      blueprint: { totalQuestions: 40, passMarkPct: 65 }, // chapters ausente
    });
    const progress = makeProgress({ q1: true });
    const r = getReadinessV2(progress, bank);
    expect(r.source).toBe("statistical");
    expect(r.gatesPassed).toBeUndefined();
  });

  it("3. capítulo com < 40% cobertura → gatesPassed:false, capítulo em missingChapters", () => {
    const qs = [
      { id: "q1", chapter: 1, kLevel: 1 }, { id: "q2", chapter: 1, kLevel: 1 },
      { id: "q3", chapter: 1, kLevel: 1 }, { id: "q4", chapter: 1, kLevel: 1 },
      { id: "q5", chapter: 1, kLevel: 1 },
      { id: "q6", chapter: 2, kLevel: 2 }, { id: "q7", chapter: 2, kLevel: 2 },
      { id: "q8", chapter: 2, kLevel: 2 }, { id: "q9", chapter: 2, kLevel: 2 },
      { id: "q10", chapter: 2, kLevel: 2 },
    ];
    const blueprint = {
      totalQuestions: 10,
      chapters: {
        "1": { questions: 5, kLevels: { K1: 5 } },
        "2": { questions: 5, kLevels: { K2: 5 } },
      },
    };
    const bank = makeMockBank({ questions: qs, blueprint });
    // q1 visto em ch1 = 1/5 = 20% < 40%; ch2 = 0/5 = 0% < 40%
    const progress = makeProgress({ q1: true });
    const r = getReadinessV2(progress, bank);
    expect(r.gatesPassed).toBe(false);
    expect(r.missingChapters).toContain("1");
    expect(r.missingChapters).toContain("2");
  });

  it("4. K-level abaixo do piso → missingKLevels contém 'K1' (nunca '1')", () => {
    const qs = Array.from({ length: 10 }, (_, i) => ({ id: `q${i}`, chapter: 1, kLevel: 1 }));
    const blueprint = {
      totalQuestions: 10,
      chapters: { "1": { questions: 10, kLevels: { K1: 10 } } },
    };
    const bank = makeMockBank({ questions: qs, blueprint });
    // piso K1 = max(1, round(0.5*10)) = 5; vemos apenas 3 → abaixo do piso
    const progress = makeProgress({ q0: true, q1: true, q2: true });
    const r = getReadinessV2(progress, bank);
    expect(r.gatesPassed).toBe(false);
    expect(r.missingKLevels).toContain("K1");
    expect(r.missingKLevels).not.toContain("1");
  });

  it("5. todos os gates OK → gatesPassed:true, point bate com média ponderada calculada à mão", () => {
    // ch1: 5q K1, ch2: 5q K2; pesos iguais (5/10 cada)
    // ch1: 4/5 corretas (80%), ch2: 3/5 corretas (60%)
    // point = round((0.5*0.8 + 0.5*0.6) / 1.0 * 100) = 70
    const qs = [
      { id: "c1q1", chapter: 1, kLevel: 1 }, { id: "c1q2", chapter: 1, kLevel: 1 },
      { id: "c1q3", chapter: 1, kLevel: 1 }, { id: "c1q4", chapter: 1, kLevel: 1 },
      { id: "c1q5", chapter: 1, kLevel: 1 },
      { id: "c2q1", chapter: 2, kLevel: 2 }, { id: "c2q2", chapter: 2, kLevel: 2 },
      { id: "c2q3", chapter: 2, kLevel: 2 }, { id: "c2q4", chapter: 2, kLevel: 2 },
      { id: "c2q5", chapter: 2, kLevel: 2 },
    ];
    const blueprint = {
      totalQuestions: 10,
      chapters: {
        "1": { questions: 5, kLevels: { K1: 5 } },
        "2": { questions: 5, kLevels: { K2: 5 } },
      },
    };
    const bank = makeMockBank({ questions: qs, blueprint });
    const progress = makeProgress({
      c1q1: true, c1q2: true, c1q3: true, c1q4: true, c1q5: false, // ch1: 4/5
      c2q1: true, c2q2: true, c2q3: true, c2q4: false, c2q5: false, // ch2: 3/5
    });
    const r = getReadinessV2(progress, bank);
    // ch1: 5/5 vistas >= 40% → OK; ch2: 5/5 vistas >= 40% → OK
    // K1 piso = max(1,round(0.5*5))=3; seen=5>=3 → OK; K2 idem → OK
    expect(r.gatesPassed).toBe(true);
    expect(r.point).toBe(70);
    expect(r.source).toBe("blueprint");
  });

  it("6. 100% acerto em cap de peso 5%, 0% no resto → point≈5 (não 100)", () => {
    // blueprint: ch1=2q (peso 5%), ch2=38q (peso 95%); total=40
    // banco: 5q por capítulo; ch1 todas corretas, ch2 não tentado
    // point = round((2/40*1.0 + 38/40*0.0)/1.0 * 100) = 5
    const qs = [
      { id: "s1q1", chapter: 1, kLevel: 1 }, { id: "s1q2", chapter: 1, kLevel: 1 },
      { id: "s1q3", chapter: 1, kLevel: 1 }, { id: "s1q4", chapter: 1, kLevel: 1 },
      { id: "s1q5", chapter: 1, kLevel: 1 },
      { id: "s2q1", chapter: 2, kLevel: 2 }, { id: "s2q2", chapter: 2, kLevel: 2 },
      { id: "s2q3", chapter: 2, kLevel: 2 }, { id: "s2q4", chapter: 2, kLevel: 2 },
      { id: "s2q5", chapter: 2, kLevel: 2 },
    ];
    const blueprint = {
      totalQuestions: 40,
      chapters: {
        "1": { questions: 2, kLevels: { K1: 2 } },
        "2": { questions: 38, kLevels: { K2: 38 } },
      },
    };
    const bank = makeMockBank({ questions: qs, blueprint });
    const progress = makeProgress({ s1q1: true, s1q2: true, s1q3: true, s1q4: true, s1q5: true });
    const r = getReadinessV2(progress, bank);
    expect(r.point).toBe(5);
    expect(r.point).not.toBe(100);
  });

  it("7. coverageByKLevel nunca gera chaves '1'..'4', sempre 'K1'..'K4'", () => {
    const qs = [
      { id: "kq1", chapter: 1, kLevel: 1 },
      { id: "kq2", chapter: 1, kLevel: 2 },
      { id: "kq3", chapter: 1, kLevel: 3 },
    ];
    const bank = makeMockBank({ questions: qs });
    const keys = Object.keys(bank.coverageByKLevel({}));
    expect(keys.every(k => /^K\d$/.test(k))).toBe(true);
    expect(keys).toContain("K1");
    expect(keys).toContain("K2");
    expect(keys).toContain("K3");
    expect(keys).not.toContain("1");
    expect(keys).not.toContain("2");
    expect(keys).not.toContain("3");
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
