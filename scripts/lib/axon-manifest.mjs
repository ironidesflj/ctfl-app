// Núcleo determinístico do manifesto público do Synapse (decisão D4).
//
// O contrato Axon (spec-schema.md, constitution §2) define UM registro por
// questão, nove campos, uma linha JSON por questão, em UTF-8. O app é o
// EMISSOR: publica `/manifest.jsonl`; o hub (noos.study) é o INGESTOR e mantém
// uma cópia pública (`/manifestos/SYN.jsonl`). Os dois arquivos devem ser
// byte a byte iguais — o CI compara o SHA-256.
//
// Regras travadas aqui:
//   - fonte das questões = banco canônico (repo ctfl-question-bank-ptbr),
//     pool "study" apenas; o pool de simulado NUNCA entra no manifesto;
//   - 431 IDs reservados para CTFL (220), CTAL-TA (110) e CTAL-TM (101);
//   - `aliases: []`, `lang: "pt-BR"`, `difficulty: "unrated"`, `version: 1`;
//   - snapshot = { statement, options, answer, reference, referenceTitle };
//   - checksum = computeChecksum(snapshot) da lib @ironidesflj/axon;
//   - ordem = ordem das provas no Axon (CTFL, CTAL-TA, CTAL-TM) e, dentro de
//     cada prova, id público crescente. Essa é a ordem do arquivo do hub; por
//     isso o SHA bate. Reordenar o arquivo quebra a paridade.
//
// O gerador só escreve o arquivo; a validação (`validateManifestJsonl`) relê o
// texto com o parser do próprio Axon e reprova qualquer linha inválida.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeChecksum, parseManifest, verifyChecksum } from "@ironidesflj/axon";

/** Caminho relativo do manifesto público dentro do repositório do app. */
export const MANIFEST_FILE = "public/manifest.jsonl";

/** Total de IDs de estudo reservados no Axon (contrato público atual). */
export const RESERVED_STUDY_IDS = 431;

/** Prova → questões de estudo no manifesto (contrato público de 431 linhas). */
export const EXPECTED_STUDY_COUNTS = {
  CTFL: 220,
  "CTAL-TA": 110,
  "CTAL-TM": 101,
};

/** Nove campos do contrato, na ordem em que são serializados. */
export const MANIFEST_FIELDS = [
  "id",
  "exam",
  "topics",
  "difficulty",
  "lang",
  "version",
  "checksum",
  "aliases",
  "snapshot",
];

/** Campos do snapshot, na ordem em que são serializados (e somados no checksum). */
export const SNAPSHOT_FIELDS = ["statement", "options", "answer", "reference", "referenceTitle"];

/**
 * Provas na ordem do registro Axon. O `slug` é o nome do arquivo no banco
 * canônico e no app; o `axonCode` é o prefixo das IDs públicas (SYN-CTFL-…).
 */
export const EXAMS = [
  { slug: "ctfl", cert: "CTFL", axonCode: "CTFL" },
  { slug: "ctal-ta", cert: "CTAL-TA", axonCode: "CTALTA" },
  { slug: "ctal-tm", cert: "CTAL-TM", axonCode: "CTALTM" },
];

/** Hosts aceitos para a referência bibliográfica do snapshot. */
const REFERENCE_HOSTS = [
  "istqb.org",
  "www.istqb.org",
  "glossary.istqb.org",
  "research.ibm.com",
  "asq.org",
];

/** Raiz do repositório do app (este arquivo fica em scripts/lib/). */
export function appRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

