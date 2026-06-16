const KEY = "ctfl_progress_v1";

const EMPTY = { total: 0, correct: 0, byDomain: {} };

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed, byDomain: parsed.byDomain || {} };
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

export function recordAnswer(state, domain, correct) {
  const next = {
    total: state.total + 1,
    correct: state.correct + (correct ? 1 : 0),
    byDomain: { ...state.byDomain }
  };
  const d = next.byDomain[domain] || { t: 0, c: 0 };
  next.byDomain[domain] = { t: d.t + 1, c: d.c + (correct ? 1 : 0) };
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
        resolve({ ...EMPTY, ...p, byDomain: p.byDomain || {} });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsText(file);
  });
}
