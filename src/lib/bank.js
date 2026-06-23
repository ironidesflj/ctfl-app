import bank from "../data/ctfl-questions-ptbr.json";

export const META = bank.meta;
export const LANG = META.defaultLanguage; // "pt"

export const DOMAINS = [
  { id: "fund", chapter: 1, pt: { name: "Fundamentos", sub: "Fundamentos do Teste" }, en: { name: "Fundamentals", sub: "Fundamentals of Testing" } },
  { id: "proc", chapter: 2, pt: { name: "Teste no Ciclo", sub: "Teste ao Longo do Ciclo de Desenvolvimento" }, en: { name: "Testing in the Lifecycle", sub: "Testing Throughout the Software Development Lifecycle" } },
  { id: "est", chapter: 3, pt: { name: "Teste Estático", sub: "Teste Estático" }, en: { name: "Static Testing", sub: "Static Testing" } },
  { id: "tec", chapter: 4, pt: { name: "Técnicas de Teste", sub: "Técnicas de Teste" }, en: { name: "Test Techniques", sub: "Test Techniques" } },
  { id: "mgmt", chapter: 5, pt: { name: "Gerenc. de Teste", sub: "Gerenciamento das Atividades de Teste" }, en: { name: "Test Management", sub: "Test Management" } },
  { id: "fer", chapter: 6, pt: { name: "Ferramentas", sub: "Ferramentas de Apoio ao Teste" }, en: { name: "Tools", sub: "Tool Support for Testing" } }
];

export const domainName = (id, lang = "pt") => {
  const d = DOMAINS.find((x) => x.id === id);
  return d ? (d[lang]?.name || d.pt.name) : id;
};

export const domainNameInLang = (id, lang = "pt") => domainName(id, lang);

export const chapterWeight = (chapter) => META.chapterWeights[String(chapter)] || 0;

// Texto da questão no idioma corrente, com índice de resposta neutro.
export function localized(q, lang = "pt") {
  const loc = q.locales[lang] || q.locales["pt"];
  return {
    id: q.id,
    domain: q.domain,
    chapter: q.chapter,
    kLevel: q.kLevel,
    answer: q.answer,
    ...loc
  };
}

export const ALL = bank.questions.map((q) => localized(q, "pt"));

export function byIds(ids) {
  const set = new Set(ids);
  return ALL.filter((q) => set.has(q.id));
}

// Retorna todas as questões localizadas no idioma solicitado (fallback PT).
export function allInLang(lang = "pt") {
  return bank.questions.map((q) => localized(q, lang));
}

export function byDomainInLang(domainId, lang = "pt") {
  const all = allInLang(lang);
  return domainId === "all" ? all : all.filter((q) => q.domain === domainId);
}

export function buildExamInLang(lang = "pt") {
  const allQ = allInLang(lang);
  const picked = [];
  DOMAINS.forEach((d) => {
    const pool = shuffle(allQ.filter((q) => q.domain === d.id));
    const want = Math.round((chapterWeight(d.chapter) / META.total) * META.examFormat.questions);
    picked.push(...pool.slice(0, want));
  });
  let pool = shuffle(picked);
  if (pool.length > META.examFormat.questions) pool = pool.slice(0, META.examFormat.questions);
  if (pool.length < META.examFormat.questions) {
    const used = new Set(pool.map((q) => q.id));
    const extra = shuffle(allQ).filter((q) => !used.has(q.id));
    pool.push(...extra.slice(0, META.examFormat.questions - pool.length));
  }
  return shuffle(pool);
}

export function coverageByDomain(seenMap) {
  const result = {};
  DOMAINS.forEach((d) => {
    const total = ALL.filter((q) => q.domain === d.id).length;
    const seen = ALL.filter((q) => q.domain === d.id && seenMap[q.id]).length;
    result[d.id] = { seen, total };
  });
  return result;
}

export function shuffle(arr) {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Embaralha as alternativas mantendo o controle de qual é a correta.
export function shuffleOptions(q) {
  return shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
}
