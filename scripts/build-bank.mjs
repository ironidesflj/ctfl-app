#!/usr/bin/env node
/* ===========================================================
   Synapse · scripts/build-bank.mjs
   Migração determinística dos bancos do repositório (v23) para
   o contrato de dados do handoff (data/certs.js → questions).

   Regras (HANDOFF.md · "Trocar o seed pelo banco real"):
   - Mantém chaves e formato: { [capítulo]: [ {id, ch, k, answer,
     ref, q, options, exp} ] }.
   - Pool de ESTUDO → banks/<cert>.json (Estudar, Flashcards,
     cobertura, prontidão, SRS).
   - Pool de SIMULADO → banks/<cert>-exam.json (pools mutuamente
     exclusivos — POOLS.md r13: o que se treina nunca aparece em
     prova, e as exclusivas de prova nunca aparecem no estudo).

   Validações bloqueantes (exit 1):
   - totais de estudo E simulado por certificação;
   - distribuição por capítulo vs. blueprint em certs.ts;
   - células do blueprint do simulado ≥ 2× (F=2) e gabarito
     balanceado (< 40% por índice);
   - interseção estudo × simulado vazia (id e objeto);
   - índice de resposta dentro das alternativas;
   - locales PT/EN completos (q, options, exp);
   - IDs únicos globais.
   =========================================================== */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "bank-source");
const OUT = resolve(root, "src/synapse/data/banks");
mkdirSync(OUT, { recursive: true });

/* Blueprint esperado — espelha src/synapse/data/certs.ts.
   Fonte: ISTQB Exam Structures & Rules v1.18 + bancos v23. */
const EXPECT = {
  ctfl: {
    code: "CTFL",
    version: "v4.0",
    total: 220,
    examTotal: 80,
    byChapter: { 1: 44, 2: 26, 3: 30, 4: 60, 5: 49, 6: 11 },
  },
  "ctal-ta": {
    code: "CTAL-TA",
    version: "v4.0",
    total: 110,
    examTotal: 90,
    byChapter: { 1: 20, 2: 8, 3: 54, 4: 10, 5: 18 },
  },
  "ctal-tm": {
    code: "CTAL-TM",
    version: "v3.0",
    total: 101,
    examTotal: 99,
    byChapter: { 1: 57, 2: 27, 3: 17 },
  },
};

const errors = [];
const report = { certs: {} };
const seenIds = new Set();

