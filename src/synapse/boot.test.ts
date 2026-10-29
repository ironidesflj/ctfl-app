import { beforeEach, describe, expect, it } from "vitest";
import { APP_VERSION } from "./data/releases";
import { bootMode, markOnboardingDone, markVersionSeen, ONBOARDING_KEY, VERSION_KEY } from "./boot";

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
});
