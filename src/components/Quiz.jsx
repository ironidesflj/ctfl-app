import { useState, useEffect, useRef, useMemo } from "react";
import { DOMAINS, domainName, chapterWeight, byDomainInLang, byIds, buildExamInLang, shuffle, shuffleOptions, META } from "../lib/bank.js";
import { getWrongIds, isSaved, toggleSaved, getSavedIds } from "../lib/storage.js";
import { findGlossaryTermsInText } from "../data/glossary.js";
import bank from "../data/ctfl-questions-ptbr.json";

const hasEN = (id) => !!bank.questions.find((q) => q.id === id)?.locales?.en;

const LETTERS = ["A", "B", "C", "D", "E"];

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function Quiz({ onAnswer, progress, setProgress, initialFilter, onFilterConsumed, lang = "pt" }) {
  const [phase, setPhase] = useState("setup"); // setup | running | result
  const [mode, setMode] = useState("practice"); // practice | exam
  const [domain, setDomain] = useState("all"); // ou "wrong" no modo "errei antes"
  const [count, setCount] = useState(10);

  const wrongIds = progress ? getWrongIds(progress) : [];

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
    } else {
      const pool = domain === "wrong" ? byIds(wrongIds) : byDomainInLang(domain, lang);
      qs = shuffle(pool).slice(0, Math.min(count, pool.length));
    }
    setQuestions(qs);
    setOpts(qs.map((q) => shuffleOptions(q)));
    setAnswers(new Array(qs.length).fill(null));
    setIdx(0);
    setShowReview(false);
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
    onAnswer(questions[idx].domain, opts[idx][optIndex].correct, questions[idx].id);
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
        onAnswer(q.domain, !!correct);
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
            <span className="mode-title">Estudo</span>
            <span className="mode-desc">Feedback e explicação a cada questão</span>
          </button>
          <button className={"mode-btn" + (mode === "exam" ? " active" : "")} onClick={() => setMode("exam")}>
            <span className="mode-title">Simulado</span>
            <span className="mode-desc">{META.examFormat.questions} questões · {META.examFormat.timeMinutesNonNative} min · revisão no fim</span>
          </button>
          {getSavedIds(progress).length > 0 && (
            <button
              className={"mode-btn" + (mode === "saved" ? " active" : "")}
              onClick={() => setMode("saved")}
            >
              <span className="mode-title">★ Salvos</span>
              <span className="mode-desc">
                {getSavedIds(progress).length} questão(ões) marcada(s) para revisar
              </span>
            </button>
          )}
        </div>

        {mode === "practice" ? (
          <div className="card">
            <h3>Escolha o domínio</h3>
            <div className="domain-grid">
              <button className={"domain-card wide" + (domain === "all" ? " selected" : "")} onClick={() => setDomain("all")}>
                <span className="domain-weight">Todos os domínios</span>
                <span className="domain-sub">Mistura de todos os capítulos</span>
              </button>
              {wrongIds.length > 0 && (
                <button className={"domain-card wide" + (domain === "wrong" ? " selected" : "")} onClick={() => setDomain("wrong")}>
                  <span className="domain-weight">Errei antes</span>
                  <span className="domain-sub">{wrongIds.length} questão(ões) que você errou</span>
                </button>
              )}
              {DOMAINS.map((d) => (
                <button key={d.id} className={"domain-card" + (domain === d.id ? " selected" : "")} onClick={() => setDomain(d.id)}>
                  <span className="domain-weight">{chapterWeight(d.chapter)} / {META.total}</span>
                  <span className="domain-name">{d.name}</span>
                </button>
              ))}
            </div>
            <div className="count-row">
              <span className="muted">Quantidade:</span>
              {[10, 20, 99].map((n) => (
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => setCount(n)}>
                  {n === 99 ? "Todas" : n}
                </button>
              ))}
            </div>
          </div>
        ) : mode === "saved" ? (
          <div className="card">
            <p className="muted">
              Revise as {getSavedIds(progress).length} questão(ões) que você marcou com ★ durante o estudo.
            </p>
            <div className="count-row">
              <span className="muted">Quantidade:</span>
              {[10, 20, 99].map((n) => (
                <button key={n} className={"chip" + (count === n ? " on" : "")} onClick={() => setCount(n)}>
                  {n === 99 ? "Todas" : n}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="muted">
              O modo Simulado reproduz a prova: {META.examFormat.questions} questões na proporção dos capítulos,
              cronômetro de {META.examFormat.timeMinutesNonNative} minutos (tempo estendido para não-nativos),
              sem feedback até o final.
            </p>
          </div>
        )}

        <button className="btn primary" onClick={start}>Iniciar</button>
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
          <div className={"verdict " + (passed ? "ok" : "no")}>{passed ? "Aprovado" : "Abaixo da nota de corte"}</div>
          <p className="muted">
            {pct >= 85 ? "Excelente domínio. Pronto para a prova." : passed ? "Passou! Reforce os domínios mais fracos na aba Progresso." : "A nota de corte é 65% (26/40). Revise os erros abaixo."}
          </p>
          <div className="actions center">
            <button className="btn ghost" onClick={reset}>← Voltar ao início</button>
            <button className="btn" onClick={() => setShowReview((v) => !v)}>{showReview ? "Ocultar revisão" : "Revisar erros"}</button>
            <button className="btn primary" onClick={reset}>Refazer este quiz</button>
          </div>
        </div>

        {showReview && (
          <div className="card">
            <h3>Revisão dos erros</h3>
            {wrong.length === 0 ? (
              <p className="ok">Nenhum erro — gabaritou!</p>
            ) : (
              wrong.map(({ q, i }) => {
                const correct = opts[i].find((o) => o.correct);
                const chosen = answers[i] === null ? null : opts[i][answers[i]];
                return (
                  <div className="review-item" key={q.id}>
                    <div className="review-q">{i + 1}. {q.q}</div>
                    <div className="review-a no">✗ Sua resposta: {chosen ? chosen.text : "não respondida"}</div>
                    <div className="review-a ok">✓ Correta: {correct.text}</div>
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
  const answered = (mode === "practice" || mode === "saved") && answers[idx] !== null;
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
        ← Voltar
      </button>
      <div className="run-head">
        <span className="muted">Questão {idx + 1} de {questions.length}</span>
        {mode === "exam" && <span className={"timer " + timerClass}>{fmtTime(timeLeft)}</span>}
      </div>
      <div className="progress"><div className="progress-fill" style={{ width: pct + "%" }} /></div>

      <div className="card">
        <div className="q-meta">
          <span className="q-domain">{domainName(q.domain)}</span>
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
              {lang === "pt" ? "Termos: " : "Terms: "}
              {matchedTerms.map((t) => (
                <span key={t.id} className="glossary-tag">{t.term}</span>
              ))}
            </div>
          );
        })()}

        {answered && (
          <button
            className={"btn " + (saved ? "primary" : "ghost")}
            onClick={() => setProgress((p) => toggleSaved(p, q.id))}
            style={{ marginTop: '0.5rem' }}
          >
            {saved ? "★ Salvo" : "☆ Salvar questão"}
          </button>
        )}

        <div className="actions">
          {mode === "exam" && idx > 0 && <button className="btn" onClick={() => setIdx(idx - 1)}>← Anterior</button>}
          {!isLast && (mode === "exam" || answered) && <button className="btn primary" onClick={() => setIdx(idx + 1)}>Próxima →</button>}
          {isLast && (mode === "exam" || answered) && <button className="btn primary" onClick={finish}>{mode === "exam" ? "Finalizar simulado" : "Ver resultado"}</button>}
        </div>
      </div>
    </div>
  );
}
