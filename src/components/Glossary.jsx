import { useState, useMemo } from "react";
import { DOMAINS, domainNameInLang } from "../lib/bank.js";
import { localizedGlossary } from "../data/glossary.js";
import { t } from "../lib/ui-strings.js";

export default function Glossary({ lang = "pt" }) {
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");

  const allTerms = useMemo(() => localizedGlossary(lang), [lang]);
  const dom = DOMAINS.find((d) => d.id === domain);

  const terms = useMemo(() => {
    let list = dom ? allTerms.filter((t) => t.chapter === dom.chapter) : allTerms;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTerms, dom, query]);

  return (
    <div className="study">
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
      </div>

      <div className="card">
        {terms.length === 0 ? (
          <p className="muted">{lang === "pt" ? "Nenhum termo encontrado." : "No terms found."}</p>
        ) : (
          terms.map((t) => (
            <div className="syl-item" key={t.id}>
              <div className="syl-kw">{t.term}</div>
              <div className="syl-desc">{t.def}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
