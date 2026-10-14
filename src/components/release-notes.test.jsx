import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ReleaseNotesModal from "./ReleaseNotesModal.jsx";
import { releaseSeenKey } from "../lib/releases.js";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("release notes significativas", () => {
  it("mostra a release atual em PT e grava o aceite", () => {
    render(<ReleaseNotesModal lang="pt" />);
    expect(screen.getByRole("dialog", { name: "O Synapse evoluiu" })).toBeInTheDocument();
    expect(screen.getByText(/pools exclusivos/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Entendi" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(releaseSeenKey())).toBe("1");
  });

  it("não reaparece quando a versão já foi vista", () => {
    localStorage.setItem(releaseSeenKey(), "1");
    render(<ReleaseNotesModal lang="pt" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tem conteúdo em inglês e fecha com Escape", () => {
    render(<ReleaseNotesModal lang="en" />);
    expect(screen.getByRole("dialog", { name: "Synapse has evolved" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(releaseSeenKey())).toBe("1");
  });
});
