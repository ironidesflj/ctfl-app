"use client";

/* ===========================================================
   Synapse · Splash.tsx
   A constelação da marca contando a própria história de origem
   (brand-spec: "Trilha Ascendente"). O traço contínuo se desenha
   de baixo-esquerda para cima-direita, os nós intermediários
   acendem como anéis e o nó final — o conhecimento validado —
   preenche fechando a animação.

   Três momentos (boot.ts decide qual):
   · full  → primeira abertura e atualização de versão (~3,6s,
             sempre pulável: clique, Esc ou botão)
   · quick → toda abertura com a mesma versão: cobre o app enquanto
             o banco carrega e some assim que ele responde (mínimo
             450ms, teto 1,3s — nunca segura o app)

   Anti-flash (r12): o layout marca <html data-boot> antes da
   primeira pintura; a capa é retirada AQUI no início do fade —
   durante todo o splash a casca segue invisível (nada focável
   por baixo do overlay opaco). Ele nasce opaco — sem fade de
   entrada — para nunca revelar a casca. No fim, onReveal avisa
   o pai no início do fade (o próximo passo monta já por baixo)
   e onDone só no final.

   prefers-reduced-motion → símbolo estático, sem animação.
   =========================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSynapse } from "./store";

const FULL_MS = 3600;
const QUICK_MIN_MS = 450;
const QUICK_MAX_MS = 1300;
const REDUCED_MS = 350;
const FADE_MS = 360;

export function ConstellationSplash({
  mode,
  onReveal,
  onDone,
}: {
  mode: "full" | "quick";
  /** chamado no início do fade — o pai monta o próximo passo por baixo */
  onReveal: () => void;
  /** chamado no final do fade — o pai desmonta o splash */
  onDone: () => void;
}) {
  const { t, bankStatus } = useSynapse();
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);
  const bankRef = useRef(bankStatus);
  const revealRef = useRef(onReveal);
  const doneCbRef = useRef(onDone);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    bankRef.current = bankStatus;
  }, [bankStatus]);
  useEffect(() => {
    revealRef.current = onReveal;
  }, [onReveal]);
  useEffect(() => {
    doneCbRef.current = onDone;
  }, [onDone]);

  /* se o splash for desmontado no meio do fade (Esc decidido lá na
     frente), o timeout pendente não dispara em componente morto */
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    /* a capa anti-flash do layout se retira agora, no início do fade:
       é o momento em que o destino assume a tela (overlay com trap
       de foco no full; a própria casca no quick) */
    document.documentElement.removeAttribute("data-boot");
    setFading(true);
    revealRef.current();
    fadeTimerRef.current = window.setTimeout(() => doneCbRef.current(), FADE_MS);
  }, []);

  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    const start = Date.now();

    if (reduced || mode === "full") {
      const id = window.setTimeout(finish, reduced ? REDUCED_MS : FULL_MS);
      return () => window.clearTimeout(id);
    }

    /* quick: espera o banco (com piso de leitura) — nunca passa do teto */
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

  /* full é sempre pulável: Esc, Enter, Espaço ou clique em qualquer
     lugar. Durante o fade o listener se cala — o Esc seguinte
     pertence ao passo que já montou por baixo (não dispara duas
     ações com uma tecla só). */
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

  const nodes: Array<[number, number]> = [
    [9, 36],
    [18, 17],
    [29, 26],
  ];

  return (
    <div
      className="splash"
      data-mode={mode}
      data-fading={fading ? "true" : "false"}
      role="presentation"
      onClick={mode === "full" ? finish : undefined}
    >
      <div className="splash-inner">
        <svg className="splash-mark" viewBox="0 0 96 60" aria-hidden="true">
          {/* textura ambiente: pontos, sem linhas (brand-spec) */}
          <g className="splash-stars">
            <circle cx="6" cy="8" r=".9" style={{ ["--i" as string]: 0 }} />
            <circle cx="30" cy="4" r=".7" style={{ ["--i" as string]: 1 }} />
            <circle cx="58" cy="9" r=".8" style={{ ["--i" as string]: 2 }} />
            <circle cx="88" cy="16" r=".6" style={{ ["--i" as string]: 3 }} />
            <circle cx="14" cy="34" r=".6" style={{ ["--i" as string]: 4 }} />
            <circle cx="46" cy="44" r=".8" style={{ ["--i" as string]: 5 }} />
            <circle cx="76" cy="50" r=".7" style={{ ["--i" as string]: 6 }} />
            <circle cx="90" cy="40" r=".6" style={{ ["--i" as string]: 7 }} />
          </g>
          {/* a única linha no céu é a da marca */}
          <g className="splash-fig" transform="translate(14 10)">
            <path className="splash-path" d="M9 36 L18 17 L29 26 L39 11" pathLength={100} />
            {nodes.map(([cx, cy], i) => (
              <circle
                key={i}
                className="splash-node"
                cx={cx}
                cy={cy}
                r={3.1}
                style={{ ["--i" as string]: i }}
              />
            ))}
            <circle className="splash-end" cx={39} cy={11} r={4.4} />
          </g>
        </svg>
        <div className="splash-word">
          <span className="splash-name">Synapse</span>
          <span className="splash-by">by Noos</span>
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
