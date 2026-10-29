"use client";

/* Synapse · SynapseApp.tsx — raiz client: casca única + provider. */

import { useEffect } from "react";
import { SynapseProvider } from "./store";
import { Shell } from "./Shell";
import { registerServiceWorker } from "./pwa";

export default function SynapseApp() {
  /* PWA: registra o service worker apenas em produção (dev sem cache
     agressivo). O novo SW fica "waiting" — o toast de atualização
     pergunta e só então SKIP_WAITING + reload. */
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <SynapseProvider>
      <Shell />
    </SynapseProvider>
  );
}
