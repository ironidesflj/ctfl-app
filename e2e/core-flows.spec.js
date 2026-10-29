import { test, expect } from "@playwright/test";

const APP_VERSION = "4.1.0";
const releaseKey = "synapse.ver.v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ key, version }) => {
      if (sessionStorage.getItem("synapse-test-first-run") !== "1") {
        localStorage.setItem("synapse.onboarding.v2", "1");
      }
      if (sessionStorage.getItem("synapse-skip-version-seed") !== "1") {
        localStorage.setItem(key, version);
      }
    },
    { key: releaseKey, version: APP_VERSION }
  );
});

test("primeira visita mostra onboarding após o splash sem expor Hoje", async ({ page }) => {
  await page.goto("/ctfl/hoje");
  await page.evaluate(() => {
    sessionStorage.setItem("synapse-test-first-run", "1");
    localStorage.removeItem("synapse.onboarding.v2");
    localStorage.removeItem("synapse.ver.v1");
  });
  await page.reload();
  await expect(page.locator(".splash")).toBeVisible();
  await expect(page.locator(".top")).toBeHidden();
  await expect(page.locator(".ob-overlay")).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".splash")).toHaveCount(0, { timeout: 10000 });
});

test("CTAL-TM conclui simulado com pontuação e progresso próprios", async ({ page }) => {
  await page.goto("/ctal-tm/quiz");
  await expect(page.locator("#certCode")).toHaveText("CTAL-TM");
  await page.locator('button[data-nav="simulado"]').click();
  await page
    .getByRole("button", { name: /Começar simulado/i })
    .first()
    .click();

  // Abre a grade de questões
  await page.getByRole("button", { name: /Ver grade/i }).click();
  const gridButtons = page.locator(".sim-grid button");
  await expect(gridButtons).toHaveCount(50);
  await gridButtons.last().click();

  await page.getByRole("button", { name: /Finalizar simulado/i }).click();
  const exam = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.exams.v1"))["ctal-tm"][0]
  );
  expect(exam.pointsTotal).toBeGreaterThanOrEqual(75);
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
  const startBtn = page
    .getByRole("button", { name: /Estudar este capítulo|Começar estudo|Estudar capítulo/i })
    .first();
  await startBtn.click();
  await page.locator(".opt").first().click();
  const checkBtn = page.getByRole("button", { name: /Conferir resposta|Check answer/i });
  if (await checkBtn.isVisible()) {
    await checkBtn.click();
  }
  await expect(
    page.locator(".feedback, .fb-exp, .explanation, .q-explanation").first()
  ).toBeVisible();

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
  await page.getByRole("button", { name: /Close|Fechar/i }).click();
});

test("simulado pode ser concluído e persistido", async ({ page }) => {
  await page.goto("/ctfl/quiz");
  await page.locator('button[data-nav="simulado"]').click();
  await page
    .getByRole("button", { name: /Começar simulado/i })
    .first()
    .click();

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
  await page.evaluate((key) => {
    sessionStorage.setItem("synapse-skip-version-seed", "1");
    localStorage.removeItem(key);
  }, releaseKey);
  await page.reload();

  await expect(page.getByRole("dialog", { name: /Synapse ganhou|Synapse has/i })).toBeVisible({
    timeout: 12000,
  });
  await page.getByRole("button", { name: /Entendi|Got it/i }).click();
  await page.reload();
  await expect(page.getByRole("dialog", { name: /Synapse ganhou|Synapse has/i })).toHaveCount(0);
});

