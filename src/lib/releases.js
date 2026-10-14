const RELEASE_KEY_PREFIX = "synapse.releaseNotes.seen";

export const CURRENT_RELEASE = {
  version: "3.12.0",
  significant: true,
  pt: {
    eyebrow: "Novidades da versão",
    title: "O Synapse evoluiu",
    intro: "Esta atualização deixa o estudo e os simulados mais fiéis à prova real.",
    items: [
      "Questões de estudo e de simulado agora ficam em pools exclusivos, evitando memorização prévia.",
      "O CTAL-TA passa a usar pontuação oficial por K-level, com corte de 51 em 78 pontos.",
      "Os cronômetros agora usam o tempo nativo BSTQB: 60 minutos no CTFL e 120 no CTAL-TA.",
      "A cobertura e a prontidão consideram apenas o material de estudo, com a divisão dos pools visível.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "Synapse has evolved",
    intro: "This update makes study and exam simulations more faithful to the real exam.",
    items: [
      "Study and exam questions now use exclusive pools, preventing prior memorization.",
      "CTAL-TA now uses official K-level scoring, with a 51-out-of-78 pass mark.",
      "Timers now use native BSTQB times: 60 minutes for CTFL and 120 for CTAL-TA.",
      "Coverage and readiness now consider study material only, with the pool split visible.",
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
