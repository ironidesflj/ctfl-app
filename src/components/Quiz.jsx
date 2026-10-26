import { useReducer, useEffect, useRef, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import {
  getWrongIds,
  isSaved,
  toggleSaved,
  getSavedIds,
  getSRSCard,
  rateSRS,
  updateSRSCard,
  getDueItems,
  logExamResult,
  saveExamDraft,
  loadExamDraft,
  clearExamDraft,
  lastExamWrongIds,
} from "../lib/storage.js";
import { initSM2, sm2, QUALITY } from "../lib/spacedRepetition.js";
import { weakChapters } from "../lib/activity.js";
import { findGlossaryTermsInText } from "../data/glossary.js";
import { t } from "../lib/ui-strings.js";

const LETTERS = ["A", "B", "C", "D", "E"];

// r4: anel de pontuação animado (SVG stroke-dashoffset). O count-up do número
// respeita prefers-reduced-motion (pula direto pro valor final); o traçado em
// si é CSS e também é desligado pelo guard global de reduced-motion.
// r5/lint: o reset do valor (reduced-motion ou pct=0) usa o padrão "ajuste
// durante render" do react.dev — setState direto no corpo do effect é
// cascata de render proibida pela regra set-state-in-effect. t0Ref só é
// escrito dentro de effects (nunca durante render) e mantém o easing
// estável entre as re-execuções do efeito (deps incluem `shown`).
function ScoreRing({ pct, passed }) {
  const [reduce] = useState(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [shown, setShown] = useState(reduce ? pct : 0);
  const [prevPct, setPrevPct] = useState(pct);
  if (prevPct !== pct) {
    setPrevPct(pct);
    setShown(reduce || pct === 0 ? pct : 0);
  }
  const t0Ref = useRef(null);
  useEffect(() => {
    if (shown >= pct) {
      t0Ref.current = null;
      return;
    }
    if (t0Ref.current === null) t0Ref.current = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0Ref.current) / 700);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(eased * pct));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, pct]);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className={"score-ring" + (passed ? " ok" : " no")} role="img" aria-label={`${pct}%`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r={r} />
        <circle
          className="ring-value"
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={c}
          style={{ "--ring-c": c, "--ring-target": c * (1 - pct / 100) }}
        />
      </svg>
      <div className="score-ring-num" aria-hidden="true">
        <span className="num">{shown}</span>
        <span className="pct">%</span>
      </div>
    </div>
  );
}

