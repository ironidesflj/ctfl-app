import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildManifest } from "./lib/axon-manifest.mjs";

// Prévia do manifesto Axon usado para validar o banco canônico no CI.
// A regra de montagem e as validações ficam em scripts/lib/axon-manifest.mjs
// (mesmo núcleo do gerador que publica public/manifest.jsonl); aqui só
// escrevemos a prévia em diretório temporário para inspeção/artefato de CI.
const bankDir = process.argv[2];
if (!bankDir) throw new Error("Usage: node scripts/preview-axon-manifest.mjs <canonical-bank-dir>");

const { jsonl, counts, heldCount, total } = buildManifest({ bankDir: path.resolve(bankDir) });

const previewDir = fs.mkdtempSync(
  path.join(process.env.RUNNER_TEMP || os.tmpdir(), "synapse-axon-preview-")
);
const manifestPath = path.join(previewDir, "manifest.jsonl");
fs.writeFileSync(manifestPath, jsonl, "utf8");
console.log(
  `Axon preview valid: ${total} study records (${Object.entries(counts)
    .map(([exam, count]) => `${exam} ${count}`)
    .join(", ")}); held ${heldCount}; ${manifestPath}`
);
