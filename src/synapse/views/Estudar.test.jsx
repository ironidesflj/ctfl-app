import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../App.jsx";
import { getBank } from "../../lib/bank.js";

/**
 * Regressão do PR #17: a tela Estudar precisa embaralhar as alternativas
 * uma única vez por sessão, mantendo o índice canônico para correção e
 * anunciando ao leitor de tela a LETRA DA POSIÇÃO VISUAL.
 *
 * Com Math.random travado em 0, shuffleOptionOrder(4) produz [1, 2, 3, 0]:
 * posição visual A→canônica 1, B→2, C→3, D→0.
 */
const PERMUTATION = [1, 2, 3, 0];

function openStudyRoute() {
  window.history.replaceState(null, "", "/?tab=estudar&cap=1");
}

function sessionEl(container) {
  return container.querySelector('[data-od-id="estudar-sessao"]');
}

async function waitForSession(container) {
  await waitFor(() => expect(sessionEl(container)).not.toBeNull());
}

function optionValues(container) {
  return Array.from(container.querySelectorAll('fieldset.opts input[type="radio"]')).map((input) =>
    Number(input.value)
  );
}

function visualLetters(container) {
  return Array.from(container.querySelectorAll("fieldset.opts .opt-key")).map(
    (el) => el.textContent
  );
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
  localStorage.setItem("synapse.onboarding.v2", "1");
  localStorage.setItem("synapse.ver.v1", "4.1.0");
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Estudar · embaralhamento por sessão (PR #17)", () => {
  it("embaralha uma vez, não reembaralha no re-render e anuncia a letra visual", async () => {
    openStudyRoute();
    const { container } = render(<App />);
    await waitForSession(container);

    const question = getBank("ctfl").byChapterInLang(1, "pt")[0];

    expect(optionValues(container)).toEqual(PERMUTATION);
    expect(visualLetters(container)).toEqual(["A", "B", "C", "D"]);

    const correctInput = Array.from(
      container.querySelectorAll('fieldset.opts input[type="radio"]')
    ).find((input) => Number(input.value) === question.answer);
    fireEvent.click(correctInput);

    // trocar a seleção re-renderiza, mas não reembaralha
    expect(optionValues(container)).toEqual(PERMUTATION);

    fireEvent.click(screen.getByRole("button", { name: /Conferir resposta/i }));
    const expectedLetter = "ABCD"[PERMUTATION.indexOf(question.answer)];
    await waitFor(() =>
      expect(document.getElementById("live").textContent).toContain(expectedLetter)
    );

    // o feedback não muda a ordem exibida
    expect(optionValues(container)).toEqual(PERMUTATION);
  });

  it("mantém a permutação ao trocar de idioma", async () => {
    openStudyRoute();
    const { container } = render(<App />);
    await waitForSession(container);
    const before = optionValues(container);

    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    await waitFor(() => expect(optionValues(container)).toEqual(before));
    expect(visualLetters(container)).toEqual(["A", "B", "C", "D"]);
  });

  it("inicia a sessão de salvas com permutação própria e estável", async () => {
    openStudyRoute();
    const { container } = render(<App />);
    await waitForSession(container);

    // salva a questão atual e volta ao plano
    fireEvent.click(container.querySelector(".session-save-btn"));
    fireEvent.click(container.querySelector(".session-exit"));
    fireEvent.click(await screen.findByRole("button", { name: /Estudar salvas/i }));

    await waitForSession(container);
    expect(optionValues(container)).toEqual(PERMUTATION);
    expect(visualLetters(container)).toEqual(["A", "B", "C", "D"]);
  });
});
