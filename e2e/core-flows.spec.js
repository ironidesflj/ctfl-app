import { test, expect } from "@playwright/test";

const APP_VERSION = "4.1.0";
const releaseKey = "synapse.ver.v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((releaseKey) => {
    if (!sessionStorage.getItem("synapse-e2e-initialized")) {
      localStorage.clear();
      localStorage.setItem("synapse.onboarding.v2", "1");
      localStorage.setItem(releaseKey, APP_VERSION);
      sessionStorage.setItem("synapse-e2e-initialized", "1");
    }
  }, releaseKey);
});

test("CTAL-TM conclui simulado com pontuação e progresso próprios", async ({ page }) => {
  await page.goto("/ctal-tm/quiz");
  await expect(page.locator("#certCode")).toHaveText("CTAL-TM");
  await page.locator('button[data-nav="simulado"]').click();
  await page.getByRole("button", { name: /Começar simulado/i }).click();

  // Abre a grade de questões
  await page.getByRole("button", { name: /Ver grade/i }).click();
  const gridButtons = page.locator(".sim-grid button");
  await expect(gridButtons).toHaveCount(50);
  await gridButtons.last().click();

  await page.getByRole("button", { name: /Finalizar simulado/i }).click();
  const exam = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.exams.v1"))["ctal-tm"][0]
  );
  expect(exam.pointsTotal).toBe(88);
  expect(exam.passed).toBe(false);
  expect(exam.scoring).toBe("points");

  await page.locator('button[data-nav="progresso"]').click();
  await expect(page.locator(".sim-score")).not.toBeVisible();
});

test("cabeçalho mobile preserva título e troca de certificação em 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const cert of ["ctfl", "ctal-ta", "ctal-tm"]) {
    await page.goto(`/${cert}/quiz`);
    const certCode = page.locator("#certCode");
    await expect(certCode).toBeVisible();
    expect((await certCode.textContent())?.toLowerCase()).toContain(cert);

    const change = page.locator(".cert-btn");
    await expect(change).toBeVisible();
    await change.click();
    await expect(page).toHaveURL(/\/(select|certs)/);
  }
});

test("seleção, estudo, persistência, idioma e reabertura do onboarding", async ({ page }) => {
  await page.goto("/select");
  await page.locator('button[data-cert="ctfl"]').click();
  await expect(page.locator("#certCode")).toHaveText("CTFL");

  await page.locator('button[data-nav="estudar"]').click();
  // Começa o primeiro capítulo
  const startBtn = page.getByRole("button", { name: /Estudar capítulo/i }).first();
  await startBtn.click();
  await page.locator(".opt").first().click();
  await expect(page.locator(".explanation, .q-explanation")).toBeVisible();

  const savedSeen = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.seen.v1")).ctfl
  );
  expect(Object.keys(savedSeen).length).toBeGreaterThan(0);

  await page.reload();
  const persistedSeen = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.seen.v1")).ctfl
  );
  expect(Object.keys(persistedSeen).length).toBeGreaterThan(0);

  // Mudar idioma
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // Reabrir onboarding a partir de Sobre
  await page.locator('button[data-nav="about"]').click();
  await page.getByRole("button", { name: /How it works/i }).click();
  await expect(page.getByRole("dialog", { name: /How Synapse works/i })).toBeVisible();
  await page.getByRole("button", { name: /Close/i }).click();
});

test("simulado pode ser concluído e persistido", async ({ page }) => {
  await page.goto("/ctfl/quiz");
  await page.locator('button[data-nav="simulado"]').click();
  await page.getByRole("button", { name: /Começar simulado/i }).click();

  await page.getByRole("button", { name: /Ver grade/i }).click();
  await page.locator(".sim-grid button").last().click();
  await page.getByRole("button", { name: /Finalizar simulado/i }).click();

  await expect(page.locator(".sim-score")).toContainText("/40");
  const examHistory = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.exams.v1")).ctfl
  );
  expect(examHistory).toHaveLength(1);
});

test("novidades de release aparecem uma vez por versão", async ({ page }) => {
  await page.goto("/select");
  await page.evaluate((key) => localStorage.removeItem(key), releaseKey);
  await page.reload();

  await expect(page.getByRole("dialog", { name: /O Synapse evoluiu/i })).toBeVisible();
  await page.getByRole("button", { name: /Entendi/i }).click();
  await page.reload();
  await expect(page.getByRole("dialog", { name: /O Synapse evoluiu/i })).toHaveCount(0);
});
