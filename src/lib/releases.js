const RELEASE_KEY_PREFIX = "synapse.releaseNotes.seen";

export const CURRENT_RELEASE = {
  version: "3.11.0",
  significant: true,
  pt: {
    eyebrow: "Novidades da versão",
    title: "O Synapse evoluiu",
    intro: "Esta atualização melhora estudo, simulados, progresso e uso offline.",
    items: [
      "Simulados agora salvam rascunho, permitem retomada e seguem capítulo + K-level.",
      "Progresso ganhou meta diária, heatmap, desempenho por K-level e data da prova.",
      "A PWA ficou mais rápida, funciona offline e atualiza sem interromper sua sessão.",
      "Banco e qualidade receberam novas correções, guardas e 285 testes automatizados.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "Synapse has evolved",
    intro: "This update improves study, exams, progress insights, and offline use.",
    items: [
      "Exam simulations now save drafts, resume safely, and follow chapter + K-level.",
      "Progress now includes daily goals, a heatmap, K-level results, and exam date.",
      "The PWA is faster, works offline, and updates without interrupting your session.",
      "The question bank and quality gates gained fixes plus 285 automated tests.",
    ],
    cta: "Got it",
    close: "Close release notes",
  },
};

function storageFor(storage) {
  if (storage) return storage;
  if (typeof localStorage !== "undefined") return localStorage;
  return null;
}

export function releaseSeenKey(version = CURRENT_RELEASE.version) {
  return `${RELEASE_KEY_PREFIX}.${version}`;
}

export function shouldAnnounceCurrentRelease(storage) {
  if (!CURRENT_RELEASE.significant || CURRENT_RELEASE.version !== __APP_VERSION__) return false;
  try {
    return storageFor(storage)?.getItem(releaseSeenKey()) !== "1";
  } catch {
    return false;
  }
}

export function markCurrentReleaseSeen(storage) {
  try {
    storageFor(storage)?.setItem(releaseSeenKey(), "1");
    return true;
  } catch {
    return false;
  }
}

export function currentReleaseCopy(lang = "pt") {
  return CURRENT_RELEASE[lang === "en" ? "en" : "pt"];
}
