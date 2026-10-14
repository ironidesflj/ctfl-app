// r5 — Heatmap de atividade (Stats). Deriva do progress.history (log de
// respostas com data YYYY-MM-DD) uma janela fixa de dias terminando hoje,
// com contagens por dia e um nível 0–4 de volume — pronto para renderizar
// em grid sem lógica extra no componente.

const toLocalISO = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;

/** Nível 0–4 por volume de respostas no dia.
 *  0 sem atividade · 1 leve (1–4) · 2 (5–14) · 3 (15–29) · 4 intenso (30+)
 *  — degraus pensados nas metas do app (mínimo de streak = 5/dia → nível 2). */
export function heatmapLevel(total) {
  if (total <= 0) return 0;
  if (total < 5) return 1;
  if (total < 15) return 2;
  if (total < 30) return 3;
  return 4;
}

/** Janela de `days` dias (default 35 = 5 semanas) terminando em todayStr
 *  (YYYY-MM-DD; use storage.todayLocal() no caller). Retorna array
 *  ordenado do mais antigo pro mais novo, último elemento = hoje:
 *  [{date, total, correct, pct, level}]. Datas em local-time — sem
 *  risco de deslocamento UTC/DST (erro clássico com toISOString). */
export function buildHeatmap(history, todayStr, days = 35) {
  const byDate = new Map();
  (history || []).forEach((h) => {
    if (typeof h?.date !== "string") return;
    const d = byDate.get(h.date) || { total: 0, correct: 0 };
    d.total += 1;
    if (h.correct) d.correct += 1;
    byDate.set(h.date, d);
  });

  // meio-dia local: imune a bordas de DST ao subtrair dias
  const end = new Date(`${todayStr}T12:00:00`);
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(end);
    dt.setDate(end.getDate() - i);
    const iso = toLocalISO(dt);
    const d = byDate.get(iso) || { total: 0, correct: 0 };
    out.push({
      date: iso,
      total: d.total,
      correct: d.correct,
      pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : null,
      level: heatmapLevel(d.total),
    });
  }
  return out;
}

/** Resumo textual do heatmap (para aria-label/sr-only e legendas). */
export function heatmapSummary(cells) {
  const active = cells.filter((c) => c.total > 0);
  const answers = active.reduce((s, c) => s + c.total, 0);
  const best = active.reduce((m, c) => (c.total > m ? c.total : m), 0);
  return { activeDays: active.length, answers, bestDay: best };
}

/** r6 — Capítulos mais fracos por aproveitamento (byDomain), ordenados
 *  do menor % de acerto pro maior. minAnswers (default 3) evita o falso
 *  "capítulo com 1 erro = 0%". Compartilhada entre o card 🎯 do setup do
 *  Quiz (r5, sessão inteligente) e o CTA "Treinar {chapter}" do Stats
 *  (r6) — uma única definição de "ponto fraco" no app. */
export function weakChapters(byDomain, chapters, minAnswers = 3) {
  return (chapters || [])
    .map((c) => {
      const bd = (byDomain || {})[String(c.chapter)];
      return bd && bd.t >= minAnswers
        ? { ch: String(c.chapter), t: bd.t, c: bd.c, pct: Math.round((bd.c / bd.t) * 100) }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.pct - b.pct);
}

/** r6 — Histórico de simulados (progress.examHistory) como CSV.
 *  Função PURA (sem DOM): o caller adiciona o BOM \uFEFF na hora do
 *  download (Excel PT-BR abre acentos + separador ";" corretamente).
 *  Colunas: data;percentual;questões;personalizado;aprovado (flags 1/0).
 *  Entradas na ordem em que estão no progresso (mais antiga primeiro). */
export function examHistoryToCsv(history, lang = "pt") {
  const header =
    lang === "en"
      ? "date;score;questions;custom;passed"
      : "data;percentual;questões;personalizado;aprovado";
  const rows = (history || []).map((e) =>
    [
      typeof e?.date === "string" ? e.date : "",
      typeof e?.pct === "number" ? e.pct : "",
      e?.n ? e.n : "",
      e?.custom ? 1 : 0,
      e?.passed ? 1 : 0,
    ].join(";")
  );
  return [header, ...rows].join("\r\n");
}

/** r8 — Tendência das notas dos simulados (sparkline).
 *  Função PURA: mapeia progress.examHistory (mais antiga → mais recente,
 *  mesmo shape do CSV) para pontos de um SVG polyline. Retorna null com
 *  menos de 2 provas (uma linha de 1 ponto não é tendência).
 *  - values: percentuais clampados 0..100 na ordem do histórico
 *  - points: "x,y x,y ..." prontos pro atributo points do <polyline>,
 *    com padding para o último ponto não encostar na borda
 *  - passY: y da linha de corte (passMark, ex. 65) para desenhar o
 *    tracejado de referência
 *  - min/max/avg: resumo para o aria-label (leitor de tela ganha o
 *    mesmo insight que o gráfico dá visualmente) */
export function examTrend(history, { width = 120, height = 36, passMark = 65, pad = 3 } = {}) {
  const vals = (history || [])
    .map((e) => (typeof e?.pct === "number" ? Math.max(0, Math.min(100, e.pct)) : null))
    .filter((v) => v !== null);
  if (vals.length < 2) return null;
  const n = vals.length;
  const stepX = n > 1 ? (width - pad * 2) / (n - 1) : 0;
  const y = (v) => pad + (1 - v / 100) * (height - pad * 2);
  const points = vals.map((v, i) => `${(pad + i * stepX).toFixed(1)},${y(v).toFixed(1)}`);
  return {
    values: vals,
    points: points.join(" "),
    firstX: pad,
    lastX: pad + (n - 1) * stepX,
    lastY: y(vals[n - 1]),
    passY: y(passMark),
    min: Math.min(...vals),
    max: Math.max(...vals),
    avg: Math.round(vals.reduce((a, b) => a + b, 0) / n),
  };
}

/** r11 — Contagem regressiva até a data da prova.
 *  PURA: recebe (examDateStr, todayStr) como "YYYY-MM-DD" (datas locais —
 *  use storage.todayLocal() no caller) e devolve:
 *  - null quando a data está ausente/malformada (caller não renderiza o card)
 *  - { days: 0, isToday: true, past: false } no dia da prova
 *  - { days: N > 0, isToday: false, past: false } para datas futuras
 *  - { days: -N, isToday: false, past: true } para datas que já passaram
 *  A subtração usa meio-dia local (mesma imunidade a DST do buildHeatmap);
 *  "hoje" conta como 0, amanhã como 1 (contagem de MADRUGADAS restantes). */
export function examCountdown(examDateStr, todayStr) {
  if (typeof examDateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(examDateStr)) return null;
  if (typeof todayStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(todayStr)) return null;
  // V8 aceita datas impossíveis com ROLLOVER ("2026-02-30" vira 03/02):
  // invalida comparando os componentes da data parseada com os do string.
  const parse = (s) => {
    const dt = new Date(`${s}T12:00:00`);
    if (Number.isNaN(dt.getTime())) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) return null;
    return dt;
  };
  const exam = parse(examDateStr);
  const today = parse(todayStr);
  if (!exam || !today) return null;
  const ms = exam.getTime() - today.getTime();
  const days = Math.round(ms / 86400000); // meio-dia a meio-dia: sem borda DST
  return { days, isToday: days === 0, past: days < 0 };
}

