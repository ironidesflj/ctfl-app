// r10 — Repetir os erros do último simulado (botão do resultado + card do
// setup). Estratégia do quiz-timing.test.jsx: rascunho SEEDADO com respostas
// determinísticas (2 erradas, 38 certas), idx na última → retomar →
// finalizar sem await entre os cliques (o interval de 1s nunca dispara).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Quiz from "./Quiz.jsx";
import { getBank } from "../lib/bank.js";
import { saveExamDraft, clearExamDraft, loadProgress, saveProgress } from "../lib/storage.js";

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  clearExamDraft("ctfl");
});

const EMPTY_PROGRESS = {
  total: 0,
  correct: 0,
  byDomain: {},
  seen: {},
  attempts: {},
  flashcards: {},
  saved: [],
  history: [],
  srs: {},
  lastStudyDate: null,
  achievements: [],
  examHistory: [],
};

// progress REAL (useState) + persistência (mesmo efeito do App.jsx:
// saveProgress a cada mudança) — o card do setup e o lastExamWrongIds
// derivam do progress, e os asserts de storage leem o que foi gravado.
function Harness({ initialProgress }) {
  const [progress, setProgress] = useState(initialProgress || EMPTY_PROGRESS);
  useEffect(() => {
    saveProgress(progress, "ctfl");
  }, [progress]);
  return (
    <MemoryRouter initialEntries={["/ctfl/quiz"]}>
      <Routes>
        <Route
          path="/:cert/quiz"
          element={
            <Quiz
              onAnswer={vi.fn()}
              progress={progress}
              setProgress={setProgress}
              initialFilter={null}
              onFilterConsumed={vi.fn()}
              lang="pt"
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

// Rascunho das 40 primeiras do CTFL: tudo CERTO exceto as questões em
// wrongIdxs (resposta deterministicamente errada). idx na última.
function seedDraftAllAnswered(wrongIdxs = [0, 1]) {
  const bank = getBank("ctfl");
  const qs = bank.ALL.slice(0, 40);
  const answers = qs.map((q, i) =>
    wrongIdxs.includes(i) ? (q.answer + 1) % q.options.length : q.answer
  );
  saveExamDraft("ctfl", {
    questionIds: qs.map((q) => q.id),
    optOrder: qs.map((q) => q.options.map((_opt, j) => j)),
    answers,
    flags: qs.map(() => false),
    durations: qs.map(() => 0),
    idx: 39,
    timeLeft: 4000,
    savedAt: Date.now(),
  });
  return { wrongIds: wrongIdxs.map((i) => qs[i].id) };
}

function resumeAndFinish() {
  fireEvent.click(screen.getByRole("button", { name: /retomar simulado/i }));
  fireEvent.click(screen.getByRole("button", { name: /finalizar/i }));
}

describe("r10 — repetir erros do último simulado", () => {
  it("resultado mostra 'Treinar as N erradas' e o clique abre sessão de estudo com exatamente elas", () => {
    const { wrongIds } = seedDraftAllAnswered([0, 1]);
    render(<Harness />);
    resumeAndFinish();
    // 95% (38/40) — aprovado; botão de treinar as 2 erradas existe
    const trainBtn = screen.getByRole("button", { name: /treinar as 2 erradas/i });
    expect(trainBtn).toBeTruthy();
    fireEvent.click(trainBtn);
    // sessão de estudo com EXATAMENTE as 2 erradas
    expect(screen.getByText("Questão 1 de 2")).toBeTruthy();
    // modo estudo: feedback imediato (existe botão de próxima só após responder —
    // aqui só o fato de haver "de 2" já prova que o pool foi o das erradas)
    expect(screen.queryByRole("button", { name: /^finalizar/i })).toBeNull();
    // as duas questões são as que ficaram erradas no rascunho
    const bank = getBank("ctfl");
    const shownText = document.querySelector(".q-text")?.textContent;
    const firstWrongQ = bank.ALL.find((q) => q.id === wrongIds[0]);
    expect(shownText).toBe(firstWrongQ.q);
  });

  it("histórico persiste wrongIds no finish (fonte do card do setup)", () => {
    const { wrongIds } = seedDraftAllAnswered([3, 7, 9]);
    render(<Harness />);
    resumeAndFinish();
    const stored = loadProgress("ctfl");
    const last = stored.examHistory[stored.examHistory.length - 1];
    expect(last.wrongIds).toEqual(wrongIds);
    expect(last.pct).toBe(93); // 37/40
  });

  it("setup mostra card 'Último simulado' após a prova com erradas", () => {
    seedDraftAllAnswered([0, 1]);
    render(<Harness />);
    resumeAndFinish();
    // volta pro setup (botão "Voltar ao início" — ghost, não o "Refazer");
    // o modo continua "exam" → troca pro Estudo (o grid de domínios com o
    // card 🔁 só existe lá)
    fireEvent.click(screen.getByRole("button", { name: /voltar ao início/i }));
    fireEvent.click(screen.getByRole("button", { name: /^estudo/i }));
    const card = screen.getByRole("button", { name: /último simulado/i });
    expect(card.textContent).toContain("2 erradas para repetir");
    // seleciona o card e inicia: sessão com as 2 erradas
    fireEvent.click(card);
    fireEvent.click(screen.getByRole("button", { name: /^iniciar/i }));
    expect(screen.getByText("Questão 1 de 2")).toBeTruthy();
  });

  it("setup NÃO mostra o card com histórico legado (sem wrongIds)", () => {
    const legacy = {
      ...EMPTY_PROGRESS,
      examHistory: [{ date: "2026-10-01", pct: 60, passed: false, n: 40 }],
    };
    render(<Harness initialProgress={legacy} />);
    expect(screen.queryByRole("button", { name: /último simulado/i })).toBeNull();
  });

  it("prova 100% correta não mostra o botão de treinar erradas", () => {
    seedDraftAllAnswered([]); // tudo certo
    render(<Harness />);
    resumeAndFinish();
    expect(screen.queryByRole("button", { name: /treinar as/i })).toBeNull();
    // e o histórico registra array vazio (card também não aparece depois)
    const stored = loadProgress("ctfl");
    expect(stored.examHistory[stored.examHistory.length - 1].wrongIds).toEqual([]);
  });
});
