import { beforeEach, describe, expect, test } from "bun:test";
import { APP_VERSION } from "../src/synapse/data/releases";
import { bootMode, markOnboardingDone, markVersionSeen, ONBOARDING_KEY, VERSION_KEY } from "../src/synapse/boot";

const values = new Map();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  },
});

beforeEach(() => values.clear());

describe("abertura", () => {
  test("mostra o onboarding reformulado mesmo após a chave antiga", () => {
    values.set("synapse.onboarding.v1", "1");
    values.set(VERSION_KEY, APP_VERSION);
    expect(bootMode()).toBe("first");
  });

  test("passa de primeira visita a atualização e abertura rápida", () => {
    expect(bootMode()).toBe("first");
    markOnboardingDone();
    expect(values.get(ONBOARDING_KEY)).toBe("1");
    expect(bootMode()).toBe("update");
    markVersionSeen();
    expect(bootMode()).toBe("quick");
  });
});
