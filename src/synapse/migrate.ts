/* Synapse · migrate.ts
   Migração idempotente dos dados salvos no schema da versão Vite anterior
   (synapse.progress.v1.{cert}, ctfl_progress_v1, synapse.examDraft.v1.{cert},
   synapse.goal, synapse.lang, synapse.theme, etc.)
   para o schema unificado v4.1 (synapse.*.v1).

   Garante que nenhum progresso de usuário existente seja perdido.
   Preserva chaves legadas intactas (nunca apaga as chaves antigas). */

import { findQuestionChapter } from "./data/questionChapters";

export interface MigrationSummary {
  migratedCerts: string[];
  totalAttempts: number;
  totalSeen: number;
  totalCheckins: number;
  totalExams: number;
  totalCards: number;
  totalSaved: number;
  draftRestored: boolean;
  onboardingMarked: boolean;
}

export interface MigrateOptions {
  overwrite?: boolean;
  targetCerts?: string[];
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return (JSON.parse(raw) as T) || fallback;
  } catch {
    return fallback;
  }
}

export function migrateViteProgressIfNeeded(opts?: MigrateOptions): MigrationSummary {
  const summary: MigrationSummary = {
    migratedCerts: [],
    totalAttempts: 0,
    totalSeen: 0,
    totalCheckins: 0,
    totalExams: 0,
    totalCards: 0,
    totalSaved: 0,
    draftRestored: false,
    onboardingMarked: false,
  };

  if (typeof window === "undefined" || !window.localStorage) {
    return summary;
  }

  try {
    const CERTS = ["ctfl", "ctal-ta", "ctal-tm"];

    // 1. Carrega o estado de destino atual
    const seenByCert = safeParse<Record<string, Record<string, number>>>(
      localStorage.getItem("synapse.seen.v1"),
      {}
    );
    const attemptsByCert = safeParse<
      Record<
        string,
        Record<string, { ok: number; tries: number; at: number; ch: number; last?: boolean }>
      >
    >(localStorage.getItem("synapse.attempts.v1"), {});
    const logByCert = safeParse<
      Record<string, Array<{ at: number; ch: number; total: number; correct: number }>>
    >(localStorage.getItem("synapse.log.v1"), {});
    const cardsByCert = safeParse<
      Record<
        string,
        Record<
          string,
          {
            due: number;
            interval: number;
            streak: number;
            lapses: number;
            reviews: number;
            at: number;
            ch: number;
            rating: "again" | "hard" | "good";
          }
        >
      >
    >(localStorage.getItem("synapse.cards.v1"), {});
    const srsByCert = safeParse<Record<string, { again: number; hard: number; good: number }>>(
      localStorage.getItem("synapse.srs.v1"),
      {}
    );
    const checkinsList = safeParse<string[]>(localStorage.getItem("synapse.checkins.v1"), []);
    const checkinsSet = new Set<string>(checkinsList);
    const examsByCert = safeParse<
      Record<
        string,
        Array<{
          n: number;
          total: number;
          correct: number;
          pct: number;
          passed: boolean;
          at: number;
          custom?: boolean;
          wrongIds?: string[];
          scoring?: "count" | "points";
          points?: number;
          pointsTotal?: number;
        }>
      >
    >(localStorage.getItem("synapse.exams.v1"), {});
    const savedByCert = safeParse<Record<string, string[]>>(
      localStorage.getItem("synapse.saved.v1"),
      {}
    );

    let changedSeen = false;
    let changedAttempts = false;
    let changedLog = false;
    let changedCards = false;
    let changedSrs = false;
    let changedCheckins = false;
    let changedExams = false;
    let changedSaved = false;

    // 2. Itera sobre as certificações
    for (const certId of CERTS) {
      let rawProg = localStorage.getItem(`synapse.progress.v1.${certId}`);
      if (!rawProg && certId === "ctfl") {
        rawProg = localStorage.getItem("ctfl_progress_v1");
      }

      if (rawProg) {
        interface ViteProgress {
          schemaVersion?: number;
          total?: number;
          correct?: number;
          byDomain?: Record<string, { total?: number; correct?: number; t?: number; c?: number }>;
          seen?: Record<string, string | boolean | number>;
          attempts?: Record<
            string,
            {
              count?: number;
              correct?: number | boolean;
              lastCorrect?: boolean;
              lastAt?: string | null;
              firstAt?: string | null;
              ok?: boolean | number;
              last?: string;
              tries?: number;
              domain?: number;
              ch?: number;
              history?: boolean[];
            }
          >;
          history?: Array<{
            date?: string;
            count?: number;
            correct?: number | boolean;
            kind?: string;
            id?: string;
          }>;
          lastStudyDate?: string | null;
          saved?: string[];
          srs?: Record<
            string,
            {
              interval?: number;
              repetitions?: number;
              easeFactor?: number;
              dueDate?: string | null;
              due?: number;
              streak?: number;
              lapses?: number;
              reviews?: number;
              at?: number;
              ch?: number;
              rating?: "again" | "hard" | "good";
            }
          >;
          srsStats?: {
            again?: number;
            hard?: number;
            good?: number;
            easy?: number;
            reviews?: number;
          };
          examHistory?: Array<{
            id?: string;
            date?: string;
            at?: number;
            total?: number;
            n?: number;
            correct?: number;
            pct?: number;
            passed?: boolean;
            custom?: boolean;
            wrongIds?: string[];
            scoring?: "count" | "points";
            points?: number;
            pointsTotal?: number;
          }>;
        }

        const prog = safeParse<ViteProgress | null>(rawProg, null);
        if (prog) {
          summary.migratedCerts.push(certId);

          if (opts?.overwrite && (!opts.targetCerts || opts.targetCerts.includes(certId))) {
            seenByCert[certId] = {};
            attemptsByCert[certId] = {};
            logByCert[certId] = [];
            cardsByCert[certId] = {};
            delete srsByCert[certId];
            examsByCert[certId] = [];
            savedByCert[certId] = [];
            changedSeen = true;
            changedAttempts = true;
            changedLog = true;
            changedCards = true;
            changedSrs = true;
            changedExams = true;
            changedSaved = true;
          }

          // (a) Seen: recupera capítulo real via findQuestionChapter
          if (prog.seen && typeof prog.seen === "object") {
            if (!seenByCert[certId]) seenByCert[certId] = {};
            for (const [qid, val] of Object.entries(prog.seen)) {
              if (seenByCert[certId][qid] === undefined) {
                const ch =
                  typeof val === "number" && val > 0
                    ? val
                    : findQuestionChapter(qid, Number(prog.attempts?.[qid]?.domain) || 1);
                seenByCert[certId][qid] = ch;
                changedSeen = true;
                summary.totalSeen++;
              }
            }
          }

          // (b) Attempts: lida tanto com 3.18 real ({ count, correct, lastCorrect, lastAt }) quanto variantes
          if (prog.attempts && typeof prog.attempts === "object") {
            if (!attemptsByCert[certId]) attemptsByCert[certId] = {};
            for (const [qid, att] of Object.entries(prog.attempts)) {
              if (!att) continue;
              if (!attemptsByCert[certId][qid]) {
                const ch = findQuestionChapter(
                  qid,
                  Number(att.ch) || Number(att.domain) || Number(seenByCert[certId]?.[qid]) || 1
                );
                const tries = Number(att.count) || Number(att.tries) || 1;
                const okCount =
                  typeof att.correct === "number"
                    ? att.correct
                    : att.lastCorrect || att.ok === true
                      ? 1
                      : 0;
                const lastOk =
                  att.lastCorrect !== undefined
                    ? Boolean(att.lastCorrect)
                    : typeof att.ok === "boolean"
                      ? att.ok
                      : okCount > 0;
                const lastDate =
                  att.lastAt || att.last || prog.lastStudyDate || new Date().toISOString();
                const at = new Date(lastDate).getTime() || Date.now();

                attemptsByCert[certId][qid] = {
                  ok: okCount,
                  tries,
                  last: lastOk,
                  at,
                  ch,
                };
                changedAttempts = true;
                summary.totalAttempts++;

                // Garante que seen contenha o capítulo correto
                if (!seenByCert[certId]) seenByCert[certId] = {};
                if (seenByCert[certId][qid] === undefined) {
                  seenByCert[certId][qid] = ch;
                  changedSeen = true;
                  summary.totalSeen++;
                }
              }
            }
          }

          // (c) History & Checkins
          if (Array.isArray(prog.history)) {
            if (!logByCert[certId]) logByCert[certId] = [];

            // 3.18 grava eventos individuais { date: "YYYY-MM-DD", correct: boolean }
            // Agrupa por data para montar sessões e check-ins consistentes
            const byDate: Record<string, { total: number; correct: number }> = {};
            for (const h of prog.history) {
              if (!h || !h.date) continue;
              if (typeof h.count === "number") {
                // Formato já agregado
                byDate[h.date] = byDate[h.date] || { total: 0, correct: 0 };
                byDate[h.date].total += h.count;
                byDate[h.date].correct += Number(h.correct) || 0;
              } else {
                // Formato individual da 3.18
                byDate[h.date] = byDate[h.date] || { total: 0, correct: 0 };
                byDate[h.date].total += 1;
                if (h.correct === true) byDate[h.date].correct += 1;
              }
            }

            for (const [date, counts] of Object.entries(byDate)) {
              if (counts.total > 0 && !checkinsSet.has(date)) {
                checkinsSet.add(date);
                changedCheckins = true;
                summary.totalCheckins++;
              }
              const at = new Date(date + "T12:00:00").getTime() || Date.now();
              const alreadyHasLog = logByCert[certId].some(
                (l) => Math.abs(l.at - at) < 86400000 && l.total === counts.total
              );
              if (!alreadyHasLog && counts.total > 0) {
                logByCert[certId].push({
                  at,
                  ch: 1,
                  total: counts.total,
                  correct: counts.correct,
                });
                changedLog = true;
              }
            }
          }
          if (prog.lastStudyDate && !checkinsSet.has(prog.lastStudyDate)) {
            checkinsSet.add(prog.lastStudyDate);
            changedCheckins = true;
            summary.totalCheckins++;
          }

          // (d) SRS Cards: preserva capítulo, intervalo e dueDate
          if (prog.srs && typeof prog.srs === "object") {
            if (!cardsByCert[certId]) cardsByCert[certId] = {};
            for (const [qid, card] of Object.entries(prog.srs)) {
              if (!card) continue;
              if (!cardsByCert[certId][qid]) {
                const ch = findQuestionChapter(
                  qid,
                  Number(card.ch) || Number(seenByCert[certId]?.[qid]) || 1
                );
                const due =
                  typeof card.due === "number"
                    ? card.due
                    : card.dueDate
                      ? new Date(card.dueDate + "T12:00:00").getTime()
                      : Date.now();
                const interval = Number(card.interval) || 0;
                const streak = Number(card.streak ?? card.repetitions ?? 0);
                const reviews = Number(
                  card.reviews ?? card.repetitions ?? (streak > 0 ? streak : 1)
                );
                cardsByCert[certId][qid] = {
                  due,
                  interval,
                  streak,
                  lapses: Number(card.lapses) || 0,
                  reviews,
                  at: typeof card.at === "number" ? card.at : Date.now(),
                  ch,
                  rating: card.rating || "good",
                };
                changedCards = true;
                summary.totalCards++;
              }
            }
          }

          // (e) SRS stats
          if (prog.srsStats && typeof prog.srsStats === "object") {
            if (!srsByCert[certId]) {
              srsByCert[certId] = {
                again: Number(prog.srsStats.again) || 0,
                hard: Number(prog.srsStats.hard) || 0,
                good: (Number(prog.srsStats.good) || 0) + (Number(prog.srsStats.easy) || 0),
              };
              changedSrs = true;
            }
          }

          // (f) Exam History: crucial incluir `n` para passar no sanitizeExams
          if (Array.isArray(prog.examHistory)) {
            if (!examsByCert[certId]) examsByCert[certId] = [];
            for (const ex of prog.examHistory) {
              if (!ex) continue;
              const at = ex.at
                ? Number(ex.at)
                : ex.date
                  ? new Date(ex.date.length === 10 ? ex.date + "T12:00:00" : ex.date).getTime()
                  : Date.now();
              const n = Number(ex.n || ex.total) || 40;
              const total = Number(ex.total || ex.n) || 40;
              const correct =
                typeof ex.correct === "number"
                  ? ex.correct
                  : Math.round(((Number(ex.pct) || 0) / 100) * n);
              const pct = typeof ex.pct === "number" ? ex.pct : Math.round((correct / n) * 100);
              const already = examsByCert[certId].some(
                (e) => Math.abs(e.at - at) < 60000 && e.n === n && e.pct === pct
              );
              if (!already) {
                examsByCert[certId].push({
                  at,
                  n,
                  total,
                  correct,
                  pct,
                  passed: Boolean(ex.passed),
                  custom: Boolean(ex.custom),
                  wrongIds: Array.isArray(ex.wrongIds) ? ex.wrongIds : [],
                  ...(ex.scoring ? { scoring: ex.scoring } : {}),
                  ...(ex.pointsTotal ? { pointsTotal: ex.pointsTotal } : {}),
                  ...(ex.points ? { points: ex.points } : {}),
                });
                changedExams = true;
                summary.totalExams++;
              }
            }
          }

          // (g) Questões salvas
          if (Array.isArray(prog.saved) && prog.saved.length > 0) {
            if (!savedByCert[certId]) savedByCert[certId] = [];
            const existingSet = new Set(savedByCert[certId]);
            for (const qid of prog.saved) {
              if (typeof qid === "string" && !existingSet.has(qid)) {
                savedByCert[certId].push(qid);
                existingSet.add(qid);
                changedSaved = true;
                summary.totalSaved++;
              }
            }
          }
        }
      }

      // (h) Draft de simulado (3.18 armazena em synapse.examDraft.v1.{cert} sem campo cert)
      const rawDraft = localStorage.getItem(`synapse.examDraft.v1.${certId}`);
      if (rawDraft) {
        try {
          const draftObj = JSON.parse(rawDraft);
          if (draftObj && Array.isArray(draftObj.questionIds) && draftObj.questionIds.length > 0) {
            const normalized = {
              cert: certId,
              questionIds: draftObj.questionIds,
              optOrder: Array.isArray(draftObj.optOrder) ? draftObj.optOrder : [],
              answers: Array.isArray(draftObj.answers) ? draftObj.answers : [],
              flags: Array.isArray(draftObj.flags)
                ? draftObj.flags
                : draftObj.questionIds.map(() => false),
              durations: Array.isArray(draftObj.durations)
                ? draftObj.durations
                : draftObj.questionIds.map(() => 0),
              idx: typeof draftObj.idx === "number" ? draftObj.idx : 0,
              timeLeft: typeof draftObj.timeLeft === "number" ? draftObj.timeLeft : 0,
              custom: Boolean(draftObj.custom),
              savedAt: typeof draftObj.savedAt === "number" ? draftObj.savedAt : Date.now(),
            };
            if (
              !localStorage.getItem("synapse.examdraft.v1") ||
              (opts?.overwrite && (!opts.targetCerts || opts.targetCerts.includes(certId)))
            ) {
              localStorage.setItem("synapse.examdraft.v1", JSON.stringify(normalized));
              summary.draftRestored = true;
            }
          }
        } catch {}
      }
    }

    // 3. Salva de volta o que mudou
    if (changedSeen) {
      localStorage.setItem("synapse.seen.v1", JSON.stringify(seenByCert));
    }
    if (changedAttempts) {
      localStorage.setItem("synapse.attempts.v1", JSON.stringify(attemptsByCert));
    }
    if (changedLog) {
      localStorage.setItem("synapse.log.v1", JSON.stringify(logByCert));
    }
    if (changedCards) {
      localStorage.setItem("synapse.cards.v1", JSON.stringify(cardsByCert));
    }
    if (changedSrs) {
      localStorage.setItem("synapse.srs.v1", JSON.stringify(srsByCert));
    }
    if (changedCheckins) {
      const sorted = Array.from(checkinsSet).sort().slice(-120);
      localStorage.setItem("synapse.checkins.v1", JSON.stringify(sorted));
    }
    if (changedExams) {
      localStorage.setItem("synapse.exams.v1", JSON.stringify(examsByCert));
    }
    if (changedSaved) {
      localStorage.setItem("synapse.saved.v1", JSON.stringify(savedByCert));
    }

    // 4. Migração de preferências
    // Onboarding
    const oldOnboarding =
      localStorage.getItem("synapse.onboardingDone") ||
      localStorage.getItem("synapse.onboarding.v1") ||
      localStorage.getItem("ctfl_onboarding_done");
    if (oldOnboarding === "true" || oldOnboarding === "1") {
      if (localStorage.getItem("synapse.onboarding.v2") !== "1") {
        localStorage.setItem("synapse.onboarding.v2", "1");
        summary.onboardingMarked = true;
      }
    }

    // Meta diária (synapse.goal)
    const existingGoal = localStorage.getItem("synapse.goal");
    if (!existingGoal) {
      localStorage.setItem("synapse.goal", "10");
    }

    // Idioma
    const oldLang = localStorage.getItem("synapse.lang") || localStorage.getItem("ctfl_lang");
    if (
      oldLang &&
      (oldLang === "pt" || oldLang === "en") &&
      !localStorage.getItem("synapse.lang.v1")
    ) {
      localStorage.setItem("synapse.lang.v1", oldLang);
    }

    // Tema
    const oldTheme = localStorage.getItem("synapse.theme") || localStorage.getItem("ctfl_theme");
    if (
      oldTheme &&
      (oldTheme === "dark" || oldTheme === "light") &&
      !localStorage.getItem("synapse.theme.v1")
    ) {
      localStorage.setItem("synapse.theme.v1", oldTheme);
    }

    // Lembrete diário
    const reminderEnabled = localStorage.getItem("synapse.reminderEnabled");
    const reminderTime = localStorage.getItem("synapse.reminderTime");
    if (reminderEnabled !== null || reminderTime !== null) {
      if (!localStorage.getItem("synapse.settings.v1")) {
        localStorage.setItem(
          "synapse.settings.v1",
          JSON.stringify({
            enabled: reminderEnabled === "true" || reminderEnabled === "1",
            time: reminderTime && /^\d{2}:\d{2}$/.test(reminderTime) ? reminderTime : "19:00",
          })
        );
      }
    }

    // Data da prova
    const oldExamDate = localStorage.getItem("synapse.examDate");
    if (oldExamDate && /^\d{4}-\d{2}-\d{2}$/.test(oldExamDate)) {
      const examMap = safeParse<Record<string, string>>(
        localStorage.getItem("synapse.examdate.v1"),
        {}
      );
      let changed = false;
      for (const cert of CERTS) {
        if (!examMap[cert]) {
          examMap[cert] = oldExamDate;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem("synapse.examdate.v1", JSON.stringify(examMap));
      }
    }

    // Última certificação usada
    const lastCert = localStorage.getItem("synapse.lastCert");
    if (lastCert && CERTS.includes(lastCert) && !localStorage.getItem("synapse.cert.v1")) {
      localStorage.setItem("synapse.cert.v1", lastCert);
    }

    localStorage.setItem("synapse.migrated.v1", "1");
  } catch (err) {
    console.warn("[migrate] Erro durante a migração idempotente:", err);
  }

  return summary;
}
