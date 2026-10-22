const RELEASE_KEY_PREFIX = "synapse.releaseNotes.seen";

export const CURRENT_RELEASE = {
  version: "3.14.0",
  significant: true,
  pt: {
    eyebrow: "Novidades da versão",
    title: "O Synapse evoluiu",
    intro: "Esta atualização conecta seus flashcards ao Progresso e melhora as revisões espaçadas.",
    items: [
      "Acompanhe cartões iniciados, retenção e próximas revisões no Progresso.",
      "Use atalhos de teclado, veja quando o cartão volta e desfaça a última avaliação.",
      "O CTAL-TA agora tem flashcards, syllabus e glossário próprios em português e inglês.",
      "O novo conteúdo cobre os cinco capítulos e inclui os objetivos de aprendizagem K4.",
      "O heatmap agora mostra 12 semanas alinhadas ao calendário, com meses e dias identificados.",
      "Você pode tocar ou clicar em cada dia para ver respostas e percentual de acerto.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "Synapse has evolved",
    intro: "This update connects flashcards to Progress and improves spaced repetition.",
    items: [
      "Track started cards, retention, and upcoming reviews in Progress.",
      "Use keyboard shortcuts, see the next review interval, and undo your last rating.",
      "CTAL-TA now has dedicated flashcards, syllabus content, and glossary terms in Portuguese and English.",
      "The new content covers all five chapters, including the K4 learning objectives.",
      "The activity heatmap now shows 12 calendar-aligned weeks with month and day labels.",
      "You can tap or click any day to inspect answers and accuracy.",
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
