import { useEffect, useState } from "react";
import { isRunningStandalone } from "../lib/pwa.js";
import { isInstallDismissed, dismissInstall } from "../lib/settings.js";
import { t } from "../lib/ui-strings.js";

/* r7 — Prompt de instalação da PWA.
 *
 * O browser dispara `beforeinstallprompt` quando o app satisfaz os
 * critérios de instalação (manifest + SW + HTTPS) e ainda não está
 * instalado. Guardamos o evento e mostramos um pill discreto no canto
 * inferior direito; o clique chama event.prompt() (a UI nativa assume).
 *
 * Escondido quando: já instalado (appinstalled / display-mode standalone),
 * usuário dispensou (synapse.installDismissed — persistido, entra no
 * backup) ou browser sem suporte (iOS usa "Adicionar à Tela de Início"
 * manualmente — o pill nem chega a existir lá).
 */
export default function InstallPrompt({ lang = "pt" }) {
  const [installEvent, setInstallEvent] = useState(null);
  const [standalone, setStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(() => isInstallDismissed());

  useEffect(() => {
    // já rodando como PWA? (checagem inicial + mudança de display-mode)
    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;
    const sync = () => setStandalone(isRunningStandalone());
    sync();
    mq?.addEventListener?.("change", sync);

    const onBeforeInstall = (e) => {
      e.preventDefault(); // impede o mini-infobar do Chrome; usamos o nosso
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", sync);
    };
  }, []);

  if (!installEvent || standalone || dismissed) return null;

  async function handleInstall() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice?.outcome === "accepted") setInstallEvent(null);
    } catch {
      /* prompt falhou/fechado — mantém o pill, próxima tentativa ainda funciona */
    }
  }

  return (
    <div className="install-pill" role="dialog" aria-label={t(lang, "install.ariaLabel")}>
      <div className="install-text">
        <strong>{t(lang, "install.title")}</strong>
        <span>{t(lang, "install.hint")}</span>
      </div>
      <div className="install-actions">
        <button className="btn primary install-cta" onClick={handleInstall}>
          {t(lang, "install.cta")}
        </button>
        <button
          className="install-close"
          aria-label={t(lang, "install.dismissAria")}
          onClick={() => {
            dismissInstall();
            setDismissed(true);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
