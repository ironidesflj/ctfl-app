import { useState, useMemo } from "react";
import { DOMAINS, domainNameInLang, chapterWeight, META, coverageByDomain } from "../lib/bank.js";
import { SYLLABUS_ITEMS, syllabusInLang } from "../data/study.js";
import { t } from "../lib/ui-strings.js";

const hasEN = (id) => !!SYLLABUS_ITEMS.find((i) => i.id === id)?.locales?.en;

export default function Syllabus({ onStudy, lang = "pt", progress }) {
  const [domain, setDomain] = useState("all");

  const allItems = useMemo(() => syllabusInLang(lang), [lang]);
  const items = useMemo(
    () => (domain === "all" ? allItems : allItems.filter((i) => i.d === domain)),
    [domain, allItems]
  );
  const dom = DOMAINS.find((d) => d.id === domain);

  const coverage = coverageByDomain(progress?.seen || {});
  const itemsByDomain = domain === "all"
    ? DOMAINS.map((d) => ({ d, list: allItems.filter((i) => i.d === d.id) }))
    : null;

  return (
    <div className="study">
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => setDomain("all")}>{t(lang, "domainAll")}</button>
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => setDomain(d.id)}>{domainNameInLang(d.id, lang)}</button>
        ))}
      </div>

      <div className="card">
        {domain === "all" ? (
          itemsByDomain.map(({ d, list }) => {
            const cov = coverage[d.id];
            const pct = cov.total > 0 ? Math.round((cov.seen / cov.total) * 100) : 0;
            return (
              <details key={d.id} className="syl-chapter">
                <summary className="syl-chapter-summary">
                  <span>{domainNameInLang(d.id, lang)}</span>
                  <span className="syl-chapter-progress">
                    <span className="bar"><span className="bar-fill" style={{ width: pct + "%" }} /></span>
                    <span className="muted">{pct}%</span>
                  </span>
                </summary>
                {list.map((i) => (
                  <div className="syl-item" key={i.id}>
                    <div className="syl-kw">{i.kw}</div>
                    <div className="syl-desc">{i.desc}</div>
                    {lang === "en" && !hasEN(i.id) && (
                      <span style={{fontSize:'11px', color:'var(--text-3)'}}>EN coming soon · showing PT</span>
                    )}
                  </div>
                ))}
              </details>
            );
          })
        ) : (
          <>
            {dom && <p className="syl-head">{chapterWeight(dom.chapter)} {t(lang, "syllabus.ofQuestions", { total: META.total })}</p>}
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
                {t(lang, "syllabus.studyChapter")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
