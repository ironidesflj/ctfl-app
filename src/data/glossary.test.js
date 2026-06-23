import { describe, it, expect } from "vitest";
import { findGlossaryTermsInText } from "./glossary.js";

describe("findGlossaryTermsInText", () => {
  it("encontra termo isolado", () => {
    const result = findGlossaryTermsInText("Isso causou um Erro no sistema.", "pt");
    expect(result.some((t) => t.term === "Erro")).toBe(true);
  });

  it("NÃO encontra termo como substring de outra palavra", () => {
    const result = findGlossaryTermsInText("O sistema ferroviário falhou.", "pt");
    // "ferroviário" contém "erro" como substring, mas não deve casar
    expect(result.some((t) => t.term === "Erro")).toBe(false);
  });

  it("encontra termo de frase com pontuação ao redor", () => {
    const result = findGlossaryTermsInText("Aplicamos Risco de produto na priorização.", "pt");
    expect(result.some((t) => t.term === "Risco de produto")).toBe(true);
  });

  it("é case-insensitive", () => {
    const result = findGlossaryTermsInText("houve uma FALHA grave", "pt");
    expect(result.some((t) => t.term === "Falha")).toBe(true);
  });
});
