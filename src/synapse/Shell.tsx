"use client";

/* ===========================================================
   Synapse · Shell.tsx
   A casca única do handoff (js/shell.js + HTML das páginas):
   cabeçalho, trilho, navegação secundária, menu Mais, idioma,
   tema e troca de views. Nenhuma view implementa a própria casca.

   SPA: as oito páginas do protótipo são views client-side. A troca
   de prova re-renderiza tudo; a troca de aba remonta a view (como o
   carregamento de uma página nova no protótipo).
   =========================================================== */

import { useEffect, useRef, useState } from "react";
import { pad2, useSynapse } from "./store";
import type { TabId } from "./types";
import { Hoje } from "./views/Hoje";
import { Estudar } from "./views/Estudar";
import { Simulado } from "./views/Simulado";
import { Flashcards } from "./views/Flashcards";
import { Syllabus } from "./views/Syllabus";
import { Progresso } from "./views/Progresso";
import { Certificacoes } from "./views/Certificacoes";
import { Glossario } from "./views/Glossario";
import { Sobre } from "./views/Sobre";
import { ConstellationSplash } from "./Splash";
import { Onboarding } from "./Onboarding";
import { ReleaseNotes } from "./ReleaseNotes";
import { InstallPrompt } from "./InstallPrompt";
import { UpdateToast } from "./UpdateToast";
import {
  bootMode,
  markOnboardingDone,
  markVersionSeen,
  markVisitEnded,
  type BootMode,
} from "./boot";

const PRIMARY: TabId[] = ["hoje", "estudar", "simulado", "flashcards", "syllabus", "progresso"];
const SECONDARY: TabId[] = ["glossary", "about", "certs"];
/** Abas que dependem do banco de questões (esqueleto enquanto carrega). */
const BANK_TABS: TabId[] = ["hoje", "estudar", "simulado", "flashcards", "progresso"];

function BrandMark() {
  return (
    <img
      className="mark"
      src={`${import.meta.env.BASE_URL}brand/synapse-mark-compact.svg`}
      alt=""
    />
  );
}

function NoosMark() {
  return (
    <svg className="noos-mark" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="16" />
      <circle cx="60" cy="18" r="9" fill="currentColor" />
      <circle cx="18" cy="60" r="9" fill="currentColor" />
      <circle cx="60" cy="102" r="9" fill="currentColor" />
      <circle cx="102" cy="60" r="11" style={{ fill: "var(--noos-accent)" }} />
    </svg>
  );
}

function ViewSkeleton() {
  return (
    <div className="view-skeleton" aria-hidden="true">
      <div className="sk-line w35" />
      <div className="sk-line w60" />
      <div className="sk-block" />
      <div className="sk-grid">
        <div className="sk-block" />
        <div className="sk-block" />
        <div className="sk-block" />
      </div>
    </div>
  );
}

function ViewError() {
  const { t } = useSynapse();
  return (
    <section className="hero empty-hero">
      <div>
        <h1>{t("study.emptyTitle")}</h1>
        <p className="lead">{t("study.emptyBody")}</p>
      </div>
    </section>
  );
}

/* ---------- boot: constelação → onboarding / notas de versão ----------

   Três momentos (decididos uma vez por carregamento, em boot.ts):
   first  → splash completo + onboarding de primeira visita;
   update → splash completo + notas de versão;
   return → splash completo após 12 horas fora, sem novo diálogo;
   quick  → splash breve, mesmo quando o banco já está pronto. Só depois do boot os
            overlays de PWA (install/toast) podem aparecer.

   Anti-flash (r12): a casca não aparece nem antes nem depois da
   constelação. Antes: o script inline do layout marca <html
   data-boot>, escondendo topo e trilho até o splash montar por
   cima. Depois: onReveal dispara no INÍCIO do fade — o próximo
   passo (onboarding/notas) monta por baixo do splash que ainda
   cobre a tela — e onDone só no fim, quando o fade já revelou o
   destino. O splash permanece montado através das fases para não
   reiniciar as animações. */

interface BootState {
  mode: BootMode;
  phase: "splash" | "flow" | "done";
}

