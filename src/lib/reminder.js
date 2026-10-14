// r10 — Lembrete diário de estudo (backlog r9 #1).
//
// Notificações locais só disparam com o app aberto (Web Notifications não
// têm push de servidor — o app é 100% offline). A honestidade é parte do
// design: o card do Stats explica "o app precisa estar aberto". Quem usa
// a PWA instalada costuma deixá-la aberta em segundo plano, e é esse o
// público-alvo do lembrete.
//
// As funções PURAS (parseTimeHHMM, nextFireDate) são testadas em
// reminder.test.js; scheduleDailyReminder é o único lado-efeito.

import { getSetting } from "./settings.js";

// "HH:MM" (24h) → { h, m } | null. Aceita "7:5" (navegadores liberais),
// rejeita vazios/horas 25+/minutos 60+.
export function parseTimeHHMM(str) {
  if (typeof str !== "string") return null;
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(str.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

// Próximo instante em que o lembrete dispara, a partir de `now`:
// hoje se ainda não passou, senão amanhã. `now` é Date | number | null
// (null = new Date()). Retorna Date | null (hora inválida).
export function nextFireDate(now, timeStr) {
  const parsed = parseTimeHHMM(timeStr);
  if (!parsed) return null;
  const base = now == null ? new Date() : new Date(now);
  if (Number.isNaN(base.getTime())) return null;
  const fire = new Date(base);
  fire.setHours(parsed.h, parsed.m, 0, 0);
  if (fire.getTime() <= base.getTime()) {
    fire.setDate(fire.getDate() + 1);
  }
  return fire;
}

// Config atual (settings.js): { enabled: bool, time: "HH:MM" }.
// default: desligado, 19:00 (fim do expediente — horário mais comum de
// estudo pós-trabalho).
export function readReminderCfg() {
  const time = parseTimeHHMM(getSetting("reminderTime")) ? getSetting("reminderTime") : "19:00";
  return { enabled: getSetting("reminderEnabled") === "1", time };
}

// Agenda o disparo diário: no horário configurado chama `fire()` (uma vez)
// e re-agenda para o dia seguinte. Retorna `cancel` (limpa o timeout).
// `now`/`setTimeoutRef`/`clearTimeoutRef` injetáveis para os testes.
// Nota: a re-ocorrência soma 24h do instante do disparo (sem ajuste de
// DST — horário de verão desloca o lembrete em 1h no dia da virada,
// aceitável para um empurrãozinho diário).
export function scheduleDailyReminder(timeStr, fire, opts = {}) {
  const baseMs = opts.now != null ? new Date(opts.now).getTime() : Date.now();
  if (!nextFireDate(baseMs, timeStr)) return () => {};
  let timerId = null;
  let cancelled = false;
  const setTimeoutRef = opts.setTimeoutRef || ((fn, ms) => setTimeout(fn, ms));
  const clearTimeoutRef = opts.clearTimeoutRef || ((id) => clearTimeout(id));

  const arm = (fromMs) => {
    const at = nextFireDate(fromMs, timeStr);
    if (!at || cancelled) return;
    timerId = setTimeoutRef(
      () => {
        if (cancelled) return;
        try {
          fire();
        } catch {
          /* lembrete nunca derruba o app */
        }
        arm(at.getTime() + 1000); // "agora" = logo após o disparo (amanhã, mesmo horário)
      },
      Math.max(0, at.getTime() - fromMs)
    );
  };
  arm(baseMs);

  return () => {
    cancelled = true;
    if (timerId != null) clearTimeoutRef(timerId);
  };
}

// Corpo da notificação (mensagem motivacional com a meta do dia).
// A meta vem de synapse.goal — mesma fonte do anel do Quiz.
export function reminderGoalCount() {
  const g = parseInt(getSetting("goal"), 10);
  return Number.isFinite(g) && g > 0 ? g : 10;
}
