export default function RadarChart({ domains, precision, coverage, size = 200 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 28; // leave room for labels
  const n = domains.length;
  const rings = [0.33, 0.66, 1.0];

  function polar(angleDeg, pct) {
    const rad = (angleDeg * Math.PI) / 180;
    const r = maxR * (pct / 100);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function angle(i) {
    return -90 + i * (360 / n);
  }

  function polygonPoints(values) {
    return values
      .map((v, i) => polar(angle(i), Math.min(v, 100)).join(","))
      .join(" ");
  }

  const ringPoints = rings.map((r) =>
    domains.map((_, i) => polar(angle(i), r * 100).join(",")).join(" ")
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* Grid rings */}
      {ringPoints.map((pts, ri) => (
        <polygon
          key={ri}
          points={pts}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {domains.map((_, i) => {
        const [x, y] = polar(angle(i), 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--line)"
            strokeWidth="1"
          />
        );
      })}

      {/* Coverage polygon (dashed, text-3) */}
      <polygon
        points={polygonPoints(coverage)}
        fill="none"
        stroke="var(--text-3)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Precision polygon (filled accent) */}
      <polygon
        points={polygonPoints(precision)}
        fill="var(--accent)"
        fillOpacity="0.15"
        stroke="var(--accent)"
        strokeWidth="2"
      />

      {/* Labels */}
      {domains.map((label, i) => {
        const a = angle(i);
        const [x, y] = polar(a, 100);
        const labelR = maxR + 16;
        const rad = (a * Math.PI) / 180;
        const lx = cx + labelR * Math.cos(rad);
        const ly = cy + labelR * Math.sin(rad);
        const anchor =
          Math.abs(Math.cos(rad)) < 0.15
            ? "middle"
            : Math.cos(rad) > 0
            ? "start"
            : "end";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9"
            fill="var(--text-2)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
