#!/usr/bin/env node
// Gera as fatias derivadas de estudo/simulado a partir do monólito sincronizado.
// Uso:
//   node scripts/generate-study-slices.mjs          # escreve src/synapse/data/banks/*.json
//   node scripts/generate-study-slices.mjs --check  # compara com o commitado (exit 1 se divergir)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildStudySlices } from "./lib/study-slices.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const monolithPath = path.join(root, "src/data/synapse-question-bank.json");
const outDir = path.join(root, "src/synapse/data/banks");
const CHECK = process.argv.includes("--check");

const bank = JSON.parse(readFileSync(monolithPath, "utf8"));
const slices = buildStudySlices(bank);
mkdirSync(outDir, { recursive: true });

let failures = 0;
for (const [name, data] of Object.entries(slices)) {
  const file = path.join(outDir, name);
  const serialized = JSON.stringify(data, null, 2) + "\n";
  if (CHECK) {
    let current = null;
    try {
      current = readFileSync(file, "utf8");
    } catch {
      current = null;
    }
    if (current !== serialized) {
      console.error(`FAIL ${name}: fatia commitada difere do gerado`);
      failures++;
    } else {
      console.log(`ok ${name}`);
    }
  } else {
    writeFileSync(file, serialized);
    const n = Object.values(data).reduce((acc, list) => acc + list.length, 0);
    console.log(`${name}: ${n} questões`);
  }
}
if (CHECK && failures > 0) process.exit(1);
