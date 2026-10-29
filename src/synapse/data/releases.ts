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
    title: "A abertura aprendeu a constelação",
    intro: "A primeira visita agora segue a Trilha Ascendente — e a abertura parou de piscar.",
    items: [
      "Onboarding reconstruído na identidade Caderno: quatro estações nos nós da marca, índice de recursos em filetes, demo interativa com os estilos reais da sessão e FAQ — reabrível a qualquer momento no Sobre.",
      "Abertura sem flash: a constelação nasce antes da interface e faz crossfade direto para o próximo passo — a aba Hoje não aparece antes nem depois da animação.",
      "Teclado e leitor de tela respeitados na abertura: nada focável por baixo do splash, foco inicial no título do diálogo e aviso de app pronto.",
    ],
    cta: "Entendi",
    close: "Fechar novidades",
  },
  en: {
    eyebrow: "What's new in",
    title: "The opening learned the constellation",
    intro: "The first visit now follows the Ascending Trail — and the opening stopped flickering.",
    items: [
      "Onboarding rebuilt in the Caderno identity: four stations on the brand's nodes, a hairline feature index, an interactive demo with the real session styles and an FAQ — reopenable anytime from About.",
      "Flash-free opening: the constellation is born before the interface and crossfades straight into the next step — the Today tab no longer shows before or after the animation.",
      "Keyboard and screen-reader respect throughout the opening: nothing focusable under the splash, initial focus on the dialog title and a polite app-ready announcement.",
    ],
    cta: "Got it",
    close: "Close release notes",
  },
};

export function releaseCopy(lang: "pt" | "en"): ReleaseCopy {
  return lang === "en" ? CURRENT_RELEASE.en : CURRENT_RELEASE.pt;
}
