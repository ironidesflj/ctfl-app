#!/usr/bin/env node
// Paridade de publicação do manifesto Axon (decisão D4): o SHA-256 do
// `/manifest.jsonl` do app precisa ser IGUAL ao da cópia pública do hub
// (`https://noos.study/manifestos/SYN.jsonl`). O app é o emissor; o hub
// ingere e republica o mesmo arquivo — divergência significa que o app mudou
// o conteúdo sem o hub ingerir (ou o contrário), e o contrato público está
// quebrado.
//
// Uso:
//   node scripts/check-axon-manifest-parity.mjs [--local <arquivo>] [--hub <url>]
//
// URL do hub: `--hub`, ou AXON_HUB_MANIFEST_URL, ou o padrão abaixo.
// Saída: 0 = paridade; 1 = divergência; 2 = erro de ambiente (arquivo/rede).
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const DEFAULT_HUB_URL = "https://noos.study/manifestos/SYN.jsonl";
const DEFAULT_LOCAL = "public/manifest.jsonl";
const FETCH_TIMEOUT_MS = 20_000;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { local: DEFAULT_LOCAL, hub: process.env.AXON_HUB_MANIFEST_URL ?? DEFAULT_HUB_URL };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--local") {
      i += 1;
      if (!argv[i]) throw new Error("--local exige um caminho");
      args.local = argv[i];
    } else if (arg === "--hub") {
      i += 1;
      if (!argv[i]) throw new Error("--hub exige uma URL");
      args.hub = argv[i];
    } else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`argumento desconhecido: ${arg}`);
  }
  return args;
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function firstDiff(expected, actual) {
  const expectedLines = expected.slice(0, -1).split("\n");
  const actualLines = actual.slice(0, -1).split("\n");
  const total = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < total; i += 1) {
    if (expectedLines[i] !== actualLines[i]) {
      return {
        line: i + 1,
        expected: expectedLines[i] ?? "(ausente)",
        actual: actualLines[i] ?? "(ausente)",
      };
    }
  }
  return null;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`erro: ${error.message}`);
    process.exit(2);
  }
  if (args.help) {
    console.log(
      "uso: node scripts/check-axon-manifest-parity.mjs [--local <arquivo>] [--hub <url>]"
    );
    return;
  }

  const localPath = path.resolve(root, args.local);
  if (!fs.existsSync(localPath)) {
    console.error(`erro: manifesto local não encontrado: ${args.local}`);
    process.exit(2);
  }
  const local = fs.readFileSync(localPath, "utf8");
  const localSha = sha256(local);
  const localLines = local.endsWith("\n")
    ? local.slice(0, -1).split("\n").length
    : local.split("\n").length;

  let hub;
  try {
    const response = await fetch(args.hub, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "application/x-ndjson, application/octet-stream, */*" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    hub = await response.text();
  } catch (error) {
    console.error(
      `erro: não foi possível baixar o manifesto do hub (${args.hub}): ${error.message}.\n` +
        "A paridade não pôde ser verificada — trate como falha de ambiente, não como divergência de conteúdo."
    );
    process.exit(2);
  }

  const hubSha = sha256(hub);
  const hubLines = hub.endsWith("\n")
    ? hub.slice(0, -1).split("\n").length
    : hub.split("\n").length;

  if (localSha === hubSha) {
    console.log(`ok: paridade de manifesto — sha256 ${localSha} (${localLines} linhas) app = hub`);
    console.log(`hub: ${args.hub}`);
    return;
  }

  const diff = firstDiff(hub, local);
  console.error("erro: DIVERGÊNCIA entre o manifesto do app e o hub.");
  console.error(`  app: ${args.local} → sha256 ${localSha} (${localLines} linhas)`);
  console.error(`  hub: ${args.hub} → sha256 ${hubSha} (${hubLines} linhas)`);
  if (diff) {
    console.error(`  primeira diferença na linha ${diff.line}:`);
    console.error(`    hub: ${diff.expected.slice(0, 160)}`);
    console.error(`    app: ${diff.actual.slice(0, 160)}`);
  }
  console.error(
    "O app é o emissor do contrato: o hub precisa ingerir o manifesto gerado por este app " +
      "antes de o PR ser considerado publicado. Não altere o conteúdo para forçar igualdade."
  );
  process.exit(1);
}

main();
