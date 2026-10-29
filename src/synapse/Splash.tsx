"use client";

/* ===========================================================
   Synapse · Splash.tsx
   Tela de abertura silenciosa — Motor 3D de Profundidade Sináptica
   com Órbita Kepleriana & Constelação (Opção 03 by Noos).

   Coreografia em 3 Atos:
   · Ato I  (0,10s – 1,56s): Símbolo Central Opção 03 executa sua
     animação kepleriana original enquanto astros 3D surgem e flutuam
     no espaço com paralaxe real e malha de fundo profundo (depth-of-field).
   · Ato II (1,56s – 3,85s): Ao acender o ápice violeta (1.56s), o impulso
     sináptico parte do centro em 3D em direção às bordas, conectando os
     nós através de feixes caóticos e acendendo 7 hubs com optical bloom.
   · Ato III (3,85s – 5,60s): Traço horizontal fino e assinatura "by Noos",
     seguidos por pausa de contemplação e fade-out suave.
   =========================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSynapse } from "./store";

const IS_TEST = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
const FULL_FADE_AT_MS = IS_TEST ? 10 : 5600;
const QUICK_MIN_MS = IS_TEST ? 0 : 2400;
const QUICK_MAX_MS = IS_TEST ? 10 : 3000;
const REDUCED_MS = IS_TEST ? 0 : 350;
const FADE_MS = IS_TEST ? 0 : 600;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Node3D {
  x: number;
  y: number;
  z: number;
  rCenter: number;
  appearAt: number;
  size: number;
  isHub: boolean;
  hubIgniteAt?: number;
  degree: number;
  isolated?: boolean;
}

interface Edge3D {
  a: number;
  b: number;
  dist: number;
  startDelay: number;
  duration: number;
}

interface FarNode3D {
  x: number;
  y: number;
  z: number;
  appearAt: number;
  size: number;
}

interface FarEdge3D {
  a: number;
  b: number;
  d: number;
}

function buildSynapse3DGraph() {
  const rand = mulberry32(20261029);
  const farNodes: FarNode3D[] = [];
  const farEdges: FarEdge3D[] = [];
  const nodes: Node3D[] = [];
  const edges: Edge3D[] = [];

  // 1. Camada de fundo profundo (depth-of-field)
  for (let i = 0; i < 44; i++) {
    const x = (rand() - 0.52) * 1650;
    const y = (rand() - 0.52) * 1020;
    const z = 280 + rand() * 360;
    farNodes.push({
      x,
      y,
      z,
      appearAt: 0.1 + rand() * 0.9,
      size: 1.0 + rand() * 1.1,
    });
  }
  for (let i = 0; i < farNodes.length; i++) {
    for (let j = i + 1; j < farNodes.length; j++) {
      const dx = farNodes[i].x - farNodes[j].x;
      const dy = farNodes[i].y - farNodes[j].y;
      const dz = (farNodes[i].z - farNodes[j].z) * 0.5;
      const d = Math.hypot(dx, dy, dz);
      if (d < 290 && rand() < 0.48) {
        farEdges.push({ a: i, b: j, d });
      }
    }
  }

  // 2. Anel de ancoragem ao redor do centro
  const rootAngles = [-0.62, -2.45, 0.22, 2.52, -1.35, 1.18, 3.02];
  for (let i = 0; i < rootAngles.length; i++) {
    const ang = rootAngles[i];
    const rad = 54 + (rand() - 0.5) * 14;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad - 18;
    const z = (rand() - 0.5) * 70;
    nodes.push({
      x,
      y,
      z,
      rCenter: Math.hypot(x, y),
      appearAt: 0.15 + rand() * 0.35,
      size: 1.9 + rand() * 0.7,
      isHub: false,
      degree: 0,
    });
  }

  // 3. Feixes/Correntes Sinápticas 3D irradiando para as bordas
  const streams = [
    { angle: -0.52, spread: 0.38, count: 46, maxDist: 820, zBias: -35 },
    { angle: 2.56, spread: 0.42, count: 44, maxDist: 820, zBias: -15 },
    { angle: -2.48, spread: 0.45, count: 34, maxDist: 780, zBias: 40 },
    { angle: 0.28, spread: 0.46, count: 36, maxDist: 790, zBias: 10 },
    { angle: 1.15, spread: 0.36, count: 22, maxDist: 620, zBias: 55 },
    { angle: -1.42, spread: 0.34, count: 18, maxDist: 540, zBias: -50 },
  ];

  for (const s of streams) {
    for (let i = 0; i < s.count; i++) {
      const t = Math.pow((i + 0.4 + rand() * 0.6) / s.count, 0.88);
      const dist = 68 + t * (s.maxDist - 68);
      const wave = Math.sin(t * 5.2 + s.angle * 2.0) * 0.22 + (rand() - 0.5) * s.spread;
      const ang = s.angle + wave;
      const jitterR = (rand() - 0.5) * 65;
      const x = Math.cos(ang) * (dist + jitterR);
      const y = Math.sin(ang) * (dist * 0.72 + jitterR * 0.7) - 12;
      const z = s.zBias + Math.cos(t * 4.5 + i * 0.7) * 95 + (rand() - 0.5) * 140;

      nodes.push({
        x,
        y,
        z,
        rCenter: Math.hypot(x, y * 1.15),
        appearAt: 0.12 + t * 0.85 + rand() * 0.28,
        size: 1.5 + rand() * 1.35,
        isHub: false,
        degree: 0,
      });
    }
  }

  // Astros periféricos
  for (let i = 0; i < 24; i++) {
    const x = (rand() - 0.5) * 1480;
    const y = (rand() - 0.5) * 860;
    if (Math.hypot(x, y) < 120) continue;
    const z = (rand() - 0.3) * 320;
    nodes.push({
      x,
      y,
      z,
      rCenter: Math.hypot(x, y * 1.15),
      appearAt: 0.2 + rand() * 0.95,
      size: 1.2 + rand() * 1.0,
      isHub: false,
      degree: 0,
      isolated: rand() < 0.45,
    });
  }

  // 4. Conexões 3D
  const maxR = 820;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].isolated) continue;
    const candidates: Array<{ j: number; d: number }> = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j || nodes[j].isolated) continue;
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = (nodes[i].z - nodes[j].z) * 0.58;
      const d = Math.hypot(dx, dy, dz);
      if (d < 168) candidates.push({ j, d });
    }
    candidates.sort((a, b) => a.d - b.d);
    const maxLinks = 2 + Math.floor(rand() * 3);
    let added = 0;
    for (const c of candidates) {
      if (added >= maxLinks) break;
      const j = c.j;
      if (j < i && edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
        continue;
      }
      const a = nodes[i].rCenter <= nodes[j].rCenter ? i : j;
      const b = nodes[i].rCenter <= nodes[j].rCenter ? j : i;
      const radialNorm = Math.min(1, nodes[a].rCenter / maxR);
      const startDelay = 1.56 + radialNorm * 1.58 + (rand() - 0.5) * 0.14;
      const duration = 0.32 + (c.d / 168) * 0.36;

      edges.push({
        a,
        b,
        dist: c.d,
        startDelay: Math.max(1.56, startDelay),
        duration,
      });
      nodes[a].degree++;
      nodes[b].degree++;
      added++;
    }
  }

  // 5. Hubs Sinápticos com Optical Bloom
  const hubCandidates = nodes
    .map((n, idx) => ({ n, idx }))
    .filter((item) => item.n.degree >= 4 && item.n.rCenter > 135 && item.n.rCenter < 640)
    .sort((a, b) => b.n.degree - a.n.degree || a.n.z - b.n.z);

  const chosenHubs: Node3D[] = [];
  for (const item of hubCandidates) {
    if (chosenHubs.length >= 7) break;
    const tooClose = chosenHubs.some((h) => Math.hypot(h.x - item.n.x, h.y - item.n.y) < 175);
    if (!tooClose) {
      item.n.isHub = true;
      item.n.size = 3.2;
      item.n.hubIgniteAt = 1.62 + Math.min(1, item.n.rCenter / maxR) * 1.55;
      chosenHubs.push(item.n);
    }
  }

  return { farNodes, farEdges, nodes, edges };
}

const GRAPH_3D = buildSynapse3DGraph();

const INNER_STARS: Array<{ cx: number; cy: number; r: number; accent?: boolean }> = [
  { cx: 19, cy: 52, r: 2.4 },
  { cx: 64, cy: 17, r: 2.6, accent: true },
  { cx: 36, cy: 22, r: 1.7 },
  { cx: 57, cy: 96, r: 2.4 },
  { cx: 102, cy: 63, r: 2.6, accent: true },
  { cx: 86, cy: 94, r: 1.7 },
];

const NODES: Array<[number, number]> = [
  [22.5, 90],
  [45, 42.5],
  [72.5, 65],
];

export function ConstellationSplash({
  mode,
  onReveal,
  onDone,
}: {
  mode: "full" | "quick";
  onReveal: () => void;
  onDone: () => void;
}) {
  const { bankStatus, t } = useSynapse();
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);
  const bankRef = useRef(bankStatus);
  const revealRef = useRef(onReveal);
  const doneCbRef = useRef(onDone);
  const fadeTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    bankRef.current = bankStatus;
  }, [bankStatus]);
  useEffect(() => {
    revealRef.current = onReveal;
  }, [onReveal]);
  useEffect(() => {
    doneCbRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.removeAttribute("data-boot");
    setFading(true);
    revealRef.current();
    fadeTimerRef.current = window.setTimeout(() => doneCbRef.current(), FADE_MS);
  }, []);

  // Timer do splash
  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    const start = Date.now();

    if (reduced || mode === "full") {
      const id = window.setTimeout(finish, reduced ? REDUCED_MS : FULL_FADE_AT_MS);
      return () => window.clearTimeout(id);
    }

    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const bankReady = bankRef.current !== "loading";
      if ((elapsed >= QUICK_MIN_MS && bankReady) || elapsed >= QUICK_MAX_MS) {
        window.clearInterval(id);
        finish();
      }
    }, 90);
    return () => window.clearInterval(id);
  }, [mode, finish]);

  // Teclado
  useEffect(() => {
    if (mode !== "full") return;
    const onKey = (e: KeyboardEvent) => {
      if (doneRef.current) return;
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [mode, finish]);

  // Loop de Renderização 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const scaleFactor = Math.max(W / 1440, H / 900);

      const elapsed = (now - startTime) / 1000;
      const isDark = true; // A abertura mantém a paleta escura em qualquer tema do app.

      ctx.clearRect(0, 0, W, H);

      // Atmosfera volumétrica
      if (isDark) {
        const neb1 = ctx.createRadialGradient(
          cx + W * 0.14,
          cy - H * 0.08,
          10,
          cx + W * 0.14,
          cy - H * 0.08,
          W * 0.48
        );
        neb1.addColorStop(0, "rgba(68, 88, 235, 0.22)");
        neb1.addColorStop(0.45, "rgba(54, 48, 168, 0.11)");
        neb1.addColorStop(1, "rgba(13, 13, 20, 0)");
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, W, H);

        const neb2 = ctx.createRadialGradient(
          cx - W * 0.22,
          cy + H * 0.2,
          10,
          cx - W * 0.22,
          cy + H * 0.2,
          W * 0.44
        );
        neb2.addColorStop(0, "rgba(72, 62, 215, 0.16)");
        neb2.addColorStop(0.5, "rgba(38, 32, 118, 0.08)");
        neb2.addColorStop(1, "rgba(13, 13, 20, 0)");
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, W, H);
      } else {
        const nebLight = ctx.createRadialGradient(cx, cy, 10, cx, cy, W * 0.52);
        nebLight.addColorStop(0, "rgba(90, 75, 231, 0.07)");
        nebLight.addColorStop(1, "rgba(246, 245, 240, 0)");
        ctx.fillStyle = nebLight;
        ctx.fillRect(0, 0, W, H);
      }

      // Parallax 3D suave
      const camYaw = Math.sin(elapsed * 0.48) * 0.11;
      const camPitch = Math.cos(elapsed * 0.36) * 0.07;
      const cosY = Math.cos(camYaw);
      const sinY = Math.sin(camYaw);
      const cosP = Math.cos(camPitch);
      const sinP = Math.sin(camPitch);
      const fov = 760;

      const project = (node: { x: number; y: number; z: number }) => {
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;
        const y2 = node.y * cosP - z1 * sinP;
        const z2 = node.y * sinP + z1 * cosP;
        const persp = fov / Math.max(180, fov + z2);
        return {
          sx: cx + x1 * persp * scaleFactor,
          sy: cy + y2 * persp * scaleFactor,
          z: z2,
          persp,
        };
      };

      // Fundo Profundo
      const farProj = GRAPH_3D.farNodes.map(project);
      const farFade = Math.min(1, Math.max(0, (elapsed - 0.25) / 1.4));
      if (farFade > 0) {
        ctx.lineWidth = 0.8 * dpr;
        ctx.strokeStyle = isDark
          ? `rgba(115, 135, 255, ${0.11 * farFade})`
          : `rgba(76, 62, 198, ${0.09 * farFade})`;
        ctx.beginPath();
        for (const e of GRAPH_3D.farEdges) {
          const pA = farProj[e.a];
          const pB = farProj[e.b];
          ctx.moveTo(pA.sx, pA.sy);
          ctx.lineTo(pB.sx, pB.sy);
        }
        ctx.stroke();

        for (let i = 0; i < GRAPH_3D.farNodes.length; i++) {
          const fn = GRAPH_3D.farNodes[i];
          const p = farProj[i];
          const nf = Math.min(1, Math.max(0, (elapsed - fn.appearAt) / 0.7));
          if (nf <= 0) continue;
          ctx.fillStyle = isDark
            ? `rgba(145, 165, 255, ${0.22 * nf})`
            : `rgba(76, 62, 198, ${0.18 * nf})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, fn.size * p.persp * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Projeção dos nós principais
      const proj = GRAPH_3D.nodes.map(project);

      // Conexões Sinápticas 3D
      ctx.lineCap = "round";
      for (const e of GRAPH_3D.edges) {
        const progress = (elapsed - e.startDelay) / e.duration;
        if (progress <= 0) continue;
        const t = Math.min(1, progress);
        const easeT = 1 - Math.pow(1 - t, 3);

        const pA = proj[e.a];
        const pB = proj[e.b];
        const curX = pA.sx + (pB.sx - pA.sx) * easeT;
        const curY = pA.sy + (pB.sy - pA.sy) * easeT;

        const avgPersp = (pA.persp + pB.persp) * 0.5;
        const depthAlpha = Math.min(1, Math.max(0.22, (avgPersp - 0.58) * 1.45));
        const alpha = (isDark ? 0.56 : 0.46) * depthAlpha;

        ctx.lineWidth = Math.max(0.75, 1.38 * avgPersp) * dpr;
        ctx.strokeStyle = isDark ? `rgba(124, 146, 255, ${alpha})` : `rgba(90, 75, 231, ${alpha})`;

        ctx.beginPath();
        ctx.moveTo(pA.sx, pA.sy);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        if (t < 1) {
          ctx.save();
          if (isDark) ctx.globalCompositeOperation = "lighter";
          const sparkR = 4.2 * avgPersp * dpr;
          const sg = ctx.createRadialGradient(curX, curY, 0, curX, curY, sparkR);
          sg.addColorStop(0, isDark ? "rgba(220, 235, 255, 0.95)" : "rgba(90, 75, 231, 0.9)");
          sg.addColorStop(1, "rgba(90, 75, 231, 0)");
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(curX, curY, sparkR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Nós / Astros 3D
      for (let i = 0; i < GRAPH_3D.nodes.length; i++) {
        const n = GRAPH_3D.nodes[i];
        const p = proj[i];
        const appearProg = (elapsed - n.appearAt) / 0.65;
        if (appearProg <= 0) continue;
        const nf = Math.min(1, appearProg);

        const waveBoost = elapsed > 1.56 + (n.rCenter / 820) * 1.58 ? 0.25 : 0;
        const depthAlpha = Math.min(1, Math.max(0.28, (p.persp - 0.55) * 1.4 + waveBoost));
        const r = n.size * p.persp * dpr;

        if (p.persp > 0.88) {
          const haloR = r * 3.0;
          const hg = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, haloR);
          hg.addColorStop(
            0,
            isDark
              ? `rgba(130, 160, 255, ${0.34 * nf * depthAlpha})`
              : `rgba(90, 75, 231, ${0.22 * nf * depthAlpha})`
          );
          hg.addColorStop(1, "rgba(90, 75, 231, 0)");
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, haloR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = isDark
          ? `rgba(218, 228, 255, ${0.88 * nf * depthAlpha})`
          : `rgba(59, 47, 176, ${0.82 * nf * depthAlpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hubs de Alta Energia com Optical Bloom
      ctx.save();
      if (isDark) ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < GRAPH_3D.nodes.length; i++) {
        const n = GRAPH_3D.nodes[i];
        if (!n.isHub || n.hubIgniteAt === undefined) continue;
        const hubProg = (elapsed - n.hubIgniteAt) / 0.75;
        if (hubProg <= 0) continue;
        const hf = Math.min(1, hubProg);
        const pulse = 0.92 + Math.sin(elapsed * 3.2 + i) * 0.08;
        const p = proj[i];

        const outerR = 38 * p.persp * dpr * pulse;
        const og = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, outerR);
        if (isDark) {
          og.addColorStop(0, `rgba(165, 205, 255, ${0.85 * hf})`);
          og.addColorStop(0.22, `rgba(110, 140, 255, ${0.52 * hf})`);
          og.addColorStop(0.55, `rgba(88, 72, 235, ${0.18 * hf})`);
          og.addColorStop(1, "rgba(88, 72, 235, 0)");
        } else {
          og.addColorStop(0, `rgba(90, 75, 231, ${0.55 * hf})`);
          og.addColorStop(0.35, `rgba(90, 75, 231, ${0.22 * hf})`);
          og.addColorStop(1, "rgba(90, 75, 231, 0)");
        }
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, outerR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3.4 * p.persp * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="splash"
      data-mode={mode}
      data-fading={fading ? "true" : "false"}
      role="presentation"
      onClick={mode === "full" ? finish : undefined}
    >
      {/* CAMADA 1: Céu 3D de Profundidade & Impulso Sináptico */}
      <canvas ref={canvasRef} className="splash-sky-canvas" aria-hidden="true" />

      {/* CAMADA 2: Símbolo Central Opção 03 + Assinatura "by Noos" */}
      <div className="splash-inner">
        <svg className="splash-mark" viewBox="0 0 120 120" aria-hidden="true">
          {/* Dipolo orbital kepleriano (-39.8° e -22°) + Anel de fase (+39.3°) */}
          <ellipse
            className="splash-orbit"
            cx={60}
            cy={58.75}
            rx={48.8}
            ry={19.5}
            transform="rotate(-39.8 60 58.75)"
            pathLength={100}
          />
          <ellipse
            className="splash-orbit is-secondary"
            cx={60}
            cy={58.75}
            rx={48.8}
            ry={11.5}
            transform="rotate(-22 60 58.75)"
            pathLength={100}
          />
          <ellipse
            className="splash-phase-ring"
            cx={58.75}
            cy={53.75}
            rx={34}
            ry={16}
            transform="rotate(39.3 58.75 53.75)"
          />

          {/* Asas da Constelação Sináptica */}
          <path
            className="splash-constellation"
            d="M 22.5 90 L 19 52 L 45 42.5 L 64 17 L 97.5 27.5"
            pathLength={100}
          />
          <path
            className="splash-constellation is-lower"
            d="M 22.5 90 L 57 96 L 72.5 65 L 102 63 L 97.5 27.5"
            pathLength={100}
          />
          <path className="splash-constellation-chord" d="M 19 52 L 64 17 M 57 96 L 102 63" />

          {/* Estrelas satélites da constelação do símbolo */}
          <g className="splash-stars">
            {INNER_STARS.map((star, i) => (
              <circle
                key={i}
                className={star.accent ? "splash-star-accent" : undefined}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                style={{ ["--i" as string]: i }}
              />
            ))}
          </g>

          {/* Trilha ascendente conectando P₁ → P₂ → P₃ → P₄ */}
          <path
            className="splash-path"
            d="M 22.5 90 L 45 42.5 L 72.5 65 L 97.5 27.5"
            pathLength={100}
          />

          {/* 3 nós anelares vazados (P₁, P₂, P₃) */}
          {NODES.map(([cx, cy], i) => (
            <circle
              key={i}
              className="splash-node"
              cx={cx}
              cy={cy}
              r={4.5}
              style={{ ["--i" as string]: i }}
            />
          ))}

          {/* Estrela-ápice P₄ + Halo de Ressonância */}
          <circle className="splash-end-halo" cx={97.5} cy={27.5} r={9.8} />
          <circle className="splash-end" cx={97.5} cy={27.5} r={6.5} />
        </svg>

        <div className="splash-foot">
          <span className="splash-rule" aria-hidden="true" />
          <span className="splash-by">
            <svg className="noos-mark" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="16" />
              <circle cx="60" cy="18" r="9" fill="currentColor" />
              <circle cx="18" cy="60" r="9" fill="currentColor" />
              <circle cx="60" cy="102" r="9" fill="currentColor" />
              <circle cx="102" cy="60" r="11" style={{ fill: "var(--noos-accent)" }} />
            </svg>
            <span className="splash-by-prefix">by</span>
            <em className="splash-by-brand">Noos</em>
          </span>
        </div>
      </div>
      {mode === "full" ? (
        <button type="button" className="splash-skip" onClick={finish}>
          {t("splash.skip")}
        </button>
      ) : null}
    </div>
  );
}
