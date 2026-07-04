import { useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import { getWrongIds } from "../lib/storage.js";
import { localizedGlossary, findGlossaryTermsInText } from "../data/glossary.js";
import { t } from "../lib/ui-strings.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const EMPTY_STATE_TEXT = {
  pt: "Conteúdo em breve para esta certificação.",
  en: "Content coming soon for this certification.",
};

// ponytail: glossary entries have no cert/domain field, only ids like
// "gl-fund-01" that encode the CTFL domain code. Derive it from the id so
// this stays dynamic when content for other certs is added later.
const domainFromId = (id) => id.split("-")[1];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, query, regex) {
  if (!text || !regex) return text;
  const parts = text.split(regex);
  const q = query.trim().toLowerCase();
  return parts.map((part, i) =>
    part.toLowerCase() === q ? <mark key={i}>{part}</mark> : part
  );
}

export default function Glossary({ lang = "pt", progress }) {
  const { cert: certId } = useParams();
  const bank = useMemo(() => getBank(certId), [certId]);
  const { chapters, chapterName, allInLang } = bank;
  
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [wrongOnly, setWrongOnly] = useState(false);
  const headingRefs = useRef({});

  const certDomains = useMemo(() => new Set(chapters.map((c) => c.domain)), [chapters]);
  const allTerms = useMemo(
    () => localizedGlossary(lang).filter((term) => certDomains.has(domainFromId(term.id))),
    [lang, certDomains]
  );
  const hasContent = allTerms.length > 0;
  const dom = chapters.find((c) => String(c.chapter) === String(domain));

  const wrongTermIds = useMemo(() => {
    if (!progress) return new Set();
    const wrongIds = getWrongIds(progress);
    if (wrongIds.length === 0) return new Set();
    const wrongIdSet = new Set(wrongIds);
    const wrongQuestions = allInLang(lang).filter((q) => wrongIdSet.has(q.id));
    const idSet = new Set();
    wrongQuestions.forEach((q) => {
      findGlossaryTermsInText(q.exp, lang).forEach((m) => idSet.add(m.id));
    });
    return idSet;
  }, [progress, lang]);

  const termOfDay = useMemo(() => {
    if (allTerms.length === 0) return null;
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    return allTerms[dayOfYear % allTerms.length];
  }, [allTerms]);

  const searchRegex = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return new RegExp(`(${escapeRegex(q)})`, "gi");
  }, [query]);

  const terms = useMemo(() => {
    let list = dom ? allTerms.filter((t) => t.chapter === dom.chapter) : allTerms;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
      );
    }
    if (wrongOnly) {
      list = list.filter((t) => wrongTermIds.has(t.id));
    }
    return list;
  }, [allTerms, dom, query, wrongOnly, wrongTermIds]);

  const showAZIndex = domain === "all" && query.trim() === "" && !wrongOnly;

  const sortedTerms = useMemo(() => {
    if (!showAZIndex) return terms;
    return [...terms].sort((a, b) => a.term.localeCompare(b.term, lang));
  }, [terms, showAZIndex, lang]);

  const availableLetters = useMemo(() => {
    if (!showAZIndex) return new Set();
    return new Set(sortedTerms.map((t) => t.term[0].toUpperCase()));
  }, [sortedTerms, showAZIndex]);

  // Agrupamento por letra calculado uma vez aqui, fora do JSX
  // (antes mutava uma variável `lastLetter` durante o .map de render).
  const termsWithLetterFlag = useMemo(() => {
    let last = null;
    return sortedTerms.map((term) => {
      const firstLetter = term.term[0].toUpperCase();
      const isNewLetter = showAZIndex && firstLetter !== last;
      if (isNewLetter) last = firstLetter;
      return { term, firstLetter, isNewLetter };
    });
  }, [sortedTerms, showAZIndex]);

  function jumpToLetter(letter) {
    const el = headingRefs.current[letter];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus();
    }
  }

  if (!hasContent) {
    return (
      <div className="study">
        <div className="card">
          <p className="muted">{EMPTY_STATE_TEXT[lang]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study">
      {termOfDay && (
        <div className="card glossary-term-of-day">
          <span className="card-eyebrow">{t(lang, "glossary.termOfDay")}</span>
          <div className="syl-kw">{termOfDay.term}</div>
          <div className="syl-desc">{termOfDay.def}</div>
        </div>
      )}

      <input
        className="search-input"
        placeholder={lang === "pt" ? "Buscar termo..." : "Search term..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => setDomain("all")}>
          {t(lang, "domainAll")}
        </button>
        {chapters.map((c) => (
          <button key={c.chapter} className={"chip" + (domain === String(c.chapter) ? " on" : "")} onClick={() => setDomain(String(c.chapter))}>
            {chapterName(c.chapter, lang)}
          </button>
        ))}
        {progress && (
          <button
            className={"chip" + (wrongOnly ? " on" : "")}
            onClick={() => setWrongOnly((w) => !w)}
            disabled={wrongTermIds.size === 0}
            aria-pressed={wrongOnly}
          >
            {t(lang, "glossary.wrongOnly")} ({wrongTermIds.size})
          </button>
        )}
      </div>

      {showAZIndex && (
        <div className="glossary-az-index">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              className="glossary-az-letter"
              disabled={!availableLetters.has(letter)}
              onClick={() => jumpToLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      <div className="card">
        {termsWithLetterFlag.length === 0 ? (
          <div>
            <p className="muted">{lang === "pt" ? "Nenhum termo encontrado." : "No terms found."}</p>
            {query.trim() !== "" && (
              <button className="btn" onClick={() => setQuery("")}>
                {t(lang, "glossary.clearSearch")}
              </button>
            )}
          </div>
        ) : (
          termsWithLetterFlag.map(({ term, firstLetter, isNewLetter }) => (
            <div key={term.id}>
              {isNewLetter && (
                <div
                  ref={(el) => { headingRefs.current[firstLetter] = el; }}
                  tabIndex={-1}
                  className="glossary-letter-heading"
                >
                  {firstLetter}
                </div>
              )}
              <div className="syl-item">
                <div className="syl-kw">{highlightText(term.term, query, searchRegex)}</div>
                <div className="syl-desc">{highlightText(term.def, query, searchRegex)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
