"use client";

/* ===========================================================
   Synapse · ReleaseNotes.tsx
   Modal "o que há de novo" — uma vez por versão (porta do
   ReleaseNotesModal do v3.18.0). Abre após o splash de atualização;
   fechar marca synapse.ver.v1 como visto.

   Mesma régua de acessibilidade dos diálogos do app: foco inicial,
   trap de foco, Esc, retorno de foco e bloqueio de scroll.
   =========================================================== */

import { useEffect, useRef } from "react";
import { useSynapse } from "./store";
import { CURRENT_RELEASE, releaseCopy } from "./data/releases";

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* idem ao onboarding: monta por baixo do fade do splash — o Esc dos
   primeiros milissegundos pertence ao splash, não às notas */
const ESC_GRACE_MS = 420;

export function ReleaseNotes({ onDismiss }: { onDismiss: () => void }) {
  const ss = useSynapse();
  const copy = releaseCopy(ss.state.lang);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const dismissRef = useRef(onDismiss);
  const mountedAtRef = useRef(0);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /* foco no título — não no X, ainda coberto pelo fade do splash */
    titleRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (Date.now() - mountedAtRef.current < ESC_GRACE_MS) return;
        event.preventDefault();
        event.stopPropagation();
        dismissRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const node = dialogRef.current;
      const focusable = Array.from(node?.querySelectorAll(FOCUSABLE) || []) as HTMLElement[];
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <div className="release-overlay">
      <section
        className="release-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="release-title"
      >
        <button type="button" className="release-close" onClick={onDismiss} aria-label={copy.close}>
          ×
        </button>
        <span className="release-eyebrow">
          {copy.eyebrow} v{CURRENT_RELEASE.version}
        </span>
        <h2 id="release-title" ref={titleRef} tabIndex={-1}>{copy.title}</h2>
        <p className="release-intro">{copy.intro}</p>
        <ul className="release-list">
          {copy.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button type="button" className="btn primary release-cta" onClick={onDismiss}>
          {copy.cta}
        </button>
      </section>
    </div>
  );
}
