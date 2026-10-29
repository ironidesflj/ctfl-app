/* Synapse · migrate.ts
   Migração idempotente dos dados salvos no schema da versão Vite anterior
   (synapse.progress.v1.{cert}, ctfl_progress_v1, synapse.examDraft.v1.{cert})
   para o schema unificado v4.1 (synapse.*.v1).
   
   Garante que nenhum progresso de usuário existente seja perdido.
   Preserva chaves legadas intactas (nunca apaga as chaves antigas). */

export interface MigrationSummary {
  migratedCerts: string[];
  totalAttempts: number;
  totalSeen: number;
  totalCheckins: number;
  totalExams: number;
  totalCards: number;
  draftRestored: boolean;
  onboardingMarked: boolean;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return (JSON.parse(raw) as T) || fallback;
  } catch {
    return fallback;
  }
}

export function migrateViteProgressIfNeeded(): MigrationSummary {
  const summary: MigrationSummary = {
    migratedCerts: [],
    totalAttempts: 0,
    totalSeen: 0,
    totalCheckins: 0,
    totalExams: 0,
    totalCards: 0,
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
        Record<string, { ok: boolean; last: string; tries: number; at: number; ch: number }>
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
          total: number;
          correct: number;
          pct: number;
          passed: boolean;
          at: number;
          custom?: boolean;
          wrongIds?: string[];
        }>
      >
    >(localStorage.getItem("synapse.exams.v1"), {});

    let changedSeen = false;
    let changedAttempts = false;
    let changedLog = false;
    let changedCards = false;
    let changedSrs = false;
    let changedCheckins = false;
    let changedExams = false;

    // 2. Itera sobre as certificações
    for (const certId of CERTS) {
      let rawProg = localStorage.getItem(`synapse.progress.v1.${certId}`);
      if (!rawProg && certId === "ctfl") {
        rawProg = localStorage.getItem("ctfl_progress_v1");
      }

      if (!rawProg) continue;

      interface ViteProgress {
        schemaVersion?: number;
        total?: number;
        correct?: number;
        seen?: Record<string, boolean | number>;
        attempts?: Record<
          string,
          {
            ok?: boolean;
            last?: string;
            tries?: number;
            domain?: number;
            history?: boolean[];
            reps?: number;
            interval?: number;
            dueDate?: string;
          }
        >;
        history?: Array<{ date: string; count?: number; correct?: number }>;
        lastStudyDate?: string;
        srs?: Record<
          string,
          {
            interval?: number;
            repetitions?: number;
            easeFactor?: number;
            dueDate?: string;
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
          total?: number;
          correct?: number;
          pct?: number;
          passed?: boolean;
          custom?: boolean;
          wrongIds?: string[];
        }>;
      }

      const prog = safeParse<ViteProgress | null>(rawProg, null);
      if (!prog) continue;

      summary.migratedCerts.push(certId);

      // (a) Seen
      if (prog.seen && typeof prog.seen === "object") {
        if (!seenByCert[certId]) seenByCert[certId] = {};
        for (const [qid, val] of Object.entries(prog.seen)) {
          if (!seenByCert[certId][qid]) {
            const ch =
              typeof val === "number"
                ? val
                : prog.attempts?.[qid]?.domain
                  ? Number(prog.attempts[qid].domain)
                  : 1;
            seenByCert[certId][qid] = ch;
            changedSeen = true;
            summary.totalSeen++;
          }
        }
      }

      // (b) Attempts
      if (prog.attempts && typeof prog.attempts === "object") {
        if (!attemptsByCert[certId]) attemptsByCert[certId] = {};
        for (const [qid, att] of Object.entries(prog.attempts)) {
          if (!att) continue;
          if (!attemptsByCert[certId][qid]) {
            const last = att.last || new Date().toISOString();
            const at = new Date(last).getTime() || Date.now();
            const ch = Number(att.domain) || 1;
            attemptsByCert[certId][qid] = {
              ok: Boolean(att.ok),
              last,
              tries: Number(att.tries) || 1,
              at,
              ch,
            };
            changedAttempts = true;
            summary.totalAttempts++;
            // Garante que a questão também esteja em seen
            if (!seenByCert[certId]) seenByCert[certId] = {};
            if (!seenByCert[certId][qid]) {
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
        for (const h of prog.history) {
          if (h && h.date) {
            if ((h.count ?? 0) > 0 && !checkinsSet.has(h.date)) {
              checkinsSet.add(h.date);
              changedCheckins = true;
              summary.totalCheckins++;
            }
            const at = new Date(h.date).getTime() || Date.now();
            const alreadyHasLog = logByCert[certId].some(
              (l) => Math.abs(l.at - at) < 86400000 && l.total === (h.count || 0)
            );
            if (!alreadyHasLog && (h.count ?? 0) > 0) {
              logByCert[certId].push({
                at,
                ch: 1,
                total: Number(h.count) || 0,
                correct: Number(h.correct) || 0,
              });
              changedLog = true;
            }
          }
        }
      }
      if (prog.lastStudyDate && !checkinsSet.has(prog.lastStudyDate)) {
        checkinsSet.add(prog.lastStudyDate);
        changedCheckins = true;
        summary.totalCheckins++;
      }

      // (d) SRS Cards
      if (prog.srs && typeof prog.srs === "object") {
        if (!cardsByCert[certId]) cardsByCert[certId] = {};
        for (const [qid, card] of Object.entries(prog.srs)) {
          if (!card) continue;
          if (!cardsByCert[certId][qid]) {
            const due = card.dueDate ? new Date(card.dueDate).getTime() : Date.now();
            const interval = Number(card.interval) || 0;
            const streak = Number(card.repetitions) || 0;
            cardsByCert[certId][qid] = {
              due,
              interval,
              streak,
              lapses: 0,
              reviews: Number(card.repetitions) || 1,
              at: Date.now(),
              ch: 1,
              rating: "good",
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

      // (f) Exam History
      if (Array.isArray(prog.examHistory)) {
        if (!examsByCert[certId]) examsByCert[certId] = [];
        for (const ex of prog.examHistory) {
          if (!ex) continue;
          const at = ex.date ? new Date(ex.date).getTime() : Date.now();
          const total = Number(ex.total) || 40;
          const correct = Number(ex.correct) || 0;
          const pct = Number(ex.pct) || Math.round((correct / total) * 100);
          const already = examsByCert[certId].some(
            (e) => Math.abs(e.at - at) < 60000 && e.total === total && e.correct === correct
          );
          if (!already) {
            examsByCert[certId].push({
              total,
              correct,
              pct,
              passed: Boolean(ex.passed),
              at,
              custom: Boolean(ex.custom),
              wrongIds: Array.isArray(ex.wrongIds) ? ex.wrongIds : [],
            });
            changedExams = true;
            summary.totalExams++;
          }
        }
      }

      // (g) Draft de simulado
      const rawDraft = localStorage.getItem(`synapse.examDraft.v1.${certId}`);
      if (rawDraft && !localStorage.getItem("synapse.examdraft.v1")) {
        try {
          const draftObj = JSON.parse(rawDraft);
          if (draftObj && draftObj.cert && Array.isArray(draftObj.questionIds)) {
            localStorage.setItem("synapse.examdraft.v1", rawDraft);
            summary.draftRestored = true;
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

    // 4. Onboarding flag
    const oldOnboarding =
      localStorage.getItem("synapse.onboardingDone") ||
      localStorage.getItem("synapse.onboarding.v1");
    if (oldOnboarding === "true" || oldOnboarding === "1") {
      if (localStorage.getItem("synapse.onboarding.v2") !== "1") {
        localStorage.setItem("synapse.onboarding.v2", "1");
        summary.onboardingMarked = true;
      }
    }

    localStorage.setItem("synapse.migrated.v1", "1");
  } catch (err) {
    console.warn("[migrate] Erro durante a migração idempotente:", err);
  }

  return summary;
}
