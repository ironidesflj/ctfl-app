/* Synapse · data/releases.ts — versão do app + notas de release.
   Uma única fonte de verdade para o splash de atualização, o modal de
   notas de versão e a copy "o que há de novo". A versão viaja em
   synapse.ver.v1 (marcada como vista quando o usuário fecha as notas). */

export const APP_VERSION = "4.2.0";

export interface ReleaseCopy {
  eyebrow: string;
  title: string;
  intro: string;
  items: string[];
  cta: string;
  close: string;
}

export const CURRENT_RELEASE: {
  version: string;
  significant: boolean;
  pt: ReleaseCopy;
  en: ReleaseCopy;
} = {
  version: APP_VERSION,
  significant: true,
  pt: {
    eyebrow: "Novidades da versão",
    title: "CT-AI v2.0 chegou ao Synapse",
    intro:
      "A quarta certificação oficial agora está liberada para estudo, revisão espaçada e simulado pontuado.",
    items: [
      "CT-AI v2.0 (AI Testing) no ar com 360 questões nos dois idiomas (243 para estudo e 117 exclusivas de simulado).",
      "Simulado oficial CT-AI seguindo o blueprint: 40 questões em 60 minutos, 44 pontos possíveis (K1/K2 = 1 pt, K3 = 2 pts) e nota de corte 29.",
      "Conteúdo de apoio completo nos 7 capítulos em PT/EN: 21 itens de syllabus, 21 flashcards e 21 termos no glossário.",
      "O catálogo agora soma 4 certificações ativas e 1.810 questões validadas, mantendo seu progresso e backups compatíveis neste dispositivo.",
      "Você pode reabrir estas notas a qualquer momento pelo botão “Novidades da versão” na aba Sobre.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "CT-AI v2.0 is live on Synapse",
    intro:
      "Our fourth official certification track is now unlocked for study, spaced repetition, and weighted mock exams.",
    items: [
      "CT-AI v2.0 (AI Testing) launched with 360 bilingual questions (243 for study and 117 reserved for mock exams).",
      "Official CT-AI mock exam aligned with the blueprint: 40 questions in 60 minutes, 44 possible points (K1/K2 = 1 pt, K3 = 2 pts), pass mark 29.",
      "Full study companion content across all 7 chapters in PT/EN: 21 syllabus objectives, 21 flashcards, and 21 glossary terms.",
      "The catalog now brings together 4 active certifications and 1,810 validated questions, preserving your local progress and backups.",
      "You can reopen these release notes anytime from the “What's new” button on the About tab.",
    ],
    cta: "Got it",
    close: "Close release notes",
  },
};

export function releaseCopy(lang: "pt" | "en"): ReleaseCopy {
  return lang === "en" ? CURRENT_RELEASE.en : CURRENT_RELEASE.pt;
}
