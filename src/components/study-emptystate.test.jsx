import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Flashcards from "./Flashcards.jsx";
import Syllabus from "./Syllabus.jsx";
import Glossary from "./Glossary.jsx";

afterEach(cleanup);

const EMPTY_PROGRESS = {
  total: 0, correct: 0, byDomain: {}, seen: {}, flashcards: {},
  saved: [], history: [], srs: {}, lastStudyDate: null,
};

const EMPTY_STATE_PT = "Conteúdo em breve para esta certificação.";

function renderAt(path, routePath, Component, props = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={routePath}
          element={<Component lang="pt" progress={EMPTY_PROGRESS} setProgress={vi.fn()} onStudy={vi.fn()} {...props} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Flashcards — cert gating", () => {
  it("mostra estado vazio em /ctal-ta e não mostra cards CTFL", () => {
    renderAt("/ctal-ta/flashcards", "/:cert/flashcards", Flashcards);
    expect(screen.getByText(EMPTY_STATE_PT)).toBeInTheDocument();
    expect(screen.queryByText(/7 Princípios de Teste/)).not.toBeInTheDocument();
  });

  it("mostra conteúdo real em /ctfl", () => {
    renderAt("/ctfl/flashcards", "/:cert/flashcards", Flashcards);
    expect(screen.queryByText(EMPTY_STATE_PT)).not.toBeInTheDocument();
    expect(screen.getByText(/7 Princípios de Teste/)).toBeInTheDocument();
  });
});

describe("Syllabus — cert gating", () => {
  it("mostra estado vazio em /ctal-ta e não mostra itens CTFL", () => {
    renderAt("/ctal-ta/syllabus", "/:cert/syllabus", Syllabus);
    expect(screen.getByText(EMPTY_STATE_PT)).toBeInTheDocument();
    expect(screen.queryByText(/7 Princípios de Teste/)).not.toBeInTheDocument();
  });

  it("mostra conteúdo real em /ctfl", () => {
    renderAt("/ctfl/syllabus", "/:cert/syllabus", Syllabus);
    expect(screen.queryByText(EMPTY_STATE_PT)).not.toBeInTheDocument();
    expect(screen.getByText(/7 Princípios de Teste/)).toBeInTheDocument();
  });
});

describe("Glossary — cert gating", () => {
  it("mostra estado vazio em /ctal-ta e não mostra termos CTFL", () => {
    renderAt("/ctal-ta/glossary", "/:cert/glossary", Glossary);
    expect(screen.getByText(EMPTY_STATE_PT)).toBeInTheDocument();
    expect(screen.queryByText(/Teste de componente/)).not.toBeInTheDocument();
  });

  it("mostra conteúdo real em /ctfl", () => {
    renderAt("/ctfl/glossary", "/:cert/glossary", Glossary);
    expect(screen.queryByText(EMPTY_STATE_PT)).not.toBeInTheDocument();
    expect(screen.getByText(/Teste de componente/)).toBeInTheDocument();
  });
});
