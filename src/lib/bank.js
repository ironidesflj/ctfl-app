import { CERTS } from "./certs.config.js";

/* ── r5: code-split do banco por cert (backlog #1 de performance) ──────
   Antes: `import monolith from "../data/synapse-question-bank.json"` —
   2,4MB/1100 questões (5 certs) no bundle INICIAL de todo usuário,
   mesmo quem só usa CTFL (300 questões).

   Agora: cada cert LIVE tem uma fatia própria (data/banks/{cert}.json,
   gerada por scripts/split-bank.mjs) carregada sob demanda via
   import.meta.glob — o Vite emite um chunk lazy por cert. Enquanto o
   chunk chega, o App renderiza um splash (BankGate); depois disso
   getBank() volta a ser 100% síncrono, como sempre foi — componentes e
   testes não mudam de API, só precisam garantir loadBankFor() antes.

   Monólito em src/data/ continua sendo a fonte da verdade (sync com o
   repositório canônico do banco); as fatias são derivadas dele. */
const bankFiles = import.meta.glob("../data/banks/*.json");

const slices = new Map(); // certId -> fatia {meta, questions}
const loading = new Map(); // certId -> Promise<void> (concinnidade: chamadas simultâneas compartilham o mesmo fetch)
const apiCache = new Map(); // certId -> API do banco (identidade estável por cert)
// singleton resolvido: cert já carregado devolve sempre o MESMO objeto
// Promise (identidade estável p/ callers e testes — Promise.resolve() criaria
// uma nova promessa a cada chamada)
const RESOLVED = Promise.resolve();

const norm = (certId) => String(certId || "").toLowerCase();

export function isBankLoaded(certId) {
  return slices.has(norm(certId));
}

/** Carrega a fatia do cert (idempotente e seguro para chamadas
 *  concorrentes). Resolve quando o chunk estiver disponível. */
export function loadBankFor(certId) {
  const id = norm(certId);
  if (slices.has(id)) return RESOLVED;
  if (!loading.has(id)) {
    const loader = bankFiles[`../data/banks/${id}.json`];
    if (!loader) {
      return Promise.reject(new Error(`Banco não encontrado para: "${certId}"`));
    }
    loading.set(
      id,
      loader()
        .then((mod) => {
          slices.set(id, mod.default);
          loading.delete(id);
        })
        .catch((err) => {
          loading.delete(id);
          throw err;
        })
    );
  }
  return loading.get(id);
}

/** Fatia crua do cert (para re-localização de idioma no meio do quiz —
 *  antes o Quiz.jsx importava o monólito direto p/ isso). null se não
 *  carregado. */
export function getRawBank(certId) {
  return slices.get(norm(certId)) || null;
}

export function getBank(certId) {
  const normalizedId = norm(certId);
  const cert = CERTS[normalizedId];
  if (!cert) throw new Error(`Cert desconhecida: "${certId}" (normalizado: "${normalizedId}")`);
  const monolith = slices.get(normalizedId);
  if (!monolith) {
    throw new Error(
      `Banco de "${certId}" ainda não carregado — chame loadBankFor("${normalizedId}") antes (r5 code-split)`
    );
  }
  const cached = apiCache.get(normalizedId);
  if (cached) return cached;
  const api = buildBankApi(cert, monolith);
  apiCache.set(normalizedId, api);
  return api;
}

