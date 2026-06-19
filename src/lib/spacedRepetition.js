// Algoritmo SM-2 (SuperMemo 2) de repetição espaçada.
// Lib isolada — ainda não integrada à UI (Quiz/Flashcards).

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

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    dueDate: dueDate.toISOString().slice(0, 10),
  };
}

// Mapeia respostas simples de UI para quality SM-2
export const QUALITY = { again: 1, hard: 3, good: 4, easy: 5 };

export function isDue(card, today = new Date().toISOString().slice(0, 10)) {
  if (!card.dueDate) return true; // nunca revisado = sempre due
  return card.dueDate <= today;
}