test("migração com formato real da 3.18 preserva capítulos, tentativas, histórico, SRS e rascunhos", async ({
  page,
}) => {
  // Prepara localStorage com formato real da versão 3.18
  await page.addInitScript(() => {
    const fake318Progress = {
      schemaVersion: 2,
      total: 3,
      correct: 2,
      seen: { "ch1-01": "correct", "ch1-02": "wrong", "ch2-01": "correct" },
      attempts: {
        "ch1-01": { count: 1, correct: 1, lastCorrect: true, lastAt: "2026-10-25" },
        "ch1-02": { count: 1, correct: 0, lastCorrect: false, lastAt: "2026-10-25" },
        "ch2-01": { count: 2, correct: 1, lastCorrect: true, lastAt: "2026-10-26" },
      },
      history: [
        { date: "2026-10-25", correct: true },
        { date: "2026-10-25", correct: false },
        { date: "2026-10-26", correct: true },
      ],
      lastStudyDate: "2026-10-26",
      saved: ["ch1-01"],
      srs: {
        "ch1-01": { easeFactor: 2.5, interval: 3, repetitions: 2, dueDate: "2026-10-29" },
      },
      srsStats: { again: 0, hard: 0, good: 2, easy: 0, reviews: 2 },
      examHistory: [
        { date: "2026-10-26", total: 40, correct: 32, pct: 80, passed: true, wrongIds: ["ch1-02"] },
      ],
    };

    localStorage.setItem("synapse.progress.v1.ctfl", JSON.stringify(fake318Progress));
    localStorage.setItem("synapse.goal", "20");
    localStorage.setItem("synapse.lang", "pt");
    localStorage.setItem("synapse.theme", "dark");
    localStorage.setItem(
      "synapse.examDraft.v1.ctfl",
      JSON.stringify({
        questionIds: ["ch1-01", "ch1-02"],
        optOrder: [
          [0, 1, 2, 3],
          [3, 2, 1, 0],
        ],
        answers: [1, null],
        idx: 1,
        timeLeft: 3200,
        savedAt: Date.now(),
      })
    );
  });

  await page.goto("/ctfl/hoje");

  // Verifica que os capítulos foram mapeados corretamente no storage
  const seenData = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}").ctfl
  );
  expect(seenData["ch1-01"]).toBe(1);
  expect(seenData["ch2-01"]).toBe(2);

  // Verifica meta diária na interface
  await expect(page.locator(".task-meta span").first()).toContainText("20");

  // Rascunho preservado e acessível na tela de simulado; permite retomar
  await page.locator('button[data-nav="simulado"]').click();
  await expect(page.locator(".sim-draft")).toBeVisible();
  await page.getByRole("button", { name: /Retomar/i }).click();
  await expect(page.locator(".opt").first()).toBeVisible();

  // Chaves antigas preservadas
  const oldKey = await page.evaluate(() => localStorage.getItem("synapse.progress.v1.ctfl"));
  expect(oldKey).not.toBeNull();
});

test("restauração de backup antigo (app: 'synapse-backup') e validação de arquivo inválido", async ({
  page,
}) => {
  await page.goto("/ctfl/stats");

  // 1. Tenta restaurar arquivo corrompido / não reconhecido
  const badBackup = JSON.stringify({ notAValidApp: true });
  await page.locator('input[type="file"]').setInputFiles({
    name: "corrupted.json",
    mimeType: "application/json",
    buffer: Buffer.from(badBackup),
  });

  // Não deve anunciar sucesso
  await expect(page.locator("#live")).not.toContainText(/sucesso|restaurado/i);

  // 2. Restaura backup completo antigo da 3.18
  const validOldBackup = JSON.stringify({
    app: "synapse-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      "synapse.lastCert": "ctfl",
      "synapse.goal": "30",
      "synapse.progress.v1.ctfl": {
        schemaVersion: 2,
        total: 5,
        correct: 4,
        seen: { "ch1-01": "correct", "ch1-02": "correct" },
        attempts: {
          "ch1-01": { count: 1, correct: 1, lastCorrect: true, lastAt: "2026-10-28" },
          "ch1-02": { count: 1, correct: 1, lastCorrect: true, lastAt: "2026-10-28" },
        },
        history: [{ date: "2026-10-28", correct: true }],
        examHistory: [{ date: "2026-10-28", total: 40, correct: 35, pct: 87, passed: true }],
      },
    },
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: "synapse-backup-old.json",
    mimeType: "application/json",
    buffer: Buffer.from(validOldBackup),
  });

  // Os dados devem aparecer imediatamente: simulado recente e botão de CSV ficam visíveis
  await expect(page.getByText(/Simulados recentes/i)).toBeVisible();
  await expect(page.getByText("87%")).toBeVisible();
  await expect(page.getByRole("button", { name: /CSV/i }).first()).toBeVisible();

  // Meta diária restaurada imediatamente
  await page.locator('button[data-nav="hoje"]').click();
  await expect(page.locator(".task-meta span").first()).toContainText("30");
});

