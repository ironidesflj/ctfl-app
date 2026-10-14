// r10 — testes do lembrete diário (lib/reminder.js).
// As funções puras (parseTimeHHMM, nextFireDate) cobrem os limites;
// scheduleDailyReminder usa setTimeout/clearTimeout INJETADOS (fake manual,
// sem viemock — determinístico e sem relógio real).
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseTimeHHMM,
  nextFireDate,
  readReminderCfg,
  scheduleDailyReminder,
  reminderGoalCount,
} from "./reminder.js";
import { getSetting, setSetting } from "./settings.js";

describe("parseTimeHHMM", () => {
  it("parseia HH:MM válido", () => {
    expect(parseTimeHHMM("19:00")).toEqual({ h: 19, m: 0 });
    expect(parseTimeHHMM("07:05")).toEqual({ h: 7, m: 5 });
    expect(parseTimeHHMM("7:5")).toEqual({ h: 7, m: 5 }); // input liberal
    expect(parseTimeHHMM("  23:59  ")).toEqual({ h: 23, m: 59 });
  });
  it("rejeita inválidos", () => {
    expect(parseTimeHHMM("")).toBeNull();
    expect(parseTimeHHMM("24:00")).toBeNull();
    expect(parseTimeHHMM("12:60")).toBeNull();
    expect(parseTimeHHMM("abc")).toBeNull();
    expect(parseTimeHHMM("19h00")).toBeNull();
    expect(parseTimeHHMM(null)).toBeNull();
    expect(parseTimeHHMM(19)).toBeNull();
  });
});

describe("nextFireDate", () => {
  // 2026-10-14 10:00 (quarta) — instância fixa, sem relógio real
  const NOW = new Date(2026, 9, 14, 10, 0, 0);

  it("horário ainda não passado → hoje no horário", () => {
    const fire = nextFireDate(NOW, "15:30");
    expect(fire.getFullYear()).toBe(2026);
    expect(fire.getMonth()).toBe(9);
    expect(fire.getDate()).toBe(14);
    expect(fire.getHours()).toBe(15);
    expect(fire.getMinutes()).toBe(30);
  });
  it("horário já passado → amanhã no horário", () => {
    const fire = nextFireDate(NOW, "08:00");
    expect(fire.getDate()).toBe(15);
    expect(fire.getHours()).toBe(8);
  });
  it("agora exato → amanhã (não dispara em cima da hora)", () => {
    const fire = nextFireDate(NOW, "10:00");
    expect(fire.getDate()).toBe(15);
    expect(fire.getHours()).toBe(10);
  });
  it("hora inválida → null", () => {
    expect(nextFireDate(NOW, "99:99")).toBeNull();
    expect(nextFireDate(NOW, "")).toBeNull();
  });
  it("aceita now como epoch number", () => {
    const ms = NOW.getTime();
    const fire = nextFireDate(ms, "11:00");
    expect(fire.getHours()).toBe(11);
    expect(fire.getDate()).toBe(14);
  });
});

describe("readReminderCfg", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("default: desligado, 19:00", () => {
    expect(readReminderCfg()).toEqual({ enabled: false, time: "19:00" });
  });
  it("persistido: ligado com horário custom", () => {
    setSetting("reminderEnabled", "1");
    setSetting("reminderTime", "07:30");
    expect(readReminderCfg()).toEqual({ enabled: true, time: "07:30" });
  });
  it("horário corrompido cai no default 19:00 (não crasha)", () => {
    setSetting("reminderEnabled", "1");
    localStorage.setItem("synapse.reminderTime", "banana");
    expect(readReminderCfg()).toEqual({ enabled: true, time: "19:00" });
  });
});

describe("reminderGoalCount", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("lê a meta do dia (mesma fonte do anel do Quiz)", () => {
    setSetting("goal", "20");
    expect(reminderGoalCount()).toBe(20);
  });
  it("default 10 quando ausente/corrompido", () => {
    expect(reminderGoalCount()).toBe(10);
    setSetting("goal", "xyz");
    expect(reminderGoalCount()).toBe(10);
  });
});

