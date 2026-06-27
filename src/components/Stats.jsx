import { useRef, useState } from "react";
import { DOMAINS, domainNameInLang, coverageByDomain, META } from "../lib/bank.js";
import { exportProgress, importProgress, clearProgress, getStreak, getReadiness, todayLocal } from "../lib/storage.js";
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

function calcPace(history, readiness) {
  if (readiness >= 90) return null;
  const dates = [...new Set(history.map((h) => h.date))].sort();
  if (dates.length < 7) return null;

  const today = todayLocal();
  const recent7 = dates.filter((d) => d <= today).slice(-7);
  // Requer 2 janelas de 7 dias distintos para comparar tendência de acerto
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
  return Math.ceil((90 - readiness) / delta);
}

export default function Stats({ progress, setProgress, lang = "pt", onGoToQuiz }) {
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
  const readiness = getReadiness(progress, META.total);
  const pace = calcPace(progress.history || [], readiness);
  const achievements = progress.achievements || [];
  const level = Math.floor(progress.total / 20) + 1;

  const coverage = coverageByDomain(progress.seen || {});
  const radarDomains = DOMAINS.map((d) => domainNameInLang(d.id, lang).split(" ")[0]);
  const radarPrecision = DOMAINS.map((d) => {
    const bd = progress.byDomain?.[d.id] || { t: 0, c: 0 };
    return bd.t > 0 ? Math.round((bd.c / bd.t) * 100) : 0;
  });
  const radarCoverage = DOMAINS.map((d) => {
    const cov = coverage[d.id];
    return Math.round((cov.seen / cov.total) * 100);
  });

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

  return (
    <div className="study">
      {progress.total === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          <p>{t(lang, "stats.emptyWelcome")}</p>
          <button className="btn primary" onClick={onGoToQuiz}>{t(lang, "stats.emptyCta")}</button>
        </div>
      )}

      {/* Tira de gamificação */}
      {progress.total > 0 && (
        <div className="gamification-strip">
          {streak >= 2 && (
            <>
              <span>🔥 {streak} dias</span>
              <span className="gam-sep" aria-hidden="true">·</span>
            </>
          )}
          <span>{t(lang, "stats.level")} {level}</span>
          <span className="gam-sep" aria-hidden="true">·</span>
          <span>{achievements.length}/4 {t(lang, "stats.achievementsLabel")}</span>
        </div>
      )}

      {/* Card de prontidão */}
      {progress.total > 0 && (
        <div className="card readiness-card">
          <p>
            {t(lang, "stats.readinessPrefix")} <strong>{readiness}%</strong> {t(lang, "stats.readinessSuffix")}
          </p>
          {pace !== null && (
            <p className="muted" style={{ marginTop: "0.25rem", fontSize: "var(--fs-13)" }}>
              {t(lang, "stats.pacePrefix")}{pace}{t(lang, "stats.paceSuffix")}
            </p>
          )}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat"><div className="stat-val">{progress.total}</div><div className="stat-lbl">{t(lang, "stats.answered")}</div></div>
        <div className="stat"><div className="stat-val">{progress.correct}</div><div className="stat-lbl">{t(lang, "stats.correct")}</div></div>
        <div className="stat"><div className="stat-val">{pct}%</div><div className="stat-lbl">{t(lang, "stats.performance")}</div></div>
      </div>

      <div className="card">
        <h3>{t(lang, "stats.evolution")}</h3>
        {days.length === 0 ? (
          <p className="muted">{t(lang, "stats.noHistory")}</p>
        ) : (
          days.map(([date, d]) => {
            const dpct = Math.round((d.correct / d.total) * 100);
            const tone = dpct >= 65 ? "ok" : "no";
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
            {DOMAINS.map((d, i) => (
              <li key={d.id}>{radarDomains[i]}: {radarPrecision[i]}% {t(lang, "stats.precisionLabel").toLowerCase()}, {radarCoverage[i]}% {t(lang, "stats.coverageLabel").toLowerCase()}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "1.25rem", fontSize: "var(--fs-12)", color: "var(--text-2)" }}>
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
        <strong>{t(lang, "stats.metaTitle")}</strong> {t(lang, "stats.metaText")}
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
