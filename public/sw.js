/* Synapse · sw.js — offline melhor-esforço (o app é local-first).
   Network-first para documentos e estáticos: sem cache agressivo.

   Atualização (r8 do v3.18.0): o install NÃO chama skipWaiting — o novo
   SW fica "waiting", o toast pergunta ao usuário e só então a página
   envia SKIP_WAITING (postMessage) e recarrega quando o novo SW assume.
   Nunca troca assets no meio de um simulado. */

const CACHE = "synapse-r3";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE));
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

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || Response.error()))
  );
});
