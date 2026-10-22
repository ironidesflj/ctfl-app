import { useRef, useState, useMemo, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import {
  exportProgress,
  importProgress,
  clearProgress,
  getStreak,
  getReadinessV2,
  todayLocal,
  exportFullBackup,
  importFullBackup,
  achievementProgress,
} from "../lib/storage.js";
import {
  heatmapWeeks,
  heatmapSummary,
  examHistoryToCsv,
  examTrend,
  weakChapters,
  examCountdown,
  coverPace,
  kLevelBreakdown,
  flashcardStats,
  nextDueDate,
} from "../lib/activity.js";
import { flashcardsForCert } from "../data/study.js";
import { getSetting, setSetting } from "../lib/settings.js";
import { t } from "../lib/ui-strings.js";
import { getNotificationPermission, requestNotificationPermission } from "../lib/notifications.js";
import { parseTimeHHMM } from "../lib/reminder.js";
import RadarChart from "./RadarChart.jsx";

// r14: iniciais dos dias da semana p/ o eixo do heatmap (segunda→domingo;
// só seg/qua/sex recebem rótulo — padrão GitHub, evita poluição)
const HM_DAYS = ["S", "", "Q", "", "S", "", ""];

// r8: sparkline da tendência das notas dos simulados — função pura
// examTrend (activity.js, testada) + desenho. Tracejado = nota de corte;
// ponto final destacado = última prova. aria-label carrega o resumo
// (mín/média/máx) — leitor de tela não precisa do gráfico.
function TrendSpark({ history, passMark, lang }) {
  const trend = examTrend(history, { passMark });
  if (!trend) return null;
  const aria = t(lang, "stats.trendAria", {
    n: trend.values.length,
    min: trend.min,
    avg: trend.avg,
    max: trend.max,
  });
  return (
    <span
      className={"trend-spark" + (trend.values[trend.values.length - 1] >= passMark ? " pass" : "")}
      role="img"
      aria-label={aria}
      title={aria}
    >
      <svg viewBox="0 0 120 36" width="120" height="36" aria-hidden="true">
        <line className="spark-pass" x1="3" y1={trend.passY} x2="117" y2={trend.passY} />
        <polyline className="spark-line" points={trend.points} />
        <circle className="spark-dot" cx={trend.lastX} cy={trend.lastY} r="2.6" />
      </svg>
    </span>
  );
}

// r6: anel de progresso da meta diária — mesmo padrão visual do ScoreRing
// do resultado do simulado (r4), em escala menor. pct nunca passa de 100
// (responder além da meta mantém o anel cheio, sem overflow visual).
function GoalRing({ done, goal, ariaLabel }) {
  const pct = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className={"goal-ring" + (pct >= 100 ? " done" : "")} role="img" aria-label={ariaLabel}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="ring-track" cx="32" cy="32" r={r} />
        <circle
          className="ring-fill"
          cx="32"
          cy="32"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
        />
      </svg>
      <span className="goal-ring-num" aria-hidden="true">
        {done}
        <em>/{goal}</em>
      </span>
    </div>
  );
}

function groupByDay(history) {
  const byDay = {};
  history.forEach((h) => {
    byDay[h.date] = byDay[h.date] || { total: 0, correct: 0 };
    byDay[h.date].total++;
    if (h.correct) byDay[h.date].correct++;
  });
  return Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14);
}

function calcPace(history, readinessPoint) {
  if (readinessPoint >= 90) return null;
  const dates = [...new Set(history.map((h) => h.date))].sort();
  if (dates.length < 7) return null;

  const today = todayLocal();
  const recent7 = dates.filter((d) => d <= today).slice(-7);
  const prev7 = dates.filter((d) => d < recent7[0]).slice(-7);
  if (prev7.length < 7) return null;

  function avgPct(dateSet) {
    const byDay = {};
    history.forEach((h) => {
      if (!dateSet.includes(h.date)) return;
      byDay[h.date] = byDay[h.date] || { t: 0, c: 0 };
      byDay[h.date].t++;
      if (h.correct) byDay[h.date].c++;
    });
    const vals = Object.values(byDay);
    if (vals.length === 0) return 0;
    return (vals.reduce((sum, d) => sum + d.c / d.t, 0) / vals.length) * 100;
  }

  const recentPct = avgPct(recent7);
  const prevPct = avgPct(prev7);
  const delta = recentPct - prevPct;
  if (delta <= 0) return null;
  return Math.ceil((90 - readinessPoint) / delta);
}

