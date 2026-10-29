"use client";

/* ===========================================================
   Synapse · InstallPrompt.tsx
   Prompt de instalação da PWA (porta do r7 do v3.18.0).

   O browser dispara `beforeinstallprompt` quando o app satisfaz os
   critérios (manifest + SW + HTTPS) e ainda não está instalado.
   Guardamos o evento e mostramos um pill discreto; o clique chama
   event.prompt() e a UI nativa assume.

   Escondido quando: já instalado (appinstalled / display-mode
   standalone), dispensado (synapse.install.v1, persistido) ou browser
   sem suporte (iOS usa "Adicionar à Tela de Início" manualmente —
   o pill nem chega a existir lá). Só monta depois do boot (splash +
   onboarding/notas) para não empilhar overlays na primeira visita.
   =========================================================== */

import { useEffect, useState } from "react";
import { useSynapse } from "./store";
import { dismissInstall, isInstallDismissed } from "./boot";
import { isRunningStandalone } from "./pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt({ active }: { active: boolean }) {
  const { t } = useSynapse();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;
    const sync = () => {
      setStandalone(isRunningStandalone());
      setDismissed(isInstallDismissed());
    };
    sync();
    mq?.addEventListener?.("change", sync);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); /* impede o mini-infobar do Chrome; usamos o nosso */
      setInstallEvent(e as BeforeInstallPromptEvent);
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

  if (!active || !installEvent || standalone || dismissed) return null;

  async function handleInstall() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice?.outcome === "accepted") setInstallEvent(null);
    } catch {
      /* prompt falhou/fechado — mantém o pill, a próxima tentativa funciona */
    }
  }

  return (
    <div className="install-pill" role="dialog" aria-label={t("install.ariaLabel")}>
      <div className="install-text">
        <strong>{t("install.title")}</strong>
        <span>{t("install.hint")}</span>
      </div>
      <div className="install-actions">
        <button type="button" className="btn primary sm install-cta" onClick={handleInstall}>
          {t("install.cta")}
        </button>
        <button
          type="button"
          className="install-close"
          aria-label={t("install.dismissAria")}
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