test("atalhos PWA (/go/quiz, /go/flash, /go/stats) e alteração da meta diária", async ({
  page,
}) => {
  // Atalho do Simulado
  await page.goto("/go/quiz");
  await expect(page.locator(".hero h1, #simTitle, #simResultTitle").first()).toBeVisible();

  // Atalho do Flashcards
  await page.goto("/go/flash");
  await expect(page.locator(".fc-card, .fc-empty").first()).toBeVisible();

  // Atalho do Progresso
  await page.goto("/go/stats");
  await expect(page.locator(".pr-row, .pr-head, .hero").first()).toBeVisible();

  // Alteração da meta diária na tela Hoje
  await page.locator('button[data-nav="hoje"]').click();
  const chip30 = page.locator(".goal-chips .chip").filter({ hasText: "30" });
  await chip30.click();

  await expect(chip30).toHaveAttribute("aria-pressed", "true");
  const savedGoal = await page.evaluate(() => localStorage.getItem("synapse.goal"));
  expect(savedGoal).toBe("30");
  await expect(page.locator(".task-meta span").first()).toContainText("30");
});

test("interações no navegador: avaliar e desfazer flashcard, retomar simulado, e baixar CSV", async ({
  page,
}) => {
  // 1. Flashcard: virar, avaliar e desfazer
  await page.goto("/ctfl/flashcards");
  await expect(page.locator(".fc-card")).toBeVisible();
  // Vira o cartão
  await page.locator("#fcFlip, button:has-text('Ver resposta')").first().click();
  await expect(page.locator(".fc-face.fc-back")).toBeVisible();
  // Avalia como 'good' / 'lembrei'
  await page.locator('button[data-rating="good"]').click();
  // Botão de desfazer aparece
  const undoBtn = page.locator(".fc-undo");
  await expect(undoBtn).toBeVisible();
  await undoBtn.click();
  // Desfez a avaliação
  await expect(page.locator(".fc-undo")).toHaveCount(0);

  // 2. Simulado: iniciar, responder questão, finalizar e baixar CSV
  await page.goto("/ctfl/quiz");
  await page.locator('button[data-nav="simulado"]').click();
  await page
    .getByRole("button", { name: /Começar simulado/i })
    .first()
    .click();
  // Responde a primeira questão
  await page.locator(".opt").first().click();
  // Abre a grade, pula para a última e finaliza
  await page.getByRole("button", { name: /Ver grade/i }).click();
  await page.locator(".sim-grid button").last().click();
  await page.getByRole("button", { name: /Finalizar simulado/i }).click();
  await expect(page.locator(".sim-score")).toBeVisible();

  // 3. Progresso: baixar CSV de simulados
  await page.locator('button[data-nav="progresso"]').click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: /CSV|Baixar histórico/i })
    .first()
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(".csv");
});

test("questões salvas: fluxo completo de marcar, encontrar, estudar e limpar com progresso", async ({
  page,
}) => {
  await page.goto("/ctfl/estudar");

  // Inicia o capítulo 1
  const startBtn = page
    .getByRole("button", { name: /Estudar capítulo|Estudar este capítulo|Começar estudo/i })
    .first();
  await startBtn.click();
  await expect(page.locator(".session")).toBeVisible();

  // Marca a questão como salva usando a estrela
  const saveBtn = page.locator(".session-save-btn");
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();
  await expect(saveBtn).toHaveClass(/is-saved/);
  await expect(saveBtn).toHaveAttribute("aria-pressed", "true");

  // Sai da sessão e volta ao plano
  await page.locator(".session-exit").click();

  // Banner de questões salvas agora aparece no plano de estudo
  const savedBanner = page.locator(".saved-banner");
  await expect(savedBanner).toBeVisible();
  await expect(savedBanner).toContainText("1 questão(ões) marcada(s)");

  // Clica em 'Estudar salvas'
  const studySavedBtn = page.getByRole("button", { name: /Estudar salvas/i });
  await expect(studySavedBtn).toBeVisible();
  await studySavedBtn.click();

  // Confere que abriu a sessão com a questão salva
  await expect(page.locator(".session")).toBeVisible();
  await expect(page.locator(".session-save-btn")).toHaveClass(/is-saved/);
  await page.locator(".session-exit").click();

  // Vai em Progresso e limpa o progresso da certificação
  await page.locator('button[data-nav="progresso"]').click();
  // Aceita o dialog nativo de confirm
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: /Zerar progresso desta prova|Limpar progresso/i })
    .first()
    .click();

  // Confere que no storage as questões salvas da CTFL foram limpas
  const savedData = await page.evaluate(() => {
    const raw = localStorage.getItem("synapse.saved.v1");
    return raw ? JSON.parse(raw) : {};
  });
  expect(savedData.ctfl).toBeUndefined();

  // Volta para Estudar e confere que o banner sumiu
  await page.locator('button[data-nav="estudar"]').click();
  await expect(page.locator(".saved-banner")).toHaveCount(0);
});