// Fase 2: achievement metadata (nomes + descrições para tooltip)
const ACHIEVEMENTS = {
  "first-step": {
    icon: "🎯",
    pt: "Primeiro passo",
    en: "First step",
    ptDesc: "Respondeu sua primeira questão",
    enDesc: "Answered your first question",
  },
  "streak-7": {
    icon: "🔥",
    pt: "7 dias",
    en: "7 days",
    ptDesc: "Estudou 7 dias seguidos (≥5 questões/dia)",
    enDesc: "Studied 7 consecutive days (≥5 questions/day)",
  },
  "streak-30": {
    icon: "💎",
    pt: "30 dias",
    en: "30 days",
    ptDesc: "Estudou 30 dias seguidos (≥5 questões/dia)",
    enDesc: "Studied 30 consecutive days (≥5 questions/day)",
  },
  "passed-exam": {
    icon: "✅",
    pt: "Aprovado",
    en: "Passed",
    ptDesc: "Passou em um simulado",
    enDesc: "Passed an exam simulation",
  },
  // r4: completou um simulado personalizado (capítulos/níveis escolhidos)
  "custom-exam": {
    icon: "🧩",
    pt: "Sob medida",
    en: "Custom-made",
    ptDesc: "Completou um simulado personalizado",
    enDesc: "Completed a custom exam",
  },
  "chapter-complete": {
    icon: "📚",
    pt: "Capítulo completo",
    en: "Chapter complete",
    ptDesc: "Completou a cobertura de um capítulo inteiro",
    enDesc: "Completed coverage of an entire chapter",
  },
  "bank-complete": {
    icon: "🏆",
    pt: "Banco completo",
    en: "Bank complete",
    ptDesc: "Completou a cobertura de todo o banco de questões do cert",
    enDesc: "Completed coverage of the entire cert's question bank",
  },
  // r15 (R18): revisão espaçada — 100 avaliações e 10 itens maduros.
  // "Item" = questão (modo revisão do Quiz) ou flashcard.
  "srs-100": {
    icon: "🃏",
    pt: "100 revisões",
    en: "100 reviews",
    ptDesc: "Fez 100 revisões espaçadas (Quiz ou Flashcards)",
    enDesc: "Completed 100 spaced-repetition reviews (Quiz or Flashcards)",
  },
  "srs-master": {
    icon: "🧠",
    pt: "Memória de longo prazo",
    en: "Long-term memory",
    ptDesc: "10 itens com revisão agendada a 21+ dias",
    enDesc: "10 items scheduled 21+ days ahead",
  },
};

