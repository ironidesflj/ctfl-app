"use client";

/* ===========================================================
   Synapse · views/Glossario.tsx
   Glossário da prova ativa — porta fiel de js/glossario.js.
   Termos oficiais ISTQB em PT/EN, busca sem acento, filtro por
   capítulo e estado vazio honesto. O estado local (busca,
   capítulo) reseta sozinho: o Shell remonta a view ao trocar
   de prova.
   =========================================================== */

import { useRef, useState } from "react";
import { fmt, pad2, useSynapse } from "../store";
import { GLOSSARY } from "../data/glossary";
import type { Lang } from "../types";

/* ---------- copy local (bloco COPY do protótipo, verbatim) ---------- */

type GlossaryCopy = {
  kicker: string;
  title: string;
  lead: string;
  search: string;
  termsTitle: string;
  filterLabel: string;
  all: string;
  count: string;
  countFiltered: string;
  none: string;
  noneBody: string;
  clear: string;
  chapter: string;
  emptyTitle: string;
  emptyBody: string;
  source: string;
  footnote: string;
  noCert: string;
};

const COPY: Record<Lang, GlossaryCopy> = {
  pt: {
    kicker: "Glossário",
    title: "As palavras da prova.",
    lead: "Termos oficiais do ISTQB no idioma da interface, ligados aos capítulos da {code}.",
    search: "Buscar termo ou definição",
    termsTitle: "Termos da prova",
    filterLabel: "Filtrar por capítulo",
    all: "Todos os capítulos",
    count: "{n} termos",
    countFiltered: "{n} de {total} termos",
    none: "Nenhum termo corresponde a “{q}”.",
    noneBody: "Tente outra palavra ou limpe o filtro.",
    clear: "Limpar busca",
    chapter: "Capítulo {n}",
    emptyTitle: "Esta prova ainda não tem glossário.",
    emptyBody: "Os termos aparecem quando o banco desta prova chegar.",
    source: "Fonte: ISTQB Glossary",
    footnote: "Termos oficiais · PT/EN",
    noCert: "Sem prova ativa",
  },
  en: {
    kicker: "Glossary",
    title: "The words of the exam.",
    lead: "Official ISTQB terms in the interface language, linked to the {code} chapters.",
    search: "Search term or definition",
    termsTitle: "Exam terms",
    filterLabel: "Filter by chapter",
    all: "All chapters",
    count: "{n} terms",
    countFiltered: "{n} of {total} terms",
    none: "No term matches “{q}”.",
    noneBody: "Try another word or clear the filter.",
    clear: "Clear search",
    chapter: "Chapter {n}",
    emptyTitle: "This exam has no glossary yet.",
    emptyBody: "Terms appear when this exam’s bank arrives.",
    source: "Source: ISTQB Glossary",
    footnote: "Official terms · PT/EN",
    noCert: "No active exam",
  },
};

/* ---------- busca sem acento (igual ao protótipo) ---------- */

function normalize(value: string): string {
  try {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  } catch {
    return String(value).toLowerCase();
  }
}

export function Glossario() {
  const ss = useSynapse();
  const lang = ss.state.lang;
  const c = ss.cert();
  const copy = COPY[lang] || COPY.pt;

  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState<"all" | number>("all");
  const searchRef = useRef<HTMLInputElement | null>(null);

  /* termos da prova ativa */
  const entries = GLOSSARY.filter((g) => g.cert === ss.state.cert);
  const all = entries.length;

  const rows = entries
    .filter((g) => {
      if (chapter !== "all" && Number(g.chapter) !== Number(chapter)) return false;
      const q = normalize(query.trim());
      if (!q) return true;
      const term = g[lang] || g.pt;
      return normalize(term.term).indexOf(q) !== -1 || normalize(term.def).indexOf(q) !== -1;
    })
    .sort((a, b) => {
      const ta = (a[lang] || a.pt).term;
      const tb = (b[lang] || b.pt).term;
      return ta.localeCompare(tb, lang === "pt" ? "pt-BR" : "en", { sensitivity: "base" });
    });

  const countText =
    query.trim() || chapter !== "all"
      ? fmt(copy.countFiltered, { n: rows.length, total: all })
      : fmt(copy.count, { n: all });

  function chapterName(n: number): string {
    const ch = ss.chapterOf(n);
    return ch ? ch.name[lang] : "";
  }

  function clearSearch() {
    setQuery("");
    setChapter("all");
    searchRef.current?.focus();
  }

  /* ---------- lista ---------- */

  let list: React.ReactNode;
  if (!all) {
    list = (
      <div className="gl-empty" data-od-id="glossario-vazio">
        <h2>{copy.emptyTitle}</h2>
        <p>{copy.emptyBody}</p>
      </div>
    );
  } else if (!rows.length) {
    list = (
      <div className="gl-empty">
        <h2>{fmt(copy.none, { q: query.trim() })}</h2>
        <p>{copy.noneBody}</p>
        <button type="button" className="btn secondary sm" onClick={clearSearch}>
          {copy.clear}
        </button>
      </div>
    );
  } else {
    list = (
      <ol className="gl-list" data-od-id="glossario-termos">
        {rows.map((g) => {
          const term = g[lang] || g.pt;
          return (
            <li className="gl-term" id={g.id} key={g.id}>
              <div className="gl-term-head">
                <h3>{term.term}</h3>
                <span className="gl-ch">
                  {fmt(copy.chapter, { n: pad2(g.chapter) })} · {chapterName(g.chapter)}
                </span>
              </div>
              <p className="gl-def">{term.def}</p>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <>
      <section className="hero empty-hero" data-od-id="glossario-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {copy.kicker} · {c.code}
          </span>
          <h1>{copy.title}</h1>
          <p className="lead">{fmt(copy.lead, { code: c.code })}</p>
        </div>
      </section>

      {all ? (
        <div className="gl-tools" data-od-id="glossario-filtros">
          <div className="gl-search-wrap">
            <label className="sr-only" htmlFor="glSearch">
              {copy.search}
            </label>
            <input
              className="gl-search"
              id="glSearch"
              type="search"
              autoComplete="off"
              placeholder={copy.search}
              value={query}
              ref={searchRef}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span className="gl-count" aria-live="polite">
            {countText}
          </span>
          <div className="gl-chips" role="group" aria-label={copy.filterLabel}>
            <button
              type="button"
              className="gl-chip"
              aria-pressed={chapter === "all"}
              onClick={() => setChapter("all")}
            >
              {copy.all}
            </button>
            {c.chapters.map((ch) => (
              <button
                type="button"
                className="gl-chip"
                key={ch.n}
                aria-pressed={chapter === ch.n}
                onClick={() => setChapter(ch.n)}
              >
                {pad2(ch.n)} · {ch.name[lang]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="sr-only" id="glTitle">
        {copy.termsTitle}
      </h2>
      <div aria-labelledby="glTitle">{list}</div>

      <p className="view-foot">
        <span>{copy.footnote}</span>
        <span>
          <a
            className="foot-link"
            href={ss.links.istqbGlossary}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.source}{" "}
            <span className="ext" aria-hidden="true">
              ↗
            </span>
          </a>
        </span>
      </p>
    </>
  );
}
