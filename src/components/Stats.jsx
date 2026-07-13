import { useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getBank } from "../lib/bank.js";
import { exportProgress, importProgress, clearProgress, getStreak, getReadinessV2, todayLocal } from "../lib/storage.js";
import { t } from "../lib/ui-strings.js";
import { getNotificationPermission, requestNotificationPermission } from "../lib/notifications.js";
import RadarChart from "./RadarChart.jsx";

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
    return vals.reduce((sum, d) => sum + d.c / d.t, 0) / vals.length * 100;
  }

  const recentPct = avgPct(recent7);
  const prevPct = avgPct(prev7);
  const delta = recentPct - prevPct;
  if (delta <= 0) return null;
  return Math.ceil((90 - readinessPoint) / delta);
}

// Fase 2: achievement metadata (nomes + descrições para tooltip)
const ACHIEVEMENTS = {
  "first-step": { icon: "🎯", pt: "Primeiro passo", en: "First step", ptDesc: "Respondeu sua primeira questão", enDesc: "Answered your first question" },
  "streak-7": { icon: "🔥", pt: "7 dias", en: "7 days", ptDesc: "Estudou 7 dias seguidos (≥5 questões/dia)", enDesc: "Studied 7 consecutive days (≥5 questions/day)" },
  "streak-30": { icon: "💎", pt: "30 dias", en: "30 days", ptDesc: "Estudou 30 dias seguidos (≥5 questões/dia)", enDesc: "Studied 30 consecutive days (≥5 questions/day)" },
  "passed-exam": { icon: "✅", pt: "Aprovado", en: "Passed", ptDesc: "Passou em um simulado", enDesc: "Passed an exam simulation" },
  "chapter-complete": { icon: "📚", pt: "Capítulo completo", en: "Chapter complete", ptDesc: "Completou a cobertura de um capítulo inteiro", enDesc: "Completed coverage of an entire chapter" },
  "bank-complete": { icon: "🏆", pt: "Banco completo", en: "Bank complete", ptDesc: "Completou a cobertura de todo o banco de questões do cert", enDesc: "Completed coverage of the entire cert's question bank" },
};

