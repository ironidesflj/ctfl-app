"use client";

/* ===========================================================
   Synapse · views/Simulado.tsx
   Aba Simulado — porta do modo de prova do app v3.18.0
   (Quiz.jsx · fases setup/running/result), adaptada à casca e aos
   tokens do handoff.

   Contratos preservados:
   · Pool exclusivo (r13): o simulado sorteia SÓ do pool de simulado
     (*-exam.json); questões de estudo nunca entram, e respostas de
     simulado não poluem cobertura/prontidão do pool de estudo.
   · Veredito oficial por prova (r13): contagem simples (CTFL) ou
     pontos ponderados por K (CTAL-TA/TM); personalizado escala o
     corte proporcionalmente (r4).
   · Rascunho (P0): cada resposta/navegação grava o rascunho — a
     prova sobrevive à troca de aba/rota; banner no setup retoma.
   · Flags ⚑ (r3), grade de navegação, atalhos 1–5/←→/F/G, aviso
     beforeunload, tempo por questão (r9), delta vs prova anterior.
   =========================================================== */

import { useEffect, useReducer, useRef, useState } from "react";
import { clearExamDraft, fmt, loadExamDraft, pad2, saveExamDraft, useSynapse } from "../store";
import type { Cert, ExamDraft, Question } from "../types";
import { ViewFoot } from "./Hoje";

const LETTERS = ["A", "B", "C", "D", "E"];
/** pontos por K-level nas provas pontuadas (ISTQB: K2=1 · K3=2 · K4=3) */
const POINTS_BY_K: Record<string, number> = { "1": 1, "2": 1, "3": 2, "4": 3 };

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

function shuffle<T>(list: T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ---------- veredito (porta do examVerdict · r13) ---------- */

export interface Verdict {
  scoring: "count" | "points";
  score: number;
  total: number;
  points: number;
  pointsTotal: number;
  pct: number;
  passMarkEff: number;
  passed: boolean;
}

export function examVerdict(
  questions: Question[],
  answers: (number | null)[],
  rules: NonNullable<Cert["exam"]>,
  custom = false
): Verdict {
  const scoring = rules.scoring === "points" ? "points" : "count";
  const ptsOf = (q: Question) => (scoring === "points" ? POINTS_BY_K[String(q.k)] || 1 : 1);
  let score = 0;
  let points = 0;
  let pointsTotal = 0;
  questions.forEach((q, i) => {
    pointsTotal += ptsOf(q);
    if (answers[i] !== null && answers[i] !== undefined && answers[i] === q.answer) {
      score += 1;
      points += ptsOf(q);
    }
  });
  const total = questions.length;
  const achieved = scoring === "points" ? points : score;
  const achievable = scoring === "points" ? pointsTotal : total;
  const pct = achievable > 0 ? Math.round((achieved / achievable) * 100) : 0;
  const denom = scoring === "points" ? rules.points || rules.pass : rules.q || rules.pass;
  const cutBase = rules.pass / (denom || rules.pass);
  const passMarkEff = custom ? Math.max(1, Math.ceil(cutBase * achievable)) : rules.pass;
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

/* ---------- estado ---------- */

interface ExamState {
  phase: "setup" | "running" | "result";
  mode: "exam" | "practice";
  qs: Question[];
  /** ordem embaralhada das opções por questão (índices originais) */
  optOrder: number[][];
  answers: (number | null)[];
  flags: boolean[];
  durations: number[];
  idx: number;
  showGrid: boolean;
  showReview: boolean;
  reviewFilter: "wrong" | "blank" | "flagged" | "correct" | "all";
  timeLeft: number;
  custom: boolean;
  customChapters: number[] | null;
  customK: number[];
  customCount: number | null;
  customMinutes: number | null;
  /** prática: questão conferida (feedback imediato) */
  checked: boolean;
  practiceCorrect: number;
}

const initialExam: ExamState = {
  phase: "setup",
  mode: "exam",
  qs: [],
  optOrder: [],
  answers: [],
  flags: [],
  durations: [],
  idx: 0,
  showGrid: false,
  showReview: false,
  reviewFilter: "wrong",
  timeLeft: 0,
  custom: false,
  customChapters: null,
  customK: [],
  customCount: null,
  customMinutes: null,
  checked: false,
  practiceCorrect: 0,
};

type ReviewFilter = ExamState["reviewFilter"];

type Action =
  | { type: "TOGGLE_CUSTOM" }
  | { type: "SET_CUSTOM_CHAPTERS_ALL" }
  | { type: "TOGGLE_CUSTOM_CHAPTER"; chapter: number }
  | { type: "SET_CUSTOM_KALL" }
  | { type: "TOGGLE_CUSTOM_K"; k: number }
  | { type: "SET_CUSTOM_COUNT"; count: number }
  | { type: "SET_CUSTOM_MINUTES"; minutes: number }
  | {
      type: "START";
      qs: Question[];
      optOrder: number[][];
      timeLeft: number;
      mode: "exam" | "practice";
      custom: boolean;
    }
  | { type: "RESUME"; draft: ExamDraft; qs: Question[] }
  | { type: "SELECT"; opt: number }
  | { type: "SET_IDX"; idx: number }
  | { type: "TOGGLE_FLAG" }
  | { type: "TOGGLE_GRID" }
  | { type: "TICK" }
  | { type: "CHECK_PRACTICE"; opt: number }
  | { type: "NEXT_PRACTICE" }
  | { type: "TOGGLE_REVIEW" }
  | { type: "SET_REVIEW_FILTER"; filter: ReviewFilter }
  | { type: "FINISH" }
  | { type: "RESET" };

function reducer(state: ExamState, action: Action): ExamState {
  switch (action.type) {
    case "TOGGLE_CUSTOM":
      return { ...state, custom: !state.custom };
    case "SET_CUSTOM_CHAPTERS_ALL":
      return { ...state, customChapters: null };
    case "TOGGLE_CUSTOM_CHAPTER": {
      const cur = state.customChapters;
      const next = cur === null ? [] : cur.slice();
      const at = next.indexOf(action.chapter);
      if (at === -1) next.push(action.chapter);
      else next.splice(at, 1);
      return { ...state, customChapters: next };
    }
    case "SET_CUSTOM_KALL":
      return { ...state, customK: [] };
    case "TOGGLE_CUSTOM_K": {
      const next = state.customK.slice();
      const at = next.indexOf(action.k);
      if (at === -1) next.push(action.k);
      else next.splice(at, 1);
      return { ...state, customK: next };
    }
    case "SET_CUSTOM_COUNT":
      return { ...state, customCount: action.count };
    case "SET_CUSTOM_MINUTES":
      return { ...state, customMinutes: action.minutes };
    case "START":
      return {
        ...initialExam,
        customChapters: state.customChapters,
        customK: state.customK,
        customCount: state.customCount,
        customMinutes: state.customMinutes,
        phase: "running",
        mode: action.mode,
        custom: action.custom,
        qs: action.qs,
        optOrder: action.optOrder,
        answers: new Array(action.qs.length).fill(null),
        flags: new Array(action.qs.length).fill(false),
        durations: new Array(action.qs.length).fill(0),
        timeLeft: action.timeLeft,
      };
    case "RESUME": {
      const d = action.draft;
      const n = action.qs.length;
      return {
        ...initialExam,
        phase: "running",
        mode: "exam",
        custom: d.custom,
        qs: action.qs,
        optOrder: d.optOrder,
        answers: d.answers.slice(0, n),
        flags: d.flags.slice(0, n),
        durations: d.durations.slice(0, n),
        idx: Math.min(Math.max(0, d.idx), Math.max(0, n - 1)),
        timeLeft: d.timeLeft,
      };
    }
    case "SELECT": {
      const answers = state.answers.slice();
      answers[state.idx] = action.opt;
      return { ...state, answers };
    }
    case "SET_IDX":
      return { ...state, idx: action.idx, checked: false };
    case "TOGGLE_FLAG": {
      const flags = state.flags.slice();
      flags[state.idx] = !flags[state.idx];
      return { ...state, flags };
    }
    case "TOGGLE_GRID":
      return { ...state, showGrid: !state.showGrid };
    case "TICK": {
      const durations = state.durations.slice();
      if (state.idx < durations.length) {
        durations[state.idx] = (durations[state.idx] || 0) + 1;
      }
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1), durations };
    }
    case "CHECK_PRACTICE": {
      if (state.checked || state.mode !== "practice") return state;
      const answers = state.answers.slice();
      answers[state.idx] = action.opt;
      const q = state.qs[state.idx];
      const ok = action.opt === q.answer;
      return {
        ...state,
        answers,
        checked: true,
        practiceCorrect: state.practiceCorrect + (ok ? 1 : 0),
      };
    }
    case "NEXT_PRACTICE": {
      if (state.idx < state.qs.length - 1) {
        return { ...state, idx: state.idx + 1, checked: false };
      }
      return { ...state, phase: "result", checked: false };
    }
    case "TOGGLE_REVIEW":
      return { ...state, showReview: !state.showReview };
    case "SET_REVIEW_FILTER":
      return { ...state, reviewFilter: action.filter };
    case "FINISH":
      return { ...state, phase: "result", showGrid: false };
    case "RESET":
      return {
        ...initialExam,
        customChapters: state.customChapters,
        customK: state.customK,
        customCount: state.customCount,
        customMinutes: state.customMinutes,
      };
    default:
      return state;
  }
}

