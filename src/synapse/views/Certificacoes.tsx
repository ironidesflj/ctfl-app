"use client";

/* ===========================================================
   Synapse · views/Certificacoes.tsx
   Aba Certificações — porta fiel de js/certificacoes.js.
   Página de troca de prova. Uma prova por vez: trocar aqui muda
   o app inteiro. Provas sem banco não abrem — sem botão, sem
   link, sem storage. Nenhum número é inventado.
   =========================================================== */

import type { CSSProperties } from "react";
import { fmt, useSynapse } from "../store";
import { CERTS, CERT_ORDER } from "../data/certs";
import type { Cert, Lang } from "../types";
import { ViewFoot } from "./Hoje";

/* ---------- copy local (pt/en) — verbatim do protótipo ---------- */

interface CertCopy {
  kicker: string;
  title: string;
  lead: string;
  current: string;
  continue: string;
  available: string;
  availableSub: string;
  soon: string;
  soonSub: string;
  soonNote: string;
  legacyNote: string;
  facts: string;
  chapters: string;
  switch: string;
  active: string;
  soonBadge: string;
  legacyBadge: string;
  noBank: string;
  back: string;
  footnote: string;
  feedback: string;
}

const COPY: Record<Lang, CertCopy> = {
  pt: {
    kicker: "Certificações",
    title: "Uma prova por vez.",
    lead: "O app inteiro — plano, banco, progresso e cartões — fala só da prova ativa. Trocar é uma decisão, não um menu de navegação.",
    current: "Sua prova agora",
    continue: "Continuar em Hoje",
    available: "Disponíveis",
    availableSub: "Três provas com banco e regras oficiais",
    soon: "Em preparação",
    soonSub: "Sem banco, não há o que estudar",
    soonNote: "As provas em preparação não abrem. Nenhuma data é prometida.",
    legacyNote: "CTFL-AT permanece como arquivo, com conteúdo congelado e sem acesso.",
    facts: "{q} questões · {min} min · corte {pass}",
    chapters: "{n} capítulos",
    switch: "Estudar esta prova",
    active: "prova ativa",
    soonBadge: "em breve",
    legacyBadge: "arquivo",
    noBank: "sem banco",
    back: "Voltar ao app",
    footnote: "Uma prova por vez · cada prova guarda o próprio progresso",
    feedback: "Enviar feedback",
  },
  en: {
    kicker: "Certifications",
    title: "One exam at a time.",
    lead: "The whole app — plan, bank, progress and cards — speaks only for the active exam. Switching is a decision, not a navigation menu.",
    current: "Your exam now",
    continue: "Continue in Today",
    available: "Available",
    availableSub: "Three exams with a bank and official rules",
    soon: "In preparation",
    soonSub: "No bank, nothing to study",
    soonNote: "Exams in preparation do not open. No date is promised.",
    legacyNote: "CTFL-AT remains as an archive, with frozen content and no access.",
    facts: "{q} questions · {min} min · pass {pass}",
    chapters: "{n} chapters",
    switch: "Study this exam",
    active: "active exam",
    soonBadge: "coming soon",
    legacyBadge: "archive",
    noBank: "no bank",
    back: "Back to the app",
    footnote: "One exam at a time · each exam keeps its own progress",
    feedback: "Send feedback",
  },
};

/* ---------- constelações (as 6 provas) ---------- */

const SHAPES: Record<string, [number, number][]> = {
  ctfl: [
    [7, 28],
    [16, 11],
    [27, 21],
    [39, 7],
    [44, 17],
  ],
  "ctal-ta": [
    [6, 20],
    [15, 30],
    [22, 13],
    [33, 22],
    [43, 9],
  ],
  "ctal-tm": [
    [7, 9],
    [14, 24],
    [24, 15],
    [34, 28],
    [43, 12],
  ],
  "ct-ai": [
    [6, 27],
    [19, 8],
    [28, 25],
    [38, 11],
    [44, 29],
  ],
  "ctal-at": [
    [7, 12],
    [17, 27],
    [25, 9],
    [35, 24],
    [44, 14],
  ],
  "ctfl-at": [
    [6, 22],
    [18, 10],
    [27, 27],
    [38, 13],
    [43, 25],
  ],
};

