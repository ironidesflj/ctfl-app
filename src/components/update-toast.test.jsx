// r8 — UpdateToast: aparece quando o fluxo de atualização do SW detecta um
// novo worker esperando; CTA aplica (SKIP_WAITING + reload); dismiss esconde.
// A lib pwa.js é mockada — o fluxo PROD real é testado em pwa.test.js.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import UpdateToast from "./UpdateToast.jsx";
import { waitForServiceWorkerUpdate, applyServiceWorkerUpdate } from "../lib/pwa.js";

vi.mock("../lib/pwa.js", () => ({
  waitForServiceWorkerUpdate: vi.fn(),
  applyServiceWorkerUpdate: vi.fn(),
}));

let updateCallback = null;

beforeEach(() => {
  waitForServiceWorkerUpdate.mockImplementation((onUpdate) => {
    updateCallback = onUpdate;
    return () => {
      updateCallback = null;
    };
  });
  applyServiceWorkerUpdate.mockReset();
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  updateCallback = null;
});

function fireUpdate() {
  const reg = { waiting: { postMessage: vi.fn() } };
  act(() => {
    updateCallback?.(reg);
  });
  return reg;
}

describe("r8: UpdateToast", () => {
  it("invisível enquanto não há update (a maioria das sessões)", () => {
    render(<UpdateToast lang="pt" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("aparece com título/CTA em PT quando o novo SW está waiting", () => {
    render(<UpdateToast lang="pt" />);
    fireUpdate();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Nova versão disponível")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Atualizar" })).toBeInTheDocument();
  });

  it("CTA aplica a atualização com o registration recebido", () => {
    render(<UpdateToast lang="pt" />);
    const reg = fireUpdate();
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    expect(applyServiceWorkerUpdate).toHaveBeenCalledTimes(1);
    expect(applyServiceWorkerUpdate).toHaveBeenCalledWith(reg);
  });

  it("dismiss (×) esconde o toast e não aplica a atualização", () => {
    render(<UpdateToast lang="pt" />);
    fireUpdate();
    fireEvent.click(screen.getByRole("button", { name: "Dispensar aviso de atualização" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(applyServiceWorkerUpdate).not.toHaveBeenCalled();
  });

  it("i18n: renderiza em inglês", () => {
    render(<UpdateToast lang="en" />);
    fireUpdate();
    expect(screen.getByText("New version available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("aria-live polido (leitor de tela anuncia sem roubar foco)", () => {
    render(<UpdateToast lang="pt" />);
    fireUpdate();
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
