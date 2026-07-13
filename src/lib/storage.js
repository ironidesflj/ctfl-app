import { isDue } from "./spacedRepetition.js";

const LEGACY_KEY = "ctfl_progress_v1";
const keyFor = (certId) => `synapse.progress.v1.${certId}`;

// Fase 0: timezone dinâmico (antes hardcoded America/Sao_Paulo).
const TZ = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo"; }
  catch { return "America/Sao_Paulo"; }
})();

// Fase 2: constante do quality gate do streak (mínimo de respostas/dia).
const STREAK_MIN_ANSWERS_PER_DAY = 5;

// ponytail: module-level "current cert" instead of threading certId through
// every call site (export/import/clear are called from Stats.jsx, which is
// out of scope to edit here). App.jsx calls setActiveCertForStorage() on
// cert change; defaults to "ctfl" so existing no-arg test calls keep working.
let activeCert = "ctfl";
export function setActiveCertForStorage(certId) {
  activeCert = certId || "ctfl";
}

// Fase 3: callback para erros de storage (catches silenciosos agora notificam).
// App.jsx registra um callback que mostra toast ao usuário.
let _onStorageError = null;
export function setStorageErrorHandler(fn) { _onStorageError = fn; }
function reportStorageError(context, err) {
  console.warn(`[storage] ${context}:`, err?.message || err);
  if (_onStorageError) try { _onStorageError(context, err); } catch { /* prevent callback errors from propagating */ }
}

// Migração única: usuários existentes eram só-CTFL, então a chave legada
// (global, sem namespace) vira o progresso do cert "ctfl" se ele ainda não
// existir namespaced.
function migrateLegacyIfNeeded() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && !localStorage.getItem(keyFor("ctfl"))) {
      localStorage.setItem(keyFor("ctfl"), legacy);
    }
  } catch (e) {
    reportStorageError("migrateLegacy", e);
  }
}

export function todayLocal() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

const EMPTY = {
  schemaVersion: 2,
  total: 0, correct: 0, byDomain: {},
  seen: {}, attempts: {},
  flashcards: {}, saved: [], history: [], srs: {},
  lastStudyDate: null, achievements: [], examHistory: []
};

// Fase 2: migration v1 → v2. Converte seen[id] em attempts[id] mantendo
// seen intacto para backwards-compat (getWrongIds, callers existentes).
function migrateV1toV2(parsed) {
  if (parsed.schemaVersion >= 2 && parsed.attempts) return parsed;
  const seen = parsed.seen || {};
  const attempts = {};
  const fallbackDate = parsed.lastStudyDate || todayLocal();
  for (const [id, status] of Object.entries(seen)) {
    attempts[id] = {
      count: 1,
      correct: status === "correct" ? 1 : 0,
      lastCorrect: status === "correct",
      lastAt: fallbackDate,
      firstAt: fallbackDate,
    };
  }
  return { ...parsed, schemaVersion: 2, attempts };
}

export function loadProgress(certId = activeCert) {
  migrateLegacyIfNeeded();
  try {
    const raw = localStorage.getItem(keyFor(certId));
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    const migrated = migrateV1toV2(parsed);
    return {
      ...EMPTY,
      ...migrated,
      byDomain: migrated.byDomain || {},
      seen: migrated.seen || {},
      attempts: migrated.attempts || {},
      saved: migrated.saved || [],
      history: migrated.history || [],
      srs: migrated.srs || {},
      lastStudyDate: migrated.lastStudyDate || null,
      achievements: migrated.achievements || [],
      examHistory: migrated.examHistory || [],
    };
  } catch (e) {
    reportStorageError("loadProgress", e);
    return { ...EMPTY };
  }
}

export function saveProgress(state, certId = activeCert) {
  try {
    localStorage.setItem(keyFor(certId), JSON.stringify(state));
    return true;
  } catch (e) {
    reportStorageError("saveProgress", e);
    return false; // iframe/sandbox ou armazenamento desabilitado
  }
}

