import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_VERSION } from "@/synapse/data/releases";

/* Fontes do handoff (Newsreader · Instrument Sans · IBM Plex Mono) via
   Google Fonts com fallbacks de sistema já declarados em tokens.css.
   Carregamento assíncrono igual ao protótipo (media="print" → all). */

export const metadata: Metadata = {
  title: "Synapse",
  description:
    "Preparação para certificações ISTQB: questões PT/EN, flashcards com revisão espaçada, syllabus oficial e prontidão ponderada. Local-first, sem conta. by Noos.",
  applicationName: "Synapse",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e16" },
  ],
};

/* Script de boot do tema — igual ao <head> do protótipo: aplica
   data-theme antes da primeira pintura (sem flash). */
const THEME_BOOT = `try{var t=localStorage.getItem('synapse.theme.v1');if(t==='dark'||(t!=='light'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}`;

/* Capa anti-flash da abertura (r12): o splash da constelação só monta
   depois da hidratação — sem isto, a casca (aba Hoje) pinta antes dele.
   O script marca <html data-boot="first|update|quick"> antes da primeira
   pintura e o CSS esconde topo e trilho até o Splash remover a marca ao
   montar. Se o React não subir (JS falhou), o próprio script retira a
   capa após 3,5 s — o conteúdo nunca fica preso. Mesma lógica de
   boot.ts, espelhada aqui porque roda antes do bundle. */
const BOOT_COVER = `try{var o=localStorage.getItem('synapse.onboarding.v2');var m=o!=='1'?'first':(localStorage.getItem('synapse.ver.v1')===${JSON.stringify(APP_VERSION)}?'quick':'update');var d=document.documentElement;d.setAttribute('data-boot',m);setTimeout(function(){d.removeAttribute('data-boot')},3500);}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="light" data-direction="a" data-app="synapse" suppressHydrationWarning>
      <body data-cert="ctfl">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: <link> é hoisted pelo React 19 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOT_COVER }} />
        {children}
      </body>
    </html>
  );
}
