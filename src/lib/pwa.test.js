// r7 — PWA: validação do manifest, sintaxe do service worker e guards do
// registerServiceWorker. O SW em si roda num contexto que o jsdom não tem
// (self/caches/clients) — por isso a validação de sintaxe via node --check
// (mesma engine que o browser usa pra parsear) + testes unitários dos
// helpers que RODAM no contexto da página (pwa.js).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  registerServiceWorker,
  isRunningStandalone,
  absolutizePwaLinks,
  warmServiceWorkerCache,
  waitForServiceWorkerUpdate,
  applyServiceWorkerUpdate,
} from "./pwa.js";
import { isInstallDismissed, dismissInstall } from "./settings.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, "../../public");

describe("r7: manifest.webmanifest", () => {
  const manifest = JSON.parse(readFileSync(path.join(publicDir, "manifest.webmanifest"), "utf8"));

  it("tem os campos obrigatórios para installability", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.display).toBe("standalone");
  });

  it("declara ícone 192 e 512 (any + maskable) e os arquivos existem", () => {
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
    manifest.icons.forEach((i) => {
      const file = path.join(publicDir, i.src.replace("./", ""));
      expect(existsSync(file)).toBe(true);
    });
  });

  it("cores batem com os tokens do app (tema #5a4be7)", () => {
    expect(manifest.theme_color.toLowerCase()).toBe("#5a4be7");
    expect(manifest.background_color.toLowerCase()).toBe("#f6f5f9");
  });

  // r10: atalhos do app (menu de pressão longa do ícone)
  it("r10: declara 3 shortcuts com ícone e url neutra /go/*", () => {
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts).toHaveLength(3);
    for (const sc of manifest.shortcuts) {
      expect(sc.name).toBeTruthy();
      expect(sc.url).toMatch(/^\.\/go\/[a-z]+$/); // rota neutra (resolve o cert)
      expect(sc.icons).toHaveLength(1);
      expect(sc.icons[0].sizes).toBe("96x96");
      const file = path.join(publicDir, sc.icons[0].src.replace("./", ""));
      expect(existsSync(file)).toBe(true);
    }
    // os 3 alvos existem como rotas no App (GO_TABS)
    const targets = manifest.shortcuts.map((sc) => sc.url.replace("./go/", ""));
    expect(targets).toEqual(expect.arrayContaining(["quiz", "flash", "stats"]));
  });
});

