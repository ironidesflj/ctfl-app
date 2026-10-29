"use client";

/* ===========================================================
   Synapse · Onboarding.tsx
   Primeira visita guiada + variante diálogo (reaberta pelo Sobre).

   Reconstruído na identidade Caderno (brand-spec): o onboarding É
   a Trilha Ascendente. Quatro estações ancoradas nos nós da marca
   (○ ○ ○ ●) costuradas por um filete — 01 o índice de recursos,
   02 uma questão para experimentar, 03 as dúvidas, 04 a partida.
   Nada de cartões de marketing: filetes, serifa conduz, margens
   largas; o violeta vive nos nós e na assinatura — o CTA continua
   vestindo a cor da prova. A demo usa os estilos reais da sessão
   de estudo: o primeiro contato com uma questão é com o app de
   verdade, não com um mock.

   O institucional (autor, prova social, feedback) NÃO se duplica —
   vive só na view Sobre; as métricas vivem no painel do Progresso.

   Acessibilidade (régua da spec onboarding-reentry): X, Esc e CTA
   fecham sem recarregar nem trocar de rota; diálogo com foco
   inicial, trap de foco, bloqueio de scroll e retorno de foco.
   =========================================================== */

import { useEffect, useRef, useState } from "react";
import { pad2, useSynapse } from "./store";

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* No boot, o onboarding monta por baixo do fade do splash: este é o
   intervalo em que um Esc ainda pertence ao splash (evita fechar o
   onboarding antes de ele sequer aparecer). Na variante diálogo
   (reaberta pelo Sobre) não há graça — o Esc atende na hora. */
const ESC_GRACE_FULL_MS = 420;

