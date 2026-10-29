"use client";

/* ===========================================================
   Synapse · views/Sobre.tsx
   Aba Sobre — porta fiel de js/sobre.js. Origem, promessa,
   limites, fontes oficiais, ecossistema Noos, autoria e
   feedback. Copy local completo (pt/en), sem resumo.
   =========================================================== */

import { useSynapse } from "../store";
import type { Lang } from "../types";
import { ViewFoot } from "./Hoje";

/* ---------- copy local (pt/en) — verbatim do protótipo ---------- */

interface SobreCopy {
  kicker: string;
  title: string;
  lead: string;
  cta: string;
  markCaption: string;
  tocLabel: string;
  toc: [string, string][];
  whyTitle: string;
  why: string[];
  deliverTitle: string;
  deliver: [string, string][];
  limitsTitle: string;
  faqTitle: string;
  faq: [string, string][];
  limits: string[];
  noosTitle: string;
  noos: string[];
  sourcesTitle: string;
  sourcesLead: string;
  sources: [string, string, string][];
  authorTitle: string;
  authorName: string;
  authorRole: string;
  authorBody: string;
  authorLinks: [string, string][];
  feedbackTitle: string;
  feedbackBody: string;
  feedbackCta: string;
  feedbackNote: string;
  stateTitle: string;
  state: [string, string][];
  footnote: string;
  back: string;
  howCta: string;
}

