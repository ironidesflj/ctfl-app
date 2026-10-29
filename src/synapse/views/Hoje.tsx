"use client";

/* ===========================================================
   Synapse · views/Hoje.tsx
   Aba Hoje — porta fiel de js/hoje.js. Check-in automático, três
   frentes do dia, atividade da semana, data da prova e última
   sessão. Nada aqui inventa número: tudo vem do estado local.
   =========================================================== */

import { useRef, useState } from "react";
import { daysAgo, dayKey, fmt, pad2, useSynapse } from "../store";
import { parseTimeHHMM } from "../reminder";
import { Gauge } from "./Gauge";

function weekday(date: Date, lang: "pt" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en", { weekday: "short" })
      .format(date)
      .replace(".", "")
      .slice(0, 3);
  } catch {
    return "";
  }
}

/* Lembrete diário (porta do r10 do v3.18.0): toggle + horário. A permissão
   só é pedida ao ligar; negada mostra o estado honesto em vez de fingir. */
function ReminderCard() {
  const ss = useSynapse();
  const { t } = ss;
  const settings = ss.state.settings;
  const [blocked, setBlocked] = useState(() => {
    try {
      return typeof Notification !== "undefined" && Notification.permission === "denied";
    } catch {
      return false;
    }
  });

  async function toggleReminder() {
    if (settings.enabled) {
      ss.setReminder(false);
      return;
    }
    if (typeof Notification === "undefined") {
      setBlocked(true);
      return;
    }
    if (Notification.permission === "granted") {
      ss.setReminder(true);
      return;
    }
    if (Notification.permission === "denied") {
      setBlocked(true);
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setBlocked(false);
        ss.setReminder(true);
      } else {
        setBlocked(true);
      }
    } catch {
      setBlocked(true);
    }
  }

  function changeTime(value: string) {
    /* input type=time entrega "HH:MM" completo a cada mudança; valor
       vazio/inválido simplesmente não persiste */
    if (parseTimeHHMM(value)) ss.setReminder(settings.enabled, value);
  }

  return (
    <div className="rem-box" data-od-id="hoje-lembrete">
      <span className="ck">{t("today.reminderTitle")}</span>
      <div className="rem-row">
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          className="rem-switch"
          data-on={settings.enabled ? "true" : "false"}
          onClick={toggleReminder}
        >
          <span className="rem-knob" aria-hidden="true" />
        </button>
        <p className="rem-status" data-on={settings.enabled ? "true" : "false"}>
          {settings.enabled
            ? fmt(t("today.reminderOn"), { time: settings.time })
            : t("today.reminderOff")}
        </p>
      </div>
      <div className="rem-time">
        <label htmlFor="remTime">{t("today.reminderTimeLabel")}</label>
        <input
          type="time"
          id="remTime"
          name="remTime"
          value={settings.time}
          aria-label={t("today.reminderTimeLabel")}
          onChange={(e) => changeTime(e.target.value)}
        />
      </div>
      {blocked ? (
        <p className="rem-blocked" role="alert">
          {t("today.reminderBlocked")}
        </p>
      ) : null}
      <p className="rem-note">{t("today.reminderDesc")}</p>
    </div>
  );
}