// r4: confete discreto na aprovação do simulado — 24 partículas CSS-only,
// aria-hidden + pointer-events:none, sem custo de lib. r5/lint: o sorteio
// das partículas usa um PRNG com semente módulo-nível (mesmo padrão aceito
// do DAY_SEED do Glossary) — Math.random durante render é função impura e
// a compilação do React Compiler barrava nisso.
const CONFETTI_RNG = (() => {
  let s = (Date.now() ^ 0x9e3779b9) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        left: Math.round(CONFETTI_RNG() * 100),
        delay: (CONFETTI_RNG() * 0.6).toFixed(2),
        dur: (1.7 + CONFETTI_RNG() * 1.3).toFixed(2),
        rot: Math.floor(CONFETTI_RNG() * 360),
        color: ["var(--accent)", "var(--ok)", "#d9a03c", "#9a72d0"][i % 4],
        w: 5 + Math.floor(CONFETTI_RNG() * 5),
        h: 8 + Math.floor(CONFETTI_RNG() * 6),
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: p.left + "%",
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: p.delay + "s",
            animationDuration: p.dur + "s",
            "--rot": p.rot + "deg",
          }}
        />
      ))}
    </div>
  );
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function QuestionGrid({ answers, flags = [], currentIndex, onJump, lang }) {
  return (
    <div className="exam-grid">
      {answers.map((ans, i) => {
        const answered = ans !== null && ans !== undefined;
        const flagged = flags[i] === true;
        const statusKey =
          i === currentIndex
            ? "quiz.statusCurrent"
            : answered
              ? "quiz.statusAnswered"
              : "quiz.statusBlank";
        return (
          <button
            key={i}
            className={
              "exam-grid-item" +
              (i === currentIndex ? " current" : "") +
              (answered ? " answered" : " unanswered") +
              (flagged ? " flagged" : "")
            }
            aria-label={
              t(lang, "quiz.gridItemAria", {
                n: i + 1,
                status: t(lang, statusKey),
              }) + (flagged ? " · " + t(lang, "quiz.statusFlagged") : "")
            }
            aria-pressed={flagged || undefined}
            onClick={() => onJump(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

const initialState = {
  phase: "setup", // setup | running | result
  mode: "practice", // practice | exam | saved | srs
  domain: "all", // ou "wrong" no modo "errei antes"
  count: 10, // 10 | 20 | "all" ("all" = todo o pool disponível, sem cap oculto)
  questions: [],
  opts: [], // alternativas embaralhadas por questão
  idx: 0,
  answers: [], // índice escolhido por questão
  flags: [], // r3: "marcar para revisão" por questão (simulado)
  // r9: segundos acumulados por questão no simulado — cada TICK_TIMER
  // credita 1s na questão corrente. A soma == tempo total decorrido (cada
  // tick cai exatamente numa questão), então a média e o total derivam daqui.
  durations: [],
  showReview: false,
  showGrid: false,
  reviewFilter: "wrong", // r3: wrong | all | correct | blank | flagged
  timeLeft: 0,
  // r4: simulado personalizado — capítulos/níveis/contagem/duração escolhidos
  // pelo usuário. customChapters null = todos; customKLevels [] = todos;
  // customCount/customMinutes null = valores oficiais do cert.
  customMode: false,
  customChapters: null,
  customKLevels: [],
  customCount: null,
  customMinutes: null,
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
        flags: new Array(action.questions.length).fill(false),
        durations: new Array(action.questions.length).fill(0),
        idx: 0,
        showReview: false,
        showGrid: false,
        reviewFilter: "wrong",
        phase: "running",
        timeLeft: action.timeLeft,
      };
    // P0: retomada de simulado a partir do rascunho persistido — restaura
    // perguntas, ordem embaralhada das opções, respostas, posição e cronômetro.
    // r4: também restaura a flag custom (simulado personalizado) para que o
    // veredito use a nota de corte proporcional na retomada.
    case "RESUME_EXAM":
      return {
        ...state,
        mode: "exam",
        customMode: action.customExam === true,
        questions: action.questions,
        opts: action.opts,
        answers: action.answers,
        flags:
          Array.isArray(action.flags) && action.flags.length === action.questions.length
            ? action.flags.map(Boolean)
            : new Array(action.questions.length).fill(false),
        durations:
          Array.isArray(action.durations) && action.durations.length === action.questions.length
            ? action.durations.map((x) => (Number.isFinite(x) && x >= 0 ? x : 0))
            : new Array(action.questions.length).fill(0),
        idx: action.idx,
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
    // r3: marca/desmarca a questão atual para revisão (só faz sentido no
    // simulado — no estudo o feedback é imediato). Persistido no rascunho.
    case "TOGGLE_FLAG": {
      const nextFlags = [...state.flags];
      nextFlags[state.idx] = !nextFlags[state.idx];
      return { ...state, flags: nextFlags };
    }
    case "SET_REVIEW_FILTER":
      return { ...state, reviewFilter: action.filter };
    // r4: simulado personalizado — toggles do painel de customização
    case "TOGGLE_CUSTOM":
      return { ...state, customMode: !state.customMode };
    case "SET_CUSTOM_CHAPTERS_ALL":
      return { ...state, customChapters: null };
    case "TOGGLE_CUSTOM_CHAPTER": {
      const all = action.allChapters;
      const cur = state.customChapters === null ? all : state.customChapters;
      const next = cur.includes(action.chapter)
        ? cur.filter((c) => c !== action.chapter)
        : [...cur, action.chapter];
      return { ...state, customChapters: next };
    }
    case "SET_CUSTOM_KALL":
      return { ...state, customKLevels: [] };
    case "SET_CUSTOM_KLEVEL": {
      const cur = state.customKLevels;
      const next = cur.includes(action.k) ? cur.filter((x) => x !== action.k) : [...cur, action.k];
      return { ...state, customKLevels: next };
    }
    case "SET_CUSTOM_COUNT":
      return { ...state, customCount: action.count };
    case "SET_CUSTOM_MINUTES":
      return { ...state, customMinutes: action.minutes };
    case "TICK_TIMER": {
      // r9: credita o segundo na questão corrente antes de decretar o tempo
      const durations = state.durations.length > 0 ? [...state.durations] : state.durations;
      if (durations.length === state.questions.length && state.idx < durations.length) {
        durations[state.idx] = (durations[state.idx] || 0) + 1;
      }
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1), durations };
    }
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

// r13: veredito de simulado — modelo de pontuação OFICIAL por cert
// (meta.examFormat.scoring):
// - "count"  (CTFL v4.0, istqb.org):    1 ponto por questão · corte 26/40
// - "points" (CTAL-TA v4.0, istqb.org):  K2=1, K3=2, K4=3 → 78 pontos no
//   blueprint de 45 questões · corte 51/78 (≈65%)
// Pura e única fonte do veredito: usada pelo finish() persistido, pela tela
// de resultado, pelo share/copy e pelos testes (quiz-examscoring.test.jsx).
// Simulado personalizado escala a nota de corte proporcionalmente ao total
// de pontos/questões realmente sorteado na seleção.
export function examVerdict(questions, opts, answers, format, { custom = false } = {}) {
  const scoring = format.scoring === "points" ? "points" : "count";
  const pointsByK = format.pointsByK || {};
  const ptsOf = (q) => (scoring === "points" ? Number(pointsByK[String(q.kLevel)]) || 1 : 1);
  let score = 0;
  let points = 0;
  let pointsTotal = 0;
  questions.forEach((q, i) => {
    pointsTotal += ptsOf(q);
    const a = answers[i];
    if (a !== null && a !== undefined && opts[i] && opts[i][a].correct) {
      score++;
      points += ptsOf(q);
    }
  });
  const total = questions.length;
  const achieved = scoring === "points" ? points : score;
  const achievable = scoring === "points" ? pointsTotal : total;
  const pct = achievable > 0 ? Math.round((achieved / achievable) * 100) : 0;
  const cutBase =
    format.passMark /
    (scoring === "points"
      ? format.totalPoints || format.passMark
      : format.questions || format.passMark);
  const passMarkEff = custom ? Math.max(1, Math.ceil(cutBase * achievable)) : format.passMark;
  return {
    scoring,
    score,
    total,
    points,
    pointsTotal,
    pct,
    passMarkEff,
    passed: achieved >= passMarkEff,
  };
}

export default function Quiz({
  onAnswer,
  progress,
  setProgress,
  initialFilter,
  onFilterConsumed,
  onStudyChapter,
  lang = "pt",
}) {
  const { cert: certId } = useParams();
  const bank = useMemo(() => getBank(certId), [certId]);
  const {
    cert,
    chapters,
    STUDY,
    EXAM,
    chapterName,
    byChapterInLang,
    byIds,
    buildExamInLang,
    buildCustomExamInLang,
    buildWeakFocusInLang,
    relocalize,
    hasEN,
    shuffle,
    shuffleOptions,
    META,
  } = bank; // r13: ALL não usado aqui — seletores têm escopo de pool

  // r5: card "🎯 treinar pontos fracos" — existe quando há ≥1 capítulo
  // com ≥3 respostas registradas (mesmo limiar do buildWeakFocusInLang).
  // r6: lógica extraída pra activity.js (weakChapters) — o CTA "Treinar
  // {chapter}" do Stats usa a MESMA definição de ponto fraco.
  const weakStats = useMemo(() => {
    if (!progress) return null;
    const stats = weakChapters(progress.byDomain, chapters);
    return stats.length > 0 ? stats : null;
  }, [chapters, progress]);

  // r5: copiar resultado do simulado (clipboard + fallback execCommand)
  const [copied, setCopied] = useState(false);
  // r7: compartilhar via Web Share API (sheet nativo) — só quando o
  // browser suporta (mobile majoritariamente; desktop Chrome/Firefox não)
  const [canShare] = useState(
    () => typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
  const [shared, setShared] = useState(false);
  async function shareResult(text) {
    try {
      await navigator.share({ title: "Synapse", text });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* usuário fechou o sheet ou share falhou — silencioso */
    }
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* best-effort: sem clipboard o botão simplesmente não confirma */
    }
  }

  const [state, dispatch] = useReducer(quizReducer, initialState);
  const {
    phase,
    mode,
    domain,
    count,
    questions,
    opts,
    idx,
    answers,
    flags,
    durations,
    showReview,
    showGrid,
    reviewFilter,
    timeLeft,
    customMode,
    customChapters,
    customKLevels,
    customCount,
    customMinutes,
  } = state;

  // r4: valores oficiais + efetivos do simulado personalizado (null = oficial)
  const officialCount = META.examFormat[certId].questions;
  // r13: tempo oficial NATIVO (BSTQB aplica em português: CTFL 60 min,
  // CTAL-TA 120 min — o +25% é extensão para não-nativos mediante solicitação
  // na inscrição; antes o app usava o tempo estendido por padrão, deixando o
  // simulado mais fácil que a prova real do usuário brasileiro).
  const officialMinutes = META.examFormat[certId].timeMinutes;
  const officialPassMark = META.examFormat[certId].passMark;
  const examScoring = META.examFormat[certId];
  const allChapterIds = chapters.map((c) => String(c.chapter));
  const effCustomChapters = customChapters === null ? allChapterIds : customChapters;
  const effCustomCount = customCount || officialCount;
  const effCustomMinutes = customMinutes || officialMinutes;
  // Pool disponível sob os filtros atuais (chapters × K-levels).
  // r13: o simulado personalizado sorteia do POOL EXCLUSIVO de simulado —
  // o contador de cada chip e o aviso de pool vazio seguem a mesma fonte.
  const customPoolCount = customMode
    ? EXAM.filter((q) => {
        const inCh = effCustomChapters.includes(String(q.chapter));
        const inK = customKLevels.length === 0 || customKLevels.includes(q.kLevel);
        return inCh && inK;
      }).length
    : 0;

  const wrongIds = progress ? getWrongIds(progress) : [];
  // r13: ids de estudo — tentações dos modos de estudo cruzam com o pool
  // exclusivo (ex.: erradas de simulado gravadas em attempts). As sessões
  // de estudo e as contagens dos cards usam esta interseção com o pool de
  // estudo; as erradas de simulado têm fluxo próprio (repetir erros).
  const studyIdSet = useMemo(() => new Set(STUDY.map((q) => q.id)), [STUDY]);
  const wrongStudyIds = wrongIds.filter((id) => studyIdSet.has(id));
  // r13: salvos de estudo — ⚑ marcados durante simulado ficam no fluxo da
  // prova (revisão do resultado / repetir erros), não no modo salvos
  const savedStudyIds = progress ? getSavedIds(progress).filter((id) => studyIdSet.has(id)) : [];
  // r10: erradas do último simulado (campo wrongIds no examHistory — provas
  // anteriores à r10 não têm → null → card não renderiza). Re-shuffle das
  // opções na hora de treinar, como qualquer sessão de estudo.
  const lastExamWrong = useMemo(() => {
    if (!progress) return null;
    const ids = lastExamWrongIds(progress);
    return ids && ids.length > 0 ? ids : null;
  }, [progress]);
  const dueIds = progress
    ? getDueItems(
        progress,
        STUDY.map((q) => q.id)
      )
    : [];

  // P0: rascunho de simulado detectado no setup (banner de retomada).
  // r5/lint: carregado via ajuste-durante-render (padrão react.dev — mesmo
  // do loadProgress no App.jsx): setState direto no corpo de effect é
  // cascata proibida (set-state-in-effect). Re-le quando volta pro setup
  // ou troca de cert; discardDraft força re-render via draftTick.
  const [draftTick, setDraftTick] = useState(0);
  const [examDraft, setExamDraft] = useState(null);
  const [draftSyncKey, setDraftSyncKey] = useState(null);
  const syncKey = phase === "setup" ? `${certId}:${draftTick}` : null;
  if (syncKey !== draftSyncKey) {
    setDraftSyncKey(syncKey);
    setExamDraft(syncKey ? loadExamDraft(certId) : null);
  }

  // P0: persiste o rascunho a cada resposta/navegação (o START_QUIZ também
  // dispara este efeito: answers/idx mudam de identidade) — exame não se
  // perde mais ao trocar de aba/rota. r3: flags também viajam no rascunho.
  // r4: flag custom viaja junto para a retomada aplicar a nota de corte
  // proporcional correta.
  useEffect(() => {
    if (mode !== "exam" || phase !== "running") return;
    saveExamDraft(certId, {
      questionIds: questions.map((q) => q.id),
      optOrder: opts.map((row) => row.map((o) => o.origIndex)),
      answers,
      flags,
      durations,
      idx,
      timeLeft,
      custom: customMode === true,
      savedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, questions, opts, answers, flags, idx]);

  // P0: atualiza o cronômetro do rascunho a cada 10s (write throttling —
  // salvar a cada tick de 1s seria desperdício). r9: durations viajam junto
  // para o tempo por questão sobreviver à troca de aba.
  useEffect(() => {
    if (mode !== "exam" || phase !== "running") return;
    if (timeLeft > 0 && timeLeft % 10 !== 0) return;
    saveExamDraft(certId, {
      questionIds: questions.map((q) => q.id),
      optOrder: opts.map((row) => row.map((o) => o.origIndex)),
      answers,
      flags,
      durations,
      idx,
      timeLeft,
      custom: customMode === true,
      savedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // P0: aviso nativo do navegador ao fechar/recarregar com simulado em andamento
  useEffect(() => {
    if (mode !== "exam" || phase !== "running") return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [mode, phase]);

  useEffect(() => {
    if (initialFilter) {
      dispatch({ type: "APPLY_INITIAL_FILTER", domain: initialFilter.domain });
      onFilterConsumed();
    }
  }, [initialFilter, onFilterConsumed]);

  const timerRef = useRef(null);
  useEffect(() => () => clearInterval(timerRef.current), []);

  // r3: atalhos de teclado do simulado — 1..5 responde, ←/→ navega, F marca
  // para revisão, G abre a grade. Só no modo simulado em andamento (no estudo
  // o feedback é imediato e os atalhos confundiriam). Ignora quando o foco
  // está na navegação de abas (as setas trocam de aba ali) e quando há
  // modificadores (não roubar atalhos do navegador, ex. Ctrl+F de busca).
  useEffect(() => {
    if (mode !== "exam" || phase !== "running") return;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      if (target && target.closest && target.closest('[role="tablist"]')) return;
      const optCount = (opts[idx] || []).length;
      if (/^[1-5]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (n < optCount) {
          e.preventDefault();
          dispatch({ type: "SELECT_EXAM", optIndex: n });
        }
        return;
      }
      if (e.key === "ArrowRight" && idx < questions.length - 1) {
        e.preventDefault();
        dispatch({ type: "SET_IDX", idx: idx + 1 });
        return;
      }
      if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault();
        dispatch({ type: "SET_IDX", idx: idx - 1 });
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_FLAG" });
        return;
      }
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_GRID" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, phase, idx, questions.length, opts]);

  function start() {
    let qs;
    // P1: "all" agora serve TODO o pool disponível (antes: cap oculto de 99)
    const limit = count === "all" ? Infinity : count;
    if (mode === "exam") {
      // r4: simulado personalizado usa o pool escolhido; sem customização,
      // segue o blueprint oficial (capítulo × K-level). r13: ambos sorteiam
      // SÓ do pool exclusivo — questão de estudo nunca entra em simulado.
      qs = customMode
        ? buildCustomExamInLang(lang, {
            chapters: effCustomChapters,
            kLevels: customKLevels,
            count: effCustomCount,
          })
        : buildExamInLang(lang);
    } else if (mode === "saved") {
      // r13: modo estudo — salvos marcados ⚑ durante simulados ficam de fora
      // daqui (revisam-se no resultado da prova e no "repetir erros").
      const pool = byIds(savedStudyIds);
      qs = shuffle(pool).slice(0, Math.min(limit, pool.length));
    } else if (mode === "srs") {
      // r13: dueIds já nasce filtrado pelo pool de estudo (cartões SRS novos
      // só são criados em sessões de estudo; cartões legados de questões que
      // migraram para o pool exclusivo não vencem mais aqui)
      const pool = byIds(dueIds);
      qs = shuffle(pool).slice(0, Math.min(limit, pool.length));
    } else if (mode === "practice" && domain === "weak") {
      // r5: sessão de pontos fracos — a ordem de buildWeakFocusInLang É a
      // prioridade (erradas → nunca vistas → resto, intercalando capítulos
      // fracos), então o corte no `count` acontece SEM re-embaralhar.
      const pool = buildWeakFocusInLang(lang, progress?.byDomain || {}, {
        seen: progress?.seen || {},
        wrongIds,
      });
      qs = pool.slice(0, Math.min(limit, pool.length));
    } else if (domain === "last-exam-wrong" && lastExamWrong) {
      // r10: repetição dos erros do último simulado — pool fixo (os ids salvos
      // no histórico), ordem embaralhada a cada sessão.
      const pool = byIds(lastExamWrong);
      qs = shuffle(pool).slice(0, Math.min(limit, pool.length));
    } else {
      // r13: "erradas" é modo estudo — só erradas do pool de estudo (as de
      // simulado vão para o "repetir erros do último simulado").
      const pool = domain === "wrong" ? byIds(wrongStudyIds) : byChapterInLang(domain, lang);
      qs = shuffle(pool).slice(0, Math.min(limit, pool.length));
    }
    // ponytail: shuffleOptions() only returns {text, correct}; we tag each
    // option with its original index so a later lang switch can re-localize
    // option text without re-shuffling (keeps the user's picked index valid).
    const newOpts = qs.map((q) => {
      const origOrder = q.options.map((text, i) => ({ text, i }));
      const shuffled = shuffleOptions({
        ...q,
        options: origOrder.map((o) => o.text),
      });
      // shuffleOptions shuffles a copy of q.options in place-equivalent order;
      // recompute origIndex by matching text (options are unique strings in this bank).
      return shuffled.map((opt) => ({
        ...opt,
        origIndex: q.options.indexOf(opt.text),
      }));
    });
    const newTimeLeft =
      mode === "exam" ? (customMode ? effCustomMinutes : officialMinutes) * 60 : 0;
    dispatch({
      type: "START_QUIZ",
      questions: qs,
      opts: newOpts,
      timeLeft: newTimeLeft,
    });
    if (mode === "exam") {
      timerRef.current = setInterval(() => {
        dispatch({ type: "TICK_TIMER" });
      }, 1000);
    }
  }

  function finish() {
    // ponytail: idempotency guard — auto-finish (timer=0) and manual
    // "Finalizar" click can both fire; phase check blocks the double-run.
    if (phase !== "running") return;
    clearInterval(timerRef.current);
    if (mode === "exam") {
      clearExamDraft(certId);
      setExamDraft(null);
      questions.forEach((q, i) => {
        const a = answers[i];
        const correct = a !== null && opts[i][a].correct;
        onAnswer(String(q.chapter), !!correct, q.id);
      });
      // r13: veredito único (count/points) — mesmo cálculo da tela de
      // resultado; o histórico persiste pct/veredito/modelo de pontuação.
      const verdict = examVerdict(questions, opts, answers, examScoring, {
        custom: customMode,
      });
      // r10: ids das erradas/em branco viajam no histórico — alimentam o
      // "🔁 Repetir erros" do setup e o botão "Treinar erradas" do resultado.
      const wrongIdsToLog = questions
        .filter((_q, i) => !(answers[i] !== null && opts[i][answers[i]].correct))
        .map((q) => q.id);
      setProgress((p) =>
        logExamResult(p, verdict.pct, verdict.passed, bank, {
          ...(customMode ? { custom: true, n: verdict.total } : { n: verdict.total }),
          ...(verdict.scoring === "points"
            ? {
                scoring: verdict.scoring,
                points: verdict.points,
                pointsTotal: verdict.pointsTotal,
              }
            : {}),
          wrongIds: wrongIdsToLog,
        })
      );
    }
    dispatch({ type: "FINISH" });
  }

  // Substitui o finish() embutido no updater funcional de setTimeLeft do
  // código pré-reducer. Mesmo gatilho observável (exam acaba quando o
  // tempo zera), caminho mais limpo: TICK_TIMER só decrementa estado,
  // este efeito separado decide quando chamar finish(). r5/lint: o finish
  // é agendado via setTimeout(0) — setState síncrono no corpo do effect é
  // cascata de render (set-state-in-effect); no callback do timer somos
  // contexto de evento, onde setState é permitido. O cleanup cancela se
  // o efeito re-rodar antes (finish é idempotente de qualquer forma).
  useEffect(() => {
    if (mode === "exam" && phase === "running" && timeLeft === 0) {
      const id = setTimeout(() => finish(), 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, mode]);

  function answerPractice(optIndex) {
    if (answers[idx] !== null) return;
    const question = questions[idx];
    const correct = opts[idx][optIndex].correct;
    dispatch({ type: "ANSWER_PRACTICE", optIndex });
    onAnswer(String(question.chapter), correct, question.id);

    if (mode !== "srs") {
      const existing = getSRSCard(progress, question.id);
      if (!existing) {
        const card = initSM2();
        const updated = sm2(card, correct ? QUALITY.good : QUALITY.again);
        setProgress((p) => updateSRSCard(p, question.id, updated));
      }
    }
  }

  // r15 (R18): modo revisão do Quiz passou a usar o caminho único rateSRS
  // (storage) — alimenta os contadores srsStats (retenção, conquistas,
  // painel do Stats). O auto-seed do modo prática (acima) NÃO conta: é
  // implícito (primeira vista da questão), não uma avaliação de revisão.
  // Renomeada de rateSRS p/ rateSrsMode p/ não colidir com o import.
  function rateSrsMode(label) {
    const question = questions[idx];
    setProgress((p) => rateSRS(p, question.id, label));
  }

  function selectExam(optIndex) {
    dispatch({ type: "SELECT_EXAM", optIndex });
  }

  // P0: retoma o simulado do rascunho — reconstrói perguntas NA ORDEM salva
  // (byIds preserva a ordem de ALL, então remapeamos por id) e recria o
  // embaralhamento exato das opções a partir de optOrder.
  function resumeExam() {
    const draft = loadExamDraft(certId);
    if (!draft) {
      setExamDraft(null);
      return;
    }
    const byId = new Map(byIds(draft.questionIds).map((q) => [q.id, q]));
    const qs = draft.questionIds.map((id) => byId.get(id)).filter(Boolean);
    if (qs.length === 0) {
      clearExamDraft(certId);
      setExamDraft(null);
      return;
    }
    const newOpts = qs.map((q, i) => {
      const order = draft.optOrder?.[i] || q.options.map((_, j) => j);
      return order
        .filter((oi) => oi >= 0 && oi < q.options.length)
        .map((origIdx) => ({
          text: q.options[origIdx],
          correct: origIdx === q.answer,
          origIndex: origIdx,
        }));
    });
    dispatch({
      type: "RESUME_EXAM",
      questions: qs,
      opts: newOpts,
      answers: draft.answers,
      flags: draft.flags,
      durations: draft.durations,
      idx: Math.min(draft.idx, qs.length - 1),
      timeLeft: draft.timeLeft,
      customExam: draft.custom === true,
    });
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);
  }

  function discardDraft() {
    clearExamDraft(certId);
    setExamDraft(null);
    setDraftTick((x) => x + 1); // força re-leitura derivada do localStorage
  }

  const score = useMemo(() => {
    return questions.reduce((acc, _q, i) => {
      const a = answers[i];
      return acc + (a !== null && opts[i] && opts[i][a].correct ? 1 : 0);
    }, 0);
  }, [questions, answers, opts]);

  function reset() {
    clearInterval(timerRef.current);
    dispatch({ type: "RESET" });
  }

  // r10: sessão de estudo com as erradas da prova que acabou de terminar —
  // um clique do resultado pro treino (sem passar pelo setup). Embaralha as
  // opções de novo (a sessão é nova); respostas zeradas como todo START.
  function trainWrongFromResult() {
    const wrongQs = questions.filter(
      (_q, i) => !(answers[i] !== null && opts[i][answers[i]].correct)
    );
    if (wrongQs.length === 0) return;
    const newOpts = wrongQs.map((q) => {
      const shuffled = shuffleOptions({ ...q, options: q.options });
      return shuffled.map((opt) => ({
        ...opt,
        origIndex: q.options.indexOf(opt.text),
      }));
    });
    clearInterval(timerRef.current);
    dispatch({ type: "SET_MODE", mode: "practice" });
    dispatch({
      type: "START_QUIZ",
      questions: wrongQs,
      opts: newOpts,
      timeLeft: 0,
    });
  }

  // ponytail: questions/opts get localized once at start() time, so toggling
  // `lang` mid-quiz left stems/options/explanations stale. Re-localize the
  // display text from the raw monolith record on every render (cheap: one
  // question) instead of re-fetching/re-shuffling the whole quiz — this
  // preserves answers/progress/opt order exactly, only the text changes.
  // Tradeoff: relies on monolith.questions ids matching state.questions ids
  // (true here) and on option text being unique per question (true in this
  // bank) so origIndex round-trips through shuffle correctly.
  const displayQuestions = useMemo(
    () => relocalize(questions, lang),
    [questions, lang, relocalize]
  );

  const displayOpts = useMemo(() => {
    return opts.map((rowOpts, i) => {
      const dq = displayQuestions[i];
      if (!dq) return rowOpts;
      return rowOpts.map((opt) => ({
        ...opt,
        text: dq.options[opt.origIndex] ?? opt.text,
      }));
    });
  }, [opts, displayQuestions]);

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="quiz">
        {examDraft && (
          <div className="card exam-draft-banner" role="status">
            <div className="exam-draft-info">
              <strong>⏳ {t(lang, "quiz.draftBanner")}</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                {t(lang, "quiz.draftInfo", {
                  answered: examDraft.answers.filter((a) => a !== null && a !== undefined).length,
                  total: examDraft.questionIds.length,
                  time: fmtTime(examDraft.timeLeft),
                })}
              </p>
            </div>
            <div className="actions" style={{ marginTop: 0 }}>
              <button className="btn ghost" onClick={discardDraft}>
                {t(lang, "quiz.draftDiscard")}
              </button>
              <button className="btn primary" onClick={resumeExam}>
                {t(lang, "quiz.draftResume")}
              </button>
            </div>
          </div>
        )}
        <div className="mode-toggle">
          <button
            className={"mode-btn" + (mode === "practice" ? " active" : "")}
            onClick={() => dispatch({ type: "SET_MODE", mode: "practice" })}
          >
            <span className="mode-title">{t(lang, "quiz.modeStudy")}</span>
            <span className="mode-desc">{t(lang, "quiz.modeStudyDesc")}</span>
          </button>
          <button
            className={"mode-btn" + (mode === "exam" ? " active" : "")}
            onClick={() => dispatch({ type: "SET_MODE", mode: "exam" })}
          >
            <span className="mode-title">{t(lang, "quiz.modeExam")}</span>
            <span className="mode-desc">
              {t(lang, "quiz.modeExamDesc", {
                n: META.examFormat[certId].questions,
                min: officialMinutes,
              })}
            </span>
          </button>
          {savedStudyIds.length > 0 && (
            <button
              className={"mode-btn" + (mode === "saved" ? " active" : "")}
              onClick={() => dispatch({ type: "SET_MODE", mode: "saved" })}
            >
              <span className="mode-title">{t(lang, "quiz.modeSaved")}</span>
              <span className="mode-desc">
                {t(lang, "quiz.modeSavedDesc", { n: savedStudyIds.length })}
              </span>
            </button>
          )}
          {dueIds.length > 0 && (
            <button
              className={"mode-btn" + (mode === "srs" ? " active" : "")}
              onClick={() => dispatch({ type: "SET_MODE", mode: "srs" })}
            >
              <span className="mode-title">{t(lang, "quiz.modeSRS")}</span>
              <span className="mode-desc">
                {dueIds.length} {t(lang, "quiz.srsDueDesc")}
              </span>
            </button>
          )}
        </div>

        {mode === "practice" ? (
          <div className="card">
            <h3>{t(lang, "quiz.chooseDomain")}</h3>
            <div className="domain-grid">
              <button
                className={"domain-card wide" + (domain === "all" ? " selected" : "")}
                onClick={() => dispatch({ type: "SET_DOMAIN", domain: "all" })}
              >
                <span className="domain-weight">{t(lang, "quiz.allDomains")}</span>
                <span className="domain-sub">{t(lang, "domainAllDesc")}</span>
              </button>
              {wrongStudyIds.length > 0 && (
                <button
                  className={"domain-card wide" + (domain === "wrong" ? " selected" : "")}
                  onClick={() => dispatch({ type: "SET_DOMAIN", domain: "wrong" })}
                >
                  <span className="domain-weight">{t(lang, "quiz.wrongBefore")}</span>
                  <span className="domain-sub">
                    {t(lang, "quiz.wrongBeforeDesc", {
                      n: wrongStudyIds.length,
                    })}
                  </span>
                </button>
              )}
              {/* r10: repetição dos erros do último simulado — o ciclo de
                  estudo clássico: erra → revisa → treina de novo. */}
              {lastExamWrong && (
                <button
                  className={
                    "domain-card wide lastwrong" + (domain === "last-exam-wrong" ? " selected" : "")
                  }
                  onClick={() => dispatch({ type: "SET_DOMAIN", domain: "last-exam-wrong" })}
                >
                  <span className="domain-weight">🔁 {t(lang, "quiz.lastExamWrong")}</span>
                  <span className="domain-sub">
                    {t(lang, "quiz.lastExamWrongDesc", {
                      n: lastExamWrong.length,
                    })}
                  </span>
                </button>
              )}
              {/* r5: sessão inteligente focada nos capítulos de menor acerto */}
              {weakStats && (
                <button
                  className={"domain-card wide focus" + (domain === "weak" ? " selected" : "")}
                  onClick={() => dispatch({ type: "SET_DOMAIN", domain: "weak" })}
                >
                  <span className="domain-weight">{t(lang, "quiz.weakFocus")}</span>
                  <span className="domain-sub">
                    {t(lang, "quiz.weakFocusDesc", {
                      chapter: chapterName(weakStats[0].ch, lang),
                      pct: weakStats[0].pct,
                    })}
                  </span>
                </button>
              )}
              {chapters.map((c) => {
                // ponytail: real pool size (questions available / total in bank),
                // not the exam-blueprint weight — that's a different metric.
                // r13: contagens do POOL DE ESTUDO — o quiz treina só estudo;
                // as exclusivas de simulado não aparecem nos cards.
                const chapterCount = STUDY.filter(
                  (q) => String(q.chapter) === String(c.chapter)
                ).length;
                return (
                  <button
                    key={c.chapter}
                    className={"domain-card" + (domain === String(c.chapter) ? " selected" : "")}
                    onClick={() =>
                      dispatch({
                        type: "SET_DOMAIN",
                        domain: String(c.chapter),
                      })
                    }
                  >
                    <span className="domain-weight">
                      {chapterCount} / {STUDY.length}
                    </span>
                    <span className="domain-name">{chapterName(c.chapter, lang)}</span>
                  </button>
                );
              })}
            </div>
            <div className="count-row">
              <span className="muted">{t(lang, "quiz.quantity")}</span>
              {[10, 20, "all"].map((n) => (
                <button
                  key={String(n)}
                  className={"chip" + (count === n ? " on" : "")}
                  onClick={() => dispatch({ type: "SET_COUNT", count: n })}
                >
                  {n === "all" ? t(lang, "quiz.all") : n}
                </button>
              ))}
            </div>
          </div>
        ) : mode === "saved" ? (
          <div className="card">
            <p className="muted">
              {t(lang, "quiz.savedReviewHint", {
                n: getSavedIds(progress).length,
              })}
            </p>
            <div className="count-row">
              <span className="muted">{t(lang, "quiz.quantity")}</span>
              {[10, 20, "all"].map((n) => (
                <button
                  key={String(n)}
                  className={"chip" + (count === n ? " on" : "")}
                  onClick={() => dispatch({ type: "SET_COUNT", count: n })}
                >
                  {n === "all" ? t(lang, "quiz.all") : n}
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
              {[10, 20, "all"].map((n) => (
                <button
                  key={String(n)}
                  className={"chip" + (count === n ? " on" : "")}
                  onClick={() => dispatch({ type: "SET_COUNT", count: n })}
                >
                  {n === "all" ? t(lang, "quiz.all") : n}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="muted">
              {t(lang, "quiz.examExplain", {
                n: officialCount,
                min: officialMinutes,
              })}
            </p>
            {/* r4: simulado personalizado — capítulos, níveis K, contagem e
                duração. A nota de corte escala proporcionalmente ao tamanho. */}
            <label className="custom-exam-toggle">
              <input
                type="checkbox"
                checked={customMode}
                onChange={() => dispatch({ type: "TOGGLE_CUSTOM" })}
              />
              <span className="custom-exam-toggle-text">
                <strong>{t(lang, "quiz.customExam")}</strong>
                <span className="muted">{t(lang, "quiz.customDesc")}</span>
              </span>
            </label>
            {customMode && (
              <div className="custom-exam-panel">
                <div className="custom-field">
                  <span className="custom-field-label">{t(lang, "quiz.customChapters")}</span>
                  <div
                    className="chip-row"
                    role="group"
                    aria-label={t(lang, "quiz.customChapters")}
                  >
                    <button
                      className={"chip" + (customChapters === null ? " on" : "")}
                      onClick={() => dispatch({ type: "SET_CUSTOM_CHAPTERS_ALL" })}
                    >
                      {t(lang, "quiz.customAllChapters")}
                    </button>
                    {chapters.map((c) => {
                      const chId = String(c.chapter);
                      const on = customChapters === null || customChapters.includes(chId);
                      // r13: contagem do POOL EXCLUSIVO — é dele que o simulado
                      // personalizado sorteia (o material de estudo não entra)
                      const chCount = EXAM.filter((q) => String(q.chapter) === chId).length;
                      return (
                        <button
                          key={chId}
                          className={"chip" + (on ? " on" : "")}
                          aria-pressed={on}
                          onClick={() =>
                            dispatch({
                              type: "TOGGLE_CUSTOM_CHAPTER",
                              chapter: chId,
                              allChapters: allChapterIds,
                            })
                          }
                        >
                          {chapterName(c.chapter, lang)}{" "}
                          <span className="chip-count">{chCount}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="custom-field">
                  <span className="custom-field-label">{t(lang, "quiz.customKLevels")}</span>
                  <div className="chip-row" role="group" aria-label={t(lang, "quiz.customKLevels")}>
                    <button
                      className={"chip" + (customKLevels.length === 0 ? " on" : "")}
                      onClick={() => dispatch({ type: "SET_CUSTOM_KALL" })}
                    >
                      {t(lang, "quiz.customAnyK")}
                    </button>
                    {[1, 2, 3, 4].map((k) => {
                      const on = customKLevels.includes(k);
                      return (
                        <button
                          key={k}
                          className={"chip" + (on ? " on" : "")}
                          aria-pressed={on}
                          onClick={() => dispatch({ type: "SET_CUSTOM_KLEVEL", k })}
                        >
                          K{k}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="custom-row2">
                  <div className="custom-field">
                    <span className="custom-field-label">{t(lang, "quiz.customCount")}</span>
                    <div className="chip-row">
                      {[...new Set([10, 20, officialCount])].map((n) => (
                        <button
                          key={n}
                          className={"chip" + (effCustomCount === n ? " on" : "")}
                          onClick={() => dispatch({ type: "SET_CUSTOM_COUNT", count: n })}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="custom-field">
                    <span className="custom-field-label">{t(lang, "quiz.customMinutes")}</span>
                    <div className="chip-row">
                      {[...new Set([30, 45, 60, officialMinutes])]
                        .sort((a, b) => a - b)
                        .map((m) => (
                          <button
                            key={m}
                            className={"chip" + (effCustomMinutes === m ? " on" : "")}
                            onClick={() =>
                              dispatch({
                                type: "SET_CUSTOM_MINUTES",
                                minutes: m,
                              })
                            }
                          >
                            {m}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
                {customPoolCount === 0 ? (
                  <p className="custom-pool warn" role="alert">
                    {t(lang, "quiz.customEmpty")}
                  </p>
                ) : (
                  <p className="custom-pool muted">
                    {t(lang, "quiz.customPool", {
                      n: Math.min(effCustomCount, customPoolCount),
                    })}
                    <span className="custom-pool-sep"> · </span>
                    {/* r13: no modelo de pontos (CTAL-TA v4.0) o corte depende do
                        mix K sorteado — mostramos o percentual oficial; o corte
                        exato aparece no resultado, calculado sobre a prova real */}
                    {examScoring.scoring === "points"
                      ? t(lang, "quiz.customPassNotePts", {
                          pct: examScoring.passMarkPct,
                        })
                      : t(lang, "quiz.customPassNote", {
                          n: Math.max(
                            1,
                            Math.ceil(
                              (officialPassMark / officialCount) *
                                Math.min(effCustomCount, customPoolCount)
                            )
                          ),
                          total: Math.min(effCustomCount, customPoolCount),
                        })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className="btn primary"
          onClick={start}
          disabled={mode === "exam" && customMode && customPoolCount === 0}
        >
          {t(lang, "quiz.start")}
        </button>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (phase === "result") {
    const total = questions.length;
    // r13: veredito de simulado via examVerdict (count/points) — o mesmo
    // cálculo persistido pelo finish(). Estudo continua nota simples (0-100,
    // corte 65% escalado ao tamanho da sessão).
    const verdict =
      mode === "exam"
        ? examVerdict(questions, opts, answers, examScoring, {
            custom: customMode,
          })
        : null;
    const pct = verdict ? verdict.pct : Math.round((score / total) * 100);
    // CTAL-TA v4.0 é pontuação ponderada (K2=1, K3=2, K4=3; corte 51/78);
    // CTFL e modo estudo continuam em contagem simples (26/40 · 65%).
    const displayScore = verdict && verdict.scoring === "points" ? verdict.points : score;
    const displayTotal = verdict && verdict.scoring === "points" ? verdict.pointsTotal : total;
    const passMarkEff = verdict ? verdict.passMarkEff : Math.max(1, Math.ceil(0.65 * total));
    const passed = verdict ? verdict.passed : pct >= 65;
    // r9: tempo por questão — a soma dos durations é o tempo TOTAL usado
    // (cada tick credita exatamente 1s à questão corrente); a média usa as
    // questões respondidas como denominador (em branco não medem leitura).
    const totalTime = durations.reduce((acc, d) => acc + (d || 0), 0);
    const answeredCount = answers.filter((a) => a !== null && a !== undefined).length;
    const avgSeconds = answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;
    // r9: delta vs simulado anterior do mesmo cert (examHistory é namespaced
    // por cert e o finish() já registrou a prova corrente — o penúltimo é o
    // anterior). Só no modo simulado: estudo não registra histórico.
    const hist = progress.examHistory || [];
    const prevExam = mode === "exam" && hist.length >= 2 ? hist[hist.length - 2] : null;
    const deltaPct = prevExam ? pct - (prevExam.pct || 0) : null;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrong = displayQuestions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => !(answers[i] !== null && opts[i][answers[i]].correct));

    // Fase 2: identificar capítulo com menor acurácia para recomendação
    const chapterStats = {};
    questions.forEach((q, i) => {
      const ch = String(q.chapter);
      chapterStats[ch] = chapterStats[ch] || { total: 0, correct: 0 };
      chapterStats[ch].total++;
      if (answers[i] !== null && opts[i][answers[i]].correct) chapterStats[ch].correct++;
    });
    let weakestChapter = null;
    let weakestPct = 100;
    Object.entries(chapterStats).forEach(([ch, s]) => {
      const chPct = s.total > 0 ? (s.correct / s.total) * 100 : 0;
      if (chPct < weakestPct && s.total >= 2) {
        weakestPct = chPct;
        weakestChapter = ch;
      }
    });
    const showRecommendation = weakestChapter !== null && weakestPct < 70;

    return (
      <div className="quiz">
        <div
          id="quiz-result-top"
          className={"card result" + (mode === "exam" ? " exam-result" : "")}
        >
          {mode === "exam" && passed && !reduceMotion && <Confetti />}
          {mode === "exam" && <ScoreRing pct={pct} passed={passed} />}
          <div className="result-score">
            {displayScore}/{displayTotal}
            {verdict?.scoring === "points" ? " pts" : ""} · {pct}%
          </div>
          <div className={"verdict " + (passed ? "ok" : "no")}>
            {passed ? t(lang, "quiz.passed") : t(lang, "quiz.failed")}
          </div>
          {customMode && mode === "exam" && (
            <div className="custom-tag-result">
              🧩 {t(lang, "quiz.customTag")} ·{" "}
              {t(lang, "quiz.customPassNote", { n: passMarkEff, total })}
            </div>
          )}
          {/* r9: comparação com o simulado anterior — reforço positivo quando
              melhora, diagnóstico quando piora; primeira prova não mostra */}
          {mode === "exam" && deltaPct !== null && (
            <div
              className={"delta-chip " + (deltaPct > 0 ? "up" : deltaPct < 0 ? "down" : "flat")}
              aria-label={t(lang, "quiz.deltaAria", {
                n: deltaPct > 0 ? "+" + deltaPct : String(deltaPct),
              })}
            >
              {deltaPct > 0 ? `📈 +${deltaPct}%` : deltaPct < 0 ? `📉 ${deltaPct}%` : `➖ 0%`}{" "}
              {t(lang, "quiz.deltaVs")}
            </div>
          )}
          {/* r9: ritmo da prova — total usado e média por questão respondida.
              Escondido quando durations vazio (rascunho legado sem timings). */}
          {mode === "exam" && totalTime > 0 && (
            <div className="time-summary">
              ⏱ {fmtTime(totalTime)} · ~{avgSeconds}s {t(lang, "quiz.avgPerQuestion")}
            </div>
          )}
          <p className="muted">
            {pct >= 85
              ? t(lang, "quiz.excellentMsg")
              : passed
                ? t(lang, "quiz.passedMsg")
                : t(lang, "quiz.failedMsg", {
                    passMark: passMarkEff,
                    total: displayTotal,
                  })}
          </p>
          {showRecommendation && (
            <p style={{ marginTop: "0.5rem", fontWeight: 500 }}>
              {t(lang, "quiz.weakestChapter", {
                chapter: chapterName(weakestChapter, lang),
                pct: Math.round(weakestPct),
              })}
            </p>
          )}
          <div className="actions center">
            <button className="btn ghost" onClick={reset}>
              {t(lang, "quiz.backHome")}
            </button>
            <button className="btn" onClick={() => dispatch({ type: "TOGGLE_REVIEW" })}>
              {showReview ? t(lang, "quiz.hideReview") : t(lang, "quiz.showReview")}
            </button>
            {/* r4: revisão imprimível — esconde a chrome do app via @media print */}
            {showReview && (
              <button className="btn ghost no-print" onClick={() => window.print()}>
                {t(lang, "quiz.printReview")}
              </button>
            )}
            {/* r5: compartilhar/copiar o resultado (clipboard + fallback) */}
            {/* r7: botão 📤 usa o sheet nativo do sistema quando existe;
                o 📋 de clipboard continua como fallback universal */}
            {canShare && (
              <button
                className="btn ghost no-print"
                onClick={() =>
                  shareResult(
                    t(lang, "quiz.copyResultText", {
                      cert: cert.label,
                      score: displayScore,
                      total: displayTotal,
                      pct,
                      verdict: passed ? t(lang, "quiz.passed") : t(lang, "quiz.failed"),
                      passMark: passMarkEff,
                    })
                  )
                }
              >
                {shared ? `✓ ${t(lang, "quiz.shared")}` : `📤 ${t(lang, "quiz.shareResult")}`}
              </button>
            )}
            <button
              className="btn ghost no-print"
              onClick={() =>
                copyText(
                  t(lang, "quiz.copyResultText", {
                    cert: cert.label,
                    score: displayScore,
                    total: displayTotal,
                    pct,
                    verdict: passed ? t(lang, "quiz.passed") : t(lang, "quiz.failed"),
                    passMark: passMarkEff,
                  })
                )
              }
            >
              {copied ? `✓ ${t(lang, "quiz.copied")}` : `📋 ${t(lang, "quiz.copyResult")}`}
            </button>
            {showRecommendation && (
              <button
                className="btn"
                onClick={() => {
                  onFilterConsumed && onFilterConsumed();
                  if (typeof onStudyChapter === "function") onStudyChapter(weakestChapter);
                  reset();
                }}
              >
                {t(lang, "quiz.studyChapter", {
                  chapter: chapterName(weakestChapter, lang),
                })}
              </button>
            )}
            {/* r10: treinar as erradas desta prova direto do resultado —
                mesma sessão de estudo (feedback imediato por questão). */}
            {mode === "exam" && wrong.length > 0 && (
              <button className="btn" onClick={trainWrongFromResult}>
                {t(lang, "quiz.trainWrong", { n: wrong.length })}
              </button>
            )}
            <button className="btn primary" onClick={reset}>
              {t(lang, "quiz.retakeQuiz")}
            </button>
          </div>
        </div>

        {showReview &&
          mode === "exam" &&
          (() => {
            // r3: revisão da prova com filtros — erradas (default), em branco,
            // certas, marcadas ⚑ ou todas. A revisão clássica do modo estudo
            // (abaixo) segue idêntica.
            const isCorrect = (i) => answers[i] !== null && opts[i][answers[i]].correct;
            const isBlank = (i) => answers[i] === null || answers[i] === undefined;
            const FILTERS = [
              {
                id: "wrong",
                label: t(lang, "quiz.reviewFilterWrong"),
                test: (i) => !isBlank(i) && !isCorrect(i),
              },
              {
                id: "blank",
                label: t(lang, "quiz.reviewFilterBlank"),
                test: isBlank,
              },
              {
                id: "flagged",
                label: t(lang, "quiz.reviewFilterFlagged"),
                test: (i) => flags[i] === true,
              },
              {
                id: "correct",
                label: t(lang, "quiz.reviewFilterCorrect"),
                test: isCorrect,
              },
              {
                id: "all",
                label: t(lang, "quiz.reviewFilterAll"),
                test: () => true,
              },
            ].map((f) => ({
              ...f,
              count: questions.reduce((acc, _q, i) => acc + (f.test(i) ? 1 : 0), 0),
            }));
            const active = FILTERS.find((f) => f.id === reviewFilter) || FILTERS[0];
            const items = displayQuestions
              .map((q, i) => ({ q, i }))
              .filter(({ i }) => active.test(i));
            return (
              <div className="card">
                <div className="review-heading">
                  <h3>{t(lang, "quiz.reviewTitleAll")}</h3>
                  <a href="#quiz-result-top">{t(lang, "quiz.reviewBackToResult")}</a>
                </div>
                <div
                  className="review-filters"
                  role="group"
                  aria-label={t(lang, "quiz.reviewFilterAria")}
                >
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      className={"chip" + (reviewFilter === f.id ? " on" : "")}
                      aria-pressed={reviewFilter === f.id}
                      onClick={() => dispatch({ type: "SET_REVIEW_FILTER", filter: f.id })}
                      disabled={f.count === 0 && f.id !== reviewFilter}
                    >
                      {f.label} <span className="chip-count">{f.count}</span>
                    </button>
                  ))}
                </div>
                {items.length === 0 ? (
                  <p className="muted">{t(lang, "quiz.noQuestionsInFilter")}</p>
                ) : (
                  items.map(({ q, i }) => {
                    const correctOpt = displayOpts[i].find((opt) => opt.correct);
                    const chosen =
                      answers[i] === null || answers[i] === undefined
                        ? null
                        : displayOpts[i][answers[i]];
                    const ok = isCorrect(i);
                    return (
                      <div className={"review-item" + (flags[i] ? " flagged" : "")} key={q.id}>
                        <div className="review-item-head">
                          <span className="review-num">#{i + 1}</span>
                          <span className="q-domain">{chapterName(q.chapter, lang)}</span>
                          <span className={"klvl k" + q.kLevel}>K{q.kLevel}</span>
                          {/* r9: tempo gasto na questão (só simulado, só se > 0) */}
                          {mode === "exam" && (durations[i] || 0) > 0 && (
                            <span className="review-time" title={t(lang, "quiz.timeOnQuestion")}>
                              ⏱ {durations[i]}s
                            </span>
                          )}
                          {flags[i] && (
                            <span
                              className="review-flag"
                              aria-label={t(lang, "quiz.statusFlagged")}
                            >
                              ⚑
                            </span>
                          )}
                          <span className={"review-status " + (ok ? "ok" : "no")}>
                            {ok ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="review-q">{q.q}</div>
                        <div className={"review-a " + (ok ? "ok" : "no")}>
                          {ok
                            ? "✓ " + t(lang, "quiz.yourAnswer")
                            : "✗ " + t(lang, "quiz.yourAnswer")}{" "}
                          {chosen ? chosen.text : t(lang, "quiz.notAnswered")}
                        </div>
                        {!ok && (
                          <div className="review-a ok">
                            ✓ {t(lang, "quiz.correctAnswer")} {correctOpt?.text}
                          </div>
                        )}
                        <div className="review-exp">{q.exp}</div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}

        {showReview && mode !== "exam" && (
          <div className="card">
            <div className="review-heading">
              <h3>{t(lang, "quiz.reviewErrors")}</h3>
              <a href="#quiz-result-top">{t(lang, "quiz.reviewBackToResult")}</a>
            </div>
            {wrong.length === 0 ? (
              <p className="ok">{t(lang, "quiz.noErrors")}</p>
            ) : (
              wrong.map(({ q, i }) => {
                const correct = displayOpts[i].find((o) => o.correct);
                const chosen = answers[i] === null ? null : displayOpts[i][answers[i]];
                return (
                  <div className="review-item" key={q.id}>
                    <div className="review-q">
                      {i + 1}. {q.q}
                    </div>
                    <div className="review-a no">
                      ✗ {t(lang, "quiz.yourAnswer")}{" "}
                      {chosen ? chosen.text : t(lang, "quiz.notAnswered")}
                    </div>
                    <div className="review-a ok">
                      ✓ {t(lang, "quiz.correctAnswer")} {correct.text}
                    </div>
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
  const q = displayQuestions[idx];
  const o = displayOpts[idx];
  const answered =
    (mode === "practice" || mode === "saved" || mode === "srs") && answers[idx] !== null;
  const saved = isSaved(progress, q?.id);
  const isLast = idx === questions.length - 1;
  const pct = Math.round(((idx + 1) / questions.length) * 100);
  const timerClass = timeLeft <= 300 ? "danger" : timeLeft <= 600 ? "warn" : "";

  return (
    <div className="quiz">
      <button
        className="btn ghost back-btn"
        onClick={() => {
          clearInterval(timerRef.current);
          dispatch({ type: "BACK_TO_SETUP" });
        }}
      >
        {t(lang, "quiz.backShort")}
      </button>
      <div className="run-head">
        <span className="muted">
          {t(lang, "quiz.questionOf", { n: idx + 1, total: questions.length })}
        </span>
        {mode === "exam" && <span className={"timer " + timerClass}>{fmtTime(timeLeft)}</span>}
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: pct + "%" }} />
      </div>

      {mode === "exam" && (
        <>
          <div className="exam-toolbar">
            <div className="exam-toolbar-group">
              <button className="btn" onClick={() => dispatch({ type: "TOGGLE_GRID" })}>
                {showGrid ? t(lang, "quiz.hideGrid") : t(lang, "quiz.showGrid")}
              </button>
              <button
                className={"btn flag-btn" + (flags[idx] ? " on" : "")}
                onClick={() => dispatch({ type: "TOGGLE_FLAG" })}
                aria-pressed={flags[idx] === true}
                title={t(lang, "quiz.flagAria")}
              >
                <span aria-hidden="true">{flags[idx] ? "⚑" : "⚐"}</span>{" "}
                {flags[idx] ? t(lang, "quiz.flagOn") : t(lang, "quiz.flagOff")}
              </button>
            </div>
            <p className="kbd-hint" aria-hidden="true">
              <span className="sr-only">{t(lang, "quiz.kbdHintLabel")}</span>
              <kbd>1</kbd>–<kbd>{Math.min(5, (o || []).length)}</kbd> {t(lang, "quiz.kbdAnswer")}
              <span className="kbd-sep">·</span>
              <kbd>←</kbd>
              <kbd>→</kbd> {t(lang, "quiz.kbdNavigate")}
              <span className="kbd-sep">·</span>
              <kbd>F</kbd> {t(lang, "quiz.kbdFlag")}
              <span className="kbd-sep">·</span>
              <kbd>G</kbd> {t(lang, "quiz.kbdGrid")}
            </p>
          </div>
          {showGrid && (
            <div className="card">
              <div className="exam-grid-summary">
                {t(lang, "quiz.gridSummary", {
                  answered: answers.filter((a) => a !== null && a !== undefined).length,
                  total: questions.length,
                  blank: answers.filter((a) => a === null || a === undefined).length,
                })}
                {flags.some(Boolean) && (
                  <span className="flag-summary"> · {flags.filter(Boolean).length} ⚑</span>
                )}
              </div>
              <QuestionGrid
                answers={answers}
                flags={flags}
                currentIndex={idx}
                onJump={(i) => dispatch({ type: "SET_IDX", idx: i })}
                lang={lang}
              />
            </div>
          )}
        </>
      )}

      <div className="card">
        <div key={idx} className={"quiz-split" + (answered ? " has-explain" : "")}>
          <div className="quiz-question-col">
            <div className="q-meta">
              <span className="q-domain">{chapterName(q.chapter, lang)}</span>
              <span className={"klvl k" + q.kLevel}>K{q.kLevel}</span>
            </div>
            {lang === "en" && !hasEN(questions[idx]?.id) && (
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                {t(lang, "quiz.enComingSoon")}
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
              <div className="explanation" aria-live="polite">
                {q.exp}
              </div>

              {(() => {
                const matchedTerms = findGlossaryTermsInText(q.exp, lang);
                return (
                  matchedTerms.length > 0 && (
                    <div className="glossary-hint">
                      {t(lang, "quiz.terms")}
                      {matchedTerms.map((term) => (
                        <span key={term.id} className="glossary-tag">
                          {term.term}
                        </span>
                      ))}
                    </div>
                  )
                );
              })()}

              <button
                className={"btn " + (saved ? "btn-saved" : "primary")}
                onClick={() => setProgress((p) => toggleSaved(p, q.id))}
                style={{ marginTop: "0.5rem" }}
              >
                {saved ? t(lang, "quiz.saved") : t(lang, "quiz.saveQuestion")}
              </button>

              {mode === "srs" && (
                <div className="srs-quality">
                  <button className="btn srs-again" onClick={() => rateSrsMode("again")}>
                    {t(lang, "quiz.srsAgain")}
                  </button>
                  <button className="btn srs-hard" onClick={() => rateSrsMode("hard")}>
                    {t(lang, "quiz.srsHard")}
                  </button>
                  <button className="btn srs-good" onClick={() => rateSrsMode("good")}>
                    {t(lang, "quiz.srsGood")}
                  </button>
                  <button className="btn srs-easy" onClick={() => rateSrsMode("easy")}>
                    {t(lang, "quiz.srsEasy")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="actions">
          {mode === "exam" && idx > 0 && (
            <button className="btn" onClick={() => dispatch({ type: "SET_IDX", idx: idx - 1 })}>
              {t(lang, "quiz.prev")}
            </button>
          )}
          {!isLast && (mode === "exam" || answered) && (
            <button
              className="btn primary"
              onClick={() => dispatch({ type: "SET_IDX", idx: idx + 1 })}
            >
              {t(lang, "quiz.next")}
            </button>
          )}
          {isLast && (mode === "exam" || answered) && (
            <button className="btn primary" onClick={finish}>
              {mode === "exam" ? t(lang, "quiz.finishExam") : t(lang, "quiz.seeResult")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
