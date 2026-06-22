import { useState, useEffect, useRef, useMemo } from "react";
import { DOMAINS, ALL, domainName, domainNameInLang, chapterWeight, byDomainInLang, byIds, buildExamInLang, shuffle, shuffleOptions, META } from "../lib/bank.js";
import { getWrongIds, isSaved, toggleSaved, getSavedIds, getSRSCard, updateSRSCard, getDueItems } from "../lib/storage.js";
import { initSM2, sm2, QUALITY } from "../lib/spacedRepetition.js";
import { findGlossaryTermsInText } from "../data/glossary.js";
import { t } from "../lib/ui-strings.js";
import bank from "../data/ctfl-questions-ptbr.json";

const hasEN = (id) => !!bank.questions.find((q) => q.id === id)?.locales?.en;

const LETTERS = ["A", "B", "C", "D", "E"];

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function QuestionGrid({ answers, currentIndex, onJump }) {
  return (
    <div className="exam-grid">
      {answers.map((ans, i) => (
        <button
          key={i}
          className={
            "exam-grid-item" +
            (i === currentIndex ? " current" : "") +
            (ans !== null && ans !== undefined ? " answered" : " unanswered")
          }
          onClick={() => onJump(i)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export default function Quiz({ onAnswer, progress, setProgress, initialFilter, onFilterConsumed, lang = "pt" }) {
  const [phase, setPhase] = useState("setup"); // setup | running | result
  const [mode, setMode] = useState("practice"); // practice | exam
  const [domain, setDomain] = useState("all"); // ou "wrong" no modo "errei antes"
  const [count, setCount] = useState(10);

  const wrongIds = progress ? getWrongIds(progress) : [];
  const dueIds = progress ? getDueItems(progress, ALL.map((q) => q.id)) : [];

  useEffect(() => {
    if (initialFilter) {
      setDomain(initialFilter.domain);
      setMode("practice");
      onFilterConsumed();
    }
  }, [initialFilter]);

  const [questions, setQuestions] = useState([]);
  const [opts, setOpts] = useState([]); // alternativas embaralhadas por questão
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // índice escolhido por questão
  const [showReview, setShowReview] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function start() {
    let qs;
    if (mode === "exam") {
      qs = buildExamInLang(lang);
    } else if (mode === "saved") {
      const ids = getSavedIds(progress);
      const pool = byIds(ids);
      qs = shuffle(pool).slice(0, Math.min(count, pool.length));
    } else if (mode === "srs") {
      const pool = byIds(dueIds);
      qs = shuffle(pool).slice(0, Math.min(count, pool.length));
    } else {
      const pool = domain === "wrong" ? byIds(wrongIds) : byDomainInLang(domain, lang);
      qs = shuffle(pool).slice(0, Math.min(count, pool.length));
    }
    setQuestions(qs);
    setOpts(qs.map((q) => shuffleOptions(q)));
    setAnswers(new Array(qs.length).fill(null));
    setIdx(0);
    setShowReview(false);
    setShowGrid(false);
    setPhase("running");
    if (mode === "exam") {
      setTimeLeft(META.examFormat.timeMinutesNonNative * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            finish();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
  }

  function answerPractice(optIndex) {
    if (answers[idx] !== null) return;
    const next = [...answers];
    next[idx] = optIndex;
    setAnswers(next);
    const question = questions[idx];
    const correct = opts[idx][optIndex].correct;
    onAnswer(question.domain, correct, question.id);

    if (mode !== "srs") {
      const existing = getSRSCard(progress, question.id);
      if (!existing) {
        const card = initSM2();
        const updated = sm2(card, correct ? QUALITY.good : QUALITY.again);
        setProgress((p) => updateSRSCard(p, question.id, updated));
      }
    }
  }

  function rateSRS(label) {
    const question = questions[idx];
    const card = getSRSCard(progress, question.id) || initSM2();
    const updated = sm2(card, QUALITY[label]);
    setProgress((p) => updateSRSCard(p, question.id, updated));
  }

  function selectExam(optIndex) {
    const next = [...answers];
    next[idx] = optIndex;
    setAnswers(next);
  }

  function finish() {
    clearInterval(timerRef.current);
    if (mode === "exam") {
      questions.forEach((q, i) => {
        const a = answers[i];
        const correct = a !== null && opts[i][a].correct;
        onAnswer(q.domain, !!correct, q.id);
      });
    }
    setPhase("result");
  }

  const score = useMemo(() => {
    return questions.reduce((acc, _q, i) => {
      const a = answers[i];
      return acc + (a !== null && opts[i] && opts[i][a].correct ? 1 : 0);
    }, 0);
  }, [questions, answers, opts, phase]);

  function reset() {
    clearInterval(timerRef.current);
    setPhase("setup");
  }

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="quiz">
        <div className="mode-toggle">
          <button className={"mode-btn" + (mode === "practice" ? " active" : "")} onClick={() => setMode("practice")}>
            <span className="mode-title">{t(lang, "quiz.modeStudy")}</span>
            <span className="mode-desc">{t(lang, "quiz.modeStudyDesc")}</span>
          </button>
          <button className={"mode-btn" + (mode === "exam" ? " active" : "")} onClick={() => setMode("exam")}>
            <span className="mode-title">{t(lang, "quiz.modeExam")}</span>
            <span className="mode-desc">{t(lang, "quiz.modeExamDesc", { n: META.examFormat.questions, min: META.examFormat.timeMinutesNonNative })}</span>
          </button>
          {getSavedIds(progress).length > 0 && (
            <button
              className={"mode-btn" + (mode === "saved" ? " active" : "")}
              onClick={() => setMode("saved")}
            >
              <span className="mode-title">{t(lang, "quiz.modeSaved")}</span>
              <span className="mode-desc">
                {t(lang, "quiz.modeSavedDesc", { n: getSavedIds(progress).length })}
              </span>
            </button>
          )}
          {dueIds.length > 0 && (
            <button className={"mode-btn" + (mode === "srs" ? " active" : "")} onClick={() => setMode("srs")}>
              <span className="mode-title">{t(lang, "quiz.modeSRS")}</span>
              <span className="mode-desc">{dueIds.length} {t(lang, "quiz.srsDueDesc")}</span>
            </button>
          )}
        </div>

        {mode === "practice" ? (
          <div className="card">
            <h3>{t(lang, "quiz.chooseDomain")}</h3>
            <div className="domain-grid">
              <button className={"domain-card wide" + (domain === "all" ? " selected" : "")} onClick={() => setDomain("all")}>
                <span className="domain-weight">{t(lang, "quiz.allDomains")}</span>
                <span className="domain-sub">{t(lang, "domainAllDesc")}</span>
              </button>
              {wrongIds.length > 0 && (
                <button className={"domain-card wide" + (domain === "wrong" ? " selected" : "")} onClick={() => setDomain("wrong")}>
                  <span className="domain-weight">{t(lang, "quiz.wrongBefore")}</span>
                  <span className="domain-sub">{t(lang, "quiz.wrongBeforeDesc", { n: wrongIds.length })}</span>
                </button>
              )}
              {DOMAINS.map((d) => (
                <button key={d.id} className={"domain-card" + (domain === d.id ? " selected" : "")} onClick={() => setDomain(d.id)}>
                  <span className="domain-weight">{chapterWeight(d.chapter)} / {META.total}</span>
                  <span className="domain-name">{domainNameInLang(d.id, lang)}</span>
                </button>
              ))}
            </div>
            <div className="count-row">
              <span className="muted">{t(lang, "quiz.quantity")}</span>
              {[10, 20, 99].map((n) => (
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => setCount(n)}>
                  {n === 99 ? t(lang, "quiz.all") : n}
                </button>
              ))}
            </div>
          </div>
        ) : mode === "saved" ? (
          <div className="card">
            <p className="muted">
              {t(lang, "quiz.savedReviewHint", { n: getSavedIds(progress).length })}
            </p>
            <div className="count-row">
              <span className="muted">{t(lang, "quiz.quantity")}</span>
              {[10, 20, 99].map((n) => (
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => setCount(n)}>
                  {n === 99 ? t(lang, "quiz.all") : n}
                </button>
              ))}
            </div>
          </div>
        ) : mode === "srs" ? (
          <div className="card">
            <p className="muted">
              {dueIds.length} {t(lang, "quiz.srsDueDesc")}
            </p>
            <div className="count-row">
              <span className="muted">{t(lang, "quiz.quantity")}</span>
              {[10, 20, 99].map((n) => (
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => setCount(n)}>
                  {n === 99 ? t(lang, "quiz.all") : n}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="muted">
              {t(lang, "quiz.examExplain", { n: META.examFormat.questions, min: META.examFormat.timeMinutesNonNative })}
            </p>
          </div>
        )}

        <button className="btn primary" onClick={start}>{t(lang, "quiz.start")}</button>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (phase === "result") {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 65;
    const wrong = questions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => !(answers[i] !== null && opts[i][answers[i]].correct));

    return (
      <div className="quiz">
        <div className="card result">
          <div className="result-score">{score}/{total} · {pct}%</div>
          <div className={"verdict " + (passed ? "ok" : "no")}>{passed ? t(lang, "quiz.passed") : t(lang, "quiz.failed")}</div>
          <p className="muted">
            {pct >= 85 ? t(lang, "quiz.excellentMsg") : passed ? t(lang, "quiz.passedMsg") : t(lang, "quiz.failedMsg")}
          </p>
          <div className="actions center">
            <button className="btn ghost" onClick={reset}>{t(lang, "quiz.backHome")}</button>
            <button className="btn" onClick={() => setShowReview((v) => !v)}>{showReview ? t(lang, "quiz.hideReview") : t(lang, "quiz.showReview")}</button>
            <button className="btn primary" onClick={reset}>{t(lang, "quiz.retakeQuiz")}</button>
          </div>
        </div>

        {showReview && (
          <div className="card">
            <h3>{t(lang, "quiz.reviewErrors")}</h3>
            {wrong.length === 0 ? (
              <p className="ok">{t(lang, "quiz.noErrors")}</p>
            ) : (
              wrong.map(({ q, i }) => {
                const correct = opts[i].find((o) => o.correct);
                const chosen = answers[i] === null ? null : opts[i][answers[i]];
                return (
                  <div className="review-item" key={q.id}>
                    <div className="review-q">{i + 1}. {q.q}</div>
                    <div className="review-a no">✗ {t(lang, "quiz.yourAnswer")} {chosen ? chosen.text : t(lang, "quiz.notAnswered")}</div>
                    <div className="review-a ok">✓ {t(lang, "quiz.correctAnswer")} {correct.text}</div>
                    <div className="review-exp">{q.exp}</div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------- RUNNING ----------
  const q = questions[idx];
  const o = opts[idx];
  const answered = (mode === "practice" || mode === "saved" || mode === "srs") && answers[idx] !== null;
  const saved = isSaved(progress, q?.id);
  const isLast = idx === questions.length - 1;
  const pct = Math.round(((idx + 1) / questions.length) * 100);
  const timerClass = timeLeft <= 300 ? "danger" : timeLeft <= 600 ? "warn" : "";

  return (
    <div className="quiz">
      <button
        className="btn ghost back-btn"
        onClick={() => { clearInterval(timerRef.current); setPhase("setup"); }}
      >
        {t(lang, "quiz.backShort")}
      </button>
      <div className="run-head">
        <span className="muted">{t(lang, "quiz.questionOf", { n: idx + 1, total: questions.length })}</span>
        {mode === "exam" && <span className={"timer " + timerClass}>{fmtTime(timeLeft)}</span>}
      </div>
      <div className="progress"><div className="progress-fill" style={{ width: pct + "%" }} /></div>

      {mode === "exam" && (
        <>
          <div className="actions" style={{ marginTop: 0, marginBottom: '0.8rem' }}>
            <button className="btn" onClick={() => setShowGrid((v) => !v)}>
              {showGrid ? t(lang, "quiz.hideGrid") : t(lang, "quiz.showGrid")}
            </button>
          </div>
          {showGrid && (
            <div className="card">
              <div className="exam-grid-summary">
                {t(lang, "quiz.gridSummary", {
                  answered: answers.filter((a) => a !== null && a !== undefined).length,
                  total: questions.length,
                  blank: answers.filter((a) => a === null || a === undefined).length,
                })}
              </div>
              <QuestionGrid answers={answers} currentIndex={idx} onJump={(i) => setIdx(i)} />
            </div>
          )}
        </>
      )}

      <div className="card">
        <div className="q-meta">
          <span className="q-domain">{domainName(q.domain, lang)}</span>
          <span className={"klvl k" + q.kLevel}>K{q.kLevel}</span>
        </div>
        {lang === "en" && !hasEN(questions[idx]?.id) && (
          <span style={{fontSize:'11px', color:'var(--text-3)'}}>
            EN coming soon · showing PT
          </span>
        )}
        <p className="q-text">{q.q}</p>

        <div className="options">
          {o.map((opt, i) => {
            let cls = "opt";
            if (mode === "exam") {
              if (answers[idx] === i) cls += " picked";
            } else if (answered) {
              cls += " locked";
              if (opt.correct) cls += answers[idx] === i ? " correct" : " reveal";
              else if (answers[idx] === i) cls += " wrong";
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => (mode === "exam" ? selectExam(i) : answerPractice(i))}
                disabled={answered}
              >
                <span className="opt-letter">{LETTERS[i]}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {answered && <div className="explanation">{q.exp}</div>}

        {answered && (() => {
          const matchedTerms = findGlossaryTermsInText(q.exp, lang);
          return matchedTerms.length > 0 && (
            <div className="glossary-hint">
              {t(lang, "quiz.terms")}
              {matchedTerms.map((term) => (
                <span key={term.id} className="glossary-tag">{term.term}</span>
              ))}
            </div>
          );
        })()}

        {answered && (
          <button
            className={"btn " + (saved ? "btn-saved" : "primary")}
            onClick={() => setProgress((p) => toggleSaved(p, q.id))}
            style={{ marginTop: '0.5rem' }}
          >
            {saved ? t(lang, "quiz.saved") : t(lang, "quiz.saveQuestion")}
          </button>
        )}

        {mode === "srs" && answered && (
          <div className="srs-quality">
            <button className="btn srs-again" onClick={() => rateSRS("again")}>{t(lang, "quiz.srsAgain")}</button>
            <button className="btn srs-hard" onClick={() => rateSRS("hard")}>{t(lang, "quiz.srsHard")}</button>
            <button className="btn srs-good" onClick={() => rateSRS("good")}>{t(lang, "quiz.srsGood")}</button>
            <button className="btn srs-easy" onClick={() => rateSRS("easy")}>{t(lang, "quiz.srsEasy")}</button>
          </div>
        )}

        <div className="actions">
          {mode === "exam" && idx > 0 && <button className="btn" onClick={() => setIdx(idx - 1)}>{t(lang, "quiz.prev")}</button>}
          {!isLast && (mode === "exam" || answered) && <button className="btn primary" onClick={() => setIdx(idx + 1)}>{t(lang, "quiz.next")}</button>}
          {isLast && (mode === "exam" || answered) && <button className="btn primary" onClick={finish}>{mode === "exam" ? t(lang, "quiz.finishExam") : t(lang, "quiz.seeResult")}</button>}
        </div>
      </div>
    </div>
  );
}
