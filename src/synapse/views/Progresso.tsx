"use client";

/* ===========================================================
   Synapse · views/Progresso.tsx
   Aba Progresso — porta fiel de js/progresso.js. Prontidão
   ponderada, atividade de 12 semanas, alcance × precisão,
   K-level, revisão espaçada, cobertura por capítulo e
   histórico. Nada aqui inventa número: tudo vem do estado
   local — sem dado, a tela mostra “—” ou frase honesta.
   =========================================================== */

import { useEffect, useState } from "react";
import { dayKey, fmt, pad2, useSynapse } from "../store";
import type { ActivityDay } from "../store";
import type { AchievementMeta, Chapter } from "../types";
import { Gauge } from "./Gauge";
import { ViewFoot } from "./Hoje";

/* Fase 2: metadados das conquistas (nomes + descrições) — porta do
   ACHIEVEMENTS do Stats.jsx v3.18.0 */
const ACHIEVEMENTS: Record<string, AchievementMeta> = {
  "first-step": {
    id: "first-step",
    icon: "🎯",
    pt: "Primeiro passo",
    en: "First step",
    ptDesc: "Respondeu sua primeira questão",
    enDesc: "Answered your first question",
  },
  "streak-7": {
    id: "streak-7",
    icon: "🔥",
    pt: "7 dias",
    en: "7 days",
    ptDesc: "Estudou 7 dias seguidos",
    enDesc: "Studied 7 consecutive days",
  },
  "streak-30": {
    id: "streak-30",
    icon: "💎",
    pt: "30 dias",
    en: "30 days",
    ptDesc: "Estudou 30 dias seguidos",
    enDesc: "Studied 30 consecutive days",
  },
  "passed-exam": {
    id: "passed-exam",
    icon: "✅",
    pt: "Aprovado",
    en: "Passed",
    ptDesc: "Passou em um simulado",
    enDesc: "Passed an exam simulation",
  },
  "custom-exam": {
    id: "custom-exam",
    icon: "🧩",
    pt: "Sob medida",
    en: "Custom-made",
    ptDesc: "Completou um simulado personalizado",
    enDesc: "Completed a custom exam",
  },
  "chapter-complete": {
    id: "chapter-complete",
    icon: "📚",
    pt: "Capítulo completo",
    en: "Chapter complete",
    ptDesc: "Completou a cobertura de um capítulo inteiro",
    enDesc: "Completed coverage of an entire chapter",
  },
  "bank-complete": {
    id: "bank-complete",
    icon: "🏆",
    pt: "Banco completo",
    en: "Bank complete",
    ptDesc: "Completou a cobertura de todo o banco de questões do cert",
    enDesc: "Completed coverage of the entire cert's question bank",
  },
  "srs-100": {
    id: "srs-100",
    icon: "🃏",
    pt: "100 revisões",
    en: "100 reviews",
    ptDesc: "Fez 100 revisões espaçadas (Flashcards)",
    enDesc: "Completed 100 spaced-repetition reviews (Flashcards)",
  },
  "srs-master": {
    id: "srs-master",
    icon: "🧠",
    pt: "Memória de longo prazo",
    en: "Long-term memory",
    ptDesc: "10 itens com revisão agendada a 21+ dias",
    enDesc: "10 items scheduled 21+ days ahead",
  },
};

/* Rótulos curtos do radar — nomes completos PT/EN → curto (progresso.js) */
const RADAR_SHORT: Record<string, string> = {
  Fundamentos: "Fundamentos",
  Fundamentals: "Fundamentals",
  "Teste no Ciclo": "Ciclo",
  "Testing in the Lifecycle": "Lifecycle",
  "Teste Estático": "Estático",
  "Static Testing": "Static",
  "Técnicas de Teste": "Técnicas",
  "Test Techniques": "Techniques",
  "Gerenc. de Teste": "Gerenc.",
  "Test Management": "Management",
  Ferramentas: "Ferramentas",
  Tools: "Tools",
  "Tarefas no Processo de Teste": "Tarefas",
  "Test Process Tasks": "Tasks",
  "Teste Baseado em Risco": "Risco",
  "Risk-Based Testing": "Risk",
  "Análise e Design": "Análise",
  "Test Analysis & Design": "Analysis",
  Qualidade: "Qualidade",
  "Quality Characteristics": "Quality",
  "Prevenção de Defeitos": "Prevenção",
  "Defect Prevention": "Prevention",
  "Atividades de Teste": "Atividades",
  "Test Activities": "Activities",
  "O Produto": "Produto",
  "The Product": "Product",
  "O Time de Teste": "Time",
  "The Test Team": "Team",
};