export function Onboarding({
  variant,
  onDismiss,
}: {
  variant: "full" | "dialog";
  onDismiss: () => void;
}) {
  const ss = useSynapse();
  const { t } = ss;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoAnswer, setDemoAnswer] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLHeadingElement | null>(null);
  const feedbackRef = useRef<HTMLHeadingElement | null>(null);
  const dismissRef = useRef(onDismiss);
  const mountedAtRef = useRef(0);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  /* a resposta trava as opções — o foco segue para a explicação,
     não cai no body (de onde o trap escaparia) */
  useEffect(() => {
    if (demoAnswer !== null) feedbackRef.current?.focus({ preventScroll: true });
  }, [demoAnswer]);

  /* diálogo acessível: foco, Esc, trap e bloqueio de scroll. Roda uma
     vez (onDismiss vive em ref) — re-render do pai não rouba o foco
     nem re-trava o scroll no meio da leitura. */
  useEffect(() => {
    mountedAtRef.current = Date.now();
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /* o foco inicial é o título do diálogo — não o X, que durante o
       crossfade do splash ainda está coberto pelo fade */
    heroRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        /* graça do crossfade: Esc nos primeiros milissegundos é do splash */
        if (variant === "full" && Date.now() - mountedAtRef.current < ESC_GRACE_FULL_MS) return;
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
  }, [variant]);

  const index = [
    { title: t("onboarding.featStudyTitle"), desc: t("onboarding.featStudyDesc") },
    { title: t("onboarding.featExamTitle"), desc: t("onboarding.featExamDesc") },
    { title: t("onboarding.featSrsTitle"), desc: t("onboarding.featSrsDesc") },
    { title: t("onboarding.featGlossaryTitle"), desc: t("onboarding.featGlossaryDesc") },
    { title: t("onboarding.featProgressTitle"), desc: t("onboarding.featProgressDesc") },
    { title: t("onboarding.featBilingualTitle"), desc: t("onboarding.featBilingualDesc") },
  ];

  const demoOptions = [
    t("onboarding.demoOptA"),
    t("onboarding.demoOptB"),
    t("onboarding.demoOptC"),
  ];
  const DEMO_CORRECT = 1;

  return (
    <div
      className={variant === "dialog" ? "ob-overlay is-dialog" : "ob-overlay"}
      role="dialog"
      aria-modal="true"
      aria-label={t("onboarding.titleAria")}
    >
      {/* textura ambiente: pontos, sem linhas (brand-spec) — só o céu
          de abertura da variante full, nunca atrás de texto */}
      {variant === "full" ? (
        <div className="ob-stars" aria-hidden="true">
          <svg viewBox="0 0 800 160" preserveAspectRatio="xMidYMin slice">
            <circle cx="46" cy="30" r="1.5" />
            <circle cx="158" cy="72" r="1" />
            <circle cx="268" cy="20" r="1.3" />
            <circle cx="384" cy="56" r=".9" />
            <circle cx="512" cy="26" r="1.4" />
            <circle cx="638" cy="76" r="1" />
            <circle cx="748" cy="40" r="1.2" />
            <circle cx="702" cy="128" r=".8" />
            <circle cx="96" cy="126" r=".9" />
            <circle cx="330" cy="118" r=".7" />
          </svg>
        </div>
      ) : null}
      <div className="ob-scroll" ref={dialogRef}>
        <div className="onboarding">
          <button
            type="button"
            className="ob-close"
            onClick={onDismiss}
            aria-label={t("onboarding.closeAria")}
          >
            ✕
          </button>

          {/* cabeceira do caderno */}
          <header className="ob-mast">
            <div className="ob-mast-top">
              <svg className="ob-mark" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M9 36 L18 17 L29 26 L39 11" />
                <circle className="hole" cx="9" cy="36" r="3.2" />
                <circle className="hole" cx="18" cy="17" r="3.2" />
                <circle className="hole" cx="29" cy="26" r="3.2" />
                <circle className="end" cx="39" cy="11" r="4.4" />
              </svg>
              <span className="ob-eyebrow">{t("onboarding.badge")}</span>
            </div>
            <h1 className="ob-hero" ref={heroRef} tabIndex={-1}>
              {t("onboarding.hero")}
            </h1>
            <p className="ob-subtitle">{t("onboarding.subtitle")}</p>
            <p className="ob-stats">
              <span>{t("onboarding.statsQuestions")}</span>
              <span aria-hidden="true">·</span>
              <span>{t("onboarding.statCerts")}</span>
              <span aria-hidden="true">·</span>
              <span>{t("onboarding.statLang")}</span>
              <span aria-hidden="true">·</span>
              <span>{t("onboarding.statFree")}</span>
            </p>
          </header>

          {/* a trilha: quatro estações nos nós da marca */}
          <ol className="ob-trail">
            {/* 01 · índice de recursos */}
            <li className="ob-step">
              <span className="ob-node" aria-hidden="true" />
              <section className="ob-step-body">
                <span className="ob-step-k" aria-hidden="true">
                  {pad2(1)}
                </span>
                <h2 className="ob-step-title">{t("onboarding.featuresTitle")}</h2>
                <ul className="ob-index">
                  {index.map((f, i) => (
                    <li className="ob-row" key={i}>
                      <span className="ob-row-num" aria-hidden="true">
                        {pad2(i + 1)}
                      </span>
                      <h3 className="ob-row-title">{f.title}</h3>
                      <p className="ob-row-desc">{f.desc}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </li>

            {/* 02 · experimente agora — mini-demo com os estilos reais */}
            <li className="ob-step">
              <span className="ob-node" aria-hidden="true" />
              <section className="ob-step-body">
                <span className="ob-step-k" aria-hidden="true">
                  {pad2(2)}
                </span>
                <h2 className="ob-step-title">{t("onboarding.demoTitle")}</h2>
                <p className="ob-demo-hint">{t("onboarding.demoHint")}</p>
                <div className="ob-qcard">
                  <p className="sim-q-meta">
                    <span className="sim-q-ch">{t("onboarding.demoDomain")}</span>
                    <span className="sim-q-k k1">K1</span>
                  </p>
                  <h3 className="q-title">{t("onboarding.demoQuestion")}</h3>
                  <fieldset
                    className="opts"
                    data-locked={demoAnswer !== null}
                    aria-label={t("a11y.answer")}
                  >
                    <legend className="sr-only">{t("a11y.answer")}</legend>
                    {demoOptions.map((text, i) => {
                      const isCorrect = demoAnswer !== null && i === DEMO_CORRECT;
                      const isWrong = demoAnswer === i && i !== DEMO_CORRECT;
                      const cls = isCorrect ? "opt is-correct" : isWrong ? "opt is-wrong" : "opt";
                      const tag = isCorrect ? (
                        <em className="opt-tag is-ok">{t("session.tagCorrect")}</em>
                      ) : isWrong ? (
                        <em className="opt-tag is-no">{t("session.tagYours")}</em>
                      ) : null;
                      return (
                        <label className={cls} key={i}>
                          <input
                            type="radio"
                            name="ob-demo"
                            value={i}
                            checked={demoAnswer === i}
                            disabled={demoAnswer !== null}
                            onChange={() => setDemoAnswer(i)}
                          />
                          <span className="opt-key" aria-hidden="true">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="opt-text">
                            {text}
                            {tag}
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>
                  {demoAnswer !== null ? (
                    <section
                      className="feedback"
                      data-result={demoAnswer === DEMO_CORRECT ? "ok" : "no"}
                    >
                      <h4 className="fb-head" ref={feedbackRef} tabIndex={-1}>
                        <span className="fb-mark" aria-hidden="true">
                          {demoAnswer === DEMO_CORRECT ? "✓" : "×"}
                        </span>
                        {demoAnswer === DEMO_CORRECT ? t("session.correct") : t("session.wrong")}
                      </h4>
                      <p className="fb-exp">{t("onboarding.demoExp")}</p>
                    </section>
                  ) : null}
                </div>
              </section>
            </li>

            {/* 03 · dúvidas frequentes */}
            <li className="ob-step">
              <span className="ob-node" aria-hidden="true" />
              <section className="ob-step-body">
                <span className="ob-step-k" aria-hidden="true">
                  {pad2(3)}
                </span>
                <h2 className="ob-step-title">{t("onboarding.faqTitle")}</h2>
                <div className="ob-faq">
                  {[1, 2, 3, 4, 5].map((n, i) => (
                    <div className="ob-faq-item" key={n}>
                      <button
                        type="button"
                        className="ob-faq-q"
                        aria-expanded={openFaq === i}
                        aria-controls={"ob-faq-p" + n}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span>{t("onboarding.faqQ" + n)}</span>
                        <span className="ob-faq-mark" aria-hidden="true">
                          {openFaq === i ? "−" : "+"}
                        </span>
                      </button>
                      {openFaq === i ? (
                        <div className="ob-faq-a" id={"ob-faq-p" + n}>
                          {t("onboarding.faqA" + n)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            </li>

            {/* 04 · a partida — o nó preenchido, o conhecimento validado */}
            <li className="ob-step" data-end="true">
              <span className="ob-node" aria-hidden="true" />
              <section className="ob-step-body ob-final">
                <span className="ob-step-k" aria-hidden="true">
                  {pad2(4)}
                </span>
                <h2 className="ob-step-title">{t("onboarding.finalTitle")}</h2>
                <button type="button" className="btn primary ob-cta" onClick={onDismiss}>
                  {variant === "dialog" ? t("onboarding.back") : t("onboarding.cta")}
                </button>
                <p className="ob-disclaimer">{t("onboarding.disclaimer")}</p>
                <p className="ob-sign">
                  <span>Synapse</span>
                  <span className="ob-sign-by">by Noos</span>
                </p>
              </section>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
