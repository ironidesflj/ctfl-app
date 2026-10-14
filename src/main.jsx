import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { registerServiceWorker, absolutizePwaLinks, warmServiceWorkerCache } from "./lib/pwa.js";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* basename via BASE_URL: funciona tanto na raiz (dev/base "/") quanto
        servido sob um subpath (build --base=/synapse/) sem toque no app. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// r7: PWA offline — registra o SW de public/sw.js no escopo do BASE_URL.
// No-op em dev (PROD guard) e quando o browser não suporta; falhas silenciosas.
registerServiceWorker();
// r7: hrefs absolutos ANTES de qualquer pushState (relativos re-resolvem
// contra a rota atual e quebram: /synapse/ctfl/manifest.webmanifest = 404)
// e aquecimento do cache na 1ª visita (assets do load passam pelo SW tarde
// demais; re-busca via Resource Timing popula o cache-first).
absolutizePwaLinks();
warmServiceWorkerCache();
