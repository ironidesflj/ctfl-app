import { useState, useMemo } from "react";
import { DOMAINS, domainNameInLang, byIds } from "../lib/bank.js";
import { getWrongIds } from "../lib/storage.js";
import { localizedGlossary, findGlossaryTermsInText } from "../data/glossary.js";
import { t } from "../lib/ui-strings.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function highlightText(text, query) {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part
  );
}

export default function Glossary({ lang = "pt", progress }) {
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [wrongOnly, setWrongOnly] = useState(false);

  const allTerms = useMemo(() => localizedGlossary(lang), [lang]);
  const dom = DOMAINS.find((d) => d.id === domain);

  const wrongTermIds = useMemo(() => {
    if (!progress) return new Set();
    const wrongIds = getWrongIds(progress);
    if (wrongIds.length === 0) return new Set();
    const wrongQuestions = byIds(wrongIds);
    const idSet = new Set();
    wrongQuestions.forEach((q) => {
      findGlossaryTermsInText(q.exp, lang).forEach((m) => idSet.add(m.id));
    });
    return idSet;
  }, [progress, lang]);

  const termOfDay = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    return allTerms[dayOfYear % allTerms.length];
  }, [allTerms]);

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

  function jumpToLetter(letter) {
    const el = document.getElementById(`glossary-letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  let lastLetter = null;

  return (
    <div className="study">
      <div className="card glossary-term-of-day">
        <span className="card-eyebrow">{t(lang, "glossary.termOfDay")}</span>
        <div className="syl-kw">{termOfDay.term}</div>
        <div className="syl-desc">{termOfDay.def}</div>
      </div>

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
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => setDomain(d.id)}>
            {domainNameInLang(d.id, lang)}
          </button>
        ))}
        {progress && (
          <button
            className={"chip" + (wrongOnly ? " on" : "")}
            onClick={() => setWrongOnly((w) => !w)}
            disabled={wrongTermIds.size === 0}
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
        {sortedTerms.length === 0 ? (
          <div>
            <p className="muted">{lang === "pt" ? "Nenhum termo encontrado." : "No terms found."}</p>
            {query.trim() !== "" && (
              <button className="btn" onClick={() => setQuery("")}>
                {t(lang, "glossary.clearSearch")}
              </button>
            )}
          </div>
        ) : (
          sortedTerms.map((term) => {
            const firstLetter = term.term[0].toUpperCase();
            const isNewLetter = showAZIndex && firstLetter !== lastLetter;
            if (isNewLetter) lastLetter = firstLetter;
            return (
              <div key={term.id}>
                {isNewLetter && (
                  <div id={`glossary-letter-${firstLetter}`} className="glossary-letter-heading">
                    {firstLetter}
                  </div>
                )}
                <div className="syl-item">
                  <div className="syl-kw">{highlightText(term.term, query)}</div>
                  <div className="syl-desc">{highlightText(term.def, query)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
