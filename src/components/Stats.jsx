import { useRef, useState } from "react";
import { DOMAINS, domainNameInLang, coverageByDomain } from "../lib/bank.js";
import { exportProgress, importProgress, clearProgress } from "../lib/storage.js";
import { t } from "../lib/ui-strings.js";
import { getNotificationPermission, requestNotificationPermission } from "../lib/notifications.js";

function groupByDay(history) {
  const byDay = {};
  history.forEach((h) => {
    byDay[h.date] = byDay[h.date] || { total: 0, correct: 0 };
    byDay[h.date].total++;
    if (h.correct) byDay[h.date].correct++;
  });
  return Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14); // últimos 14 dias com atividade
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
  const coverage = coverageByDomain(progress.seen || {});
  const days = groupByDay(progress.history || []);

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

      <div className="card">
        <div className="card-eyebrow">{t(lang, "stats.precisionLabel")}</div>
        <h3>{t(lang, "stats.byDomain")}</h3>
        {DOMAINS.map((d) => {
          const bd = progress.byDomain[d.id] || { t: 0, c: 0 };
          const p = bd.t > 0 ? Math.round((bd.c / bd.t) * 100) : 0;
          const tone = bd.t === 0 ? "none" : p >= 65 ? "ok" : "no";
          return (
            <div className="bar-row" key={d.id}>
              <div className="bar-head">
                <span>{domainNameInLang(d.id, lang)}</span>
                <span className={"bar-val " + tone}>{bd.t > 0 ? `${p}% (${bd.c}/${bd.t})` : t(lang, "stats.noData")}</span>
              </div>
              <div className="bar"><div className={"bar-fill " + tone} style={{ width: p + "%" }} /></div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-eyebrow">{t(lang, "stats.coverageLabel")}</div>
        <h3>{t(lang, "stats.coverage")}</h3>
        <p className="muted" style={{marginBottom: '1rem', fontSize: '13px'}}>
          {t(lang, "stats.coverageDesc")}
        </p>
        {DOMAINS.map(d => {
          const cov = coverage[d.id];
          const pct = Math.round((cov.seen / cov.total) * 100);
          return (
            <div className="bar-row" key={d.id}>
              <div className="bar-head">
                <span>{domainNameInLang(d.id, lang)}</span>
                <span className="bar-val" style={{color: 'var(--text-2)'}}>
                  {cov.seen}/{cov.total} ({pct}%)
                </span>
              </div>
              <div className="bar">
                <div className="bar-fill"
                  style={{
                    width: pct + '%',
                    background: pct === 100
                      ? 'var(--ok)'
                      : pct >= 50
                      ? 'var(--accent)'
                      : 'var(--text-3)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

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
