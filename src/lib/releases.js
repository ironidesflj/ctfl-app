const RELEASE_KEY_PREFIX = "synapse.releaseNotes.seen";

export const CURRENT_RELEASE = {
  version: "3.18.0",
  significant: true,
  pt: {
    eyebrow: "Novidades da versão",
    title: "O Synapse evoluiu",
    intro: "O CTAL-TM agora está disponível para estudo e simulados.",
    items: [
      "Prepare-se para Test Management v3.0 com questões, flashcards, syllabus e glossário em PT/EN.",
      "Simulados CTAL-TM com 50 questões, 88 pontos e corte de 58 pontos.",
      "O CTAL-TA ganhou tons teal nos botões, abas e filtros, com contraste verificado.",
      "O cabeçalho mobile continua oferecendo a troca de certificação.",
      "Navegue pelo mapa de atividade usando as setas do teclado.",
      "Revisões aparecem na atividade; acompanhe o resumo do dia e as últimas duas semanas.",
      "O desfazer preserva o histórico e as datas anteriores, mesmo com o histórico cheio.",
      "Desfaça a última avaliação mesmo após concluir a fila, restaurando o filtro e corrigindo as conquistas.",
      "O botão Revisar agora abre os cartões pendentes; as datas seguem seu fuso local.",
      "Acompanhe cartões iniciados, retenção e próximas revisões no Progresso.",
      "Use atalhos de teclado, veja quando o cartão volta e desfaça a última avaliação.",
      "O CTAL-TA agora tem flashcards, syllabus e glossário próprios em português e inglês.",
      "O novo conteúdo cobre os cinco capítulos e inclui os objetivos de aprendizagem K4.",
      "O heatmap agora mostra 12 semanas alinhadas ao calendário, com meses e dias identificados.",
      "Você pode tocar ou clicar em cada dia para ver respostas e percentual de acerto.",
      "Rascunhos de simulados agora são protegidos contra mudanças futuras na posição das alternativas.",
      "As questões CTAL-TM receberam revisão editorial e o banco passou pelas guardas de qualidade.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "Synapse has evolved",
    intro: "CTAL-TM is now available for study and exam simulations.",
    items: [
      "Study Test Management v3.0 with questions, flashcards, syllabus, and glossary in PT/EN.",
      "CTAL-TM simulations include 50 questions, 88 points, and a 58-point pass mark.",
      "CTAL-TA now uses teal buttons, tabs, and filters with verified contrast.",
      "The mobile header keeps certification switching available.",
      "Navigate the activity map using your keyboard arrow keys.",
      "Reviews appear in activity, with a daily summary and the last two weeks of reviews.",
      "Undo preserves previous history and dates, even when history is full.",
      "Undo your last rating even after clearing the queue, restoring the filter and correcting achievements.",
      "Review now opens due cards directly; scheduling dates follow your local time zone.",
      "Track started cards, retention, and upcoming reviews in Progress.",
      "Use keyboard shortcuts, see the next review interval, and undo your last rating.",
      "CTAL-TA now has dedicated flashcards, syllabus content, and glossary terms in Portuguese and English.",
      "The new content covers all five chapters, including the K4 learning objectives.",
      "The activity heatmap now shows 12 calendar-aligned weeks with month and day labels.",
      "You can tap or click any day to inspect answers and accuracy.",
      "Exam drafts are now protected against future changes to option positions.",
      "CTAL-TM questions received an editorial review and the bank passed its quality gates.",
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
