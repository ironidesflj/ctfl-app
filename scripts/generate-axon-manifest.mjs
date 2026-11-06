#!/usr/bin/env node
// Publica o manifesto Axon do Synapse em `public/manifest.jsonl` (decisão D4).
//
// Uso:
//   node scripts/generate-axon-manifest.mjs <banco-canônico>   # gera o arquivo
//   node scripts/generate-axon-manifest.mjs <banco> --check    # gera em memória e
//                                                              # compara com o commitado
//   node scripts/generate-axon-manifest.mjs --validate         # valida o arquivo
//                                                              # commitado (sem banco)
//
// `--out <arquivo>` troca o destino. `AXON_BANK_DIR` substitui o argumento
// posicional. O banco canônico é o checkout de ctfl-question-bank-ptbr (onde
// vivem `synapse-question-bank.json` e `axon/*-reference-candidates.json`).
//
// O arquivo commitado É o artefato publicado pela Vercel (o Vite copia
// `public/` para `dist/`). Por isso `--check` e `--validate` existem: o CI
// regenera a partir do banco canônico e reprova se o commitado divergir ou se
// o SHA não bater com o hub.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  MANIFEST_FILE,
  RESERVED_STUDY_IDS,
  appRoot,
  buildManifest,
  validateManifestJsonl,
} from "./lib/axon-manifest.mjs";

const USAGE = `uso:
  node scripts/generate-axon-manifest.mjs <banco-canônico> [--out <arquivo>]  # gera
  node scripts/generate-axon-manifest.mjs <banco-canônico> --check            # compara com o commitado
  node scripts/generate-axon-manifest.mjs --validate                          # valida o commitado`;

function parseArgs(argv) {
  const args = {
    bankDir: process.env.AXON_BANK_DIR ?? null,
    out: MANIFEST_FILE,
    check: false,
    validate: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--check") args.check = true;
    else if (arg === "--validate") args.validate = true;
    else if (arg === "--out") {
      i += 1;
      if (!argv[i]) throw new Error("--out exige um caminho");
      args.out = argv[i];
    } else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg.startsWith("--")) throw new Error(`flag desconhecida: ${arg}`);
    else if (args.bankDir) throw new Error(`argumento posicional duplicado: ${arg}`);
    else args.bankDir = arg;
  }
  return args;
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function describe(counts) {
  return Object.entries(counts)
    .map(([exam, count]) => `${exam} ${count}`)
    .join(", ");
}

function reportDiff(expected, actual) {
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

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`erro: ${error.message}\n\n${USAGE}`);
    process.exit(2);
  }
  if (args.help) {
    console.log(USAGE);
    return;
  }

  const root = appRoot();
  const outPath = path.resolve(root, args.out);

  if (args.validate) {
    if (!fs.existsSync(outPath)) {
      console.error(`erro: ${args.out} não existe — o manifesto é publicado junto do build`);
      process.exit(1);
    }
    const text = fs.readFileSync(outPath, "utf8");
    try {
      const { counts, total } = validateManifestJsonl(text);
      console.log(
        `manifesto válido: ${total} linhas (${describe(counts)}); sha256 ${sha256(text)}`
      );
    } catch (error) {
      console.error(`erro: manifesto inválido (${args.out}): ${error.message}`);
      process.exit(1);
    }
    return;
  }

  if (!args.bankDir) {
    console.error(`erro: informe o diretório do banco canônico\n\n${USAGE}`);
    process.exit(2);
  }

  let built;
  try {
    built = buildManifest({ bankDir: path.resolve(args.bankDir), appRoot: root });
  } catch (error) {
    console.error(`erro ao montar o manifesto: ${error.message}`);
    process.exit(1);
  }

  const digest = sha256(built.jsonl);
  const summary = `${built.total} linhas (${describe(built.counts)}); sha256 ${digest}`;

  if (args.check) {
    if (!fs.existsSync(outPath)) {
      console.error(`erro: ${args.out} não existe (${summary})`);
      process.exit(1);
    }
    const committed = fs.readFileSync(outPath, "utf8");
    if (committed === built.jsonl) {
      console.log(`ok: ${args.out} idêntico ao gerado do banco canônico — ${summary}`);
      return;
    }
    const diff = reportDiff(built.jsonl, committed);
    console.error(
      `erro: ${args.out} divergente do banco canônico — ${summary}.\n` +
        (diff
          ? `primeira diferença na linha ${diff.line}:\n  gerado:  ${diff.expected.slice(0, 160)}\n  commitado: ${diff.actual.slice(0, 160)}`
          : "arquivos com o mesmo conteúdo lógico, mas com bytes diferentes")
    );
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, built.jsonl, "utf8");
  console.log(
    `ok: ${path.relative(root, outPath)} gerado — ${summary}; ids reservados ${RESERVED_STUDY_IDS}, retidos ${built.heldCount}`
  );
}

main();
