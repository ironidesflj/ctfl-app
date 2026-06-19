import { useState, useMemo } from "react";
import { DOMAINS, domainNameInLang } from "../lib/bank.js";
import { FLASHCARDS, flashcardsInLang } from "../data/study.js";
import { t } from "../lib/ui-strings.js";

const hasEN = (id) => !!FLASHCARDS.find((c) => c.id === id)?.locales?.en;

export default function Flashcards({ lang = "pt" }) {
  const [domain, setDomain] = useState("all");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const allCards = useMemo(() => flashcardsInLang(lang), [lang]);
  const cards = useMemo(
    () => (domain === "all" ? allCards : allCards.filter((c) => c.d === domain)),
    [domain, allCards]
  );

  const card = cards[idx] || cards[0];

  function go(delta) {
    setFlipped(false);
    setIdx((i) => (i + delta + cards.length) % cards.length);
  }
  function pickDomain(d) {
    setDomain(d);
    setIdx(0);
    setFlipped(false);
  }

  return (
    <div className="study">
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => pickDomain("all")}>{t(lang, "domainAll")}</button>
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => pickDomain(d.id)}>{domainNameInLang(d.id, lang)}</button>
        ))}
      </div>

      <button className="card flash" onClick={() => setFlipped((f) => !f)}>
        {lang === "en" && !hasEN(card.id) && (
          <span style={{fontSize:'11px', color:'var(--text-3)'}}>EN coming soon · showing PT</span>
        )}
        {!flipped ? (
          <>
            <span className="flash-front">{card.front}</span>
            <span className="flash-hint">{t(lang, "flashcards.flip")}</span>
          </>
        ) : (
          <span className="flash-back">{card.back}</span>
        )}
      </button>

      <div className="actions">
        <button className="btn" onClick={() => go(-1)}>{t(lang, "flashcards.prev")}</button>
        <span className="muted center-num">{idx + 1} / {cards.length}</span>
        <button className="btn" onClick={() => go(1)}>{t(lang, "flashcards.next")}</button>
      </div>
    </div>
  );
}
