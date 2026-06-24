import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Quiz from "./Quiz.jsx";

afterEach(cleanup);

const EMPTY_PROGRESS = {
  total: 0, correct: 0, byDomain: {}, seen: {}, flashcards: {},
  saved: [], history: [], srs: {}, lastStudyDate: null,
};

function renderQuiz(props = {}) {
  const onAnswer = vi.fn();
  const setProgress = vi.fn();
  const onFilterConsumed = vi.fn();
  const utils = render(
    <Quiz
      onAnswer={onAnswer}
      progress={EMPTY_PROGRESS}
      setProgress={setProgress}
      initialFilter={null}
      onFilterConsumed={onFilterConsumed}
      lang="pt"
      {...props}
    />
  );
  return { ...utils, onAnswer, setProgress };
}

describe("Quiz — setup", () => {
  it("renderiza tela de setup com botão Iniciar", () => {
    renderQuiz();
    expect(screen.getByRole("button", { name: /iniciar/i })).toBeInTheDocument();
  });
});

describe("Quiz — modo Estudo (practice)", () => {
  it("responder uma questão chama onAnswer com domain, correct e questionId, e trava as opções", async () => {
    const user = userEvent.setup();
    const { onAnswer } = renderQuiz();

    await user.click(screen.getByRole("button", { name: /iniciar/i }));

    const options = await screen.findAllByRole("button", { name: /^[A-E]/ });
    await user.click(options[0]);

    expect(onAnswer).toHaveBeenCalledTimes(1);
    const [domain, correct, questionId] = onAnswer.mock.calls[0];
    expect(typeof domain).toBe("string");
    expect(typeof correct).toBe("boolean");
    expect(typeof questionId).toBe("string");
    expect(questionId.length).toBeGreaterThan(0);

    // opções devem ficar travadas (disabled) após responder
    const lockedOptions = await screen.findAllByRole("button", { name: /^[A-E]/ });
    lockedOptions.forEach((btn) => expect(btn).toBeDisabled());
  });
});

describe("Quiz — modo Simulado (exam) — regressão do bug seen/5c93296", () => {
  it("finalizar a prova chama onAnswer com questionId para CADA questão", async () => {
    const user = userEvent.setup();
    const { onAnswer } = renderQuiz();

    // selecionar modo Simulado e iniciar
    await user.click(screen.getByRole("button", { name: /^simulado/i }));
    await user.click(screen.getByRole("button", { name: /iniciar/i }));

    // selecionar uma opção na primeira questão (não trava — exam usa selectExam)
    const options = await screen.findAllByRole("button", { name: /^[A-E]/ });
    await user.click(options[0]);

    // abrir grade de navegação e ir para a última questão
    await user.click(screen.getByRole("button", { name: /ver todas/i }));
    const gridButtons = screen.getAllByRole("button", { name: /^\d+$/ });
    await user.click(gridButtons[gridButtons.length - 1]); // questão 40

    // finalizar — só aparece na última questão em modo exam
    await user.click(screen.getByRole("button", { name: /finalizar/i }));

    // finish() deve chamar onAnswer uma vez por questão (40 no total)
    expect(onAnswer.mock.calls.length).toBe(40);

    // TODAS as chamadas devem ter um 3º argumento (questionId) definido —
    // esse é exatamente o bug que existiu até 5c93296.
    onAnswer.mock.calls.forEach(([, , questionId]) => {
      expect(questionId).toBeTruthy();
    });
  });
});

describe("Quiz — tela de resultado", () => {
  it("mostra placar e veredito após finalizar", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: /^simulado/i }));
    await user.click(screen.getByRole("button", { name: /iniciar/i }));
    await user.click(screen.getByRole("button", { name: /ver todas/i }));
    const gridButtons = screen.getAllByRole("button", { name: /^\d+$/ });
    await user.click(gridButtons[gridButtons.length - 1]);
    await user.click(screen.getByRole("button", { name: /finalizar/i }));

    expect(screen.getByText(/\d+\/\d+ · \d+%/)).toBeInTheDocument();
  });
});
