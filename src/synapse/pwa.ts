/* Synapse · pwa.ts — helpers client-side de PWA (porta do pwa.js r7/r8
   do v3.18.0, adaptada ao Next.js App Router).

   - Registro só em produção (o SW do dev cachearia módulos quentes).
   - O novo SW fica "waiting": o toast pergunta, o usuário decide, e só
     então SKIP_WAITING + recarrega (nunca troca assets no meio de um
     simulado). Falha de registro nunca derruba o app. */

export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registro falhou (ex: contexto não seguro) — app segue online-only */
    });
  } catch {
    /* best-effort */
  }
}

/** true quando o app já roda como PWA instalada. */
export function isRunningStandalone(): boolean {
  try {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    /* iOS Safari não implementa display-mode antes de 16.4 */
    return (
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/** Escuta updatefound → installed e chama onUpdate quando há um SW novo
    pronto esperando (só faz sentido com um SW já controlando a página).
    Retorna cleanup() para o useEffect do componente. */
export function watchServiceWorkerUpdate(
  onUpdate: (reg: ServiceWorkerRegistration) => void
): () => void {
  if (process.env.NODE_ENV !== "production") return () => {};
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return () => {};
  let registration: ServiceWorkerRegistration | null = null;
  const pairs: Array<[ServiceWorker, () => void]> = [];
  try {
    const handleChange = () => {
      const inst = registration?.installing || registration?.waiting;
      if (!inst) return;
      if (pairs.some(([i]) => i === inst)) return; // já escutando este worker
      const onState = () => {
        if (inst.state === "installed" && navigator.serviceWorker.controller) {
          /* controller existe ⇒ já havia um SW controlando ⇒ é UPDATE */
          if (registration) onUpdate(registration);
        }
      };
      pairs.push([inst, onState]);
      inst.addEventListener("statechange", onState);
      /* pode já ter passado por "installed" entre updatefound e o listener */
      onState();
    };
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        reg.addEventListener("updatefound", handleChange);
        handleChange(); /* waiting já presente (aba aberta durante o deploy) */
      })
      .catch(() => {
        /* offline/sem suporte — sem updates */
      });
    return () => {
      registration?.removeEventListener?.("updatefound", handleChange);
      pairs.forEach(([i, h]) => i.removeEventListener?.("statechange", h));
    };
  } catch {
    return () => {};
  }
}

/** Aplica a atualização: pede SKIP_WAITING ao SW waiting e recarrega a
    página exatamente uma vez quando o novo SW assumir (controllerchange). */
export function applyServiceWorkerUpdate(registration: ServiceWorkerRegistration | null): void {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  } catch {
    /* best-effort */
  }
}