export default function Stats({ progress, setProgress, lang = "pt", onGoToQuiz }) {
  const { cert: certId } = useParams();
  const bank = useMemo(() => getBank(certId), [certId]);
  const { cert, chapters, chapterName, coverageByChapter, META } = bank;

  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [notifStatus, setNotifStatus] = useState(getNotificationPermission());

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  }

  const pct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
  const days = groupByDay(progress.history || []);

  const streak = getStreak(progress);

  // totalBank do cert ativo (META.certifications é chaveado por cert.label,
  // ex: "CTFL"/"CTAL-TA" — mais robusto que derivar de certId.toUpperCase(),
  // que quebraria pra certs cujo label não é o certId maiúsculo)
  const totalBank = META.certifications?.[cert.label]?.totalQuestions || 300;
  const readiness = getReadinessV2(progress, bank);
  const pace = calcPace(progress.history || [], readiness.point);
  const achievements = progress.achievements || [];
  const missingChapterNames = (readiness.missingChapters || []).map((ch) => chapterName(ch, lang));
  const missingKLevelLabels = readiness.missingKLevels || [];
  const missingItems = [...missingChapterNames, ...missingKLevelLabels].join(", ");

  // Fase 2: level baseado em questões únicas corretas (não total bruto)
  const uniqueCorrect = Object.values(progress.attempts || {}).filter(a => a.lastCorrect).length;
  const level = Math.floor(uniqueCorrect / 20) + 1;

  // Fase 2: cobertura real (questões únicas vistas / total do banco)
  const seenCount = readiness.seenCount;
  const coveragePct = totalBank > 0 ? Math.round((seenCount / totalBank) * 100) : 0;

  // Fase 0/2: pass mark do cert ativo (examFormat usa certId lowercase)
  const examFormat = META.examFormat?.[certId];
  const passMark = examFormat?.passMark || 26;
  const examQuestions = examFormat?.questions || 40;
  const passPct = examQuestions > 0 ? Math.round((passMark / examQuestions) * 100) : 65;

  const coverage = coverageByChapter(progress.seen || {});
  const radarDomains = chapters.map((c) => c[lang]?.short || chapterName(c.chapter, lang));
  const radarPrecision = chapters.map((c) => {
    const bd = progress.byDomain?.[c.chapter] || { t: 0, c: 0 };
    return bd.t > 0 ? Math.round((bd.c / bd.t) * 100) : 0;
  });
  const radarCoverage = chapters.map((c) => {
    const cov = coverage[c.chapter];
    return cov.total > 0 ? Math.round((cov.seen / cov.total) * 100) : 0;
  });

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

  // Fase 2: interpolar suffix/metaText com dados do cert — usar o parâmetro
  // vars do t() (não .replace() encadeado: t() já roda sua própria
  // substituição de {word} com vars={} por padrão, então .replace() depois
  // não encontraria mais o placeholder, que já teria virado "").
  const readinessSuffix = t(lang, "stats.readinessSuffix", { cert: certLabel });
  const metaText = t(lang, "stats.metaText", { examQuestions, passMark, passPct });
  const metaTitle = t(lang, "stats.metaTitle", { cert: certLabel });

  return (
    <div className="study">
      {progress.total === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          <p>{t(lang, "stats.emptyWelcome")}</p>
          <button className="btn primary" onClick={onGoToQuiz}>{t(lang, "stats.emptyCta")}</button>
        </div>
      )}

      {/* Fase 2: link persistente para re-abrir o onboarding sob demanda */}
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <button
          className="btn ghost"
          style={{ fontSize: "var(--fs-13)", padding: "4px 12px" }}
          onClick={() => {
            try { localStorage.removeItem("ctfl_onboarding_done"); } catch {}
            window.location.reload();
          }}
        >
          {t(lang, "stats.howItWorks")}
        </button>
      </div>

      {/* Tira de gamificação */}
      {progress.total > 0 && (
        <div className="gamification-strip">
          {streak >= 2 && (
            <>
              <span title={t(lang, "stats.streakDesc")}>🔥 {streak} {lang === "pt" ? "dias" : "days"}</span>
              <span className="gam-sep" aria-hidden="true">·</span>
            </>
          )}
          <span title={t(lang, "stats.levelDesc")}>{t(lang, "stats.level")} {level}</span>
          <span className="gam-sep" aria-hidden="true">·</span>
          <span>{achievements.length}/6 {t(lang, "stats.achievementsLabel")}</span>
        </div>
      )}

      {/* Fase 2: Achievements com nomes (se houver algum) */}
      {progress.total > 0 && achievements.length > 0 && (
        <div className="card" style={{ padding: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {achievements.map(aid => {
              const a = ACHIEVEMENTS[aid];
              if (!a) return null;
              const name = lang === "pt" ? a.pt : a.en;
              const desc = lang === "pt" ? a.ptDesc : a.enDesc;
              return (
                <span key={aid} title={desc} style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "var(--fs-13)", padding: "2px 8px",
                  borderRadius: "var(--radius-sm)", background: "var(--accent-soft)",
                  color: "var(--accent-text)"
                }}>
                  <span aria-hidden="true">{a.icon}</span>
                  <span>{name}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Card de prontidão — Fase 2 redesign com Wilson CI + cobertura */}
      {progress.total > 0 && (
        <div className="card readiness-card" aria-live="polite">
          {readiness.confidence === "low" ? (
            <p className="muted">
              {t(lang, "stats.readinessPreliminary")}
            </p>
          ) : (
            <>
              {readiness.confidence === "high" && (
                <p style={{ fontWeight: 600 }}>
                  {readiness.gatesPassed === false
                    ? (missingItems
                        ? t(lang, "stats.readinessGateBlockedSpecific", { items: missingItems })
                        : t(lang, "stats.readinessGateBlocked"))
                    : readiness.point >= passPct
                      ? t(lang, "stats.readinessReady")
                      : t(lang, "stats.readinessNotReady")}
                </p>
              )}
              <details style={{ marginTop: "0.25rem" }}>
                <summary style={{ fontSize: "var(--fs-13)", cursor: "pointer", color: "var(--text-3)" }}>
                  {t(lang, "stats.readinessSeeDetails")}
                </summary>
                <p className="muted" style={{ marginTop: "0.25rem", fontSize: "var(--fs-13)" }}>
                  {t(lang, "stats.readinessPrefix")} <strong>{readiness.point}%</strong> {readinessSuffix}
                </p>
                <p className="muted" style={{ marginTop: "0.15rem", fontSize: "var(--fs-13)" }}>
                  {t(lang, "stats.readinessCI", { low: readiness.ciLow, high: readiness.ciHigh })}
                </p>
                <p className="muted" style={{ marginTop: "0.15rem", fontSize: "var(--fs-13)" }}>
                  {t(lang, "stats.readinessCoverage", { pct: coveragePct, seen: seenCount, total: totalBank })}
                </p>
              </details>
            </>
          )}
          {pace !== null && (
            <p className="muted" style={{ marginTop: "0.25rem", fontSize: "var(--fs-13)" }}>
              {t(lang, "stats.pacePrefix")}{pace}{t(lang, "stats.paceSuffix")}
            </p>
          )}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-val">{progress.total}</div>
          <div className="stat-lbl">
            {t(lang, "stats.answered")}
            <span style={{ marginLeft: "4px", cursor: "help" }} title={t(lang, "stats.infoAproveitamento")} aria-label={t(lang, "stats.infoAproveitamento")}>ℹ️</span>
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
            <span style={{ marginLeft: "4px", cursor: "help" }} title={t(lang, "stats.infoProntidao")} aria-label={t(lang, "stats.infoProntidao")}>ℹ️</span>
          </div>
        </div>
      </div>

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
                  <span className={"bar-val " + tone}>{dpct}% ({d.correct}/{d.total})</span>
                </div>
                <div className="bar"><div className={"bar-fill " + tone} style={{ width: dpct + "%" }} /></div>
              </div>
            );
          })
        )}
      </div>

      {/* Radar — substitui os 2 cards de domínio + cobertura */}
      {progress.total > 0 && (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <RadarChart
            domains={radarDomains}
            precision={radarPrecision}
            coverage={radarCoverage}
            size={220}
          />
          <ul className="sr-only">
            {chapters.map((c, i) => (
              <li key={c.chapter}>{radarDomains[i]}: {radarPrecision[i]}% {t(lang, "stats.precisionLabel").toLowerCase()}, {radarCoverage[i]}% {t(lang, "stats.coverageLabel").toLowerCase()}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "1.25rem", fontSize: "var(--fs-12)", color: "var(--text-3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="var(--accent)" strokeWidth="2" /></svg>
              {t(lang, "stats.precisionLabel")}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
              {t(lang, "stats.coverageLabel")}
            </span>
          </div>
        </div>
      )}

      <div className="card note">
        <strong>{metaTitle}</strong> {metaText}
      </div>

      {notifStatus !== "unsupported" && (
        <div className="card">
          <h3>{t(lang, "notifications.title")}</h3>
          {notifStatus === "granted" && <p className="muted">{t(lang, "notifications.enabled")}</p>}
          {notifStatus === "denied" && <p className="muted">{t(lang, "notifications.blocked")}</p>}
          {notifStatus === "default" && (
            <button className="btn" onClick={enableNotifications}>
              {t(lang, "notifications.enable")}
            </button>
          )}
        </div>
      )}

      <div className="actions">
        <button className="btn" onClick={() => exportProgress(progress)}>{t(lang, "stats.exportBtn")}</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>{t(lang, "stats.importBtn")}</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
        <button className="btn ghost" onClick={() => { if (confirm(t(lang, "stats.resetConfirm"))) setProgress(clearProgress()); }}>{t(lang, "stats.resetBtn")}</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