/** svg.cert-const — polyline + nós, como a função constellation() do protótipo. */
function Constellation({ id }: { id: string }) {
  const pts = SHAPES[id] || SHAPES.ctfl;
  return (
    <svg className="cert-const" viewBox="0 0 50 36" aria-hidden="true">
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2.1} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Variáveis da prova para o tile: --cc/--cci/--ccs (cores, tinta e fundo). */
function tileStyle(id: string): CSSProperties {
  return {
    "--cc": `var(--cert-${id})`,
    "--cci": `var(--cert-${id}-ink)`,
    "--ccs": `var(--cert-${id}-soft)`,
  } as CSSProperties;
}

export function Certificacoes() {
  const ss = useSynapse();
  const { t } = ss;
  const lang = ss.state.lang;
  const copy = COPY[lang] || COPY.pt;
  const c = ss.cert();

  /* prova ativa sempre existe e é live (guardas do boot e do setCert) */
  const r = ss.readiness();
  const cov = ss.coverage(c);

  const live = CERT_ORDER.filter((id) => CERTS[id].status === "live");
  const soon = CERT_ORDER.filter((id) => CERTS[id].status === "soon");
  const legacy = CERT_ORDER.filter((id) => CERTS[id].status === "legacy");

  /* "{q} questões · {min} min · corte {pass}" — corte com denominal. */
  function facts(cert: Cert): string {
    if (!cert.exam) return copy.noBank;
    return fmt(copy.facts, {
      q: cert.exam.q,
      min: cert.exam.min,
      pass: cert.exam.pass + (cert.exam.scoring === "points" ? "/" + cert.exam.points : "/" + cert.exam.q),
    });
  }

  /* pick do protótipo: troca e, se trocou, vai para Hoje. */
  function pick(id: string) {
    if (ss.setCert(id)) ss.goTab("hoje");
  }

  return (
    <>
      <section className="hero empty-hero" data-od-id="certificacoes-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {copy.kicker} · {c.code}
          </span>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </section>

      <section className="cert-current" data-od-id="certificacoes-ativa" aria-labelledby="curTitle">
        <div className="cc-copy">
          <span className="ck">{copy.current}</span>
          <h2 id="curTitle">
            {c.code} · {c.name}
          </h2>
          <p>
            {facts(c)} · {fmt(copy.chapters, { n: c.chapters.length })}
          </p>
          <p className="cc-metric">
            {t("progress.readiness")} <b>{r.pct === null ? "—" : r.pct + "%"}</b>{" "}
            <span>
              · {t("progress.coverage")} {cov.pct}%
            </span>
          </p>
          <button type="button" className="btn primary" onClick={() => ss.goTab("hoje")}>
            {copy.continue}
          </button>
        </div>
        <div className="cc-mark" style={{ "--cc": `var(--cert-${c.id})` } as CSSProperties}>
          <Constellation id={c.id} />
        </div>
      </section>

      <section className="cert-section" data-od-id="certificacoes-disponiveis" aria-labelledby="liveTitle">
        <div className="pg-head">
          <h2 id="liveTitle">{copy.available}</h2>
          <span>{copy.availableSub}</span>
        </div>
        <div className="cert-grid">
          {live.map((id) => {
            const cert = CERTS[id];
            const current = id === c.id;
            return (
              <button
                type="button"
                key={id}
                className="cert-tile is-live"
                style={tileStyle(id)}
                onClick={() => pick(id)}
              >
                <span className="ct-top">
                  <span className="ct-code">{cert.code}</span>
                  <span className="ct-ver">{cert.version}</span>
                  {current ? <span className="ct-badge">{copy.active}</span> : null}
                </span>
                <Constellation id={id} />
                <span className="ct-name">{cert.name}</span>
                <span className="ct-facts">{facts(cert)}</span>
                <span className="ct-chapters">{fmt(copy.chapters, { n: cert.chapters.length })}</span>
                <span className="ct-go">
                  {current ? copy.continue : copy.switch}
                  <i aria-hidden="true">→</i>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="cert-section" data-od-id="certificacoes-em-breve" aria-labelledby="soonTitle">
        <div className="pg-head">
          <h2 id="soonTitle">{copy.soon}</h2>
          <span>{copy.soonSub}</span>
        </div>
        <div className="cert-grid">
          {soon.concat(legacy).map((id) => {
            const cert = CERTS[id];
            const badge = cert.status === "soon" ? copy.soonBadge : copy.legacyBadge;
            return (
              /* protótipo: aria-disabled no tile sem banco — sinal explícito
                 de que a prova não abre; jsx-a11y não aceita em role article. */
              // eslint-disable-next-line jsx-a11y/role-supports-aria-props
              <article
                key={id}
                className={`cert-tile is-${cert.status}`}
                aria-disabled="true"
                style={tileStyle(id)}
              >
                <span className="ct-top">
                  <span className="ct-code">{cert.code}</span>
                  <span className="ct-ver">{cert.version}</span>
                  <span className="ct-badge muted">{badge}</span>
                </span>
                <Constellation id={id} />
                <span className="ct-name">{cert.name}</span>
                <span className="ct-facts">{cert.status === "soon" ? copy.soonSub : copy.noBank}</span>
              </article>
            );
          })}
        </div>
        <p className="pg-note">
          {copy.soonNote} {copy.legacyNote}
        </p>
      </section>

      <ViewFoot label={copy.footnote} tail={`Synapse · ${copy.kicker}`} />
    </>
  );
}
