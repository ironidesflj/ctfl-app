import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "/" é necessário para BrowserRouter — caminhos absolutos garantem que
// assets carregam corretamente em qualquer rota (ex: /ctfl/quiz).
export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.js",
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // banco multi-cert (1100q) passou do limite default de 2MiB
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      },
      manifest: {
        name: "CTFL Prep — ISTQB v4.0",
        short_name: "CTFL Prep",
        description: "Preparação para o exame ISTQB Certified Tester Foundation Level v4.0",
        theme_color: "#5a4be7",
        background_color: "#14141c",
        display: "standalone",
        lang: "pt-BR",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
