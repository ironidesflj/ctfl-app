import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import { FLASHCARDS, flashcardsForCert } from "../data/study.js";
import { t } from "../lib/ui-strings.js";
import { getSRSCard, rateSRS, undoSRSRating, getDueItems, todayLocal } from "../lib/storage.js";
import { nextDueDate } from "../lib/activity.js";
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
  const [searchParams] = useSearchParams();

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  // P3/lint: espelho em estado do "está arrastando" — ler ref durante render
  // (react-hooks/refs) não é permitido; handlers continuam usando o ref pra
  // lógica, o render usa o estado.
  const [isDragging, setIsDragging] = useState(false);
  // r15 (R18): última avaliação feita — alimenta o undo de 1 nível e a nota
  // "volta em Nd" (transparência do SM-2). Zera ao desfazer.
  const [lastRating, setLastRating] = useState(null); // {id, idx, label, prevCard}
  const [note, setNote] = useState(null); // {label, interval}

  const touchStartX = useRef(null);
  const dragXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const SWIPE_THRESHOLD = 80;

  // r14: conteúdo escopado pelo campo explícito `cert` (o domínio sozinho
  // não distingue capítulos dentro do CTAL-TA — todos compartilham "analyst").
  const allCards = useMemo(() => flashcardsForCert(lang, certId), [lang, certId]);
  const hasContent = allCards.length > 0;
  // r15: memoizado — alimenta os useMemos abaixo (chips com fila, próxima
  // revisão e a lista de cartões do modo due) sem warnings de deps.
  const dueIds = useMemo(
    () =>
      progress
        ? getDueItems(
            progress,
            allCards.map((c) => c.id)
          )
        : [],
    [progress, allCards]
  );

  // r16 (QA v3.14.0): o CTA "Revisar N agora" do Stats abre direto na fila
  // pendente (?due=1). Antes caía no filtro "Todos" e o usuário tinha que
  // achar o chip da fila — a promessa do botão era a fila, não o baralho.
  // Inicializador resolve no MOUNT (progresso é síncrono no App): fila
  // vazia (bookmark antigo / já esvaziou) degrada pro baralho completo —
  // sem efeito, sem setState-in-effect.
  const [domain, setDomain] = useState(() =>
    searchParams.get("due") === "1" && dueIds.length > 0 ? "due" : "all"
  );

  const cards = useMemo(
    () =>
      domain === "due"
        ? allCards.filter((c) => dueIds.includes(c.id))
        : domain === "all"
          ? allCards
          : allCards.filter((c) => String(c.ch) === String(domain)),
    [domain, allCards, dueIds]
  );

  // r16 (QA v3.14.0): defesa em profundidade — o avanço pós-avaliação é
  // calculado com o comprimento PÓS-rating (ver rate()), então idx deve
  // estar sempre em faixa; o clamp de render garante que qualquer
  // caminho futuro que esqueça disso mostre cartão e contador "N/M"
  // coerentes em vez de um "3 / 2".
  const safeIdx = cards.length ? Math.min(idx, cards.length - 1) : 0;
  const card = cards[safeIdx] || null;

  // r15: due por capítulo — o chip mostra onde há fila esperando (só > 0).
  const dueByChapter = useMemo(() => {
    const map = {};
    for (const c of allCards) {
      if (dueIds.includes(c.id)) {
        const k = String(c.ch);
        map[k] = (map[k] || 0) + 1;
      }
    }
    return map;
  }, [allCards, dueIds]);

  // r15: quando a fila do dia zera, mostrar quando é a próxima.
  const nextDue = useMemo(
    () =>
      nextDueDate(
        progress?.srs,
        allCards.map((c) => c.id),
        todayLocal()
      ),
    [progress, allCards]
  );

  function go(delta) {
    if (!cards.length) return; // celebração/fila vazia: sem navegação a onde ir
    setFlipped(false);
    setIdx((i) => (i + delta + cards.length) % cards.length);
  }
  function pickDomain(d) {
    setDomain(d);
    setIdx(0);
    setFlipped(false);
    // r15: devolve o teclado ao cartão — sem isso, o Espaço re-ativa o chip
    // focado (comportamento nativo de <button>) e "desfaz" o flip do fluxo
    // mouse→teclado. Tabulação por teclado continua funcionando (o blur só
    // roda no clique).
    if (document.activeElement?.blur) document.activeElement.blur();
  }

  function rate(label) {
    if (!card) return;
    const prevCard = getSRSCard(progress, card.id); // null = era novo
    // preview determinístico do intervalo p/ a nota (sm2 é pura — mesma
    // entrada que rateSRS usa internamente, mesma saída).
    const updated = sm2(prevCard || initSM2(), QUALITY[label]);
    setProgress((p) => rateSRS(p, card.id, label));
    // r16: guarda o índice EXIBIDO (safeIdx) e o DOMÍNIO vigente — o estado
    // idx pode estar além do fim no instante pós-avaliação (lista encolheu) e
    // o undo precisa devolver exatamente pro cartão avaliado, no filtro em
    // que ele foi avaliado (trocar de chip não pode quebrar o "volta pro
    // cartão certo").
    setLastRating({ id: card.id, idx: safeIdx, label, prevCard, domain });
    setNote({ label, interval: updated.interval });
    // r16 (QA v3.14.0): avanço calculado com o comprimento PÓS-avaliação.
    // Na fila due o cartão avaliado SEMPRE sai (interval ≥ 1 → dueDate
    // amanhã ou depois): o próximo da sequência assume a posição atual
    // (idx não muda); no último, wrap. Fora da fila due, +1 com wrap. Isso
    // elimina o "3 / 2" do contador (idx além do fim) e o clique preso.
    setFlipped(false);
    if (domain === "due") {
      const after = cards.length - 1;
      setIdx(after > 0 ? safeIdx % after : 0);
    } else {
      setIdx((safeIdx + 1) % cards.length);
    }
  }

  // r15: undo de 1 nível — restaura o estado SM-2 ANTERIOR do cartão (null =
  // volta a ser novo), desconta o contador da label, volta pro cartão certo
  // NO FILTRO em que foi avaliado (r16: domain restaurado junto — trocar de
  // chip entre avaliar e desfazer não pode descaracterizar o retorno).
  function undo() {
    if (!lastRating) return;
    setProgress((p) => undoSRSRating(p, lastRating.id, lastRating.label, lastRating.prevCard));
    setDomain(lastRating.domain);
    setIdx(lastRating.idx);
    setFlipped(false);
    setNote(null);
    setLastRating(null);
  }

  // r15: teclado — Espaço/Enter vira o cartão, 1–4 avaliam (já virado),
  // ←/→ navegam. Se o foco está num botão, Enter/Espaço pertencem a ele
  // (não capturamos — evita duplo disparo). Alvos de texto nunca capturam.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable)
        return;
      const onButton = tag === "button";
      if (onButton && (e.key === " " || e.key === "Enter")) return;
      if (e.key === "ArrowLeft" && card) {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key === "ArrowRight" && card) {
        e.preventDefault();
        go(1);
        return;
      }
      if ((e.key === " " || e.key === "Enter") && card) {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped || !card) return;
      const KEYMAP = { 1: "again", 2: "hard", 3: "good", 4: "easy" };
      if (KEYMAP[e.key]) {
        e.preventDefault();
        rate(KEYMAP[e.key]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function handleTouchStart(e) {
    if (!flipped) return;
    touchStartX.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
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
    setIsDragging(false);
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
        <button
          className={"chip" + (domain === "all" ? " on" : "")}
          onClick={() => pickDomain("all")}
        >
          {t(lang, "domainAll")}
        </button>
        {dueIds.length > 0 && (
          <button
            className={"chip" + (domain === "due" ? " on" : "")}
            onClick={() => pickDomain("due")}
          >
            {t(lang, "flashcards.dueToday")} ({dueIds.length})
          </button>
        )}
        {chapters.map((c) => {
          const dueN = dueByChapter[String(c.chapter)] || 0;
          return (
            <button
              key={c.chapter}
              className={"chip" + (domain === String(c.chapter) ? " on" : "")}
              onClick={() => pickDomain(String(c.chapter))}
              title={dueN > 0 ? t(lang, "flashcards.chipDueTitle", { n: dueN }) : undefined}
            >
              {chapterName(c.chapter, lang)}
              {dueN > 0 && <sup className="chip-due-n">{dueN}</sup>}
            </button>
          );
        })}
      </div>

      {!card ? (
        domain === "due" ? (
          // r15: fila zerada deixou de ser um beco sem saída — celebra,
          // mostra quando volta a ter revisão e oferece o resto do baralho.
          <div className="card flash-done" role="status">
            <p className="flash-done-title" aria-live="polite">
              🎉 {t(lang, "flashcards.dueDone")}
            </p>
            <p className="muted">
              {nextDue
                ? t(lang, "flashcards.dueNext", { date: nextDue })
                : t(lang, "flashcards.dueNoNext")}
            </p>
            <button className="btn" onClick={() => pickDomain("all")}>
              {t(lang, "flashcards.browseAll")}
            </button>
          </div>
        ) : (
          <p className="muted">{t(lang, "flashcards.emptyDomain")}</p>
        )
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
              style={
                isDragging
                  ? {
                      transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
                      transition: "none",
                    }
                  : undefined
              }
            >
              {lang === "en" && !hasEN(card.id) && (
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    fontSize: "11px",
                    color: "var(--text-3)",
                  }}
                >
                  EN coming soon · showing PT
                </span>
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
              <button className="btn srs-again" onClick={() => rate("again")}>
                {t(lang, "flashcards.again")}
              </button>
              <button className="btn srs-hard" onClick={() => rate("hard")}>
                {t(lang, "flashcards.hard")}
              </button>
              <button className="btn srs-good" onClick={() => rate("good")}>
                {t(lang, "flashcards.good")}
              </button>
              <button className="btn srs-easy" onClick={() => rate("easy")}>
                {t(lang, "flashcards.easy")}
              </button>
            </div>
          )}

          <div className="actions">
            <button className="btn" onClick={() => go(-1)}>
              {t(lang, "flashcards.prev")}
            </button>
            <span className="muted center-num">
              {safeIdx + 1} / {cards.length}
            </span>
            <button className="btn" onClick={() => go(1)}>
              {t(lang, "flashcards.next")}
            </button>
          </div>

          <p className="flash-kbd muted" aria-hidden="true">
            {t(lang, "flashcards.kbdHint")}
          </p>
        </>
      )}
      {/* r15: transparência do SM-2 — o que a avaliação acabou de agendar
          + undo de mis-tap no mesmo lugar. aria-live: quem usa teclado
          (1-4) ouve a confirmação.
          r16 (QA v3.14.0): o undo pertence à AVALIAÇÃO, não à tela —
          avaliar a última pendência troca para a celebração e o mis-tap
          precisa continuar reversível lá (antes o bloco vivia só no ramo
          do cartão e desaparecia junto com ele). */}
      {note && (
        <p className="flash-note" aria-live="polite">
          <span className="flash-note-label">
            {t(lang, `flashcards.${note.label}`)} →{" "}
            {t(lang, "flashcards.nextIn", { n: note.interval })}
          </span>
          {lastRating && (
            <button className="flash-undo" onClick={undo}>
              ↩ {t(lang, "flashcards.undo")}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
