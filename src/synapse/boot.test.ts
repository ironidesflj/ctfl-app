import { beforeEach, describe, expect, it } from "vitest";
import { APP_VERSION } from "./data/releases";
import {
  bootMode,
  markOnboardingDone,
  markVersionSeen,
  LAST_VISIT_KEY,
  ONBOARDING_KEY,
  VERSION_KEY,
} from "./boot";

describe("abertura (bootMode)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mostra o onboarding reformulado se synapse.onboarding.v2 não estiver marcada", () => {
    localStorage.setItem("synapse.onboarding.v1", "1");
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    expect(bootMode()).toBe("first");
  });

  it("passa de primeira visita a atualização e abertura rápida", () => {
    expect(bootMode()).toBe("first");
    markOnboardingDone();
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe("1");
    expect(bootMode()).toBe("update");
    markVersionSeen();
    expect(bootMode()).toBe("quick");
  });

  it("repete a abertura completa após 12 horas sem repetir o onboarding", () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    localStorage.setItem(LAST_VISIT_KEY, String(Date.now() - 12 * 60 * 60 * 1000));
    expect(bootMode()).toBe("return");
    expect(bootMode()).toBe("quick");
  });
});
