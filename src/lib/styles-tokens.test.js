// r18 (v3.16.0) — guarda do design system de paletas por certificação.
// A feature "paleta por cert" (dívida r14) aplica --cert-accent nos pontos
// de identidade da UI (tabs, CTA primário, chips, barras). A régua aqui é
// tripla: (1) os seletores de identidade REALMENTE usam os tokens de cert
// (não o --accent global — senão a feature regrediu silenciosamente);
// (2) os tokens passam WCAG AA nos pares que o CSS monta — fundo cheio com
// texto branco (tab/botão primário/mast-mark) e texto sobre fundo soft
// (chips/domain-weight) — com a fórmula oficial (relative luminance), não
// hardcode; e (3) as DUAS camadas de tema escuro (auto via prefers-color-
// scheme e forçado via data-theme) ficam consistentes entre si.
//
// Escopo de contraste: certs LIVE exigem AA 4.5:1 (texto normal sobre os
// fundos que o app monta hoje). Certs coming-soon exigem 3:1 (AA de UI
// components) — a promoção a live exige escurecer o accent até 4.5 (dívida
// explícita, não silenciosa).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "styles.css"), "utf8");

// ---------- helpers: WCAG ----------
function hexToRgb(hex) {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) throw new Error(`hex inválido: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------- helpers: parse por camada ----------
// O arquivo tem 3 camadas de tokens por cert, NESTA ordem:
//   claro:  [data-cert="x"] { … }
//   dark-auto: @media (prefers-color-scheme: dark) { [data-cert="x"] { … } }
//   dark-forçado: [data-theme="dark"][data-cert="x"] { … }
function parseBlocks(section, attr = "data-cert") {
  const tokens = {};
  const re = new RegExp(`\\[${attr}="([a-z0-9-]+)"\\]\\s*\\{([^}]*)\\}`, "g");
  let m;
  while ((m = re.exec(section))) {
    const decls = {};
    for (const line of m[2].split(";")) {
      const d = line.match(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/i);
      if (d) decls[d[1]] = d[2];
    }
    (tokens[m[1]] = tokens[m[1]] || []).push(decls);
  }
  return tokens;
}

// As seções de tokens têm âncoras de comentário próprias (o @media dark do
// TEMA GLOBAL aparece muito antes no arquivo — não serve de fronteira).
const lightStart = css.indexOf("tema claro (padrão");
const darkAutoStart = css.indexOf("tema escuro (prefers-color-scheme: dark)");
const forcedStart = css.indexOf("tema escuro forçado");
const lightTokens = parseBlocks(css.slice(lightStart, darkAutoStart));
// dark-auto: blocos [data-cert] entre os comentários de seção
const darkAutoTokens = parseBlocks(css.slice(darkAutoStart, forcedStart));
// dark-forçado: blocos [data-theme="dark"][data-cert] (attr composto → parse direto)
const forcedTokens = {};
{
  const re = /\[data-theme="dark"\]\[data-cert="([a-z0-9-]+)"\]\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const decls = {};
    for (const line of m[2].split(";")) {
      const d = line.match(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/i);
      if (d) decls[d[1]] = d[2];
    }
    forcedTokens[m[1]] = decls;
  }
}

const ON_ACCENT = { light: "#ffffff", dark: "#14121f" };
// r19: ctal-tm promovido a live — a paleta plum #7d3a72 já passava de 4.5:1
// (7.7:1 claro / 5.0:1 dark), então a promoção não exigiu escurecimento.
const LIVE_CERTS = ["ctfl", "ctal-ta", "ctal-tm"];
const ALL_CERTS = ["ctfl", "ctfl-at", "ctal-ta", "ctal-tm", "ct-ai", "ctal-at-v2"];

describe("r18: seletores de identidade usam os tokens de cert", () => {
  // TODOS os blocos de um seletor (o .cert-indicator aparece também no
  // media query mobile — o assert é "o bloco principal existe", i.e. ALGUM
  // bloco contém a declaração de identidade)
  function blocksOf(sel) {
    const out = [];
    const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}", "g");
    let m;
    while ((m = re.exec(css))) out.push(m[1]);
    return out;
  }
  const SELECTORS = [
    [".tab.active", "background: var(--cert-accent)"],
    [".btn.primary", "background: var(--cert-accent)"],
    [".progress-fill", "background: var(--cert-accent)"],
    [".chip.on", "background: var(--cert-accent-soft)"],
    [".mode-btn.active", "border-color: var(--cert-accent)"],
    [".domain-card.selected", "border-color: var(--cert-accent)"],
    [".mast-mark", "background: var(--cert-accent)"],
    [".cert-indicator", "background: var(--cert-accent-soft)"],
  ];
  it.each(SELECTORS)("%s mantém %s (não regrediu p/ --accent global)", (sel, decl) => {
    const blocks = blocksOf(sel);
    expect(blocks.length, `bloco de ${sel} não encontrado`).toBeGreaterThan(0);
    expect(
      blocks.some((b) => b.includes(decl)),
      `${sel} deve ter um bloco com ${decl}`
    ).toBe(true);
    // o bloco PRINCIPAL (o que tem a declaração) não pode misturar accent global
    const main = blocks.find((b) => b.includes(decl));
    expect(main).not.toContain(decl.replace("--cert-accent", "--accent"));
  });

  it(":root define o fallback --cert-accent (tela /select mantém identidade global)", () => {
    expect(css).toMatch(/--cert-accent:\s*var\(--accent\)/);
  });
});

describe("r18: tokens por cert — completos, WCAG AA e camadas consistentes", () => {
  it("todo cert do catálogo tem os 3 tokens nas 3 camadas (claro/dark-auto/dark-forçado)", () => {
    for (const cert of ALL_CERTS) {
      for (const tok of ["cert-accent", "cert-accent-soft", "cert-accent-text"]) {
        expect(lightTokens[cert]?.[0]?.[tok], `${cert} claro ${tok}`).toBeDefined();
        expect(darkAutoTokens[cert]?.[0]?.[tok], `${cert} dark-auto ${tok}`).toBeDefined();
        expect(forcedTokens[cert]?.[tok], `${cert} dark-forçado ${tok}`).toBeDefined();
      }
    }
  });

  it("dark-forçado é IDÊNTICO ao dark-auto (uma decisão, duas camadas)", () => {
    for (const cert of ALL_CERTS) {
      expect(forcedTokens[cert]).toEqual(darkAutoTokens[cert][0]);
    }
  });

  it.each(LIVE_CERTS)("LIVE %s claro: accent×branco ≥ 4.5 e text×soft ≥ 4.5 (AA)", (cert) => {
    const t = lightTokens[cert][0];
    expect(contrast(t["cert-accent"], ON_ACCENT.light)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["cert-accent-text"], t["cert-accent-soft"])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(LIVE_CERTS)("LIVE %s dark: accent×tinta escura ≥ 4.5 e text×soft ≥ 4.5 (AA)", (cert) => {
    const d = darkAutoTokens[cert][0];
    expect(contrast(d["cert-accent"], ON_ACCENT.dark)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(d["cert-accent-text"], d["cert-accent-soft"])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["ctfl-at", "ct-ai", "ctal-at-v2"])(
    "coming-soon %s claro: accent×branco ≥ 3.0 (AA UI); promoção a live exige escurecer até 4.5",
    (cert) => {
      const t = lightTokens[cert][0];
      expect(contrast(t["cert-accent"], ON_ACCENT.light)).toBeGreaterThanOrEqual(3);
      expect(contrast(t["cert-accent-text"], t["cert-accent-soft"])).toBeGreaterThanOrEqual(4.5);
    }
  );

  it("CTAL-TA claro escureceu p/ AA (teal #0c7c78 — era #0f8a86 a 4.2:1)", () => {
    expect(lightTokens["ctal-ta"][0]["cert-accent"].toLowerCase()).toBe("#0c7c78");
  });
});
