// r5 — Heatmap de atividade (lib/activity.js).
import { describe, it, expect } from "vitest";
import {
  buildHeatmap,
  heatmapLevel,
  heatmapSummary,
  weakChapters,
  examHistoryToCsv,
  examTrend,
  examCountdown,
  coverPace,
  kLevelBreakdown,
} from "./activity.js";

const iso = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

describe("r5: heatmapLevel — degraus de volume", () => {
  it("0 sem atividade, 1 leve, 2 até 14, 3 até 29, 4 a partir de 30", () => {
    expect(heatmapLevel(0)).toBe(0);
    expect(heatmapLevel(1)).toBe(1);
    expect(heatmapLevel(4)).toBe(1);
    expect(heatmapLevel(5)).toBe(2);
    expect(heatmapLevel(14)).toBe(2);
    expect(heatmapLevel(15)).toBe(3);
    expect(heatmapLevel(29)).toBe(3);
    expect(heatmapLevel(30)).toBe(4);
    expect(heatmapLevel(120)).toBe(4);
  });
});

describe("r5: buildHeatmap", () => {
  it("devolve exatamente N células terminando hoje (última = hoje)", () => {
    const cells = buildHeatmap([], iso(0), 35);
    expect(cells).toHaveLength(35);
    expect(cells[34].date).toBe(iso(0));
    expect(cells[34].total).toBe(0);
    expect(cells[34].level).toBe(0);
  });

  it("agrupa contagens por data e calcula pct de acerto", () => {
    const today = iso(0);
    const yesterday = iso(-1);
    const history = [
      { date: today, correct: true },
      { date: today, correct: false },
      { date: today, correct: true },
      { date: yesterday, correct: false },
    ];
    const cells = buildHeatmap(history, today, 3);
    const t = cells[2];
    const y = cells[1];
    expect(t.total).toBe(3);
    expect(t.correct).toBe(2);
    expect(t.pct).toBe(67);
    expect(t.level).toBe(1);
    expect(y.total).toBe(1);
    expect(y.pct).toBe(0);
  });

  it("datas fora da janela são ignoradas (histórico antigo não vaza)", () => {
    const today = iso(0);
    const old = iso(-99);
    const cells = buildHeatmap(
      [
        { date: old, correct: true },
        { date: today, correct: true },
      ],
      today,
      35
    );
    expect(cells.every((c) => c.date !== old)).toBe(true);
    expect(cells[34].total).toBe(1);
  });

  it("rola a meia-noite local sem deslocamento de dia (UTC-safe)", () => {
    // janela de 1 dia: sempre deve ser exatamente hoje em local-time
    const cells = buildHeatmap([], iso(0), 1);
    expect(cells[0].date).toBe(iso(0));
  });

  it("history nulo/undefined não derruba (defensivo)", () => {
    expect(() => buildHeatmap(null, iso(0), 7)).not.toThrow();
    expect(buildHeatmap(undefined, iso(0), 7)).toHaveLength(7);
  });
});

describe("r5: heatmapSummary", () => {
  it("resume dias ativos, total de respostas e melhor dia", () => {
    const today = iso(0);
    const cells = buildHeatmap(
      [
        { date: today, correct: true },
        { date: today, correct: false },
        { date: iso(-1), correct: true },
      ],
      today,
      7
    );
    const s = heatmapSummary(cells);
    expect(s.activeDays).toBe(2);
    expect(s.answers).toBe(3);
    expect(s.bestDay).toBe(2);
  });
});

// r6 — weakChapters (definição compartilhada de "ponto fraco" entre o
// card 🎯 do Quiz e o CTA "Treinar {chapter}" do Stats).
describe("r6: weakChapters", () => {
  const chapters = [{ chapter: 1 }, { chapter: 2 }, { chapter: 3 }, { chapter: 4 }];

  it("ordena do menor aproveitamento pro maior com chaves string", () => {
    const byDomain = {
      1: { t: 10, c: 9 },
      2: { t: 10, c: 2 },
      3: { t: 4, c: 1 },
      4: { t: 8, c: 4 },
    };
    const list = weakChapters(byDomain, chapters);
    expect(list.map((w) => w.ch)).toEqual(["2", "3", "4", "1"]);
    expect(list[0]).toMatchObject({ ch: "2", t: 10, c: 2, pct: 20 });
  });

  it("exige mínimo de 3 respostas (default) — ignora capítulos com menos", () => {
    const byDomain = { 1: { t: 2, c: 0 }, 2: { t: 10, c: 1 } };
    const list = weakChapters(byDomain, chapters);
    expect(list.map((w) => w.ch)).toEqual(["2"]);
  });

  it("minAnswers configurável", () => {
    const byDomain = { 1: { t: 2, c: 0 } };
    expect(weakChapters(byDomain, chapters, 2).map((w) => w.ch)).toEqual(["1"]);
  });

  it("byDomain nulo/vazio ou sem elegíveis devolve lista vazia (sem crash)", () => {
    expect(weakChapters(null, chapters)).toEqual([]);
    expect(weakChapters({}, chapters)).toEqual([]);
    expect(weakChapters(undefined, undefined)).toEqual([]);
  });
});