export function recordAnswer(state, domain, correct, questionId, bank) {
  const next = {
    ...state,
    schemaVersion: 2,
    total: state.total + 1,
    correct: state.correct + (correct ? 1 : 0),
    byDomain: { ...state.byDomain },
    seen: { ...(state.seen || {}) },
    attempts: { ...(state.attempts || {}) },
    history: [...(state.history || []), { date: todayLocal(), correct }].slice(-90),
    lastStudyDate: todayLocal()
  };
  const d = next.byDomain[domain] || { t: 0, c: 0 };
  next.byDomain[domain] = { t: d.t + 1, c: d.c + (correct ? 1 : 0) };
  if (questionId) {
    // seen: mantido para backwards-compat (getWrongIds, etc.)
    next.seen[questionId] = correct ? "correct" : "wrong";
    // attempts: NOVO — acumula histórico de tentativas por questão
    const prev = (state.attempts || {})[questionId] || {
      count: 0, correct: 0, lastCorrect: false, lastAt: null, firstAt: null
    };
    next.attempts[questionId] = {
      count: prev.count + 1,
      correct: prev.correct + (correct ? 1 : 0),
      lastCorrect: correct,
      lastAt: todayLocal(),
      firstAt: prev.firstAt || todayLocal(),
    };
  }
  next.achievements = checkAchievements(next, bank);
  return next;
}

export function getWrongIds(state) {
  return Object.entries(state.seen || {})
    .filter(([, v]) => v === "wrong")
    .map(([k]) => k);
}

export function toggleSaved(state, questionId) {
  const saved = state.saved || [];
  const exists = saved.includes(questionId);
  return {
    ...state,
    saved: exists
      ? saved.filter((id) => id !== questionId)
      : [...saved, questionId]
  };
}

export function isSaved(state, questionId) {
  return (state.saved || []).includes(questionId);
}

export function getSavedIds(state) {
  return state.saved || [];
}

export function getSRSCard(state, itemId) {
  return state.srs?.[itemId] || null; // null = nunca entrou no sistema SRS
}

export function updateSRSCard(state, itemId, newCardState) {
  return { ...state, srs: { ...state.srs, [itemId]: newCardState } };
}

export function getDueItems(state, allIds) {
  // retorna os ids (de allIds) que estão due hoje ou nunca foram revisados
  // mas SÓ os que já têm entrada em srs (não força todo o banco a entrar
  // no sistema SRS automaticamente — só itens que o usuário já viu)
  return allIds.filter((id) => {
    const card = state.srs?.[id];
    return card && isDue(card);
  });
}

