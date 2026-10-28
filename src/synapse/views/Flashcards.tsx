"use client";

/* ===========================================================
   Synapse · views/Flashcards.tsx
   Aba Flashcards — porta fiel de js/flashcards.js. Os cartões são
   gerados do banco da prova ativa (não há deck separado): frente =
   pergunta, verso = alternativa correta + explicação. A avaliação
   (errei / quase / lembrei) agenda a volta; "errei" reinsere o
   cartão no fim da fila na hora.
   =========================================================== */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { fmt, pad2, useSynapse } from "../store";
import type { Question } from "../types";
import { ViewFoot } from "./Hoje";

type CardItem = { q: Question; ch: number };
type Face = "front" | "back";
type Rating = "again" | "hard" | "good";
type Filter = "all" | number;

export function Flashcards() {
  const ss = useSynapse();
  const { state, t } = ss;
  const lang = state.lang;
  const c = ss.cert();

  /* ---------- fila derivada do banco (buildQueue do protótipo) ---------- */

  function dueAtOf(card: CardItem): number {
    const cs = ss.cardState(card.q.id);
    return cs ? cs.due : 0;
  }

  function cardsForFilter(f: Filter): CardItem[] {
    const list = ss.cardList();
    if (f === "all") return list;
    return list.filter((card) => card.ch === Number(f));
  }

  function buildQueue(f: Filter, force: boolean): CardItem[] {
    const list = cardsForFilter(f);
    const now = Date.now();
    const queue = force
      ? list.slice()
      : list.filter((card) => {
          const cs = ss.cardState(card.q.id);
          return !cs || cs.due <= now;
        });
    queue.sort((a, b) => dueAtOf(a) - dueAtOf(b));
    return queue;
  }

  /* ---------- estado de view (variáveis do protótipo) ----------
     O Shell remonta a view ao trocar de prova (reset automático);
     "built" não é necessário: a fila nasce no inicializador do
     useState e o efeito de mount cuida do ?cap=. */

  const [filter, setFilter] = useState<Filter>("all");
  const [queue, setQueue] = useState<CardItem[]>(() => buildQueue("all", false));
  const [idx, setIdx] = useState(0);
  const [face, setFaceState] = useState<Face>("front");
  const [reviewed, setReviewed] = useState(0);
  const [finished, setFinished] = useState(false);
  /* forceAll existe no protótipo e só é escrito lá também — mantido por fidelidade. */
  const [forceAll, setForceAll] = useState(false);

  const item = queue[idx] || null;
  /* No protótipo cada render é innerHTML novo: o cartão sempre nasce
     limpo (sem --drag, sem verso virado). A key força o remount por
     cartão exibido; a virada (front ↔ back) mantém o elemento para
     a transição CSS do .fc-flip rodar. */
  const cardKey = !finished && item ? `${String(filter)}:${item.q.id}:${idx}` : "";

  const flipRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const swipe = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    axis: null as "x" | "y" | null,
    tracking: false,
  });

  /* Espelhos "latest": listeners ligados uma vez (teclado) ou por
     cartão (toque) leem estado fresco sem re-bind — o equivalente
     React das variáveis globais do protótipo. */
  const faceRef = useRef<Face>("front");
  const rateRef = useRef<(rating: Rating) => void>(() => {});
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});

  /* ---------- helpers de copy/dado ---------- */

  function chapterName(ch: number): string {
    const chapter = ss.chapterOf(ch);
    return chapter ? chapter.name[lang] : "";
  }

  function nextDueText(): string {
    const list = ss.cardList();
    const now = Date.now();
    let min: number | null = null;
    list.forEach((card) => {
      const cs = ss.cardState(card.q.id);
      const due = cs ? cs.due : now;
      if (min === null || due < min) min = due;
    });
    if (min === null) return t("cards.doneNone");
    if (min <= now) return t("cards.now");
    const days = Math.ceil((min - now) / 86400000);
    if (days <= 1) return t("cards.dayOne");
    return fmt(t("cards.dayMany"), { n: days });
  }

  /* ---------- foco (focusFlip / focusFirstRate do protótipo) ---------- */

  function focusFlip() {
    const el = document.getElementById("fcFlip");
    if (el) el.focus();
    else ss.focusId("fcQ");
  }

  function focusFirstRate() {
    const el = document.querySelector<HTMLElement>('[data-action="rate"]');
    if (el) el.focus();
  }

  /* ---------- ações ---------- */

  /* buildQueue + zera idx/face/reviewed/finished (e forceAll). */
  function resetSession(q: CardItem[], force: boolean) {
    setQueue(q);
    setIdx(0);
    setFaceState("front");
    setReviewed(0);
    setFinished(false);
    setForceAll(!!force);
  }

  function setFace(next: Face) {
    if (!item || finished) return;
    const value: Face = next === "back" ? "back" : "front";
    setFaceState(value);
    const flipEl = flipRef.current;
    if (flipEl) flipEl.style.setProperty("--drag", "0px");
    if (value === "back") {
      window.setTimeout(focusFirstRate, 60);
      ss.announce(t("cards.back"));
    } else {
      window.setTimeout(focusFlip, 0);
      ss.announce(t("cards.front"));
    }
  }

  function applyRating(rating: Rating) {
    if (!item) return;
    ss.rateCard(item.q.id, rating, item.ch);
    setReviewed((n) => n + 1);
    /* "again" reinsere o cartão no fim da fila — volta ainda nesta sessão. */
    const nextQueue = rating === "again" ? [...queue, item] : queue;
    const nextIdx = idx + 1;
    setQueue(nextQueue);
    setIdx(nextIdx);
    setFaceState("front");
    if (nextIdx >= nextQueue.length) {
      setFinished(true);
      ss.announce(t("cards.doneTitle"));
      /* a tela final não renderiza #fcQ — foco cai no nada, como no protótipo */
      window.setTimeout(() => ss.focusId("fcQ"), 0);
      return;
    }
    window.setTimeout(focusFlip, 0);
  }

  function onFilter(next: Filter) {
    setFilter(next);
    resetSession(buildQueue(next, false), false);
    window.setTimeout(() => {
      const active = document.querySelector<HTMLElement>('.fc-chip[aria-pressed="true"]');
      if (active) active.focus();
    }, 0);
  }

  function onReviewAll() {
    resetSession(buildQueue(filter, true), true);
    window.setTimeout(focusFlip, 0);
  }

  /* ---------- teclado ( Espaço/Enter vira · 1/2/3 avalia ) ---------- */

  function onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    const tag = target ? target.tagName : "";
    if (tag === "INPUT" || tag === "A" || tag === "SUMMARY") return;
    if (tag === "BUTTON" && (e.key === " " || e.key === "Enter")) return;
    if (finished || !item) return;
    if ((e.key === " " || e.key === "Enter") && face === "front") {
      e.preventDefault();
      setFace("back");
    } else if (face === "back" && (e.key === "1" || e.key === "2" || e.key === "3")) {
      e.preventDefault();
      const map: Record<string, Rating> = { "1": "again", "2": "hard", "3": "good" };
      applyRating(map[e.key]);
    }
  }

  /* ---------- efeitos ---------- */

  /* espelhos atualizados a cada render — listeners sempre leem estado fresco */
  useEffect(() => {
    faceRef.current = face;
    rateRef.current = applyRating;
    keyRef.current = onKey;
  });

  /* teclado da view — document + cleanup (conversão do guia) */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => keyRef.current(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* ?cap= / navegação com cap (ready() do protótipo) */
  useEffect(() => {
    const cap = ss.peekCap();
    if (cap) {
      const exists = c.chapters.some((ch) => ch.n === Number(cap));
      if (exists) {
        const next: Filter = Number(cap);
        setFilter(next);
        resetSession(buildQueue(next, false), false);
      }
    }
    /* mount apenas — buildQueue é idempotente (StrictMode duplica o efeito) */
  }, []);

  /* swipe mobile — bindSwipe do protótipo, ligado por cartão
     (o guard data-swipe="1" de lá vira a dependência cardKey aqui).
     touchmove precisa de { passive: false } para o preventDefault. */
  useEffect(() => {
    const card = cardRef.current;
    const flip = flipRef.current;
    if (!card || !flip) return;

    /* arrow consts criados após o guard: o estreitamento de `flip`
       (não-nulo) vale dentro dos handlers no TS 5.4+. */
    const start = (e: TouchEvent) => {
      if (faceRef.current !== "back" || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const s = swipe.current;
      s.startX = touch.clientX;
      s.startY = touch.clientY;
      s.dx = 0;
      s.axis = null;
      s.tracking = true;
      flip.classList.add("is-dragging");
    };
    const move = (e: TouchEvent) => {
      const s = swipe.current;
      if (!s.tracking) return;
      const touch = e.touches[0];
      const x = touch.clientX - s.startX;
      const y = touch.clientY - s.startY;
      if (s.axis === null && (Math.abs(x) > 8 || Math.abs(y) > 8)) {
        s.axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
      }
      if (s.axis !== "x") return;
      e.preventDefault();
      s.dx = x;
      flip.style.setProperty("--drag", x + "px");
    };
    const end = () => {
      const s = swipe.current;
      if (!s.tracking) return;
      s.tracking = false;
      flip.classList.remove("is-dragging");
      flip.style.setProperty("--drag", "0px");
      /* limiar de 72px: direita = lembrei, esquerda = errei */
      if (Math.abs(s.dx) >= 72) rateRef.current(s.dx > 0 ? "good" : "again");
      s.dx = 0;
      s.axis = null;
    };

    card.addEventListener("touchstart", start, { passive: true });
    card.addEventListener("touchmove", move, { passive: false });
    card.addEventListener("touchend", end);
    card.addEventListener("touchcancel", end);
    return () => {
      card.removeEventListener("touchstart", start);
      card.removeEventListener("touchmove", move);
      card.removeEventListener("touchend", end);
      card.removeEventListener("touchcancel", end);
    };
  }, [cardKey]);

  /* ---------- estado vazio: prova sem banco ---------- */

  if (c.status !== "live") {
    return (
      <section className="hero empty-hero">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("cards.kicker")} · {c.code}
          </span>
          <h1>{t("cards.noBankTitle")}</h1>
          <p className="lead">{t("study.emptyBody")}</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => ss.setCert("ctfl")}>
              {t("study.emptyAction")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- dados do render ---------- */

  const list = ss.cardList();
  const due = ss.dueCards().length;
  const noBank = list.length === 0;

  /* fc-steps: até 12 bolinhas mapeando o índice na fila */
  const steps: ReactNode[] = [];
  if (queue.length <= 1) {
    steps.push(<i className="on" key={0} />);
  } else {
    const total = queue.length;
    const cap = Math.min(total, 12);
    const on = Math.round((idx / Math.max(1, total - 1)) * (cap - 1));
    for (let i = 0; i < cap; i++) {
      steps.push(<i className={i <= on ? "on" : ""} key={i} />);
    }
  }

  function meta(card: CardItem, label: string): ReactNode {
    return (
      <div className="fc-meta">
        <span className="dot" aria-hidden="true" />
        <span>
          {fmt(t("study.chapter"), { n: pad2(card.ch) })} · {chapterName(card.ch)}
        </span>
        <span>{fmt(t("cards.k"), { k: card.q.k })}</span>
        <span className="fc-state">{label}</span>
      </div>
    );
  }

  const ratings: { key: Rating; label: string; when: string }[] = [
    { key: "again", label: t("cards.again"), when: t("cards.againWhen") },
    { key: "hard", label: t("cards.hard"), when: t("cards.hardWhen") },
    { key: "good", label: t("cards.good"), when: t("cards.goodWhen") },
  ];

  const footTail = `Synapse · ${t("nav.flashcards")} · ${c.code}`;

  let body: ReactNode = null;
  if (!queue.length && !finished) {
    /* fila vazia — nada vencido (ou prova sem banco) */
    body = (
      <>
        <div className="fc-empty" data-od-id="flashcards-vazio">
          <h2>{noBank ? t("cards.noBankTitle") : t("cards.emptyTitle")}</h2>
          <p>{noBank ? t("cards.noBankBody") : t("cards.emptyBody")}</p>
          <div className="actions">
            {noBank ? (
              <button type="button" className="btn primary" onClick={() => ss.goTab("estudar")}>
                {t("study.action")}
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={onReviewAll}>
                {t("cards.reviewAll")}
              </button>
            )}
            <button type="button" className="btn secondary" onClick={() => ss.goTab("estudar")}>
              {t("study.nav")}
            </button>
          </div>
        </div>
        <ViewFoot label={t("cards.footnote")} tail={footTail} />
      </>
    );
  } else if (finished) {
    /* fim da fila */
    body = (
      <>
        <div className="fc-empty" data-od-id="flashcards-fim">
          <span className="kicker">
            <i aria-hidden="true" />
            {t("cards.kicker")} · {c.code}
          </span>
          <h2 style={{ marginTop: "12px" }}>{t("cards.doneTitle")}</h2>
          <p>{fmt(t("cards.doneBody"), { n: reviewed })}</p>
          <p className="exam-note">{fmt(t("cards.doneNext"), { when: nextDueText() })}</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={onReviewAll}>
              {t("cards.doneAgain")}
            </button>
            <button type="button" className="btn secondary" onClick={() => ss.goTab("estudar")}>
              {t("study.nav")}
            </button>
          </div>
        </div>
        <ViewFoot label={t("cards.footnote")} tail={footTail} />
      </>
    );
  } else if (item) {
    /* o cartão da vez */
    body = (
      <>
        <article
          className="fc-card"
          data-od-id="flashcards-cartao"
          aria-label={face === "back" ? t("cards.back") : t("cards.front")}
          key={cardKey}
          ref={cardRef}
        >
          <div className="fc-flip" data-face={face} ref={flipRef}>
            <div
              className="fc-face fc-front"
              data-action="flip"
              inert={face === "back"}
              aria-hidden={face === "back" ? "true" : "false"}
              onClick={() => setFace("back")}
            >
              {meta(item, t("cards.front"))}
              <div className="fc-body">
                <h2 className="fc-q" id="fcQ" tabIndex={-1}>
                  {item.q.q[lang]}
                </h2>
              </div>
              <div className="fc-actions">
                <button
                  type="button"
                  className="btn primary"
                  id="fcFlip"
                  data-action="flip"
                  onClick={(e) => {
                    /* o clique não dobra com o da face (delegação closest do protótipo) */
                    e.stopPropagation();
                    setFace("back");
                  }}
                >
                  {t("cards.flip")}
                </button>
                <span className="hint">{t("cards.flipHint")}</span>
              </div>
            </div>
            <div
              className="fc-face fc-back"
              inert={face !== "back"}
              aria-hidden={face !== "back" ? "true" : "false"}
            >
              {meta(item, t("cards.back"))}
              <div className="fc-body">
                <p className="fc-a">
                  <strong>{item.q.options[lang][item.q.answer]}</strong>
                </p>
                <p className="fc-exp">{item.q.exp[lang]}</p>
                <p className="fc-ref">
                  {t("cards.source")} · {item.q.ref} · {item.q.id}
                </p>
              </div>
              <div className="fc-actions">
                <span className="hint">{t("cards.rate")}</span>
                <div className="fc-rate">
                  {ratings.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      data-action="rate"
                      data-rating={r.key}
                      onClick={() => applyRating(r.key)}
                    >
                      <span className="rl">{r.label}</span>
                      <span className="rw">{r.when}</span>
                    </button>
                  ))}
                </div>
                <span className="fc-swipehint">{t("cards.swipeHint")}</span>
              </div>
            </div>
          </div>
        </article>
        <div className="fc-progress">
          <span>{fmt(t("cards.counter"), { n: idx + 1, total: queue.length })}</span>
          <span className="fc-steps" aria-hidden="true">
            {steps}
          </span>
        </div>
        <ViewFoot label={t("cards.footnote")} tail={footTail} />
      </>
    );
  }

  return (
    <>
      <section className="hero empty-hero" data-od-id="flashcards-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("cards.kicker")} · {c.code}
          </span>
          <h1>{t("cards.title")}</h1>
          <p className="lead">{fmt(t("cards.lead"), { code: c.code })}</p>
        </div>
      </section>

      <div className="fc-shell">
        <div className="fc-tools" data-od-id="flashcards-filtros">
          <div className="fc-count">
            <b>{due}</b>
            <span>{t("cards.due")}</span>
          </div>
          <div className="fc-filters" role="group" aria-label={t("cards.filter")}>
            <button
              type="button"
              className="fc-chip"
              aria-pressed={filter === "all"}
              onClick={() => onFilter("all")}
            >
              {t("cards.all")}
            </button>
            {c.chapters.map((ch) => {
              const chDue = list.filter((card) => {
                if (card.ch !== ch.n) return false;
                const cs = ss.cardState(card.q.id);
                return !cs || cs.due <= Date.now();
              }).length;
              return (
                <button
                  key={ch.n}
                  type="button"
                  className="fc-chip"
                  aria-pressed={filter === ch.n}
                  aria-label={
                    fmt(t("study.chapter"), { n: pad2(ch.n) }) +
                    " · " +
                    ch.name[lang] +
                    (chDue ? " · " + chDue : "")
                  }
                  onClick={() => onFilter(ch.n)}
                >
                  {pad2(ch.n)}
                  {chDue ? " · " + chDue : ""}
                </button>
              );
            })}
          </div>
        </div>
        {body}
      </div>
    </>
  );
}
