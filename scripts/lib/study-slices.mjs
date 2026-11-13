// Fatias de estudo/simulado do Synapse (src/synapse/data/banks/*.json).
//
// São artefatos DERIVADOS do monólito sincronizado (src/data/synapse-question-bank.json),
// consumidos pelo gerador de manifesto (scripts/lib/axon-manifest.mjs). Antes não
// havia gerador versionado — as fatias eram editadas à mão e ficaram defasadas em
// relação ao banco canônico (incidente de 09/nov). Este módulo fecha o buraco.
import { CERTS } from "../../src/lib/certs.config.js";

const chapterKey = (q) => String(q.chapter);

function refFor(cert, q) {
  const base = `ISTQB ${cert.label} ${cert.version} · cap. ${q.chapter}`;
  return q.lo ? `${base} · LO ${q.lo}` : base;
}

function toSliceItem(cert, q) {
  return {
    id: q.id,
    ch: q.chapter,
    k: q.kLevel,
    answer: q.answer,
    ref: refFor(cert, q),
    q: { pt: q.locales.pt.q, en: q.locales.en.q },
    options: { pt: q.locales.pt.options, en: q.locales.en.options },
    exp: { pt: q.locales.pt.exp, en: q.locales.en.exp },
  };
}

/** Monta a fatia de um cert (study | exam) agrupada por capítulo. */
export function buildSlice(bank, certId, pool) {
  const cert = CERTS[certId];
  if (!cert) throw new Error(`cert desconhecida: ${certId}`);
  const out = {};
  for (const q of bank.questions) {
    if ((q.cert || "").toLowerCase() !== certId) continue;
    const isExam = q.pool === "exam";
    if ((pool === "exam") !== isExam) continue;
    const key = chapterKey(q);
    if (!out[key]) out[key] = [];
    out[key].push(toSliceItem(cert, q));
  }
  return out;
}

/** Mapa nome-de-arquivo → conteúdo, para todos os certs vivos. */
export function buildStudySlices(bank) {
  const files = {};
  for (const certId of Object.keys(CERTS)) {
    files[`${certId}.json`] = buildSlice(bank, certId, "study");
    files[`${certId}-exam.json`] = buildSlice(bank, certId, "exam");
  }
  return files;
}

function chapterCounts(slice) {
  const counts = {};
  let total = 0;
  for (const [ch, list] of Object.entries(slice)) {
    counts[ch] = list.length;
    total += list.length;
  }
  return { counts, total };
}

/** Metadados derivados das fatias vivas (versão, totais por cert e capítulo). */
export function buildBankMeta(bank) {
  const perCert = {};
  let studyTotal = 0;
  let examTotal = 0;
  for (const certId of Object.keys(CERTS)) {
    const study = chapterCounts(buildSlice(bank, certId, "study"));
    const exam = chapterCounts(buildSlice(bank, certId, "exam"));
    studyTotal += study.total;
    examTotal += exam.total;
    perCert[certId] = {
      study: study.total,
      exam: exam.total,
      total: study.total + exam.total,
      chapters: study.counts,
    };
  }
  return {
    version: bank.meta?.version || "",
    generatedDate: bank.meta?.generatedDate || "",
    totalQuestions: bank.meta?.totalQuestions || studyTotal + examTotal,
    live: {
      certs: Object.keys(CERTS).length,
      study: studyTotal,
      exam: examTotal,
      total: studyTotal + examTotal,
    },
    perCert,
  };
}
