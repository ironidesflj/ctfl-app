import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Onboarding from "./Onboarding.jsx";

afterEach(cleanup);

describe("variantes do onboarding", () => {
  it("mostra autor e feedback na página institucional", () => {
    render(<Onboarding variant="about" onDismiss={vi.fn()} lang="pt" />);

    expect(screen.getByRole("heading", { name: "Sobre o autor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Feedback" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enviar feedback/i })).toHaveAttribute(
      "href",
      "https://github.com/ironidesflj/ctfl-app/issues/new?template=feedback.yml"
    );
  });

  it("mantém a reentrada de métricas reduzida", () => {
    render(<Onboarding variant="reentry" onDismiss={vi.fn()} lang="pt" />);

    expect(screen.queryByRole("heading", { name: "Sobre o autor" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Feedback" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entendendo suas métricas" })).toBeInTheDocument();
  });
});
