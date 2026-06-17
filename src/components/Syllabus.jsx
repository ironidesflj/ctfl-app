import { useState, useMemo } from "react";
import { DOMAINS, chapterWeight, META } from "../lib/bank.js";
import { SYLLABUS_ITEMS } from "../data/study.js";

export default function Syllabus({ onStudy, lang = "pt" }) {
  const [domain, setDomain] = useState("all");

  const items = useMemo(
    () => (domain === "all" ? SYLLABUS_ITEMS : SYLLABUS_ITEMS.filter((i) => i.d === domain)),
    [domain]
  );
  const dom = DOMAINS.find((d) => d.id === domain);

  return (
    <div className="study">
      {lang === "en" && (
        <div style={{fontSize:'12px', color:'var(--text-3)', marginBottom:'0.5rem'}}>
          English syllabus coming soon
        </div>
      )}
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => setDomain("all")}>Todos</button>
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => setDomain(d.id)}>{d.name}</button>
        ))}
      </div>

      <div className="card">
        {dom && <p className="syl-head">{chapterWeight(dom.chapter)} de {META.total} questões neste banco</p>}
        {items.map((i, k) => (
          <div className="syl-item" key={k}>
            <div className="syl-kw">{i.kw}</div>
            <div className="syl-desc">{i.desc}</div>
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
