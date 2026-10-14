// r5 — Code-split do banco por cert (backlog #1 de performance).
//
// O app importava o monólito synapse-question-bank.json (2,4MB, 1100
// questões de 5 certs) estaticamente: TODO usuário baixava e parseava
// tudo antes do primeiro render, mesmo usando só o CTFL (300 questões).
//
// Este script divide o monólito em fatias por cert LIVE
// (src/data/banks/{cert}.json), que o bank.js carrega sob demanda via
// import.meta.glob — cada cert vira um chunk lazy do Vite.
//
// Rodar SEMPRE que o monólito mudar:
//   node scripts/split-bank.mjs
//
// As fatias são artefatos derivados (não editar à mão); o monólito em
// src/data/synapse-question-bank.json continua sendo a fonte da verdade
// sincronizada com o repositório canônico do banco.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CERTS } from "../src/lib/certs.config.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../src/data");
const monolith = JSON.parse(readFileSync(path.join(dataDir, "synapse-question-bank.json"), "utf8"));

const matchesChapter = (a, b) => String(a) === String(b);

// Mesmo filtro primário/fallback do getBank() — as fatias têm exatamente
// o pool que o app veria com o monólito (invariante verificado pelos
// testes de integridade em bank.test.js).
function poolForCert(cert) {
  return monolith.questions.filter((q) => {
    if (typeof q.cert === "string" && q.cert) {
      return q.cert.toLowerCase() === cert.id;
    }
    return cert.chapters.some((c) => matchesChapter(c.chapter, q.chapter) && c.domain === q.domain);
  });
}

mkdirSync(path.join(dataDir, "banks"), { recursive: true });

let total = 0;
for (const cert of Object.values(CERTS)) {
  const questions = poolForCert(cert);
  total += questions.length;
  const ids = new Set(questions.map((q) => q.id));
  if (ids.size !== questions.length) {
    throw new Error(`ids duplicados no pool de ${cert.id}`);
  }
  const slice = { meta: monolith.meta, questions };
  const out = path.join(dataDir, "banks", `${cert.id}.json`);
  writeFileSync(out, JSON.stringify(slice) + "\n");
  console.log(`${cert.id}: ${questions.length} questões → banks/${cert.id}.json`);
}
console.log(`total: ${total} questões em ${Object.keys(CERTS).length} fatias`);