/** Lê um JSON com mensagem de erro curta (sem stack de ENOENT gigante). */
export function readJson(file) {
  if (!fs.existsSync(file)) throw new Error(`arquivo não encontrado: ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** Lê o banco de estudo do app de uma prova (formato capítulo → questões). */
export function readAppBank(root, slug, kind = "study") {
  const file =
    kind === "study"
      ? path.join(root, "src/synapse/data/banks", `${slug}.json`)
      : path.join(root, "src/synapse/data/banks", `${slug}-exam.json`);
  const bank = readJson(file);
  return Object.values(bank).flat();
}

/**
 * Monta os registros do manifesto a partir do banco canônico, validando que o
 * app serve exatamente as mesmas questões de estudo. Retorna os registros na
 * ordem do arquivo público + contagens por prova.
 */
export function buildManifestRecords({ bankDir, appRoot: root = appRoot() } = {}) {
  if (!bankDir) throw new Error("informe o diretório do banco canônico (ou AXON_BANK_DIR)");
  const bank = readJson(path.join(bankDir, "synapse-question-bank.json"));
  const questions = new Map(bank.questions.map((question) => [question.id, question]));
  const records = [];
  const expectedIdMap = {};
  const counts = {};
  let heldCount = 0;

  for (const exam of EXAMS) {
    const ledger = readJson(path.join(bankDir, "axon", `${exam.slug}-public-ids.json`));
    const review = readJson(path.join(bankDir, "axon", `${exam.slug}-reference-candidates.json`));
    if (ledger.exam !== exam.slug || ledger.lang !== "pt-BR") {
      throw new Error(`identidade inesperada do ledger: ${exam.slug}`);
    }
    if (review.exam !== exam.slug || review.lang !== "pt-BR") {
      throw new Error(`identidade inesperada do mapa de referências: ${exam.slug}`);
    }
    if (review.records.length !== ledger.mappings.length) {
      throw new Error(`${exam.slug}: todo ID reservado precisa de um estado de referência`);
    }
    const mappings = new Map(ledger.mappings.map((mapping) => [mapping.publicId, mapping]));
    if (mappings.size !== ledger.mappings.length) {
      throw new Error(`${exam.slug}: ID público duplicado no ledger`);
    }
    const refs = new Map(review.records.map((item) => [item.publicId, item]));
    if (refs.size !== review.records.length) {
      throw new Error(`${exam.slug}: ID público duplicado no mapa de referências`);
    }

    const appQuestions = readAppBank(root, exam.slug);
    const appById = new Map(appQuestions.map((question) => [question.id, question]));
    if (appById.size !== appQuestions.length) {
      throw new Error(`${exam.slug}: IDs duplicadas no pool de estudo do app`);
    }
    if (appQuestions.length < ledger.mappings.length) {
      throw new Error(`${exam.slug}: o pool de estudo do app perdeu questões do ledger canônico`);
    }
    const appExamIds = new Set(readAppBank(root, exam.slug, "exam").map((question) => question.id));
    for (const mapping of ledger.mappings) {
      if (appExamIds.has(mapping.internalId)) {
        throw new Error(
          `${exam.slug}: questão reservada Axon vazou para simulado: ${mapping.internalId}`
        );
      }
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
        throw new Error(`questão de estudo do app difere do banco canônico: ${mapping.internalId}`);
      }
    }

    const candidates = review.records.filter((item) => item.state === "candidate");
    const held = review.records.filter((item) => item.state === "held");
    if (candidates.length + held.length !== review.records.length) {
      throw new Error(`${exam.slug}: contagem inesperada de candidatas/retidas`);
    }
    counts[exam.cert] = candidates.length;
    heldCount += held.length;

    for (const item of candidates) {
      const mapping = mappings.get(item.publicId);
      const question = questions.get(item.internalId);
      if (!mapping || mapping.internalId !== item.internalId) {
        throw new Error(`mapa de ID divergente: ${item.publicId}`);
      }
      if (!question || question.cert !== exam.cert || question.pool !== "study") {
        throw new Error(`questão de estudo inelegível para ${exam.cert}: ${item.internalId}`);
      }
      expectedIdMap[item.internalId] = item.publicId;
      const referenceHost = new URL(item.reference).hostname;
      if (!REFERENCE_HOSTS.includes(referenceHost) || !item.referenceTitle) {
        throw new Error(`referência ausente: ${item.publicId}`);
      }

      const source = question.locales.pt;
      if (!source?.q || !Array.isArray(source.options) || source.options.length !== 4) {
        throw new Error(`questão PT-BR inválida: ${item.internalId}`);
      }
      if (
        !Number.isInteger(question.answer) ||
        question.answer < 0 ||
        question.answer >= source.options.length
      ) {
        throw new Error(`índice de resposta inválido: ${item.internalId}`);
      }

      const snapshot = {
        statement: source.q,
        options: source.options,
        answer: String.fromCharCode(65 + question.answer),
        reference: item.reference,
        referenceTitle: item.referenceTitle,
      };
      const record = {
        id: item.publicId,
        exam: exam.axonCode,
        topics: [question.domain],
        difficulty: "unrated",
        lang: "pt-BR",
        version: 1,
        checksum: computeChecksum(snapshot),
        aliases: [],
        snapshot,
      };
      // Política epitáfio (Axon 0.3, MINOR): questão retirada do banco ativo
      // continua no manifesto, marcada — a ID e a página canônica permanecem.
      if (question.retired === true) record.retired = true;
      records.push(record);
    }

    for (const item of held) {
      if (item.reference !== null || item.referenceTitle !== null) {
        throw new Error(`${item.publicId} está retida mas tem referência publicável`);
      }
    }
  }

  if (records.length + heldCount !== RESERVED_STUDY_IDS) {
    throw new Error(
      `esperados ${RESERVED_STUDY_IDS} IDs de estudo reservados; ` +
        `obtidos ${records.length} candidatos/${heldCount} retidos`
    );
  }

  const appIdMap = readJson(path.join(root, "src/synapse/data/axon-public-ids.json"));
  if (
    Object.keys(appIdMap).length !== records.length ||
    Object.entries(expectedIdMap).some(
      ([internalId, publicId]) => appIdMap[internalId] !== publicId
    )
  ) {
    throw new Error("o mapa de IDs Axon do app difere do conjunto candidato canônico");
  }

  // Ordem do arquivo: provas na ordem de EXAMS, id crescente dentro da prova.
  // Ordenar explicitamente garante determinismo mesmo que o ledger mude de
  // ordem — a ordem é parte do SHA público, não um detalhe de implementação.
  const ordered = [];
  for (const exam of EXAMS) {
    ordered.push(
      ...records
        .filter((record) => record.exam === exam.axonCode)
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    );
  }

  for (const record of ordered) {
    assertRecordShape(record);
  }

  return { records: ordered, counts, heldCount };
}

/** Serialização canônica: uma linha JSON por registro, newline no fim. */
export function serializeManifest(records) {
  return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

/** Garante os nove campos (e a ordem) e o snapshot completo. */
export function assertRecordShape(record) {
  const fields = record.retired === undefined ? MANIFEST_FIELDS : [...MANIFEST_FIELDS, "retired"];
  const keys = Object.keys(record);
  if (keys.length !== fields.length || keys.some((key, i) => key !== fields[i])) {
    throw new Error(`campos fora do contrato Axon: ${keys.join(",")}`);
  }
  if (record.retired !== undefined && typeof record.retired !== "boolean") {
    throw new Error("campo retired deve ser booleano quando presente");
  }
  const snapshotKeys = Object.keys(record.snapshot ?? {});
  if (
    snapshotKeys.length !== SNAPSHOT_FIELDS.length ||
    snapshotKeys.some((key, i) => key !== SNAPSHOT_FIELDS[i])
  ) {
    throw new Error(`snapshot fora do contrato Axon: ${snapshotKeys.join(",")}`);
  }
}

/**
 * Valida um manifest.jsonl inteiro contra o contrato Axon e as regras do
 * Synapse. Lança erro com a primeira violação encontrada; retorna contagens.
 */
export function validateManifestJsonl(
  text,
  { expectedCounts = EXPECTED_STUDY_COUNTS, expectedTotal = RESERVED_STUDY_IDS } = {}
) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("manifesto vazio");
  }
  if (!text.endsWith("\n")) {
    throw new Error("manifesto precisa terminar com quebra de linha (uma linha por questão)");
  }
  const parsed = parseManifest(text);
  if (parsed.rejected.length > 0) {
    const first = parsed.rejected[0];
    throw new Error(
      `Axon rejeitou ${parsed.rejected.length} linha(s); primeira na linha ${first.lineNumber}: ${first.reason}`
    );
  }
  if (parsed.ok.length !== expectedTotal) {
    throw new Error(`esperadas ${expectedTotal} linhas válidas; obtidas ${parsed.ok.length}`);
  }
  const lines = text.slice(0, -1).split("\n");
  const records = lines.map((line) => JSON.parse(line));
  const counts = {};
  const seen = new Set();
  let previousExam = -1;
  let previousId = "";
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i];
    assertRecordShape(record);
    if (record.lang !== "pt-BR") throw new Error(`linha ${i + 1}: lang deve ser pt-BR`);
    if (record.version !== 1) throw new Error(`linha ${i + 1}: version deve ser 1`);
    if (record.difficulty !== "unrated")
      throw new Error(`linha ${i + 1}: difficulty deve ser unrated`);
    if (!Array.isArray(record.aliases) || record.aliases.length !== 0) {
      throw new Error(`linha ${i + 1}: aliases deve ser []`);
    }
    if (!Array.isArray(record.topics) || record.topics.length === 0) {
      throw new Error(`linha ${i + 1}: topics deve ter ao menos um tópico`);
    }
    if (!verifyChecksum(record)) {
      throw new Error(`linha ${i + 1}: checksum não confere com o snapshot (${record.id})`);
    }
    if (seen.has(record.id)) throw new Error(`linha ${i + 1}: id duplicada ${record.id}`);
    seen.add(record.id);
    const examIndex = EXAMS.findIndex((exam) => exam.axonCode === record.exam);
    if (examIndex === -1) throw new Error(`linha ${i + 1}: prova desconhecida ${record.exam}`);
    const cert = EXAMS[examIndex].cert;
    counts[cert] = (counts[cert] ?? 0) + 1;
    if (examIndex < previousExam) {
      throw new Error(`linha ${i + 1}: ordem das provas fora do contrato (${record.id})`);
    }
    if (examIndex === previousExam && !(record.id > previousId)) {
      throw new Error(`linha ${i + 1}: ids fora de ordem crescente (${record.id})`);
    }
    previousExam = examIndex;
    previousId = record.id;
  }
  for (const [cert, expected] of Object.entries(expectedCounts)) {
    if (counts[cert] !== expected) {
      throw new Error(`contagem de ${cert}: esperada ${expected}, obtida ${counts[cert] ?? 0}`);
    }
  }
  return { counts, total: records.length };
}

/** Constrói o manifesto completo e o valida antes de devolver o texto. */
export function buildManifest({ bankDir, appRoot: root = appRoot() } = {}) {
  const { records, counts, heldCount } = buildManifestRecords({ bankDir, appRoot: root });
  const jsonl = serializeManifest(records);
  // validateManifestJsonl é a trava final: relê as linhas com o parser do Axon
  // e confere checksum, campos, contagens e ordem. Se divergir, não publica.
  const validated = validateManifestJsonl(jsonl);
  return { jsonl, records, counts, heldCount, total: validated.total };
}
