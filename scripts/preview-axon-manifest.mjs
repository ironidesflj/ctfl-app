import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { computeChecksum, parseManifest, verifyChecksum } from "@ironidesflj/axon";

const bankDir = process.argv[2];
if (!bankDir) throw new Error("Usage: node scripts/preview-axon-manifest.mjs <canonical-bank-dir>");

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(bankDir, name), "utf8"));
const bank = readJson("synapse-question-bank.json");
const questions = new Map(bank.questions.map((question) => [question.id, question]));
const exams = [
  { slug: "ctfl", cert: "CTFL", axonCode: "CTFL", candidateCount: 193, heldCount: 27 },
  { slug: "ctal-ta", cert: "CTAL-TA", axonCode: "CTALTA", candidateCount: 88, heldCount: 22 },
  { slug: "ctal-tm", cert: "CTAL-TM", axonCode: "CTALTM", candidateCount: 100, heldCount: 1 },
];

const candidateRecords = [];
const counts = {};
let heldCount = 0;
for (const exam of exams) {
  const ledger = readJson(`axon/${exam.slug}-public-ids.json`);
  const review = readJson(`axon/${exam.slug}-reference-candidates.json`);
  if (ledger.exam !== exam.slug || ledger.lang !== "pt-BR") {
    throw new Error(`Unexpected ledger identity: ${exam.slug}`);
  }
  if (review.exam !== exam.slug || review.lang !== "pt-BR") {
    throw new Error(`Unexpected reference map identity: ${exam.slug}`);
  }
  if (review.records.length !== ledger.mappings.length) {
    throw new Error(`${exam.slug}: every reserved ID needs an explicit reference state`);
  }
  const mappings = new Map(ledger.mappings.map((mapping) => [mapping.publicId, mapping]));
  if (mappings.size !== ledger.mappings.length)
    throw new Error(`${exam.slug}: duplicate public ID`);
  const refs = new Map(review.records.map((item) => [item.publicId, item]));
  if (refs.size !== review.records.length) throw new Error(`${exam.slug}: duplicate reference ID`);

  const candidates = review.records.filter((item) => item.state === "candidate");
  const held = review.records.filter((item) => item.state === "held");
  if (
    candidates.length !== exam.candidateCount ||
    held.length !== exam.heldCount ||
    candidates.length + held.length !== review.records.length
  ) {
    throw new Error(`${exam.slug}: unexpected candidate/held counts`);
  }
  counts[exam.cert] = candidates.length;
  heldCount += held.length;

  for (const item of candidates) {
    const mapping = mappings.get(item.publicId);
    const question = questions.get(item.internalId);
    if (!mapping || mapping.internalId !== item.internalId) {
      throw new Error(`ID mapping mismatch: ${item.publicId}`);
    }
    if (!question || question.cert !== exam.cert || question.pool !== "study") {
      throw new Error(`Not an eligible ${exam.cert} study question: ${item.internalId}`);
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
    candidateRecords.push({
      id: item.publicId,
      exam: exam.axonCode,
      topics: [question.domain],
      difficulty: "unrated",
      lang: "pt-BR",
      version: 1,
      checksum: computeChecksum(snapshot),
      aliases: [],
      snapshot,
    });
  }

  for (const item of held) {
    if (item.reference !== null || item.referenceTitle !== null) {
      throw new Error(`${item.publicId} is held but has a publishable reference`);
    }
  }
}

if (candidateRecords.length !== 381 || heldCount !== 50) {
  throw new Error(
    `Expected 381 candidate records and 50 held; got ${candidateRecords.length}/${heldCount}`
  );
}

const jsonl = `${candidateRecords.map((record) => JSON.stringify(record)).join("\n")}\n`;
const parsed = parseManifest(jsonl);
if (parsed.rejected.length || parsed.ok.length !== candidateRecords.length) {
  throw new Error(`Axon rejected manifest lines: ${JSON.stringify(parsed.rejected)}`);
}
if (parsed.ok.some((record) => !verifyChecksum(record))) {
  throw new Error("Checksum validation failed");
}
if (new Set(parsed.ok.map((record) => record.id)).size !== candidateRecords.length) {
  throw new Error("Duplicate public IDs in preview");
}

const previewDir = fs.mkdtempSync(
  path.join(process.env.RUNNER_TEMP || os.tmpdir(), "synapse-axon-preview-")
);
const manifestPath = path.join(previewDir, "manifest.jsonl");
fs.writeFileSync(manifestPath, jsonl, "utf8");
console.log(
  `Axon preview valid: ${candidateRecords.length} study records (${Object.entries(counts)
    .map(([exam, count]) => `${exam} ${count}`)
    .join(", ")}); held ${heldCount}; ${manifestPath}`
);