const COPY: Record<Lang, SobreCopy> = {
  pt: {
    kicker: "Sobre · Synapse",
    title: "A rotina que aprende com você.",
    lead: "O Synapse nasceu de uma constatação simples: decorar questões não prepara ninguém para a prova. Cada resposta precisa virar evidência — e a evidência decide qual é a próxima pergunta.",
    cta: "Começar pelo CTFL",
    markCaption: "Erro → evidência → revisão → prova.",
    tocLabel: "Nesta página",
    toc: [
      ["porque", "Por que nasceu"],
      ["entrega", "O que entrega"],
      ["limites", "O que não é"],
      ["noos", "Noos"],
      ["fontes", "Fontes"],
      ["autor", "Autor"],
      ["feedback", "Feedback"],
    ],
    whyTitle: "Por que ele nasceu.",
    why: [
      "O Synapse começou como um projeto pessoal de estudo para a certificação CTFL. A constatação foi simples: um banco de questões com cronômetro mede pressa, não preparo. O que faltava era memória do erro — saber o que já foi visto, o que voltou errado e o que ainda não foi tocado.",
      "A resposta foi tratar cada resposta como evidência. O erro vira cartão, o cartão volta na hora certa, a cobertura mostra o buraco e a prontidão pondera o peso de cada capítulo. Nada é estimado por cima: o que não foi respondido continua visível como lacuna.",
      "O app é feito por um QA Analyst, para quem está na mesma travessia. É gratuito, não pede conta e guarda o progresso no próprio dispositivo. O código é aberto para leitura e para apontar erros.",
    ],
    deliverTitle: "O que ele entrega.",
    deliver: [
      [
        "Evidência, não decoreba",
        "Cada questão conferida alimenta cobertura, acerto e prontidão. Repetir a mesma questão não infla a cobertura — só a primeira vez conta como avanço.",
      ],
      [
        "Revisão espaçada",
        "O erro volta na mesma fila; o acerto ganha intervalo. A agenda é local e explícita: errei, quase, lembrei.",
      ],
      [
        "Regras oficiais",
        "Peso por capítulo, quantidade de questões, tempo e corte vêm do blueprint público de cada prova. O app não inventa syllabus para preencher tela.",
      ],
      [
        "Sem fricção",
        "PT-BR e EN, tema claro e escuro, instalável como app e utilizável offline. Sem login, sem anúncio, sem plano pago.",
      ],
    ],
    limitsTitle: "O que ele não é.",
    faqTitle: "Perguntas diretas",
    faq: [
      [
        "Preciso me cadastrar?",
        "Não. Tudo funciona sem login; o progresso fica neste dispositivo.",
      ],
      ["É realmente gratuito?", "Sim. Sem anúncio, sem plano pago e sem pegadinha."],
      [
        "O conteúdo é oficial do ISTQB?",
        "É baseado nos syllabus e no glossário públicos do ISTQB. O app não é afiliado ao ISTQB.",
      ],
      [
        "Funciona no celular e offline?",
        "Sim. É instalável como app (PWA), funciona offline e alterna PT/EN a qualquer momento.",
      ],
    ],
    limits: [
      "Não é afiliado ao ISTQB. O conteúdo é baseado nos syllabus e no glossário públicos; o app é independente.",
      "Não é um despejo de questões. Sem banco, a prova aparece como “em breve” — e não abre.",
      "Não é uma conta na nuvem. O progresso fica neste dispositivo; sincronizar entre aparelhos ainda não existe.",
      "Não coleta dado de estudo. O feedback é público e opcional, e não deve levar dado pessoal nem resultado de prova.",
    ],
    noosTitle: "Synapse e Noos.",
    noos: [
      "O Synapse faz parte do Noos, um conjunto de ferramentas para estudar com mais clareza. Conheça as outras ferramentas em noos.study.",
      "Seu estudo aqui é gratuito, funciona sem conta e fica salvo neste dispositivo. Ao trocar de certificação, cada prova mantém seu próprio progresso.",
    ],
    sourcesTitle: "Fontes oficiais.",
    sourcesLead:
      "Peso, corte, tempo, K-level e definições vêm das publicações públicas do ISTQB. Os links abaixo são a fonte primária; o app não substitui o syllabus.",
    sources: [
      [
        "ISTQB — certificações e syllabus",
        "https://www.istqb.org/certifications",
        "Regras de exame, pesos e versões.",
      ],
      [
        "ISTQB Glossary",
        "https://glossary.istqb.org/",
        "Definições oficiais dos termos do glossário.",
      ],
      [
        "CTFL v4.0 · Foundation Level",
        "https://www.istqb.org/certifications/certified-tester-foundation-level",
        "Base da prova de entrada.",
      ],
      [
        "CTAL-TA v4.0 · Test Analyst",
        "https://www.istqb.org/certifications/test-analyst",
        "Análise e design de teste.",
      ],
      [
        "CTAL-TM v3.0 · Test Manager",
        "https://www.istqb.org/certifications/test-manager",
        "Gestão das atividades de teste.",
      ],
      ["Noos — hub", "https://noos.study/pt/", "O ecossistema onde o Synapse vive."],
    ],
    authorTitle: "Quem faz.",
    authorName: "Ironides Francisco",
    authorRole: "QA Analyst · projeto pessoal de estudo e portfólio",
    authorBody:
      "Trabalho com qualidade de software e construí o Synapse para organizar a própria preparação para as certificações ISTQB. O app é o caderno que eu queria ter: honesto sobre o que ainda falta, sem transformar estudo em ranking.",
    authorLinks: [
      ["GitHub", "https://github.com/ironidesflj"],
      ["LinkedIn", "https://linkedin.com/in/ironjunior"],
      ["Repositório do projeto", "https://github.com/ironidesflj/ctfl-app"],
    ],
    feedbackTitle: "Feedback é parte do produto.",
    feedbackBody:
      "Encontrou um número errado, um termo desatualizado ou uma frase confusa? Abra uma issue pública. É o canal mais direto e fica registrado para todo mundo.",
    feedbackCta: "Abrir uma issue no GitHub",
    feedbackNote:
      "Não envie dados pessoais, resultados de prova ou conteúdo de terceiros. O feedback é público.",
    stateTitle: "Estado desta versão",
    state: [
      ["Provas", "3 com banco · 2 em preparação · 1 arquivo"],
      ["Idiomas", "PT-BR + EN"],
      ["Dados", "local-first · sem conta"],
      ["Última atualização", "outubro de 2026"],
    ],
    footnote: "Synapse não é afiliado ao ISTQB.",
    back: "Voltar ao app",
    howCta: "Como funciona",
  },
  en: {
    kicker: "About · Synapse",
    title: "A routine that learns with you.",
    lead: "Synapse began with a simple realisation: memorising questions does not prepare anyone for the exam. Every answer has to become evidence — and evidence decides the next question.",
    cta: "Start with CTFL",
    markCaption: "Error → evidence → review → exam.",
    tocLabel: "On this page",
    toc: [
      ["porque", "Why it exists"],
      ["entrega", "What it delivers"],
      ["limites", "What it is not"],
      ["noos", "Noos"],
      ["fontes", "Sources"],
      ["autor", "Author"],
      ["feedback", "Feedback"],
    ],
    whyTitle: "Why it exists.",
    why: [
      "Synapse started as a personal study project for the CTFL exam. The realisation was simple: a question bank with a timer measures haste, not preparation. What was missing was memory of error — knowing what had been seen, what came back wrong and what had not been touched yet.",
      "The answer was to treat every answer as evidence. A miss becomes a card, the card returns at the right time, coverage shows the gap and readiness weighs each chapter. Nothing is estimated on top: what has not been answered stays visible as a gap.",
      "The app is made by a QA Analyst, for people on the same journey. It is free, asks for no account and keeps progress on the device. The code is open for reading and for pointing out mistakes.",
    ],
    deliverTitle: "What it delivers.",
    deliver: [
      [
        "Evidence, not memorisation",
        "Every checked question feeds coverage, accuracy and readiness. Answering the same question twice does not inflate coverage — only the first time counts as progress.",
      ],
      [
        "Spaced repetition",
        "A miss returns in the same queue; a hit earns an interval. The schedule is local and explicit: missed, almost, remembered.",
      ],
      [
        "Official rules",
        "Chapter weight, question count, time and pass mark come from each exam’s public blueprint. The app does not invent a syllabus to fill a screen.",
      ],
      [
        "No friction",
        "PT-BR and EN, light and dark, installable as an app and usable offline. No login, no ads, no paid plan.",
      ],
    ],
    limitsTitle: "What it is not.",
    faqTitle: "Direct questions",
    faq: [
      [
        "Do I need an account?",
        "No. Everything works without login; progress stays on this device.",
      ],
      ["Is it really free?", "Yes. No ads, no paid plan, no catch."],
      [
        "Is the content official ISTQB?",
        "It is based on ISTQB’s public syllabi and glossary. The app is not affiliated with ISTQB.",
      ],
      [
        "Does it work on mobile and offline?",
        "Yes. It installs as an app (PWA), works offline and switches PT/EN at any time.",
      ],
    ],
    limits: [
      "It is not affiliated with ISTQB. Content is based on public syllabi and the glossary; the app is independent.",
      "It is not a question dump. Without a bank, the exam appears as “coming soon” — and does not open.",
      "It is not a cloud account. Progress stays on this device; cross-device sync does not exist yet.",
      "It does not collect study data. Feedback is public and optional, and must not carry personal data or exam results.",
    ],
    noosTitle: "Synapse and Noos.",
    noos: [
      "Synapse is part of Noos, a collection of tools for clearer studying. Explore the other tools at noos.study.",
      "Studying here is free, needs no account and stays saved on this device. Each certification keeps its own progress when you switch exams.",
    ],
    sourcesTitle: "Official sources.",
    sourcesLead:
      "Weight, pass mark, time, K-levels and definitions come from ISTQB’s public publications. The links below are the primary source; the app does not replace the syllabus.",
    sources: [
      [
        "ISTQB — certifications and syllabi",
        "https://www.istqb.org/certifications",
        "Exam rules, weights and versions.",
      ],
      ["ISTQB Glossary", "https://glossary.istqb.org/", "Official definitions for glossary terms."],
      [
        "CTFL v4.0 · Foundation Level",
        "https://www.istqb.org/certifications/certified-tester-foundation-level",
        "The entry exam.",
      ],
      [
        "CTAL-TA v4.0 · Test Analyst",
        "https://www.istqb.org/certifications/test-analyst",
        "Test analysis and design.",
      ],
      [
        "CTAL-TM v3.0 · Test Manager",
        "https://www.istqb.org/certifications/test-manager",
        "Test management activities.",
      ],
      ["Noos — hub", "https://noos.study/pt/", "The ecosystem where Synapse lives."],
    ],
    authorTitle: "Who makes it.",
    authorName: "Ironides Francisco",
    authorRole: "QA Analyst · personal study and portfolio project",
    authorBody:
      "I work with software quality and built Synapse to organise my own ISTQB preparation. The app is the notebook I wanted: honest about what is still missing, without turning study into a ranking.",
    authorLinks: [
      ["GitHub", "https://github.com/ironidesflj"],
      ["LinkedIn", "https://linkedin.com/in/ironjunior"],
      ["Project repository", "https://github.com/ironidesflj/ctfl-app"],
    ],
    feedbackTitle: "Feedback is part of the product.",
    feedbackBody:
      "Found a wrong number, an outdated term or a confusing sentence? Open a public issue. It is the most direct channel and stays on record for everyone.",
    feedbackCta: "Open a GitHub issue",
    feedbackNote:
      "Do not send personal data, exam results or third-party content. Feedback is public.",
    stateTitle: "This version",
    state: [
      ["Exams", "3 with a bank · 2 in preparation · 1 archive"],
      ["Languages", "PT-BR + EN"],
      ["Data", "local-first · no account"],
      ["Last update", "October 2026"],
    ],
    footnote: "Synapse is not affiliated with ISTQB.",
    back: "Back to the app",
    howCta: "How it works",
  },
};

