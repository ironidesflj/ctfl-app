import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ReleaseNotesModal from "./ReleaseNotesModal.jsx";
import { CURRENT_RELEASE, currentReleaseCopy, releaseSeenKey } from "../lib/releases.js";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("release notes significativas", () => {
  it("não mostra o modal legado quando a versão ativa mudou", () => {
    expect(CURRENT_RELEASE.version).not.toBe(__APP_VERSION__);
    render(<ReleaseNotesModal lang="pt" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(currentReleaseCopy("pt").title).toBe("O Synapse evoluiu");
  });

  it("não reaparece quando a versão já foi vista", () => {
    localStorage.setItem(releaseSeenKey(), "1");
    render(<ReleaseNotesModal lang="pt" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mantém a cópia legada em inglês sem mostrar um anúncio de versão antiga", () => {
    render(<ReleaseNotesModal lang="en" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(currentReleaseCopy("en").title).toBe("Synapse has evolved");
  });
});
