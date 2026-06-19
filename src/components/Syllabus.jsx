import { useState, useMemo } from "react";
import { DOMAINS, chapterWeight, META } from "../lib/bank.js";
import { SYLLABUS_ITEMS, syllabusInLang } from "../data/study.js";

const hasEN = (id) => !!SYLLABUS_ITEMS.find((i) => i.id === id)?.locales?.en;

export default function Syllabus({ onStudy, lang = "pt" }) {
  const [domain, setDomain] = useState("all");

  const allItems = useMemo(() => syllabusInLang(lang), [lang]);
  const items = useMemo(
    () => (domain === "all" ? allItems : allItems.filter((i) => i.d === domain)),
    [domain, allItems]
  );
  const dom = DOMAINS.find((d) => d.id === domain);

  return (
    <div className="study">
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => setDomain("all")}>Todos</button>
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => setDomain(d.id)}>{d.name}</button>
        ))}
      </div>

      <div className="card">
        {dom && <p className="syl-head">{chapterWeight(dom.chapter)} de {META.total} questões neste banco</p>}
        {items.map((i) => (
          <div className="syl-item" key={i.id}>
            <div className="syl-kw">{i.kw}</div>
            <div className="syl-desc">{i.desc}</div>
            {lang === "en" && !hasEN(i.id) && (
              <span style={{fontSize:'11px', color:'var(--text-3)'}}>EN coming soon · showing PT</span>
            )}
          </div>
        ))}
        {dom && (
          <button className="btn primary" onClick={() => onStudy(domain)}>
            Estudar este capítulo →
          </button>
        )}
      </div>
    </div>
  );
}