function fmtDate(date: Date, lang: "pt" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en", { day: "2-digit", month: "short" })
      .format(date)
      .replace(".", "");
  } catch {
    return "";
  }
}

function monthLabel(date: Date, lang: "pt" | "en"): string {
  try {
    return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en", { month: "short" })
      .format(date)
      .replace(".", "");
  } catch {
    return "";
  }
}

function levelOf(count: number): number {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function Progresso() {
  const ss = useSynapse();
  const { state } = ss;
  const lang = state.lang;
  const c = ss.cert();
  const t = (key: string): string => ss.t("progress." + key);

  /* dia selecionado do heatmap — estado local; remount zera (como o reset do protótipo) */
  const [selectedDay, setSelectedDay] = useState<string>(() => dayKey());
  /* painel “Entendendo suas métricas” — fechado por padrão */
  const [metricsOpen, setMetricsOpen] = useState(false);

  /* conta tentativas E cartões do dia (chave YYYY-MM-DD) */
  function dayCounts(key: string) {
    let a = 0;
    let r = 0;
    const attempts = state.attempts[state.cert] || {};
    Object.keys(attempts).forEach((qid) => {
      if (dayKey(attempts[qid].at) === key) a += 1;
    });
    const cards = state.cards[state.cert] || {};
    Object.keys(cards).forEach((qid) => {
      if (cards[qid].at && dayKey(cards[qid].at) === key) r += 1;
    });
    return { attempts: a, reviews: r, total: a + r };
  }

  function relative(ts: number): string {
    const days = Math.floor((Date.now() - ts) / 86400000);
    if (days <= 0) return t("when");
    if (days === 1) return t("whenYesterday");
    return fmt(t("whenDays"), { n: days });
  }

  function radarLabel(ch: Chapter): string {
    const name = ch.name[lang];
    return RADAR_SHORT[name] || name;
  }

  /* ---------- teclado do heatmap: setas ±7/±1, Home/End, Enter/Espaço ---------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const node = e.target instanceof Element ? e.target : null;
      const cell = node ? node.closest(".hm-cell[data-key]") : null;
      if (!cell) return;
      const cells = Array.from(document.querySelectorAll<HTMLElement>(".hm-cell[data-key]"));
      const idx = cells.indexOf(cell as HTMLElement);
      if (idx === -1) return;
      let next: number | null = null;
      if (e.key === "ArrowLeft") next = idx - 7;
      else if (e.key === "ArrowRight") next = idx + 7;
      else if (e.key === "ArrowUp") next = idx - 1;
      else if (e.key === "ArrowDown") next = idx + 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = cells.length - 1;
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedDay(cell.getAttribute("data-key") || "");
        return;
      }
      if (next === null) return;
      e.preventDefault();
      next = Math.max(0, Math.min(cells.length - 1, next));
      const target = cells[next];
      setSelectedDay(target.getAttribute("data-key") || "");
      target.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- estado vazio (prova sem banco) ---------- */

  if (c.status !== "live") {
    return (
      <section className="hero empty-hero">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("kicker")} · {c.code}
          </span>
          <h1>{ss.t("study.emptyTitle")}</h1>
          <p className="lead">{ss.t("study.emptyBody")}</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => ss.goTab("certs")}>
              {ss.t("cert.choose")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- prontidão ---------- */

  const r = ss.readiness();
  const cov = ss.coverage(c);
  const acc = ss.accuracy();
  const verdict =
    r.pct === null
      ? t("readinessNone")
      : r.cutoff === null
        ? t("readinessNoCut")
        : fmt(r.pct >= r.cutoff ? t("readinessAbove") : t("readinessBelow"), { pct: r.cutoff });
  const base =
    r.pct === null
      ? t("readinessEmpty")
      : fmt(t("readinessBase"), { n: r.attempted, correct: r.correct });
  const gaugeLabel =
    r.pct === null
      ? t("readinessEmpty")
      : t("readiness") +
        ": " +
        r.pct +
        "%" +
        (r.cutoff !== null && r.cutoff !== undefined
          ? ", " + fmt(t("readinessCut"), { pct: r.cutoff })
          : "");

  /* ---------- atividade (12 semanas) ---------- */

  const days = ss.activity(12);
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const todayKey = dayKey();
  const total = days.reduce((sum, d) => sum + d.count, 0);
  let selected = days.find((d) => d.key === selectedDay && !d.future);
  if (!selected) selected = days.filter((d) => !d.future).pop() || days[0];
  const selectedCounts = dayCounts(selected.key);
  const yNames = lang === "pt" ? ["seg", "", "qua", "", "sex", "", ""] : ["Mon", "", "Wed", "", "Fri", "", ""];

  const months = weeks.map((week, wi) => {
    const prev = wi > 0 ? weeks[wi - 1][0].date.getMonth() : -1;
    const m = week[0].date.getMonth();
    return <span key={wi}>{m !== prev ? monthLabel(week[0].date, lang) : ""}</span>;
  });

  const cells = days.map((d) => {
    const lvl = levelOf(d.count);
    const date = fmtDate(d.date, lang);
    if (d.future) {
      return (
        <span key={d.key} className="hm-cell" data-level="0" data-future="true" aria-hidden="true" />
      );
    }
    const on = d.key === selected.key;
    return (
      <button
        key={d.key}
        type="button"
        className="hm-cell"
        data-level={lvl}
        data-key={d.key}
        aria-label={fmt(t("activityDay"), { date, n: d.count })}
        aria-current={on ? "date" : undefined}
        tabIndex={on ? 0 : -1}
        onClick={() => setSelectedDay(d.key)}
      />
    );
  });

  const detail = selected.future
    ? ""
    : fmt(t("activityDetail"), {
        date: fmtDate(selected.date, lang),
        a: selectedCounts.attempts,
        r: selectedCounts.reviews,
      });

  /* ---------- radar: alcance × precisão ---------- */

  const size = 440;
  const cx = 220;
  const cy = 186;
  const radius = 122;
  const n = c.chapters.length;
  const reach: number[] = [];
  const precision: number[] = [];
  const a11yReach: string[] = [];
  const a11yPrecision: string[] = [];
  let hasPrecision = false;
  c.chapters.forEach((ch) => {
    const rv = ss.pctFor(ch) / 100;
    const p = ss.attemptsFor(ch.n).pct;
    reach.push(rv);
    precision.push(p === null ? 0 : p / 100);
    if (p !== null) hasPrecision = true;
    a11yReach.push(ch.name[lang] + " " + Math.round(rv * 100) + "%");
    a11yPrecision.push(ch.name[lang] + " " + (p === null ? t("kNone") : p + "%"));
  });

  function point(index: number, value: number): [number, number] {
    const angle = ((-90 + (360 / n) * index) * Math.PI) / 180;
    return [cx + Math.cos(angle) * radius * value, cy + Math.sin(angle) * radius * value];
  }
  function poly(values: number[]): string {
    return values.map((v, i) => point(i, v).join(",")).join(" ");
  }

  const rings = [0.25, 0.5, 0.75, 1].map((v) => (
    <polygon key={v} points={poly([v, v, v, v, v, v].slice(0, n))} className="rd-ring" />
  ));
  const axes = c.chapters.map((ch, i) => {
    const p = point(i, 1);
    return <line key={ch.n} x1={cx} y1={cy} x2={p[0].toFixed(2)} y2={p[1].toFixed(2)} className="rd-axis" />;
  });
  const labelNodes = c.chapters.map((ch, i) => {
    const p = point(i, 1.16);
    const anchor = p[0] > cx + 8 ? "start" : p[0] < cx - 8 ? "end" : "middle";
    const dy = p[1] < cy - 20 ? "-.4em" : p[1] > cy + 20 ? "1em" : ".35em";
    return (
      <text key={ch.n} x={p[0].toFixed(2)} y={p[1].toFixed(2)} textAnchor={anchor} dy={dy}>
        {radarLabel(ch)}
      </text>
    );
  });
  const precisionDots = hasPrecision
    ? c.chapters.map((ch, i) => {
        const p = ss.attemptsFor(ch.n).pct;
        if (p === null) return null;
        const xy = point(i, p / 100);
        return <circle key={ch.n} cx={xy[0].toFixed(2)} cy={xy[1].toFixed(2)} r="2.6" className="rd-dot" />;
      })
    : null;
  const radarA11y = fmt(t("reachA11y"), {
    reach: a11yReach.join("; "),
    precision: a11yPrecision.join("; "),
  });

  /* ---------- K-level ---------- */

  const kRows = ss.kLevels();

  /* ---------- revisão espaçada ---------- */

  const srs = ss.cardStats();
  const retained = srs.retention === null ? "—" : srs.retention + "%";

  /* ---------- cobertura por capítulo ---------- */

  const chapterRows = c.chapters.map((ch) => {
    const pct = ss.pctFor(ch);
    const a = ss.attemptsFor(ch.n);
    return (
      <div className="pr-row" key={ch.n}>
        <span className="pn">
          {ch.name[lang]}
          <span>
            {pad2(ch.n)} · {ss.seenFor(ch)}/{ch.total}
          </span>
        </span>
        <span className="bar" aria-hidden="true">
          <i style={{ width: pct + "%" }} />
        </span>
        <span className="pr-cell">{pct}%</span>
        {a.pct === null ? (
          <span className="pr-cell acc" data-none="true">
            —
          </span>
        ) : (
          <span className="pr-cell acc" data-low={a.pct < 65 ? "true" : "false"}>
            {a.pct}%
          </span>
        )}
      </div>
    );
  });

  /* ---------- histórico ---------- */

  const logList = state.log[c.id] || [];
  const logBody = logList.length ? (
    <ul className="pr-log" data-od-id="progresso-historico">
      {logList.slice(0, 8).map((entry, i) => (
        <li key={i}>
          <span className="ln">
            {fmt(t("sessionRow"), { n: pad2(entry.ch), correct: entry.correct, total: entry.total })}
          </span>
          <span className="ld">
            <b>{Math.round((entry.correct / Math.max(1, entry.total)) * 100)}%</b> · {relative(entry.at)}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <div className="pr-blank" data-od-id="progresso-vazio">
      <p>
        <strong>{t("historyNone")}</strong>
        <br />
        {t("historyBody")}
      </p>
      <button type="button" className="btn primary sm" onClick={() => ss.goTab("estudar")}>
        {t("go")}
      </button>
    </div>
  );

  /* ---------- pontos de atenção ---------- */

  const weakRows = c.chapters
    .map((ch) => ({ ch, cov: ss.pctFor(ch), acc: ss.attemptsFor(ch.n).pct }))
    .filter((row) => row.cov < 60 || (row.acc !== null && row.acc < 65))
    .sort((a, b) => a.cov - b.cov)
    .slice(0, 4);

  const weakBody = weakRows.length ? (
    <>
      <ul className="pr-weak">
        {weakRows.map((row) => (
          <li key={row.ch.n}>
            <span className="wn">{row.ch.name[lang]}</span>
            <span className="wm">
              {row.acc === null
                ? fmt(t("weakMetaNoAcc"), { cov: row.cov })
                : fmt(t("weakMeta"), { cov: row.cov, acc: row.acc })}
            </span>
          </li>
        ))}
      </ul>
      <p className="pr-note">{t("accuracyNote")}</p>
    </>
  ) : (
    <p className="pr-note">{t("weakNone")}</p>
  );

  /* ---------- gamificação + conquistas (porta do Stats v3.18.0) ---------- */

  const streakDays = ss.streak();
  /* nível: questões únicas com último resultado correto / 20 */
  const attemptsByCert = state.attempts[state.cert] || {};
  const uniqueCorrect = Object.keys(attemptsByCert).filter((qid) => {
    const a = attemptsByCert[qid];
    return a.last === undefined ? a.ok > 0 : !!a.last;
  }).length;
  const level = Math.floor(uniqueCorrect / 20) + 1;
  const hasActivity = Object.keys(attemptsByCert).length > 0;

  const unlocked = ss.achievements();
  const roadmap = ss.achievementRoadmap();
  const strip =
    hasActivity && (streakDays >= 2 || unlocked.length > 0)
      ? [
          ...(streakDays >= 2
            ? ["🔥 " + streakDays + " " + t("stripDays")]
            : []),
          t("stripLevel") + " " + level,
          unlocked.length + "/" + Object.keys(ACHIEVEMENTS).length + " " + t("achievementsLabel"),
        ]
      : [];

  /* ---------- histórico de simulados ---------- */

  const examHist = ss.examHistory();
  const examHistBody = examHist.length ? (
    <ul className="pr-log pr-exams">
      {examHist
        .slice()
        .reverse()
        .slice(0, 6)
        .map((e, i) => (
          <li key={i}>
            <span className="ln">
              <b className={e.passed ? "ok" : "no"}>{e.pct}%</b>
              {e.custom ? (
                <em className="ex-tag">🧩 {t("examRowCustom")}</em>
              ) : (
                <em className="ex-tag">
                  {e.n}
                  {e.scoring === "points" && typeof e.points === "number"
                    ? " · " + fmt(t("examRowPoints"), { pts: e.points })
                    : ""}
                </em>
              )}
            </span>
            <span className="ld">
              {e.passed ? t("examPassed") : t("examFailed")} · {relative(e.at)}
            </span>
          </li>
        ))}
    </ul>
  ) : (
    <div className="pr-blank">
      <p>
        <strong>{fmt(t("examNone"), { pass: c.exam ? c.exam.pass : "—" })}</strong>
      </p>
      <button type="button" className="btn primary sm" onClick={() => ss.goTab("simulado")}>
        {ss.t("today.taskExamStart")}
      </button>
    </div>
  );

  /* ---------- render ---------- */

  return (
    <>
      <section className="hero empty-hero" data-od-id="progresso-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("kicker")} · {c.code}
          </span>
          <h1>{t("title")}</h1>
          <p className="lead">{t("lead")}</p>
        </div>
      </section>

      <div className="pr-board" data-od-id="progresso-metricas">
        <section className="rd-panel" aria-labelledby="rdTitle">
          <div className="rd-head">
            <span className="ck">{t("readiness")}</span>
            <span className="ck sub">{t("readinessSub")}</span>
          </div>
          <div className="rd-main">
            <Gauge pct={r.pct} cutoff={r.cutoff} size={172} label={gaugeLabel} />
            <div className="rd-copy">
              <h2 className="sr-only" id="rdTitle">
                {t("readiness")}
              </h2>
              <p className="rd-verdict">{verdict}</p>
              <p className="rd-base">{base}</p>
              <p className="rd-note">{t("readinessNote")}</p>
              <button type="button" className="btn secondary sm" onClick={() => ss.goTab("estudar")}>
                {ss.t("study.action")}
              </button>
            </div>
          </div>
        </section>
        <div className="pr-figures">
          <div className="pr-figure">
            <span className="mk">{t("coverage")}</span>
            <div className="mv">
              {cov.pct}
              <small>%</small>
            </div>
            <div
              className="meter"
              role="progressbar"
              aria-label={t("coverage")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={cov.pct}
            >
              <i style={{ width: cov.pct + "%" }} />
            </div>
            <p className="mn">{fmt(ss.t("study.coverageOf"), { seen: cov.seen, total: cov.total })}</p>
          </div>
          <div className="pr-figure acc">
            <span className="mk">{t("accuracy")}</span>
            <div className="mv">
              {acc.pct === null ? "—" : acc.pct}
              {acc.pct !== null && <small>%</small>}
            </div>
            <div
              className="meter"
              role="progressbar"
              aria-label={t("accuracy")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={acc.pct || 0}
            >
              <i style={{ width: (acc.pct || 0) + "%" }} />
            </div>
            <p className="mn">{acc.pct === null ? t("accuracyNone") : fmt(t("attempts"), { n: acc.tries })}</p>
          </div>
        </div>
      </div>

      {/* ---------- gamificação + conquistas ---------- */}
      {hasActivity && strip.length > 0 && (
        <div className="pg-gami" data-od-id="progresso-gamificacao">
          <p className="gami-strip">
            {strip.map((item, i) => (
              <span key={i}>
                {i > 0 && (
                  <span className="gami-sep" aria-hidden="true">
                    ·
                  </span>
                )}
                {item}
              </span>
            ))}
          </p>
          {unlocked.length > 0 && (
            <div className="gami-chips">
              {unlocked.map((id) => {
                const a = ACHIEVEMENTS[id];
                if (!a) return null;
                const name = lang === "pt" ? a.pt : a.en;
                const desc = lang === "pt" ? a.ptDesc : a.enDesc;
                return (
                  <span key={id} className="gami-chip" title={desc}>
                    <span aria-hidden="true">{a.icon}</span> {name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {hasActivity && roadmap.length > 0 && (
        <section className="pg-block pg-roadmap" data-od-id="progresso-conquistas" aria-labelledby="achTitle">
          <div className="pg-head">
            <h2 id="achTitle">{t("roadmapTitle")}</h2>
            <span>{t("roadmapHint")}</span>
          </div>
          <ul className="ach-roadmap">
            {roadmap.map((row, i) => {
              const a = ACHIEVEMENTS[row.id];
              if (!a) return null;
              const name = lang === "pt" ? a.pt : a.en;
              const desc = lang === "pt" ? a.ptDesc : a.enDesc;
              const label =
                row.unit === "pct"
                  ? fmt(t("roadmapPct"), { current: row.current, target: row.target })
                  : fmt(t("roadmapCount"), { current: row.current, target: row.target });
              return (
                <li key={row.id} className={"ach-row" + (i === 0 && row.pct > 0 ? " closest" : "")}>
                  <span className="ach-icon" aria-hidden="true">
                    {a.icon}
                  </span>
                  <div className="ach-body">
                    <div className="ach-top">
                      <span className="ach-name">{name}</span>
                      {i === 0 && row.pct > 0 && <span className="ach-almost">{t("roadmapAlmost")}</span>}
                      <span className="ach-count" aria-hidden="true">
                        {label}
                      </span>
                    </div>
                    <div
                      className="ach-bar"
                      role="progressbar"
                      aria-label={name + " — " + label}
                      aria-valuenow={row.current}
                      aria-valuemin={0}
                      aria-valuemax={row.target}
                    >
                      <i style={{ width: Math.max(row.current > 0 ? 2 : 0, row.pct) + "%" }} />
                    </div>
                    <span className="ach-desc">{desc}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="pg-block" data-od-id="progresso-atividade" aria-labelledby="atTitle">
        <div className="pg-head">
          <h2 id="atTitle">{t("activity")}</h2>
          <span>{t("activityRange")}</span>
        </div>
        <div className="hm">
          <div className="hm-months" aria-hidden="true">
            {months}
          </div>
          <div className="hm-body">
            <div className="hm-ylabels" aria-hidden="true">
              {yNames.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
            <div className="hm-weeks" role="group" aria-label={t("activity")}>
              {cells}
            </div>
          </div>
          <div className="hm-foot">
            <p className="hm-detail" id="hmDetail" aria-live="polite">
              {detail || t("activityEmpty")}
            </p>
            <div className="hm-legend" aria-hidden="true">
              <span>{t("activityLess")}</span>
              <i data-level="0" />
              <i data-level="1" />
              <i data-level="2" />
              <i data-level="3" />
              <i data-level="4" />
              <span>{t("activityMore")}</span>
              <b>{fmt(t("activityToday"), { n: dayCounts(todayKey).total })}</b>
            </div>
          </div>
          <p className="hm-hint">{total ? t("activityHint") : t("activityEmpty")}</p>
        </div>
      </section>

      <div className="pg-pair">
        <section className="pg-block pg-radar" data-od-id="progresso-radar" aria-labelledby="rdRadar">
          <div className="pg-head">
            <h2 id="rdRadar">{t("reachTitle")}</h2>
            <span>{t("reachSub")}</span>
          </div>
          <div className="rd-svg" role="img" aria-label={radarA11y}>
            <svg viewBox={`0 0 ${size} ${cy + radius + 62}`} aria-hidden="true">
              {rings}
              {axes}
              <polygon points={poly(reach)} className="rd-reach" />
              {hasPrecision && <polygon points={poly(precision)} className="rd-precision" />}
              {precisionDots}
              {labelNodes}
            </svg>
          </div>
          <div className="rd-legend">
            <span className="lg-reach">
              <i />
              {t("reach")}
            </span>
            <span className="lg-precision">
              <i />
              {t("precision")}
            </span>
          </div>
          <p className="pg-note">{hasPrecision ? t("reachNote") : t("reachNone")}</p>
        </section>
        <div className="pg-col">
          {kRows.length ? (
            <section className="pg-block pg-k" data-od-id="progresso-klevel" aria-labelledby="kTitle">
              <div className="pg-head">
                <h2 id="kTitle">{t("kTitle")}</h2>
                <span>{t("kSub")}</span>
              </div>
              <div className="k-rows">
                {kRows.map((g) => (
                  <div className="k-row" key={g.k}>
                    <span className="k-tag">K{g.k}</span>
                    <span className="k-count">{fmt(t("kCorrect"), { n: g.correct, total: g.total })}</span>
                    <span className="k-pct">{g.pct === null ? "—" : fmt(t("kPct"), { pct: g.pct })}</span>
                    <span className="k-bar" aria-hidden="true">
                      <i style={{ width: (g.pct === null ? 0 : g.pct) + "%" }} />
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section className="pg-block pg-srs" data-od-id="progresso-srs" aria-labelledby="srsTitle">
            <div className="pg-head">
              <h2 id="srsTitle">{t("srsTitle")}</h2>
              <span>{t("srsSub")}</span>
            </div>
            <div className="srs-stats">
              <div className="srs-stat">
                <b>
                  {srs.started}
                  <small>/{srs.total}</small>
                </b>
                <span>{t("srsStarted")}</span>
              </div>
              <div className="srs-stat accent">
                <b>{srs.due}</b>
                <span>{t("srsDue")}</span>
              </div>
              <div className="srs-stat">
                <b>{srs.mature}</b>
                <span>{t("srsMature")}</span>
              </div>
              <div className="srs-stat">
                <b>{retained}</b>
                <span>{t("srsRetention")}</span>
              </div>
            </div>
            <div className="srs-foot">
              <p>
                {srs.reviews
                  ? fmt(t("srsReviews"), { n: srs.reviews, pct: srs.retention ?? 0 })
                  : t("srsNone")}
              </p>
              {srs.due > 0 ? (
                <button type="button" className="btn primary sm" onClick={() => ss.goTab("flashcards")}>
                  {fmt(t("srsCta"), { n: srs.due })}
                </button>
              ) : (
                <button type="button" className="btn secondary sm" onClick={() => ss.goTab("flashcards")}>
                  {t("srsCtaNone")}
                </button>
              )}
            </div>
            <p className="pg-note">{t("srsNote")}</p>
          </section>
        </div>
      </div>

      <div className="pr-grid">
        <div className="pr-main" data-od-id="progresso-cobertura">
          <div className="plan-head">
            <h2>{t("chapters")}</h2>
            <span>{t("chaptersNote")}</span>
          </div>
          <div className="pr-head">
            <span>{ss.t("syllabus.colChapter")}</span>
            <span />
            <span className="r">{t("colCov")}</span>
            <span className="r">{t("colAcc")}</span>
          </div>
          <div className="pr-rows">{chapterRows}</div>
          <div className="plan-head">
            <h2>{t("history")}</h2>
            <span>
              {c.code} · {c.version}
            </span>
          </div>
          {logBody}
          <div className="plan-head">
            <h2>{t("examHistoryTitle")}</h2>
            <span>{fmt(t("examHistorySub"), { n: examHist.length, code: c.code })}</span>
          </div>
          {examHistBody}
        </div>
        <aside className="pr-aside aside" data-od-id="progresso-atencao">
          <div className="pr-attention">
            <h2>{t("weak")}</h2>
            {weakBody}
          </div>
          <div className="pr-metrics-educ" data-od-id="progresso-metricas-educ">
            <button
              type="button"
              className="metrics-toggle"
              aria-expanded={metricsOpen}
              aria-controls="metricsPanel"
              onClick={() => setMetricsOpen((v) => !v)}
            >
              <span>{t("metricsTitle")}</span>
              <span aria-hidden="true">{metricsOpen ? "−" : "+"}</span>
            </button>
            {metricsOpen && (
              <div id="metricsPanel" className="metrics-panel">
                <div className="metrics-card">
                  <div className="mc-title">{t("metricsReadinessTitle")}</div>
                  <p>{t("metricsReadinessDesc")}</p>
                </div>
                <div className="metrics-card">
                  <div className="mc-title">{t("metricsPerformanceTitle")}</div>
                  <p>{t("metricsPerformanceDesc")}</p>
                </div>
                <div className="metrics-card">
                  <div className="mc-title">{t("metricsStreakTitle")}</div>
                  <p>{t("metricsStreakDesc")}</p>
                </div>
                <div className="metrics-card">
                  <div className="mc-title">{t("metricsLevelTitle")}</div>
                  <p>{t("metricsLevelDesc")}</p>
                </div>
              </div>
            )}
          </div>
          <div className="pr-feedback" data-od-id="progresso-feedback">
            <h2>{t("feedbackTitle")}</h2>
            <p>{t("feedbackBody")}</p>
            <a
              className="btn secondary sm"
              href={ss.links.feedback}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("feedbackCta")}
              <span className="ext" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </aside>
      </div>

      <ViewFoot label={t("footnote")} tail={`Synapse · ${ss.t("nav.progresso")} · ${c.code}`} />
    </>
  );
}
