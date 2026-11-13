import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../App.jsx";
import ctAiExam from "../data/banks/ct-ai-exam.json";

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
 *    remontagem do app, e o banner "Retomar" restaura a prova;
 * 3. regressão do P1 — finalizar/descartar removem também a chave
 *    `synapse.examDraft.v1.{cert}`, então o banner não reaparece.
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
 * Regressão do P1 encontrado na verificação de QA (corrigido nesta branch):
 *
 * `saveExamDraft` grava o rascunho na chave global `synapse.examdraft.v1` E
 * em `synapse.examDraft.v1.${cert}` (store.tsx:263); as limpezas da view
 * precisam passar a cert — `clearExamDraft(state.cert)` em Simulado.tsx (ao
 * finalizar, ao descartar e no resume inválido) — senão a chave por cert
 * sobrevive e `loadExamDraft` (store.tsx:247) ressuscita o banner de retomada.
 */
describe("Simulado · limpeza do rascunho por cert (regressão P1)", () => {
  it("finalizar descarta o rascunho e a reabertura não oferece prova concluída", async () => {
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

    // o rascunho some nas duas chaves (global e por cert)
    expect(localStorage.getItem("synapse.examdraft.v1")).toBeNull();
    expect(localStorage.getItem("synapse.examDraft.v1.ctfl")).toBeNull();

    // reabrir não oferece retomada de prova concluída e permite reiniciar
    cleanup();
    openQuizRoute();
    const reopened = render(<App />);
    await screen.findByText(/Treine como no dia da prova/i);
    expect(document.querySelector(".sim-draft")).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: /Começar simulado/i })[0]);
    await waitFor(() => expect(quizEl(reopened.container)).not.toBeNull());
  });

  it("descartar remove o rascunho (global e por cert) e o banner", async () => {
    openQuizRoute();
    const first = render(<App />);
    await startOfficialExam(first.container);
    fireEvent.click(optionInputs(first.container)[1]);
    await waitFor(() => {
      const draft = JSON.parse(localStorage.getItem("synapse.examdraft.v1") || "null");
      expect(draft?.answers?.filter((a) => a !== null).length).toBe(1);
    });

    cleanup();
    openQuizRoute();
    render(<App />);
    await screen.findByText(/Você tem um simulado em andamento/i);
    fireEvent.click(screen.getByRole("button", { name: /Descartar/i }));

    await waitFor(() => expect(document.querySelector(".sim-draft")).toBeNull());
    expect(localStorage.getItem("synapse.examdraft.v1")).toBeNull();
    expect(localStorage.getItem("synapse.examDraft.v1.ctfl")).toBeNull();
  });

  it("CT-AI v2.0: simulado oficial sorteia 40 questões estratificadas (36 K2 + 4 K3 = 44 pts, corte 29)", async () => {
    localStorage.setItem("synapse.cert.v1", "ct-ai");
    openQuizRoute();
    const { container } = render(<App />);

    await screen.findByText(
      /40 questões em 60 minutos, pontuação ponderada por K-level \(K2=1 · K3=2\)/i
    );

    await startOfficialExam(container);
    expect(screen.getByText(/Questão 1 de 40/)).toBeInTheDocument();

    const draft = JSON.parse(localStorage.getItem("synapse.examdraft.v1") || "null");
    expect(draft).not.toBeNull();
    expect(draft.cert).toBe("ct-ai");
    expect(draft.custom).toBe(false);
    expect(draft.questionIds).toHaveLength(40);
    expect(new Set(draft.questionIds).size).toBe(40);

    const byId = new Map(
      Object.values(ctAiExam)
        .flat()
        .map((q) => [q.id, q])
    );
    const totalPts = draft.questionIds.reduce((sum, id) => {
      const q = byId.get(id);
      return sum + (q?.k === 3 ? 2 : 1);
    }, 0);
    expect(totalPts).toBe(44);
  });
});
