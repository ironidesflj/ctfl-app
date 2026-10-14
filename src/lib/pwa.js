// r7 — PWA: registro do service worker + helpers do prompt de instalação.
// O registro só acontece em build de PRODUÇÃO (import.meta.env.PROD): no
// dev do Vite o SW cachearia módulos quentes e quebraria o HMR.
//
// O SW vive em public/sw.js (copiado 1:1 pro dist; escopo = BASE_URL).
// Falha de registro NUNCA derruba o app — é todo best-effort com catch.

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return false;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      /* registro falhou (ex: contexto não seguro) — app segue online-only */
    });
    return true;
  } catch {
    return false;
  }
}

/** true quando o app já roda como PWA instalada (display-mode standalone
 *  ou iOS standalone) — nesse caso o prompt de instalação não aparece. */
export function isRunningStandalone() {
  try {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    // iOS Safari não implementa display-mode antes de 16.4
    return typeof navigator !== "undefined" && navigator.standalone === true;
  } catch {
    return false;
  }
}

/** r7: hrefs de PWA absolutos. Em SPA com pushState, hrefs relativos do
 *  index.html ("./manifest.webmanifest") re-resolvem contra a ROTA atual
 *  (ex: /synapse/ctfl/quiz → /synapse/ctfl/manifest.webmanifest = 404).
 *  Reescreve manifest e apple-touch-icon para o BASE_URL real do build. */
export function absolutizePwaLinks() {
  try {
    if (typeof document === "undefined") return;
    const base = import.meta.env.BASE_URL || "/";
    const fix = (selector, file) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("href", `${base}${file}`);
    };
    fix('link[rel="manifest"]', "manifest.webmanifest");
    fix('link[rel="apple-touch-icon"]', "icon-192.png");
    // r8: splash screens iOS — o standalone do iOS reabre na ÚLTIMA rota
    // (ex: /synapse/ctfl/quiz); hrefs relativos re-resolvem contra ela e a
    // imagem 404 (splash branco). Absolutiza pelo basename de cada link —
    // são 8 tamanhos diferentes, não dá pra fixar um arquivo só.
    document.querySelectorAll('link[rel="apple-touch-startup-image"]').forEach((el) => {
      const href = el.getAttribute("href") || "";
      const file = href.split("/").pop();
      if (file) el.setAttribute("href", `${base}${file}`);
    });
  } catch {
    /* best-effort */
  }
}

/** r8: cicla o fluxo de atualização do SW. O novo SW fica "waiting" (o
 *  install do r8 não chama skipWaiting); a página pergunta via
 *  SKIP_WAITING e recarrega no controllerchange — o usuário nunca perde
 *  a sessão no meio por uma troca de assets.
 *  Registra (se ainda não registrado), escuta updatefound → installed e
 *  chama onUpdate(registration) quando há um SW pronto esperando.
 *  Retorna cleanup() para o useEffect do componente. */
export function waitForServiceWorkerUpdate(onUpdate) {
  if (!import.meta.env.PROD) return () => {};
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return () => {};
  let registration = null;
  const pairs = []; // [installation, onState] para o cleanup
  try {
    const handleChange = () => {
      const inst = registration.installing || registration.waiting;
      if (!inst) return;
      if (pairs.some(([i]) => i === inst)) return; // já escutando este worker
      const onState = () => {
        if (inst.state === "installed" && navigator.serviceWorker.controller) {
          // controller existe ⇒ já havia um SW controlando ⇒ é UPDATE
          onUpdate(registration);
        }
      };
      pairs.push([inst, onState]);
      inst.addEventListener("statechange", onState);
      // pode já ter passado por "installed" entre o updatefound e o listener
      onState();
    };
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((reg) => {
        registration = reg;
        reg.addEventListener("updatefound", handleChange);
        handleChange(); // waiting já presente (aba aberta durante o deploy)
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

/** r8: aplica a atualização: pede SKIP_WAITING ao SW waiting e recarrega a
 *  página exatamente uma vez quando o novo SW assumir (controllerchange).
 *  O listener usa uma flag local — controllerchange também dispara na
 *  1ª instalação com clients.claim, e reload duplo seria perceptível. */
export function applyServiceWorkerUpdate(registration) {
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

/** r7: aquece o cache do SW na 1ª visita. O SW registra APÓS o load, então
 *  os assets da própria página (entrada JS/CSS + chunk do banco que o
 *  prefetch puxou) foram buscados ANTES do controle — sem isso, offline
 *  só funcionaria a partir da 2ª visita. Re-busca os recursos JS/CSS
 *  same-origin do escopo registrados no Resource Timing; as requisições
 *  passam pelo SW (página já controlada após claim) e o cache-first
 *  guarda tudo (HTTP cache do browser evita rede). */
export async function warmServiceWorkerCache() {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    if (!reg?.active) return;
    // ready resolve na ativação, mas clients.claim() disputa com ele: se a
    // página ainda NÃO está controlada, os fetches do aquecimento não
    // passam pelo SW e nada é cacheado (verificado ao vivo). Espera o
    // controller com fallback de 3s para nunca travar o boot.
    const sw = navigator.serviceWorker;
    if (!sw.controller) {
      await new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          sw.removeEventListener?.("controllerchange", finish);
          resolve();
        };
        sw.addEventListener?.("controllerchange", finish);
        setTimeout(finish, 3000);
      });
    }
    const base = new URL(import.meta.env.BASE_URL || "/", location.href).href;
    const inScope = (urlStr) => {
      try {
        const u = new URL(urlStr, location.href);
        return (
          u.origin === location.origin &&
          u.href.startsWith(base) &&
          (u.pathname.endsWith(".js") || u.pathname.endsWith(".css"))
        );
      } catch {
        return false;
      }
    };
    const names = (performance.getEntriesByType("resource") || [])
      .map((e) => e.name)
      .filter(inScope);
    await Promise.all(names.map((n) => fetch(n).catch(() => {})));
  } catch {
    /* best-effort: offline continua funcionando na 2ª visita */
  }
}
