import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("synapse-e2e-initialized")) {
      localStorage.clear();
      localStorage.setItem("ctfl_onboarding_done", "1");
      sessionStorage.setItem("synapse-e2e-initialized", "1");
    }
  });
});

test("seleção, estudo, persistência, idioma e reabertura do onboarding", async ({ page }) => {
  await page.goto("/select");
  await page.locator('[data-cert="ctfl"]').click();
  await expect(page).toHaveURL(/\/ctfl\/quiz$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Foundation Level");

  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.locator(".opt").first().click();
  await expect(page.locator(".explanation")).toBeVisible();

  const savedProgress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("synapse.progress.v1.ctfl"))
  );
  expect(savedProgress.total).toBe(1);

  await page.reload();
  const persistedProgress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("synapse.progress.v1.ctfl"))
  );
  expect(persistedProgress.total).toBe(1);

  await page.getByRole("button", { name: /mudar idioma para inglês/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("tab", { name: "Progress" }).click();
  const statsUrl = page.url();
  await page.getByRole("button", { name: "How does it work?" }).click();
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(statsUrl);
});

test("simulado pode ser concluído e persistido", async ({ page }) => {
  await page.goto("/ctfl/quiz");
  await page.getByRole("button", { name: /simulado/i }).click();
  await page.getByRole("button", { name: "Iniciar" }).click();

  await page.getByRole("button", { name: /ver todas as questões/i }).click();
  await page.locator(".exam-grid-item").last().click();
  await page.getByRole("button", { name: "Finalizar" }).click();

  await expect(page.locator(".result-score")).toContainText("/40");
  const examHistory = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.progress.v1.ctfl")).examHistory
  );
  expect(examHistory).toHaveLength(1);
});