// r6 — examHistoryToCsv (export do histórico de simulados).
describe("r6: examHistoryToCsv", () => {
  it("header PT com separador ; e acento intacto (questões)", () => {
    expect(examHistoryToCsv([]).startsWith("data;percentual;questões;personalizado;aprovado")).toBe(
      true
    );
  });

  it("header EN quando lang=en", () => {
    expect(examHistoryToCsv([], "en").startsWith("date;score;questions;custom;passed")).toBe(true);
  });

  it("uma linha por entrada, na ordem dada, flags 1/0", () => {
    const csv = examHistoryToCsv(
      [
        { date: "2026-10-13", pct: 45, n: 40, custom: false, passed: false },
        { date: "2026-10-14", pct: 80, n: 10, custom: true, passed: true },
      ],
      "pt"
    );
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("2026-10-13;45;40;0;0");
    expect(lines[2]).toBe("2026-10-14;80;10;1;1");
  });

  it("entrada incompleta não derruba — campos vazios onde faltar", () => {
    const csv = examHistoryToCsv([{ date: "2026-10-14" }], "pt");
    expect(csv.split("\r\n")[1]).toBe("2026-10-14;;;0;0");
  });

  it("history nulo devolve só o header (função defensiva)", () => {
    expect(examHistoryToCsv(null)).toBe("data;percentual;questões;personalizado;aprovado");
  });
});

describe("r8: examTrend — sparkline de tendência dos simulados", () => {
  it("menos de 2 provas não é tendência (null)", () => {
    expect(examTrend([])).toBeNull();
    expect(examTrend([{ pct: 80 }])).toBeNull();
    expect(examTrend(null)).toBeNull();
  });

  it("gera N pontos com min/max/avg coerentes", () => {
    const t = examTrend([{ pct: 40 }, { pct: 60 }, { pct: 80 }]);
    expect(t.values).toEqual([40, 60, 80]);
    expect(t.points.split(" ")).toHaveLength(3);
    expect(t.min).toBe(40);
    expect(t.max).toBe(80);
    expect(t.avg).toBe(60);
    // crescente: y diminui (0% fica embaixo, 100% em cima)
    const ys = t.points.split(" ").map((p) => Number(p.split(",")[1]));
    expect(ys[0]).toBeGreaterThan(ys[1]);
    expect(ys[1]).toBeGreaterThan(ys[2]);
  });

  it("clampa percentuais fora de 0..100 e ignora entradas sem pct", () => {
    const t = examTrend([{ pct: 150 }, { pct: -10 }, { n: 5 }, { pct: 50 }]);
    expect(t.values).toEqual([100, 0, 50]);
  });

  it("passMark 65 mapeia para a linha de corte (65% da altura útil)", () => {
    const t = examTrend([{ pct: 0 }, { pct: 100 }], { height: 36, pad: 3, passMark: 65 });
    // y(65) = 3 + (1-.65)*30 = 13.5
    expect(Number(t.passY.toFixed(1))).toBe(13.5);
  });

  it("última prova acima do corte ganha ponto final destacável (pass)", () => {
    const t = examTrend([{ pct: 40 }, { pct: 90 }]);
    expect(t.lastY).toBeLessThan(t.passY); // acima da linha (y menor)
  });
});

