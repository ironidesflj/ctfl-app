import { isDue } from "./spacedRepetition.js";

const KEY = "ctfl_progress_v1";

export function todayLocal() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

const EMPTY = { total: 0, correct: 0, byDomain: {}, seen: {}, flashcards: {}, saved: [], history: [], srs: {}, lastStudyDate: null, achievements: [], examHistory: [] };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed, byDomain: parsed.byDomain || {}, seen: parsed.seen || {}, saved: parsed.saved || [], history: parsed.history || [], srs: parsed.srs || {}, lastStudyDate: parsed.lastStudyDate || null, achievements: parsed.achievements || [], examHistory: parsed.examHistory || [] };
  } catch {
    return { ...EMPTY };
  }
}

export function saveProgress(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // iframe/sandbox ou armazenamento desabilitado
  }
}

export function recordAnswer(state, domain, correct, questionId) {
  const next = {
    ...state,
    total: state.total + 1,
    correct: state.correct + (correct ? 1 : 0),
    byDomain: { ...state.byDomain },
    seen: { ...(state.seen || {}) },
    history: [...(state.history || []), { date: todayLocal(), correct }].slice(-90),
    lastStudyDate: todayLocal()
  };
  const d = next.byDomain[domain] || { t: 0, c: 0 };
  next.byDomain[domain] = { t: d.t + 1, c: d.c + (correct ? 1 : 0) };
  if (questionId) next.seen[questionId] = correct ? "correct" : "wrong";
  next.achievements = checkAchievements(next);
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

export function getStreak(progress) {
  const dates = new Set((progress.history || []).map((h) => h.date));
  const today = todayLocal();
  let streak = 0;
  let cursor = new Date();
  // Start from today; if today has no entry, check yesterday before giving up
  if (!dates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dates.has(cursor.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }))) return 0;
    streak = 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Walk backwards counting consecutive days
  while (true) {
    const d = cursor.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    if (!dates.has(d)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getReadiness(progress, totalBank) {
  const seenIds = Object.keys(progress.seen || {});
  const seenCount = seenIds.length;
  if (seenCount === 0) return 0;
  const correctCount = seenIds.filter((id) => progress.seen[id] === "correct").length;
  const k = Math.max(10, Number.isFinite(totalBank) ? Math.round(totalBank * 0.1) : 10);
  return Math.round((correctCount + k * 0.5) / (seenCount + k) * 100);
}

export function checkAchievements(progress) {
  const existing = new Set(progress.achievements || []);
  const streak = getStreak(progress);
  if (progress.total >= 1) existing.add("first-step");
  if (streak >= 7) existing.add("streak-7");
  if (streak >= 30) existing.add("streak-30");
  if ((progress.examHistory || []).some((e) => e.passed)) existing.add("passed-exam");
  return [...existing];
}

export function logExamResult(progress, pct) {
  const entry = { date: todayLocal(), pct, passed: pct >= 65 };
  const examHistory = [...(progress.examHistory || []), entry].slice(-20);
  const next = { ...progress, examHistory };
  next.achievements = checkAchievements(next);
  return next;
}

export function clearProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return { ...EMPTY };
}

// "Sincronização manual": exporta o progresso para um arquivo.
export function exportProgress(state) {
  const payload = { app: "ctfl-prep", exportedAt: new Date().toISOString(), progress: state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ctfl-progresso-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Importa o progresso a partir de um arquivo escolhido pelo usuário.
export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const p = data.progress || data;
        if (typeof p.total !== "number") throw new Error("Formato inválido");
        resolve({ ...EMPTY, ...p, byDomain: p.byDomain || {}, seen: p.seen || {}, saved: p.saved || [], history: p.history || [], srs: p.srs || {}, lastStudyDate: p.lastStudyDate || null, achievements: p.achievements || [], examHistory: p.examHistory || [] });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsText(file);
  });
}
