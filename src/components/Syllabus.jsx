import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import { SYLLABUS_ITEMS, syllabusInLang } from "../data/study.js";
import { t } from "../lib/ui-strings.js";

const hasEN = (id) => !!SYLLABUS_ITEMS.find((i) => i.id === id)?.locales?.en;

export default function Syllabus({ onStudy, lang = "pt", progress }) {
  const { cert: certId } = useParams();
  const bank = useMemo(() => getBank(certId), [certId]);
  const { chapters, chapterName, chapterWeight, META, coverageByChapter } = bank;
  
  const [domain, setDomain] = useState("all"); // conceptually chapterId now

  const allItems = useMemo(() => syllabusInLang(lang), [lang]);
  const items = useMemo(
    () => (domain === "all" ? allItems : allItems.filter((i) => i.d === chapters.find(c => String(c.chapter) === String(domain))?.domain)),
    [domain, allItems, chapters]
  );
  const dom = chapters.find((c) => String(c.chapter) === String(domain));

  const coverage = coverageByChapter(progress?.seen || {});
  const itemsByDomain = domain === "all"
    ? chapters.map((c) => ({ c, list: allItems.filter((i) => i.d === c.domain) }))
    : null;

  return (
    <div className="study">
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => setDomain("all")}>{t(lang, "domainAll")}</button>
        {chapters.map((c) => (
          <button key={c.chapter} className={"chip" + (domain === String(c.chapter) ? " on" : "")} onClick={() => setDomain(String(c.chapter))}>{chapterName(c.chapter, lang)}</button>
        ))}
      </div>

      <div className="card">
        {domain === "all" ? (
          itemsByDomain.map(({ c, list }) => {
            const cov = coverage[c.chapter];
            const pct = cov?.total > 0 ? Math.round((cov.seen / cov.total) * 100) : 0;
            return (
              <details key={c.chapter} className="syl-chapter">
                <summary className="syl-chapter-summary">
                  <span>{chapterName(c.chapter, lang)}</span>
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