describe("r7: sw.js — sintaxe e conteúdo", () => {
  it("parseia sem erro (node --check)", () => {
    // execFileSync lança se o exit code != 0 (erro de sintaxe)
    expect(() =>
      execFileSync("node", ["--check", path.join(publicDir, "sw.js")], { stdio: "pipe" })
    ).not.toThrow();
  });

  it("estratégia: navegação network-first com fallback pro shell cacheado", () => {
    const sw = readFileSync(path.join(publicDir, "sw.js"), "utf8");
    expect(sw).toContain("networkFirstNavigation");
    expect(sw).toContain('req.mode === "navigate"');
    expect(sw).toContain("cacheFirst");
    // não intercepta nada fora do escopo do app (rotas do Next na :3000)
    expect(sw).toContain("url.href.startsWith(SCOPE.href)");
  });

  it("r8: resposta não-ok em navegação também cai pro shell (deep links)", () => {
    const sw = readFileSync(path.join(publicDir, "sw.js"), "utf8");
    // o bloco try trata 404 do servidor (deep link /synapse/ctfl/quiz não
    // existe como arquivo): sem "return fresh" incondicional ANTES do
    // fallback — fresh só retorna quando não há shell cacheado
    const fn = sw.slice(sw.indexOf("async function networkFirstNavigation"));
    expect(fn).toMatch(/if \(cached\) return cached;\n {4}return fresh;/);
  });

  it("versão do cache versionada (limpeza de caches antigos no activate)", () => {
    const sw = readFileSync(path.join(publicDir, "sw.js"), "utf8");
    // regex version-agnóstico: o bump de VERSION a cada deploy NÃO deve
    // exigir update neste teste (bug r9: bump r8→r9 quebrou o assert hardcoded)
    expect(sw).toMatch(/const VERSION = "r\d+-v\d+"/); // CACHE = synapse-<VERSION>
    expect(sw).toContain("keys.filter((k) => k !== CACHE)");
  });

  it("r8: update gentil — install NÃO chama skipWaiting; message listener pede", () => {
    const sw = readFileSync(path.join(publicDir, "sw.js"), "utf8");
    // o bloco install não pode puxar skipWaiting (o SW novo esperaria
    // a página aceitar no toast em vez de assumir no meio da sessão)
    const installBlock = sw.slice(
      sw.indexOf('addEventListener("install"'),
      sw.indexOf('addEventListener("message"')
    );
    expect(installBlock).not.toMatch(/\bskipWaiting\s*\(/);
    // o canal de ativação é a mensagem SKIP_WAITING do UpdateToast
    expect(sw).toContain('event.data.type === "SKIP_WAITING"');
    expect(sw).toMatch(/message[\s\S]*skipWaiting/);
  });

  it("r10: notificationclick foca janela existente ou abre nova (lembrete diário)", () => {
    const sw = readFileSync(path.join(publicDir, "sw.js"), "utf8");
    expect(sw).toContain('addEventListener("notificationclick"');
    // fecha a notificação antes de agir (UX padrão de plataforma)
    expect(sw).toContain("event.notification.close()");
    // foca cliente existente; sem janela, abre uma nova
    expect(sw).toContain("matchAll");
    expect(sw).toContain("client.focus()");
    expect(sw).toContain("openWindow");
    // o alvo do clique deriva de data.go (rota neutra /go/*)
    expect(sw).toContain("notification.data.go");
  });
});

describe("r8: splash screens iOS", () => {
  it("index.html declara os apple-touch-startup-image com media query", () => {
    const html = readFileSync(path.join(publicDir, "..", "index.html"), "utf8");
    const links = [
      ...html.matchAll(/<link rel="apple-touch-startup-image"[^>]*href="([^"]+)"[^>]*>/g),
    ];
    // r9: 8 claros + 8 escuros (pares por dispositivo); r11: +20 iPads
    // (5 tamanhos × portrait/landscape × claro/escuro) = 36
    expect(links.length).toBe(36);
    links.forEach((m) => {
      expect(m[0]).toMatch(/media="\(device-width:/); // cada um com media query
      const file = path.join(publicDir, m[1].replace("./", ""));
      expect(existsSync(file)).toBe(true);
    });
  });

  it("PNGs gerados existem em public/ (gen-splash.mjs)", () => {
    [
      "750x1334",
      "1125x2436",
      "1170x2532",
      "1179x2556",
      "1242x2688",
      "828x1792",
      "1284x2778",
      "1290x2796",
      // r11: iPads (@2x)
      "1536x2048",
      "1668x2224",
      "1668x2388",
      "2048x2732",
      "2064x2752",
    ].forEach((size) => {
      expect(existsSync(path.join(publicDir, `splash-${size}.png`))).toBe(true);
      expect(existsSync(path.join(publicDir, `splash-${size}-dark.png`))).toBe(true);
    });
  });

  it("r9: pares claro/escuro — cada device tem a variante -dark com prefers-color-scheme", () => {
    const html = readFileSync(path.join(publicDir, "..", "index.html"), "utf8");
    const darks = [
      ...html.matchAll(
        /<link rel="apple-touch-startup-image"[^>]*media="([^"]*)"[^>]*href="([^"]+)"[^>]*>/g
      ),
    ].filter((m) => m[2].includes("-dark"));
    // r9: 8 phones; r11: +10 iPads (5 tamanhos × portrait/landscape) = 18
    expect(darks.length).toBe(18);
    darks.forEach((m) => {
      expect(m[1]).toMatch(/prefers-color-scheme:\s*dark/); // media query casa só no dark
      expect(existsSync(path.join(publicDir, m[2].replace("./", "")))).toBe(true);
      // o par claro correspondente existe no mesmo index.html
      const lightHref = m[2].replace("-dark", "");
      expect(html).toContain(`href="${lightHref}"`);
    });
  });

  it("r11: iPads — landscape troca device-width/height (lado maior vira width)", () => {
    const html = readFileSync(path.join(publicDir, "..", "index.html"), "utf8");
    const links = [
      ...html.matchAll(
        /<link rel="apple-touch-startup-image"[^>]*media="([^"]*)"[^>]*href="([^"]+)"[^>]*>/g
      ),
    ].filter((m) => /orientation:\s*(portrait|landscape)/.test(m[1]));
    // 20 links de iPad: 5 tamanhos × 2 orientações × 2 temas
    expect(links.length).toBe(20);
    links.forEach((m) => {
      const q = m[1];
      const w = Number(q.match(/device-width:\s*(\d+)px/)?.[1]);
      const h = Number(q.match(/device-height:\s*(\d+)px/)?.[1]);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      const orient = q.match(/orientation:\s*(\w+)/)?.[1];
      if (orient === "landscape") {
        // em landscape o lado MAIOR é o device-width (template da Apple)
        expect(w).toBeGreaterThan(h);
      } else {
        expect(h).toBeGreaterThan(w);
      }
      // par claro/escuro do MESMO tamanho+orientação
      const pair = m[2].includes("-dark")
        ? m[2].replace("-dark", "")
        : m[2].replace(".png", "-dark.png");
      expect(html).toContain(`href="${pair}"`);
    });
  });
});

describe("r7: registerServiceWorker", () => {
  it("não registra fora de PRODUÇÃO (dev vite: cachearia HMR)", () => {
    const spy = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: spy },
      configurable: true,
      writable: true,
    });
    // import.meta.env.PROD é false em testes/dev por padrão
    expect(registerServiceWorker()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("em PRODUÇÃO registra no BASE_URL e engole erros de registro", async () => {
    vi.stubEnv("PROD", true);
    try {
      const register = vi.fn(() => Promise.reject(new Error("no secure context")));
      Object.defineProperty(navigator, "serviceWorker", {
        value: { register },
        configurable: true,
        writable: true,
      });
      expect(registerServiceWorker()).toBe(true);
      expect(register).toHaveBeenCalledWith(expect.stringMatching(/sw\.js$/));
      // rejeição da promise não vira unhandled rejection (catch interno)
      await new Promise((r) => setTimeout(r, 0));
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("sem navigator.serviceWorker (browser antigo) retorna false sem crash", () => {
    vi.stubEnv("PROD", true);
    try {
      const had = "serviceWorker" in navigator;
      if (had) delete navigator.serviceWorker;
      expect(registerServiceWorker()).toBe(false);
      if (had)
        Object.defineProperty(navigator, "serviceWorker", {
          value: {},
          configurable: true,
          writable: true,
        });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("r7: isRunningStandalone", () => {
  beforeEach(() => {
    // jsdom deste projeto não implementa matchMedia — stub manual
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });
  afterEach(() => {
    delete window.matchMedia;
    vi.restoreAllMocks();
  });

  it("false quando display-mode não é standalone e não é iOS standalone", () => {
    expect(isRunningStandalone()).toBe(false);
  });

  it("true quando display-mode: standalone (PWA instalada)", () => {
    window.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    expect(isRunningStandalone()).toBe(true);
  });

  it("sem matchMedia (ambiente exótico) não crasha", () => {
    const orig = window.matchMedia;
    window.matchMedia = undefined;
    try {
      expect(isRunningStandalone()).toBe(false);
    } finally {
      window.matchMedia = orig;
    }
  });
});

describe("r7: settings — installDismissed", () => {
  beforeEach(() => localStorage.clear());

  it("default não dispensado; dismiss grava e persiste", () => {
    expect(isInstallDismissed()).toBe(false);
    dismissInstall();
    expect(localStorage.getItem("synapse.installDismissed")).toBe("1");
    expect(isInstallDismissed()).toBe(true);
  });
});

describe("r7: absolutizePwaLinks — hrefs absolutos pós-pushState", () => {
  it("reescreve manifest e apple-touch-icon para o BASE_URL", () => {
    // simula o head do index.html buildado (hrefs relativos)
    const head = document.head;
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "./manifest.webmanifest";
    const icon = document.createElement("link");
    icon.rel = "apple-touch-icon";
    icon.href = "./icon-192.png";
    head.append(manifest, icon);

    try {
      absolutizePwaLinks();
      // BASE_URL em testes = "/"
      expect(manifest.getAttribute("href")).toBe("/manifest.webmanifest");
      expect(icon.getAttribute("href")).toBe("/icon-192.png");
    } finally {
      manifest.remove();
      icon.remove();
    }
  });

  it("r8: absolutiza também os apple-touch-startup-image (basename a basename)", () => {
    const head = document.head;
    const a = document.createElement("link");
    a.rel = "apple-touch-startup-image";
    a.href = "./splash-1170x2532.png";
    const b = document.createElement("link");
    b.rel = "apple-touch-startup-image";
    b.href = "./splash-1290x2796.png";
    head.append(a, b);
    try {
      absolutizePwaLinks();
      expect(a.getAttribute("href")).toBe("/splash-1170x2532.png");
      expect(b.getAttribute("href")).toBe("/splash-1290x2796.png");
    } finally {
      a.remove();
      b.remove();
    }
  });

  it("sem os links no head não crasha", () => {
    expect(() => absolutizePwaLinks()).not.toThrow();
  });
});

describe("r7: warmServiceWorkerCache — aquecimento na 1ª visita", () => {
  it("re-busca só os JS/CSS same-origin do escopo registrados no Resource Timing", async () => {
    const fetchSpy = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal("fetch", fetchSpy);
    // ATENÇÃO: serviceWorker.ready é uma PROPRIEDADE que devolve Promise
    // (não método) — mockar como função faz o await resolver no objeto
    // função e o guard reg.active devolver undefined silenciosamente.
    // controller já presente = página controlada (aquecimento imediato).
    Object.defineProperty(navigator, "serviceWorker", {
      value: { ready: Promise.resolve({ active: {} }), controller: {}, register: vi.fn() },
      configurable: true,
      writable: true,
    });
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { name: `${location.origin}/synapse/assets/index-ABC.js` }, // deve
      { name: `${location.origin}/synapse/assets/index-DEF.css` }, // deve
      { name: `${location.origin}/synapse/assets/ctfl-GHI.js` }, // deve (chunk lazy)
      { name: `https://fonts.gstatic.com/font.woff2` }, // cross-origin: não
      { name: `${location.origin}/synapse/manifest.webmanifest` }, // não é js/css: não
      // NOTA: em teste BASE_URL="/" (tudo same-origin entra no filtro);
      // no build publicado BASE_URL=/synapse/ filtra rotas fora do app
    ]);

    await warmServiceWorkerCache();

    const fetched = fetchSpy.mock.calls.map((c) => c[0]);
    expect(fetched).toContain(`${location.origin}/synapse/assets/index-ABC.js`);
    expect(fetched).toContain(`${location.origin}/synapse/assets/ctfl-GHI.js`);
    expect(fetched).not.toContain(`https://fonts.gstatic.com/font.woff2`);
    expect(fetched).not.toContain(`${location.origin}/synapse/manifest.webmanifest`);

    vi.unstubAllGlobals();
    delete navigator.serviceWorker;
  });

  it("sem serviceWorker no browser, não faz nada", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    delete navigator.serviceWorker;
    await warmServiceWorkerCache();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("espera o controllerchange antes de fetchar (corrida com clients.claim)", async () => {
    const fetchSpy = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal("fetch", fetchSpy);
    const listeners = {};
    const swMock = {
      ready: Promise.resolve({ active: {} }),
      controller: null, // ainda não controlado
      addEventListener: (ev, fn) => {
        (listeners[ev] ||= []).push(fn);
      },
      removeEventListener: (ev, fn) => {
        listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn);
      },
      register: vi.fn(),
    };
    Object.defineProperty(navigator, "serviceWorker", {
      value: swMock,
      configurable: true,
      writable: true,
    });
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { name: `${location.origin}/synapse/assets/index-ABC.js` },
    ]);

    let warmed = warmServiceWorkerCache();
    // cede a microtask do ready — sem controller ainda, nada é fetchado
    await Promise.resolve();
    await Promise.resolve();
    expect(fetchSpy).not.toHaveBeenCalled();

    // claim completa: página controlada → aquecimento prossegue
    swMock.controller = {};
    (listeners.controllerchange || []).forEach((fn) => fn());
    await warmed;
    expect(fetchSpy).toHaveBeenCalledWith(`${location.origin}/synapse/assets/index-ABC.js`);

    vi.unstubAllGlobals();
    delete navigator.serviceWorker;
  });
});

describe("r8: waitForServiceWorkerUpdate — fluxo de atualização gentil", () => {
  function fakeSW({ state = "installing" } = {}) {
    const listeners = {};
    return {
      state,
      listeners,
      addEventListener: (ev, fn) => {
        (listeners[ev] ||= []).push(fn);
      },
      removeEventListener: (ev, fn) => {
        listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn);
      },
    };
  }

  afterEach(() => {
    delete navigator.serviceWorker;
    vi.unstubAllEnvs();
  });

  it("fora de PRODUÇÃO é no-op (nunca registra; dev não tem update flow)", () => {
    const register = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register, controller: {} },
      configurable: true,
      writable: true,
    });
    const cleanup = waitForServiceWorkerUpdate(vi.fn());
    expect(register).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });

  it("em PROD: updatefound → installed com controller chama onUpdate(reg)", async () => {
    vi.stubEnv("PROD", true);
    const worker = fakeSW({ state: "installing" });
    const reg = {
      installing: worker,
      waiting: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const register = vi.fn(() => Promise.resolve(reg));
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register, controller: {} }, // controller ⇒ já controlado ⇒ é update
      configurable: true,
      writable: true,
    });
    const onUpdate = vi.fn();
    waitForServiceWorkerUpdate(onUpdate);
    await new Promise((r) => setTimeout(r, 0)); // register().then

    // instalação termina → statechange "installed"
    worker.state = "installed";
    (worker.listeners.statechange || []).forEach((fn) => fn());
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(reg);
  });

  it("não dispara onUpdate quando NÃO há controller (1ª instalação)", async () => {
    vi.stubEnv("PROD", true);
    const worker = fakeSW({ state: "installing" });
    const reg = { installing: worker, waiting: null, addEventListener: vi.fn() };
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: () => Promise.resolve(reg), controller: null },
      configurable: true,
      writable: true,
    });
    const onUpdate = vi.fn();
    waitForServiceWorkerUpdate(onUpdate);
    await new Promise((r) => setTimeout(r, 0));
    worker.state = "installed";
    (worker.listeners.statechange || []).forEach((fn) => fn());
    expect(onUpdate).not.toHaveBeenCalled(); // primeira instalação ≠ update
  });

  it("cleanup remove os listeners (efeito desmonta sem vazar)", async () => {
    vi.stubEnv("PROD", true);
    const worker = fakeSW({ state: "installing" });
    const reg = {
      installing: worker,
      waiting: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: () => Promise.resolve(reg), controller: {} },
      configurable: true,
      writable: true,
    });
    const cleanup = waitForServiceWorkerUpdate(vi.fn());
    await new Promise((r) => setTimeout(r, 0));
    cleanup();
    expect(worker.listeners.statechange.length).toBe(0);
    // update tardio não vaza callback do componente desmontado
    worker.state = "installed";
    (worker.listeners.statechange || []).forEach((fn) => fn());
  });
});

describe("r8: applyServiceWorkerUpdate — SKIP_WAITING + reload único", () => {
  afterEach(() => {
    delete navigator.serviceWorker;
    vi.unstubAllGlobals();
  });

  it("posta SKIP_WAITING pro waiting e recarrega no controllerchange (uma vez)", () => {
    const listeners = {};
    const postMessage = vi.fn();
    const reload = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        addEventListener: (ev, fn) => {
          (listeners[ev] ||= []).push(fn);
        },
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });
    vi.stubGlobal("location", { ...window.location, reload });
    applyServiceWorkerUpdate({ waiting: { postMessage } });

    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    expect(reload).not.toHaveBeenCalled(); // ainda não assumiu
    (listeners.controllerchange || []).forEach((fn) => fn());
    (listeners.controllerchange || []).forEach((fn) => fn()); // segundo evento
    expect(reload).toHaveBeenCalledTimes(1); // reload idempotente
  });

  it("sem serviceWorker não crasha (browser antigo)", () => {
    delete navigator.serviceWorker;
    expect(() => applyServiceWorkerUpdate({})).not.toThrow();
  });
});
