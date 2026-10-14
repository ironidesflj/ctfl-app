/* r8 — Gera as apple-touch-startup-image (splash screens iOS).
 *
 * O manifest cobre Android/desktop; iOS usa <link rel="apple-touch-startup-image">
 * com media queries por dispositivo. Este script compõe o logo
 * (icon-source.svg) sobre o background do app (#f6f5f9, mesmo do manifest
 * background_color) centralizado no centro óptico (levemente acima do
 * centro geométrico).
 *
 * r9 — Também gera a variante ESCURA (splash-{w}x{h}-dark.png, bg #0f0e16
 * = token --bg do tema escuro); o index.html casa cada par via
 * (prefers-color-scheme: dark) na media query. Sem isso, quem usa o app
 * em dark mode via um flash branco de ~1s na abertura (standalone iOS).
 *
 * r11 — iPads (@2x): 5 tamanhos de ponta. A composição é centralizada, então
 * o MESMO PNG serve portrait e landscape; a distinção é só da media query
 * (que troca device-width/height entre orientações — ver index.html).
 *
 * Uso: node scripts/gen-splash.mjs   (a partir de app-e2e/ ou app-full/)
 * Idempotente: sobrescreve os PNGs em public/. Não requer rede.
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

// (arquivo, largura, altura) — pares aparelho (CSS px) × pixel ratio.
// Mesmos tamanhos/queries do bloco apple-touch-startup-image do index.html;
// manter as duas listas em sync ao adicionar aparelho.
const DEVICES = [
  { file: "splash-750x1334.png", w: 750, h: 1334 }, // 375×667 @2x  (8/SE)
  { file: "splash-1125x2436.png", w: 1125, h: 2436 }, // 375×812 @3x  (X/11 Pro)
  { file: "splash-1170x2532.png", w: 1170, h: 2532 }, // 390×844 @3x  (12/13/14)
  { file: "splash-1179x2556.png", w: 1179, h: 2556 }, // 393×852 @3x  (14/15 Pro)
  { file: "splash-1242x2688.png", w: 1242, h: 2688 }, // 414×896 @3x  (XS Max/11 Pro Max)
  { file: "splash-828x1792.png", w: 828, h: 1792 }, // 414×896 @2x  (XR/11)
  { file: "splash-1284x2778.png", w: 1284, h: 2778 }, // 428×926 @3x  (12/13 Pro Max)
  { file: "splash-1290x2796.png", w: 1290, h: 2796 }, // 430×932 @3x  (14/15 Plus · Pro Max)
  // r11: iPads (todos @2x) — mesma lista/queries do index.html; manter em sync.
  { file: "splash-1536x2048.png", w: 1536, h: 2048 }, // 768×1024 @2x  (mini/Air)
  { file: "splash-1668x2224.png", w: 1668, h: 2224 }, // 834×1112 @2x  (Pro 10.5)
  { file: "splash-1668x2388.png", w: 1668, h: 2388 }, // 834×1194 @2x  (Pro 11)
  { file: "splash-2048x2732.png", w: 2048, h: 2732 }, // 1024×1366 @2x (Pro 12.9)
  { file: "splash-2064x2752.png", w: 2064, h: 2752 }, // 1032×1376 @2x (Pro 13 M4)
];

const THEMES = [
  { suffix: "", bg: "#f6f5f9" }, // claro — token --bg = manifest background_color
  { suffix: "-dark", bg: "#0f0e16" }, // escuro — token --bg do [data-theme=dark]
];

const logoSvg = await readFile(join(publicDir, "icon-source.svg"));

await mkdir(publicDir, { recursive: true });

for (const { file, w, h } of DEVICES) {
  // logo em ~35% da menor dimensão, centro óptico (42% da altura)
  const size = Math.round(Math.min(w, h) * 0.35);
  const x = Math.round((w - size) / 2);
  const y = Math.round(h * 0.42 - size / 2);
  const logoPng = await sharp(logoSvg).resize(size, size).png().toBuffer();
  for (const { suffix, bg } of THEMES) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <image x="${x}" y="${y}" width="${size}" height="${size}"
         href="data:image/png;base64,${logoPng.toString("base64")}"/>
</svg>`;
    const out = file.replace(/\.png$/, `${suffix}.png`);
    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
    await writeFile(join(publicDir, out), png);
    console.log(`${out} ${w}x${h} ${(png.length / 1024).toFixed(1)}KB`);
  }
}
console.log("splash screens OK (claro + escuro)");
// r11: 8 phones + 5 iPads, × 2 temas = 26 PNGs
