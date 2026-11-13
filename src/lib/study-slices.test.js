import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildBankMeta, buildStudySlices } from "../../scripts/lib/study-slices.mjs";

const readBank = (rel) => JSON.parse(readFileSync(path.join(process.cwd(), rel), "utf8"));
const bank = readBank("src/data/synapse-question-bank.json");
const generated = buildStudySlices(bank);
const generatedMeta = buildBankMeta(bank);

const read = (name) => readBank(`src/synapse/data/banks/${name}`);

describe("fatias de estudo/simulado geradas", () => {
  it("cada fatia commitada é idêntica à gerada do monólito", () => {
    for (const [name, data] of Object.entries(generated)) {
      expect(read(name), name).toEqual(data);
    }
    expect(read("meta.json"), "meta.json").toEqual(generatedMeta);
  });

  it("cobre os 3 certs vivos com os pools completos", () => {
    const count = (name) => Object.values(read(name)).reduce((acc, list) => acc + list.length, 0);
    expect(count("ctfl.json")).toBe(342);
    expect(count("ctfl-exam.json")).toBe(158);
    expect(count("ctal-ta.json")).toBe(266);
    expect(count("ctal-ta-exam.json")).toBe(184);
    expect(count("ctal-tm.json")).toBe(305);
    expect(count("ctal-tm-exam.json")).toBe(195);
    expect(count("ct-ai.json")).toBe(243);
    expect(count("ct-ai-exam.json")).toBe(117);

    const meta = read("meta.json");
    expect(meta.version).toBe(bank.meta.version);
    expect(meta.live).toEqual({ certs: 4, study: 1156, exam: 654, total: 1810 });
  });

  it("referência cita capítulo e LO quando o banco tem LO", () => {
    const tm = read("ctal-tm.json");
    const first = tm["1"][0];
    expect(first.ref).toMatch(/^ISTQB CTAL-TM v3\.0 · cap\. \d+/);
    expect(first.ref).toMatch(/· LO TM-/);
  });
});
