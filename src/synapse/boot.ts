/* Synapse · boot.ts — flags one-shot de inicialização (fora do estado
   React, lidas/gravadas direto no localStorage como o rascunho de
   simulado). Decidem os três momentos da constelação de abertura:

     first  → splash completo + onboarding de primeira visita
     update → splash completo + notas de versão
     quick  → splash rápido enquanto o banco carrega (nunca segura o app)

     return → splash completo após 12 horas fora do app, sem onboarding

   Chaves versionadas, iguais às demais do handoff (synapse.*.v1). */

import { APP_VERSION } from "./data/releases";

export const ONBOARDING_KEY = "synapse.onboarding.v2";
export const VERSION_KEY = "synapse.ver.v1";
export const INSTALL_KEY = "synapse.install.v1";
export const LAST_VISIT_KEY = "synapse.lastVisit.v1";
const RETURN_AFTER_MS = 12 * 60 * 60 * 1000;

export type BootMode = "first" | "update" | "return" | "quick";

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* modo privado — a próxima visita repete o momento, sem quebrar */
  }
}

export function bootMode(): BootMode {
  const now = Date.now();
  const lastVisit = Number(lsGet(LAST_VISIT_KEY));
  markVisitEnded();
  if (lsGet(ONBOARDING_KEY) !== "1") return "first";
  if (lsGet(VERSION_KEY) !== APP_VERSION) return "update";
  return lastVisit > 0 && now - lastVisit >= RETURN_AFTER_MS ? "return" : "quick";
}

export function markVisitEnded(): void {
  lsSet(LAST_VISIT_KEY, String(Date.now()));
}

export function markOnboardingDone(): void {
  lsSet(ONBOARDING_KEY, "1");
}

export function markVersionSeen(): void {
  lsSet(VERSION_KEY, APP_VERSION);
}

export function isInstallDismissed(): boolean {
  return lsGet(INSTALL_KEY) === "1";
}

export function dismissInstall(): void {
  lsSet(INSTALL_KEY, "1");
}
