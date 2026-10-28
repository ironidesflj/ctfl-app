"use client";

/* ===========================================================
   Synapse · store.tsx
   A casca única do handoff (js/shell.js) portada para React.
   Estado, persistência, prova ativa, idioma, tema, progresso,
   cartões, check-in automático e sincronização entre abas.

   Persistência (localStorage, todas versionadas — iguais ao handoff):
     synapse.cert.v1      · id da prova ativa (só provas com banco)
     synapse.lang.v1      · pt | en
     synapse.theme.v1     · light | dark
     synapse.seen.v1      · { cert: { qid: capítulo } } — questões únicas
     synapse.attempts.v1  · { cert: { qid: { ok, last, tries, at, ch } } }
     synapse.log.v1       · { cert: [ { at, ch, total, correct } ] }
     synapse.cards.v1     · { cert: { qid: { due, interval, streak,
                            lapses, reviews, at, ch, rating } } }
     synapse.srs.v1       · { cert: { again, hard, good } }
     synapse.checkins.v1  · [ 'YYYY-MM-DD' ] — automático ao estudar
     synapse.examdate.v1  · { cert: 'YYYY-MM-DD' }
     synapse.settings.v1  · { enabled, time } — lembrete diário (r10)

   Regras: a prova ativa é a única prova do app. Nenhum número é
   inventado: sem dado, a tela mostra estado vazio ou “—”.
   =========================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AchievementProgress,
  Bank,
  CardState,
  Cert,
  Chapter,
  ExamDraft,
  ExamRecord,
  Lang,
  LogEntry,
  ReminderSettings,
  SrsCounts,
  SynState,
  TabId,
  Theme,
} from "./types";
import { CERTS, LINKS } from "./data/certs";
import { STRINGS, type Strings } from "./data/strings";
import { sanitizeReminder, scheduleDailyReminder } from "./reminder";

/* ---------- persistência ---------- */

const STORE = {
  cert: "synapse.cert.v1",
  lang: "synapse.lang.v1",
  theme: "synapse.theme.v1",
  seen: "synapse.seen.v1",
  attempts: "synapse.attempts.v1",
  log: "synapse.log.v1",
  cards: "synapse.cards.v1",
  srs: "synapse.srs.v1",
  checkins: "synapse.checkins.v1",
  exam: "synapse.examdate.v1",
  exams: "synapse.exams.v1",
  examdraft: "synapse.examdraft.v1",
  settings: "synapse.settings.v1",
} as const;

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* modo privado */
  }
}
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) || fallback : fallback;
  } catch {
    return fallback;
  }
}

/* ---------- saneamento do persistido ----------
   Red team: forjar synapse.*.v1 não pode quebrar o app (handoff —
   degradar sem crash e sem número inventado). O topo de cada chave
   já era validado; aqui se valida também o valor DE CADA PROVA:
   seen/attempts/cards/srs → objeto plano; log → array de sessões
   bem formadas; exam → string "YYYY-MM-DD". Valor inválido é
   descartado (a prova volta ao estado vazio honesto). */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** Saneia in place um mapa { cert: valor } lido do storage. */
function sanitizeCertMap(raw: Record<string, unknown>, kind: "map" | "log" | "day"): void {
  for (const certId of Object.keys(raw)) {
    const v = raw[certId];
    const ok =
      kind === "log"
        ? Array.isArray(v)
        : kind === "day"
          ? typeof v === "string" && DAY_RE.test(v)
          : isPlainObject(v);
    if (!ok) delete raw[certId];
  }
  if (kind === "log") {
    for (const certId of Object.keys(raw)) {
      raw[certId] = (raw[certId] as unknown[]).filter(
        (e): e is LogEntry =>
          isPlainObject(e) &&
          typeof e.at === "number" &&
          typeof e.ch === "number" &&
          typeof e.total === "number" &&
          typeof e.correct === "number"
      );
    }
  }
}

/** Lê um mapa { cert: valor } já saneado (usado pelo evento storage). */
function readSanitized<T>(storageKey: string, kind: "map" | "log" | "day"): T {
  const raw: unknown = readJSON(storageKey, {});
  if (!isPlainObject(raw)) return {} as T;
  sanitizeCertMap(raw, kind);
  return raw as T;
}

/* ---------- banco por certificação (carregamento lazy) ---------- */

const BANK_LOADERS: Record<string, () => Promise<{ default: Bank }>> = {
  ctfl: () => import("./data/banks/ctfl.json"),
  "ctal-ta": () => import("./data/banks/ctal-ta.json"),
  "ctal-tm": () => import("./data/banks/ctal-tm.json"),
};

/* pool exclusivo de simulado (POOLS.md · r13): nunca cruza com o de estudo */
const EXAM_BANK_LOADERS: Record<string, () => Promise<{ default: Bank }>> = {
  ctfl: () => import("./data/banks/ctfl-exam.json"),
  "ctal-ta": () => import("./data/banks/ctal-ta-exam.json"),
  "ctal-tm": () => import("./data/banks/ctal-tm-exam.json"),
};

/* ---------- rascunho de simulado (fora do estado React — como o v3.18.0,
   lido/gravado direto no localStorage a cada resposta/navegação) ---------- */

function sanitizeDraft(raw: unknown, certId: string): ExamDraft | null {
  if (!isPlainObject(raw)) return null;
  const ids = Array.isArray(raw.questionIds) ? raw.questionIds.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length) return null;
  const order: number[][] = Array.isArray(raw.optOrder)
    ? raw.optOrder.map((row: unknown) =>
        Array.isArray(row) ? row.filter((x: unknown): x is number => typeof x === "number" && x >= 0) : []
      )
    : [];
  const num = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fb);
  return {
    cert: certId,
    questionIds: ids,
    optOrder: order,
    answers: Array.isArray(raw.answers)
      ? raw.answers.map((a: unknown) => (typeof a === "number" ? a : null))
      : [],
    flags: Array.isArray(raw.flags) ? raw.flags.map((f: unknown) => !!f) : [],
    durations: Array.isArray(raw.durations) ? raw.durations.map((d: unknown) => num(d, 0)) : [],
    idx: Math.max(0, Math.floor(num(raw.idx, 0))),
    timeLeft: Math.max(0, Math.floor(num(raw.timeLeft, 0))),
    custom: raw.custom === true,
    savedAt: num(raw.savedAt, 0),
  };
}

