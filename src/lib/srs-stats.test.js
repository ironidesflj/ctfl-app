// r15 (roadmap R18) — contadores e conquistas do sistema de revisão
// espaçada: rateSRS (caminho único de avaliação), undoSRSRating (mis-tap),
// normalização de estados antigos e os critérios srs-100 / srs-master.
import { describe, it, expect, beforeEach } from "vitest";
import {
  rateSRS,
  undoSRSRating,
  normalizeSRSStats,
  getSRSCard,
  checkAchievements,
  achievementProgress,
  loadProgress,
  todayLocal,
} from "./storage.js";
import { initSM2, sm2, QUALITY } from "./spacedRepetition.js";

beforeEach(() => {
  localStorage.clear();
});

const BASE = () => ({
  schemaVersion: 2,
  total: 0,
  correct: 0,
  byDomain: {},
  seen: {},
  attempts: {},
  flashcards: {},
  saved: [],
  history: [],
  srs: {},
  lastStudyDate: null,
  achievements: [],
  examHistory: [],
});

it("meta de aprovação CTAL-TM usa pontos e nunca ultrapassa 100%", () => {
  const result = achievementProgress(BASE(), null, {
    questions: 50,
    totalPoints: 88,
    passMark: 58,
    scoring: "points",
  });
  expect(result["passed-exam"].target).toBe(66);
});

describe("integração v3.15.1: undo preserva a atividade anterior", () => {
  it("restaura exatamente 400 registros e a data anterior após avaliar e desfazer", () => {
    const original = {
      ...BASE(),
      history: Array.from({ length: 400 }, (_, i) => ({
        date: "2026-01-01",
        correct: true,
        id: `old-${i}`,
      })),
      lastStudyDate: "2026-01-01",
      srsStats: normalizeSRSStats(),
    };
    const rated = rateSRS(original, "fc", "good");
    expect(rated.history).toHaveLength(400);
    const undone = undoSRSRating(rated, "fc", "good", null);
    expect(undone.history).toEqual(original.history);
    expect(undone.lastStudyDate).toBe(original.lastStudyDate);
    expect(undone.srsStats).toEqual(original.srsStats);
    expect(original.history).toHaveLength(400);
  });

  it("não deixa atividade ou data fantasma quando a primeira revisão é desfeita", () => {
    const original = BASE();
    const undone = undoSRSRating(rateSRS(original, "fc", "good"), "fc", "good", null);
    expect(undone.history).toEqual([]);
    expect(undone.lastStudyDate).toBeNull();
    expect(undone.srsStats).toEqual(normalizeSRSStats());
  });
});

describe("r15: rateSRS — caminho único de avaliação", () => {
  it("cria a entrada SM-2 e incrementa os contadores da label", () => {
    const next = rateSRS(BASE(), "fc-01", "good");
    const card = getSRSCard(next, "fc-01");
    expect(card).not.toBeNull();
    expect(card.interval).toBe(1); // primeira avaliação positiva
    expect(card.dueDate).not.toBeNull();
    expect(next.srsStats.good).toBe(1);
    expect(next.srsStats.reviews).toBe(1);
    expect(next.srsStats.lastReview).not.toBeNull();
    expect(next.srsStats.todayCount).toBe(1);
  });

  it("acumula labels diferentes e registra o dia de hoje", () => {
    let s = rateSRS(BASE(), "a", "again");
    s = rateSRS(s, "b", "hard");
    s = rateSRS(s, "a", "good");
    expect(s.srsStats.again).toBe(1);
    expect(s.srsStats.hard).toBe(1);
    expect(s.srsStats.good).toBe(1);
    expect(s.srsStats.reviews).toBe(3);
    expect(s.srsStats.todayCount).toBe(3);
  });

  it("equivale ao trio antigo getSRSCard+sm2+updateSRSCard (mesmo estado do cartão)", () => {
    let s = rateSRS(BASE(), "x", "easy");
    s = rateSRS(s, "x", "good");
    const manual1 = sm2(initSM2(), QUALITY.easy);
    const manual2 = sm2(manual1, QUALITY.good);
    expect(getSRSCard(s, "x")).toEqual(manual2);
  });

  it("não perde conquistas existentes e pode destravar srs-100", () => {
    let s = { ...BASE(), achievements: ["first-step"], total: 5 };
    s = rateSRS(s, "q", "good");
    expect(s.achievements).toContain("first-step");
    // 100 avaliações desbloqueiam srs-100 (rateSRS chama checkAchievements)
    let big = {
      ...BASE(),
      srsStats: { ...normalizeSRSStats(), reviews: 99, good: 99 },
    };
    big = rateSRS(big, "q", "good");
    expect(big.srsStats.reviews).toBe(100);
    expect(big.achievements).toContain("srs-100");
  });
});

