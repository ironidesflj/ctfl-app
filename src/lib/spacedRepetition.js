// Algoritmo SM-2 (SuperMemo 2) de repetição espaçada.
// Lib isolada — ainda não integrada à UI (Quiz/Flashcards).

// r16 (QA v3.14.0): datas em espaço LOCAL ("YYYY-MM-DD" do fuso do
// usuário). Antes o dueDate vinha de toISOString() (UTC): em fusos
// negativos (Brasil = UTC-3) um cartão avaliado antes das 21:00 com
// intervalo 1 voltava à fila ÀS 21:00 DO MESMO DIA (meia-noite UTC),
// quebrando a promessa "volta em 1d" — e a "próxima revisão" andava
// ±1 dia quando exibida à noite (nextDueDate compara com todayLocal).
export function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function initSM2() {
  return { easeFactor: 2.5, interval: 0, repetitions: 0, dueDate: null };
}

// quality: 0-5. UI simplificada futura: "Errei"/"Difícil"/"Bom"/"Fácil" = 1/3/4/5.
export function sm2(card, quality) {
  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // r16: dueDate = hoje LOCAL + interval dias (antes: UTC — ver nota no
  // topo do arquivo). new Date() aqui é o "agora" do usuário.
  const due = new Date();
  due.setDate(due.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    dueDate: toLocalDateStr(due),
  };
}

// Mapeia respostas simples de UI para quality SM-2
export const QUALITY = { again: 1, hard: 3, good: 4, easy: 5 };

export function isDue(card, today = toLocalDateStr(new Date())) {
  if (!card.dueDate) return true; // nunca revisado = sempre due
  return card.dueDate <= today;
}
