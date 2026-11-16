/* Synapse · data/releases.ts — versão do app + notas de release.
   Uma única fonte de verdade para o splash de atualização, o modal de
   notas de versão e a copy "o que há de novo". A versão viaja em
   synapse.ver.v1 (marcada como vista quando o usuário fecha as notas). */

export const APP_VERSION = "4.3.0";

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
    title: "CTAL-AT v2.0 completa o catálogo do Synapse",
    intro:
      "A trilha Advanced Level Agile Tester chegou em português e inglês — encerrando todas as certificações ativas do roadmap.",
    items: [
      "CTAL-AT v2.0 (Agile Tester) liberada com 360 questões bilíngues (234 para estudo e 126 exclusivas de simulado).",
      "Simulado oficial CTAL-AT fiel ao blueprint: 40 questões em 90 minutos, 52 pontos possíveis (K2=1 · K3=2 · K4=3) e nota de corte 34.",
      "Conteúdo de apoio completo nos 6 capítulos em PT/EN: 18 itens de syllabus, 18 flashcards e 18 termos oficiais no glossário.",
      "O catálogo agora reúne 5 certificações ativas e 2.170 questões disponíveis para estudo e simulado (2.370 no banco canônico), mantendo seu progresso intacto.",
      "Você pode reabrir estas novidades a qualquer momento pelo botão “Novidades da versão” na aba Sobre.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "CTAL-AT v2.0 completes the Synapse catalog",
    intro:
      "The Advanced Level Agile Tester track has landed in Portuguese and English — completing every active certification on the roadmap.",
    items: [
      "CTAL-AT v2.0 (Agile Tester) launched with 360 bilingual questions (234 for study and 126 reserved for mock exams).",
      "Official CTAL-AT mock exam aligned with the blueprint: 40 questions in 90 minutes, 52 possible points (K2=1 · K3=2 · K4=3), pass mark 34.",
      "Full companion study content across all 6 chapters in PT/EN: 18 syllabus objectives, 18 flashcards, and 18 official glossary terms.",
      "The catalog now covers 5 active certifications and 2,170 live questions for study and mock exams (2,370 in the canonical bank), preserving your local progress.",
      "You can reopen these release notes anytime from the “What's new” button on the About tab.",
    ],
    cta: "Got it",
    close: "Close release notes",
  },
};

export function releaseCopy(lang: "pt" | "en"): ReleaseCopy {
  return lang === "en" ? CURRENT_RELEASE.en : CURRENT_RELEASE.pt;
}