describe("r15: undoSRSRating — desfaz mis-tap", () => {
  it("restaura o estado ANTERIOR do cartão (não-novo) e desconta a label", () => {
    const prev = sm2(initSM2(), QUALITY.good); // já tinha estado
    let s = { ...BASE(), srs: { fc: prev } };
    s = rateSRS(s, "fc", "easy");
    expect(s.srsStats.easy).toBe(1);
    const undone = undoSRSRating(s, "fc", "easy", prev);
    expect(getSRSCard(undone, "fc")).toEqual(prev);
    expect(undone.srsStats.easy).toBe(0);
    expect(undone.srsStats.reviews).toBe(0);
  });

  it("prevCard null remove a entrada (cartão volta a ser novo)", () => {
    let s = rateSRS(BASE(), "novo", "hard");
    expect(getSRSCard(s, "novo")).not.toBeNull();
    const undone = undoSRSRating(s, "novo", "hard", null);
    expect(getSRSCard(undone, "novo")).toBeNull();
    expect(undone.srsStats.hard).toBe(0);
  });

  it("nunca desce abaixo de zero (estado já degradado)", () => {
    const s = {
      ...BASE(),
      srsStats: { ...normalizeSRSStats(), good: 0, reviews: 0 },
    };
    const undone = undoSRSRating(s, "fc", "good", null);
    expect(undone.srsStats.good).toBe(0);
    expect(undone.srsStats.reviews).toBe(0);
  });

  it("desconta todayCount apenas quando o dia bate", () => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    let s = rateSRS(BASE(), "fc", "good"); // hoje
    expect(s.srsStats.todayDate).toBe(today);
    const undone = undoSRSRating(s, "fc", "good", null);
    expect(undone.srsStats.todayCount).toBe(0);
    // dia antigo: todayCount não é mexido (não é o dia corrente)
    const stale = {
      ...BASE(),
      srsStats: {
        ...normalizeSRSStats(),
        todayDate: "2000-01-01",
        todayCount: 5,
        reviews: 5,
        good: 5,
      },
    };
    const undoneStale = undoSRSRating(stale, "fc", "good", null);
    expect(undoneStale.srsStats.todayCount).toBe(5);
  });
});

describe("r16 (QA v3.14.0): undo revoga conquistas de SRS derivadas do estado vivo", () => {
  it("99 → 100 (destrava) → undo (revoga): srs-100 sai junto com o contador", () => {
    let big = {
      ...BASE(),
      srsStats: { ...normalizeSRSStats(), reviews: 99, good: 99 },
    };
    big = rateSRS(big, "q", "good"); // 100ª revisão
    expect(big.achievements).toContain("srs-100");
    const undone = undoSRSRating(big, "q", "good", null); // volta a 99
    expect(undone.srsStats.reviews).toBe(99);
    expect(undone.achievements).not.toContain("srs-100");
    // roadmap volta a mostrar progresso honesto (99/100)
    expect(achievementProgress(undone, null)["srs-100"].current).toBe(99);
  });

  it("undo acima do corte não revoga (150 → 149 segue destravada)", () => {
    let s = {
      ...BASE(),
      srsStats: { ...normalizeSRSStats(), reviews: 150, good: 150 },
      achievements: ["srs-100"],
    };
    s = rateSRS(s, "q", "good"); // 151
    const undone = undoSRSRating(s, "q", "good", null); // 150
    expect(undone.srsStats.reviews).toBe(150);
    expect(undone.achievements).toContain("srs-100");
  });

  it("srs-master: avaliação que completa 10 maduros destrava; undo revoga", () => {
    // 9 maduros + 1 quase (interval 10): um "Bom" → interval 25 → 10º maduro
    const prev = {
      easeFactor: 2.5,
      interval: 10,
      repetitions: 3,
      dueDate: "2030-01-01",
    };
    const srs = { fc10: prev };
    for (let i = 0; i < 9; i++)
      srs[`m${i}`] = {
        easeFactor: 2.5,
        interval: 30,
        repetitions: 5,
        dueDate: "2030-01-01",
      };
    let s = { ...BASE(), srs };
    s = rateSRS(s, "fc10", "good"); // interval 25 → 10 maduros
    expect(s.achievements).toContain("srs-master");
    const undone = undoSRSRating(s, "fc10", "good", prev);
    expect(undone.achievements).not.toContain("srs-master"); // 9 maduros
    expect(achievementProgress(undone, null)["srs-master"].current).toBe(9);
  });

  it("conquistas históricas (first-step) sobrevivem ao undo", () => {
    let s = { ...BASE(), total: 5, achievements: ["first-step"] };
    s = rateSRS(s, "q", "good");
    const undone = undoSRSRating(s, "q", "good", null);
    expect(undone.achievements).toContain("first-step");
  });
});

