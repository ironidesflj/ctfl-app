import { useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import { FLASHCARDS, flashcardsInLang } from "../data/study.js";
import { t } from "../lib/ui-strings.js";
import { getSRSCard, updateSRSCard, getDueItems } from "../lib/storage.js";
import { initSM2, sm2, QUALITY } from "../lib/spacedRepetition.js";

const hasEN = (id) => !!FLASHCARDS.find((c) => c.id === id)?.locales?.en;

const EMPTY_STATE_TEXT = {
  pt: "Conteúdo em breve para esta certificação.",
  en: "Content coming soon for this certification.",
};

export default function Flashcards({ lang = "pt", progress, setProgress }) {
  const { cert: certId } = useParams();
  const bank = useMemo(() => getBank(certId), [certId]);
  const { chapters, chapterName } = bank;

  const [domain, setDomain] = useState("all"); // conceptually chapterId now
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);

  const touchStartX = useRef(null);
  const dragXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const SWIPE_THRESHOLD = 80;

  // ponytail: content (FLASHCARDS) only exists for CTFL domains today; scope
  // to the current cert's domain set so other certs never see CTFL cards.
  const certDomains = useMemo(() => new Set(chapters.map((c) => c.domain)), [chapters]);
  const allCards = useMemo(
    () => flashcardsInLang(lang).filter((c) => certDomains.has(c.d)),
    [lang, certDomains]
  );
  const hasContent = allCards.length > 0;
  const dueIds = progress ? getDueItems(progress, FLASHCARDS.map((c) => c.id)) : [];
  const cards = useMemo(
    () => (domain === "due" ? allCards.filter((c) => dueIds.includes(c.id)) : domain === "all" ? allCards : allCards.filter((c) => String(c.d) === chapters.find(ch => String(ch.chapter) === String(domain))?.domain)),
    [domain, allCards, dueIds, chapters]
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

  function handleTouchStart(e) {
    if (!flipped) return;
    touchStartX.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  }
  function handleTouchMove(e) {
    if (!isDraggingRef.current || touchStartX.current === null) return;
    e.preventDefault();
    const delta = e.touches[0].clientX - touchStartX.current;
    dragXRef.current = delta;
    setDragX(delta);
  }
  function handleTouchEnd() {
    if (!isDraggingRef.current) return;
    const finalDragX = dragXRef.current;
    if (finalDragX > SWIPE_THRESHOLD) {
      rate("good");
    } else if (finalDragX < -SWIPE_THRESHOLD) {
      rate("again");
    }
    isDraggingRef.current = false;
    dragXRef.current = 0;
    setDragX(0);
    touchStartX.current = null;
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
      <div className="filter-bar">
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => pickDomain("all")}>{t(lang, "domainAll")}</button>
        {dueIds.length > 0 && (
          <button className={"chip" + (domain === "due" ? " on" : "")} onClick={() => pickDomain("due")}>
            {t(lang, "flashcards.dueToday")} ({dueIds.length})
          </button>
        )}
        {chapters.map((c) => (
          <button key={c.chapter} className={"chip" + (domain === String(c.chapter) ? " on" : "")} onClick={() => pickDomain(String(c.chapter))}>{chapterName(c.chapter, lang)}</button>
        ))}
      </div>

      {!card ? (
        <p className="muted">
          {domain === "due"
            ? `${t(lang, "flashcards.dueToday")}: 0`
            : t(lang, "flashcards.emptyDomain")}
        </p>
      ) : (
      <>
      <div className="flash-stack">
        {cards.length > 2 && <div className="flash-stack-peek depth-2" aria-hidden="true" />}
        {cards.length > 1 && <div className="flash-stack-peek depth-1" aria-hidden="true" />}
        <button
          className="card flash"
          onClick={() => setFlipped((f) => !f)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={isDraggingRef.current ? { transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`, transition: "none" } : undefined}
        >
          {lang === "en" && !hasEN(card.id) && (
            <span style={{position:'absolute', top:8, left:8, zIndex:2, fontSize:'11px', color:'var(--text-3)'}}>EN coming soon · showing PT</span>
          )}
          <div className={"flash-card-inner" + (flipped ? " flipped" : "")}>
            <div className="flash-card-front">
              <span className="flash-front">{card.front}</span>
              <span className="flash-hint">{t(lang, "flashcards.flip")}</span>
            </div>
            <div className="flash-card-back">
              <span className="flash-back">{card.back}</span>
            </div>
          </div>
        </button>
      </div>

      {flipped && (
        <div className="srs-quality">
          <button className="btn srs-again" onClick={() => rate("again")}>{t(lang, "flashcards.again")}</button>
          <button className="btn srs-hard" onClick={() => rate("hard")}>{t(lang, "flashcards.hard")}</button>
          <button className="btn srs-good" onClick={() => rate("good")}>{t(lang, "flashcards.good")}</button>
          <button className="btn srs-easy" onClick={() => rate("easy")}>{t(lang, "flashcards.easy")}</button>
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
