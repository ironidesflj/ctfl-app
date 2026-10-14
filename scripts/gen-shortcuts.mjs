/* r10 — Gera os ícones dos atalhos do PWA (manifest shortcuts).
 *
 * Os shortcuts do manifest aparecem no menu de pressão longa/ícone do app
 * instalado (Android/desktop). Cada um precisa de um ícone 96x96. Aqui
 * compomos o logo (icon-source.svg) ~62% sobre um quadrado arredondado
 * colorido por atalho — cores derivadas dos tokens do tema (accent para
 * o principal, variações pra distinguir em silhueta pequena).
 *
 * Uso: node scripts/gen-shortcuts.mjs   (a partir de app-e2e/ ou app-full/)
 * Idempotente: sobrescreve os PNGs em public/. Não requer rede.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

// (arquivo, bg, nome) — "name" é só log; o manifest tem as labels i18n.
// Cores: accent #5a4be7 (quiz — ação principal), verde ok (flashcards —
// memorização), âmbar (stats — métrica/atenção).
const SHORTCUTS = [
  { file: "shortcut-quiz.png", bg: "#5a4be7" },
  { file: "shortcut-flash.png", bg: "#0a6e4a" },
  { file: "shortcut-stats.png", bg: "#b98514" },
];

const logoSvg = await readFile(join(publicDir, "icon-source.svg"));

for (const { file, bg } of SHORTCUTS) {
  const size = 96;
  const logo = Math.round(size * 0.62);
  const xy = Math.round((size - logo) / 2);
  const logoPng = await sharp(logoSvg).resize(logo, logo).png().toBuffer();
  // fundo branco sob o logo: o brand mark é violeta, não contrasta no accent
  const pad = Math.round(size * 0.18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="100%" height="100%" rx="${Math.round(size * 0.22)}" fill="${bg}"/>
  <rect x="${pad}" y="${pad}" width="${size - 2 * pad}" height="${size - 2 * pad}" rx="${Math.round(size * 0.1)}" fill="#ffffff"/>
  <image x="${xy}" y="${xy}" width="${logo}" height="${logo}"
         href="data:image/png;base64,${logoPng.toString("base64")}"/>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(join(publicDir, file), png);
  console.log(`${file} 96x96 ${(png.length / 1024).toFixed(1)}KB`);
}
console.log("shortcut icons OK");
