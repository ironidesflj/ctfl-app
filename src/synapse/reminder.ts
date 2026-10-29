/* Synapse · reminder.ts — lembrete diário de estudo (porta do r10 do
   v3.18.0). Funções PURAS testáveis + um único efeito de agendamento.

   Honestidade do design: notificações web não têm push de servidor —
   o lembrete só dispara com o app aberto (em segundo plano conta). A
   UI avisa isso; aqui nada tenta fingir o contrário. */

export const DEFAULT_REMINDER_TIME = "19:00";

/** "HH:MM" (24h) → { h, m } | null. Aceita "7:5", rejeita vazios/25:70. */
export function parseTimeHHMM(str: string | null | undefined): { h: number; m: number } | null {
  if (typeof str !== "string") return null;
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(str.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

/** Próximo instante em que o lembrete dispara a partir de `now`
    (hoje se ainda não passou, senão amanhã). Retorna Date | null. */
export function nextFireDate(now: Date | number | null, timeStr: string): Date | null {
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

/** Agenda o disparo diário: no horário configurado chama `fire()` (uma
    vez) e re-agenda para o dia seguinte. Retorna `cancel`. O re-agendamento
    recalcula o horário em hora local (setHours) — correto através da
    virada de DST, sem deslocar o empurrãozinho do dia seguinte. */
export function scheduleDailyReminder(
  timeStr: string,
  fire: () => void,
  opts: {
    now?: number;
    setTimeoutRef?: (fn: () => void, ms: number) => unknown;
    clearTimeoutRef?: (id: unknown) => void;
  } = {}
): () => void {
  const baseMs = opts.now != null ? new Date(opts.now).getTime() : Date.now();
  if (!nextFireDate(baseMs, timeStr)) return () => {};
  let timerId: unknown = null;
  let cancelled = false;
  const setTimeoutRef = opts.setTimeoutRef || ((fn: () => void, ms: number) => setTimeout(fn, ms));
  const clearTimeoutRef =
    opts.clearTimeoutRef || ((id: unknown) => clearTimeout(id as ReturnType<typeof setTimeout>));

  const arm = (fromMs: number) => {
    const at = nextFireDate(fromMs, timeStr);
    if (!at || cancelled) return;
    timerId = setTimeoutRef(
      () => {
        if (cancelled) return;
        try {
          fire();
        } catch {
          /* o lembrete nunca derruba o app */
        }
        arm(at.getTime() + 1000);
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

/** Config saneada lida do storage: { enabled, time } sempre válidos. */
export function sanitizeReminder(raw: unknown): { enabled: boolean; time: string } {
  const obj = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<
    string,
    unknown
  >;
  const time =
    typeof obj.time === "string" && parseTimeHHMM(obj.time) ? obj.time : DEFAULT_REMINDER_TIME;
  return { enabled: obj.enabled === true, time };
}
