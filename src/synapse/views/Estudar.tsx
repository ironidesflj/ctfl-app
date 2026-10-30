"use client";

/* ===========================================================
   Synapse · views/Estudar.tsx
   Aba Estudar — porta fiel de js/estudar.js. Plano por capítulo,
   sessão de questão e resultado. A sessão usa todas as questões
   do capítulo; cada questão conta cobertura uma única vez.
   =========================================================== */

import { useEffect, useRef, useState } from "react";
import { fmt, pad2, useSynapse } from "../store";
import type { Question } from "../types";
import { AxonQuestionLink } from "../components/AxonQuestionLink";
import { ViewFoot } from "./Hoje";
import { shuffleOptionOrder } from "../option-order";

interface SessionState {
  ch: number;
  qs: Question[];
  optOrder: number[][];
  i: number;
  chosen: number | null;
  checked: boolean;
  correct: number;
  answered: Record<string, boolean>;
  phase: "quiz" | "done";
}

export function Estudar() {
  const ss = useSynapse();
  const { state, t } = ss;
  const lang = state.lang;
  const c = ss.cert();

  /* sessão local — o Shell remonta a view ao trocar de prova/abas.
     cap pendente (?cap= ou goTab com cap): a sessão nasce no primeiro
     render, como o ready() do protótipo — sem flash do plano. */
  const [session, setSession] = useState<SessionState | null>(() => {
    const cap = ss.peekCap();
    if (!cap) return null;
    const qs = ss.questionsFor()[String(cap)] || [];
    if (!qs.length) return null;
    return {
      ch: Number(cap),
      qs,
      optOrder: qs.map((q) => shuffleOptionOrder(q.options.pt.length)),
      i: 0,
      chosen: null,
      checked: false,
      correct: 0,
      answered: {},
      phase: "quiz",
    };
  });
  /* hint da fase de resposta: null = dica K padrão da questão */
  const [hint, setHint] = useState<string | null>(null);
  const firstOptRef = useRef<HTMLInputElement | null>(null);

  /* ---------- fonte da questão ---------- */

  function sourceRef(q: Question): string {
    const base = String(q.ref).replace(/ · cap\. \d+$/, "");
    if (base !== q.ref) {
      return base + " · " + fmt(t("study.chapter"), { n: pad2(q.ch) });
    }
    return q.ref;
  }

  /* ---------- fluxo ---------- */

  function startSession(ch: number) {
    const qs = ss.questionsFor()[String(ch)] || [];
    if (!qs.length) return;
    setSession({
      ch: Number(ch),
      qs,
      optOrder: qs.map((q) => shuffleOptionOrder(q.options.pt.length)),
      i: 0,
      chosen: null,
      checked: false,
      correct: 0,
      answered: {},
      phase: "quiz",
    });
    setHint(null);
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("qTitle"), 0);
  }

  function startSavedSession() {
    const qs = ss.savedQuestions();
    if (!qs.length) return;
    setSession({
      ch: 0,
      qs,
      optOrder: qs.map((q) => shuffleOptionOrder(q.options.pt.length)),
      i: 0,
      chosen: null,
      checked: false,
      correct: 0,
      answered: {},
      phase: "quiz",
    });
    setHint(null);
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("qTitle"), 0);
  }

  function checkAnswer() {
    const s = session;
    if (!s || s.checked || s.phase !== "quiz") return;
    if (s.chosen === null) {
      setHint(t("session.needPick"));
      firstOptRef.current?.focus();
      return;
    }
    const q = s.qs[s.i];
    const ok = s.chosen === q.answer;
    const answered = { ...s.answered };
    const ch = q.ch || s.ch || 1;
    if (!answered[q.id]) {
      answered[q.id] = true;
      ss.markSeen(q.id, ch);
    }
    ss.recordAttempt(q.id, ch, ok);
    setSession({ ...s, checked: true, correct: ok ? s.correct + 1 : s.correct, answered });
    window.setTimeout(() => ss.focusId("fbTitle"), 0);
    ss.announce(
      (ok ? t("session.correct") : t("session.wrong")) +
        ". " +
        fmt(t("session.rightIs"), { letter: String.fromCharCode(65 + s.optOrder[s.i].indexOf(q.answer)) })
    );
  }

  function nextQuestion() {
    const s = session;
    if (!s || !s.checked) return;
    if (s.i < s.qs.length - 1) {
      setSession({ ...s, i: s.i + 1, chosen: null, checked: false });
      setHint(null);
      ss.scrollTop();
      window.setTimeout(() => ss.focusId("qTitle"), 0);
    } else {
      setSession({ ...s, phase: "done" });
      setHint(null);
      ss.logSession({ ch: s.ch || 1, total: s.qs.length, correct: s.correct });
      ss.scrollTop();
      window.setTimeout(() => ss.focusId("sumTitle"), 0);
      ss.announce(t("session.done"));
    }
  }

  function exitSession() {
    if (!session) return;
    setSession(null);
    setHint(null);
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("planTitle"), 0);
  }

  /* ---------- sessão avisa a casca (trilho oculto no mobile) ---------- */

  const sessionOn = !!session;
  useEffect(() => {
    ss.setSession(sessionOn);
    return () => ss.setSession(false);
  }, [sessionOn]);

  /* ---------- Escape encerra a sessão ---------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || !session) return;
      e.preventDefault();
      exitSession();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [session]);

  /* ---------- boot com cap: scroll + foco na primeira questão ---------- */

  useEffect(() => {
    if (!session) return;
    ss.scrollTop();
    ss.focusId("qTitle");
  }, []);

  /* ---------- resultado ---------- */

  if (session && session.phase === "done") {
    const s = session;
    const chLabel = s.ch === 0 ? t("study.savedTitle") : fmt(t("study.chapter"), { n: pad2(s.ch) });
    const chapter = ss.chapterOf(s.ch);
    const pct = chapter ? ss.pctFor(chapter) : 0;

    return (
      <>
        <div className="session" data-od-id="estudar-resultado">
          <div className="session-top">
            <span className="kicker">
              <i aria-hidden="true" />
              {t("study.kicker")} · {c.code}
              <span className="k-ch"> · {chLabel}</span>
            </span>
            <button type="button" className="btn ghost session-exit" onClick={exitSession}>
              {t("session.exit")}
            </button>
          </div>
          <div className="summary">
            <span className="sk">{t("session.result")}</span>
            <h1 id="sumTitle" tabIndex={-1}>
              {t("session.done")}
            </h1>
            <div className="sc">
              {s.correct}
              <small>{fmt(t("session.scoreOf"), { total: s.qs.length })}</small>
            </div>
            <p>
              {s.ch === 0
                ? fmt(t("study.savedDesc"), { n: s.qs.length })
                : fmt(t("session.coverageNow"), { ch: pad2(s.ch), pct })}
            </p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={exitSession}>
                {t("session.back")}
              </button>
              <button type="button" className="btn secondary" onClick={exitSession}>
                {t("session.otherChapter")}
              </button>
            </div>
            <p className="aside-note">{t("session.saved")}</p>
          </div>
        </div>
        <ViewFoot
          label={t("study.footnote")}
          tail={`Synapse · ${t("study.nav")} · ${t("study.nav")} · ${c.code}`}
        />
      </>
    );
  }

  /* ---------- sessão de questão ---------- */

  if (session) {
    const s = session;
    const q = s.qs[s.i];
    const chLabel = s.ch === 0 ? t("study.savedTitle") : fmt(t("study.chapter"), { n: pad2(s.ch) });
    const locked = s.checked;
    const order = s.optOrder[s.i];
    const result = locked ? (s.chosen === q.answer ? "ok" : "no") : "";

    return (
      <>
        <div className="session" data-od-id="estudar-sessao">
          <div className="session-top">
            <span className="kicker">
              <i aria-hidden="true" />
              {t("study.kicker")} · {c.code}
              <span className="k-ch"> · {chLabel}</span>
            </span>
            <div className="session-top-actions">
              <button
                type="button"
                className={`btn ghost session-save-btn ${ss.isSaved(q.id) ? "is-saved" : ""}`}
                onClick={() => {
                  const next = ss.toggleSaved(q.id);
                  ss.announce(next ? t("session.savedBadge") : t("session.saveBadge"));
                }}
                aria-pressed={ss.isSaved(q.id)}
                aria-label={ss.isSaved(q.id) ? t("session.unsave") : t("session.save")}
                title={ss.isSaved(q.id) ? t("session.unsave") : t("session.save")}
              >
                <span aria-hidden="true">{ss.isSaved(q.id) ? "★" : "☆"}</span>
                <span>{ss.isSaved(q.id) ? t("session.savedBadge") : t("session.saveBadge")}</span>
              </button>
              <button type="button" className="btn ghost session-exit" onClick={exitSession}>
                {t("session.exit")}
              </button>
            </div>
          </div>
          <div className="session-progress">
            <span>
              {fmt(t("session.progress"), { n: s.i + 1, total: s.qs.length })}
              <span className="p-ch"> · {chLabel}</span>
            </span>
            <span className="steps" aria-hidden="true">
              {s.qs.map((_, idx) => (
                <i key={idx} className={idx <= s.i ? "on" : ""} />
              ))}
            </span>
          </div>
          <h1 className="q-title" id="qTitle" tabIndex={-1}>
            {q.q[lang]}
          </h1>
          <AxonQuestionLink questionId={q.id} lang={lang} />
          <fieldset className="opts" data-locked={locked} aria-label={t("a11y.answer")}>
            <legend className="sr-only">{t("a11y.answer")}</legend>
            {order.map((originalIndex, i) => {
              const text = q.options[lang][originalIndex];
              const isCorrect = locked && originalIndex === q.answer;
              const isWrong = locked && originalIndex === s.chosen && s.chosen !== q.answer;
              const cls = isCorrect ? "opt is-correct" : isWrong ? "opt is-wrong" : "opt";
              const tag = isCorrect ? (
                <em className="opt-tag is-ok">{t("session.tagCorrect")}</em>
              ) : isWrong ? (
                <em className="opt-tag is-no">{t("session.tagYours")}</em>
              ) : null;
              return (
                <label className={cls} key={q.id + ":" + originalIndex}>
                  <input
                    type="radio"
                    name="answer"
                    value={originalIndex}
                    checked={s.chosen === originalIndex}
                    disabled={locked}
                    ref={i === 0 ? firstOptRef : undefined}
                    onChange={() => {
                      /* trocar de alternativa restaura a dica K */
                      setHint(null);
                      setSession((prev) => (prev ? { ...prev, chosen: originalIndex } : prev));
                    }}
                  />
                  <span className="opt-key" aria-hidden="true">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="opt-text">
                    {text}
                    {tag}
                  </span>
                </label>
              );
            })}
          </fieldset>
          {locked ? (
            <>
              <section className="feedback" data-result={result} aria-labelledby="fbTitle">
                <h2 className="fb-head" id="fbTitle" tabIndex={-1}>
                  <span className="fb-mark" aria-hidden="true">
                    {result === "ok" ? "✓" : "×"}
                  </span>
                  {result === "ok" ? t("session.correct") : t("session.wrong")}
                </h2>
                <p className="fb-exp">{q.exp[lang]}</p>
                <p className="fb-ref">
                  {t("session.source")} · {sourceRef(q)} · {q.id}
                </p>
              </section>
              <div className="session-actions">
                <button type="button" className="btn primary" onClick={nextQuestion}>
                  {s.i === s.qs.length - 1 ? t("session.finish") : t("session.next")}
                </button>
                <span className="q-hint">{t("session.saved")}</span>
              </div>
            </>
          ) : (
            <div className="session-actions">
              <button type="button" className="btn primary" onClick={checkAnswer}>
                {t("session.check")}
              </button>
              <span className="q-hint" id="qHint">
                {hint ?? fmt(t("session.k"), { k: q.k })}
              </span>
            </div>
          )}
        </div>
        <ViewFoot
          label={t("study.footnote")}
          tail={`Synapse · ${t("study.nav")} · ${t("study.nav")} · ${c.code}`}
        />
      </>
    );
  }

  /* ---------- estado vazio (prova sem banco) ---------- */

  if (c.status !== "live") {
    return (
      <>
        <section className="hero empty-hero" data-od-id="estudar-vazio">
          <div>
            <span className="kicker">
              <i aria-hidden="true" />
              {t("study.kicker")} · {c.code}
            </span>
            <h1 id="planTitle" tabIndex={-1}>
              {t("study.emptyTitle")}
            </h1>
            <p className="lead">{t("study.emptyBody")}</p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={() => ss.setCert("ctfl")}>
                {t("study.emptyAction")}
              </button>
            </div>
          </div>
        </section>
        <section className="empty" data-od-id="estudar-vazio-fatos">
          <h2>{t("study.exam")}</h2>
          <dl className="facts">
            <div className="fact">
              <dt>{t("cert.label")}</dt>
              <dd>{c.code}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.version")}</dt>
              <dd>{c.version}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.status")}</dt>
              <dd>{t("cert." + c.status)}</dd>
            </div>
          </dl>
        </section>
        <ViewFoot label={t("study.footnote")} tail={`Synapse · ${t("study.nav")} · ${c.code}`} />
      </>
    );
  }

  /* ---------- plano ---------- */

  const ex = c.exam;
  const cov = ss.coverage(c);
  const next = ss.nextChapter(c);
  const last = ss.lastSession();
  const lastText = last
    ? fmt(t("progress.sessionRow"), { n: pad2(last.ch), correct: last.correct, total: last.total })
    : "—";
  const lead = fmt(ex && ex.scoring === "points" ? t("study.leadPoints") : t("study.lead"), {
    code: c.code,
    q: ex ? ex.q : "—",
    min: ex ? ex.min : "—",
    pass: ex ? ex.pass : "—",
    points: ex ? ex.points : "—",
  });

  return (
    <>
      <section className="hero" data-od-id="estudar-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("study.kicker")} · {c.code}
          </span>
          <h1 id="planTitle" tabIndex={-1}>
            {t("study.title")}
          </h1>
          <p className="lead">{lead}</p>
        </div>
        <div className="coverage" data-od-id="estudar-cobertura">
          <span className="ck">{t("study.coverage")}</span>
          <div className="cv">
            {cov.pct}
            <small>%</small>
          </div>
          <div
            className="meter"
            role="progressbar"
            aria-label={t("a11y.coverage")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={cov.pct}
          >
            <i style={{ width: cov.pct + "%" }} />
          </div>
          <p className="cnote">
            {fmt(t("study.coverageOf"), { seen: cov.seen, total: cov.total })}
          </p>
        </div>
      </section>

      <div className="plan-grid">
        <div className="plan-main" data-od-id="estudar-plano">
          {next ? (
            <div className="next" data-od-id="estudar-proxima-sessao">
              <div>
                <span className="nk">{t("study.next")}</span>
                <h2>{next.name[lang]}</h2>
                <p className="nm">
                  {fmt(t("study.chapter"), { n: pad2(next.n) })} ·{" "}
                  {fmt(t("study.examShare"), { n: next.examQ, q: ex ? ex.q : "—" })}
                </p>
              </div>
              <button
                type="button"
                className="btn primary"
                data-ch={next.n}
                onClick={() => startSession(next.n)}
              >
                {ss.seenFor(next) > 0 ? t("study.resume") : t("study.action")}
              </button>
            </div>
          ) : null}

          {ss.savedIds().length > 0 ? (
            <div className="saved-banner" data-od-id="estudar-salvas">
              <div>
                <span className="sk">★ {t("study.savedTitle")}</span>
                <h2>{fmt(t("study.savedDesc"), { n: ss.savedIds().length })}</h2>
                <p className="nm">{t("study.savedNote")}</p>
              </div>
              <button type="button" className="btn secondary" onClick={startSavedSession}>
                {t("study.studySaved")}
              </button>
            </div>
          ) : null}

          <div className="plan-head">
            <h2 id="chaptersTitle">{t("study.chapters")}</h2>
            <span>{fmt(t("study.chaptersMeta"), { n: c.chapters.length })}</span>
          </div>
          <div className="chapters">
            {c.chapters.map((ch) => {
              const pct = ss.pctFor(ch);
              return (
                <details
                  className="chapter"
                  key={ch.n}
                  data-ch={ch.n}
                  data-next={ch.n === c.nextChapter}
                  data-done={pct >= 100}
                >
                  <summary>
                    <span className="ch-no">{pad2(ch.n)}</span>
                    <span className="ch-main">
                      <span className="ch-name">{ch.name[lang]}</span>
                      {ch.sub[lang] !== ch.name[lang] ? (
                        <span className="ch-sub">{ch.sub[lang]}</span>
                      ) : null}
                      <span className="ch-meta">
                        <span>{fmt(t("study.examQ"), { n: ch.examQ })}</span>
                        <span className="topics-meta">
                          {fmt(t("study.topics"), { n: ch.topics.length })}
                        </span>
                      </span>
                    </span>
                    <span className="ch-cov">
                      <span className="ch-pct">{pct}%</span>
                      <span className="ch-bar" aria-hidden="true">
                        <i style={{ width: pct + "%" }} />
                      </span>
                    </span>
                    <svg className="ch-chev" viewBox="0 0 16 16" aria-hidden="true">
                      <path
                        d="m3 6 5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div className="ch-body">
                    <div className="topics" role="list" aria-label={t("a11y.topics")}>
                      {ch.topics.map((topic, idx) => (
                        <span role="listitem" key={idx}>
                          {topic[lang]}
                        </span>
                      ))}
                    </div>
                    <div className="ch-actions">
                      <button
                        type="button"
                        className="btn secondary sm"
                        data-ch={ch.n}
                        onClick={() => startSession(ch.n)}
                      >
                        {t("study.studyChapter")}
                      </button>
                      <span className="ch-seen">
                        {fmt(t("study.chSeen"), { seen: ss.seenFor(ch), total: ch.total })}
                      </span>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        <aside className="aside" data-od-id="estudar-prova">
          <h2>{t("study.exam")}</h2>
          <dl className="facts">
            <div className="fact">
              <dt>{t("study.questions")}</dt>
              <dd>{ex ? ex.q : "—"}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.time")}</dt>
              <dd>{ex ? ex.min + " min" : "—"}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.cut")}</dt>
              <dd>{ss.cutText(c.exam)}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.chaptersCount")}</dt>
              <dd>{c.chapters.length}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.last")}</dt>
              <dd>{lastText}</dd>
            </div>
            <div className="fact">
              <dt>{t("study.source")}</dt>
              <dd>ISTQB {c.version}</dd>
            </div>
          </dl>
          <p className="aside-note">{"Syllabus " + c.year}</p>
        </aside>
      </div>

      <ViewFoot
        label={t("study.footnote")}
        tail={`Synapse · ${t("study.nav")} · ${c.code} ${c.version}`}
      />
    </>
  );
}