test("backup antigo sobre dados existentes: substitui dados conflitantes e reflete imediatamente", async ({
  page,
}) => {
  // Prepara progresso existente prévio com questão 'ch1-old'
  await page.addInitScript(() => {
    localStorage.setItem("synapse.seen.v1", JSON.stringify({ ctfl: { "ch1-old": 1 } }));
    localStorage.setItem(
      "synapse.attempts.v1",
      JSON.stringify({
        ctfl: { "ch1-old": { ok: 1, tries: 1, at: Date.now(), ch: 1, last: true } },
      })
    );
  });

  await page.goto("/ctfl/stats");

  // Prepara backup 3.18 conflitante contendo outra questão ('ch1-01') e simulado de 90%
  const conflictingOldBackup = JSON.stringify({
    app: "synapse-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      "synapse.lastCert": "ctfl",
      "synapse.goal": "15",
      "synapse.progress.v1.ctfl": {
        schemaVersion: 2,
        total: 10,
        correct: 9,
        seen: { "ch1-01": "correct" },
        attempts: {
          "ch1-01": { count: 1, correct: 1, lastCorrect: true, lastAt: "2026-10-29" },
        },
        history: [{ date: "2026-10-29", correct: true }],
        examHistory: [{ date: "2026-10-29", total: 40, correct: 36, pct: 90, passed: true }],
      },
    },
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: "conflicting-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(conflictingOldBackup),
  });

  // Os novos dados substituem os dados antigos e aparecem na hora
  await expect(page.locator(".sim-pct, b.ok").filter({ hasText: "90%" })).toBeVisible();
  const seenStorage = await page.evaluate(
    () => JSON.parse(localStorage.getItem("synapse.seen.v1") || "{}").ctfl
  );
  expect(seenStorage["ch1-01"]).toBe(1);
  expect(seenStorage["ch1-old"]).toBeUndefined();
});

test("validação de backup: rejeita {'data':{'chaveDesconhecida':123}} sem escrever no storage nem anunciar sucesso", async ({
  page,
}) => {
  await page.goto("/ctfl/stats");

  const invalidPayload = JSON.stringify({
    data: {
      chaveDesconhecida: 123,
    },
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: "unknown-keys.json",
    mimeType: "application/json",
    buffer: Buffer.from(invalidPayload),
  });

  // Não deve anunciar sucesso
  await expect(page.locator("#live")).not.toContainText(/sucesso|restaurado/i);

  // Não deve ter escrito a chave desconhecida no localStorage
  const written = await page.evaluate(() => localStorage.getItem("chaveDesconhecida"));
  expect(written).toBeNull();
});

test("offline real em build de produção: visita online uma vez, desliga rede, recarrega e estuda", async ({
  page,
  context,
}) => {
  // 1. Visita online inicial em rota de estudo para carregar shell e banco da CTFL
  await page.goto("/ctfl/estudar");
  await expect(page.locator("#planTitle")).toBeVisible();

  // Aguarda registro e ativação completa do Service Worker
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(true), {
            once: true,
          });
          setTimeout(resolve, 800);
        });
      }
    }
  });

  // Aguarda precache completar
  await page.waitForTimeout(600);

  // 2. Simula desligamento total da rede
  await context.setOffline(true);

  // 3. Recarrega a página totalmente offline
  await page.reload();

  // Verifica que o shell, CSS e conteúdo continuam funcionando offline
  await expect(page.locator("#planTitle")).toBeVisible();
  await expect(page.locator(".plan-main")).toBeVisible();

  // 4. Inicia uma sessão de estudo com o banco em cache
  const startBtn = page
    .getByRole("button", { name: /Estudar capítulo|Estudar este capítulo|Começar estudo/i })
    .first();
  await startBtn.click();
  await expect(page.locator(".session")).toBeVisible();

  // Alternativas carregam normalmente
  await expect(page.locator(".opt").first()).toBeVisible();
  await page.locator(".opt").first().click();

  const checkBtn = page.getByRole("button", { name: /Conferir resposta/i });
  if (await checkBtn.isVisible()) {
    await checkBtn.click();
    await expect(page.locator(".feedback").first()).toBeVisible();
  }

  // Restaura a rede para testes subsequentes
  await context.setOffline(false);
});
