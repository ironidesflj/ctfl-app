import { useReducer, useEffect, useRef, useMemo } from "react";
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

const initialState = {
  phase: "setup", // setup | running | result
  mode: "practice", // practice | exam | saved | srs
  domain: "all", // ou "wrong" no modo "errei antes"
  count: 10,
  questions: [],
  opts: [], // alternativas embaralhadas por questão
  idx: 0,
  answers: [], // índice escolhido por questão
  showReview: false,
  showGrid: false,
  timeLeft: 0,
};

function quizReducer(state, action) {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_DOMAIN":
      return { ...state, domain: action.domain };
    case "SET_COUNT":
      return { ...state, count: action.count };
    case "APPLY_INITIAL_FILTER":
      return { ...state, domain: action.domain, mode: "practice" };
    case "START_QUIZ":
      return {
        ...state,
        questions: action.questions,
        opts: action.opts,
        answers: new Array(action.questions.length).fill(null),
        idx: 0,
        showReview: false,
        showGrid: false,
        phase: "running",
        timeLeft: action.timeLeft,
      };
    case "SELECT_EXAM": {
      const next = [...state.answers];
      next[state.idx] = action.optIndex;
      return { ...state, answers: next };
    }
    case "ANSWER_PRACTICE": {
      const next = [...state.answers];
      next[state.idx] = action.optIndex;
      return { ...state, answers: next };
    }
    case "SET_IDX":
      return { ...state, idx: action.idx };
    case "TICK_TIMER":
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
    case "TOGGLE_REVIEW":
      return { ...state, showReview: !state.showReview };
    case "TOGGLE_GRID":
      return { ...state, showGrid: !state.showGrid };
    case "FINISH":
      return { ...state, phase: "result" };
    case "BACK_TO_SETUP":
      return { ...state, phase: "setup" };
    case "RESET":
      return { ...state, phase: "setup" };
    default:
      return state;
  }
}

