import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { computeChecksum, parseManifest, verifyChecksum } from "@ironidesflj/axon";

const bankDir = process.argv[2];
if (!bankDir) throw new Error("Usage: node scripts/preview-axon-manifest.mjs <canonical-bank-dir>");

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(bankDir, name), "utf8"));
const ledger = readJson("axon/ctfl-public-ids.json");
const review = readJson("axon/ctfl-reference-candidates.json");
const bank = readJson("synapse-question-bank.json");
const questions = new Map(bank.questions.map((question) => [question.id, question]));
const mappings = new Map(ledger.mappings.map((mapping) => [mapping.publicId, mapping]));

if (review.records.length !== ledger.mappings.length) {
  throw new Error("Reference review must explicitly cover every reserved ID");
}
const candidates = review.records.filter((item) => item.state === "candidate");
const held = review.records.filter((item) => item.state === "held");
if (
  candidates.length !== 48 ||
  held.length !== 2 ||
  candidates.length + held.length !== review.records.length
) {
  throw new Error("Expected 48 candidates and exactly 2 explicitly held IDs");
}

const records = candidates.map((item) => {
  const mapping = mappings.get(item.publicId);
  const question = questions.get(item.internalId);
  if (!mapping || mapping.internalId !== item.internalId)
    throw new Error(`ID mapping mismatch: ${item.publicId}`);
  if (!question || question.cert !== "CTFL" || question.pool !== "study") {
    throw new Error(`Not an eligible CTFL study question: ${item.internalId}`);
  }
  const referenceHost = new URL(item.reference).hostname;
  if (
    !["istqb.org", "www.istqb.org", "glossary.istqb.org"].includes(referenceHost) ||
    !item.referenceTitle
  ) {
    throw new Error(`Reference missing: ${item.publicId}`);
  }

  const source = question.locales.pt;
  if (!source?.q || !Array.isArray(source.options) || source.options.length !== 4) {
    throw new Error(`Invalid PT-BR question: ${item.internalId}`);
  }
  if (
    !Number.isInteger(question.answer) ||
    question.answer < 0 ||
    question.answer >= source.options.length
  ) {
    throw new Error(`Invalid answer index: ${item.internalId}`);
  }

  const snapshot = {
    statement: source.q,
    options: source.options,
    answer: String.fromCharCode(65 + question.answer),
    reference: item.reference,
    referenceTitle: item.referenceTitle,
  };
  return {
    id: item.publicId,
    exam: "CTFL",
    topics: [question.domain],
    difficulty: "unrated",
    lang: "pt-BR",
    version: 1,
    checksum: computeChecksum(snapshot),
    aliases: [],
    snapshot,
  };
});

const jsonl = `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
const parsed = parseManifest(jsonl);
if (parsed.rejected.length || parsed.ok.length !== records.length) {
  throw new Error(`Axon rejected manifest lines: ${JSON.stringify(parsed.rejected)}`);
}
if (parsed.ok.some((record) => !verifyChecksum(record))) {
  throw new Error("Checksum validation failed");
}
if (new Set(parsed.ok.map((record) => record.id)).size !== records.length) {
  throw new Error("Duplicate public IDs in preview");
}

const previewDir = fs.mkdtempSync(
  path.join(process.env.RUNNER_TEMP || os.tmpdir(), "synapse-axon-preview-")
);
const manifestPath = path.join(previewDir, "manifest.jsonl");
fs.writeFileSync(manifestPath, jsonl, "utf8");
console.log(
  `Axon preview valid: ${records.length} CTFL study records; held ${held.length}; ${manifestPath}`
);
