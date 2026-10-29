"use client";

/* Synapse · views/Gauge.tsx
   Medidor circular de prontidão — porta exata do gaugeMarkup do
   protótipo (hoje.js/progresso.js): trilha, preenchimento, traço de
   corte e ponto na extremidade. pct null → “—”, nunca número inventado. */

interface GaugeProps {
  pct: number | null;
  cutoff: number | null;
  size: number;
  label: string;
}

export function Gauge({ pct, cutoff, size, label }: GaugeProps) {
  const value = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const angle = ((-90 + value * 3.6) * Math.PI) / 180;
  const dotX = 50 + Math.cos(angle) * r;
  const dotY = 50 + Math.sin(angle) * r;

  let cut: React.ReactNode = null;
  if (cutoff !== null && cutoff !== undefined) {
    const ca = ((-90 + cutoff * 3.6) * Math.PI) / 180;
    const x1 = 50 + Math.cos(ca) * 38;
    const y1 = 50 + Math.sin(ca) * 38;
    const x2 = 50 + Math.cos(ca) * 50;
    const y2 = 50 + Math.sin(ca) * 50;
    cut = (
      <line
        x1={x1.toFixed(2)}
        y1={y1.toFixed(2)}
        x2={x2.toFixed(2)}
        y2={y2.toFixed(2)}
        className="g-cut"
      />
    );
  }

  return (
    <div
      className="gauge-wrap"
      style={{ "--gs": size } as React.CSSProperties}
      role="img"
      aria-label={label}
    >
      <svg className="gauge" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="g-track" cx="50" cy="50" r={r} />
        {pct !== null && (
          <circle
            className="g-fill"
            cx="50"
            cy="50"
            r={r}
            strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
            transform="rotate(-90 50 50)"
          />
        )}
        {cut}
        {pct !== null && value > 0 && (
          <circle className="g-dot" cx={dotX.toFixed(2)} cy={dotY.toFixed(2)} r="2.6" />
        )}
      </svg>
      <span className="gauge-num">
        {pct === null ? "—" : pct}
        {pct !== null && <small>%</small>}
      </span>
    </div>
  );
}