// Fase 2: streak com quality gate. Um dia só conta se houve ≥5 respostas
// (STREAK_MIN_ANSWERS_PER_DAY). Antes, qualquer resposta (1/dia) preservava
// streak — métrica enganosa que recompensava presença, não prática.
export function getStreak(progress) {
  const history = progress.history || [];
  if (history.length === 0) return 0;

  // Contar respostas por dia
  const byDay = {};
  history.forEach((h) => {
    byDay[h.date] = (byDay[h.date] || 0) + 1;
  });

  // Um dia "conta" se teve ≥ MIN respostas
  const qualifies = (date) => (byDay[date] || 0) >= STREAK_MIN_ANSWERS_PER_DAY;

  const today = todayLocal();
  let streak = 0;
  let cursor = new Date();

  // Start from today; if today doesn't qualify, check yesterday before giving up
  if (!qualifies(today)) {
    cursor.setDate(cursor.getDate() - 1);
    const yesterday = cursor.toLocaleDateString("en-CA", { timeZone: TZ });
    if (!qualifies(yesterday)) return 0;
    streak = 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Walk backwards counting consecutive qualifying days
  while (true) {
    const d = cursor.toLocaleDateString("en-CA", { timeZone: TZ });
    if (!qualifies(d)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Fase 2: Wilson 95% confidence interval para proporção k/n.
// Retorna [low, high] como proporções (0-1).
function wilsonCI(k, n, z = 1.96) {
  if (n === 0) return [0, 1];
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const spread = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, center - spread), Math.min(1, center + spread)];
}

// Fase 2: getReadiness retorna objeto rico com point estimate, Wilson CI,
// seenCount, confidence level e minMet flag. Antes retornava um número único
// com falsa precisão e sem noção de cobertura.
//
// confidence: "low" (N<20) | "medium" (20≤N<40) | "high" (N≥40)
// minMet: true quando N≥40 (caller verifica coverage≥30% e ≥1/capítulo)
export function getReadiness(progress, totalBank) {
  // Preferir attempts (schema v2); cair para seen (v1 legacy) se ausente
  const attempts = progress.attempts || {};
  const seen = progress.seen || {};
  const seenIds = Object.keys(attempts).length > 0 ? Object.keys(attempts) : Object.keys(seen);
  const seenCount = seenIds.length;

  if (seenCount === 0) {
    return { point: 0, ciLow: 0, ciHigh: 0, seenCount: 0, confidence: "low", minMet: false };
  }

  // Last-status correct count: usa attempts.lastCorrect se disponível, senão seen
  const correctCount = seenIds.filter((id) => {
    if (attempts[id]) return attempts[id].lastCorrect;
    return seen[id] === "correct";
  }).length;

  // Bayesian point estimate (mesma fórmula de antes — Laplace smoothing)
  const k = Math.max(10, Number.isFinite(totalBank) ? Math.round(totalBank * 0.1) : 10);
  const point = Math.round(((correctCount + k * 0.5) / (seenCount + k)) * 100);

  // Wilson 95% CI sobre a proporção raw (sem smoothing) — representa a
  // incerteza real da amostra
  const [ciLowRaw, ciHighRaw] = wilsonCI(correctCount, seenCount);
  const ciLow = Math.round(ciLowRaw * 100);
  const ciHigh = Math.round(ciHighRaw * 100);

  // Confidence level
  let confidence;
  if (seenCount < 20) confidence = "low";
  else if (seenCount < 40) confidence = "medium";
  else confidence = "high";

  const minMet = seenCount >= 40;

  return { point, ciLow, ciHigh, seenCount, confidence, minMet };
}

// Spec 2 passo 2: prontidão via blueprint oficial (spec-prontidao-blueprint.md
// §5). Dois gates de cobertura (capítulo + K-level), ambos obrigatórios —
// falhar qualquer um bloqueia "pronto" mesmo com boa taxa de acerto. Sem
// examBlueprint (ou blueprint malformado), degrada pro getReadiness
// estatístico. ciLow/ciHigh/confidence/seenCount preservados do cálculo
// estatístico de base — só "point" e os campos de gate mudam de fonte.
const CHAPTER_COVERAGE_MIN_PCT = 0.4;
const KLEVEL_COVERAGE_FRACTION = 0.5;

export function getReadinessV2(progress, bank) {
  const totalBank = bank.ALL.length;
  const base = getReadiness(progress, totalBank);
  const blueprint = bank.META?.examBlueprint?.[bank.cert.id];
  if (!blueprint || !blueprint.chapters) {
    return { ...base, gatesPassed: undefined, source: "statistical" };
  }

  // seen[id] só é escrito em recordAnswer(), sempre na mesma chamada que
  // escreve attempts[id], e migrateV1toV2 constrói attempts a partir de
  // 100% das chaves de seen na migração — attempts é sempre igual (nunca
  // subconjunto) de seen em chaves. Não existe estado misto que perca
  // cobertura aqui.
  const attempts = progress.attempts || {};
  const seen = progress.seen || {};
  const seenMap = Object.keys(attempts).length > 0 ? attempts : seen;

  const chapterCoverage = bank.coverageByChapter(seenMap);
  const missingChapters = Object.entries(chapterCoverage)
    .filter(([, v]) => v.total > 0 && v.seen / v.total < CHAPTER_COVERAGE_MIN_PCT)
    .map(([ch]) => ch);

  const examKLevelTotals = {};
  Object.values(blueprint.chapters).forEach((c) => {
    Object.entries(c.kLevels || {}).forEach(([k, n]) => {
      examKLevelTotals[k] = (examKLevelTotals[k] || 0) + n;
    });
  });
  const kLevelCoverage = bank.coverageByKLevel(seenMap);
  const missingKLevels = Object.entries(examKLevelTotals)
    .filter(([, n]) => n > 0)
    .filter(([k, n]) => {
      const floor = Math.max(1, Math.round(KLEVEL_COVERAGE_FRACTION * n));
      return (kLevelCoverage[k]?.seen || 0) < floor;
    })
    .map(([k]) => k);

  const gatesPassed = missingChapters.length === 0 && missingKLevels.length === 0;

  // Capítulo não tentado ENTRA no weightTotal com 0% — não é excluído.
  // Excluir inflava o point (ex: 100% acertando 1 capítulo pequeno e
  // ignorando o resto), contraditório com o gate dizendo "não pronto" ao lado.
  const blueprintTotal = blueprint.totalQuestions || 1;
  let weightedSum = 0;
  let weightTotal = 0;
  Object.entries(blueprint.chapters).forEach(([ch, c]) => {
    const w = c.questions / blueprintTotal;
    const chQuestions = bank.ALL.filter((q) => String(q.chapter) === String(ch));
    const chAttempted = chQuestions.filter((q) => seenMap[q.id]);
    const chCorrect = chAttempted.filter((q) => {
      const a = attempts[q.id];
      return a ? a.lastCorrect : seen[q.id] === "correct";
    }).length;
    const chPct = chAttempted.length > 0 ? chCorrect / chAttempted.length : 0;
    weightedSum += w * chPct;
    weightTotal += w;
  });
  const point = weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 100) : base.point;

  return {
    ...base,
    point,
    gatesPassed,
    missingChapters,
    missingKLevels,
    chapterCoverage,
    kLevelCoverage,
    source: "blueprint",
  };
}

export function checkAchievements(progress, bank) {
  const existing = new Set(progress.achievements || []);
  const streak = getStreak(progress);
  if (progress.total >= 1) existing.add("first-step");
  if (streak >= 7) existing.add("streak-7");
  if (streak >= 30) existing.add("streak-30");
  if ((progress.examHistory || []).some((e) => e.passed)) existing.add("passed-exam");
  if (bank) {
    const attempts = progress.attempts || {};
    const seen = progress.seen || {};
    const seenMap = Object.keys(attempts).length > 0 ? attempts : seen;
    const chapterCoverage = bank.coverageByChapter(seenMap);
    const entries = Object.values(chapterCoverage).filter((v) => v.total > 0);
    if (entries.some((v) => v.seen === v.total)) existing.add("chapter-complete");
    if (entries.length > 0 && entries.every((v) => v.seen === v.total)) existing.add("bank-complete");
  }
  return [...existing];
}

// `passed` opcional: caller pode informar o veredito já calculado com o
// passMark correto do cert (Quiz.jsx faz isso). Sem isso, cai no default
// de 65% — só correto pro CTFL, mantido pra não quebrar chamadas antigas
// sem cert (ex: testes existentes).
export function logExamResult(progress, pct, passed = pct >= 65, bank) {
  const entry = { date: todayLocal(), pct, passed };
  const examHistory = [...(progress.examHistory || []), entry].slice(-20);
  const next = { ...progress, examHistory };
  next.achievements = checkAchievements(next, bank);
  return next;
}

export function clearProgress(certId = activeCert) {
  try {
    localStorage.removeItem(keyFor(certId));
  } catch (e) {
    reportStorageError("clearProgress", e);
  }
  return { ...EMPTY };
}

// "Sincronização manual": exporta o progresso do cert ativo para um arquivo.
export function exportProgress(state, certId = activeCert) {
  const payload = { app: "synapse", cert: certId, exportedAt: new Date().toISOString(), progress: state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `synapse-progresso-${certId}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Importa o progresso a partir de um arquivo escolhido pelo usuário. O
// arquivo tem que ser do cert ativo (ou não ter cert, formato legado) —
// se for de outro cert, rejeita em vez de misturar progresso entre certs.
export function importProgress(file, certId = activeCert) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.cert && data.cert !== certId) {
          throw new Error(`Este arquivo é do certificado "${data.cert}", não de "${certId}".`);
        }
        const p = data.progress || data;
        // Fase 3: validação de schema mais estrita
        if (typeof p.total !== "number" || p.total < 0) throw new Error("Campo 'total' inválido");
        if (typeof p.correct !== "number" || p.correct < 0 || p.correct > p.total) throw new Error("Campo 'correct' inválido");
        if (p.seen && typeof p.seen !== "object") throw new Error("Campo 'seen' deve ser objeto");
        if (p.history && !Array.isArray(p.history)) throw new Error("Campo 'history' deve ser array");
        if (p.saved && !Array.isArray(p.saved)) throw new Error("Campo 'saved' deve ser array");
        // Fase 2: migrar se necessário
        const migrated = migrateV1toV2(p);
        resolve({
          ...EMPTY,
          ...migrated,
          byDomain: migrated.byDomain || {},
          seen: migrated.seen || {},
          attempts: migrated.attempts || {},
          saved: migrated.saved || [],
          history: migrated.history || [],
          srs: migrated.srs || {},
          lastStudyDate: migrated.lastStudyDate || null,
          achievements: migrated.achievements || [],
          examHistory: migrated.examHistory || [],
        });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsText(file);
  });
}
