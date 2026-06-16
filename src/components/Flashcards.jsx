import { useState, useMemo } from "react";
import { DOMAINS } from "../lib/bank.js";
import { FLASHCARDS } from "../data/study.js";

export default function Flashcards() {
  const [domain, setDomain] = useState("all");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = useMemo(
    () => (domain === "all" ? FLASHCARDS : FLASHCARDS.filter((c) => c.d === domain)),
    [domain]
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
        <button className={"chip" + (domain === "all" ? " on" : "")} onClick={() => pickDomain("all")}>Todos</button>
        {DOMAINS.map((d) => (
          <button key={d.id} className={"chip" + (domain === d.id ? " on" : "")} onClick={() => pickDomain(d.id)}>{d.name}</button>
        ))}
      </div>

      <button className="card flash" onClick={() => setFlipped((f) => !f)}>
        {!flipped ? (
          <>
            <span className="flash-front">{card.front}</span>
            <span className="flash-hint">toque para revelar</span>
          </>
        ) : (
          <span className="flash-back">{card.back}</span>
        )}
      </button>

      <div className="actions">
        <button className="btn" onClick={() => go(-1)}>← Anterior</button>
        <span className="muted center-num">{idx + 1} / {cards.length}</span>
        <button className="btn" onClick={() => go(1)}>Próximo →</button>
      </div>
    </div>
  );
}