function buildBankApi(cert, monolith) {
  const chapters = cert.chapters;
  const META = monolith.meta;

  const matchesChapter = (a, b) => String(a) === String(b);

  // Backlog r3 (#3): o campo q.cert é o filtro PRIMÁRIO do pool — antes o
  // casamento era só por (chapter, domain), um invariante implícito: qualquer
  // colisão futura de pares entre certs contaminaria o pool silenciosamente.
  // Verificado: cert × (chapter, domain) batem em 1100/1100 questões, então o
  // pool é idêntico ao anterior — agora protegido por garantia explícita.
  // Fallback (chapter, domain) só quando a questão não declara cert.
  // (r5: o filtro roda sobre a FATIA do cert, que o split-bank.mjs gerou
  // com esta mesma regra — o pool permanece idêntico ao do monólito.)
  const rawQuestions = monolith.questions.filter((q) => {
    if (typeof q.cert === "string" && q.cert) {
      return q.cert.toLowerCase() === cert.id;
    }
    return chapters.some((c) => matchesChapter(c.chapter, q.chapter) && c.domain === q.domain);
  });

  function localized(q, lang = "pt") {
    const loc = q.locales[lang] || q.locales["pt"];
    return {
      id: q.id,
      domain: q.domain,
      chapter: q.chapter,
      kLevel: q.kLevel,
      answer: q.answer,
      ...loc,
    };
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

  // r5: helpers de re-localização — o Quiz.jsx importava o monólito (2,4MB)
  // direto só para trocar o idioma das questões em exibição no meio da sessão
  // e checar se uma questão tem tradução EN. Ambos agora vivem aqui, lendo a
  // fatia já carregada — o componente não conhece mais a estrutura do arquivo.
  function relocalize(list, lang = "pt") {
    const byId = new Map(rawQuestions.map((q) => [q.id, q]));
    return list.map((sq) => {
      const raw = byId.get(sq.id);
      return raw ? localized(raw, lang) : sq;
    });
  }

  function hasEN(id) {
    const raw = rawQuestions.find((q) => q.id === id);
    return !!(raw && raw.locales && raw.locales.en);
  }

  function chapterName(chapterNum, lang = "pt") {
    const c = chapters.find((x) => matchesChapter(x.chapter, chapterNum));
    return c ? c[lang]?.name || c.pt.name : String(chapterNum);
  }

  function chapterWeight(chapterNum) {
    return (
      META.chapterWeights?.[cert.id]?.[String(chapterNum)] ??
      META.chapterWeights?.[String(chapterNum)] ??
      0
    );
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
    const examQuestions = META.examFormat[cert.id].questions;
    const blueprintChapters = META.examBlueprint?.[cert.id]?.chapters;
    const picked = [];

    if (blueprintChapters) {
      // Amostragem estratificada por (capítulo × K-level) segundo o blueprint
      // oficial (meta.examBlueprint — ISTQB Exam Structures & Rules). Antes o
      // sorteio respeitava só a proporção por capítulo e o K-level caía onde
      // calhasse; agora cada célula do blueprint é atendida exatamente:
      // ex. CTFL ch4 = 6×K2 + 5×K3, sempre. Células sem pool suficiente são
      // completadas dentro do próprio capítulo e, se preciso, do banco todo
      // (mantém o total da prova). Blueprint por capítulo == proporção de
      // chapterWeights nos certs LIVE (8/6/4/11/9/2 e 8/3/22/4/8), então a
      // distribuição por capítulo permanece idêntica à já testada.
      const used = new Set();
      chapters.forEach((c) => {
        const spec = blueprintChapters[String(c.chapter)];
        if (!spec) return;
        const chapterPool = allQ.filter((q) => matchesChapter(q.chapter, c.chapter));
        Object.entries(spec.kLevels || {}).forEach(([k, wantN]) => {
          const want = Number(wantN) || 0;
          if (want <= 0) return;
          const cell = shuffle(chapterPool.filter((q) => "K" + q.kLevel === k && !used.has(q.id)));
          const chosen = cell.slice(0, want);
          chosen.forEach((q) => used.add(q.id));
          picked.push(...chosen);
          // shortfall dentro da célula: completa com o que houver no capítulo
          if (chosen.length < want) {
            const rest = shuffle(chapterPool.filter((q) => !used.has(q.id)));
            const fill = rest.slice(0, want - chosen.length);
            fill.forEach((q) => used.add(q.id));
            picked.push(...fill);
          }
        });
      });
      // shortfall global (bank menor que a prova): completa de todo o pool
      if (picked.length < examQuestions) {
        const extra = shuffle(allQ.filter((q) => !used.has(q.id)));
        picked.push(...extra.slice(0, examQuestions - picked.length));
      }
    } else {
      // Cert sem blueprint: sorteio proporcional por chapterWeights (legado).
      const weightsTotal = Object.values(META.chapterWeights[cert.id]).reduce(
        (s, w) => s + Number(w),
        0
      );
      chapters.forEach((c) => {
        const pool = shuffle(allQ.filter((q) => matchesChapter(q.chapter, c.chapter)));
        const want = Math.round((chapterWeight(c.chapter) / weightsTotal) * examQuestions);
        picked.push(...pool.slice(0, want));
      });
      if (picked.length < examQuestions) {
        const used = new Set(picked.map((q) => q.id));
        const extra = shuffle(allQ).filter((q) => !used.has(q.id));
        picked.push(...extra.slice(0, examQuestions - picked.length));
      }
    }

    let pool = shuffle(picked);
    if (pool.length > examQuestions) pool = pool.slice(0, examQuestions);
    return shuffle(pool);
  }

  // r4: simulado personalizado — amostra do subconjunto (capítulos × K-levels)
  // escolhido pelo usuário, com sorteio proporcional ao peso de blueprint
  // DENTRO da seleção e fallback intra-seleção quando uma célula falta
  // (mesma filosofia de shortfall do buildExamInLang, restrita ao pool
  // escolhido — nunca puxa questão de fora dos filtros do usuário).
  // count > pool → devolve o pool inteiro (caller valida pool vazio).
  function buildCustomExamInLang(lang, { chapters: selChapters, kLevels = [], count }) {
    const allQ = allInLang(lang);
    const chapterSet = new Set(
      (selChapters && selChapters.length > 0
        ? selChapters
        : chapters.map((c) => String(c.chapter))
      ).map(String)
    );
    const kSet = new Set((kLevels || []).map((k) => "K" + k));
    let pool = allQ.filter((q) => chapterSet.has(String(q.chapter)));
    if (kSet.size > 0) pool = pool.filter((q) => kSet.has("K" + q.kLevel));

    const want = Math.max(1, Math.min(Number(count) || 10, pool.length));
    const selChaptersArr = chapters.filter((c) => chapterSet.has(String(c.chapter)));
    const weights = selChaptersArr.map((c) => Number(chapterWeight(c.chapter)) || 1);
    const weightsTotal = weights.reduce((s, w) => s + w, 0) || 1;

    const picked = [];
    const used = new Set();
    selChaptersArr.forEach((c, i) => {
      const cPool = shuffle(
        pool.filter((q) => matchesChapter(q.chapter, c.chapter) && !used.has(q.id))
      );
      const n = Math.min(Math.round((weights[i] / weightsTotal) * want), cPool.length);
      cPool.slice(0, n).forEach((q) => {
        used.add(q.id);
        picked.push(q);
      });
    });
    if (picked.length < want) {
      const extra = shuffle(pool.filter((q) => !used.has(q.id)));
      picked.push(...extra.slice(0, want - picked.length));
    }
    // overshoot: Math.round por capítulo pode somar mais que `want`
    // (ex: CTFL 10 questões → 2+2+1+3+2+1 = 11). Trim SEM viés: embaralha
    // antes de cortar, senão os últimos capítulos da lista seriam
    // sistematicamente sacrificados (mesmo padrão do buildExamInLang).
    let out = shuffle(picked);
    if (out.length > want) out = out.slice(0, want);
    return out;
  }

  // r5: sessão "🎯 treinar pontos fracos" (modo Estudo). Seleciona até 3
  // capítulos com ≥3 respostas e acerto <80% (se todos passarem de 80%,
  // usa o pior deles — sempre há algo para polir). Dentro de cada
  // capítulo a ordem prioriza: questões erradas antes, depois nunca
  // vistas, por fim o restante; a sessão intercala os capítulos
  // (round-robin) para não ficar monotemática. O caller corta no `count`
  // escolhido SEM re-embaralhar — a prioridade erradas→novas é o motivo
  // de existir da sessão. vazio quando ainda não há dados por capítulo.
  function buildWeakFocusInLang(lang, byDomain = {}, { seen = {}, wrongIds = [] } = {}) {
    const MIN_ATTEMPTS = 3;
    const FOCUS_ACC = 0.8;
    const MAX_CHAPTERS = 3;
    const stats = chapters
      .map((c) => {
        const bd = byDomain[String(c.chapter)];
        return bd && bd.t >= MIN_ATTEMPTS ? { ch: String(c.chapter), acc: bd.c / bd.t } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.acc - b.acc);
    if (stats.length === 0) return [];
    let focus = stats.filter((s) => s.acc < FOCUS_ACC).slice(0, MAX_CHAPTERS);
    if (focus.length === 0) focus = [stats[0]];

    const wrongSet = new Set(wrongIds);
    const queues = focus.map((s) => {
      const pool = allInLang(lang).filter((q) => String(q.chapter) === s.ch);
      const wrong = shuffle(pool.filter((q) => wrongSet.has(q.id)));
      const fresh = shuffle(pool.filter((q) => !wrongSet.has(q.id) && !seen[q.id]));
      const rest = shuffle(pool.filter((q) => !wrongSet.has(q.id) && seen[q.id]));
      return [...wrong, ...fresh, ...rest];
    });

    // round-robin entre os capítulos focados
    const out = [];
    for (let i = 0; ; i++) {
      let pickedAny = false;
      for (const q of queues) {
        if (q.length > i) {
          out.push(q[i]);
          pickedAny = true;
        }
      }
      if (!pickedAny) break;
    }
    return out;
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
    cert,
    chapters,
    META,
    ALL,
    localized,
    byIds,
    allInLang,
    byChapterInLang,
    relocalize,
    hasEN,
    chapterName,
    chapterWeight,
    shuffle,
    shuffleOptions,
    buildExamInLang,
    buildCustomExamInLang,
    buildWeakFocusInLang,
    coverageByChapter,
    coverageByKLevel,
  };
}