/* ---------- mark da figura (erro → evidência → revisão → prova) ---------- */

function Mark() {
  return (
    <svg className="ab-mark" viewBox="0 0 200 200" aria-hidden="true">
      <path
        d="M34 150 L76 72 L120 112 L166 44"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={34} cy={150} r={7} fill="var(--surface)" stroke="currentColor" strokeWidth={3} />
      <circle cx={76} cy={72} r={7} fill="var(--surface)" stroke="currentColor" strokeWidth={3} />
      <circle cx={120} cy={112} r={7} fill="var(--surface)" stroke="currentColor" strokeWidth={3} />
      <circle cx={166} cy={44} r={10} fill="currentColor" />
      <text x={34} y={178} textAnchor="middle">
        01
      </text>
      <text x={76} y={52} textAnchor="middle">
        02
      </text>
      <text x={136} y={132} textAnchor="middle">
        03
      </text>
      <text x={166} y={22} textAnchor="middle">
        04
      </text>
    </svg>
  );
}

export function Sobre() {
  const ss = useSynapse();
  const { t, links } = ss;
  const copy = COPY[ss.state.lang] || COPY.pt;

  return (
    <>
      <section className="ab-hero" data-od-id="sobre-cabecalho">
        <div className="ab-hero-copy">
          <span className="kicker">
            <i aria-hidden="true" />
            {copy.kicker}
          </span>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => ss.goTab("certs")}>
              {copy.cta}
            </button>
            <button type="button" className="btn secondary" onClick={() => ss.setHowOpen(true)}>
              {copy.howCta}
            </button>
            <a
              className="btn secondary"
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
        </div>
        <figure className="ab-figure">
          <span className="ab-figure-mark">
            <Mark />
          </span>
          <figcaption>{copy.markCaption}</figcaption>
        </figure>
      </section>

      <nav className="ab-toc" aria-label={copy.tocLabel}>
        <span className="ab-toc-label">{copy.tocLabel}</span>
        {copy.toc.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <section
        className="ab-section"
        id="porque"
        aria-labelledby="whyTitle"
        data-od-id="sobre-origem"
      >
        <div className="ab-side">
          <span className="ab-n">01</span>
          <h2 id="whyTitle">{copy.whyTitle}</h2>
        </div>
        <div className="ab-body">
          {copy.why.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section
        className="ab-section"
        id="entrega"
        aria-labelledby="deliverTitle"
        data-od-id="sobre-entrega"
      >
        <div className="ab-side">
          <span className="ab-n">02</span>
          <h2 id="deliverTitle">{copy.deliverTitle}</h2>
        </div>
        <div className="ab-body">
          <div className="ab-grid">
            {copy.deliver.map(([title, body], i) => (
              <article className="ab-item" key={i}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="ab-section"
        id="limites"
        aria-labelledby="limitsTitle"
        data-od-id="sobre-limites"
      >
        <div className="ab-side">
          <span className="ab-n">03</span>
          <h2 id="limitsTitle">{copy.limitsTitle}</h2>
        </div>
        <div className="ab-body">
          <ul className="ab-limits">
            {copy.limits.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div className="ab-faq">
            <h3>{copy.faqTitle}</h3>
            {copy.faq.map(([q, a], i) => (
              <details key={i}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section" id="noos" aria-labelledby="noosTitle" data-od-id="sobre-noos">
        <div className="ab-side">
          <span className="ab-n">04</span>
          <h2 id="noosTitle">{copy.noosTitle}</h2>
        </div>
        <div className="ab-body">
          {copy.noos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <a className="ab-link" href={links.noos} target="_blank" rel="noopener noreferrer">
            noos.study{" "}
            <span className="ext" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </section>

      <section
        className="ab-section"
        id="fontes"
        aria-labelledby="sourcesTitle"
        data-od-id="sobre-fontes"
      >
        <div className="ab-side">
          <span className="ab-n">05</span>
          <h2 id="sourcesTitle">{copy.sourcesTitle}</h2>
        </div>
        <div className="ab-body">
          <p className="ab-note">{copy.sourcesLead}</p>
          <ul className="ab-sources">
            {copy.sources.map(([name, href, desc], i) => (
              <li key={i}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <span>
                    {name}
                    <span className="ext" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                  <small>{desc}</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="ab-section"
        id="autor"
        aria-labelledby="authorTitle"
        data-od-id="sobre-autor"
      >
        <div className="ab-side">
          <span className="ab-n">06</span>
          <h2 id="authorTitle">{copy.authorTitle}</h2>
        </div>
        <div className="ab-body">
          <div className="ab-author">
            <span className="ab-avatar" aria-hidden="true">
              IF
            </span>
            <div>
              <h3>{copy.authorName}</h3>
              <p className="ab-role">{copy.authorRole}</p>
              <p className="ab-author-body">{copy.authorBody}</p>
              <div className="ab-author-links">
                {copy.authorLinks.map(([label, href], i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                    <span className="ext" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ab-feedback"
        id="feedback"
        aria-labelledby="feedbackTitle"
        data-od-id="sobre-feedback"
      >
        <div>
          <span className="ab-n">07</span>
          <h2 id="feedbackTitle">{copy.feedbackTitle}</h2>
          <p>{copy.feedbackBody}</p>
          <p className="ab-feedback-note">{copy.feedbackNote}</p>
        </div>
        <a className="btn primary" href={links.feedback} target="_blank" rel="noopener noreferrer">
          {copy.feedbackCta}
          <span className="ext" aria-hidden="true">
            ↗
          </span>
        </a>
      </section>

      <section className="ab-state" aria-labelledby="stateTitle" data-od-id="sobre-estado">
        <h2 id="stateTitle">{copy.stateTitle}</h2>
        <dl>
          {copy.state.map(([dt, dd], i) => (
            <div key={i}>
              <dt>{dt}</dt>
              <dd>{dd}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ViewFoot label={copy.footnote} tail={`Synapse · ${copy.kicker}`} />
    </>
  );
}
