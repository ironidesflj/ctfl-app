// r5 — Integridade do code-split do banco por cert.
// As fatias (src/data/banks/*.json) são geradas por scripts/split-bank.mjs
// a partir do monólito; estes testes garantem que a derivação continua
// fiel (mesmo pool que o filtro do getBank produzia com o monólito).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getBank, getRawBank, isBankLoaded, loadBankFor } from "./bank.js";
import { CERTS } from "./certs.config.js";

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const monolith = JSON.parse(readFileSync(path.join(dataDir, "synapse-question-bank.json"), "utf8"));

describe("r5: code-split do banco — integridade das fatias", () => {
  it.each(Object.keys(CERTS))(
    "fatos banks/%s.json == pool do monólito pelo mesmo filtro",
    (certId) => {
      const slice = JSON.parse(readFileSync(path.join(dataDir, "banks", `${certId}.json`), "utf8"));
      const cert = CERTS[certId];
      const expected = monolith.questions.filter((q) => {
        if (typeof q.cert === "string" && q.cert) return q.cert.toLowerCase() === certId;
        return cert.chapters.some(
          (c) => String(c.chapter) === String(q.chapter) && c.domain === q.domain
        );
      });
      expect(slice.questions).toEqual(expected);
      // meta viaja junto (blueprints, examFormat, chapterWeights)
      expect(slice.meta).toEqual(monolith.meta);
    }
  );

  it("cada fatia tem ids únicos (sem questão duplicada entre/intra fatias)", () => {
    const all = Object.keys(CERTS).flatMap((certId) => {
      const slice = JSON.parse(readFileSync(path.join(dataDir, "banks", `${certId}.json`), "utf8"));
      return slice.questions.map((q) => q.id);
    });
    expect(new Set(all).size).toBe(all.length);
  });

  it("getBank devolve o mesmo número de questões que a fatia crua", () => {
    Object.entries(CERTS).forEach(([certId]) => {
      const slice = getRawBank(certId);
      const bank = getBank(certId);
      expect(bank.ALL.length).toBe(slice.questions.length);
    });
  });
});

describe("r5: loadBankFor / isBankLoaded / getRawBank", () => {
  it("loadBankFor é idempotente (resolve imediatamente quando já carregado)", async () => {
    expect(isBankLoaded("ctfl")).toBe(true); // pré-carregado pelo test-setup
    await expect(loadBankFor("ctfl")).resolves.toBeUndefined();
  });

  it("chamadas concorrentes compartilham o mesmo carregamento", async () => {
    const p1 = loadBankFor("ctfl");
    const p2 = loadBankFor("ctfl");
    expect(p1).toBe(p2);
    await p1;
  });

  it("loadBankFor rejeita cert sem fatia (não existe chunk)", async () => {
    await expect(loadBankFor("nao-existe")).rejects.toThrow(/não encontrado/i);
  });

  it("getBank lança erro claro para cert desconhecida (config)", () => {
    expect(() => getBank("nao-existe")).toThrow(/desconhecida/i);
  });

  it("getRawBank devolve null para cert não carregada (sem throw)", () => {
    expect(getRawBank("nao-existe")).toBeNull();
  });
});