/* ---------- anel de pontuação (r4) ---------- */

function ScoreRing({ pct, passed }: { pct: number; passed: boolean }) {
  /* reset via “ajuste durante o render” (padrão react.dev): setState
     síncrono no corpo do effect é cascata proibida (set-state-in-effect) */
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
  useEffect(() => {
    if (shown >= pct) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 700);
      setShown(Math.round((1 - Math.pow(1 - k, 3)) * pct));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, pct]);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className={"sim-score-ring" + (passed ? " ok" : " no")} role="img" aria-label={pct + "%"}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r={r} fill="none" strokeWidth="8" />
        <circle
          className="ring-value"
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <div className="ring-num" aria-hidden="true">
        <span className="num">{shown}</span>
        <span className="pct">%</span>
      </div>
    </div>
  );
}

/* ---------- grade de questões ---------- */

function QuestionGrid({
  answers,
  flags,
  current,
  onJump,
  labels,
}: {
  answers: (number | null)[];
  flags: boolean[];
  current: number;
  onJump: (i: number) => void;
  labels: {
    item: (n: number, status: string) => string;
    current: string;
    answered: string;
    blank: string;
    flagged: string;
  };
}) {
  return (
    <div className="sim-grid" role="group">
      {answers.map((ans, i) => {
        const answered = ans !== null && ans !== undefined;
        const status = i === current ? labels.current : answered ? labels.answered : labels.blank;
        return (
          <button
            key={i}
            type="button"
            className={
              "sim-grid-item" +
              (i === current ? " current" : "") +
              (answered ? " answered" : "") +
              (flags[i] ? " flagged" : "")
            }
            aria-label={labels.item(i + 1, status) + (flags[i] ? " · " + labels.flagged : "")}
            aria-pressed={flags[i] || undefined}
            onClick={() => onJump(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- view ---------- */

export function Simulado() {
  const ss = useSynapse();
  const { state } = ss;
  const lang = state.lang;
  const c = ss.cert();
  const t = (key: string): string => ss.t("simulado." + key);

  const [exam, dispatch] = useReducer(reducer, initialExam);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const [draft, setDraft] = useState<ExamDraft | null>(null);
  const [draftTick, setDraftTick] = useState(0);
  const [draftSyncKey, setDraftSyncKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rules = c.exam;
  const allChapters = c.chapters.map((ch) => ch.n);
  const examBank = ss.examQuestionsFor();
  const poolTotal = ss.examPoolCount();

  /* valores oficiais + efetivos do personalizado */
  const officialCount = rules ? rules.q : 40;
  const officialMinutes = rules ? rules.min : 60;
  const effChapters =
    exam.customChapters === null || exam.customChapters.length === 0
      ? allChapters
      : exam.customChapters;
  const effCount = exam.customCount || officialCount;
  const effMinutes = exam.customMinutes || officialMinutes;
  const customPool = exam.custom
    ? ss.examPoolCount(
        effChapters.length === allChapters.length ? undefined : effChapters,
        exam.customK
      )
    : 0;

  const lastWrong = ss.lastExamWrongIds();
  const hist = ss.examHistory();

  /* ---------- rascunho: leitura no setup (ajuste durante o render —
     mesmo padrão do loadExamDraft do v3.18.0) ---------- */

  const draftKey = exam.phase === "setup" ? state.cert + ":" + draftTick : null;
  if (draftKey !== draftSyncKey) {
    setDraftSyncKey(draftKey);
    setDraft(draftKey ? loadExamDraft(state.cert) : null);
  }

  /* ---------- rascunho: gravação a cada resposta/navegação ---------- */

  useEffect(() => {
    if (exam.mode !== "exam" || exam.phase !== "running") return;
    saveExamDraft({
      cert: state.cert,
      questionIds: exam.qs.map((q) => q.id),
      optOrder: exam.optOrder,
      answers: exam.answers,
      flags: exam.flags,
      durations: exam.durations,
      idx: exam.idx,
      timeLeft: exam.timeLeft,
      custom: exam.custom,
      savedAt: Date.now(),
    });
  }, [
    exam.mode,
    exam.phase,
    exam.qs,
    exam.optOrder,
    exam.answers,
    exam.flags,
    exam.idx,
    exam.durations,
    exam.timeLeft,
    exam.custom,
    state.cert,
  ]);

  /* ---------- cronômetro ---------- */

  useEffect(() => {
    if (exam.mode !== "exam" || exam.phase !== "running") return;
    timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [exam.mode, exam.phase]);

  /* resetar o guarda idempotente fora do running */
  useEffect(() => {
    if (exam.phase !== "running") finishedRef.current = false;
  }, [exam.phase]);

  /* ---------- finalização (tempo zerado OU botão) ---------- */

  function finish() {
    if (finishedRef.current) return;
    if (exam.phase !== "running" || exam.mode !== "exam") return;
    const rs = c.exam;
    if (!rs) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    clearExamDraft();
    setDraft(null);
    const verdict = examVerdict(exam.qs, exam.answers, rs, exam.custom);
    const wrongIds = exam.qs
      .filter((_q, i) => exam.answers[i] !== exam.qs[i].answer)
      .map((q) => q.id);
    ss.logExam({
      pct: verdict.pct,
      passed: verdict.passed,
      n: verdict.total,
      ...(exam.custom ? { custom: true } : {}),
      ...(verdict.scoring === "points"
        ? { scoring: "points", points: verdict.points, pointsTotal: verdict.pointsTotal }
        : {}),
      wrongIds,
    });
    dispatch({ type: "FINISH" });
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("simResultTitle"), 0);
    ss.announce((verdict.passed ? t("passed") : t("failed")) + " · " + verdict.pct + "%");
  }

  useEffect(() => {
    if (exam.mode === "exam" && exam.phase === "running" && exam.timeLeft === 0) {
      const id = window.setTimeout(finish, 0);
      return () => window.clearTimeout(id);
    }
  }, [exam.timeLeft, exam.phase, exam.mode]);

  /* ---------- aviso nativo ao fechar com prova em andamento ---------- */

  useEffect(() => {
    if (exam.mode !== "exam" || exam.phase !== "running") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [exam.mode, exam.phase]);

  /* ---------- atalhos de teclado (só na prova em andamento) ---------- */

  useEffect(() => {
    if (exam.mode !== "exam" || exam.phase !== "running") return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const node = e.target instanceof Element ? e.target : null;
      if (node && node.closest("input, textarea, select")) return;
      const optCount = (exam.qs[exam.idx]?.options[lang] || []).length;
      if (/^[1-5]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (n < optCount) {
          e.preventDefault();
          dispatch({ type: "SELECT", opt: n });
        }
        return;
      }
      if (e.key === "ArrowRight" && exam.idx < exam.qs.length - 1) {
        e.preventDefault();
        dispatch({ type: "SET_IDX", idx: exam.idx + 1 });
        return;
      }
      if (e.key === "ArrowLeft" && exam.idx > 0) {
        e.preventDefault();
        dispatch({ type: "SET_IDX", idx: exam.idx - 1 });
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
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exam.mode, exam.phase, exam.idx, exam.qs, lang]);

  /* ---------- Escape fecha a grade ---------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && exam.showGrid) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_GRID" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exam.showGrid]);

  /* ---------- sessão avisa a casca ---------- */

  const sessionOn = exam.phase === "running";
  useEffect(() => {
    ss.setSession(sessionOn);
    return () => ss.setSession(false);
  }, [sessionOn, ss]);

  /* ---------- montagem da prova ---------- */

  function buildOfficial(): Question[] {
    /* prova oficial: segue o blueprint (examQ por capítulo), sorteio
       do pool exclusivo, ordem final embaralhada */
    const picked: Question[] = [];
    c.chapters.forEach((ch) => {
      const pool = examBank[String(ch.n)] || [];
      picked.push(...shuffle(pool).slice(0, ch.examQ));
    });
    return shuffle(picked);
  }

  function buildCustom(): Question[] {
    const pool: Question[] = [];
    Object.keys(examBank).forEach((ch) => {
      if (effChapters.length && !effChapters.includes(Number(ch))) return;
      examBank[ch].forEach((q) => {
        if (exam.customK.length && !exam.customK.includes(Number(q.k))) return;
        pool.push(q);
      });
    });
    return shuffle(pool).slice(0, Math.min(effCount, pool.length));
  }

  function startExam() {
    if (!rules) return;
    if (exam.custom && customPool === 0) return;
    const qs = exam.custom ? buildCustom() : buildOfficial();
    if (!qs.length) return;
    const optOrder = qs.map((q) => shuffle(q.options[lang].map((_x, i) => i)));
    dispatch({
      type: "START",
      qs,
      optOrder,
      timeLeft: (exam.custom ? effMinutes : officialMinutes) * 60,
      mode: "exam",
      custom: exam.custom,
    });
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("qTitle"), 0);
  }

  function bankById(): Map<string, Question> {
    const map = new Map<string, Question>();
    Object.keys(examBank).forEach((ch) => {
      examBank[ch].forEach((q) => map.set(q.id, q));
    });
    return map;
  }

  function startPractice() {
    if (!lastWrong || !lastWrong.length) return;
    const map = bankById();
    const qs = shuffle(lastWrong.map((id) => map.get(id)).filter((q): q is Question => !!q));
    if (!qs.length) return;
    const optOrder = qs.map((q) => shuffle(q.options[lang].map((_x, i) => i)));
    dispatch({ type: "START", qs, optOrder, timeLeft: 0, mode: "practice", custom: false });
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("qTitle"), 0);
  }

  function resumeDraft() {
    const d = loadExamDraft(state.cert);
    if (!d) {
      setDraft(null);
      return;
    }
    const map = bankById();
    const qs = d.questionIds.map((id) => map.get(id)).filter((q): q is Question => !!q);
    if (!qs.length) {
      clearExamDraft();
      setDraft(null);
      return;
    }
    dispatch({ type: "RESUME", draft: d, qs });
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("qTitle"), 0);
  }

  function discardDraft() {
    clearExamDraft();
    setDraft(null);
    setDraftTick((x) => x + 1);
  }

  /* treino das erradas direto do resultado */
  function trainWrongFromResult() {
    const wrongQs = exam.qs.filter((_q, i) => exam.answers[i] !== exam.qs[i].answer);
    if (!wrongQs.length) return;
    const optOrder = wrongQs.map((q) => shuffle(q.options[lang].map((_x, i) => i)));
    dispatch({
      type: "START",
      qs: wrongQs,
      optOrder,
      timeLeft: 0,
      mode: "practice",
      custom: false,
    });
    ss.scrollTop();
    window.setTimeout(() => ss.focusId("qTitle"), 0);
  }

  async function copyResult(text: string) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* best-effort */
    }
  }

  /* ---------- estado vazio (prova sem banco) ---------- */

  if (c.status !== "live" || !rules) {
    return (
      <>
        <section className="hero empty-hero" data-od-id="simulado-vazio">
          <div>
            <span className="kicker">
              <i aria-hidden="true" />
              {t("kicker")} · {c.code}
            </span>
            <h1>{t("title")}</h1>
            <p className="lead">{t("leadNoBank")}</p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={() => ss.goTab("certs")}>
                {ss.t("cert.choose")}
              </button>
            </div>
          </div>
        </section>
        <ViewFoot label={t("footnote")} tail={`Synapse · ${ss.t("nav.simulado")} · ${c.code}`} />
      </>
    );
  }

  /* ---------- SETUP ---------- */

  if (exam.phase === "setup") {
    const lead = rules.scoring === "points" ? t("leadPts") : t("lead");
    const leadText = fmt(lead, {
      code: c.code,
      n: rules.q,
      min: rules.min,
      pass: rules.pass,
      points: rules.points,
    });
    const lastExam = hist.length ? hist[hist.length - 1] : null;
    const draftAnswered = draft
      ? draft.answers.filter((a) => a !== null && a !== undefined).length
      : 0;

    return (
      <>
        <section className="hero empty-hero" data-od-id="simulado-cabecalho">
          <div>
            <span className="kicker">
              <i aria-hidden="true" />
              {t("kicker")} · {c.code}
            </span>
            <h1>{t("title")}</h1>
            <p className="lead">{leadText}</p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={startExam}>
                {t("start")}
              </button>
            </div>
          </div>
        </section>

        <div className="sim-setup" data-od-id="simulado-setup">
          {draft && (
            <div className="sim-draft" role="status">
              <div className="sim-draft-info">
                <strong>⏳ {t("draftBanner")}</strong>
                <p>
                  {fmt(t("draftInfo"), {
                    answered: draftAnswered,
                    total: draft.questionIds.length,
                    time: fmtTime(draft.timeLeft),
                  })}
                </p>
              </div>
              <div className="sim-draft-actions">
                <button type="button" className="btn ghost sm" onClick={discardDraft}>
                  {t("draftDiscard")}
                </button>
                <button type="button" className="btn primary sm" onClick={resumeDraft}>
                  {t("draftResume")}
                </button>
              </div>
            </div>
          )}

          <div className="sim-modes">
            <button
              type="button"
              className={"sim-mode" + (!exam.custom ? " on" : "")}
              aria-pressed={!exam.custom}
              onClick={() => dispatch({ type: "TOGGLE_CUSTOM" })}
            >
              <span className="sim-mode-title">{t("official")}</span>
              <span className="sim-mode-desc">
                {fmt(t("officialDesc"), { n: rules.q, min: rules.min, pass: rules.pass })}
              </span>
            </button>
            <button
              type="button"
              className={"sim-mode" + (exam.custom ? " on" : "")}
              aria-pressed={exam.custom}
              onClick={() => dispatch({ type: "TOGGLE_CUSTOM" })}
            >
              <span className="sim-mode-title">🧩 {t("custom")}</span>
              <span className="sim-mode-desc">{t("customDesc")}</span>
            </button>
          </div>

          {exam.custom ? (
            <div className="sim-custom-panel">
              <div className="sim-custom-field">
                <span className="sim-custom-label">{t("customChapters")}</span>
                <div className="chip-row" role="group" aria-label={t("customChapters")}>
                  <button
                    type="button"
                    className={"chip" + (exam.customChapters === null ? " on" : "")}
                    aria-pressed={exam.customChapters === null}
                    onClick={() => dispatch({ type: "SET_CUSTOM_CHAPTERS_ALL" })}
                  >
                    {t("customAllChapters")}
                  </button>
                  {c.chapters.map((ch) => {
                    const on = exam.customChapters === null || exam.customChapters.includes(ch.n);
                    const chCount = (examBank[String(ch.n)] || []).length;
                    return (
                      <button
                        key={ch.n}
                        type="button"
                        className={"chip" + (on ? " on" : "")}
                        aria-pressed={on}
                        onClick={() => dispatch({ type: "TOGGLE_CUSTOM_CHAPTER", chapter: ch.n })}
                      >
                        {ch.name[lang]} <span className="cdot">{chCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="sim-custom-field">
                <span className="sim-custom-label">{t("customKLevels")}</span>
                <div className="chip-row" role="group" aria-label={t("customKLevels")}>
                  <button
                    type="button"
                    className={"chip" + (exam.customK.length === 0 ? " on" : "")}
                    aria-pressed={exam.customK.length === 0}
                    onClick={() => dispatch({ type: "SET_CUSTOM_KALL" })}
                  >
                    {t("customAnyK")}
                  </button>
                  {[1, 2, 3, 4].map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={"chip" + (exam.customK.includes(k) ? " on" : "")}
                      aria-pressed={exam.customK.includes(k)}
                      onClick={() => dispatch({ type: "TOGGLE_CUSTOM_K", k })}
                    >
                      K{k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sim-custom-row2">
                <div className="sim-custom-field">
                  <span className="sim-custom-label">{t("customCount")}</span>
                  <div className="chip-row">
                    {[...new Set([10, 20, rules.q])].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={"chip" + (effCount === n ? " on" : "")}
                        aria-pressed={effCount === n}
                        onClick={() => dispatch({ type: "SET_CUSTOM_COUNT", count: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sim-custom-field">
                  <span className="sim-custom-label">{t("customMinutes")}</span>
                  <div className="chip-row">
                    {[...new Set([30, 45, 60, rules.min])]
                      .sort((a, b) => a - b)
                      .map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={"chip" + (effMinutes === m ? " on" : "")}
                          aria-pressed={effMinutes === m}
                          onClick={() => dispatch({ type: "SET_CUSTOM_MINUTES", minutes: m })}
                        >
                          {m}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
              {customPool === 0 ? (
                <p className="sim-custom-warn" role="alert">
                  {t("customEmpty")}
                </p>
              ) : (
                <p className="sim-custom-pool">
                  {fmt(t("customPool"), { n: Math.min(effCount, customPool) })}
                  <span className="sim-pool-sep"> · </span>
                  {rules.scoring === "points"
                    ? fmt(t("customPassNotePts"), { pct: rules.pct })
                    : fmt(t("customPassNote"), {
                        n: Math.max(
                          1,
                          Math.ceil((rules.pass / rules.q) * Math.min(effCount, customPool))
                        ),
                        total: Math.min(effCount, customPool),
                      })}
                </p>
              )}
            </div>
          ) : (
            <p className="sim-explain">
              {fmt(rules.scoring === "points" ? t("explainPts") : t("explain"), {
                n: rules.q,
                min: rules.min,
              })}
            </p>
          )}

          <div className="sim-start-row">
            <button
              type="button"
              className="btn primary"
              onClick={startExam}
              disabled={exam.custom && customPool === 0}
            >
              {t("start")}
            </button>
            <span className="sim-pool-note">
              {t("poolNote")} · {fmt(t("poolCount"), { n: poolTotal })}
            </span>
          </div>

          {lastWrong && lastWrong.length > 0 && (
            <button type="button" className="sim-lastwrong" onClick={startPractice}>
              <span className="sl-title">🔁 {t("lastWrong")}</span>
              <span className="sl-desc">{fmt(t("lastWrongDesc"), { n: lastWrong.length })}</span>
            </button>
          )}
        </div>
        <ViewFoot label={t("footnote")} tail={`Synapse · ${ss.t("nav.simulado")} · ${c.code}`} />
      </>
    );
  }

  /* ---------- RESULTADO ---------- */

  if (exam.phase === "result") {
    const isExam = exam.mode === "exam";
    const verdict = isExam ? examVerdict(exam.qs, exam.answers, rules, exam.custom) : null;
    const score = exam.qs.reduce((acc, q, i) => acc + (exam.answers[i] === q.answer ? 1 : 0), 0);
    const pct = verdict ? verdict.pct : Math.round((score / Math.max(1, exam.qs.length)) * 100);
    const displayScore = verdict
      ? verdict.scoring === "points"
        ? verdict.points
        : verdict.score
      : exam.practiceCorrect;
    const displayTotal = verdict
      ? verdict.scoring === "points"
        ? verdict.pointsTotal
        : verdict.total
      : exam.qs.length;
    const passMarkEff = verdict
      ? verdict.passMarkEff
      : Math.max(1, Math.ceil(0.65 * exam.qs.length));
    const passed = verdict ? verdict.passed : pct >= 65;

    const totalTime = exam.durations.reduce((acc, d) => acc + (d || 0), 0);
    const answeredCount = exam.answers.filter((a) => a !== null && a !== undefined).length;
    const avgSeconds = answeredCount > 0 ? Math.round(totalTime / answeredCount) : 0;

    const prevExam = isExam && hist.length >= 2 ? hist[hist.length - 2] : null;
    const deltaPct = prevExam && isExam ? pct - (prevExam.pct || 0) : null;

    /* capítulo mais fraco da prova (≥2 questões) */
    const chapterStats: Record<string, { total: number; correct: number }> = {};
    exam.qs.forEach((q, i) => {
      const ch = String(q.ch);
      chapterStats[ch] = chapterStats[ch] || { total: 0, correct: 0 };
      chapterStats[ch].total += 1;
      if (exam.answers[i] === q.answer) chapterStats[ch].correct += 1;
    });
    let weakest: { ch: string; pct: number } | null = null;
    for (const ch of Object.keys(chapterStats)) {
      const s = chapterStats[ch];
      const chPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      if (s.total >= 2 && (!weakest || chPct < weakest.pct)) weakest = { ch, pct: chPct };
    }
    const weakestChapter = weakest && weakest.pct < 70 ? weakest : null;
    const weakestName = weakestChapter
      ? ss.chapterOf(Number(weakestChapter.ch))?.name[lang] || weakestChapter.ch
      : "";

    const wrongCount = exam.qs.filter((_q, i) => exam.answers[i] !== exam.qs[i].answer).length;

    /* revisão com filtros */
    const isCorrect = (i: number) => exam.answers[i] === exam.qs[i].answer;
    const isBlank = (i: number) => exam.answers[i] === null || exam.answers[i] === undefined;
    const FILTER_DEFS: { id: ReviewFilter; label: string; test: (i: number) => boolean }[] = [
      { id: "wrong", label: t("reviewFilterWrong"), test: (i) => !isBlank(i) && !isCorrect(i) },
      { id: "blank", label: t("reviewFilterBlank"), test: isBlank },
      { id: "flagged", label: t("reviewFilterFlagged"), test: (i) => exam.flags[i] === true },
      { id: "correct", label: t("reviewFilterCorrect"), test: isCorrect },
      { id: "all", label: t("reviewFilterAll"), test: () => true },
    ];
    const FILTERS = FILTER_DEFS.map((f) => ({
      ...f,
      count: exam.qs.reduce((acc, _q, i) => acc + (f.test(i) ? 1 : 0), 0),
    }));
    const activeFilter = FILTERS.find((f) => f.id === exam.reviewFilter) || FILTERS[0];
    const reviewItems = exam.qs.map((q, i) => ({ q, i })).filter(({ i }) => activeFilter.test(i));

    return (
      <>
        <div className="session" data-od-id="simulado-resultado">
          <div className="session-top">
            <span className="kicker">
              <i aria-hidden="true" />
              {t("kicker")} · {c.code}
            </span>
            <button
              type="button"
              className="btn ghost session-exit"
              onClick={() => {
                dispatch({ type: "RESET" });
                ss.scrollTop();
                window.setTimeout(() => ss.focusId("planTitle"), 0);
              }}
            >
              {t("backHome")}
            </button>
          </div>

          {isExam ? (
            <div className="sim-result" id="simResultTitle" tabIndex={-1}>
              <ScoreRing pct={pct} passed={passed} />
              <div className="sim-result-body">
                <div className="sim-score">
                  {displayScore}/{displayTotal}
                  {verdict && verdict.scoring === "points" ? " pts" : ""} · {pct}%
                </div>
                <p className={"sim-verdict " + (passed ? "ok" : "no")}>
                  {passed ? t("passed") : t("failed")}
                </p>
                {exam.custom && (
                  <p className="sim-custom-tag">
                    🧩 {t("customTag")} ·{" "}
                    {fmt(t("customPassNote"), { n: passMarkEff, total: exam.qs.length })}
                  </p>
                )}
                {deltaPct !== null && (
                  <p
                    className={
                      "sim-delta " + (deltaPct > 0 ? "up" : deltaPct < 0 ? "down" : "flat")
                    }
                  >
                    {deltaPct > 0
                      ? "📈 " + fmt(t("deltaUp"), { n: deltaPct })
                      : deltaPct < 0
                        ? "📉 " + fmt(t("deltaDown"), { n: deltaPct })
                        : "➖ " + t("deltaFlat")}{" "}
                    {t("deltaVs")}
                  </p>
                )}
                {totalTime > 0 && (
                  <p className="sim-time">
                    {fmt(t("timeSummary"), { total: fmtTime(totalTime), avg: avgSeconds })}
                  </p>
                )}
                <p className="sim-msg">
                  {pct >= 85
                    ? t("excellentMsg")
                    : passed
                      ? t("passedMsg")
                      : fmt(t("failedMsg"), { passMark: passMarkEff })}
                </p>
                {weakestChapter && (
                  <p className="sim-weak">
                    {fmt(t("weakestChapter"), { chapter: weakestName, pct: weakestChapter.pct })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="summary" id="simResultTitle" tabIndex={-1}>
              <span className="sk">{t("practiceTitle")}</span>
              <h1>{t("practiceTitle")}</h1>
              <div className="sc">
                {exam.practiceCorrect}
                <small>{fmt(ss.t("session.scoreOf"), { total: exam.qs.length })}</small>
              </div>
              <p className="aside-note">{t("footnote")}</p>
            </div>
          )}

          <div className="session-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                dispatch({ type: "RESET" });
                ss.scrollTop();
                window.setTimeout(() => ss.focusId("planTitle"), 0);
              }}
            >
              {t("retakeQuiz")}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => dispatch({ type: "TOGGLE_REVIEW" })}
            >
              {exam.showReview ? t("hideReview") : t("showReview")}
            </button>
            {isExam && (
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  copyResult(
                    fmt(t("copyResultText"), {
                      cert: c.code,
                      score: displayScore,
                      total: displayTotal,
                      pct,
                      verdict: passed ? t("passed") : t("failed"),
                      passMark: passMarkEff,
                    })
                  )
                }
              >
                {copied ? "✓ " + t("copied") : "📋 " + t("copyResult")}
              </button>
            )}
            {isExam && weakestChapter && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const cap = Number(weakestChapter!.ch);
                  dispatch({ type: "RESET" });
                  ss.goTab("estudar", { cap });
                }}
              >
                {fmt(t("studyChapter"), { chapter: weakestName })}
              </button>
            )}
            {isExam && wrongCount > 0 && (
              <button type="button" className="btn primary" onClick={trainWrongFromResult}>
                {fmt(t("trainWrong"), { n: wrongCount })}
              </button>
            )}
            {!isExam && (
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  dispatch({ type: "RESET" });
                  ss.scrollTop();
                  window.setTimeout(() => ss.focusId("planTitle"), 0);
                }}
              >
                {t("backHome")}
              </button>
            )}
          </div>
        </div>

        {exam.showReview && (
          <div className="session sim-review" data-od-id="simulado-revisao">
            <div className="sim-review-head">
              <h2>{t("reviewTitle")}</h2>
              <a href="#simResultTitle">{t("reviewBack")}</a>
            </div>
            <div className="sim-review-filters" role="group" aria-label={t("reviewFilterAria")}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={"chip" + (exam.reviewFilter === f.id ? " on" : "")}
                  aria-pressed={exam.reviewFilter === f.id}
                  onClick={() => dispatch({ type: "SET_REVIEW_FILTER", filter: f.id })}
                  disabled={f.count === 0 && exam.reviewFilter !== f.id}
                >
                  {f.label} <span className="cdot">{f.count}</span>
                </button>
              ))}
            </div>
            {reviewItems.length === 0 ? (
              <p className="q-hint">{t("reviewNoItems")}</p>
            ) : (
              reviewItems.map(({ q, i }) => {
                const ok = isCorrect(i);
                const chosenOpt = exam.answers[i];
                const order = exam.optOrder[i] || q.options[lang].map((_x, j) => j);
                const chosenText =
                  chosenOpt === null || chosenOpt === undefined
                    ? null
                    : q.options[lang][order[chosenOpt]];
                const correctText = q.options[lang][q.answer];
                return (
                  <article
                    className={"sim-review-item" + (exam.flags[i] ? " flagged" : "")}
                    key={q.id}
                  >
                    <header className="sim-review-head-row">
                      <span className="sr-num">#{i + 1}</span>
                      <span className="sr-ch">{ss.chapterOf(q.ch)?.name[lang] || q.ch}</span>
                      <span className={"sr-k k" + q.k}>K{q.k}</span>
                      {isExam && (exam.durations[i] || 0) > 0 && (
                        <span className="sr-time" title={t("timeOnQuestion")}>
                          ⏱ {exam.durations[i]}s
                        </span>
                      )}
                      {exam.flags[i] && (
                        <span className="sr-flag" aria-label={t("statusFlagged")}>
                          ⚑
                        </span>
                      )}
                      <span className={"sr-status " + (ok ? "ok" : "no")}>{ok ? "✓" : "✗"}</span>
                    </header>
                    <p className="sr-q">{q.q[lang]}</p>
                    <p className={"sr-a " + (ok ? "ok" : "no")}>
                      {ok ? "✓" : "✗"} {t("yourAnswer")} {chosenText || t("notAnswered")}
                    </p>
                    {!ok && (
                      <p className="sr-a ok">
                        ✓ {t("correctAnswer")} {correctText}
                      </p>
                    )}
                    <p className="sr-exp">{q.exp[lang]}</p>
                  </article>
                );
              })
            )}
          </div>
        )}
        <ViewFoot label={t("footnote")} tail={`Synapse · ${ss.t("nav.simulado")} · ${c.code}`} />
      </>
    );
  }

  /* ---------- RUNNING ---------- */

  const q = exam.qs[exam.idx];
  if (!q) return null;
  const order = exam.optOrder[exam.idx] || q.options[lang].map((_x, i) => i);
  const optTexts = order.map((orig) => q.options[lang][orig] ?? "");
  const isExam = exam.mode === "exam";
  const answered = !isExam && exam.checked;
  const isLast = exam.idx === exam.qs.length - 1;
  const timerClass = exam.timeLeft <= 300 ? "danger" : exam.timeLeft <= 600 ? "warn" : "";
  const chapterName = ss.chapterOf(q.ch)?.name[lang] || String(q.ch);

  return (
    <>
      <div className="session" data-od-id="simulado-prova">
        <div className="session-top">
          <span className="kicker">
            <i aria-hidden="true" />
            {t("kicker")} · {c.code}
            {!isExam && <span className="k-ch"> · {t("practiceTitle")}</span>}
          </span>
          {isExam ? (
            <span className={"sim-timer " + timerClass} role="timer" aria-label={t("timerLabel")}>
              {fmtTime(exam.timeLeft)}
            </span>
          ) : (
            <button
              type="button"
              className="btn ghost session-exit"
              onClick={() => dispatch({ type: "RESET" })}
            >
              {t("practiceBack")}
            </button>
          )}
        </div>

        <div className="session-progress">
          <span>{fmt(t("questionOf"), { n: exam.idx + 1, total: exam.qs.length })}</span>
          {isExam && (
            <span className="steps" aria-hidden="true">
              {exam.qs.map((_x, idx) => (
                <i key={idx} className={exam.answers[idx] !== null ? "on" : ""} />
              ))}
            </span>
          )}
        </div>

        {isExam && (
          <div className="sim-toolbar">
            <div className="sim-toolbar-group">
              <button
                type="button"
                className="btn sm"
                onClick={() => dispatch({ type: "TOGGLE_GRID" })}
                aria-expanded={exam.showGrid}
              >
                {exam.showGrid ? t("hideGrid") : t("showGrid")}
              </button>
              <button
                type="button"
                className={"btn sm sim-flag-btn" + (exam.flags[exam.idx] ? " on" : "")}
                onClick={() => dispatch({ type: "TOGGLE_FLAG" })}
                aria-pressed={exam.flags[exam.idx] === true}
                title={t("flagAria")}
              >
                <span aria-hidden="true">{exam.flags[exam.idx] ? "⚑" : "⚐"}</span>{" "}
                {exam.flags[exam.idx] ? t("flagOn") : t("flagOff")}
              </button>
            </div>
            <p className="sim-kbd" aria-hidden="true">
              <span className="sr-only">{t("kbdHintLabel")}: </span>
              <kbd>1</kbd>–<kbd>{Math.min(5, optTexts.length)}</kbd> {t("kbdAnswer")}
              <span className="kbd-sep">·</span>
              <kbd>←</kbd>
              <kbd>→</kbd> {t("kbdNavigate")}
              <span className="kbd-sep">·</span>
              <kbd>F</kbd> {t("kbdFlag")}
              <span className="kbd-sep">·</span>
              <kbd>G</kbd> {t("kbdGrid")}
            </p>
          </div>
        )}

        {isExam && exam.showGrid && (
          <div className="sim-grid-box">
            <p className="sim-grid-summary">
              {fmt(t("gridSummary"), {
                answered: exam.answers.filter((a) => a !== null && a !== undefined).length,
                blank: exam.answers.filter((a) => a === null || a === undefined).length,
              })}
              {exam.flags.some(Boolean) && (
                <span className="sim-grid-flags"> · {exam.flags.filter(Boolean).length} ⚑</span>
              )}
            </p>
            <QuestionGrid
              answers={exam.answers}
              flags={exam.flags}
              current={exam.idx}
              onJump={(i) => dispatch({ type: "SET_IDX", idx: i })}
              labels={{
                item: (n, status) => fmt(t("gridItemAria"), { n, status }),
                current: t("statusCurrent"),
                answered: t("statusAnswered"),
                blank: t("statusBlank"),
                flagged: t("statusFlagged"),
              }}
            />
          </div>
        )}

        <h1 className="q-title" id="qTitle" tabIndex={-1}>
          {q.q[lang]}
        </h1>
        <p className="sim-q-meta">
          <span className="sim-q-ch">{chapterName}</span>
          <span className={"sim-q-k k" + q.k}>K{q.k}</span>
        </p>

        <fieldset className="opts" data-locked={answered} aria-label={ss.t("a11y.answer")}>
          <legend className="sr-only">{ss.t("a11y.answer")}</legend>
          {optTexts.map((text, i) => {
            const origIndex = order[i];
            const isCorrectOpt = answered && origIndex === q.answer;
            const isWrongOpt = answered && exam.answers[exam.idx] === i && origIndex !== q.answer;
            const cls = isCorrectOpt ? "opt is-correct" : isWrongOpt ? "opt is-wrong" : "opt";
            const tag = isCorrectOpt ? (
              <em className="opt-tag is-ok">{ss.t("session.tagCorrect")}</em>
            ) : isWrongOpt ? (
              <em className="opt-tag is-no">{ss.t("session.tagYours")}</em>
            ) : null;
            return (
              <label className={cls} key={q.id + ":" + i}>
                <input
                  type="radio"
                  name="examAnswer"
                  value={i}
                  checked={exam.answers[exam.idx] === i}
                  disabled={answered}
                  onChange={() => {
                    if (isExam) dispatch({ type: "SELECT", opt: i });
                    else dispatch({ type: "CHECK_PRACTICE", opt: i });
                  }}
                />
                <span className="opt-key" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <span className="opt-text">
                  {text}
                  {tag}
                </span>
              </label>
            );
          })}
        </fieldset>

        {answered && (
          <section
            className="feedback"
            data-result={exam.answers[exam.idx] === q.answer ? "ok" : "no"}
            aria-labelledby="fbTitle"
          >
            <h2 className="fb-head" id="fbTitle" tabIndex={-1}>
              <span className="fb-mark" aria-hidden="true">
                {exam.answers[exam.idx] === q.answer ? "✓" : "×"}
              </span>
              {exam.answers[exam.idx] === q.answer
                ? ss.t("session.correct")
                : ss.t("session.wrong")}
            </h2>
            <p className="fb-exp">{q.exp[lang]}</p>
            <p className="fb-ref">
              {ss.t("session.source")} · {q.ref} · {q.id}
            </p>
          </section>
        )}

        <div className="session-actions">
          {isExam && exam.idx > 0 && (
            <button
              type="button"
              className="btn"
              onClick={() => dispatch({ type: "SET_IDX", idx: exam.idx - 1 })}
            >
              {t("prev")}
            </button>
          )}
          {!isLast && (isExam || answered) && (
            <button
              type="button"
              className="btn primary"
              onClick={() =>
                isExam
                  ? dispatch({ type: "SET_IDX", idx: exam.idx + 1 })
                  : dispatch({ type: "NEXT_PRACTICE" })
              }
            >
              {t("next")}
            </button>
          )}
          {isLast && isExam && (
            <button type="button" className="btn primary" onClick={finish}>
              {t("finishExam")}
            </button>
          )}
          {isLast && !isExam && (
            <button
              type="button"
              className="btn primary"
              onClick={() => dispatch({ type: "NEXT_PRACTICE" })}
            >
              {t("seeResult")}
            </button>
          )}
          {isExam && (
            <button
              type="button"
              className="btn ghost session-exit"
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                dispatch({ type: "RESET" });
                ss.scrollTop();
                window.setTimeout(() => ss.focusId("planTitle"), 0);
              }}
            >
              {t("backShort")}
            </button>
          )}
        </div>
      </div>
      <ViewFoot label={t("footnote")} tail={`Synapse · ${ss.t("nav.simulado")} · ${c.code}`} />
    </>
  );
}