describe("scheduleDailyReminder", () => {
  // fake setTimeout/clearTimeout: guarda (fn, delay) em fila; o teste
  // avança os relógios explicitamente e roda o callback vencido.
  function makeFakeTimers() {
    let now = new Date(2026, 9, 14, 10, 0, 0).getTime();
    const pend = new Map();
    let seq = 0;
    const setTimeoutRef = (fn, ms) => {
      const id = ++seq;
      pend.set(id, { at: now + ms, fn });
      return id;
    };
    const clearTimeoutRef = (id) => pend.delete(id);
    const advance = (ms) => {
      const target = now + ms;
      for (;;) {
        let next = null;
        for (const [id, t] of pend)
          if (t.at <= target && (!next || t.at < next.at)) next = { id, ...t };
        if (!next) break;
        now = next.at;
        pend.delete(next.id);
        next.fn();
      }
      now = target;
    };
    return { setTimeoutRef, clearTimeoutRef, advance };
  }

  it("dispara no horário e re-agenda pro dia seguinte", () => {
    const ft = makeFakeTimers();
    const fire = vi.fn();
    const cancel = scheduleDailyReminder("11:00", fire, {
      now: new Date(2026, 9, 14, 10).getTime(),
      setTimeoutRef: ft.setTimeoutRef,
      clearTimeoutRef: ft.clearTimeoutRef,
    });
    expect(fire).not.toHaveBeenCalled();
    ft.advance(60 * 60 * 1000); // 10:00 → 11:00
    expect(fire).toHaveBeenCalledTimes(1);
    ft.advance(24 * 60 * 60 * 1000); // 11:00 → 11:00 do dia seguinte
    expect(fire).toHaveBeenCalledTimes(2);
    cancel();
  });
  it("cancel impede disparos futuros", () => {
    const ft = makeFakeTimers();
    const fire = vi.fn();
    const cancel = scheduleDailyReminder("11:00", fire, {
      now: new Date(2026, 9, 14, 10).getTime(),
      setTimeoutRef: ft.setTimeoutRef,
      clearTimeoutRef: ft.clearTimeoutRef,
    });
    cancel();
    ft.advance(48 * 60 * 60 * 1000);
    expect(fire).not.toHaveBeenCalled();
  });
  it("horário já passado hoje agenda pra amanhã (não dispara no passado)", () => {
    const ft = makeFakeTimers();
    const fire = vi.fn();
    const cancel = scheduleDailyReminder("08:00", fire, {
      now: new Date(2026, 9, 14, 10).getTime(),
      setTimeoutRef: ft.setTimeoutRef,
      clearTimeoutRef: ft.clearTimeoutRef,
    });
    ft.advance(22 * 60 * 60 * 1000); // 10:00 → 08:00 do dia SEGUINTE (faltam 22h)
    expect(fire).toHaveBeenCalledTimes(1);
    cancel();
  });
  it("fire que lança não derruba o agendamento do dia seguinte", () => {
    const ft = makeFakeTimers();
    const fire = vi.fn(() => {
      throw new Error("boom");
    });
    const cancel = scheduleDailyReminder("11:00", fire, {
      now: new Date(2026, 9, 14, 10).getTime(),
      setTimeoutRef: ft.setTimeoutRef,
      clearTimeoutRef: ft.clearTimeoutRef,
    });
    ft.advance(60 * 60 * 1000);
    expect(fire).toHaveBeenCalledTimes(1); // lançou…
    ft.advance(24 * 60 * 60 * 1000);
    expect(fire).toHaveBeenCalledTimes(2); // …e o loop sobreviveu
    cancel();
  });
  it("hora inválida → cancel é no-op imediato", () => {
    const ft = makeFakeTimers();
    const fire = vi.fn();
    const cancel = scheduleDailyReminder("xx:yy", fire, {
      now: 0,
      setTimeoutRef: ft.setTimeoutRef,
      clearTimeoutRef: ft.clearTimeoutRef,
    });
    ft.advance(7 * 24 * 60 * 60 * 1000);
    expect(fire).not.toHaveBeenCalled();
    expect(() => cancel()).not.toThrow();
  });
});

describe("backup inclui as chaves do lembrete", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("reminderEnabled/reminderTime viajam no backup completo", async () => {
    const { collectFullBackup } = await import("./storage.js");
    setSetting("reminderEnabled", "1");
    setSetting("reminderTime", "20:15");
    const backup = collectFullBackup();
    expect(backup.data["synapse.reminderEnabled"]).toBe("1");
    expect(backup.data["synapse.reminderTime"]).toBe("20:15");
    // sanity: getSetting lê de volta (roundtrip das chaves novas)
    expect(getSetting("reminderEnabled")).toBe("1");
  });
});