export function loadExamDraft(certId: string): ExamDraft | null {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE.examdraft) || "null");
    if (!isPlainObject(raw)) return null;
    const draft = sanitizeDraft(raw, certId);
    /* rascunho de outra prova não vale — descarta silenciosamente */
    return draft && (raw.cert === certId || !raw.cert) ? draft : null;
  } catch {
    return null;
  }
}

export function saveExamDraft(draft: ExamDraft): void {
  try {
    localStorage.setItem(STORE.examdraft, JSON.stringify(draft));
  } catch {
    /* modo privado */
  }
}

export function clearExamDraft(): void {
  try {
    localStorage.removeItem(STORE.examdraft);
  } catch {
    /* noop */
  }
}

/* saneia o histórico de simulados por prova (forjado degrada, não quebra) */
function sanitizeExams(raw: Record<string, unknown>): Record<string, ExamRecord[]> {
  const out: Record<string, ExamRecord[]> = {};
  Object.keys(raw).forEach((certId) => {
    if (!Array.isArray(raw[certId])) return;
    const list = (raw[certId] as unknown[]).filter(
      (e): e is ExamRecord =>
        isPlainObject(e) &&
        typeof e.at === "number" &&
        typeof e.pct === "number" &&
        typeof e.passed === "boolean" &&
        typeof e.n === "number"
    );
    if (list.length) out[certId] = list.slice(-20);
  });
  return out;
}

/* ---------- utilidades ---------- */

export function pad2(n: number): string {
  return (n < 10 ? "0" : "") + n;
}
export function dayKey(ts?: number): string {
  const d = typeof ts === "number" ? new Date(ts) : new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function parseDay(key: string): Date {
  const p = key.split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0, 0);
}
export function fmt(str: string, vars?: Record<string, string | number>): string {
  return String(str).replace(/\{(\w+)\}/g, (_, key: string) =>
    vars && Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : "{" + key + "}"
  );
}

export function isLive(id: string | null | undefined): boolean {
  return !!(id && CERTS[id] && CERTS[id].status === "live" && CERTS[id].chapters.length > 0);
}

/* ---------- tipos derivados ---------- */

export interface Readiness {
  pct: number | null;
  raw?: number;
  attempted: number;
  correct: number;
  total: number;
  cutoff: number | null;
}
export interface WeekDay {
  key: string;
  date: Date;
  count: number;
}
export interface ActivityDay {
  key: string;
  date: Date;
  count: number;
  future: boolean;
}
export interface KLevelGroup {
  k: number;
  total: number;
  attempted: number;
  correct: number;
  pct: number | null;
}
export interface CardStats {
  started: number;
  total: number;
  due: number;
  mature: number;
  reviews: number;
  retention: number | null;
}

export interface SynapseApi {
  /* estado */
  state: SynState;
  tab: TabId;
  bankStatus: "loading" | "ready" | "error";
  mounted: boolean;

  /* navegação */
  goTab: (tab: TabId, opts?: { cap?: number }) => void;
  /** cap pendente da navegação atual (?cap= ou goTab com cap) — leitura sem limpeza */
  peekCap: () => number | null;
  /** incrementa a cada navegação com cap — força remount da view */
  navSeq: number;

  /* casca */
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  setCert: (id: string) => boolean;
  setSession: (on: boolean) => void;
  announce: (message: string) => void;
  scrollTop: () => void;
  focusId: (id: string) => void;

  /* lembrete diário + overlay “Como funciona” */
  setReminder: (enabled: boolean, time?: string) => void;
  howOpen: boolean;
  setHowOpen: (open: boolean) => void;

  /* dados */
  cert: () => Cert;
  questionsFor: () => Bank;
  chapterOf: (n: number) => Chapter | null;
  /* pool exclusivo de simulado */
  examQuestionsFor: () => Bank;
  examPoolCount: (chapters?: number[], kLevels?: number[]) => number;

  /* progresso */
  seenFor: (ch: Chapter) => number;
  pctFor: (ch: Chapter) => number;
  coverage: (c: Cert) => { seen: number; total: number; pct: number };
  nextChapter: (c: Cert) => Chapter | null;
  attemptsFor: (ch: number) => { ok: number; tries: number; pct: number | null };
  accuracy: () => { ok: number; tries: number; pct: number | null };
  readiness: () => Readiness;
  cutText: (ex: Cert["exam"]) => string;
  kLevels: () => KLevelGroup[];
  lastSession: () => LogEntry | null;

  /* gravações */
  markSeen: (qid: string, chapter: number) => boolean;
  recordAttempt: (qid: string, chapter: number, ok: boolean) => void;
  logSession: (entry: { ch: number; total: number; correct: number }) => void;

  /* simulado */
  examHistory: () => ExamRecord[];
  lastExamWrongIds: () => string[] | null;
  logExam: (record: Omit<ExamRecord, "at">) => void;

  /* conquistas (derivadas do estado vivo) */
  achievements: () => string[];
  achievementRoadmap: () => AchievementProgress[];

  /* cartões */
  cardList: () => { q: Bank[string][number]; ch: number }[];
  cardState: (qid: string) => CardState | null;
  dueCards: () => { q: Bank[string][number]; ch: number }[];
  rateCard: (qid: string, rating: "again" | "hard" | "good", chapter: number) => void;
  cardStats: () => CardStats;

