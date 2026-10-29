/* Synapse · data/releases.ts — versão do app + notas de release.
   Uma única fonte de verdade para o splash de atualização, o modal de
   notas de versão e a copy "o que há de novo". A versão viaja em
   synapse.ver.v1 (marcada como vista quando o usuário fecha as notas). */

export const APP_VERSION = "4.1.0";

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
    title: "O Synapse ganhou uma nova identidade",
    intro:
      "A nova abertura apresenta a marca em uma animação de profundidade, com tempo para contemplá-la.",
    items: [
      "Onboarding reconstruído na identidade Caderno: quatro estações nos nós da marca, índice de recursos em filetes, demo interativa com os estilos reais da sessão e FAQ — reabrível a qualquer momento no Sobre.",
      "Nova marca e abertura 3D em fundo escuro, com transição direta para o próximo passo, sem exibir a interface antes da hora.",
      "O progresso local da versão 3.18 é migrado ao abrir a atualização; o backup continua disponível em Progresso.",
      "Teclado e leitor de tela respeitados na abertura: nada focável por baixo do splash, foco inicial no título do diálogo e aviso de app pronto.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "Synapse has a new identity",
    intro: "The new opening presents the brand with a depth animation and time to take it in.",
    items: [
      "Onboarding rebuilt in the Caderno identity: four stations on the brand's nodes, a hairline feature index, an interactive demo with the real session styles and an FAQ — reopenable anytime from About.",
      "New brand and 3D opening on a dark background, transitioning directly to the next step without showing the interface too early.",
      "Local progress from version 3.18 is migrated when the update opens; backups remain available in Progress.",
      "Keyboard and screen-reader respect throughout the opening: nothing focusable under the splash, initial focus on the dialog title and a polite app-ready announcement.",
    ],
    cta: "Got it",
    close: "Close release notes",
  },
};

export function releaseCopy(lang: "pt" | "en"): ReleaseCopy {
  return lang === "en" ? CURRENT_RELEASE.en : CURRENT_RELEASE.pt;
}
