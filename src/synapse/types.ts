/* Synapse · tipos do contrato de dados (HANDOFF.md · "Contrato de dados").
   `seen` do protótipo era estado de exemplo: aqui vale 0 — o progresso
   real vive no store (localStorage), não no seed. */

export type Lang = "pt" | "en";
export type Theme = "light" | "dark";
export type CertStatus = "live" | "soon" | "legacy";

export type TabId =
  | "hoje"
  | "estudar"
  | "simulado"
  | "flashcards"
  | "syllabus"
  | "progresso"
  | "glossary"
  | "about"
  | "certs";

export interface LocaleText {
  pt: string;
  en: string;
}

export interface Topic {
  pt: string;
  en: string;
}

export interface ExamRules {
  /** questões na prova */
  q: number;
  /** minutos */
  min: number;
  /** corte (acertos ou pontos) */
  pass: number;
  /** pontos totais (provas pontuadas) */
  points: number;
  /** percentual de corte */
  pct: number;
  scoring: "count" | "points";
}

export interface Chapter {
  n: number;
  name: LocaleText;
  sub: LocaleText;
  /** questões no exame (blueprint oficial) */
  examQ: number;
  /** questões de estudo no banco */
  total: number;
  topics: Topic[];
}

export interface Cert {
  id: string;
  code: string;
  name: string;
  status: CertStatus;
  version: string;
  year: number | null;
  exam: ExamRules | null;
  nextChapter: number | null;
  chapters: Chapter[];
}

export interface Question {
  id: string;
  ch: number;
  k: number;
  answer: number;
  ref: string;
  q: LocaleText;
  options: { pt: string[]; en: string[] };
  exp: LocaleText;
}

/** banks/<cert>.json — mapa capítulo → questões */
export type Bank = Record<string, Question[]>;

export interface GlossaryEntry {
  cert: string;
  id: string;
  chapter: number;
  pt: { term: string; def: string };
  en: { term: string; def: string };
}

/* ---------- store ---------- */

export interface Attempt {
  ok: number;
  tries: number;
  at: number;
  ch: number;
  last?: boolean;
}

export interface LogEntry {
  at: number;
  ch: number;
  total: number;
  correct: number;
}

export interface CardState {
  due: number;
  interval: number;
  streak: number;
  lapses: number;
  reviews: number;
  at: number;
  ch?: number;
  rating: "again" | "hard" | "good";
}

export interface SrsCounts {
  again: number;
  hard: number;
  good: number;
}

export interface SynState {
  cert: string;
  lang: Lang;
  theme: Theme;
  goal: number;
  seen: Record<string, Record<string, number>>;
  attempts: Record<string, Record<string, Attempt>>;
  log: Record<string, LogEntry[]>;
  cards: Record<string, Record<string, CardState>>;
  srs: Record<string, SrsCounts>;
  checkins: string[];
  exam: Record<string, string>;
  /** histórico de simulados por prova (últimos 20) */
  exams: Record<string, ExamRecord[]>;
  /** questões marcadas como salvas por prova (synapse.saved.v1) */
  saved: Record<string, string[]>;
  /** lembrete diário (synapse.settings.v1) — global, não por prova */
  settings: ReminderSettings;
}

/** lembrete diário de estudo (porta do r10 do v3.18.0) */
export interface ReminderSettings {
  enabled: boolean;
  /** "HH:MM" 24h — default 19:00, desligado por padrão */
  time: string;
}

/** uma prova concluída no histórico (porta do examHistory do app v3.18.0) */
export interface ExamRecord {
  at: number;
  pct: number;
  passed: boolean;
  /** questões da prova */
  n: number;
  /** simulado personalizado (capítulos/níveis escolhidos) */
  custom?: boolean;
  scoring?: "count" | "points";
  points?: number;
  pointsTotal?: number;
  /** ids das erradas/em branco — alimentam “repetir erros” */
  wrongIds?: string[];
}

/** rascunho de simulado em andamento (synapse.examdraft.v1) */
export interface ExamDraft {
  cert: string;
  questionIds: string[];
  optOrder: number[][];
  answers: (number | null)[];
  flags: boolean[];
  durations: number[];
  idx: number;
  timeLeft: number;
  custom: boolean;
  savedAt: number;
}

/** conquista desbloqueável (porta dos critérios do v3.18.0) */
export interface AchievementMeta {
  id: string;
  icon: string;
  pt: string;
  en: string;
  ptDesc: string;
  enDesc: string;
}

/** progresso rumo a uma conquista (roadmap) */
export interface AchievementProgress {
  id: string;
  current: number;
  target: number;
  pct: number;
  unit?: "pct";
}
