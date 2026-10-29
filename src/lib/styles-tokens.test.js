// Guarda do design system de paletas por certificação (Caderno / Synapse 4.1).
// Verifica:
// 1. Definições de tokens de cada certificação (--cert-{cert}, --cert-{cert}-ink, --cert-{cert}-soft)
// 2. Mapeamento de contexto [data-cert="..."] em styles.css
// 3. Contraste WCAG AA para os tokens nos pares claro e escuro.

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

const CERTS = ["ctfl", "ctal-ta", "ctal-tm", "ct-ai", "ctal-at", "ctfl-at"];

describe("tokens de certificação no Caderno design system", () => {
  it("cada cert tem variáveis --cert-*, --cert-*-ink e --cert-*-soft declaradas", () => {
    for (const cert of CERTS) {
      expect(css.includes(`--cert-${cert}:`), `Falta --cert-${cert}`).toBe(true);
      expect(css.includes(`--cert-${cert}-ink:`), `Falta --cert-${cert}-ink`).toBe(true);
      expect(css.includes(`--cert-${cert}-soft:`), `Falta --cert-${cert}-soft`).toBe(true);
    }
  });

  it("body[data-cert] liga a cor da prova ativa a --accent", () => {
    expect(css.includes("body[data-cert]")).toBe(true);
    expect(css.includes("--accent: var(--cert);") || css.includes("--accent:var(--cert);")).toBe(
      true
    );
  });

  it("cada cert possui bloco [data-cert=...] mapeando suas variáveis", () => {
    for (const cert of CERTS) {
      expect(css.includes(`[data-cert="${cert}"]`), `Falta seletor [data-cert="${cert}"]`).toBe(
        true
      );
    }
  });

  it("tokens dark de certs live passam contraste contra fundo escuro", () => {
    // Extrai valores dark
    const darkSection = css.slice(css.indexOf('[data-theme="dark"]'));
    const ctflMatch = darkSection.match(/--cert-ctfl:\s*(#[0-9a-f]{6})/i);
    expect(ctflMatch).not.toBeNull();
    const ctflDark = ctflMatch[1];
    // Contraste contra o fundo escuro #0f0e16
    expect(contrast(ctflDark, "#0f0e16")).toBeGreaterThan(4.5);
  });

  it("tokens claros de CTAL-TA passam WCAG AA", () => {
    const taMatch = css.match(/--cert-ctal-ta:\s*(#[0-9a-f]{6})/i);
    expect(taMatch).not.toBeNull();
    // Contra fundo claro #f6f5f9
    expect(contrast(taMatch[1], "#ffffff")).toBeGreaterThan(4.0);
  });
});
