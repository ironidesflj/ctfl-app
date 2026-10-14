import { describe, it, expect, beforeEach } from "vitest";
import { migrateSettings, getSetting, setSetting, isOnboardingDone } from "./settings.js";
import { collectFullBackup } from "./storage.js";

// r4: migração ctfl_* → synapse.* — a unificação de prefixos do backlog #1.
// Cenários: legado vira novo, novo prevalece sobre legado, legado é removido,
// fallback quando nada existe, e idempotência (rodar de novo é no-op).
beforeEach(() => {
  localStorage.clear();
});

describe("settings - migração ctfl_* → synapse.* (r4)", () => {
  it("valor legado é copiado para a chave nova e a legada é removida", () => {
    localStorage.setItem("ctfl_lang", "en");
    localStorage.setItem("ctfl_theme", "dark");
    localStorage.setItem("ctfl_onboarding_done", "1");
    const changed = migrateSettings();
    expect(changed).toBe(true);
    expect(localStorage.getItem("synapse.lang")).toBe("en");
    expect(localStorage.getItem("synapse.theme")).toBe("dark");
    expect(localStorage.getItem("synapse.onboardingDone")).toBe("1");
    expect(localStorage.getItem("ctfl_lang")).toBeNull();
    expect(localStorage.getItem("ctfl_theme")).toBeNull();
    expect(localStorage.getItem("ctfl_onboarding_done")).toBeNull();
  });

  it("chave nova já existente PREVALECE sobre a legada (não sobrescreve)", () => {
    localStorage.setItem("ctfl_lang", "en");
    localStorage.setItem("synapse.lang", "pt");
    migrateSettings();
    expect(getSetting("lang")).toBe("pt");
  });

  it("getSetting devolve fallback quando nada existe", () => {
    expect(getSetting("lang")).toBe("pt");
    expect(getSetting("theme")).toBe("auto");
    expect(isOnboardingDone()).toBe(false);
  });

  it("setSetting grava sob a chave nova e getSetting lê de volta", () => {
    setSetting("lang", "en");
    setSetting("theme", "dark");
    setSetting("onboardingDone", "1");
    expect(getSetting("lang")).toBe("en");
    expect(getSetting("theme")).toBe("dark");
    expect(isOnboardingDone()).toBe(true);
    // nada vazou para as chaves legadas
    expect(localStorage.getItem("ctfl_lang")).toBeNull();
  });

  it("migração é idempotente — segunda execução não muda nada", () => {
    localStorage.setItem("ctfl_lang", "en");
    migrateSettings();
    const changed2 = migrateSettings();
    expect(changed2).toBe(false);
    expect(getSetting("lang")).toBe("en");
  });

  it("sem chaves legadas, migração é no-op e retorna false", () => {
    expect(migrateSettings()).toBe(false);
  });
});

// r6: meta diária — setting nova de raiz (sem ancestral ctfl_*).
describe("settings - goal (meta diária, r6)", () => {
  it("default é 10 quando nada foi gravado", () => {
    expect(getSetting("goal")).toBe("10");
  });

  it("setSetting grava synapse.goal e getSetting lê de volta", () => {
    setSetting("goal", "20");
    expect(localStorage.getItem("synapse.goal")).toBe("20");
    expect(getSetting("goal")).toBe("20");
  });

  it("não cria chave legada para goal (não existe ctfl_goal)", () => {
    setSetting("goal", "30");
    expect(localStorage.getItem("ctfl_goal")).toBeNull();
    // e a migração continua no-op para goal
    expect(migrateSettings()).toBe(false);
  });
});

// r11: data da prova — setting nova de raiz (sem ancestral legado), igual
// ao goal. Viaja no backup completo (BACKUP_SETTINGS_KEYS): quem restaura
// em outro dispositivo quer o planejamento junto.
describe("settings - examDate (data da prova, r11)", () => {
  it("default é null quando nada foi gravado", () => {
    expect(getSetting("examDate")).toBeNull();
  });

  it('setSetting grava synapse.examDate e getSetting lê de volta; limpar = ""', () => {
    setSetting("examDate", "2026-12-05");
    expect(localStorage.getItem("synapse.examDate")).toBe("2026-12-05");
    expect(getSetting("examDate")).toBe("2026-12-05");
    setSetting("examDate", "");
    expect(getSetting("examDate")).toBe("");
  });

  it("não cria chave legada para examDate (não existe ctfl_exam_date)", () => {
    setSetting("examDate", "2026-12-05");
    expect(localStorage.getItem("ctfl_exam_date")).toBeNull();
    expect(migrateSettings()).toBe(false);
  });

  it("entra no backup completo (BACKUP_SETTINGS_KEYS, r11)", () => {
    setSetting("examDate", "2026-12-05");
    const backup = collectFullBackup();
    expect(backup.data["synapse.examDate"]).toBe("2026-12-05");
  });
});
