import { useState, useMemo } from "react";
import { DOMAINS, domainNameInLang } from "../lib/bank.js";
import { FLASHCARDS, flashcardsInLang } from "../data/study.js";
import { t } from "../lib/ui-strings.js";
import { getSRSCard, updateSRSCard, getDueItems } from "../lib/storage.js";
import { initSM2, sm2, QUALITY } from "../lib/spacedRepetition.js";

const hasEN = (id) => !!FLASHCARDS.find((c) => c.id === id)?.locales?.en;

export default function Flashcards({ lang = "pt", progress, setProgress }) {
  const [domain, setDomain] = useState("all");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const allCards = useMemo(() => flashcardsInLang(lang), [lang]);
  const dueIds = progress ? getDueItems(progress, FLASHCARDS.map((c) => c.id)) : [];
  const cards = useMemo(
    () => (domain === "due" ? allCards.filter((c) => dueIds.includes(c.id)) : domain === "all" ? allCards : allCards.filter((c) => c.d === domain)),
    [domain, allCards, dueIds]
  );

  const card = cards[idx] || cards[0] || null;

  function go(delta) {
    setFlipped(false);
    setIdx((i) => (i + delta + cards.length) % cards.length);
  }
  function pickDomain(d) {
    setDomain(d);
    setIdx(0);
    setFlipped(false);
  }

  function rate(label) {
    if (!card) return;
    const srsCard = getSRSCard(progress, card.id) || initSM2();
    const updated = sm2(srsCard, QUALITY[label]);
    setProgress((p) => updateSRSCard(p, card.id, updated));
    go(1);
  }

  return (
    <div className="study">
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => pickDomain("all")}>{t(lang, "domainAll")}</button>
        {dueIds.length > 0 && (
          <button className={"chip" + (domain === "due" ? " on" : "")} onClick={() => pickDomain("due")}>
            {t(lang, "flashcards.dueToday")} ({dueIds.length})
          </button>
        )}
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => pickDomain(d.id)}>{domainNameInLang(d.id, lang)}</button>
        ))}
      </div>

      {!card ? (
        <p className="muted">{t(lang, "flashcards.dueToday")}: 0</p>
      ) : (
      <>
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

      {flipped && (
        <div className="srs-quality">
          <button className="btn" onClick={() => rate("again")}>{t(lang, "flashcards.again")}</button>
          <button className="btn" onClick={() => rate("hard")}>{t(lang, "flashcards.hard")}</button>
          <button className="btn" onClick={() => rate("good")}>{t(lang, "flashcards.good")}</button>
          <button className="btn" onClick={() => rate("easy")}>{t(lang, "flashcards.easy")}</button>
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={() => go(-1)}>{t(lang, "flashcards.prev")}</button>
        <span className="muted center-num">{idx + 1} / {cards.length}</span>
        <button className="btn" onClick={() => go(1)}>{t(lang, "flashcards.next")}</button>
      </div>
      </>
      )}
    </div>
  );
}
