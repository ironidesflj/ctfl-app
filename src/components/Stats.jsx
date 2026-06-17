import { useRef, useState } from "react";
import { DOMAINS, coverageByDomain } from "../lib/bank.js";
import { exportProgress, importProgress, clearProgress } from "../lib/storage.js";

export default function Stats({ progress, setProgress }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");

  const pct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
  const coverage = coverageByDomain(progress.seen || {});

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProgress(file);
      setProgress(imported);
      setMsg("Progresso importado com sucesso.");
    } catch {
      setMsg("Arquivo inválido. Use um arquivo exportado por este app.");
    }
    e.target.value = "";
  }

  return (
    <div className="study">
      <div className="stat-grid">
        <div className="stat"><div className="stat-val">{progress.total}</div><div className="stat-lbl">Respondidas</div></div>
        <div className="stat"><div className="stat-val">{progress.correct}</div><div className="stat-lbl">Acertos</div></div>
        <div className="stat"><div className="stat-val">{pct}%</div><div className="stat-lbl">Aproveitamento</div></div>
      </div>

      <div className="card">
        <h3>Por domínio</h3>
        {DOMAINS.map((d) => {
          const bd = progress.byDomain[d.id] || { t: 0, c: 0 };
          const p = bd.t > 0 ? Math.round((bd.c / bd.t) * 100) : 0;
          const tone = bd.t === 0 ? "none" : p >= 65 ? "ok" : "no";
          return (
            <div className="bar-row" key={d.id}>
              <div className="bar-head">
                <span>{d.name}</span>
                <span className={"bar-val " + tone}>{bd.t > 0 ? `${p}% (${bd.c}/${bd.t})` : "sem dados"}</span>
              </div>
              <div className="bar"><div className={"bar-fill " + tone} style={{ width: p + "%" }} /></div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Cobertura por capítulo</h3>
        <p className="muted" style={{marginBottom: '1rem', fontSize: '13px'}}>
          Questões vistas ao menos uma vez (modos Estudo e Errei antes)
        </p>
        {DOMAINS.map(d => {
          const cov = coverage[d.id];
          const pct = Math.round((cov.seen / cov.total) * 100);
          return (
            <div className="bar-row" key={d.id}>
              <div className="bar-head">
                <span>{d.name}</span>
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
        <strong>Meta CTFL v4.0:</strong> 40 questões, mínimo 26 acertos (65%). Os capítulos 4 (Técnicas) e 5 (Gerenciamento)
        somam metade do exame — priorize-os. Há cerca de 8 questões K3 (aplicação), as mais difíceis.
      </div>

      <div className="actions">
        <button className="btn" onClick={() => exportProgress(progress)}>Exportar progresso</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>Importar progresso</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
        <button className="btn ghost" onClick={() => { if (confirm("Zerar todo o progresso?")) setProgress(clearProgress()); }}>Zerar</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
