import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeChecksum, parseManifest, verifyChecksum } from "@ironidesflj/axon";

const bankDir = process.argv[2];
if (!bankDir) throw new Error("Usage: node scripts/preview-axon-manifest.mjs <canonical-bank-dir>");
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(bankDir, name), "utf8"));
const bank = readJson("synapse-question-bank.json");
const questions = new Map(bank.questions.map((question) => [question.id, question]));
const exams = [
  { slug: "ctfl", cert: "CTFL", axonCode: "CTFL" },
  { slug: "ctal-ta", cert: "CTAL-TA", axonCode: "CTALTA" },
  { slug: "ctal-tm", cert: "CTAL-TM", axonCode: "CTALTM" },
];

const candidateRecords = [];
const expectedIdMap = {};
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

  const appBank = JSON.parse(
    fs.readFileSync(path.join(appRoot, `src/synapse/data/banks/${exam.slug}.json`), "utf8")
  );
  const appQuestions = Object.values(appBank).flat();
  const appById = new Map(appQuestions.map((question) => [question.id, question]));
  if (appById.size !== ledger.mappings.length || appQuestions.length !== ledger.mappings.length) {
    throw new Error(`${exam.slug}: app study pool differs from the canonical ledger`);
  }
  for (const mapping of ledger.mappings) {
    const source = questions.get(mapping.internalId);
    const displayed = appById.get(mapping.internalId);
    if (
      !source ||
      !displayed ||
      source.answer !== displayed.answer ||
      ["pt", "en"].some((lang) =>
        ["q", "options", "exp"].some(
          (field) =>
            JSON.stringify(source.locales[lang][field]) !== JSON.stringify(displayed[field][lang])
        )
      )
    ) {
      throw new Error(`App study question differs from canonical bank: ${mapping.internalId}`);
    }
  }

  const candidates = review.records.filter((item) => item.state === "candidate");
  const held = review.records.filter((item) => item.state === "held");
  if (candidates.length + held.length !== review.records.length) {
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
    expectedIdMap[item.internalId] = item.publicId;
    const referenceHost = new URL(item.reference).hostname;
    if (
      !["istqb.org", "www.istqb.org", "glossary.istqb.org", "research.ibm.com", "asq.org"].includes(
        referenceHost
      ) ||
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

if (candidateRecords.length + heldCount !== 431) {
  throw new Error(
    `Expected 431 reserved study IDs; got ${candidateRecords.length} candidates/${heldCount} held`
  );
}

const appIdMap = JSON.parse(
  fs.readFileSync(path.join(appRoot, "src/synapse/data/axon-public-ids.json"), "utf8")
);
if (
  Object.keys(appIdMap).length !== candidateRecords.length ||
  Object.entries(expectedIdMap).some(([internalId, publicId]) => appIdMap[internalId] !== publicId)
) {
  throw new Error("App Axon ID map differs from the canonical bank candidate set");
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