export default function Quiz({ onAnswer, progress, setProgress, initialFilter, onFilterConsumed, lang = "pt" }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { phase, mode, domain, count, questions, opts, idx, answers, showReview, showGrid, timeLeft } = state;

  const wrongIds = progress ? getWrongIds(progress) : [];
  const dueIds = progress ? getDueItems(progress, ALL.map((q) => q.id)) : [];

  useEffect(() => {
    if (initialFilter) {
      dispatch({ type: "APPLY_INITIAL_FILTER", domain: initialFilter.domain });
      onFilterConsumed();
    }
  }, [initialFilter]);

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
    const newOpts = qs.map((q) => shuffleOptions(q));
    const newTimeLeft = mode === "exam" ? META.examFormat.timeMinutesNonNative * 60 : 0;
    dispatch({ type: "START_QUIZ", questions: qs, opts: newOpts, timeLeft: newTimeLeft });
    if (mode === "exam") {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK_TIMER" });
      }, 1000);
    }
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
    dispatch({ type: "FINISH" });
  }

  // Substitui o finish() embutido no updater funcional de setTimeLeft do
  // código pré-reducer. Mesmo gatilho observável (exam acaba quando o
  // tempo zera), caminho mais limpo: TICK_TIMER só decrementa estado,
  // este efeito separado decide quando chamar finish().
  useEffect(() => {
    if (mode === "exam" && phase === "running" && timeLeft === 0) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, mode]);

  function answerPractice(optIndex) {
    if (answers[idx] !== null) return;
    const question = questions[idx];
    const correct = opts[idx][optIndex].correct;
    dispatch({ type: "ANSWER_PRACTICE", optIndex });
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
    dispatch({ type: "SELECT_EXAM", optIndex });
  }

  const score = useMemo(() => {
    return questions.reduce((acc, _q, i) => {
      const a = answers[i];
      return acc + (a !== null && opts[i] && opts[i][a].correct ? 1 : 0);
    }, 0);
  }, [questions, answers, opts, phase]);

  function reset() {
    clearInterval(timerRef.current);
    dispatch({ type: "RESET" });
  }

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="quiz">
        <div className="mode-toggle">
          <button className={"mode-btn" + (mode === "practice" ? " active" : "")} onClick={() => dispatch({ type: "SET_MODE", mode: "practice" })}>
            <span className="mode-title">{t(lang, "quiz.modeStudy")}</span>
            <span className="mode-desc">{t(lang, "quiz.modeStudyDesc")}</span>
          </button>
          <button className={"mode-btn" + (mode === "exam" ? " active" : "")} onClick={() => dispatch({ type: "SET_MODE", mode: "exam" })}>
            <span className="mode-title">{t(lang, "quiz.modeExam")}</span>
            <span className="mode-desc">{t(lang, "quiz.modeExamDesc", { n: META.examFormat.questions, min: META.examFormat.timeMinutesNonNative })}</span>
          </button>
          {getSavedIds(progress).length > 0 && (
            <button
              className={"mode-btn" + (mode === "saved" ? " active" : "")}
              onClick={() => dispatch({ type: "SET_MODE", mode: "saved" })}
            >
              <span className="mode-title">{t(lang, "quiz.modeSaved")}</span>
              <span className="mode-desc">
                {t(lang, "quiz.modeSavedDesc", { n: getSavedIds(progress).length })}
              </span>
            </button>
          )}
          {dueIds.length > 0 && (
            <button className={"mode-btn" + (mode === "srs" ? " active" : "")} onClick={() => dispatch({ type: "SET_MODE", mode: "srs" })}>
              <span className="mode-title">{t(lang, "quiz.modeSRS")}</span>
              <span className="mode-desc">{dueIds.length} {t(lang, "quiz.srsDueDesc")}</span>
            </button>
          )}
        </div>

        {mode === "practice" ? (
          <div className="card">
            <h3>{t(lang, "quiz.chooseDomain")}</h3>
            <div className="domain-grid">
              <button className={"domain-card wide" + (domain === "all" ? " selected" : "")} onClick={() => dispatch({ type: "SET_DOMAIN", domain: "all" })}>
                <span className="domain-weight">{t(lang, "quiz.allDomains")}</span>
                <span className="domain-sub">{t(lang, "domainAllDesc")}</span>
              </button>
              {wrongIds.length > 0 && (
                <button className={"domain-card wide" + (domain === "wrong" ? " selected" : "")} onClick={() => dispatch({ type: "SET_DOMAIN", domain: "wrong" })}>
                  <span className="domain-weight">{t(lang, "quiz.wrongBefore")}</span>
                  <span className="domain-sub">{t(lang, "quiz.wrongBeforeDesc", { n: wrongIds.length })}</span>
                </button>
              )}
              {DOMAINS.map((d) => (
                <button key={d.id} className={"domain-card" + (domain === d.id ? " selected" : "")} onClick={() => dispatch({ type: "SET_DOMAIN", domain: d.id })}>
                  <span className="domain-weight">{chapterWeight(d.chapter)} / {META.total}</span>
                  <span className="domain-name">{domainNameInLang(d.id, lang)}</span>
                </button>
              ))}
            </div>
            <div className="count-row">
              <span className="muted">{t(lang, "quiz.quantity")}</span>
              {[10, 20, 99].map((n) => (
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => dispatch({ type: "SET_COUNT", count: n })}>
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
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => dispatch({ type: "SET_COUNT", count: n })}>
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
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => dispatch({ type: "SET_COUNT", count: n })}>
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
            <button className="btn" onClick={() => dispatch({ type: "TOGGLE_REVIEW" })}>{showReview ? t(lang, "quiz.hideReview") : t(lang, "quiz.showReview")}</button>
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
        onClick={() => { clearInterval(timerRef.current); dispatch({ type: "BACK_TO_SETUP" }); }}
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
            <button className="btn" onClick={() => dispatch({ type: "TOGGLE_GRID" })}>
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
              <QuestionGrid answers={answers} currentIndex={idx} onJump={(i) => dispatch({ type: "SET_IDX", idx: i })} />
            </div>
          )}
        </>
      )}

      <div className="card">
        <div key={idx} className={"quiz-split" + (answered ? " has-explain" : "")}>
          <div className="quiz-question-col">
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
          </div>

          {answered && (
            <div className="quiz-explain-col">
              <div className="explanation">{q.exp}</div>

              {(() => {
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

              <button
                className={"btn " + (saved ? "btn-saved" : "primary")}
                onClick={() => setProgress((p) => toggleSaved(p, q.id))}
                style={{ marginTop: '0.5rem' }}
              >
                {saved ? t(lang, "quiz.saved") : t(lang, "quiz.saveQuestion")}
              </button>

              {mode === "srs" && (
                <div className="srs-quality">
                  <button className="btn srs-again" onClick={() => rateSRS("again")}>{t(lang, "quiz.srsAgain")}</button>
                  <button className="btn srs-hard" onClick={() => rateSRS("hard")}>{t(lang, "quiz.srsHard")}</button>
                  <button className="btn srs-good" onClick={() => rateSRS("good")}>{t(lang, "quiz.srsGood")}</button>
                  <button className="btn srs-easy" onClick={() => rateSRS("easy")}>{t(lang, "quiz.srsEasy")}</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="actions">
          {mode === "exam" && idx > 0 && <button className="btn" onClick={() => dispatch({ type: "SET_IDX", idx: idx - 1 })}>{t(lang, "quiz.prev")}</button>}
          {!isLast && (mode === "exam" || answered) && <button className="btn primary" onClick={() => dispatch({ type: "SET_IDX", idx: idx + 1 })}>{t(lang, "quiz.next")}</button>}
          {isLast && (mode === "exam" || answered) && <button className="btn primary" onClick={finish}>{mode === "exam" ? t(lang, "quiz.finishExam") : t(lang, "quiz.seeResult")}</button>}
        </div>
      </div>
    </div>
  );
}