/** r11 — Ritmo para cobrir o banco até a prova.
 *  PURA: quantas questões/dia (teto, não truncamento — prometer menos do
 *  que o necessário é pior) faltam responder (cobertura = questões ÚNICAS
 *  vistas) para varrer o banco inteiro até a data. Retorna null quando não
 *  há nada a recomendar: data ausente/hoje/passada, banco já coberto ou
 *  dias ≤ 0. `covered`/`total` inválidos degradam para null (nunca NaN na UI). */
export function coverPace(covered, total, daysLeft) {
  if (!Number.isFinite(daysLeft) || daysLeft <= 0) return null;
  if (!Number.isFinite(covered) || !Number.isFinite(total) || total <= 0) return null;
  const remaining = Math.max(0, Math.ceil(total) - Math.max(0, covered));
  if (remaining <= 0) return null;
  return Math.ceil(remaining / daysLeft);
}

/** r11 — Desempenho por K-level (a dimensão que falta no radar de capítulos).
 *  PURA: junta progress.attempts (histórico por questão) com o banco real —
 *  para cada K-level PRESENTE NO BANCO (ordenado K1 < K2 < ... < Kn):
 *  - inBank: questões do banco nesse K · attempted: distintas já respondidas
 *  - answers/correct: somas de TODAS as tentativas (re-respostas contam)
 *  - pct: aproveitamento; null sem tentativas (UI mostra "—")
 *  Questões sem kLevel no banco viram o bucket "K?" (não some do total).
 *  attempts com id fora do banco são ignorados (nunca quebra a join). */
export function kLevelBreakdown(bank, attempts) {
  const qs = Array.isArray(bank) ? bank : [];
  const att = attempts && typeof attempts === "object" ? attempts : {};
  const buckets = new Map(); // key: kLevel normalizado ("K1".."K4" | "K?")
  // O banco commitado usa kLevel NUMÉRICO (1–4, 100% int — verificado);
  // examBlueprint usa chaves "K1".. A normalização "K"+n é a mesma do
  // coverageByKLevel do bank.js — as duas dimensões nunca divergem.
  const keyFor = (q) => {
    const k = q?.kLevel;
    if (typeof k === "number" && Number.isInteger(k) && k >= 1) return `K${k}`;
    if (typeof k === "string") {
      const m = k.trim().match(/^K?(\d+)$/i);
      if (m) return `K${Number(m[1])}`;
    }
    return "K?";
  };
  for (const q of qs) {
    const k = keyFor(q);
    const b = buckets.get(k) || { inBank: 0, attempted: 0, answers: 0, correct: 0 };
    b.inBank += 1;
    buckets.set(k, b);
  }
  for (const [id, a] of Object.entries(att)) {
    const q = qs.find((x) => x?.id === id);
    if (!q) continue; // id fora do banco (outro cert / órfão de migração)
    const b = buckets.get(keyFor(q));
    if (!b || typeof a?.count !== "number") continue;
    b.attempted += 1;
    b.answers += a.count;
    if (typeof a.correct === "number") b.correct += a.correct;
  }
  const order = (k) => (/^K(\d+)$/.test(k) ? Number(k.slice(1)) : 99);
  return [...buckets.entries()]
    .sort((x, y) => order(x[0]) - order(y[0]) || x[0].localeCompare(y[0]))
    .map(([level, b]) => ({
      level,
      inBank: b.inBank,
      attempted: b.attempted,
      answers: b.answers,
      correct: b.correct,
      pct: b.answers > 0 ? Math.round((b.correct / b.answers) * 100) : null,
    }));
}
