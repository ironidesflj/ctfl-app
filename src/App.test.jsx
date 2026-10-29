import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import App from "./App.jsx";
import { CERTS } from "./synapse/data/certs";

afterEach(cleanup);
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
  // Marca onboarding e versão como vistos para testes de navegação direta da casca
  localStorage.setItem("synapse.onboarding.v2", "1");
  localStorage.setItem("synapse.ver.v1", "4.1.0");
});

describe("Synapse 4.1 · Shell e Navegação", () => {
  it("renderiza o cabeçalho com marca Synapse by Noos, ferramentas e cert ativa", async () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /Synapse — início/i })).toBeInTheDocument();
    expect(screen.getByText("by Noos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Trocar de prova: CTFL/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Alternar tema/i })).toBeInTheDocument();
  });

  it("renderiza o trilho de navegação com todas as abas primárias e secundárias", async () => {
    const { container } = render(<App />);
    expect(container.querySelector('button[data-nav="hoje"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="estudar"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="simulado"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="flashcards"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="syllabus"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="progresso"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="glossary"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="about"]')).toBeInTheDocument();
    expect(container.querySelector('button[data-nav="certs"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Enviar feedback/i })).toBeInTheDocument();
  });

  it("navega entre as telas Hoje, Estudar, Simulado, Flashcards, Syllabus, Progresso, Glossário, Certificações e Sobre", async () => {
    const { container } = render(<App />);

    // Inicia em Hoje
    expect(container.querySelector('button[data-nav="hoje"]')).toHaveAttribute(
      "aria-current",
      "page"
    );

    // Navega para Estudar
    fireEvent.click(container.querySelector('button[data-nav="estudar"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="estudar"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Simulado
    fireEvent.click(container.querySelector('button[data-nav="simulado"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="simulado"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Flashcards
    fireEvent.click(container.querySelector('button[data-nav="flashcards"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="flashcards"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Syllabus
    fireEvent.click(container.querySelector('button[data-nav="syllabus"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="syllabus"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Progresso
    fireEvent.click(container.querySelector('button[data-nav="progresso"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="progresso"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Glossário
    fireEvent.click(container.querySelector('button[data-nav="glossary"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="glossary"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Certificações
    fireEvent.click(container.querySelector('button[data-nav="certs"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="certs"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Navega para Sobre
    fireEvent.click(container.querySelector('button[data-nav="about"]'));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="about"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });
  });

  it("alterna o idioma da interface entre PT e EN", async () => {
    const { container } = render(<App />);

    // Troca para inglês
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="hoje"]')?.textContent).toContain("Today");
      expect(container.querySelector('button[data-nav="estudar"]')?.textContent).toContain("Study");
      expect(container.querySelector('button[data-nav="simulado"]')?.textContent).toContain("Exam");
      expect(container.querySelector('button[data-nav="progresso"]')?.textContent).toContain(
        "Progress"
      );
    });

    // Volta para português
    fireEvent.click(screen.getByRole("button", { name: "PT" }));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="hoje"]')?.textContent).toContain("Hoje");
      expect(container.querySelector('button[data-nav="estudar"]')?.textContent).toContain(
        "Estudar"
      );
    });
  });

  it("troca de certificação ativa veste o app inteiro com o código correspondente", async () => {
    const { container } = render(<App />);

    // Abre certificações
    fireEvent.click(screen.getByRole("button", { name: /Trocar de prova: CTFL/i }));
    await waitFor(() => {
      expect(container.querySelector('button[data-nav="certs"]')).toHaveAttribute(
        "aria-current",
        "page"
      );
    });

    // Escolhe CTAL-TA
    const ctalBtn = screen.getByRole("button", { name: /CTAL-TA/i });
    fireEvent.click(ctalBtn);

    await waitFor(() => {
      expect(document.getElementById("certCode")?.textContent).toBe("CTAL-TA");
      expect(localStorage.getItem("synapse.cert.v1")).toBe("ctal-ta");
    });
  });
});

describe("Catálogo oficial de certificações ISTQB", () => {
  it("contém as 6 certificações do contrato (3 live, 2 soon, 1 legacy)", () => {
    const list = Object.values(CERTS);
    expect(list.length).toBe(6);
    expect(list.filter((c) => c.status === "live")).toHaveLength(3);
    expect(list.filter((c) => c.status === "soon")).toHaveLength(2);
    expect(list.filter((c) => c.status === "legacy")).toHaveLength(1);
  });
});

describe("Synapse 4.1 · Telas e Fluxos Caderno", () => {
  it("Hoje: exibe tarefas diárias, lembrete e streak", async () => {
    const { container } = render(<App />);
    expect(container.querySelector('button[data-nav="hoje"]')).toHaveAttribute(
      "aria-current",
      "page"
    );

    await waitFor(() => {
      expect(screen.getByText(/O que rende hoje/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Sessão de estudo/i)).toBeInTheDocument();
    expect(screen.getByText(/Revisão de cartões/i)).toBeInTheDocument();
    expect(screen.getByText(/Fechar a lacuna/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulado cronometrado/i)).toBeInTheDocument();
  });

  it("Progresso: exibe métricas, heatmap e botões de backup e CSV", async () => {
    // Registra 1 simulado para habilitar a exportação CSV (e.n é obrigatório pelo sanitizador)
    localStorage.setItem(
      "synapse.exams.v1",
      JSON.stringify({
        ctfl: [
          { at: Date.now(), passed: true, score: 32, total: 40, n: 40, pct: 80, custom: false },
        ],
      })
    );

    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button[data-nav="progresso"]'));

    await waitFor(() => {
      expect(screen.getByText(/Onde você está/i)).toBeInTheDocument();
    });

    // Painel colapsável Entendendo suas métricas
    expect(screen.getByText(/Entendendo suas métricas/i)).toBeInTheDocument();

    // Seção Dados e Backup
    expect(screen.getByText(/Dados e Backup/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Exportar backup \(JSON\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Baixar histórico \(CSV\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Limpar progresso/i })).toBeInTheDocument();
  });

  it("Glossário: filtra termos por busca", async () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button[data-nav="glossary"]'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar termo ou definição/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar termo ou definição/i);
    fireEvent.change(searchInput, { target: { value: "regressão" } });
    await waitFor(() => {
      expect(screen.getByText(/teste de regressão/i)).toBeInTheDocument();
    });
  });

  it("Syllabus: exibe tabela de capítulos e pesos oficiais", async () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button[data-nav="syllabus"]'));

    await waitFor(() => {
      expect(screen.getByText(/O que a prova cobra/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Fundamentos do Teste/i)).toBeInTheDocument();
  });

  it("Sobre: exibe fontes oficiais, autor, Noos e botão Como funciona", async () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button[data-nav="about"]'));

    await waitFor(() => {
      expect(screen.getByText(/Fontes oficiais\./i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Quem faz\./i)).toBeInTheDocument();
    expect(screen.getByText(/Ironides Francisco/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Como funciona/i })).toBeInTheDocument();
  });

  it("Onboarding: abre via Sobre e exibe as estações e demo interativa", async () => {
    const { container } = render(<App />);
    fireEvent.click(container.querySelector('button[data-nav="about"]'));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Como funciona/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Como funciona/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /Como funciona o Synapse/i })).toBeVisible();
    });

    expect(screen.getByText(/O que você vai encontrar/i)).toBeInTheDocument();
    expect(screen.getByText(/Veja como funciona/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Qual é a relação correta entre erro, defeito e falha\?/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Perguntas frequentes/i)).toBeInTheDocument();
  });
});
