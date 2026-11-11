import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../App.jsx";

/**
 * Cobertura do fluxo de simulado na view viva `src/synapse/views/Simulado.tsx`.
 *
 * Por que este arquivo existe: os testes `src/components/Quiz*.test.jsx`
 * exercitam o componente legado `src/components/Quiz.jsx` (não importado por
 * nenhuma rota da casca 4.1). O simulado que o usuário vê (view em
 * `src/synapse/views`) só tinha cobertura de componente E2E (Playwright).
 * Estes dois cenários rodam no vitest, sem browser:
 *
 * 1. prova oficial CTFL — inicia (40 questões), responde, finaliza pelo
 *    último item da grade e grava o resultado no histórico;
 * 2. rascunho (P0) — resposta gravada em `synapse.examdraft.v1` sobrevive à
 *    remontagem do app, e o banner "Retomar" restaura a prova.
 */

function openQuizRoute() {
  window.history.replaceState(null, "", "/?tab=simulado");
}

function quizEl(container) {
  return container.querySelector('[data-od-id="simulado-prova"]');
}

function optionInputs(container) {
  return Array.from(container.querySelectorAll('fieldset.opts input[type="radio"]'));
}

async function startOfficialExam(container) {
  await waitFor(() =>
    expect(screen.getAllByRole("button", { name: /Começar simulado/i }).length).toBeGreaterThan(0)
  );
  fireEvent.click(screen.getAllByRole("button", { name: /Começar simulado/i })[0]);
  await waitFor(() => expect(quizEl(container)).not.toBeNull());
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
  localStorage.setItem("synapse.onboarding.v2", "1");
  localStorage.setItem("synapse.ver.v1", "4.1.0");
});

afterEach(cleanup);

describe("Simulado · fluxo da view 4.1", () => {
  it("inicia a prova oficial, responde, finaliza e grava o resultado no histórico", async () => {
    openQuizRoute();
    const { container } = render(<App />);
    await startOfficialExam(container);

    // prova oficial CTFL: 40 questões, começa na 1
    expect(screen.getByText(/Questão 1 de 40/)).toBeInTheDocument();
    expect(optionInputs(container).length).toBeGreaterThan(1);
    fireEvent.click(optionInputs(container)[0]);
    await waitFor(() => expect(optionInputs(container)[0].checked).toBe(true));

    // grade → última questão → finalizar
    fireEvent.click(screen.getByRole("button", { name: /Ver grade/i }));
    const gridButtons = container.querySelectorAll(".sim-grid button");
    expect(gridButtons.length).toBe(40);
    fireEvent.click(gridButtons[gridButtons.length - 1]);
    fireEvent.click(await screen.findByRole("button", { name: /Finalizar simulado/i }));

    await waitFor(() =>
      expect(container.querySelector('[data-od-id="simulado-resultado"]')).not.toBeNull()
    );
    expect(container.querySelector(".sim-score").textContent).toContain("/40");
    const exams = JSON.parse(localStorage.getItem("synapse.exams.v1") || "{}");
    expect(exams.ctfl).toHaveLength(1);
    // o rascunho global é limpo ao finalizar
    expect(localStorage.getItem("synapse.examdraft.v1")).toBeNull();
  });

  it("rascunho: resposta sobrevive à remontagem e o banner retoma a prova", async () => {
    openQuizRoute();
    const first = render(<App />);
    await startOfficialExam(first.container);

    const chosen = 1;
    fireEvent.click(optionInputs(first.container)[chosen]);
    await waitFor(() => expect(optionInputs(first.container)[chosen].checked).toBe(true));

    // efeito de gravação do rascunho (roda após a resposta)
    await waitFor(() => {
      const draft = JSON.parse(localStorage.getItem("synapse.examdraft.v1") || "null");
      expect(draft?.answers?.filter((a) => a !== null).length).toBe(1);
    });

    cleanup(); // remonta o app do zero, como um reload
    openQuizRoute();
    const second = render(<App />);
    expect(await screen.findByText(/Você tem um simulado em andamento/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Retomar$/ }));

    await waitFor(() => expect(quizEl(second.container)).not.toBeNull());
    await waitFor(() => expect(optionInputs(second.container)[chosen].checked).toBe(true));
    expect(optionInputs(second.container).filter((input) => input.checked)).toHaveLength(1);
  });
});

/**
 * BUG CONHECIDO (P1, reportado na verificação de QA):
 *
 * `saveExamDraft` grava o rascunho na chave global `synapse.examdraft.v1` E
 * também em `synapse.examDraft.v1.${cert}` (store.tsx:263), mas as limpezas da
 * view chamam `clearExamDraft()` sem argumento (Simulado.tsx:503 ao finalizar,
 * :687 ao descartar), removendo apenas a chave global. `loadExamDraft`
 * (store.tsx:247) cai de volta na chave por cert, então:
 *   1. depois de FINALIZAR o simulado, o banner "Você tem um simulado em
 *      andamento" reaparece e "Retomar" reabre uma prova já concluída;
 *   2. "Descartar" não remove o banner (ele volta na hora).
 *
 * Fix mínimo: passar a cert em `clearExamDraft(state.cert)` nos três call sites
 * (Simulado.tsx:503, :677, :687) — ou remover a chave por cert no clear.
 * Este teste usa `it.fails`: enquanto o bug existir ele passa (falha esperada);
 * quando for corrigido, passa a falhar e deve ser promovido a `it`.
 */
describe("Simulado · BUG conhecido: limpeza do rascunho por cert", () => {
  it.fails("não deve sobrar rascunho após finalizar, nem banner na reabertura", async () => {
    openQuizRoute();
    const { container } = render(<App />);
    await startOfficialExam(container);
    fireEvent.click(screen.getByRole("button", { name: /Ver grade/i }));
    const grid = container.querySelectorAll(".sim-grid button");
    fireEvent.click(grid[grid.length - 1]);
    fireEvent.click(await screen.findByRole("button", { name: /Finalizar simulado/i }));
    await waitFor(() =>
      expect(container.querySelector('[data-od-id="simulado-resultado"]')).not.toBeNull()
    );

    // (1) a chave por cert também precisa ser limpa ao finalizar
    expect(localStorage.getItem("synapse.examDraft.v1.ctfl")).toBeNull();

    // (2) reabrir o simulado não pode oferecer retomada de prova concluída
    cleanup();
    openQuizRoute();
    render(<App />);
    await screen.findByText(/Treine como no dia da prova/i);
    expect(document.querySelector(".sim-draft")).toBeNull();
  });
});
