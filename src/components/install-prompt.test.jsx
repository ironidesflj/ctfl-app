// r7 — InstallPrompt: captura do beforeinstallprompt, pill visível, prompt()
// nativo no clique, dismiss persistido e sumiço pós-instalação.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act, waitFor } from "@testing-library/react";
import InstallPrompt from "./InstallPrompt.jsx";

beforeEach(() => {
  localStorage.clear();
  // este jsdom NÃO implementa matchMedia — stub manual (o componente
  // guarda com typeof, mas o teste precisa controlar o retorno)
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});
afterEach(() => {
  cleanup();
  delete window.matchMedia;
  vi.restoreAllMocks();
});

function fireBeforeInstallPrompt() {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  event.prompt = vi.fn(() => Promise.resolve({ outcome: "dismissed", platform: "web" }));
  Object.defineProperty(event, "userChoice", {
    get: () => Promise.resolve({ outcome: "dismissed" }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("r7: InstallPrompt", () => {
  it("invisível sem beforeinstallprompt (browser sem suporte/iOS)", () => {
    render(<InstallPrompt lang="pt" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("pill aparece após beforeinstallprompt e chama prompt() nativo no clique", async () => {
    render(<InstallPrompt lang="pt" />);
    const event = fireBeforeInstallPrompt();
    expect(event.defaultPrevented).toBe(true); // impedimos o infobar do Chrome

    const cta = await screen.findByRole("button", { name: "Instalar" });
    expect(screen.getByText("📲 Instalar o Synapse")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(cta);
    });
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  it("dismiss esconde o pill e persiste em synapse.installDismissed", () => {
    render(<InstallPrompt lang="pt" />);
    fireBeforeInstallPrompt();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /dispensar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("synapse.installDismissed")).toBe("1");

    // re-render (novo mount) não re-exibe: flag lida no initializer
    cleanup();
    render(<InstallPrompt lang="pt" />);
    fireBeforeInstallPrompt();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("appinstalled esconde o pill (já instalado)", async () => {
    render(<InstallPrompt lang="pt" />);
    fireBeforeInstallPrompt();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("não aparece quando já roda como standalone (display-mode)", () => {
    window.matchMedia = vi.fn(() => ({
      matches: true, // display-mode: standalone
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<InstallPrompt lang="pt" />);
    fireBeforeInstallPrompt();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("prompt aceito esconde o pill", async () => {
    render(<InstallPrompt lang="pt" />);
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = vi.fn(() => Promise.resolve({ outcome: "accepted", platform: "web" }));
    Object.defineProperty(event, "userChoice", {
      get: () => Promise.resolve({ outcome: "accepted" }),
    });
    act(() => {
      window.dispatchEvent(event);
    });
    const cta = await screen.findByRole("button", { name: "Instalar" });
    await act(async () => {
      fireEvent.click(cta);
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("i18n: pill em inglês quando lang=en", async () => {
    render(<InstallPrompt lang="en" />);
    fireBeforeInstallPrompt();
    expect(await screen.findByText("📲 Install Synapse")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Install" })).toBeInTheDocument();
  });
});
