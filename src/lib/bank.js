import bank from "../data/ctfl-questions-ptbr.json";

export const META = bank.meta;
export const LANG = META.defaultLanguage; // "pt"

export const DOMAINS = [
  { id: "fund", name: "Fundamentos", chapter: 1 },
  { id: "proc", name: "Teste no Ciclo", chapter: 2 },
  { id: "est", name: "Teste Estático", chapter: 3 },
  { id: "tec", name: "Técnicas de Teste", chapter: 4 },
  { id: "mgmt", name: "Gerenc. de Teste", chapter: 5 },
  { id: "fer", name: "Ferramentas", chapter: 6 }
];

export const domainName = (id) => DOMAINS.find((d) => d.id === id)?.name || id;
export const chapterWeight = (chapter) => META.chapterWeights[String(chapter)] || 0;

// Texto da questão no idioma corrente, com índice de resposta neutro.
export function localized(q, lang = LANG) {
  const loc = q.locales[lang] || q.locales[META.defaultLanguage];
  return { id: q.id, domain: q.domain, chapter: q.chapter, kLevel: q.kLevel, answer: q.answer, ...loc };
}

export const ALL = bank.questions.map((q) => localized(q));

export function byDomain(domainId) {
  if (domainId === "all") return ALL;
  return ALL.filter((q) => q.domain === domainId);
}

export function shuffle(arr) {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Amostra de simulado: 40 questões na proporção dos capítulos do exame.
export function buildExam(size = META.examFormat.questions) {
  const picked = [];
  DOMAINS.forEach((d) => {
    const want = Math.round((chapterWeight(d.chapter) / META.total) * size);
    picked.push(...shuffle(byDomain(d.id)).slice(0, want));
  });
  // ajuste fino para bater o tamanho exato
  let pool = shuffle(picked);
  if (pool.length > size) pool = pool.slice(0, size);
  if (pool.length < size) {
    const used = new Set(pool.map((q) => q.id));
    const extra = shuffle(ALL).filter((q) => !used.has(q.id));
    pool.push(...extra.slice(0, size - pool.length));
  }
  return shuffle(pool);
}

// Embaralha as alternativas mantendo o controle de qual é a correta.
export function shuffleOptions(q) {
  return shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
}