// r11 — Data da prova: contagem regressiva + ritmo de cobertura.
describe("r11: examCountdown", () => {
  it("null sem data / formato inválido / data inexistente", () => {
    expect(examCountdown(null, "2026-10-20")).toBeNull();
    expect(examCountdown("", "2026-10-20")).toBeNull();
    expect(examCountdown("20/10/2026", "2026-10-20")).toBeNull();
    expect(examCountdown("2026-10-20", null)).toBeNull();
    expect(examCountdown("2026-02-30", "2026-10-20")).toBeNull(); // 30/feb não existe
  });

  it("hoje → {0, isToday}; amanhã → 1; ontem → past", () => {
    expect(examCountdown("2026-10-20", "2026-10-20")).toEqual({
      days: 0,
      isToday: true,
      past: false,
    });
    expect(examCountdown("2026-10-21", "2026-10-20")).toEqual({
      days: 1,
      isToday: false,
      past: false,
    });
    expect(examCountdown("2026-10-19", "2026-10-20")).toEqual({
      days: -1,
      isToday: false,
      past: true,
    });
  });

  it("atravessa mês/ano/fevereiro sem deslocamento (meio-dia local)", () => {
    expect(examCountdown("2026-11-01", "2026-10-31").days).toBe(1);
    expect(examCountdown("2027-01-01", "2026-12-31").days).toBe(1);
    expect(examCountdown("2026-03-01", "2026-02-28").days).toBe(1); // 2026 não é bissexto
  });

  it("distâncias maiores contam madrugadas exatas", () => {
    expect(examCountdown("2026-11-19", "2026-10-20").days).toBe(30);
  });
});

describe("r11: coverPace — ritmo para cobrir o banco até a prova", () => {
  it("null quando não há recomendação", () => {
    expect(coverPace(10, 300, 0)).toBeNull(); // hoje
    expect(coverPace(10, 300, -3)).toBeNull(); // passou
    expect(coverPace(300, 300, 10)).toBeNull(); // banco coberto
    expect(coverPace(301, 300, 10)).toBeNull(); // covered além do total
    expect(coverPace("x", 300, 10)).toBeNull(); // inválido
    expect(coverPace(10, 0, 10)).toBeNull(); // sem banco
    expect(coverPace(10, 300, NaN)).toBeNull();
  });

  it("teto, nunca truncamento: 291/10 = 29,1 → 30/dia", () => {
    expect(coverPace(9, 300, 10)).toBe(30);
  });

  it("divisão exata não ganha +1: 200/10 = 20", () => {
    expect(coverPace(100, 300, 10)).toBe(20);
  });

  it("covered 0: o banco inteiro no prazo", () => {
    expect(coverPace(0, 300, 30)).toBe(10);
  });
});

describe("r11: kLevelBreakdown — desempenho por K", () => {
  const bank = [
    { id: "q1", kLevel: 1 },
    { id: "q2", kLevel: 1 },
    { id: "q3", kLevel: 2 },
    { id: "q4", kLevel: 2 },
    { id: "q5", kLevel: 2 },
    { id: "q6", kLevel: 3 },
    { id: "q7" },
    { id: "q8", kLevel: "K2" },
  ];

  it('agrupa por K normalizado (int, string "K2", ausente → K?) e ordena', () => {
    const rows = kLevelBreakdown(bank, {});
    expect(rows.map((r) => r.level)).toEqual(["K1", "K2", "K3", "K?"]);
    expect(rows.find((r) => r.level === "K2").inBank).toBe(4); // 3 int + 1 string
    expect(rows.find((r) => r.level === "K?").inBank).toBe(1);
  });

  it("join com attempts: somas de tentativas e pct; sem tentativas pct=null", () => {
    const rows = kLevelBreakdown(bank, {
      q1: { count: 2, correct: 2 }, // 100%
      q2: { count: 1, correct: 0 }, // K1: 3 answers, 2 correct → 67%
      q3: { count: 1, correct: 1 }, // K2
      q4: { count: 1, correct: 0 },
    });
    const k1 = rows.find((r) => r.level === "K1");
    expect(k1.attempted).toBe(2);
    expect(k1.answers).toBe(3);
    expect(k1.correct).toBe(2);
    expect(k1.pct).toBe(67);
    expect(rows.find((r) => r.level === "K3").pct).toBeNull();
  });

  it("ids fora do banco e attempts malformados não quebram a join", () => {
    const rows = kLevelBreakdown(bank, {
      ghost: { count: 5, correct: 5 }, // fora do banco: ignorado
      q6: { correct: 1 }, // sem count: ignorado
      q1: null, // null: ignorado
    });
    expect(rows.find((r) => r.level === "K3").answers).toBe(0);
    expect(rows.every((r) => Number.isFinite(r.inBank))).toBe(true);
  });

  it("entradas ausentes degradam para buckets vazios (pct=null)", () => {
    expect(kLevelBreakdown(bank, null)).toHaveLength(4);
    expect(kLevelBreakdown(null, {})).toEqual([]);
    expect(kLevelBreakdown(bank, null).every((r) => r.pct === null)).toBe(true);
  });
});
