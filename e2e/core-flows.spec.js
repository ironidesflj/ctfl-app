import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const releaseKey = `synapse.releaseNotes.seen.${version}`;

test("CTAL-TM conclui simulado com pontuação e progresso próprios", async ({ page }) => {
  await page.goto("/ctal-tm/quiz");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Test Manager");
  await page.getByRole("button", { name: /simulado/i }).click();
  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.getByRole("button", { name: /ver todas as questões/i }).click();
  await expect(page.locator(".exam-grid-item")).toHaveCount(50);
  await page.locator(".exam-grid-item").last().click();
  await page.getByRole("button", { name: "Finalizar" }).click();
  const exam = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.progress.v1.ctal-tm")).examHistory[0]
  );
  expect(exam.pointsTotal).toBe(88);
  expect(exam.passed).toBe(false);
  expect(exam.scoring).toBe("points");
  await page.getByRole("tab", { name: "Progresso" }).click();
  await expect(page.locator(".ach-roadmap-card")).not.toContainText("116%");
});

test("cabeçalho mobile preserva título e troca de certificação em 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const cert of ["ctfl", "ctal-ta", "ctal-tm"]) {
    await page.goto(`/${cert}/quiz`);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const lines = await heading.evaluate(
      (el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)
    );
    expect(lines).toBeLessThan(1.1);
    const change = page.getByRole("link", { name: "Trocar certificação" });
    await expect(change).toBeVisible();
    await change.click();
    await expect(page).toHaveURL(/\/select$/);
  }
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript((releaseKey) => {
    if (!sessionStorage.getItem("synapse-e2e-initialized")) {
      localStorage.clear();
      localStorage.setItem("ctfl_onboarding_done", "1");
      localStorage.setItem(releaseKey, "1");
      sessionStorage.setItem("synapse-e2e-initialized", "1");
    }
  }, releaseKey);
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

  await page.getByRole("button", { name: "About Synapse" }).click();
  await expect(page.getByRole("dialog", { name: "About Synapse" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "About the author" })).toBeVisible();
  await expect(page.getByRole("link", { name: /send feedback/i })).toHaveAttribute(
    "href",
    /issues\/new\?template=feedback\.yml$/
  );
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(statsUrl);
  await expect(page.getByRole("button", { name: "About Synapse" })).toBeFocused();
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

test("novidades de release aparecem uma vez por versão", async ({ page }) => {
  await page.goto("/select");
  await page.evaluate((key) => localStorage.removeItem(key), releaseKey);
  await page.reload();

  await expect(page.getByRole("dialog", { name: "O Synapse evoluiu" })).toBeVisible();
  await page.getByRole("button", { name: "Entendi" }).click();
  await page.reload();
  await expect(page.getByRole("dialog", { name: "O Synapse evoluiu" })).toHaveCount(0);
});
