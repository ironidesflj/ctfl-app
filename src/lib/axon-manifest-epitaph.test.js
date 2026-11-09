import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assertRecordShape } from "../../scripts/lib/axon-manifest.mjs";

const first = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/manifest.jsonl"), "utf8").split("\n")[0]
);

describe("manifesto Axon — política epitáfio", () => {
  it("record ativo (sem retired) continua válido", () => {
    expect(() => assertRecordShape(first)).not.toThrow();
  });

  it("record com retired booleano é válido", () => {
    expect(() => assertRecordShape({ ...first, retired: true })).not.toThrow();
    expect(() => assertRecordShape({ ...first, retired: false })).not.toThrow();
  });

  it("retired com tipo inválido é rejeitado", () => {
    expect(() => assertRecordShape({ ...first, retired: "sim" })).toThrow(/booleano/);
  });
});
