import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" mantém os caminhos relativos, funcionando tanto em
// GitHub Pages (subdiretório) quanto em Vercel/Netlify (raiz).
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
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