export default function Stats({
  progress,
  setProgress,
  lang = "pt",
  onGoToQuiz,
  onReopenOnboarding = () => {},
}) {
  const { cert: certId } = useParams();
  const bank = useMemo(() => getBank(certId), [certId]);
  const { cert, chapters, chapterName, coverageByChapter, META } = bank;

  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [notifStatus, setNotifStatus] = useState(getNotificationPermission());

  // r6: meta diária — persistida em synapse.goal (settings.js), default 10.
  // Chips 5/10/20/30 trocam o valor na hora (sem botão salvar).
  const GOAL_OPTIONS = [5, 10, 20, 30];
  const [goal, setGoal] = useState(() => {
    const g = parseInt(getSetting("goal"), 10);
    return Number.isFinite(g) && g > 0 ? g : 10;
  });
  function changeGoal(n) {
    setGoal(n);
    setSetting("goal", String(n));
  }

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  }

  // r10: lembrete diário — toggle + horário. Persiste em settings.js e emite
  // o evento que o App ouve pra (re)agendar o disparo sem recarregar.
  const [reminderOn, setReminderOn] = useState(() => getSetting("reminderEnabled") === "1");
  const [reminderTime, setReminderTime] = useState(() => {
    const t0 = getSetting("reminderTime");
    return parseTimeHHMM(t0) ? t0 : "19:00";
  });
  function changeReminderTime(next) {
    if (!parseTimeHHMM(next)) return; // input vazia/inválida não grava
    setReminderTime(next);
    setSetting("reminderTime", next);
    window.dispatchEvent(new CustomEvent("synapse:reminder-changed"));
  }
  function toggleReminder(on) {
    setReminderOn(on);
    setSetting("reminderEnabled", on ? "1" : "0");
    window.dispatchEvent(new CustomEvent("synapse:reminder-changed"));
  }

  // r11: data da prova — setting GLOBAL (não por cert; uma prova por vez).
  // "" = não definida. O input type=date devolve "YYYY-MM-DD" ou "" quando
  // limpa; o countdown (activity.js, pura) valida o formato e devolve null
  // para qualquer coisa que não seja data — a UI degrada pro estado convite.
  const [examDate, setExamDate] = useState(() => getSetting("examDate") || "");
  function changeExamDate(v) {
    setExamDate(v);
    setSetting("examDate", v || "");
  }
  function clearExamDate() {
    if (!window.confirm(t(lang, "stats.examDateClearConfirm"))) return;
    setExamDate("");
    setSetting("examDate", "");
    setMsg(t(lang, "stats.examDateCleared"));
  }

  const pct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
  const days = groupByDay(progress.history || []);

  const streak = getStreak(progress);

  // totalBank do cert ativo (META.certifications é chaveado por cert.label,
  // ex: "CTFL"/"CTAL-TA" — mais robusto que derivar de certId.toUpperCase(),
  // que quebraria pra certs cujo label não é o certId maiúsculo)
  const totalBank = META.certifications?.[cert.label]?.totalQuestions || 300;
  // r13: pools exclusivos — estudo alimenta cobertura/prontidão; simulado
  // tem contagem própria exibida no card de prontidão
  const studyCount = bank.STUDY ? bank.STUDY.length : totalBank;
  const examCount = bank.EXAM ? bank.EXAM.length : 0;
  const readiness = getReadinessV2(progress, bank);
  const pace = calcPace(progress.history || [], readiness.point);
  const achievements = progress.achievements || [];
  // r9: roadmap de conquistas — o que ainda falta, ordenado pelo quão perto
  // está. achievementProgress (storage.js, testada) espelha 1:1 os critérios
  // de checkAchievements; aqui só filtramos as travadas e ordenamos.
  // (examFormat do sparkline é declarado mais abaixo; este é o mesmo valor
  // puxado antes pro useMemo não depender de expressão membro.)
  const roadmapFormat = META.examFormat[certId];
  const roadmap = useMemo(() => {
    const unlocked = progress.achievements || [];
    const all = achievementProgress(progress, bank, roadmapFormat);
    return Object.entries(all)
      .filter(([id]) => !unlocked.includes(id))
      .map(([id, p]) => ({
        id,
        ...p,
        pct: p.target > 0 ? Math.min(100, Math.round((p.current / p.target) * 100)) : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [progress, bank, roadmapFormat]);
  const missingChapterNames = (readiness.missingChapters || []).map((ch) => chapterName(ch, lang));
  const missingKLevelLabels = readiness.missingKLevels || [];
  const missingItems = [...missingChapterNames, ...missingKLevelLabels].join(", ");

  // Fase 2: level baseado em questões únicas corretas (não total bruto)
  const uniqueCorrect = Object.values(progress.attempts || {}).filter((a) => a.lastCorrect).length;
  const level = Math.floor(uniqueCorrect / 20) + 1;

  // Fase 2: cobertura real (questões únicas vistas / total do banco)
  // r13: escopo estudo — visto e total sobre o pool de estudo (as
  // exclusivas de simulado têm contagem própria no poolSplit)
  const seenCount = readiness.seenCount;
  const coveragePct = studyCount > 0 ? Math.round((seenCount / studyCount) * 100) : 0;

  // Fase 0/2: pass mark do cert ativo (examFormat usa certId lowercase)
  const examFormat = META.examFormat?.[certId];
  const passMark = examFormat?.passMark || 26;
  const examQuestions = examFormat?.questions || 40;
  const passPct = examQuestions > 0 ? Math.round((passMark / examQuestions) * 100) : 65;

  const coverage = coverageByChapter(progress.seen || {});

  // r14: heatmap de atividade — 12 SEMANAS alinhadas à semana real (colunas
  // começam na segunda; a última é a semana atual, dias futuros invisíveis).
  // Cada entrada do history = 1 resposta com data local YYYY-MM-DD.
  const heat = useMemo(
    () => heatmapWeeks(progress.history || [], todayLocal(), 12, lang),
    [progress.history, lang]
  );
  const heatSummary = useMemo(() => heatmapSummary(heat.flat), [heat]);
  const heatToday = heat.todayCell;
  // dia selecionado para o detalhe por toque (default = hoje)
  const [heatSel, setHeatSel] = useState(null);
  const selCell = heatSel || heatToday;
  // r6: plural correto no aria do heatmap ("1 dia" vs "2 dias").
  const heatAria = t(lang, "stats.heatmapAria", {
    days: `${heatSummary.activeDays} ${heatSummary.activeDays === 1 ? t(lang, "stats.dayOne") : t(lang, "stats.dayMany")}`,
    answers: `${heatSummary.answers} ${heatSummary.answers === 1 ? t(lang, "stats.answerOne") : t(lang, "stats.answerMany")}`,
    weeks: 12,
  });
  // r6: capítulo mais fraco por aproveitamento (byDomain) — mesma função
  // compartilhada do card 🎯 do Quiz (weakChapters em activity.js),
  // mínimo 3 respostas. Alimenta o CTA "Treinar {chapter}".
  const weakest = useMemo(() => {
    const list = weakChapters(progress.byDomain, chapters);
    return list.length > 0 ? list[0] : null;
  }, [chapters, progress.byDomain]);
  // r11: contagem regressiva até a prova + ritmo para cobrir o banco
  // (funções PURAS em activity.js). seenCount/totalBank já calculados acima;
  // coverPace devolve null quando o banco já está coberto — nesse caso a UI
  // recomenda revisão em vez de volume (examPaceCovered).
  const examCd = useMemo(() => examCountdown(examDate || null, todayLocal()), [examDate]);
  const examPaceVal = useMemo(() => {
    if (!examCd || examCd.past || examCd.isToday || examCd.days <= 0) return null;
    return coverPace(seenCount, studyCount, examCd.days);
  }, [examCd, seenCount, studyCount]);
  const examLeft = Math.max(0, studyCount - seenCount);
  // r11: desempenho por K-level — join attempts (histórico por questão) com
  // as questões reais do cert (bank.ALL). O radar mostra capítulos; esta é
  // a dimensão cognitiva (K1 lembrar · K2 entender · K3 aplicar · K4 analisar).
  const kLevels = useMemo(
    () => kLevelBreakdown(bank.STUDY || bank.ALL, progress.attempts || {}),
    [bank, progress]
  );
  const radarDomains = chapters.map((c) => c[lang]?.short || chapterName(c.chapter, lang));
  const radarPrecision = chapters.map((c) => {
    const bd = progress.byDomain?.[c.chapter] || { t: 0, c: 0 };
    return bd.t > 0 ? Math.round((bd.c / bd.t) * 100) : 0;
  });
  const radarCoverage = chapters.map((c) => {
    const cov = coverage[c.chapter];
    return cov.total > 0 ? Math.round((cov.seen / cov.total) * 100) : 0;
  });

  // r15 (R18): Flashcards → Stats. Métricas do sistema de revisão espaçada
  // do cert — cartões (study.js, escopo cert) + contadores (rateSRS). O
  // painel substitui a cegueira histórica do Stats: sem isso, o trabalho de
  // revisão do usuário era invisível no Progresso.
  const flashCards = useMemo(() => flashcardsForCert(lang, certId), [lang, certId]);
  const fcs = useMemo(
    () => flashcardStats(flashCards, progress?.srs, progress?.srsStats),
    [flashCards, progress]
  );
  const srsNextDue = useMemo(
    () =>
      fcs.started > 0
        ? nextDueDate(
            progress?.srs,
            flashCards.map((c) => c.id),
            todayLocal()
          )
        : null,
    [fcs, progress, flashCards]
  );
  const srsShow = flashCards.length > 0 && (progress.total > 0 || fcs.started > 0);
  // r15: atividade = questões OU revisões espaçadas — quem só usa Flashcards
  // também merece ver a tira de gamificação e o roadmap de conquistas
  // (as novas srs-100/srs-master seriam invisíveis p/ esse perfil).
  const srsActive = (progress.srsStats?.reviews || 0) > 0;
  const hasActivity = progress.total > 0 || srsActive;

  // Fase 2: label do cert para interpolar strings
  const certLabel = cert.label;

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProgress(file);
      setProgress(imported);
      setMsg(t(lang, "stats.importSuccess"));
    } catch {
      setMsg(t(lang, "stats.importError"));
    }
    e.target.value = "";
  }

  // r3: backup completo — importa TODAS as certs + rascunhos + preferências
  // direto no localStorage e recarrega o app (reidrata estado global: tema,
  // idioma, cert ativa, progresso). Erros viram mensagem, não crash.
  const backupFileRef = useRef(null);
  async function handleFullBackupImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFullBackup(file);
      setMsg(t(lang, "stats.backupImportSuccess"));
      setTimeout(() => window.location.reload(), 900);
    } catch {
      setMsg(t(lang, "stats.backupImportError"));
    }
    e.target.value = "";
  }

  // r6: baixa o histórico de simulados como CSV. O conteúdo vem da função
  // pura examHistoryToCsv (testada em activity.test.js); aqui só sobe o
  // Blob + anchor sintético e revoga a URL (evita leak de memória).
  function downloadExamCsv() {
    const csv = examHistoryToCsv(progress.examHistory || [], lang);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synapse-simulados-${certId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Fase 2: interpolar suffix/metaText com dados do cert — usar o parâmetro
  // vars do t() (não .replace() encadeado: t() já roda sua própria
  // substituição de {word} com vars={} por padrão, então .replace() depois
  // não encontraria mais o placeholder, que já teria virado "").
  const readinessSuffix = t(lang, "stats.readinessSuffix", { cert: certLabel });
  const metaText = t(lang, "stats.metaText", {
    examQuestions,
    passMark,
    passPct,
  });
  const metaTitle = t(lang, "stats.metaTitle", { cert: certLabel });

  return (
    <div className="study">
      {!hasActivity && (
        <div className="card" style={{ textAlign: "center" }}>
          <p>{t(lang, "stats.emptyWelcome")}</p>
          {/* r6: arrow explícita — onClick={onGoToQuiz} passaria o EVENTO como
              1º arg, e onGoToQuiz agora aceita domain opcional */}
          <button className="btn primary" onClick={() => onGoToQuiz()}>
            {t(lang, "stats.emptyCta")}
          </button>
        </div>
      )}

      {/* Fase 2: link persistente para re-abrir o onboarding sob demanda */}
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <button
          className="btn ghost"
          style={{ fontSize: "var(--fs-13)", padding: "4px 12px" }}
          onClick={onReopenOnboarding}
        >
          {t(lang, "stats.howItWorks")}
        </button>
      </div>

      {/* Tira de gamificação */}
      {hasActivity && (
        <div className="gamification-strip">
          {streak >= 2 && (
            <>
              <span title={t(lang, "stats.streakDesc")}>
                🔥 {streak} {lang === "pt" ? "dias" : "days"}
              </span>
              <span className="gam-sep" aria-hidden="true">
                ·
              </span>
            </>
          )}
          <span title={t(lang, "stats.levelDesc")}>
            {t(lang, "stats.level")} {level}
          </span>
          <span className="gam-sep" aria-hidden="true">
            ·
          </span>
          <span>
            {achievements.length}/{Object.keys(ACHIEVEMENTS).length}{" "}
            {t(lang, "stats.achievementsLabel")}
          </span>
        </div>
      )}

      {/* Fase 2: Achievements com nomes (se houver algum) */}
      {hasActivity && achievements.length > 0 && (
        <div className="card" style={{ padding: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {achievements.map((aid) => {
              const a = ACHIEVEMENTS[aid];
              if (!a) return null;
              const name = lang === "pt" ? a.pt : a.en;
              const desc = lang === "pt" ? a.ptDesc : a.enDesc;
              return (
                <span
                  key={aid}
                  title={desc}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "var(--fs-13)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--accent-soft)",
                    color: "var(--accent-text)",
                  }}
                >
                  <span aria-hidden="true">{a.icon}</span>
                  <span>{name}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* r9: roadmap de conquistas — as travadas ficavam invisíveis; agora
          cada uma mostra o quanto falta, ordenada pela mais próxima (a 1ª
          ganha destaque "quase"). Barras + contagem atual/alvo. */}
      {hasActivity && roadmap.length > 0 && (
        <div className="card ach-roadmap-card">
          <h3>
            {t(lang, "stats.roadmapTitle")}{" "}
            <span className="roadmap-hint muted">{t(lang, "stats.roadmapHint")}</span>
          </h3>
          <ul className="ach-roadmap">
            {roadmap.map((row, i) => {
              const a = ACHIEVEMENTS[row.id];
              if (!a) return null;
              const name = lang === "pt" ? a.pt : a.en;
              const desc = lang === "pt" ? a.ptDesc : a.enDesc;
              const label =
                row.unit === "pct"
                  ? t(lang, "stats.roadmapPct", {
                      current: row.current,
                      target: row.target,
                    })
                  : t(lang, "stats.roadmapCount", {
                      current: row.current,
                      target: row.target,
                    });
              return (
                <li key={row.id} className={"ach-row" + (i === 0 && row.pct > 0 ? " closest" : "")}>
                  <span className="ach-icon" aria-hidden="true">
                    {a.icon}
                  </span>
                  <div className="ach-body">
                    <div className="ach-top">
                      <span className="ach-name">{name}</span>
                      {i === 0 && row.pct > 0 && (
                        <span className="ach-almost">{t(lang, "stats.roadmapAlmost")}</span>
                      )}
                      <span className="ach-count" aria-hidden="true">
                        {label}
                      </span>
                    </div>
                    <div
                      className="ach-bar"
                      role="progressbar"
                      aria-label={`${name} — ${label}`}
                      aria-valuenow={row.current}
                      aria-valuemin={0}
                      aria-valuemax={row.target}
                    >
                      <div
                        className="ach-fill"
                        style={{
                          width: Math.max(row.current > 0 ? 2 : 0, row.pct) + "%",
                        }}
                      />
                    </div>
                    <span className="ach-desc muted">{desc}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* r6: meta diária — anel de progresso do dia (histórico de hoje) com
          chips para trocar o alvo; conversa com o heatmap logo abaixo */}
      {progress.total > 0 && (
        <div className="card goal-card">
          <div className="goal-main">
            <GoalRing
              done={heatToday.total}
              goal={goal}
              ariaLabel={t(lang, "stats.goalRingAria", {
                n: heatToday.total,
                goal,
                pct: Math.min(100, goal > 0 ? Math.round((heatToday.total / goal) * 100) : 0),
              })}
            />
            <div className="goal-info">
              <h3>{t(lang, "stats.goalTitle")}</h3>
              <p className={heatToday.total >= goal ? "goal-hit" : "muted"}>
                {heatToday.total >= goal
                  ? t(lang, "stats.goalDone")
                  : t(lang, "stats.goalProgress", { n: heatToday.total, goal })}
              </p>
              <div className="goal-chips" role="group" aria-label={t(lang, "stats.goalChangeAria")}>
                {GOAL_OPTIONS.map((n) => (
                  <button
                    key={n}
                    className={"goal-chip" + (n === goal ? " on" : "")}
                    aria-pressed={n === goal}
                    onClick={() => changeGoal(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* r14: heatmap de atividade — 12 semanas alinhadas (segunda→domingo),
          rótulos de mês/dia, toque-para-inspecionar (tooltips não existem em
          touch), células quadradas por TRACKS fixos (o bug do aspect-r see
          styles.css) */}
      {progress.total > 0 && (
        <div className="card heatmap-card">
          <h3>{t(lang, "stats.heatmapTitle")}</h3>
          <div className="heatmap" role="group" aria-label={heatAria}>
            <span className="hm-corner" aria-hidden="true" />
            {heat.monthMarks.map((m, i) => (
              <span key={"m" + i} className="hm-month" aria-hidden="true">
                {m || ""}
              </span>
            ))}
            {HM_DAYS.map((d, r) => (
              <Fragment key={"d" + r}>
                <span className="hm-day" aria-hidden="true">
                  {d || ""}
                </span>
                {heat.grid.map((col, w) => {
                  const c = col[r];
                  if (!c)
                    return (
                      <span key={"f" + w + "-" + r} className="hm-cell future" aria-hidden="true" />
                    );
                  const isToday = heatToday && c.date === heatToday.date;
                  const isSel = selCell && c.date === selCell.date;
                  return (
                    <button
                      key={c.date}
                      type="button"
                      className={"hm-cell" + (isToday ? " today" : "") + (isSel ? " sel" : "")}
                      data-level={c.level}
                      onClick={() => setHeatSel(c)}
                      title={t(lang, "stats.heatmapCell", {
                        date: c.date,
                        total: c.total,
                        pct: c.pct === null ? "—" : c.pct,
                      })}
                      aria-label={t(lang, "stats.heatmapCell", {
                        date: c.date,
                        total: c.total,
                        pct: c.pct === null ? "—" : c.pct,
                      })}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
          <p className="hm-detail" aria-live="polite">
            {selCell
              ? selCell.total > 0
                ? t(lang, "stats.heatmapDay", {
                    date: selCell.date,
                    total: selCell.total,
                    pct: selCell.pct === null ? "—" : selCell.pct,
                  })
                : t(lang, "stats.heatmapDayEmpty", { date: selCell.date })
              : ""}
          </p>
          <div className="heatmap-foot">
            <span className="muted hm-hint">{t(lang, "stats.heatmapTapHint")}</span>
            <span className="hm-legend" aria-hidden="true">
              {t(lang, "stats.heatmapLess")}
              <span className="hm-cell" data-level="0" />
              <span className="hm-cell" data-level="1" />
              <span className="hm-cell" data-level="2" />
              <span className="hm-cell" data-level="3" />
              <span className="hm-cell" data-level="4" />
              {t(lang, "stats.heatmapMore")}
            </span>
            <span className={"muted" + (heatToday && heatToday.total > 0 ? " hm-today-on" : "")}>
              {heatToday ? t(lang, "stats.heatmapToday", { n: heatToday.total }) : ""}
            </span>
          </div>
        </div>
      )}

      {/* r15 (R18): painel Flashcards/Revisão espaçada — o ciclo de hábito
          (devido hoje → revisar → progresso visível) que faltava. Estado
          virgem vira convite com CTA; fila do dia vira CTA direto. */}
      {srsShow && (
        <div className="card srs-card">
          <h3>🃏 {t(lang, "stats.srsTitle")}</h3>
          {fcs.started === 0 ? (
            <>
              <p className="muted srs-sub">{t(lang, "stats.srsEmptyHint")}</p>
              <Link className="btn primary srs-cta" to={`/${certId}/flash`}>
                {t(lang, "stats.srsStart", { n: fcs.total })}
              </Link>
            </>
          ) : (
            <>
              <div className="srs-grid">
                <div className="srs-metric">
                  <b>
                    {fcs.started}/{fcs.total}
                  </b>
                  <span>{t(lang, "stats.srsCards")}</span>
                </div>
                <div className={"srs-metric" + (fcs.dueToday > 0 ? " hot" : "")}>
                  <b>{fcs.dueToday}</b>
                  <span>{t(lang, "stats.srsDue")}</span>
                </div>
                <div className="srs-metric">
                  <b>{fcs.mature}</b>
                  <span>{t(lang, "stats.srsMature")}</span>
                </div>
                <div className="srs-metric" title={t(lang, "stats.srsRetentionHint")}>
                  <b>{fcs.retention === null ? "—" : `${fcs.retention}%`}</b>
                  <span>{t(lang, "stats.srsRetention")}</span>
                </div>
              </div>
              <p className="muted srs-sub">
                {t(lang, "stats.srsReviewsCount", { n: fcs.reviews })}
                {fcs.retention !== null && (
                  <>
                    {" "}
                    ·{" "}
                    {t(lang, "stats.srsRetentionValue", {
                      pct: fcs.retention,
                    })}
                  </>
                )}
              </p>
              {fcs.dueToday > 0 ? (
                <Link className="btn primary srs-cta" to={`/${certId}/flash?due=1`}>
                  ▶ {t(lang, "stats.srsCta", { n: fcs.dueToday })}
                </Link>
              ) : (
                srsNextDue && (
                  <p className="muted srs-sub srs-next">
                    {t(lang, "flashcards.dueNext", { date: srsNextDue })}
                  </p>
                )
              )}
            </>
          )}
        </div>
      )}

      {/* r11: data da prova — contagem regressiva + ritmo para cobrir o
          banco até lá. Renderiza sempre (como o card de lembretes): o estado
          vazio é um convite ao planejamento, não um card a mais que some. */}
      <div className="card exam-date-card">
        <div className="exam-date-head">
          <h3>📅 {t(lang, "stats.examDateTitle")}</h3>
          {examDate && (
            <button
              className="btn ghost exam-date-clear"
              onClick={clearExamDate}
              title={t(lang, "stats.examDateClear")}
            >
              {t(lang, "stats.examDateClear")}
            </button>
          )}
        </div>
        {examCd === null ? (
          <p className="muted">{t(lang, "stats.examDateHint")}</p>
        ) : examCd.isToday ? (
          <p className="exam-days today" role="status">
            {t(lang, "stats.examDaysToday")}
          </p>
        ) : examCd.past ? (
          <p className="muted" role="status">
            {t(lang, "stats.examDaysPast")}
          </p>
        ) : (
          <>
            <p className={"exam-days" + (examCd.days <= 7 ? " warn" : "")} role="status">
              {examCd.days === 1
                ? t(lang, "stats.examDaysOne")
                : t(lang, "stats.examDays", { n: examCd.days })}
            </p>
            <p className="exam-pace">
              {examPaceVal !== null
                ? t(lang, "stats.examPace", { n: examPaceVal, left: examLeft })
                : t(lang, "stats.examPaceCovered")}
            </p>
          </>
        )}
        <div className="exam-date-row">
          <label htmlFor="exam-date-input">{t(lang, "stats.examDateLabel")}</label>
          <input
            id="exam-date-input"
            type="date"
            className="exam-date-input"
            value={examDate}
            onChange={(e) => changeExamDate(e.target.value)}
          />
        </div>
      </div>

      {/* Card de prontidão — Fase 2 redesign com Wilson CI + cobertura */}
      {progress.total > 0 && (
        <div className="card readiness-card" aria-live="polite">
          {readiness.confidence === "low" ? (
            <p className="muted">{t(lang, "stats.readinessPreliminary")}</p>
          ) : (
            <>
              {readiness.confidence === "high" && (
                <p style={{ fontWeight: 600 }}>
                  {readiness.gatesPassed === false
                    ? missingItems
                      ? t(lang, "stats.readinessGateBlockedSpecific", {
                          items: missingItems,
                        })
                      : t(lang, "stats.readinessGateBlocked")
                    : readiness.point >= passPct
                      ? t(lang, "stats.readinessReady")
                      : t(lang, "stats.readinessNotReady")}
                </p>
              )}
              <details style={{ marginTop: "0.25rem" }}>
                <summary
                  style={{
                    fontSize: "var(--fs-13)",
                    cursor: "pointer",
                    color: "var(--text-3)",
                  }}
                >
                  {t(lang, "stats.readinessSeeDetails")}
                </summary>
                <p className="muted" style={{ marginTop: "0.25rem", fontSize: "var(--fs-13)" }}>
                  {t(lang, "stats.readinessPrefix")} <strong>{readiness.point}%</strong>{" "}
                  {readinessSuffix}
                </p>
                <p className="muted" style={{ marginTop: "0.15rem", fontSize: "var(--fs-13)" }}>
                  {t(lang, "stats.readinessCI", {
                    low: readiness.ciLow,
                    high: readiness.ciHigh,
                  })}
                </p>
                <p className="muted" style={{ marginTop: "0.15rem", fontSize: "var(--fs-13)" }}>
                  {t(lang, "stats.readinessCoverage", {
                    pct: coveragePct,
                    seen: seenCount,
                    total: studyCount,
                  })}
                  <span className="pool-split-note">
                    {" "}
                    ·{" "}
                    {t(lang, "stats.poolSplit", {
                      study: studyCount,
                      exam: examCount,
                    })}
                  </span>
                </p>
              </details>
            </>
          )}
          {pace !== null && (
            <p
              className="muted"
              style={{
                marginTop: "0.25rem",
                fontSize: "var(--fs-13)",
                width: "100%",
              }}
            >
              {t(lang, "stats.pacePrefix")}
              {pace}
              {t(lang, "stats.paceSuffix")}
            </p>
          )}
          {/* r6: CTA de treino direcionado — capítulo com menor aproveitamento
              (mín. 3 respostas). onGoToQuiz(domain) pré-seleciona o domínio
              no setup do Quiz (mesmo mecanismo do deep-link do Syllabus). */}
          {weakest && (
            <div className="train-cta">
              <button
                className="btn primary train-btn"
                onClick={() => onGoToQuiz(weakest.ch)}
                title={t(lang, "stats.trainWeakHint")}
              >
                🎯{" "}
                {t(lang, "stats.trainWeak", {
                  chapter: chapterName(weakest.ch, lang),
                })}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-val">{progress.total}</div>
          <div className="stat-lbl">
            {t(lang, "stats.answered")}
            <span
              style={{ marginLeft: "4px", cursor: "help" }}
              title={t(lang, "stats.infoAproveitamento")}
              aria-label={t(lang, "stats.infoAproveitamento")}
            >
              ℹ️
            </span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-val">{progress.correct}</div>
          <div className="stat-lbl">{t(lang, "stats.correct")}</div>
        </div>
        <div className="stat">
          <div className="stat-val">{pct}%</div>
          <div className="stat-lbl">
            {t(lang, "stats.performance")}
            <span
              style={{ marginLeft: "4px", cursor: "help" }}
              title={t(lang, "stats.infoProntidao")}
              aria-label={t(lang, "stats.infoProntidao")}
            >
              ℹ️
            </span>
          </div>
        </div>
      </div>

      {/* r4: histórico de simulados — o examHistory sempre foi gravado
          (últimas 20 provas) mas nunca exibido; agora vira uma linha do
          tempo com veredito, % e badge de simulado personalizado. */}
      {(progress.examHistory || []).length > 0 && (
        <div className="card">
          <div className="exam-hist-head">
            <h3>{t(lang, "stats.examHistoryTitle")}</h3>
            {/* r8: sparkline de tendência — desenha só com 2+ provas; a
                linha tracejada é a nota de corte do cert (passPct) */}
            <TrendSpark history={progress.examHistory} passMark={passPct} lang={lang} />
            {/* r6: export CSV — BOM + separador ; para abrir direto no
                Excel PT-BR com acentos intactos */}
            <button className="btn ghost csv-btn" onClick={downloadExamCsv} title="CSV">
              {t(lang, "stats.exportCsv")}
            </button>
          </div>
          <div className="exam-hist" role="list" aria-label={t(lang, "stats.examHistoryTitle")}>
            {progress.examHistory
              .slice()
              .reverse()
              .map((e, i) => (
                <div
                  className={"exam-hist-row" + (e.passed ? " ok" : " no")}
                  role="listitem"
                  key={i}
                >
                  <span className="exam-hist-date">{e.date}</span>
                  {e.custom && (
                    <span className="exam-hist-badge">🧩 {t(lang, "quiz.customTag")}</span>
                  )}
                  <span className="exam-hist-pct">
                    {e.pct}%{e.n ? ` · ${e.n}q` : ""}
                  </span>
                  <span
                    className="exam-hist-verdict"
                    title={e.passed ? t(lang, "quiz.passed") : t(lang, "quiz.failed")}
                  >
                    {e.passed ? "✓" : "✗"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>{t(lang, "stats.evolution")}</h3>
        {days.length === 0 ? (
          <p className="muted">{t(lang, "stats.noHistory")}</p>
        ) : (
          days.map(([date, d]) => {
            const dpct = Math.round((d.correct / d.total) * 100);
            const tone = dpct >= passPct ? "ok" : "no";
            return (
              <div className="bar-row" key={date}>
                <div className="bar-head">
                  <span>{date}</span>
                  <span className={"bar-val " + tone}>
                    {dpct}% ({d.correct}/{d.total})
                  </span>
                </div>
                <div className="bar">
                  <div className={"bar-fill " + tone} style={{ width: dpct + "%" }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Radar — substitui os 2 cards de domínio + cobertura */}
      {progress.total > 0 && (
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <RadarChart
            domains={radarDomains}
            precision={radarPrecision}
            coverage={radarCoverage}
            size={220}
          />
          <ul className="sr-only">
            {chapters.map((c, i) => (
              <li key={c.chapter}>
                {radarDomains[i]}: {radarPrecision[i]}%{" "}
                {t(lang, "stats.precisionLabel").toLowerCase()}, {radarCoverage[i]}%{" "}
                {t(lang, "stats.coverageLabel").toLowerCase()}
              </li>
            ))}
          </ul>
          <div
            style={{
              display: "flex",
              gap: "1.25rem",
              fontSize: "var(--fs-12)",
              color: "var(--text-3)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="16" height="4">
                <line x1="0" y1="2" x2="16" y2="2" stroke="var(--accent)" strokeWidth="2" />
              </svg>
              {t(lang, "stats.precisionLabel")}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="16" height="4">
                <line
                  x1="0"
                  y1="2"
                  x2="16"
                  y2="2"
                  stroke="var(--text-3)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </svg>
              {t(lang, "stats.coverageLabel")}
            </span>
          </div>
        </div>
      )}

      {/* r11: desempenho por K-level — a dimensão cognitiva que o radar de
          capítulos não mostra. Barras = cobertura (questões distintas vistas
          / total do banco no K); % = acerto sobre TODAS as tentativas. */}
      {progress.total > 0 && kLevels.length > 0 && (
        <div className="card klevel-card">
          <h3>📊 {t(lang, "stats.kLevelTitle")}</h3>
          <p className="muted klevel-hint">{t(lang, "stats.kLevelHint")}</p>
          <div className="klevel-list" role="table" aria-label={t(lang, "stats.kLevelTitle")}>
            {kLevels.map((k) => {
              const coveredPct =
                k.inBank > 0 ? Math.min(100, Math.round((k.attempted / k.inBank) * 100)) : 0;
              const tone = k.pct === null ? "" : k.pct >= passPct ? " ok" : " no";
              return (
                <div className="klevel-row" role="row" key={k.level}>
                  <span className="klevel-chip" role="rowheader">
                    {k.level}
                  </span>
                  <span className="klevel-nums" role="cell">
                    {k.attempted}/{k.inBank}
                  </span>
                  <span className={"klevel-pct" + tone} role="cell">
                    {k.pct === null ? t(lang, "stats.kLevelNone") : `${k.pct}%`}
                  </span>
                  <span className="klevel-bar" role="cell" aria-hidden="true">
                    <span className="klevel-fill" style={{ width: coveredPct + "%" }} />
                  </span>
                </div>
              );
            })}
          </div>
          <ul className="sr-only">
            {kLevels.map((k) => (
              <li key={k.level}>
                {t(lang, "stats.kLevelRow", {
                  k: k.level,
                  pct: k.pct === null ? t(lang, "stats.kLevelNone") : String(k.pct),
                  answered: k.answers,
                  attempted: k.attempted,
                  inBank: k.inBank,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card note">
        <strong>{metaTitle}</strong> {metaText}
      </div>

      {notifStatus !== "unsupported" && (
        <div className="card reminder-card">
          <h3>{t(lang, "notifications.title")}</h3>
          {notifStatus === "denied" && <p className="muted">{t(lang, "notifications.blocked")}</p>}
          {notifStatus === "default" && (
            <>
              <p className="muted">{t(lang, "notifications.enableHint")}</p>
              <button className="btn" onClick={enableNotifications}>
                {t(lang, "notifications.enable")}
              </button>
            </>
          )}
          {notifStatus === "granted" && (
            <>
              <p className="muted">{t(lang, "notifications.enabled")}</p>
              {/* r10: lembrete diário — só com a permissão concedida */}
              <div className="reminder-toggle-row">
                <label className="reminder-switch">
                  <input
                    type="checkbox"
                    checked={reminderOn}
                    onChange={(e) => toggleReminder(e.target.checked)}
                  />
                  <span className="reminder-switch-text">
                    <strong>⏰ {t(lang, "notifications.reminderToggle")}</strong>
                    <span className="muted">{t(lang, "notifications.reminderDesc")}</span>
                  </span>
                </label>
                <input
                  type="time"
                  className="reminder-time"
                  value={reminderTime}
                  onChange={(e) => changeReminderTime(e.target.value)}
                  aria-label={t(lang, "notifications.reminderTimeLabel")}
                  disabled={!reminderOn}
                />
              </div>
              {reminderOn && (
                <p className="reminder-when" role="status">
                  {t(lang, "notifications.reminderWhen", {
                    time: reminderTime,
                  })}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="card backup-card">
        <h3>{t(lang, "stats.backupTitle")}</h3>
        <p className="muted">{t(lang, "stats.backupDesc")}</p>
        <div className="backup-grid">
          <div className="backup-group">
            <span className="backup-group-label">{certLabel}</span>
            <div className="actions" style={{ marginTop: 0 }}>
              <button className="btn" onClick={() => exportProgress(progress)}>
                {t(lang, "stats.exportBtn")}
              </button>
              <button className="btn" onClick={() => fileRef.current?.click()}>
                {t(lang, "stats.importBtn")}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={handleImport}
              />
            </div>
          </div>
          <div className="backup-group">
            <span className="backup-group-label">{t(lang, "stats.backupTitle")}</span>
            <div className="actions" style={{ marginTop: 0 }}>
              <button className="btn primary" onClick={exportFullBackup}>
                {t(lang, "stats.backupExportBtn")}
              </button>
              <button className="btn" onClick={() => backupFileRef.current?.click()}>
                {t(lang, "stats.backupImportBtn")}
              </button>
              <input
                ref={backupFileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={handleFullBackupImport}
              />
            </div>
          </div>
        </div>
        <div className="actions" style={{ marginTop: "0.75rem" }}>
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm(t(lang, "stats.resetConfirm"))) setProgress(clearProgress());
            }}
          >
            {t(lang, "stats.resetBtn")}
          </button>
        </div>
      </div>
      {msg && (
        <p className="muted" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
