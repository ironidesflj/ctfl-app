// r9 — Tempo por questão no simulado + delta vs último simulado.
// Estratégia: rascunhos SEEDADOS no localStorage (durations determinísticas,
// idx na última questão) → retomar → finalizar em fireEvent síncrono (nenhum
// tick do intervalo dispara entre os cliques — sem await entre retomar e
// finalizar, o event loop nunca cede). O teste do TICK em si usa fake timers
// (mesmo padrão do teste de timeout do Quiz.test.jsx).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Quiz from "./Quiz.jsx";
import { getBank } from "../lib/bank.js";
import { saveExamDraft, loadExamDraft, clearExamDraft, todayLocal } from "../lib/storage.js";

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
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

// progress real (useState) — o delta do resultado lê progress.examHistory
// DEPOIS do logExamResult do finish(); com setProgress mockado isso não
// re-renderiza e o teste não veria o chip.
function Harness({ initialProgress }) {
  const [progress, setProgress] = useState(initialProgress || EMPTY_PROGRESS);
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

// Rascunho nas 40 primeiras questões do CTFL, idx na última (Finalizar em
// 1 clique). answer40 = índice escolhido na Q40 (null = em branco).
function seedDraft({ durations40 = 45, answer40 = null } = {}) {
  const bank = getBank("ctfl");
  const qs = bank.ALL.slice(0, 40);
  const q40 = qs[39];
  // resposta garantidamente ERRADA na Q40 (delta/avg determinísticos)
  const a40 =
    answer40 === "wrong"
      ? (q40.answer + 1) % q40.options.length
      : answer40 === "right"
        ? q40.answer
        : null;
  const durations = new Array(40).fill(0);
  durations[0] = durations40;
  saveExamDraft("ctfl", {
    questionIds: qs.map((q) => q.id),
    optOrder: qs.map((q) => q.options.map((_opt, j) => j)),
    answers: qs.map((_q, i) => (i === 39 ? a40 : null)),
    flags: qs.map(() => false),
    durations,
    idx: 39,
    timeLeft: 4000,
    savedAt: Date.now(),
  });
  return { q40 };
}

async function resumeAndFinish(initialProgress) {
  render(<Harness initialProgress={initialProgress} />);
  fireEvent.click(screen.getByRole("button", { name: /retomar simulado/i }));
  fireEvent.click(screen.getByRole("button", { name: /finalizar/i }));
}

describe("r9 — tempo por questão (durations)", () => {
  it("TICK_TIMER credita 1s por tick na questão corrente e o rascunho salva no throttle de 10s", async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={["/ctfl/quiz"]}>
        <Routes>
          <Route
            path="/:cert/quiz"
            element={
              <Quiz
                onAnswer={vi.fn()}
                progress={EMPTY_PROGRESS}
                setProgress={vi.fn()}
                initialFilter={null}
                onFilterConsumed={vi.fn()}
                lang="pt"
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /^simulado/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar/i }));

    // 10 ticks num único act: React 18 batcha os 10 dispatches num render
    // só → o efeito [timeLeft] roda UMA vez com 4490 (4500-10), que é
    // divisível por 10 → o save throttled dispara com durations[0] = 10.
    // (No browser real cada tick é uma task própria; aqui o batch equivale
    // ao mesmo estado final — o que o efeito precisa ver é %10 === 0.)
    await act(async () => {
      vi.advanceTimersByTime(10 * 1000);
    });
    const draft = loadExamDraft("ctfl");
    expect(draft).not.toBeNull();
    expect(draft.durations[0]).toBe(10);
    expect(draft.durations.reduce((a, b) => a + b, 0)).toBe(10);
  });

  it("retomada restaura durations e a revisão mostra ⏱ só nas questões com tempo > 0", async () => {
    seedDraft({ durations40: 45, answer40: "wrong" });
    await resumeAndFinish(EMPTY_PROGRESS);
    // abrir a revisão da prova e trocar o filtro para Todas
    fireEvent.click(screen.getByRole("button", { name: /revisar erros/i }));
    fireEvent.click(screen.getByRole("button", { name: /^todas/i }));
    // Q1 (45s) tem chip; questões com 0s não têm
    expect(screen.getByText("⏱ 45s")).toBeInTheDocument();
    expect(screen.queryByText(/⏱ 0s/)).not.toBeInTheDocument();
  });

  it("resultado mostra total usado e média por questão respondida", async () => {
    seedDraft({ durations40: 45, answer40: "wrong" }); // 1 respondida, 45s
    await resumeAndFinish(EMPTY_PROGRESS);
    expect(screen.getByText(/⏱ 0:45 · ~45s por questão/)).toBeInTheDocument();
  });
});

describe("r9 — delta vs último simulado", () => {
  it("piora em relação ao anterior mostra 📉 com classe down", async () => {
    seedDraft({ answer40: "wrong" }); // score 0 → 0%
    const prev = {
      ...EMPTY_PROGRESS,
      examHistory: [{ date: todayLocal(), pct: 55, passed: false, n: 40 }],
    };
    await resumeAndFinish(prev);
    const chip = document.querySelector(".delta-chip.down");
    expect(chip).not.toBeNull();
    expect(chip.textContent).toContain("📉 -55%");
    expect(chip.textContent).toContain("vs último simulado");
  });

  it("melhora em relação ao anterior mostra 📈 com classe up", async () => {
    const { q40 } = seedDraft({ answer40: "right" }); // 1 correta → 2.5% ≈ 3%
    expect(q40).toBeTruthy();
    const prev = {
      ...EMPTY_PROGRESS,
      examHistory: [{ date: todayLocal(), pct: 0, passed: false, n: 40 }],
    };
    await resumeAndFinish(prev);
    const chip = document.querySelector(".delta-chip.up");
    expect(chip).not.toBeNull();
    expect(chip.textContent).toContain("📈 +3%");
  });

  it("primeiro simulado não mostra chip de delta (sem base de comparação)", async () => {
    seedDraft({ answer40: "wrong" });
    await resumeAndFinish(EMPTY_PROGRESS);
    expect(document.querySelector(".delta-chip")).toBeNull();
  });
});