export function Hoje() {
  const ss = useSynapse();
  const { state, t } = ss;
  const lang = state.lang;
  const c = ss.cert();

  const [examValue, setExamValue] = useState<string>(ss.examDate());
  const [examError, setExamError] = useState("");
  const examInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------- estado vazio (prova sem banco) ---------- */

  if (c.status !== "live") {
    return (
      <>
        <section className="hero empty-hero">
          <div>
            <span className="kicker">
              <i aria-hidden="true" />
              {t("today.kicker")} · {c.code}
            </span>
            <h1>{t("study.emptyTitle")}</h1>
            <p className="lead">{t("study.emptyBody")}</p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={() => ss.setCert("ctfl")}>
                {t("study.emptyAction")}
              </button>
            </div>
          </div>
        </section>
        <ViewFoot label={t("today.footnote")} tail={`Synapse · ${t("nav.hoje")} · ${c.code}`} />
      </>
    );
  }

  /* ---------- prontidão ---------- */

  const r = ss.readiness();
  const readinessCopy =
    r.pct === null ? (
      <>
        <strong>{t("today.readinessNone")}</strong>
        <p>{t("today.readinessEmpty")}</p>
      </>
    ) : (
      <>
        <strong>
          {r.cutoff === null
            ? t("today.readinessNoCut")
            : r.pct >= r.cutoff
              ? fmt(t("today.readinessAbove"), { pct: r.cutoff })
              : fmt(t("today.readinessBelow"), { pct: r.cutoff })}
        </strong>
        <p>{fmt(t("today.readinessBase"), { n: r.attempted, correct: r.correct })}</p>
      </>
    );

  const readinessLabel =
    r.pct === null
      ? t("today.readinessNone")
      : t("today.readiness") +
        ": " +
        r.pct +
        "%" +
        (r.cutoff !== null ? ", " + fmt(t("today.readinessCut"), { pct: r.cutoff }) : "");

  /* ---------- tarefas ---------- */

  const next = ss.nextChapter(c);
  /* prova live sempre tem capítulos; guarda defensiva apenas para o tipo */
  if (!next) return null;
  const weakest = c.chapters.slice().sort((a, b) => ss.pctFor(a) - ss.pctFor(b))[0];
  const due = ss.dueCards().length;
  const studied = ss.todayAttempts(next.n);
  const goal = ss.state.goal;
  /* último simulado — alimenta a tarefa 04 */
  const examHist = ss.examHistory();
  const lastExam = examHist.length ? examHist[examHist.length - 1] : null;
  const reviews = ss.todayReviews();
  const reviewTotal = reviews + due;

  /* ---------- semana ---------- */

  const week = ss.weekActivity();
  const weekMax = week.reduce((m, d) => Math.max(m, d.count), 0);
  const weekTotal = week.reduce((sum, d) => sum + d.count, 0);

  /* ---------- check-in ---------- */

  const streak = ss.streak();
  const todayCount = ss.todayActivity();
  const checkinDays: React.ReactNode[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const key = dayKey(d.getTime());
    const on = ss.checkins().indexOf(key) !== -1;
    checkinDays.push(
      <span className="day" data-on={on} key={key}>
        <i aria-hidden="true" />
        <b>{weekday(d, lang)}</b>
      </span>
    );
  }

  /* ---------- data da prova ---------- */

  const days = ss.daysToExam();
  let examLabel = t("today.examNone");
  if (days !== null) {
    if (days < 0) examLabel = t("today.examPast");
    else if (days === 0) examLabel = t("today.examToday");
    else examLabel = fmt(t("today.examIn"), { n: days });
  }
  let examFormatted = "";
  const examRaw = ss.examDate();
  if (examRaw) {
    try {
      examFormatted = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(examRaw + "T12:00:00"));
    } catch {
      examFormatted = examRaw;
    }
  }

  /* ---------- última sessão ---------- */

  const last = ss.lastSession();
  let lastBody: React.ReactNode;
  if (!last) {
    lastBody = <p>{t("today.lastNone")}</p>;
  } else {
    const d = Math.floor((Date.now() - last.at) / 86400000);
    const when =
      d <= 0
        ? t("progress.when")
        : d === 1
          ? lang === "pt"
            ? "ontem"
            : "yesterday"
          : fmt(t("progress.whenDays"), { n: d });
    lastBody = (
      <>
        <strong>
          {fmt(t("progress.sessionRow"), {
            n: pad2(last.ch),
            correct: last.correct,
            total: last.total,
          })}
        </strong>
        <p>{when}</p>
      </>
    );
  }

  /* ---------- herói ---------- */

  const open = c.chapters.filter((ch) => ss.pctFor(ch) < 100).length;
  const lead = fmt(open === 1 ? t("today.leadOne") : open ? t("today.lead") : t("today.leadDone"), {
    n: open,
    code: c.code,
  });

  /* ---------- salvar data ---------- */

  function saveExam(e?: React.FormEvent) {
    e?.preventDefault();
    setExamError("");
    const value = examValue;
    if (value) {
      const picked = new Date(value + "T12:00:00");
      const today = daysAgo(0);
      if (isNaN(picked.getTime())) {
        setExamError(lang === "pt" ? "Data inválida." : "Invalid date.");
        window.setTimeout(() => examInputRef.current?.focus(), 0);
        return;
      }
      if (picked < today && dayKey(picked.getTime()) !== dayKey()) {
        setExamError(t("today.examPast") + ".");
        window.setTimeout(() => examInputRef.current?.focus(), 0);
        return;
      }
    }
    ss.setExamDate(value);
    ss.announce(value ? t("today.exam") + ": " + value : t("today.examNone"));
  }

  return (
    <>
      <section className="hero empty-hero" data-od-id="hoje-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("today.kicker")} · {c.code}
          </span>
          <h1 id="planTitle" tabIndex={-1}>
            {t("today.title")}
          </h1>
          <p className="lead">{lead}</p>
          <div className="actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => ss.goTab("estudar", { cap: next.n })}
            >
              {t("today.heroStart")}
            </button>
            <button type="button" className="btn secondary" onClick={() => ss.goTab("flashcards")}>
              {t("today.taskReview")}
            </button>
          </div>
        </div>
      </section>

      <div className="today-grid">
        <div className="today-main" data-od-id="hoje-dia">
          <div className="plan-head">
            <h2>{t("today.tasks")}</h2>
            <span>{t("today.tasksNote")}</span>
          </div>
          <div className="tasks" data-od-id="hoje-tarefas">
            <div className="task">
              <span className="task-no">01</span>
              <div className="task-body">
                <h3>{t("today.taskStudy")}</h3>
                <p>
                  {fmt(t("today.taskStudyBody"), {
                    n: pad2(next.n),
                    name: next.name[lang],
                  })}
                </p>
                <div className="task-meta">
                  <span>{fmt(t("today.taskStudyMeta"), { done: studied, goal })}</span>
                  <span className="task-bar" aria-hidden="true">
                    <i style={{ width: Math.min(100, Math.round((studied / goal) * 100)) + "%" }} />
                  </span>
                </div>
                <div className="goal-chips chip-row" role="group" aria-label={t("today.goalAria")}>
                  <span className="goal-label">{t("today.goalLabel")}</span>
                  {[5, 10, 20, 30].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={"chip goal-chip" + (n === goal ? " on" : "")}
                      aria-pressed={n === goal}
                      onClick={() => ss.setGoal(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn secondary sm"
                onClick={() => ss.goTab("estudar", { cap: next.n })}
              >
                {t("today.taskStart")}
              </button>
            </div>

            <div className="task">
              <span className="task-no">02</span>
              <div className="task-body">
                <h3>{t("today.taskCards")}</h3>
                <p>{due ? fmt(t("today.taskCardsBody"), { n: due }) : t("today.taskCardsNone")}</p>
                <div className="task-meta">
                  <span>{fmt(t("today.taskCardsMeta"), { done: reviews })}</span>
                  <span className="task-bar" aria-hidden="true">
                    <i
                      style={{
                        width: (reviewTotal ? Math.round((reviews / reviewTotal) * 100) : 0) + "%",
                      }}
                    />
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn secondary sm"
                onClick={() => ss.goTab("flashcards")}
              >
                {t("today.taskReview")}
              </button>
            </div>

            <div className="task">
              <span className="task-no">03</span>
              <div className="task-body">
                <h3>{t("today.taskGap")}</h3>
                <p>
                  {fmt(t("today.taskGapBody"), {
                    n: pad2(weakest.n),
                    name: weakest.name[lang],
                    pct: ss.pctFor(weakest),
                  })}
                </p>
                <div className="task-meta">
                  <span>
                    {fmt(t("today.taskGapMeta"), {
                      seen: ss.seenFor(weakest),
                      total: weakest.total,
                    })}
                  </span>
                  <span className="task-bar" aria-hidden="true">
                    <i style={{ width: ss.pctFor(weakest) + "%" }} />
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn secondary sm"
                onClick={() => ss.goTab("estudar", { cap: weakest.n })}
              >
                {t("today.taskFix")}
              </button>
            </div>

            <div className="task" data-od-id="hoje-simulado">
              <span className="task-no">04</span>
              <div className="task-body">
                <h3>{t("today.taskExam")}</h3>
                <p>
                  {c.exam
                    ? fmt(t("today.taskExamBody"), {
                        n: c.exam.q,
                        min: c.exam.min,
                      })
                    : t("today.taskExamBodyCustom")}
                </p>
                <div className="task-meta">
                  <span>
                    {lastExam
                      ? fmt(t("today.taskExamMeta"), {
                          pct: lastExam.pct,
                          verdict: lastExam.passed
                            ? ss.t("progress.examPassed")
                            : ss.t("progress.examFailed"),
                        })
                      : t("today.taskExamMetaNone")}
                  </span>
                  <span className="task-bar" aria-hidden="true">
                    <i style={{ width: lastExam ? Math.min(100, lastExam.pct) + "%" : "0%" }} />
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn secondary sm"
                onClick={() => ss.goTab("simulado")}
              >
                {t("today.taskExamStart")}
              </button>
            </div>
          </div>

          <div className="week-box" data-od-id="hoje-semana">
            <div className="plan-head">
              <h2>{t("today.week")}</h2>
              <span>{t("today.weekUnit")}</span>
            </div>
            {!weekTotal ? (
              <div className="week-empty">
                <p>{t("today.weekEmpty")}</p>
                <button type="button" className="btn ghost" onClick={() => ss.goTab("estudar")}>
                  {t("today.taskStart")}
                </button>
              </div>
            ) : (
              <>
                <div className="week" role="img" aria-label={t("today.week")}>
                  {week.map((d) => {
                    const h = weekMax ? Math.max(2, Math.round((d.count / weekMax) * 100)) : 0;
                    return (
                      <span className="week-day" data-empty={d.count === 0} key={d.key}>
                        <span className="week-col">
                          <i style={{ height: h + "%" }} />
                        </span>
                        <b>{weekday(d.date, lang)}</b>
                      </span>
                    );
                  })}
                </div>
                <p className="week-note">
                  {weekTotal ? `${weekTotal} ${t("today.weekUnit")}` : t("today.weekEmpty")}
                </p>
              </>
            )}
          </div>
        </div>

        <aside className="today-aside" data-od-id="hoje-constancia">
          <div className="rd-mini" data-od-id="hoje-prontidao">
            <div className="rd-mini-head">
              <span className="ck">{t("today.readiness")}</span>
              <span className="rd-sub">{t("today.readinessSub")}</span>
            </div>
            <div className="rd-mini-row">
              <Gauge pct={r.pct} cutoff={r.cutoff} size={96} label={readinessLabel} />
              <div className="rd-mini-copy">
                {readinessCopy}
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => ss.goTab("progresso")}
                >
                  {t("today.readinessSee")}
                </button>
              </div>
            </div>
          </div>

          <div className="checkin" data-od-id="hoje-checkin">
            <span className="ck">{t("today.streak")}</span>
            <div className="streak">
              <span className="n">{streak}</span>
              <span className="u">{t("today.streakUnit")}</span>
            </div>
            <div className="days">{checkinDays}</div>
            <p className="checkin-auto">
              <b>
                {todayCount ? fmt(t("today.todayCount"), { n: todayCount }) : t("today.todayNone")}
              </b>
              <span>{t("today.checkNote")}</span>
            </p>
          </div>

          <div className="exam-box" data-od-id="hoje-prova">
            <span className="ck">{t("today.exam")}</span>
            <div className="exam-count">
              {examLabel}
              {examFormatted ? <small>{examFormatted}</small> : null}
            </div>
            <form className="exam-form" noValidate onSubmit={saveExam}>
              <label className="sr-only" htmlFor="examDate">
                {t("today.examLabel")}
              </label>
              <input
                type="date"
                id="examDate"
                name="examDate"
                ref={examInputRef}
                value={examValue}
                aria-label={t("today.examLabel")}
                onChange={(e) => {
                  setExamValue(e.target.value);
                  setExamError("");
                }}
              />
              <button type="submit" className="btn secondary sm">
                {t("today.examSave")}
              </button>
            </form>
            {examError ? (
              <p className="exam-error" role="alert">
                {examError}
              </p>
            ) : null}
            <p className="exam-note">{t("today.examNote")}</p>
          </div>

          <ReminderCard />

          <div className="last-session" data-od-id="hoje-ultima">
            <span className="ck">{t("today.last")}</span>
            {lastBody}
          </div>
        </aside>
      </div>

      <ViewFoot label={t("today.footnote")} tail={`Synapse · ${t("nav.hoje")} · ${c.code}`} />
    </>
  );
}

/** Rodapé padrão das views — assinatura by Noos uma vez por tela
    (link para o hub; o violeta da marca permanece na assinatura). */
export function ViewFoot({ label, tail }: { label: string; tail: string }) {
  const { links } = useSynapse();
  return (
    <p className="view-foot">
      <span>{label}</span>
      <span>
        <a className="foot-endorse" href={links.noos} target="_blank" rel="noopener noreferrer">
          by Noos
        </a>
        {tail}
      </span>
    </p>
  );
}
