import monolith from "../data/synapse-question-bank.json" with { type: "json" };
import { CERTS } from "./certs.config.js";

export function getBank(certId) {
  const normalizedId = String(certId || "").toLowerCase();
  const cert = CERTS[normalizedId];
  if (!cert) throw new Error(`Cert desconhecida: "${certId}" (normalizado: "${normalizedId}")`);

  const chapters = cert.chapters;
  const META = monolith.meta;

  const matchesChapter = (a, b) => String(a) === String(b);

  const rawQuestions = monolith.questions.filter(q =>
    chapters.some(c => matchesChapter(c.chapter, q.chapter) && c.domain === q.domain)
  );

  function localized(q, lang = "pt") {
    const loc = q.locales[lang] || q.locales["pt"];
    return { id: q.id, domain: q.domain, chapter: q.chapter, kLevel: q.kLevel, answer: q.answer, ...loc };
  }

  const ALL = rawQuestions.map((q) => localized(q, "pt"));

  function byIds(ids) {
    const set = new Set(ids);
    return ALL.filter((q) => set.has(q.id));
  }

  function allInLang(lang = "pt") {
    return lang === "pt" ? ALL : rawQuestions.map((q) => localized(q, lang));
  }

  function byChapterInLang(chapterId, lang = "pt") {
    const all = allInLang(lang);
    return chapterId === "all" ? all : all.filter((q) => matchesChapter(q.chapter, chapterId));
  }

  function chapterName(chapterNum, lang = "pt") {
    const c = chapters.find((x) => matchesChapter(x.chapter, chapterNum));
    return c ? (c[lang]?.name || c.pt.name) : String(chapterNum);
  }

  function chapterWeight(chapterNum) {
    return META.chapterWeights?.[cert.id]?.[String(chapterNum)]
      ?? META.chapterWeights?.[String(chapterNum)]
      ?? 0;
  }

  function shuffle(arr) {
    const r = [...arr];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function shuffleOptions(q) {
    return shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
  }

  function buildExamInLang(lang = "pt") {
    const allQ = allInLang(lang);
    const weightsTotal = Object.values(META.chapterWeights[cert.id]).reduce((s, w) => s + Number(w), 0);
    const examQuestions = META.examFormat[cert.id].questions;
    const picked = [];
    chapters.forEach((c) => {
      const pool = shuffle(allQ.filter((q) => matchesChapter(q.chapter, c.chapter)));
      const want = Math.round((chapterWeight(c.chapter) / weightsTotal) * examQuestions);
      picked.push(...pool.slice(0, want));
    });
    let pool = shuffle(picked);
    if (pool.length > examQuestions) pool = pool.slice(0, examQuestions);
    if (pool.length < examQuestions) {
      const used = new Set(pool.map((q) => q.id));
      const extra = shuffle(allQ).filter((q) => !used.has(q.id));
      pool.push(...extra.slice(0, examQuestions - pool.length));
    }
    return shuffle(pool);
  }

  function coverageByChapter(seenMap) {
    const result = {};
    chapters.forEach((c) => {
      const total = ALL.filter((q) => matchesChapter(q.chapter, c.chapter)).length;
      const seen = ALL.filter((q) => matchesChapter(q.chapter, c.chapter) && seenMap[q.id]).length;
      result[c.chapter] = { seen, total };
    });
    return result;
  }

  // Spec 2 passo 2: cobertura por K-level. NORMALIZA: banco usa kLevel
  // numérico (1-4, verificado — 100% int em synapse-question-bank.json),
  // examBlueprint usa chaves "K1".."K4" (verificado no JSON commitado). Sem
  // essa normalização os dois nunca se cruzam e o gate trava pra sempre.
  function coverageByKLevel(seenMap) {
    const result = {};
    ALL.forEach((q) => {
      const k = "K" + q.kLevel;
      if (!result[k]) result[k] = { seen: 0, total: 0 };
      result[k].total += 1;
      if (seenMap[q.id]) result[k].seen += 1;
    });
    return result;
  }

  return {
    cert, chapters, META, ALL,
    localized, byIds, allInLang, byChapterInLang,
    chapterName, chapterWeight, shuffle, shuffleOptions,
    buildExamInLang, coverageByChapter, coverageByKLevel
  };
}
