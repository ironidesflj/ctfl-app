import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Flashcards from "./Flashcards.jsx";
import Syllabus from "./Syllabus.jsx";
import Glossary from "./Glossary.jsx";
import { FLASHCARDS, SYLLABUS_ITEMS, flashcardsForCert, syllabusForCert } from "../data/study.js";
import { GLOSSARY, glossaryForCert } from "../data/glossary.js";

afterEach(cleanup);

const EMPTY_PROGRESS = {
  total: 0,
  correct: 0,
  byDomain: {},
  seen: {},
  flashcards: {},
  saved: [],
  history: [],
  srs: {},
  lastStudyDate: null,
};

const EMPTY_STATE_PT = "Conteúdo em breve para esta certificação.";

function renderAt(path, routePath, Component, props = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={routePath}
          element={
            <Component
              lang="pt"
              progress={EMPTY_PROGRESS}
              setProgress={vi.fn()}
              onStudy={vi.fn()}
              {...props}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

/* ─────────── r14: CTAL-TA agora tem conteúdo real em tudo ─────────── */

describe("Flashcards — cert scoping", () => {
  it("mostra conteúdo CTAL-TA real (nada de estado vazio)", () => {
    renderAt("/ctal-ta/flashcards", "/:cert/flashcards", Flashcards);
    expect(screen.queryByText(EMPTY_STATE_PT)).not.toBeInTheDocument();
    expect(screen.getByText(/Papel do Analista de Testes/)).toBeInTheDocument();
  });

  it("CTAL-TA não mostra cards CTFL e vice-versa", () => {
    renderAt("/ctal-ta/flashcards", "/:cert/flashcards", Flashcards);
    expect(screen.queryByText(/7 Princípios de Teste/)).not.toBeInTheDocument();
    cleanup();
    renderAt("/ctfl/flashcards", "/:cert/flashcards", Flashcards);
    expect(screen.getByText(/7 Princípios de Teste/)).toBeInTheDocument();
    expect(screen.queryByText(/Papel do Analista de Testes/)).not.toBeInTheDocument();
  });

  it("helper: flashcardsForCert isola por cert e vazio para cert inexistente", () => {
    const ctfl = flashcardsForCert("pt", "ctfl");
    const ta = flashcardsForCert("pt", "ctal-ta");
    expect(ctfl).toHaveLength(15);
    expect(ta).toHaveLength(21);
    expect(ctfl.every((c) => !ta.some((x) => x.id === c.id))).toBe(true);
    expect(flashcardsForCert("pt", "inexistente")).toEqual([]);
  });
});

describe("Syllabus — cert scoping", () => {
  it("mostra conteúdo CTAL-TA real (nada de estado vazio)", () => {
    renderAt("/ctal-ta/syllabus", "/:cert/syllabus", Syllabus);
    expect(screen.queryByText(EMPTY_STATE_PT)).not.toBeInTheDocument();
    expect(screen.getByText(/Famílias de técnicas v4\.0/)).toBeInTheDocument();
  });

  it("CTAL-TA não mostra itens CTFL e vice-versa", () => {
    renderAt("/ctal-ta/syllabus", "/:cert/syllabus", Syllabus);
    expect(screen.queryByText(/7 Princípios de Teste/)).not.toBeInTheDocument();
    cleanup();
    renderAt("/ctfl/syllabus", "/:cert/syllabus", Syllabus);
    expect(screen.getByText(/7 Princípios de Teste/)).toBeInTheDocument();
    expect(screen.queryByText(/Famílias de técnicas v4\.0/)).not.toBeInTheDocument();
  });

  it("helper: syllabusForCert isola por cert", () => {
    expect(syllabusForCert("pt", "ctfl")).toHaveLength(15);
    expect(syllabusForCert("pt", "ctal-ta")).toHaveLength(18);
    expect(syllabusForCert("pt", "inexistente")).toEqual([]);
  });
});

describe("Glossary — cert scoping", () => {
  it("mostra termos CTAL-TA reais (nada de estado vazio)", () => {
    renderAt("/ctal-ta/glossary", "/:cert/glossary", Glossary);
    expect(screen.queryByText(EMPTY_STATE_PT)).not.toBeInTheDocument();
    expect(screen.getByText(/Domain testing/)).toBeInTheDocument();
  });

  it("CTAL-TA não mostra termos CTFL e vice-versa", () => {
    renderAt("/ctal-ta/glossary", "/:cert/glossary", Glossary);
    expect(screen.queryByText(/Teste de componente/)).not.toBeInTheDocument();
    cleanup();
    renderAt("/ctfl/glossary", "/:cert/glossary", Glossary);
    expect(screen.getByText(/Teste de componente/)).toBeInTheDocument();
    expect(screen.queryByText(/Domain testing/)).not.toBeInTheDocument();
  });

  it("helper: glossaryForCert isola por cert", () => {
    expect(glossaryForCert("pt", "ctfl")).toHaveLength(70);
    expect(glossaryForCert("pt", "ctal-ta")).toHaveLength(37);
    expect(glossaryForCert("pt", "inexistente")).toEqual([]);
  });
});

/* ─────────── Integridade do conteúdo (Database Architect) ─────────── */

describe("study content — integridade estrutural", () => {
  it("todo item tem cert válido, capítulo no range, PT e EN completos", () => {
    const all = [
      ...FLASHCARDS.map((c) => ({ ...c, kind: "card" })),
      ...SYLLABUS_ITEMS.map((i) => ({ ...i, kind: "item" })),
    ];
    for (const it of all) {
      expect(["ctfl", "ctal-ta"]).toContain(it.cert);
      const maxCh = it.cert === "ctfl" ? 6 : 5;
      expect(it.ch).toBeGreaterThanOrEqual(1);
      expect(it.ch).toBeLessThanOrEqual(maxCh);
      expect(it.locales.pt).toBeTruthy();
      expect(it.locales.en).toBeTruthy();
    }
  });

  it("todo termo do glossário tem cert válido, capítulo e PT/EN completos", () => {
    for (const g of GLOSSARY) {
      expect(["ctfl", "ctal-ta"]).toContain(g.cert);
      expect(g.chapter).toBeGreaterThanOrEqual(1);
      expect(g.chapter).toBeLessThanOrEqual(g.cert === "ctfl" ? 6 : 5);
      expect(g.pt?.term).toBeTruthy();
      expect(g.pt?.def).toBeTruthy();
      expect(g.en?.term).toBeTruthy();
      expect(g.en?.def).toBeTruthy();
    }
  });

  it("ids únicos em todo o conteúdo de estudo (sem colisão SRS)", () => {
    const ids = [
      ...FLASHCARDS.map((c) => c.id),
      ...SYLLABUS_ITEMS.map((i) => i.id),
      ...GLOSSARY.map((g) => g.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cobertura por capítulo: CTAL-TA tem conteúdo em TODOS os 5 capítulos", () => {
    for (const ch of [1, 2, 3, 4, 5]) {
      expect(FLASHCARDS.some((c) => c.cert === "ctal-ta" && c.ch === ch)).toBe(true);
      expect(SYLLABUS_ITEMS.some((i) => i.cert === "ctal-ta" && i.ch === ch)).toBe(true);
      expect(GLOSSARY.some((g) => g.cert === "ctal-ta" && g.chapter === ch)).toBe(true);
    }
    // espelho pro CTFL (6 capítulos) — protege contra regressão
    for (const ch of [1, 2, 3, 4, 5, 6]) {
      expect(FLASHCARDS.some((c) => c.cert === "ctfl" && c.ch === ch)).toBe(true);
      expect(SYLLABUS_ITEMS.some((i) => i.cert === "ctfl" && i.ch === ch)).toBe(true);
      expect(GLOSSARY.some((g) => g.cert === "ctfl" && g.chapter === ch)).toBe(true);
    }
  });
});
