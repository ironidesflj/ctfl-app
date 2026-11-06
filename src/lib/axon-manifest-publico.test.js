// Contrato público do manifesto Axon (decisão D4): o app publica
// `/manifest.jsonl` com as 431 questões de ESTUDO, e o CI compara o SHA-256
// com a cópia do hub. Este teste roda sem o banco canônico: valida o arquivo
// commitado contra o parser/checksum reais do Axon e contra o pool de estudo
// do próprio app (`src/synapse/data/banks/`), garantindo que nenhuma questão
// de simulado vaze para o contrato.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseManifest, verifyChecksum } from "@ironidesflj/axon";
import {
  EXAMS,
  EXPECTED_STUDY_COUNTS,
  MANIFEST_FIELDS,
  MANIFEST_FILE,
  RESERVED_STUDY_IDS,
  SNAPSHOT_FIELDS,
  appRoot,
  readAppBank,
  serializeManifest,
  validateManifestJsonl,
} from "../../scripts/lib/axon-manifest.mjs";

const root = appRoot();
const manifestPath = path.join(root, MANIFEST_FILE);
const text = fs.readFileSync(manifestPath, "utf8");
const rawLines = text.slice(0, -1).split("\n");
const records = rawLines.map((line) => JSON.parse(line));
const appIdMap = JSON.parse(
  fs.readFileSync(path.join(root, "src/synapse/data/axon-public-ids.json"), "utf8")
);

const appStudyQuestions = new Map();
const appExamQuestions = new Map();
for (const exam of EXAMS) {
  for (const question of readAppBank(root, exam.slug, "study")) {
    appStudyQuestions.set(question.id, { ...question, cert: exam.cert });
  }
  for (const question of readAppBank(root, exam.slug, "exam")) {
    appExamQuestions.set(question.id, { ...question, cert: exam.cert });
  }
}

describe("manifesto público /manifest.jsonl (D4)", () => {
  it("fica em public/manifest.jsonl, termina com newline e tem 431 linhas", () => {
    expect(path.basename(manifestPath)).toBe("manifest.jsonl");
    expect(path.dirname(manifestPath)).toBe(path.join(root, "public"));
    expect(text.endsWith("\n")).toBe(true);
    expect(text.includes("\n\n")).toBe(false);
    expect(rawLines).toHaveLength(RESERVED_STUDY_IDS);
  });

  it("é aceito pelo parser do Axon: zero linhas rejeitadas", () => {
    const parsed = parseManifest(text);
    expect(parsed.rejected).toEqual([]);
    expect(parsed.ok).toHaveLength(RESERVED_STUDY_IDS);
  });

  it("tem checksum Axon válido em todas as linhas", () => {
    const parsed = parseManifest(text);
    const invalid = parsed.ok
      .filter((record) => !verifyChecksum(record))
      .map((record) => record.id);
    expect(invalid).toEqual([]);
  });

  it("serializa os 9 campos e o snapshot na ordem do contrato", () => {
    for (const record of records) {
      expect(Object.keys(record)).toEqual(MANIFEST_FIELDS);
      expect(Object.keys(record.snapshot)).toEqual(SNAPSHOT_FIELDS);
    }
  });

  it("usa metadados fixos do contrato (pt-BR, version 1, unrated, aliases vazios)", () => {
    for (const record of records) {
      expect(record.lang).toBe("pt-BR");
      expect(record.version).toBe(1);
      expect(record.difficulty).toBe("unrated");
      expect(record.aliases).toEqual([]);
      expect(record.topics.length).toBeGreaterThan(0);
      expect(record.exam).toBe(record.id.split("-")[1]);
    }
  });

  it("tem as contagens do hub: CTFL 220, CTAL-TA 110, CTAL-TM 101", () => {
    const certOf = new Map(EXAMS.map((exam) => [exam.axonCode, exam.cert]));
    const counts = {};
    for (const record of records) {
      const cert = certOf.get(record.exam);
      counts[cert] = (counts[cert] ?? 0) + 1;
    }
    expect(counts).toEqual(EXPECTED_STUDY_COUNTS);
  });

  it("tem IDs únicos, provas na ordem do Axon e IDs crescentes dentro da prova", () => {
    expect(new Set(records.map((record) => record.id)).size).toBe(RESERVED_STUDY_IDS);
    const examOrder = EXAMS.map((exam) => exam.axonCode);
    let lastExam = -1;
    let lastId = "";
    for (const record of records) {
      const examIndex = examOrder.indexOf(record.exam);
      expect(examIndex).toBeGreaterThanOrEqual(lastExam);
      if (examIndex === lastExam) expect(record.id > lastId).toBe(true);
      lastExam = examIndex;
      lastId = record.id;
    }
  });

  it("cobre exatamente as 431 questões de ESTUDO do app, sem pool de simulado", () => {
    // O mapa do app (internalId → ID público) é a ponte entre banco e manifesto.
    expect(Object.keys(appIdMap)).toHaveLength(RESERVED_STUDY_IDS);
    expect(new Set(Object.keys(appIdMap))).toEqual(new Set(appStudyQuestions.keys()));
    expect(new Set(Object.values(appIdMap))).toEqual(new Set(records.map((record) => record.id)));
    // Pools são mutuamente exclusivos: nenhum ID de simulado no mapa/contrato.
    const leaked = [...appExamQuestions.keys()].filter((id) => appIdMap[id] !== undefined);
    expect(leaked).toEqual([]);

    const byPublicId = new Map(records.map((record) => [record.id, record]));
    for (const [internalId, publicId] of Object.entries(appIdMap)) {
      const question = appStudyQuestions.get(internalId);
      const record = byPublicId.get(publicId);
      expect(record).toBeDefined();
      expect(record.snapshot.statement).toBe(question.q.pt);
      expect(record.snapshot.options).toEqual(question.options.pt);
      expect(record.snapshot.answer).toBe(String.fromCharCode(65 + question.answer));
      expect(record.snapshot.reference).toMatch(/^https:\/\//);
      expect(record.snapshot.referenceTitle.length).toBeGreaterThan(0);
    }

    // Nenhum enunciado de simulado pode aparecer no manifesto.
    const simuladoStatements = new Set([...appExamQuestions.values()].map((q) => q.q.pt));
    expect(records.filter((record) => simuladoStatements.has(record.snapshot.statement))).toEqual(
      []
    );
  });

  it("é determinístico: serialização canônica reconstrói o arquivo byte a byte", () => {
    expect(serializeManifest(records)).toBe(text);
    // validateManifestJsonl é a mesma trava usada pelo gerador/prebuild.
    expect(validateManifestJsonl(text)).toEqual({ counts: EXPECTED_STUDY_COUNTS, total: 431 });
  });

  it("reprova conteúdo adulterado (checksum) e ordem trocada", () => {
    const tampered = rawLines
      .map((line, index) =>
        index === 0 ? line.replace(/sha256:[0-9a-f]{64}/, `sha256:${"0".repeat(64)}`) : line
      )
      .join("\n")
      .concat("\n");
    expect(() => validateManifestJsonl(tampered)).toThrow(/checksum/);

    const swapped = [...rawLines];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    expect(() => validateManifestJsonl(swapped.join("\n").concat("\n"))).toThrow(/ordem/);
  });
});
