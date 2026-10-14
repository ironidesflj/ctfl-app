import { useEffect, useState } from "react";
import { t } from "../lib/ui-strings.js";
import { waitForServiceWorkerUpdate, applyServiceWorkerUpdate } from "../lib/pwa.js";

/* r8 — Toast de atualização do service worker (backlog r7 #2).
 *
 * Até a r7 o novo SW assumia na hora (skipWaiting no install): assets
 * podiam trocar no meio de um simulado. Agora o SW novo fica "waiting",
 * este toast avisa ("Nova versão disponível") e a troca + reload só
 * acontecem quando o usuário pede. PROD-only (mesmo guard do registro);
 * em dev nunca renderiza. */
export default function UpdateToast({ lang = "pt" }) {
  const [pendingReg, setPendingReg] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const cleanup = waitForServiceWorkerUpdate((reg) => setPendingReg(reg));
    return cleanup;
  }, []);

  // re-render a cada mudança de idioma não afeta o listener (efeito []).
  if (!pendingReg || dismissed) return null;

  return (
    <div className="update-toast" role="status" aria-live="polite">
      <span className="update-toast-label" aria-hidden="true">
        🚀
      </span>
      <div className="update-toast-body">
        <strong>{t(lang, "update.title")}</strong>
        <span>{t(lang, "update.hint")}</span>
      </div>
      <button className="update-toast-cta" onClick={() => applyServiceWorkerUpdate(pendingReg)}>
        {t(lang, "update.cta")}
      </button>
      <button
        className="update-toast-close"
        aria-label={t(lang, "update.dismissAria")}
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
}