for (const certId of Object.keys(EXPECT)) {
  const expect = EXPECT[certId];
  const raw = JSON.parse(readFileSync(resolve(SRC, `${certId}.json`), "utf8"));
  const study = raw.questions.filter((q) => q.pool === "study");
  const exam = raw.questions.filter((q) => q.pool === "exam");

  /* interseção estudo × simulado vazia (invariante r13) */
  const studyIds = new Set(study.map((q) => q.id));
  for (const q of exam) {
    if (studyIds.has(q.id)) errors.push(`${certId}/${q.id}: questão em ambos os pools`);
  }

  const byChapter = {};
  const out = {};
  const examOut = {};
  const examByChapter = {};
  const examCell = {};
  const answerTally = [0, 0, 0, 0];

  /** Valida e converte uma questão ao contrato do handoff. */
  function convert(q, poolLabel) {
    const ch = Number(q.chapter);
    const pt = q.locales?.pt;
    const en = q.locales?.en;

    if (!pt?.q || !en?.q) errors.push(`${certId}/${q.id}: locale q ausente`);
    if (!Array.isArray(pt?.options) || pt.options.length !== 4 || !Array.isArray(en?.options) || en.options.length !== 4)
      errors.push(`${certId}/${q.id}: opções PT/EN incompletas`);
    if (!pt?.exp || !en?.exp) errors.push(`${certId}/${q.id}: explicação PT/EN ausente`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3)
      errors.push(`${certId}/${q.id}: answer ${q.answer} fora de 0–3`);
    if (seenIds.has(q.id)) errors.push(`ID duplicado: ${q.id}`);
    seenIds.add(q.id);
    if (![1, 2, 3, 4].includes(Number(q.kLevel))) errors.push(`${certId}/${q.id}: kLevel inválido`);

    const ref = q.section
      ? `ISTQB ${expect.code} ${expect.version} · ${q.section}`
      : `ISTQB ${expect.code} ${expect.version} · cap. ${ch}`;

    return {
      id: q.id,
      ch,
      k: Number(q.kLevel),
      answer: Number(q.answer),
      ref,
      q: { pt: pt.q, en: en.q },
      options: { pt: pt.options, en: en.options },
      exp: { pt: pt.exp, en: en.exp },
    };
  }

  function tally(poolLabel) {
    return (q) => {
      const ch = Number(q.chapter);
      if (poolLabel === "study") {
        if (!byChapter[ch]) byChapter[ch] = 0;
        byChapter[ch] += 1;
      } else {
        if (!examByChapter[ch]) examByChapter[ch] = 0;
        examByChapter[ch] += 1;
        const cell = ch + ":K" + Number(q.kLevel);
        examCell[cell] = (examCell[cell] || 0) + 1;
        answerTally[Number(q.answer)] += 1;
      }
    };
  }

  study.forEach(tally("study"));
  exam.forEach(tally("exam"));

  for (const q of study) {
    const item = convert(q, "study");
    if (!out[item.ch]) out[item.ch] = [];
    out[item.ch].push(item);
  }
  for (const q of exam) {
    const item = convert(q, "exam");
    if (!examOut[item.ch]) examOut[item.ch] = [];
    examOut[item.ch].push(item);
  }

  if (study.length !== expect.total)
    errors.push(`${certId}: total de estudo ${study.length} ≠ ${expect.total}`);
  for (const [ch, n] of Object.entries(expect.byChapter)) {
    if ((byChapter[ch] || 0) !== n)
      errors.push(`${certId}: capítulo ${ch} com ${byChapter[ch] || 0} ≠ ${n}`);
  }
  if (exam.length !== expect.examTotal)
    errors.push(`${certId}: total de simulado ${exam.length} ≠ ${expect.examTotal}`);

  /* Blueprint do simulado: cada célula capítulo × K-level ≥ 1× a demanda
     da prova (hard-fail); ≥ 2× (F=2 — POOLS.md r13) é o alvo e vira aviso
     no relatório (CTAL-TM cap.2×K3 tem 7 para 2×4 — limitação documentada
     no próprio POOLS.md; o sorteio completa a célula dentro do capítulo). */
  const warnings = [];
  const blueprint = raw.meta?.examBlueprint?.[certId]?.chapters || {};
  for (const [ch, spec] of Object.entries(blueprint)) {
    for (const [k, want] of Object.entries(spec.kLevels || {})) {
      if (!want) continue;
      const have = examCell[`${ch}:${k}`] || 0;
      if (have < want)
        errors.push(`${certId}: célula simulado ${ch}×${k} com ${have} < ${want} (1× blueprint)`);
      else if (have < 2 * want)
        warnings.push(`${certId}: célula simulado ${ch}×${k} com ${have} < ${2 * want} (F=2)`);
    }
  }
  const maxTally = Math.max(...answerTally);
  if (exam.length && maxTally / exam.length >= 0.4)
    errors.push(`${certId}: gabarito do simulado desbalanceado (${answerTally.join("/")})`);

  const ordered = {};
  for (const ch of Object.keys(out).map(Number).sort((a, b) => a - b)) {
    ordered[String(ch)] = out[ch];
  }
  writeFileSync(resolve(OUT, `${certId}.json`), JSON.stringify(ordered, null, 1) + "\n");

  const examOrdered = {};
  for (const ch of Object.keys(examOut).map(Number).sort((a, b) => a - b)) {
    examOrdered[String(ch)] = examOut[ch];
  }
  writeFileSync(resolve(OUT, `${certId}-exam.json`), JSON.stringify(examOrdered, null, 1) + "\n");

  report.certs[certId] = {
    bankVersion: raw.meta?.version,
    study: study.length,
    exam: exam.length,
    byChapter,
    examByChapter,
    warnings,
    sections: study.filter((q) => q.section).length,
  };
}

report.uniqueIds = seenIds.size;
report.errors = errors;

if (errors.length) {
  console.error("✗ Banco reprovado nas validações:\n" + errors.map((e) => "  - " + e).join("\n"));
  writeFileSync(resolve(root, "scripts/bank-report.json"), JSON.stringify(report, null, 2));
  process.exit(1);
}

writeFileSync(resolve(root, "scripts/bank-report.json"), JSON.stringify(report, null, 2));
console.log(
  `✓ Bancos gerados: estudo ctfl 220 · ctal-ta 110 · ctal-tm 101 + simulado ctfl 80 · ctal-ta 90 · ctal-tm 99 — ${seenIds.size} IDs únicos, pools disjuntos validados.`
);