  /* check-in e data */
  checkins: () => string[];
  isCheckedToday: () => boolean;
  autoCheckin: () => boolean;
  toggleCheckin: () => boolean;
  streak: () => number;
  examDate: () => string;
  setExamDate: (value: string) => void;
  daysToExam: () => number | null;
  todayAttempts: (ch?: number) => number;
  todayReviews: () => number;
  todayActivity: () => number;
  weekActivity: () => WeekDay[];
  activity: (weeks?: number) => ActivityDay[];

  /* copy e util */
  S: () => Strings;
  t: (path: string) => string;
  links: typeof LINKS;
}

const SynapseContext = createContext<SynapseApi | null>(null);

const DEFAULT_STATE: SynState = {
  cert: "ctfl",
  lang: "pt",
  theme: "light",
  seen: {},
  attempts: {},
  log: {},
  cards: {},
  srs: {},
  checkins: [],
  exam: {},
  exams: {},
  settings: { enabled: false, time: "19:00" },
};

export function SynapseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SynState>(DEFAULT_STATE);
  const [tab, setTab] = useState<TabId>("hoje");
  const [mounted, setMounted] = useState(false);
  const [banks, setBanks] = useState<Record<string, Bank>>({});
  const [examBanks, setExamBanks] = useState<Record<string, Bank>>({});
  const [bankStatus, setBankStatus] = useState<"loading" | "ready" | "error">("loading");
  const [navSeq, setNavSeq] = useState(0);
  const [howOpen, setHowOpen] = useState(false);
  const capRef = useRef<number | null>(null);
  const liveRef = useRef<HTMLParagraphElement | null>(null);

  const S = useCallback(() => STRINGS[state.lang], [state.lang]);
  const t = useCallback(
    (path: string): string => {
      const value = String(path)
        .split(".")
        .reduce<unknown>((acc, key) => {
          if (acc && typeof acc === "object" && (acc as Record<string, unknown>)[key] !== undefined) {
            return (acc as Record<string, unknown>)[key];
          }
          return undefined;
        }, STRINGS[state.lang]);
      return (value as string) || path;
    },
    [state.lang]
  );

  const cert = useCallback(() => CERTS[state.cert], [state.cert]);
  const questionsFor = useCallback((): Bank => banks[state.cert] || {}, [banks, state.cert]);
  /* pool exclusivo de simulado — a fonte única da view Simulado (r13) */
  const examQuestionsFor = useCallback((): Bank => examBanks[state.cert] || {}, [examBanks, state.cert]);
  const examPoolCount = useCallback(
    (chapters?: number[], kLevels?: number[]) => {
      const by = examQuestionsFor();
      let n = 0;
      Object.keys(by).forEach((ch) => {
        if (chapters && !chapters.includes(Number(ch))) return;
        by[ch].forEach((q) => {
          if (kLevels && kLevels.length && !kLevels.includes(Number(q.k))) return;
          n += 1;
        });
      });
      return n;
    },
    [examQuestionsFor]
  );

  /* ---------- boot: query + storage ---------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCert = params.get("prova");
    const queryCap = params.get("cap");

    const storedCert = readLS(STORE.cert) || "";
    const id =
      queryCert && isLive(queryCert) ? queryCert : isLive(storedCert) ? storedCert : "ctfl";

    const next: SynState = {
      cert: id,
      lang: readLS(STORE.lang) === "en" ? "en" : "pt",
      theme:
        (document.documentElement.getAttribute("data-theme") as Theme) === "dark" ? "dark" : "light",
      seen: readJSON(STORE.seen, {}),
      attempts: readJSON(STORE.attempts, {}),
      log: readJSON(STORE.log, {}),
      cards: readJSON(STORE.cards, {}),
      srs: readJSON(STORE.srs, {}),
      checkins: readJSON<string[]>(STORE.checkins, []),
      exam: readJSON(STORE.exam, {}),
      exams: sanitizeExams(readJSON<Record<string, unknown>>(STORE.exams, {})),
      settings: sanitizeReminder(readJSON<unknown>(STORE.settings, null)),
    };

    if (!Array.isArray(next.checkins)) next.checkins = [];
    else next.checkins = next.checkins.filter((d): d is string => typeof d === "string");
    for (const key of ["seen", "attempts", "log", "cards", "srs", "exam"] as const) {
      if (!next[key] || typeof next[key] !== "object" || Array.isArray(next[key])) {
        (next[key] as SynState[typeof key]) = {} as SynState[typeof key];
      }
    }
    if (!next.exams || typeof next.exams !== "object" || Array.isArray(next.exams)) {
      next.exams = {};
    }
    /* saneia também os valores POR PROVA (localStorage forjado degrada,
       não quebra): mapas de progresso, sessões do log e data da prova */
    sanitizeCertMap(next.seen, "map");
    sanitizeCertMap(next.attempts, "map");
    sanitizeCertMap(next.log, "log");
    sanitizeCertMap(next.cards, "map");
    sanitizeCertMap(next.srs, "map");
    sanitizeCertMap(next.exam, "day");

    if (isLive(next.cert)) writeLS(STORE.cert, next.cert);

    if (queryCap && Number(queryCap)) {
      capRef.current = Number(queryCap);
      setTab("estudar");
    }
    setState(next);
    setMounted(true);
  }, []);

  /* ---------- sincronização entre abas (evento storage) ---------- */

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key) return;
      if (e.key === STORE.lang) {
        setState((prev) => ({ ...prev, lang: e.newValue === "en" ? "en" : "pt" }));
      } else if (e.key === STORE.theme) {
        setState((prev) => ({ ...prev, theme: e.newValue === "dark" ? "dark" : "light" }));
      } else if (e.key === STORE.cert) {
        const incoming = e.newValue;
        if (incoming && isLive(incoming)) {
          setState((prev) => ({ ...prev, cert: incoming }));
        }
      } else if (e.key === STORE.seen) {
        setState((prev) => ({ ...prev, seen: readSanitized(STORE.seen, "map") }));
      } else if (e.key === STORE.attempts) {
        setState((prev) => ({ ...prev, attempts: readSanitized(STORE.attempts, "map") }));
      } else if (e.key === STORE.log) {
        setState((prev) => ({ ...prev, log: readSanitized(STORE.log, "log") }));
      } else if (e.key === STORE.cards) {
        setState((prev) => ({ ...prev, cards: readSanitized(STORE.cards, "map") }));
      } else if (e.key === STORE.srs) {
        setState((prev) => ({ ...prev, srs: readSanitized(STORE.srs, "map") }));
      } else if (e.key === STORE.checkins) {
        setState((prev) => ({ ...prev, checkins: readJSON<string[]>(STORE.checkins, []) }));
      } else if (e.key === STORE.exam) {
        setState((prev) => ({ ...prev, exam: readSanitized(STORE.exam, "day") }));
      } else if (e.key === STORE.exams) {
        setState((prev) => ({
          ...prev,
          exams: sanitizeExams(readJSON<Record<string, unknown>>(STORE.exams, {})),
        }));
      } else if (e.key === STORE.settings) {
        setState((prev) => ({
          ...prev,
          settings: sanitizeReminder(readJSON<unknown>(STORE.settings, null)),
        }));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------- carregamento lazy do banco da prova ativa ---------- */

  useEffect(() => {
    if (!mounted) return;
    if (!isLive(state.cert)) {
      /* prova sem banco: nada a carregar — as views mostram estado vazio */
      setBankStatus("ready");
      return;
    }
    if (banks[state.cert]) {
      setBankStatus("ready");
      return;
    }
    let cancelled = false;
    setBankStatus("loading");
    const loader = BANK_LOADERS[state.cert];
    const examLoader = EXAM_BANK_LOADERS[state.cert];
    if (!loader || !examLoader) {
      setBankStatus("error");
      return;
    }
    Promise.all([loader(), examLoader ? examLoader() : Promise.resolve(null)])
      .then(([m, ex]) => {
        if (cancelled) return;
        setBanks((prev) => ({ ...prev, [state.cert]: m.default }));
        if (ex) setExamBanks((prev) => ({ ...prev, [state.cert]: ex.default }));
        setBankStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setBankStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [state.cert, mounted, banks]);

  /* ---------- chrome (título, idioma do documento, atributos) ---------- */

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", state.theme);
    document.documentElement.lang = state.lang === "pt" ? "pt-BR" : "en";
    document.body.setAttribute("data-cert", state.cert);
    document.body.setAttribute("data-tab", tab);
    const value = t("nav." + tab) + " — Synapse";
    document.title = value;
    /* O Next reafirma o <title> dos metadados após a hidratação;
       reafirmamos o título da view logo depois (uma vez por mudança). */
    const id = window.setTimeout(() => {
      document.title = value;
    }, 300);
    return () => window.clearTimeout(id);
  }, [mounted, state.theme, state.lang, state.cert, tab, t]);

  /* ---------- utilidades de UI ---------- */

  const announce = useCallback((message: string) => {
    const el = liveRef.current;
    if (!el) return;
    el.textContent = "";
    window.setTimeout(() => {
      if (liveRef.current) liveRef.current.textContent = message;
    }, 40);
  }, []);

  const scrollTop = useCallback(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      /* noop */
    }
  }, []);

  const focusId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.focus({ preventScroll: false });
  }, []);

  const setSession = useCallback((on: boolean) => {
    document.body.classList.toggle("is-session", on);
  }, []);

  const goTab = useCallback(
    (next: TabId, opts?: { cap?: number }) => {
      /* o cap vale para esta navegação: a próxima sobrescreve */
      capRef.current = typeof opts?.cap === "number" ? opts.cap : null;
      if (typeof opts?.cap === "number") setNavSeq((s) => s + 1);
      setTab(next);
      scrollTop();
    },
    [scrollTop]
  );

  const peekCap = useCallback((): number | null => capRef.current, []);

  /* ---------- idioma / tema / prova ---------- */

  const setLang = useCallback(
    (lang: Lang) => {
      setState((prev) => ({ ...prev, lang: lang === "en" ? "en" : "pt" }));
      writeLS(STORE.lang, lang === "en" ? "en" : "pt");
      announce(lang === "en" ? "English" : "Português");
    },
    [announce]
  );

  const setTheme = useCallback((theme: Theme) => {
    const value: Theme = theme === "dark" ? "dark" : "light";
    setState((prev) => ({ ...prev, theme: value }));
    writeLS(STORE.theme, value);
  }, []);

  const setCert = useCallback(
    (id: string) => {
      if (!isLive(id)) return false;
      capRef.current = null; /* troca de prova zera o cap — nada de sessão fantasma */
      setState((prev) => ({ ...prev, cert: id }));
      writeLS(STORE.cert, id);
      announce(CERTS[id].code + " · " + CERTS[id].name);
      return true;
    },
    [announce]
  );

  /* ---------- lembrete diário (r10) ---------- */

  const setReminder = useCallback(
    (enabled: boolean, time?: string) => {
      setState((prev) => {
        const next: ReminderSettings = {
          enabled,
          time: time ?? prev.settings.time,
        };
        writeLS(STORE.settings, JSON.stringify(next));
        return { ...prev, settings: next };
      });
    },
    []
  );

  /* Agenda o disparo enquanto o app estiver aberto (a notificação em si
     só sai com permissão concedida — pedida no card da view Hoje). */
  useEffect(() => {
    if (!mounted) return;
    const { enabled, time } = state.settings;
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const cancel = scheduleDailyReminder(time, () => {
      try {
        if (Notification.permission === "granted") {
          new Notification("Synapse", {
            body: fmt(STRINGS[state.lang].today.reminderBody, { n: 6 }),
            tag: "synapse-reminder",
          });
        }
      } catch {
        /* o lembrete nunca derruba o app */
      }
    });
    return cancel;
  }, [mounted, state.settings, state.lang]);

  /* ---------- progresso ---------- */

  const chapterOf = useCallback(
    (n: number): Chapter | null => {
      const c = cert();
      return c.chapters.find((ch) => ch.n === Number(n)) || null;
    },
    [cert]
  );

  const extraSeen = useCallback(
    (ch: number) => {
      const byCert = state.seen[state.cert];
      if (!byCert) return 0;
      return Object.keys(byCert).filter((qid) => Number(byCert[qid]) === ch).length;
    },
    [state.seen, state.cert]
  );

  const seenFor = useCallback(
    (ch: Chapter) => Math.min(ch.total, 0 + extraSeen(ch.n)),
    [extraSeen]
  );

  const pctFor = useCallback(
    (ch: Chapter) => (ch.total ? Math.round((seenFor(ch) / ch.total) * 100) : 0),
    [seenFor]
  );

  const coverage = useCallback(
    (c: Cert) => {
      let seen = 0;
      let total = 0;
      c.chapters.forEach((ch) => {
        seen += seenFor(ch);
        total += ch.total;
      });
      return { seen, total, pct: total ? Math.round((seen / total) * 100) : 0 };
    },
    [seenFor]
  );

  const nextChapter = useCallback((c: Cert): Chapter | null => {
    const list = c.chapters;
    return list.find((ch) => ch.n === c.nextChapter) || list[0] || null;
  }, []);

  const attemptOk = (a: { ok: number; last?: boolean }) =>
    a.last === undefined ? a.ok > 0 : !!a.last;

  const attemptsFor = useCallback(
    (ch: number) => {
      const byCert = state.attempts[state.cert] || {};
      let ok = 0;
      let tries = 0;
      Object.keys(byCert).forEach((qid) => {
        const a = byCert[qid];
        if (Number(a.ch) !== Number(ch)) return;
        tries += a.tries;
        ok += a.ok;
      });
      return { ok, tries, pct: tries ? Math.round((ok / tries) * 100) : null };
    },
    [state.attempts, state.cert]
  );

  const accuracy = useCallback(() => {
    const byCert = state.attempts[state.cert] || {};
    let ok = 0;
    let tries = 0;
    Object.keys(byCert).forEach((qid) => {
      tries += byCert[qid].tries;
      ok += byCert[qid].ok;
    });
    return { ok, tries, pct: tries ? Math.round((ok / tries) * 100) : null };
  }, [state.attempts, state.cert]);

  /* Prontidão: acerto por questão única sobre o banco, ponderado pelo
     peso de cada capítulo no exame. Questão não coberta conta como zero.
     Sem conferência, não há base — pct é null, nunca um número inventado. */
  const readiness = useCallback((): Readiness => {
    const c = cert();
    if (!c.chapters.length) return { pct: null, attempted: 0, correct: 0, total: 0, cutoff: null };
    const byCert = state.attempts[state.cert] || {};
    const bank = banks[state.cert] || {};
    let weighted = 0;
    let weightSum = 0;
    let attempted = 0;
    let correct = 0;
    let total = 0;
    c.chapters.forEach((ch) => {
      let uAttempted = 0;
      let uCorrect = 0;
      Object.keys(byCert).forEach((qid) => {
        const a = byCert[qid];
        if (Number(a.ch) !== Number(ch.n)) return;
        uAttempted += 1;
        if (attemptOk(a)) uCorrect += 1;
      });
      const bankN = (bank[String(ch.n)] || []).length || ch.total;
      attempted += uAttempted;
      correct += uCorrect;
      total += bankN;
      const score = bankN ? (uCorrect / bankN) * 100 : 0;
      const weight = ch.examQ || ch.total || 1;
      weighted += score * weight;
      weightSum += weight;
    });
    const raw = weightSum ? Math.round(weighted / weightSum) : 0;
    return {
      pct: attempted ? raw : null,
      raw,
      attempted,
      correct,
      total,
      cutoff: c.exam ? c.exam.pct : null,
    };
  }, [cert, state.attempts, state.cert, banks]);

  const cutText = useCallback(
    (ex: Cert["exam"]): string => {
      if (!ex) return "";
      const sep = state.lang === "pt" ? " de " : " of ";
      const tail =
        ex.scoring === "points"
          ? sep + ex.points + (state.lang === "pt" ? " pontos" : " points")
          : sep + ex.q;
      return ex.pass + tail + " · " + ex.pct + "%";
    },
    [state.lang]
  );

  const markSeen = useCallback(
    (qid: string, chapter: number) => {
      let added = false;
      setState((prev) => {
        const byCert = prev.seen[prev.cert] || {};
        if (byCert[qid]) return prev;
        added = true;
        const seen = { ...prev.seen, [prev.cert]: { ...byCert, [qid]: Number(chapter) } };
        writeLS(STORE.seen, JSON.stringify(seen));
        return { ...prev, seen };
      });
      return added;
    },
    []
  );

  const autoCheckin = useCallback((): boolean => {
    const key = dayKey();
    let added = false;
    setState((prev) => {
      const list = prev.checkins || [];
      if (list.indexOf(key) !== -1) return prev;
      added = true;
      const next = list.concat(key).slice(-120).sort();
      writeLS(STORE.checkins, JSON.stringify(next));
      return { ...prev, checkins: next };
    });
    return added;
  }, []);

  const recordAttempt = useCallback(
    (qid: string, chapter: number, ok: boolean) => {
      setState((prev) => {
        const byCert = { ...(prev.attempts[prev.cert] || {}) };
        const item = byCert[qid] || { ok: 0, tries: 0, at: 0, ch: Number(chapter) };
        byCert[qid] = {
          ...item,
          tries: item.tries + 1,
          ok: item.ok + (ok ? 1 : 0),
          last: !!ok,
          at: Date.now(),
          ch: Number(chapter),
        };
        const attempts = { ...prev.attempts, [prev.cert]: byCert };
        writeLS(STORE.attempts, JSON.stringify(attempts));
        return { ...prev, attempts };
      });
      autoCheckin();
    },
    [autoCheckin]
  );

  const logSession = useCallback(
    (entry: { ch: number; total: number; correct: number }) => {
      setState((prev) => {
        const list = (prev.log[prev.cert] || []).slice();
        list.unshift({
          at: Date.now(),
          ch: Number(entry.ch),
          total: Number(entry.total) || 0,
          correct: Number(entry.correct) || 0,
        });
        const log = { ...prev.log, [prev.cert]: list.slice(0, 24) };
        writeLS(STORE.log, JSON.stringify(log));
        return { ...prev, log };
      });
      autoCheckin();
    },
    [autoCheckin]
  );

  /* ---------- cartões ---------- */

  const cardList = useCallback(() => {
    const out: { q: Bank[string][number]; ch: number }[] = [];
    const by = questionsFor();
    Object.keys(by).forEach((ch) => {
      by[ch].forEach((q) => out.push({ q, ch: Number(ch) }));
    });
    return out;
  }, [questionsFor]);

  const cardState = useCallback(
    (qid: string) => (state.cards[state.cert] || {})[qid] || null,
    [state.cards, state.cert]
  );

  const dueCards = useCallback(() => {
    const now = Date.now();
    return cardList().filter((item) => {
      const cs = cardState(item.q.id);
      return !cs || cs.due <= now;
    });
  }, [cardList, cardState]);

  const srsCounts = useCallback((): SrsCounts => {
    const saved = state.srs[state.cert];
    if (saved) {
      return { again: saved.again || 0, hard: saved.hard || 0, good: saved.good || 0 };
    }
    const derived: SrsCounts = { again: 0, hard: 0, good: 0 };
    const by = state.cards[state.cert] || {};
    Object.keys(by).forEach((qid) => {
      const rating = by[qid].rating;
      if (rating === "again" || rating === "hard" || rating === "good") derived[rating] += 1;
    });
    return derived;
  }, [state.srs, state.cards, state.cert]);

  const rateCard = useCallback(
    (qid: string, rating: "again" | "hard" | "good", chapter: number) => {
      setState((prev) => {
        const certId = prev.cert;
        const cardsByCert = { ...(prev.cards[certId] || {}) };
        const srsByCert = { ...(prev.srs[certId] || { again: 0, hard: 0, good: 0 }) };
        srsByCert[rating] = (srsByCert[rating] || 0) + 1;

        const prevCard = cardsByCert[qid] || { streak: 0, lapses: 0, reviews: 0 };
        const now = Date.now();
        const streak = rating === "again" ? 0 : (prevCard.streak || 0) + 1;
        const days = rating === "again" ? 0 : rating === "hard" ? 1 : 3;
        const interval = rating === "again" ? 0 : Math.min(21, days * Math.max(1, streak));
        cardsByCert[qid] = {
          due: now + interval * 86400000,
          interval,
          streak,
          lapses: (prevCard.lapses || 0) + (rating === "again" ? 1 : 0),
          reviews: (prevCard.reviews || 0) + 1,
          at: now,
          ch: Number(chapter),
          rating,
        };

        const cards = { ...prev.cards, [certId]: cardsByCert };
        const srs = { ...prev.srs, [certId]: srsByCert };
        writeLS(STORE.cards, JSON.stringify(cards));
        writeLS(STORE.srs, JSON.stringify(srs));
        return { ...prev, cards, srs };
      });
      autoCheckin();
    },
    [autoCheckin]
  );

  const cardStats = useCallback((): CardStats => {
    const total = cardList().length;
    const by = state.cards[state.cert] || {};
    let started = 0;
    let mature = 0;
    Object.keys(by).forEach((qid) => {
      started += 1;
      if ((by[qid].interval || 0) >= 21) mature += 1;
    });
    const counts = srsCounts();
    const reviews = counts.again + counts.hard + counts.good;
    return {
      started,
      total,
      due: dueCards().length,
      mature,
      reviews,
      retention: reviews ? Math.round(((counts.hard + counts.good) / reviews) * 100) : null,
    };
  }, [cardList, state.cards, state.cert, srsCounts, dueCards]);

  /* ---------- check-in e data ---------- */

  const checkins = useCallback(() => state.checkins || [], [state.checkins]);
  const isCheckedToday = useCallback(
    () => checkins().indexOf(dayKey()) !== -1,
    [checkins]
  );

  const toggleCheckin = useCallback((): boolean => {
    const key = dayKey();
    let added = false;
    setState((prev) => {
      const list = (prev.checkins || []).slice();
      const at = list.indexOf(key);
      if (at === -1) list.push(key);
      else list.splice(at, 1);
      added = at === -1;
      const next = list.slice(-120).sort();
      writeLS(STORE.checkins, JSON.stringify(next));
      return { ...prev, checkins: next };
    });
    return added;
  }, []);

  const streak = useCallback(() => {
    const set: Record<string, boolean> = {};
    checkins().forEach((d) => {
      set[d] = true;
    });
    let count = 0;
    const start = set[dayKey()] ? 0 : 1;
    for (let i = start; i < 400; i++) {
      if (set[dayKey(daysAgo(i).getTime())]) count += 1;
      else break;
    }
    return count;
  }, [checkins]);

  const examDate = useCallback(() => state.exam[state.cert] || "", [state.exam, state.cert]);

  const setExamDate = useCallback((value: string) => {
    setState((prev) => {
      const exam = { ...prev.exam };
      if (value) exam[prev.cert] = value;
      else delete exam[prev.cert];
      writeLS(STORE.exam, JSON.stringify(exam));
      return { ...prev, exam };
    });
  }, []);

  const daysToExam = useCallback((): number | null => {
    const value = examDate();
    if (!value) return null;
    const target = parseDay(value);
    const today = daysAgo(0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }, [examDate]);

  const todayAttempts = useCallback(
    (ch?: number) => {
      const byCert = state.attempts[state.cert] || {};
      let count = 0;
      Object.keys(byCert).forEach((qid) => {
        const a = byCert[qid];
        if (ch !== undefined && Number(a.ch) !== Number(ch)) return;
        if (dayKey(a.at) === dayKey()) count += 1;
      });
      return count;
    },
    [state.attempts, state.cert]
  );

  const todayReviews = useCallback(() => {
    const byCert = state.cards[state.cert] || {};
    let count = 0;
    Object.keys(byCert).forEach((qid) => {
      if (byCert[qid].at && dayKey(byCert[qid].at) === dayKey()) count += 1;
    });
    return count;
  }, [state.cards, state.cert]);

  const weekActivity = useCallback((): WeekDay[] => {
    const out: WeekDay[] = [];
    const byCert = state.attempts[state.cert] || {};
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const key = dayKey(d.getTime());
      out.push({
        key,
        date: d,
        count: Object.keys(byCert).filter((qid) => dayKey(byCert[qid].at) === key).length,
      });
    }
    return out;
  }, [state.attempts, state.cert]);

  /* Atividade de 12 semanas alinhada a segunda-feira. Cada célula soma
     questões conferidas e cartões avaliados naquele dia. Dias futuros
     existem na grade, mas ficam inertes. */
  const activity = useCallback(
    (weeks = 12): ActivityDay[] => {
      const span = weeks * 7;
      const today = daysAgo(0);
      const start = new Date(today.getTime());
      start.setDate(start.getDate() - ((today.getDay() + 6) % 7));
      start.setDate(start.getDate() - (span - 7));
      const map: Record<string, number> = {};
      const byAttempts = state.attempts[state.cert] || {};
      Object.keys(byAttempts).forEach((qid) => {
        const key = dayKey(byAttempts[qid].at);
        map[key] = (map[key] || 0) + 1;
      });
      const byCards = state.cards[state.cert] || {};
      Object.keys(byCards).forEach((qid) => {
        if (!byCards[qid].at) return;
        const key = dayKey(byCards[qid].at);
        map[key] = (map[key] || 0) + 1;
      });
      const out: ActivityDay[] = [];
      for (let i = 0; i < span; i++) {
        const d = new Date(start.getTime());
        d.setDate(start.getDate() + i);
        const key = dayKey(d.getTime());
        out.push({
          key,
          date: d,
          count: map[key] || 0,
          future: d > today && key !== dayKey(),
        });
      }
      return out;
    },
    [state.attempts, state.cards, state.cert]
  );

  const todayActivity = useCallback(
    () => todayAttempts() + todayReviews(),
    [todayAttempts, todayReviews]
  );

  const lastSession = useCallback(
    (): LogEntry | null => {
      const list = state.log[state.cert] || [];
      return list.length ? list[0] : null;
    },
    [state.log, state.cert]
  );

  const kLevels = useCallback((): KLevelGroup[] => {
    const groups: Record<number, KLevelGroup> = {};
    const by = questionsFor();
    const attempts = state.attempts[state.cert] || {};
    Object.keys(by).forEach((ch) => {
      by[ch].forEach((q) => {
        const k = Number(q.k) || 0;
        if (!groups[k]) groups[k] = { k, total: 0, attempted: 0, correct: 0, pct: null };
        groups[k].total += 1;
        const a = attempts[q.id];
        if (a) {
          groups[k].attempted += 1;
          if (attemptOk(a)) groups[k].correct += 1;
        }
      });
    });
    return Object.keys(groups)
      .map((k) => groups[Number(k)])
      .sort((a, b) => a.k - b.k)
      .map((g) => ({
        ...g,
        pct: g.attempted ? Math.round((g.correct / g.total) * 100) : null,
      }));
  }, [questionsFor, state.attempts, state.cert]);

  /* ---------- simulado: histórico e gravação ---------- */

  const examHistory = useCallback(
    (): ExamRecord[] => state.exams[state.cert] || [],
    [state.exams, state.cert]
  );

  const lastExamWrongIds = useCallback((): string[] | null => {
    const hist = examHistory();
    for (let i = hist.length - 1; i >= 0; i--) {
      const e = hist[i];
      if (Array.isArray(e.wrongIds)) {
        return e.wrongIds.filter((id): id is string => typeof id === "string");
      }
    }
    return null;
  }, [examHistory]);

  const logExam = useCallback(
    (record: Omit<ExamRecord, "at">) => {
      setState((prev) => {
        const list = (prev.exams[prev.cert] || []).concat({ ...record, at: Date.now() }).slice(-20);
        const exams = { ...prev.exams, [prev.cert]: list };
        writeLS(STORE.exams, JSON.stringify(exams));
        return { ...prev, exams };
      });
      autoCheckin();
    },
    [autoCheckin]
  );

  /* ---------- conquistas: derivadas 100% do estado vivo ----------
     Porta dos critérios do v3.18.0 (checkAchievements): aqui nada é
     persistido — como visto/attempts/log só crescem, a derivação é
     idempotente e honesta (sem número inventado, sem seed). */

  const achievements = useCallback((): string[] => {
    const unlocked: string[] = [];
    const byCert = state.attempts[state.cert] || {};
    const answered = Object.keys(byCert).length;
    if (answered >= 1) unlocked.push("first-step");
    const st = streak();
    if (st >= 7) unlocked.push("streak-7");
    if (st >= 30) unlocked.push("streak-30");
    const hist = examHistory();
    if (hist.some((e) => e.passed)) unlocked.push("passed-exam");
    if (hist.some((e) => e.custom)) unlocked.push("custom-exam");
    const c = cert();
    let complete = 0;
    c.chapters.forEach((ch) => {
      if (seenFor(ch) >= ch.total) complete += 1;
    });
    if (complete >= 1) unlocked.push("chapter-complete");
    if (c.chapters.length > 0 && complete === c.chapters.length) unlocked.push("bank-complete");
    const cs = cardStats();
    if (cs.reviews >= 100) unlocked.push("srs-100");
    if (cs.mature >= 10) unlocked.push("srs-master");
    return unlocked;
  }, [state.attempts, state.cert, streak, examHistory, cert, seenFor, cardStats]);

  /* roadmap: o quão perto de cada conquista travada (espelho 1:1 dos
     critérios acima — ordenado pela mais próxima) */
  const achievementRoadmap = useCallback(
    () => {
      const unlocked = achievements();
      const c = cert();
      const byCert = state.attempts[state.cert] || {};
      const answered = Object.keys(byCert).length;
      const st = streak();
      const hist = examHistory();
      const bestPct = hist.reduce((m, e) => Math.max(m, e.pct || 0), 0);
      const ex = c.exam;
      const passPct = ex && (ex.points || ex.q) > 0 ? ex.pct : 65;
      let chapter = { current: 0, target: 0 };
      let bankSeen = 0;
      let bankTotal = 0;
      c.chapters.forEach((ch) => {
        const seen = seenFor(ch);
        bankSeen += seen;
        bankTotal += ch.total;
        if (ch.total > 0 && seen / ch.total > chapter.current / (chapter.target || 1)) {
          chapter = { current: seen, target: ch.total };
        }
      });
      const cs = cardStats();
      const all: Record<string, { current: number; target: number; unit?: "pct" }> = {
        "first-step": { current: Math.min(answered, 1), target: 1 },
        "streak-7": { current: Math.min(st, 7), target: 7 },
        "streak-30": { current: Math.min(st, 30), target: 30 },
        "passed-exam": { current: Math.min(bestPct, passPct), target: passPct, unit: "pct" },
        "custom-exam": { current: hist.some((e) => e.custom) ? 1 : 0, target: 1 },
        "chapter-complete": { current: chapter.current, target: chapter.target || 1 },
        "bank-complete": { current: bankSeen, target: bankTotal || 1 },
        "srs-100": { current: Math.min(cs.reviews, 100), target: 100 },
        "srs-master": { current: Math.min(cs.mature, 10), target: 10 },
      };
      return Object.keys(all)
        .filter((id) => !unlocked.includes(id))
        .map((id) => ({
          id,
          current: all[id].current,
          target: all[id].target,
          unit: all[id].unit,
          pct: all[id].target > 0 ? Math.min(100, Math.round((all[id].current / all[id].target) * 100)) : 0,
        }))
        .sort((a, b) => b.pct - a.pct);
    },
    [achievements, cert, state.attempts, state.cert, streak, examHistory, seenFor, cardStats]
  );

  /* ---------- API ---------- */

  const api: SynapseApi = useMemo(
    () => ({
      state,
      tab,
      bankStatus,
      mounted,
      goTab,
      peekCap,
      navSeq,
      setLang,
      setTheme,
      setCert,
      setSession,
      announce,
      scrollTop,
      focusId,
      setReminder,
      howOpen,
      setHowOpen,
      cert,
      questionsFor,
      chapterOf,
      examQuestionsFor,
      examPoolCount,
      seenFor,
      pctFor,
      coverage,
      nextChapter,
      attemptsFor,
      accuracy,
      readiness,
      cutText,
      kLevels,
      lastSession,
      markSeen,
      recordAttempt,
      logSession,
      examHistory,
      lastExamWrongIds,
      logExam,
      achievements,
      achievementRoadmap,
      cardList,
      cardState,
      dueCards,
      rateCard,
      cardStats,
      checkins,
      isCheckedToday,
      autoCheckin,
      toggleCheckin,
      streak,
      examDate,
      setExamDate,
      daysToExam,
      todayAttempts,
      todayReviews,
      todayActivity,
      weekActivity,
      activity,
      S,
      t,
      links: LINKS,
    }),
    [
      state,
      tab,
      bankStatus,
      mounted,
      goTab,
      peekCap,
      navSeq,
      setLang,
      setTheme,
      setCert,
      setSession,
      announce,
      scrollTop,
      focusId,
      setReminder,
      howOpen,
      setHowOpen,
      cert,
      questionsFor,
      chapterOf,
      examQuestionsFor,
      examPoolCount,
      seenFor,
      pctFor,
      coverage,
      nextChapter,
      attemptsFor,
      accuracy,
      readiness,
      cutText,
      kLevels,
      lastSession,
      markSeen,
      recordAttempt,
      logSession,
      examHistory,
      lastExamWrongIds,
      logExam,
      achievements,
      achievementRoadmap,
      cardList,
      cardState,
      dueCards,
      rateCard,
      cardStats,
      checkins,
      isCheckedToday,
      autoCheckin,
      toggleCheckin,
      streak,
      examDate,
      setExamDate,
      daysToExam,
      todayAttempts,
      todayReviews,
      todayActivity,
      weekActivity,
      activity,
      S,
      t,
    ]
  );

  return (
    <SynapseContext.Provider value={api}>
      {children}
      <p className="sr-only" id="live" aria-live="polite" ref={liveRef} />
    </SynapseContext.Provider>
  );
}

export function useSynapse(): SynapseApi {
  const ctx = useContext(SynapseContext);
  if (!ctx) throw new Error("useSynapse fora do SynapseProvider");
  return ctx;
}
