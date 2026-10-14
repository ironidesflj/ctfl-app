// r4: preferências do usuário centralizadas sob o prefixo synapse.* — antes
// as chaves legadas ctfl_lang/ctfl_theme/ctfl_onboarding_done conviviam com
// as chaves synapse.progress.*/synapse.examDraft.* do storage, sobrando um
// híbrido de prefixos no localStorage (backlog #1 da rodada 3).
//
// Migração one-time e idempotente: para cada par (legacy → novo), copia o
// valor legado se o novo ainda não existe e remove a chave legada. Backups
// antigos continuam importáveis — o importFullBackup aceita as duas famílias
// na whitelist e a migração roda de novo no boot seguinte (import → reload).

const KEYS = {
  lang: { nu: "synapse.lang", legacy: "ctfl_lang", fallback: "pt" },
  theme: { nu: "synapse.theme", legacy: "ctfl_theme", fallback: "auto" },
  onboardingDone: { nu: "synapse.onboardingDone", legacy: "ctfl_onboarding_done", fallback: null },
  // r6: meta diária de questões (Stats) — inteiro serializado; sem par
  // legado (setting novo de raiz). O backup completo inclui a chave.
  goal: { nu: "synapse.goal", legacy: null, fallback: "10" },
  // r7: usuário dispensou o prompt de instalação da PWA — não insistir
  // (o beforeinstallprompt continua capturado, só não re-exibe o pill).
  installDismissed: { nu: "synapse.installDismissed", legacy: null, fallback: null },
  // r10: lembrete diário de estudo — liga/desliga + horário "HH:MM".
  // Sem par legado (setting novo de raiz); entra no backup completo.
  reminderEnabled: { nu: "synapse.reminderEnabled", legacy: null, fallback: null },
  reminderTime: { nu: "synapse.reminderTime", legacy: null, fallback: "19:00" },
  // r11: data da prova do usuário (YYYY-MM-DD ou null) — alimenta o card
  // "Data da prova" do Stats (contagem regressiva + ritmo p/ cobrir o banco).
  // Global (não por cert): uma prova por vez; trocar de cert mantém a data.
  // Sem par legado; entra no backup completo (BACKUP_SETTINGS_KEYS).
  examDate: { nu: "synapse.examDate", legacy: null, fallback: null },
};

// Converte chaves ctfl_* → synapse.*. Segura para chamar quantas vezes
// quiser (no-op quando não há chaves legadas). Retorna true se mudou algo.
export function migrateSettings() {
  let changed = false;
  Object.values(KEYS).forEach(({ nu, legacy }) => {
    // r6: keys sem ancestral legado (ex: goal) não têm o que migrar
    if (!legacy) return;
    try {
      const oldV = localStorage.getItem(legacy);
      if (oldV === null) return;
      if (localStorage.getItem(nu) === null) localStorage.setItem(nu, oldV);
      localStorage.removeItem(legacy);
      changed = true;
    } catch {
      /* storage indisponível (iframe/sandbox) */
    }
  });
  return changed;
}

export function getSetting(name) {
  const spec = KEYS[name];
  if (!spec) return null;
  try {
    const v = localStorage.getItem(spec.nu);
    return v === null ? spec.fallback : v;
  } catch {
    return spec.fallback;
  }
}

export function setSetting(name, value) {
  const spec = KEYS[name];
  if (!spec) return;
  try {
    localStorage.setItem(spec.nu, value);
  } catch {
    /* ignore */
  }
}

export function isOnboardingDone() {
  return getSetting("onboardingDone") === "1";
}

// r7: prompt de instalação dispensado (o "não me perturbe" do pill).
export function isInstallDismissed() {
  return getSetting("installDismissed") === "1";
}

export function dismissInstall() {
  setSetting("installDismissed", "1");
}
