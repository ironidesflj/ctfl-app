import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { SynapseProvider, useSynapse } from "./store";
import {
  collectFullBackup,
  exportProgress,
  saveProgress,
  loadProgress,
  recordAnswer,
} from "../lib/storage.js";
import { setSetting } from "../lib/settings.js";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(SynapseProvider, null, children);
}

describe("Backup & Goal parity", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("importa corretamente backup completo antigo (app: 'synapse-backup') e reflete dados imediatamente", async () => {
    // 1. Gera um backup antigo com as funções reais da 3.18
    let prog = loadProgress("ctfl");
    prog = recordAnswer(prog, 1, true, "ch1-01");
    prog = recordAnswer(prog, 2, false, "ch2-01");
    saveProgress(prog, "ctfl");
    setSetting("goal", "20");
    setSetting("lang", "pt");
    setSetting("theme", "dark");
    localStorage.setItem("synapse.lastCert", "ctfl");

    const oldBackup = collectFullBackup();
    expect(oldBackup.app).toBe("synapse-backup");

    // Limpa o storage para simular outro dispositivo
    localStorage.clear();

    const { result } = renderHook(() => useSynapse(), { wrapper });

    // Estado inicial vazio
    expect(result.current.seenFor(result.current.cert().chapters[0])).toBe(0);

    // 2. Importa o arquivo de backup completo antigo
    const file = new File([JSON.stringify(oldBackup)], "backup.json", {
      type: "application/json",
    });

    let res: { ok: boolean; message: string } = { ok: false, message: "" };
    await act(async () => {
      res = await result.current.importBackup(file);
    });

    expect(res.ok).toBe(true);
    // 3. Os dados devem aparecer imediatamente no state
    expect(result.current.state.goal).toBe(20);
    expect(result.current.seenFor(result.current.cert().chapters[0])).toBeGreaterThan(0);
    expect(result.current.state.seen.ctfl["ch1-01"]).toBe(1);
    expect(result.current.state.attempts.ctfl["ch1-01"]).toMatchObject({
      ok: 1,
      tries: 1,
      last: true,
      ch: 1,
    });
  });

  it("importa backup por certificação antigo e reflete dados", async () => {
    let prog = loadProgress("ctfl");
    prog = recordAnswer(prog, 1, true, "ch1-01");

    const certBackup = {
      app: "synapse",
      cert: "ctfl",
      exportedAt: new Date().toISOString(),
      progress: prog,
    };

    localStorage.clear();
    const { result } = renderHook(() => useSynapse(), { wrapper });

    const file = new File([JSON.stringify(certBackup)], "ctfl-backup.json", {
      type: "application/json",
    });

    let res = { ok: false, message: "" };
    await act(async () => {
      res = await result.current.importBackup(file);
    });

    expect(res.ok).toBe(true);
    expect(result.current.state.seen.ctfl["ch1-01"]).toBe(1);
  });

  it("rejeita e não anuncia sucesso quando nenhum dado reconhecido é restaurado", async () => {
    const { result } = renderHook(() => useSynapse(), { wrapper });
    const emptyFile = new File([JSON.stringify({ randomKey: 123 })], "bad.json", {
      type: "application/json",
    });

    let res = { ok: true, message: "" };
    await act(async () => {
      res = await result.current.importBackup(emptyFile);
    });

    expect(res.ok).toBe(false);
  });

  it("exporta backup novo com todas as preferências, rascunhos e metas", async () => {
    localStorage.setItem("synapse.goal", "30");
    localStorage.setItem("synapse.onboarding.v2", "1");
    localStorage.setItem("synapse.saved.v1", JSON.stringify({ ctfl: ["ch1-01"] }));
    localStorage.setItem(
      "synapse.examdraft.v1",
      JSON.stringify({
        cert: "ctfl",
        questionIds: ["ch1-01"],
        optOrder: [[0, 1, 2, 3]],
        answers: [1],
        flags: [false],
        durations: [20],
        idx: 0,
        timeLeft: 3000,
        custom: false,
        savedAt: Date.now(),
      })
    );

    const { result } = renderHook(() => useSynapse(), { wrapper });

    let exportedBlobText = "";
    const origCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blob.text().then((txt) => {
        exportedBlobText = txt;
      });
      return "blob:mock";
    });

    act(() => {
      result.current.exportBackup();
    });

    await vi.waitFor(() => expect(exportedBlobText).not.toBe(""));
    const exported = JSON.parse(exportedBlobText);
    expect(exported.app).toBe("synapse");
    expect(exported.version).toBe("4.1.0");
    expect(exported.data["synapse.goal"]).toBe("30");
    expect(exported.data["synapse.onboarding.v2"]).toBe("1");
    expect(exported.data["synapse.saved.v1"]).toEqual({ ctfl: ["ch1-01"] });
    expect(exported.data["synapse.examdraft.v1"].questionIds).toEqual(["ch1-01"]);

    URL.createObjectURL = origCreateObjectURL;
  });

  it("permite alterar a meta diária e persiste em synapse.goal", () => {
    const { result } = renderHook(() => useSynapse(), { wrapper });
    expect(result.current.state.goal).toBe(10); // default

    act(() => {
      result.current.setGoal(20);
    });

    expect(result.current.state.goal).toBe(20);
    expect(localStorage.getItem("synapse.goal")).toBe("20");
  });

  it("validação de backup: rejeita {'data':{'chaveDesconhecida':123}} sem escrever no storage nem anunciar sucesso", async () => {
    localStorage.clear();
    const { result } = renderHook(() => useSynapse(), { wrapper });

    const maliciousFile = new File(
      [JSON.stringify({ data: { chaveDesconhecida: 123 } })],
      "unknown.json",
      {
        type: "application/json",
      }
    );

    let res = { ok: true, message: "" };
    await act(async () => {
      res = await result.current.importBackup(maliciousFile);
    });

    expect(res.ok).toBe(false);
    expect(localStorage.getItem("chaveDesconhecida")).toBeNull();
    expect(localStorage.getItem("data")).toBeNull();
  });

  it("backup antigo sobre dados existentes: substitui o progresso da certificação importada imediatamente", async () => {
    localStorage.clear();

    // 1. Cria progresso existente no navegador para 'ctfl' (questão old)
    localStorage.setItem("synapse.seen.v1", JSON.stringify({ ctfl: { "ch1-old": 1 } }));
    localStorage.setItem(
      "synapse.attempts.v1",
      JSON.stringify({
        ctfl: {
          "ch1-old": { ok: 1, tries: 1, at: Date.now(), ch: 1, last: true },
        },
      })
    );

    const { result } = renderHook(() => useSynapse(), { wrapper });
    expect(result.current.state.seen.ctfl?.["ch1-old"]).toBe(1);

    // 2. Prepara backup 3.18 para 'ctfl' contendo questão diferente ('ch1-new')
    let prog = loadProgress("ctfl");
    prog = recordAnswer(prog, 1, true, "ch1-new");

    const oldCertBackup = {
      app: "synapse",
      cert: "ctfl",
      exportedAt: new Date().toISOString(),
      progress: prog,
    };

    const file = new File([JSON.stringify(oldCertBackup)], "conflict.json", {
      type: "application/json",
    });

    let res = { ok: false, message: "" };
    await act(async () => {
      res = await result.current.importBackup(file);
    });

    expect(res.ok).toBe(true);
    // 3. O estado importado substitui o anterior e reflete na hora
    expect(result.current.state.seen.ctfl["ch1-new"]).toBe(1);
    expect(result.current.state.seen.ctfl["ch1-old"]).toBeUndefined();
    expect(result.current.state.attempts.ctfl["ch1-new"]).toBeDefined();
    expect(result.current.state.attempts.ctfl["ch1-old"]).toBeUndefined();
  });

  it("questões salvas: fluxo completo de marcar, desmarcar, listar e limpar progresso", () => {
    localStorage.clear();
    const { result } = renderHook(() => useSynapse(), { wrapper });

    expect(result.current.savedIds()).toEqual([]);
    expect(result.current.isSaved("q-test-01")).toBe(false);

    // Salvar
    let nextState = false;
    act(() => {
      nextState = result.current.toggleSaved("q-test-01");
    });
    expect(nextState).toBe(true);
    expect(result.current.isSaved("q-test-01")).toBe(true);
    expect(result.current.savedIds()).toEqual(["q-test-01"]);
    expect(JSON.parse(localStorage.getItem("synapse.saved.v1") || "{}")).toEqual({
      ctfl: ["q-test-01"],
    });

    // Desmarcar
    act(() => {
      nextState = result.current.toggleSaved("q-test-01");
    });
    expect(nextState).toBe(false);
    expect(result.current.isSaved("q-test-01")).toBe(false);
    expect(result.current.savedIds()).toEqual([]);

    // Salva de novo e limpa progresso da cert
    act(() => {
      result.current.toggleSaved("q-test-02");
    });
    expect(result.current.savedIds()).toEqual(["q-test-02"]);

    act(() => {
      result.current.resetProgress(true); // certOnly
    });

    // Deve limpar as questões salvas da certificação
    expect(result.current.savedIds()).toEqual([]);
    const savedInStorage = JSON.parse(localStorage.getItem("synapse.saved.v1") || "{}");
    expect(savedInStorage.ctfl).toBeUndefined();
  });
});