function BootFlow({ onSettled }: { onSettled: () => void }) {
  const [boot, setBoot] = useState<BootState | null>(null);

  useEffect(() => {
    /* decide o momento uma vez por carregamento — em microtask para
       não encadear render síncrono no primeiro efeito. A capa inline
       (html[data-boot]) segura a casca até o splash montar por cima:
       o intervalo entre pintura e splash fica coberto, sem flash. */
    const id = window.setTimeout(() => setBoot({ mode: bootMode(), phase: "splash" }), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!boot) return null;

  const splash =
    boot.phase !== "done" ? (
      <ConstellationSplash
        mode={boot.mode === "quick" ? "quick" : "full"}
        onReveal={() => setBoot((b) => (b ? { ...b, phase: "flow" } : b))}
        onDone={() => {
          if (boot.mode === "quick" || boot.mode === "return") onSettled();
          setBoot((b) => (b ? { ...b, phase: "done" } : b));
        }}
      />
    ) : null;

  /* a partir do flow, o destino já está montado por baixo do fade */
  const overlay =
    boot.phase === "splash" ? null : boot.mode === "first" ? (
      <Onboarding
        variant="full"
        onDismiss={() => {
          markOnboardingDone();
          markVersionSeen();
          setBoot(null);
          onSettled();
        }}
      />
    ) : boot.mode === "update" ? (
      <ReleaseNotes
        onDismiss={() => {
          markVersionSeen();
          setBoot(null);
          onSettled();
        }}
      />
    ) : null;

  return (
    <>
      {splash}
      {overlay}
    </>
  );
}

export function Shell() {
  const ss = useSynapse();
  const { state, tab, goTab, t, links } = ss;
  const [moreOpen, setMoreOpen] = useState(false);
  const [bootSettled, setBootSettled] = useState(false);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") markVisitEnded();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", markVisitEnded);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", markVisitEnded);
    };
  }, []);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const c = ss.cert();

  /* altura real do topo em --header-h (como o shell do protótipo) */
  useEffect(() => {
    const onResize = () => {
      const top = document.querySelector(".top");
      document.documentElement.style.setProperty(
        "--header-h",
        (top ? Math.round(top.getBoundingClientRect().height) : 64) + "px"
      );
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openMore = (focusIt: boolean) => {
    setMoreOpen(true);
    if (focusIt) {
      window.setTimeout(() => {
        const first = moreMenuRef.current?.querySelector("button, a");
        if (first instanceof HTMLElement) first.focus();
      }, 0);
    }
  };
  const closeMore = (focusBtn: boolean) => {
    setMoreOpen(false);
    if (focusBtn) moreBtnRef.current?.focus();
  };

  /* clique fora e Esc fecham o Mais; Esc com Mais aberto não desce à view */
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        moreOpen &&
        moreMenuRef.current &&
        moreBtnRef.current &&
        !moreMenuRef.current.contains(target) &&
        !moreBtnRef.current.contains(target)
      ) {
        closeMore(false);
      }
    }
    function onDocKey(e: KeyboardEvent) {
      if (e.key === "Escape" && moreOpen) {
        e.stopPropagation();
        e.preventDefault();
        closeMore(true);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onDocKey, true);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onDocKey, true);
    };
  }, [moreOpen]);

  const needsBank = BANK_TABS.includes(tab);
  const viewContent =
    !ss.mounted || (needsBank && ss.bankStatus === "loading") ? (
      <ViewSkeleton />
    ) : needsBank && ss.bankStatus === "error" ? (
      <ViewError />
    ) : null;

  const viewByTab: Record<TabId, React.ReactNode> = {
    hoje: <Hoje />,
    estudar: <Estudar />,
    simulado: <Simulado />,
    flashcards: <Flashcards />,
    syllabus: <Syllabus />,
    progresso: <Progresso />,
    glossary: <Glossario />,
    about: <Sobre />,
    certs: <Certificacoes />,
  };

  return (
    <>
      <a className="skip" href="#main">
        {t("skip")}
      </a>

      <header className="top">
        <div className="top-inner">
          <button
            type="button"
            className="brand"
            onClick={() => goTab("hoje")}
            aria-label="Synapse — início"
          >
            <BrandMark />
            <span className="brand-name">Synapse</span>
            <span className="endorse">
              <NoosMark />
              by Noos
            </span>
          </button>

          <span className="top-spacer" />

          <div className="tools">
            <button
              type="button"
              className="cert-btn"
              onClick={() => goTab("certs")}
              aria-label={t("cert.change") + ": " + c.code}
            >
              <span className="cert-dot" aria-hidden="true" />
              <span id="certCode">{c.code}</span>
              <svg className="chev" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="m3 5 4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="seg" role="group" aria-label={t("tools.lang")}>
              <button
                type="button"
                data-lang="pt"
                aria-pressed={state.lang === "pt"}
                onClick={() => ss.setLang("pt")}
              >
                PT
              </button>
              <button
                type="button"
                data-lang="en"
                aria-pressed={state.lang === "en"}
                onClick={() => ss.setLang("en")}
              >
                EN
              </button>
            </div>

            <button
              className="icon-btn"
              id="themeBtn"
              type="button"
              aria-label={t("tools.theme")}
              onClick={() => ss.setTheme(state.theme === "dark" ? "light" : "dark")}
            >
              <svg
                className="i-sun"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
              </svg>
              <svg
                className="i-moon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="app">
        <nav className="rail" id="rail" aria-label={t("nav.label")}>
          <div className="rail-primary">
            {PRIMARY.map((item, i) => (
              <button
                key={item}
                type="button"
                className="rail-link"
                data-nav={item}
                aria-current={tab === item ? "page" : undefined}
                onClick={() => goTab(item)}
              >
                <span className="r-idx" aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                {t("nav." + item)}
              </button>
            ))}
          </div>
          <div className="rail-secondary" role="group" aria-label={t("nav.secondary")}>
            {SECONDARY.map((item) => (
              <button
                key={item}
                type="button"
                className="rail-link"
                data-nav={item}
                aria-current={tab === item ? "page" : undefined}
                onClick={() => goTab(item)}
              >
                {t("nav." + item)}
              </button>
            ))}
            <a
              className="rail-link rail-feedback"
              href={links.feedback}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("nav.feedback")}
              <span className="ext" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
          <button
            type="button"
            className="nav-more"
            data-nav="more"
            ref={moreBtnRef}
            aria-expanded={moreOpen}
            aria-controls="moreMenu"
            onClick={() => (moreOpen ? closeMore(true) : openMore(true))}
          >
            {t("nav.more")}
          </button>
        </nav>

        <main className="main" id="main" tabIndex={-1}>
          <div className="view" id="view">
            {viewContent ?? <div key={`${state.cert}:${ss.navSeq}`}>{viewByTab[tab]}</div>}
          </div>
        </main>
      </div>

      <div
        className="more-menu"
        id="moreMenu"
        role="group"
        aria-label={t("nav.more")}
        hidden={!moreOpen}
        ref={moreMenuRef}
      >
        <button
          type="button"
          onClick={() => {
            closeMore(false);
            goTab("syllabus");
          }}
        >
          {t("nav.syllabus")}
        </button>
        <button
          type="button"
          onClick={() => {
            closeMore(false);
            goTab("glossary");
          }}
        >
          {t("nav.glossary")}
        </button>
        <button
          type="button"
          onClick={() => {
            closeMore(false);
            goTab("about");
          }}
        >
          {t("nav.about")}
        </button>
        <button
          type="button"
          onClick={() => {
            closeMore(false);
            goTab("certs");
          }}
        >
          {t("nav.certs")}
        </button>
        <a href={links.feedback} target="_blank" rel="noopener noreferrer">
          {t("nav.feedback")}
          <span className="ext" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>

      <noscript>
        <p style={{ maxWidth: "60ch", margin: "24px", font: "15px/1.6 system-ui,sans-serif" }}>
          O Synapse precisa de JavaScript para trocar de prova, registrar o check-in e guardar o
          progresso neste dispositivo.
        </p>
      </noscript>

      {/* boot (splash → onboarding/notas) + overlays de PWA; o “Como
          funciona” reaberto pelo Sobre usa a variante diálogo */}
      <BootFlow
        onSettled={() => {
          setBootSettled(true);
          /* o app assume a tela: foco no conteúdo e aviso educado no
             live region (leitor de tela sabe que chegou a vez do app) */
          document.getElementById("main")?.focus({ preventScroll: true });
          ss.announce(t("splash.ready"));
        }}
      />
      {ss.howOpen ? <Onboarding variant="dialog" onDismiss={() => ss.setHowOpen(false)} /> : null}
      <InstallPrompt active={bootSettled && !ss.howOpen} />
      <UpdateToast />
    </>
  );
}
