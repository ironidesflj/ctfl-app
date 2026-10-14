/* r7 — Service worker do Synapse (PWA offline).
 *
 * Estratégia (escopo = pasta onde o app é servido, ex: /synapse/):
 *  - Precache do shell na instalação: index.html, manifest, ícones.
 *  - Navegações (request.mode === "navigate"): network-first com fallback
 *    pro index.html em cache — o app é uma SPA client-side, então servir o
 *    shell offline basta para TODAS as rotas internas.
 *  - Assets (JS/CSS/PNG/SVG/webmanifest): cache-first. Os nomes vêm com
 *    hash do build (index-CAHyHQUN.js) — um novo deploy gera URLs novas,
 *    e o cache antigo é descartado no activate pela troca de versão.
 *    Os chunks lazy do banco (ctfl-*.js) entram aqui: depois da 1ª visita
 *    a cada cert, o banco inteiro funciona offline.
 *  - Fora do escopo do app (origin igual, path diferente, ex: rotas do
 *    Next.js na porta 3000): o SW não intercepta NADA — rede normal.
 *
 * Versão: bumpar VERSION a cada deploy para limpar caches antigos.
 *
 * r8: ciclo de atualização gentil — o SW novo NÃO assume na instalação
 * (skipWaiting sai do install). Ele espera a página enviar
 * { type: "SKIP_WAITING" } (UpdateToast → applyServiceWorkerUpdate);
 * o controllerchange dispara o reload da página já no SW novo.
 *
 * r10: notificationclick — tocar no lembrete diário foca a janela do app
 * (ou abre, se estiver fechada) na rota neutra /go/quiz, que resolve pro
 * último cert usado. Notificações sem rota focam e pronto.
 */
const VERSION = "r15-v1";
const CACHE = `synapse-${VERSION}`;

const SCOPE = new URL(self.registration.scope);
const SHELL_FILES = [
  "index.html",
  "manifest.webmanifest",
  "favicon.svg",
  "icon-192.png",
  "icon-512.png",
  "og-image.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // addAll é atômico (falha tudo se um item falhar) — aceitável no
      // shell; og-image é o maior item e ainda assim ~100KB.
      await cache.addAll(SHELL_FILES.map((f) => new URL(f, SCOPE).href));
    })()
  );
  // r8: SEM skipWaiting aqui — a 1ª instalação ativa sozinha (não há SW
  // antigo controlando); num UPDATE o novo fica em "waiting" até a página
  // pedir (SKIP_WAITING abaixo), evitando troca de assets no meio da sessão.
});

// r8: a página manda { type: "SKIP_WAITING" } quando o usuário aceita a
// atualização no toast — só então o SW novo assume (e o controllerchange
// na página dispara o reload).
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  const shellHref = new URL("index.html", SCOPE).href;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
      return fresh;
    }
    // r8: deep links do SPA (ex: /synapse/ctfl/quiz) não existem no
    // servidor — o app é servido como arquivos estáticos ao lado do
    // Next.js, que responde 404 nessas rotas. Resposta não-ok em
    // navegação = serve o shell cacheado e deixa o router do SPA
    // resolver a rota no client (bookmark/link compartilhado funciona).
    const cached = (await cache.match(request)) || (await cache.match(shellHref));
    if (cached) return cached;
    return fresh;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(shellHref));
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // só cacheia resposta ok do mesmo escopo (falhas de rede não viram lixo)
  if (response && response.ok && new URL(request.url).href.startsWith(SCOPE.href)) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (!url.href.startsWith(SCOPE.href)) return; // fora do app: não mexe

  if (req.mode === "navigate") {
    event.respondWith(networkFirstNavigation(req));
    return;
  }
  event.respondWith(cacheFirst(req));
});

// r10: clicar numa notificação (lembrete diário) traz o app pra frente —
// foca a janela existente ou abre uma nova na rota pedida.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const goTab = event.notification.data && event.notification.data.go;
  const target = goTab ? new URL(`go/${goTab}`, SCOPE).href : SCOPE.href;
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if ("focus" in client) {
          if (goTab && "navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              /* foca onde está */
            }
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});
