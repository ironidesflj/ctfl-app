import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { CERT_CATALOG } from "./certs-catalog.js";

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  // pula o onboarding pra chegar no masthead/rotas direto
  localStorage.setItem("ctfl_onboarding_done", "1");
});

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("catálogo de vitrine (certs-catalog)", () => {
  it("tem 6 entradas: 2 live, 3 coming-soon, 1 legacy", () => {
    expect(CERT_CATALOG).toHaveLength(6);
    const by = (s) => CERT_CATALOG.filter((c) => c.status === s).length;
    expect(by("live")).toBe(2);
    expect(by("coming-soon")).toBe(3);
    expect(by("legacy")).toBe(1);
  });
});

describe("masthead dinâmico + data-cert", () => {
  it("rota de cert (ctal-ta): mostra dados do CTAL-TA, não CTFL, e seta data-cert", () => {
    const { container } = renderApp("/ctal-ta/quiz");
    // fullName do CTAL-TA no h1, não "CTFL Prep" nem "Foundation Level"
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test Analyst");
    expect(screen.queryByText("CTFL Prep")).not.toBeInTheDocument();
    // badge cert-indicator com o label
    expect(screen.getByText("CTAL-TA")).toBeInTheDocument();
    expect(container.querySelector(".app")).toHaveAttribute("data-cert", "ctal-ta");
  });

  it("rota / (seleção): masthead neutro (Synapse), SEM data-cert", () => {
    const { container } = renderApp("/");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Synapse");
    expect(container.querySelector(".app")).not.toHaveAttribute("data-cert");
    // não vaza "CTFL Prep" nem subtítulo de cert na tela de escolha
    expect(screen.queryByText("CTFL Prep")).not.toBeInTheDocument();
  });
});

describe("CertSelector (/ sem lastCert, e /select)", () => {
  it("lista 5 itens (2 live + 3 coming-soon), coming-soon desabilitados, legacy fora da lista", () => {
    renderApp("/select");
    expect(screen.getByText("CTFL")).toBeInTheDocument();
    expect(screen.getByText("CTAL-TA")).toBeInTheDocument();
    // coming-soon presentes e desabilitados
    const soon = screen.getByText("CTAL-TM").closest("button");
    expect(soon).toBeDisabled();
    // legacy (CTFL-AT) não é card clicável na lista — aparece só na nota
    expect(screen.queryByText("CTFL-AT")?.closest("button.cert-card")).toBeFalsy();
    expect(screen.getByText(/legado/i)).toBeInTheDocument();
  });

  it("clicar num cert live navega e o masthead passa a refletir esse cert", async () => {
    const user = userEvent.setup();
    renderApp("/select");
    await user.click(screen.getByText("CTAL-TA").closest("button"));
    // masthead agora mostra CTAL-TA
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Test Analyst");
  });
});

describe("reset de estado na troca de cert (key remount)", () => {
  it("iniciar quiz no CTFL e trocar pra CTAL-TA volta pro setup, não vaza o quiz", async () => {
    const user = userEvent.setup();
    renderApp("/ctfl/quiz");
    // inicia o quiz (sai do setup)
    await user.click(screen.getByRole("button", { name: /iniciar/i }));
    expect(screen.queryByRole("button", { name: /iniciar/i })).not.toBeInTheDocument();
    // troca de cert via badge → tela de seleção → escolhe CTAL-TA
    await user.click(screen.getByRole("link", { name: /trocar certificação/i }));
    await user.click(screen.getByText("CTAL-TA").closest("button"));
    // se o key remontou, voltamos pro setup do quiz (botão Iniciar de novo)
    expect(screen.getByRole("button", { name: /iniciar/i })).toBeInTheDocument();
  });
});
