"use client";

/* ===========================================================
   Synapse · UpdateToast.tsx
   Toast de atualização do service worker (porta do r8 do v3.18.0).

   O novo SW fica "waiting" (o install NÃO chama skipWaiting); este
   toast avisa e a troca + reload só acontecem quando o usuário pede —
   nunca no meio de um simulado. PROD-only (mesmo guard do registro);
   em dev nunca renderiza.
   =========================================================== */

import { useEffect, useState } from "react";
import { useSynapse } from "./store";
import { applyServiceWorkerUpdate, watchServiceWorkerUpdate } from "./pwa";

export function UpdateToast() {
  const { t } = useSynapse();
  const [pendingReg, setPendingReg] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const cleanup = watchServiceWorkerUpdate((reg) => setPendingReg(reg));
    return cleanup;
  }, []);

  /* o listener vive em efeito próprio ([]); trocar de idioma não o afeta */
  if (!pendingReg || dismissed) return null;

  return (
    <div className="update-toast" role="status" aria-live="polite">
      <span className="update-toast-label" aria-hidden="true">
        ⟳
      </span>
      <div className="update-toast-body">
        <strong>{t("update.title")}</strong>
        <span>{t("update.hint")}</span>
      </div>
      <button
        type="button"
        className="update-toast-cta"
        onClick={() => applyServiceWorkerUpdate(pendingReg)}
      >
        {t("update.cta")}
      </button>
      <button
        type="button"
        className="update-toast-close"
        aria-label={t("update.dismissAria")}
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
}
