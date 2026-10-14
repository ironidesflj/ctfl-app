import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "/" é necessário para BrowserRouter — caminhos absolutos garantem que
// assets carregam corretamente em qualquer rota (ex: /ctfl/quiz).
//
// Para hospedar em um subpath (ex: https://site.com/synapse/):
//   npm run build -- --base=/synapse/
// O service worker autoral (public/sw.js) e o manifest (public/) usam
// caminhos relativos, então funcionam em qualquer subpasta sem ajuste.
//
// Nota (r12): vite-plugin-pwa foi REMOVIDO — desde a r7 o PWA é autoral
// (public/sw.js + public/manifest.webmanifest, registro em src/lib/pwa.js).
// O devDependency ainda lista o pacote por compatibilidade de lockfile;
// pode ser removido com `npm uninstall vite-plugin-pwa`.
// O banco de questões é carregado lazy por cert (src/data/banks/ via
// import.meta.glob em bank.js) — não há manualChunks; o monolito em
// src/data/synapse-question-bank.json fica retido apenas como fonte de
// verdade do teste de integridade do split (bank-split.test.js).
export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.js",
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
  plugins: [react()],
});
