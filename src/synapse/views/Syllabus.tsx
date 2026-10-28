"use client";

/* ===========================================================
   Synapse · views/Syllabus.tsx
   Aba Syllabus — porta fiel de js/syllabus.js. Estrutura oficial
   da prova ativa: peso de cada capítulo no exame, banco de
   estudo, cobertura e tópicos. Filtro local por capítulo ou
   tópico. Nada inventado: prova sem banco mostra estado vazio.
   =========================================================== */

import { useState } from "react";
import { fmt, pad2, useSynapse } from "../store";
import { BANK_META } from "../data/certs";
import type { Chapter } from "../types";
import { ViewFoot } from "./Hoje";

function searchText(ch: Chapter): string {
  const parts = [ch.name.pt, ch.name.en, ch.sub.pt, ch.sub.en];
  ch.topics.forEach((topic) => {
    parts.push(topic.pt, topic.en);
  });
  return parts.join(" ").toLowerCase();
}

export function Syllabus() {
  const ss = useSynapse();
  const { t } = ss;
  const lang = ss.state.lang;
  const c = ss.cert();

  /* busca local — a nota muda para "N / total" depois do primeiro
     input, como o filterRows do protótipo (que só rodava on input) */
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);

  /* ---------- estado vazio (prova sem banco) ---------- */

  if (c.status !== "live" || !c.exam) {
    return (
      <>
        <section className="hero empty-hero" data-od-id="syllabus-vazio">
          <div>
            <span className="kicker">
              <i aria-hidden="true" />
              {t("syllabus.kicker")} · {c.code}
            </span>
            <h1>{t("syllabus.emptyTitle")}</h1>
            <p className="lead">{t("syllabus.emptyBody")}</p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={() => ss.setCert("ctfl")}>
                {t("study.emptyAction")}
              </button>
            </div>
          </div>
        </section>
        <ViewFoot
          label={fmt(t("syllabus.footnote"), { version: c.version })}
          tail={`Synapse · ${t("nav.syllabus")} · ${c.code}`}
        />
      </>
    );
  }

  const exam = c.exam;
  const questions = t("study.questions").toLowerCase();
  const lead = fmt(t("syllabus.lead"), {
    code: c.code,
    version: c.version,
    q: exam.q,
    min: exam.min,
    pass: ss.cutText(exam),
  });

  /* ---------- filtro ---------- */

  const term = String(query || "").trim().toLowerCase();
  const match = (ch: Chapter) => !term || searchText(ch).indexOf(term) !== -1;
  const shown = c.chapters.filter(match).length;
  const note = dirty
    ? shown + " / " + c.chapters.length + " · " + exam.q + " " + questions
    : c.chapters.length + " · " + exam.q + " " + questions;

  /* ---------- linhas por capítulo ---------- */

  const rows = c.chapters.map((ch) => {
    const pct = ss.pctFor(ch);
    const weight = Math.round((ch.examQ / exam.q) * 100);
    const hasSub = ch.sub[lang] !== ch.name[lang];
    return (
      <details className="sy-row" data-ch={ch.n} hidden={!match(ch)} key={ch.n}>
        <summary>
          <span className="sy-no">{pad2(ch.n)}</span>
          <span className="sy-main">
            <span className="sy-name">{ch.name[lang]}</span>
            {hasSub ? <span className="sy-sub">{ch.sub[lang]}</span> : null}
          </span>
          <span className="sy-weight">
            <span className="wl">
              <b>{ch.examQ}</b>
              <span>{fmt(t("syllabus.weightNote"), { n: ch.examQ, q: exam.q })}</span>
            </span>
            <span className="sy-bar" aria-hidden="true">
              <i style={{ width: weight + "%" }} />
            </span>
          </span>
          <span className="sy-cov">
            {pct}%
            <small>
              {ss.seenFor(ch)}/{ch.total}
            </small>
          </span>
          <svg className="sy-chev" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="m3 6 5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <div className="sy-body">
          <ul className="sy-topics" aria-label={t("syllabus.topics")}>
            {ch.topics.map((topic, i) => (
              <li key={i}>{topic[lang]}</li>
            ))}
          </ul>
          <div className="sy-actions">
            <button
              type="button"
              className="btn secondary sm"
              onClick={() => ss.goTab("estudar", { cap: ch.n })}
            >
              {t("study.studyChapter")}
            </button>
            <span className="ch-seen">
              {fmt(t("study.chSeen"), { seen: ss.seenFor(ch), total: ch.total })}
            </span>
          </div>
        </div>
      </details>
    );
  });

  return (
    <>
      <section className="hero empty-hero" data-od-id="syllabus-cabecalho">
        <div>
          <span className="kicker">
            <i aria-hidden="true" />
            {t("syllabus.kicker")} · {c.code}
          </span>
          <h1>{t("syllabus.title")}</h1>
          <p className="lead">{lead}</p>
        </div>
      </section>

      <div className="sy-tools" data-od-id="syllabus-busca">
        <label className="sr-only" htmlFor="sySearch">
          {t("syllabus.search")}
        </label>
        <input
          className="sy-search"
          id="sySearch"
          type="search"
          placeholder={t("syllabus.search")}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDirty(true);
          }}
        />
        <span className="sy-search-note">{note}</span>
      </div>

      <div className="sy-head" aria-hidden="true">
        <span />
        <span>{t("syllabus.colChapter")}</span>
        <span>{t("syllabus.colWeight")}</span>
        <span className="r">{t("syllabus.colCoverage")}</span>
        <span />
      </div>

      <div className="sy-rows" data-od-id="syllabus-capitulos">
        {rows}
      </div>

      <p className="sy-empty" hidden={shown !== 0}>
        {fmt(t("syllabus.searchEmpty"), { q: query })}
      </p>

      <p className="sy-note">
        {fmt(t("syllabus.sourceNote"), { rules: BANK_META.examRules })}
        <br />
        ISTQB {c.version} · Syllabus {c.year}
      </p>

      <ViewFoot
        label={fmt(t("syllabus.footnote"), { version: c.version })}
        tail={`Synapse · ${t("nav.syllabus")} · ${c.code}`}
      />
    </>
  );
}
