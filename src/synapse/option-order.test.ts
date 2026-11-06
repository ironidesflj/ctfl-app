import { afterEach, describe, expect, it, vi } from "vitest";
import { shuffleOptionOrder } from "./option-order";

afterEach(() => vi.restoreAllMocks());

describe("shuffleOptionOrder", () => {
  it("guarda uma permutação dos índices canônicos sem alterar a questão", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const order = shuffleOptionOrder(4);
    expect(order).toEqual([1, 2, 3, 0]);
    expect(order.map((index) => ["A", "B", "C", "D"][index])).toEqual(["B", "C", "D", "A"]);
    expect(order.indexOf(0)).toBe(3); // gabarito canônico A aparece como D
  });
});