describe("r15: conquistas srs-100 / srs-master", () => {
  it("srs-100 desbloqueia com 100 revisões (contagem total)", () => {
    const s = {
      ...BASE(),
      srsStats: { ...normalizeSRSStats(), reviews: 100, good: 60, easy: 40 },
    };
    expect(checkAchievements(s, null)).toContain("srs-100");
  });

  it("srs-master desbloqueia com 10 itens de intervalo ≥ 21d (questão OU flashcard)", () => {
    const srs = {};
    for (let i = 0; i < 10; i++)
      srs[`i${i}`] = { interval: 21, repetitions: 5, dueDate: "2030-01-01" };
    for (let i = 0; i < 4; i++)
      srs[`j${i}`] = { interval: 6, repetitions: 2, dueDate: "2030-01-01" };
    const s = { ...BASE(), srs };
    expect(checkAchievements(s, null)).toContain("srs-master");
  });

  it("9 maduros não desbloqueiam; achievementProgress espelha 1:1", () => {
    const srs = {};
    for (let i = 0; i < 9; i++) srs[`i${i}`] = { interval: 30, dueDate: "2030-01-01" };
    const s = {
      ...BASE(),
      srs,
      srsStats: { ...normalizeSRSStats(), reviews: 42 },
    };
    expect(checkAchievements(s, null)).not.toContain("srs-master");
    const p = achievementProgress(s, null);
    expect(p["srs-100"]).toEqual({ current: 42, target: 100 });
    expect(p["srs-master"]).toEqual({ current: 9, target: 10 });
    // unlocked ⇒ current >= target (invariante do roadmap r9)
    const done = {
      ...BASE(),
      srsStats: { ...normalizeSRSStats(), reviews: 130 },
    };
    expect(achievementProgress(done, null)["srs-100"].current).toBe(100);
    expect(checkAchievements(done, null)).toContain("srs-100");
  });
});

describe("r15: estados antigos sem srsStats degradam com segurança", () => {
  it("loadProgress normaliza o campo ausente no estado persistido", () => {
    const legacy = { ...BASE() };
    delete legacy.srsStats; // estado pré-r15
    localStorage.setItem("synapse.progress.v1.ctfl", JSON.stringify(legacy));
    const loaded = loadProgress("ctfl");
    expect(loaded.srsStats.reviews).toBe(0);
    expect(loaded.srsStats.todayCount).toBe(0);
    expect(normalizeSRSStats(null).reviews).toBe(0);
  });
});

describe("v3.15.1 (port r15): rateSRS grava atividade no history", () => {
  it("cada avaliação empurra entrada kind:'srs' com correct mapeado e id", () => {
    let s = rateSRS(BASE(), "fc-fund-01", "good");
    expect(s.history).toHaveLength(1);
    expect(s.history[0]).toEqual({
      date: todayLocal(),
      correct: true,
      kind: "srs",
      id: "fc-fund-01",
    });
    expect(s.lastStudyDate).toBe(todayLocal());
    s = rateSRS(s, "fc-fund-01", "again"); // Errei não conta como acerto
    expect(s.history).toHaveLength(2);
    expect(s.history[1].correct).toBe(false);
    expect(s.history[1].id).toBe("fc-fund-01");
  });

  it("undoSRSRating remove a entrada CERTA (outro item no meio não é tocado)", () => {
    let s = rateSRS(BASE(), "fc-fund-01", "good");
    s = rateSRS(s, "fc-fund-02", "easy");
    s = rateSRS(s, "fc-fund-01", "hard");
    expect(s.history).toHaveLength(3);
    const prevCard = null; // fc-fund-01 era novo na 1ª avaliação
    const undone = undoSRSRating(s, "fc-fund-01", "hard", prevCard);
    // remove a ÚLTIMA entrada do item — a do fc-fund-02 permanece
    expect(undone.history).toHaveLength(2);
    expect(undone.history.every((h) => h.id !== "fc-fund-01" || h.correct === true)).toBe(true);
    expect(undone.history.some((h) => h.id === "fc-fund-02")).toBe(true);
    expect(undone.srsStats.reviews).toBe(2); // 3 - 1
  });

  it("cap do history em 400 entradas (revisões incluídas)", () => {
    let s = BASE();
    const seed = {
      ...s,
      history: Array.from({ length: 395 }, () => ({
        date: "2026-01-01",
        correct: true,
        kind: "quiz",
      })),
    };
    s = seed;
    s = rateSRS(s, "fc-fund-01", "good");
    s = rateSRS(s, "fc-fund-01", "good");
    s = rateSRS(s, "fc-fund-01", "good");
    s = rateSRS(s, "fc-fund-01", "good");
    s = rateSRS(s, "fc-fund-01", "good");
    s = rateSRS(s, "fc-fund-01", "good");
    expect(s.history.length).toBeLessThanOrEqual(400);
    expect(s.history.filter((h) => h.kind === "srs").length).toBe(6);
  });
});
