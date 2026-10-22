// r6 — features do Stats: meta diária (anel + chips persistentes), CTA
// "Treinar {chapter}" (weak-chapter) e export CSV do histórico de simulados.
// Renderiza o Stats REAL (bank ctfl pré-carregado pelo test-setup.js) com
// um progresso fixture controlado.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Stats from "./Stats.jsx";
import { todayLocal } from "../lib/storage.js";
import { getBank } from "../lib/bank.js";

beforeEach(() => {
  localStorage.clear();
});
afterEach(cleanup);

function renderStats(progress, props = {}) {
  const onGoToQuiz = vi.fn();
  const utils = render(
    <MemoryRouter initialEntries={["/ctfl/stats"]}>
      <Routes>
        <Route
          path="/:cert/stats"
          element={
            <Stats
              progress={progress}
              setProgress={vi.fn()}
              lang="pt"
              onGoToQuiz={onGoToQuiz}
              onReopenOnboarding={() => {}}
              {...props}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
  return { ...utils, onGoToQuiz };
}

const PROGRESS = (over = {}) => ({
  total: 30,
  correct: 12,
  byDomain: { 1: { t: 10, c: 8 }, 4: { t: 10, c: 1 }, 2: { t: 10, c: 5 } },
  seen: {},
  attempts: {},
  flashcards: {},
  saved: [],
  history: [],
  srs: {},
  lastStudyDate: null,
  achievements: [],
  examHistory: [],
  ...over,
});

describe("r6: Stats — meta diária", () => {
  it("renderiza o card com anel, contagem de hoje e chips (default 10)", () => {
    const today = todayLocal();
    renderStats(
      PROGRESS({
        total: 12,
        history: Array.from({ length: 7 }, (_, i) => ({
          date: today,
          correct: i % 2 === 0,
        })),
      })
    );
    expect(screen.getByText("Meta diária")).toBeInTheDocument();
    // 7 de 10 respondidas hoje (formato "n de goal")
    expect(screen.getByText("7 de 10 respondidas hoje")).toBeInTheDocument();
    // chip 10 marcado por padrão
    expect(screen.getByRole("button", { name: "10" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "20" })).toHaveAttribute("aria-pressed", "false");
  });

  it("trocar a meta via chip persiste em synapse.goal e move o aria-pressed", () => {
    renderStats(PROGRESS({ history: [{ date: todayLocal(), correct: true }] }));
    fireEvent.click(screen.getByRole("button", { name: "20" }));
    expect(localStorage.getItem("synapse.goal")).toBe("20");
    expect(screen.getByRole("button", { name: "20" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "10" })).toHaveAttribute("aria-pressed", "false");
    // recarrega o estado visível: 1 de 20 agora
    expect(screen.getByText("1 de 20 respondidas hoje")).toBeInTheDocument();
  });

  it("meta atingida mostra mensagem de sucesso (7 >= 5)", () => {
    const today = todayLocal();
    renderStats(
      PROGRESS({
        total: 7,
        history: Array.from({ length: 7 }, () => ({
          date: today,
          correct: true,
        })),
      })
    );
    // default 10; muda pra 5 pra atingir
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(screen.getByText("🎉 Meta de hoje atingida!")).toBeInTheDocument();
  });
});

describe("r6: Stats — CTA Treinar {chapter}", () => {
  it("mostra o botão do capítulo mais fraco e chama onGoToQuiz com o capítulo", () => {
    const { onGoToQuiz } = renderStats(PROGRESS());
    // byDomain: ch4 = 1/10 (10%) é o mais fraco
    const btn = screen.getByRole("button", { name: /Treinar/ });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onGoToQuiz).toHaveBeenCalledWith("4");
  });

  it("sem capítulo com >=3 respostas, não mostra o CTA", () => {
    renderStats(PROGRESS({ byDomain: { 1: { t: 2, c: 0 } } }));
    expect(screen.queryByRole("button", { name: /Treinar/ })).not.toBeInTheDocument();
  });
});

describe("r6: Stats — export CSV do histórico", () => {
  it("botão CSV existe quando há histórico e o click baixa um blob", async () => {
    // jsdom não implementa createObjectURL — stub manual
    const createObjectURL = vi.fn(() => "blob:mock-url");
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    try {
      renderStats(
        PROGRESS({
          examHistory: [
            { date: "2026-10-13", pct: 45, n: 40, passed: false },
            { date: "2026-10-14", pct: 80, n: 10, custom: true, passed: true },
          ],
        })
      );
      fireEvent.click(screen.getByRole("button", { name: /CSV/ }));
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      // o blob carrega o CSV com BOM
      const blob = createObjectURL.mock.calls[0][0];
      const txt = await blob.text();
      expect(txt).toContain("2026-10-13;45;40;0;0");
      expect(txt).toContain("2026-10-14;80;10;1;1");
      // o BOM \uFEFF some no text() (UTF-8 decode remove BOM leading por
      // spec) mas PRECISA estar nos bytes do arquivo — é ele que faz o
      // Excel PT-BR abrir os acentos certinho.
      const bytes = new Uint8Array(await blob.arrayBuffer());
      expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    } finally {
      delete URL.createObjectURL;
      delete URL.revokeObjectURL;
    }
  });
});

describe("r6: Stats — aria do heatmap com plural correto", () => {
  it("1 dia e 1 resposta ficam no singular no aria-label", () => {
    renderStats(PROGRESS({ total: 1, history: [{ date: todayLocal(), correct: true }] }));
    const heat = screen.getByRole("group", { name: /Mapa de atividade/ });
    expect(heat.getAttribute("aria-label")).toContain("1 dia com estudo");
    expect(heat.getAttribute("aria-label")).toContain("1 resposta");
  });
});

describe("r14: Stats — heatmap redesenhado (semanas alinhadas + inspeção por toque)", () => {
  it("renderiza 12 colunas × 7 linhas com rótulos de mês e dia", () => {
    renderStats(
      PROGRESS({
        total: 3,
        history: [
          { date: todayLocal(), correct: true },
          { date: todayLocal(), correct: false },
          { date: todayLocal(), correct: true },
        ],
      })
    );
    const heat = screen.getByRole("group", { name: /Mapa de atividade/ });
    const cells = heat.querySelectorAll(".hm-cell:not(.future)");
    const futures = heat.querySelectorAll(".hm-cell.future");
    // 12 semanas × 7 dias = 84 células (contando futuros) + 5 da legenda
    expect(cells.length + futures.length).toBe(84);
    // rótulo do mês presente (âncora da 1ª semana)
    expect(heat.querySelectorAll(".hm-month").length).toBe(12);
    expect(heat.querySelector(".hm-month").textContent).toBeTruthy();
    // rótulos de dia: segunda/quarta/sexta visíveis
    const days = [...heat.querySelectorAll(".hm-day")].map((d) => d.textContent).join("");
    ["S", "Q"].forEach((d) => expect(days).toContain(d));
  });

  it("células são botões (toque/clique seleciona o dia no detalhe)", async () => {
    const user = userEvent.setup();
    renderStats(
      PROGRESS({
        total: 3,
        history: [
          { date: todayLocal(), correct: true },
          { date: todayLocal(), correct: false },
          { date: todayLocal(), correct: true },
        ],
      })
    );
    const todayBtn = screen.getByTitle(new RegExp(todayLocal()));
    await user.click(todayBtn);
    const detail = document.querySelector(".hm-detail");
    expect(detail.textContent).toContain(todayLocal());
    expect(detail.textContent).toContain("3 resposta");
  });

  it("hoje aparece no detalhe por default (sem seleção prévia)", () => {
    renderStats(
      PROGRESS({
        total: 2,
        history: [
          { date: todayLocal(), correct: true },
          { date: todayLocal(), correct: false },
        ],
      })
    );
    const detail = document.querySelector(".hm-detail");
    expect(detail.textContent).toContain(todayLocal());
    expect(detail.textContent).toContain("50%"); // 1 de 2
  });
});

describe("r8: Stats — sparkline de tendência dos simulados", () => {
  it("não desenha com menos de 2 simulados (uma nota não é tendência)", () => {
    renderStats(
      PROGRESS({
        examHistory: [{ date: "2024-01-01", pct: 70, passed: true }],
      })
    );
    expect(screen.queryByRole("img", { name: /^Tendência das notas/ })).not.toBeInTheDocument();
  });

  it("desenha polyline com resumo mín/média/máx no aria-label", () => {
    renderStats(
      PROGRESS({
        examHistory: [
          { date: "2024-01-01", pct: 40, passed: false },
          { date: "2024-01-05", pct: 60, passed: false },
          { date: "2024-01-10", pct: 80, passed: true },
        ],
      })
    );
    const spark = screen.getByRole("img", { name: /^Tendência das notas/ });
    expect(spark).toBeInTheDocument();
    expect(spark.getAttribute("aria-label")).toContain("3 simulados");
    expect(spark.getAttribute("aria-label")).toContain("mínima 40%");
    expect(spark.getAttribute("aria-label")).toContain("média 60%");
    expect(spark.getAttribute("aria-label")).toContain("máxima 80%");
    // 3 provas = 3 pontos na polyline
    const poly = spark.querySelector("polyline.spark-line");
    expect(poly.getAttribute("points").split(" ")).toHaveLength(3);
    // linha de corte tracejada de referência presente
    expect(spark.querySelector("line.spark-pass")).toBeInTheDocument();
  });

  it("última nota acima do corte marca o spark como pass (classe verde)", () => {
    renderStats(
      PROGRESS({
        examHistory: [
          { date: "2024-01-01", pct: 40, passed: false },
          { date: "2024-01-10", pct: 90, passed: true },
        ],
      })
    );
    const spark = screen.getByRole("img", { name: /^Tendência das notas/ });
    expect(spark.className).toContain("pass");
  });
});

// ─── r15 (R18): painel Flashcards/Revisão espaçada no Progresso ───
describe("r15: Stats — painel de revisão espaçada", () => {
  const SRS_STATS = (over = {}) => ({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    reviews: 0,
    lastReview: null,
    todayDate: null,
    todayCount: 0,
    ...over,
  });

  it("estado virgem (com respostas): convite com CTA de N cartões", () => {
    renderStats(PROGRESS());
    expect(screen.getByText(/Flashcards · Revisão espaçada/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Começar com \d+ cartões/i })).toHaveAttribute(
      "href",
      "/ctfl/flash"
    );
  });

  it("com revisões: métricas de cartões/fila/maduros + retenção", () => {
    const today = todayLocal();
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 30,
        repetitions: 4,
        dueDate: "2030-01-01",
      }, // maduro
      "fc-fund-02": {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        dueDate: today,
      }, // due hoje
    };
    renderStats(
      PROGRESS({
        srs,
        srsStats: SRS_STATS({ reviews: 10, good: 6, easy: 2, again: 2 }),
      })
    );
    expect(screen.getByText("2/15")).toBeInTheDocument(); // iniciados/total (CTFL: 15 cartões)
    expect(screen.getByText("80%")).toBeInTheDocument(); // retenção 8/10
    expect(screen.getByRole("link", { name: /Revisar 1 agora/i })).toHaveAttribute(
      "href",
      "/ctfl/flash"
    );
    expect(screen.getByText(/10 revisões espaçadas/)).toBeInTheDocument();
    expect(screen.getByText(/80% de acerto nas revisões/)).toBeInTheDocument();
  });

  it("fila zerada com agenda futura mostra a próxima revisão (sem CTA)", () => {
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 3,
        repetitions: 1,
        dueDate: "2030-01-01",
      },
    };
    renderStats(PROGRESS({ srs, srsStats: SRS_STATS({ reviews: 1, good: 1 }) }));
    expect(screen.queryByRole("link", { name: /Revisar \d+ agora/i })).toBeNull();
    expect(screen.getByText(/Próxima revisão: 2030-01-01/)).toBeInTheDocument();
  });

  it("sem revisões e sem respostas: painel não renderiza (não é o momento)", () => {
    renderStats(PROGRESS({ total: 0 }));
    expect(screen.queryByText(/Flashcards · Revisão espaçada/)).toBeNull();
  });

  it("conquistas novas aparecem no roadmap (srs-100/srs-master)", () => {
    renderStats(PROGRESS({ achievements: ["first-step"] }));
    const names = [...document.querySelectorAll(".ach-name")].map((n) => n.textContent);
    expect(names).toContain("100 revisões");
    expect(names).toContain("Memória de longo prazo");
  });

  it("perfil só-flashcards (zero questões) também vê gamificação e roadmap", () => {
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
        dueDate: todayLocal(),
      },
    };
    renderStats(
      PROGRESS({
        total: 0,
        correct: 0,
        srs,
        srsStats: SRS_STATS({ reviews: 5, good: 4, again: 1, todayCount: 5 }),
      })
    );
    // sem emptyWelcome: há atividade (de revisão)
    expect(screen.queryByText(/Você ainda não respondeu nenhuma questão/i)).toBeNull();
    // roadmap visível com as conquistas de SRS
    const names = [...document.querySelectorAll(".ach-name")].map((n) => n.textContent);
    expect(names).toContain("100 revisões");
    expect(names).toContain("Memória de longo prazo");
    // painel SRS no lugar do emptyWelcome
    expect(screen.getByRole("link", { name: /Revisar 1 agora/i })).toBeTruthy();
  });
});

// ─── r9: roadmap de conquistas (travadas visíveis com progresso) ───
describe("r9: Stats — roadmap de conquistas", () => {
  it("mostra as travadas ordenadas; a mais próxima ganha .closest + badge 'quase!'", () => {
    const today = todayLocal();
    // streak 1 (5 respostas hoje) → streak-7 em 1/7 = 14%, o maior percentual
    renderStats(
      PROGRESS({
        achievements: ["first-step"],
        history: Array(5)
          .fill(null)
          .map(() => ({ date: today, correct: true })),
      })
    );
    expect(screen.getByText("Próximas conquistas")).toBeInTheDocument();
    const rows = document.querySelectorAll(".ach-row");
    expect(rows.length).toBe(8); // 9 conquistas - 1 obtida (first-step) — r15: +srs-100/srs-master
    expect(rows[0]).toHaveClass("closest");
    expect(rows[0].textContent).toContain("quase!");
    expect(rows[0].textContent).toContain("7 dias"); // streak-7 primeiro (14%)
    expect(rows[0].textContent).toContain("1/7");
  });

  it("obtidas não aparecem no roadmap (só as travadas)", () => {
    const today = todayLocal();
    renderStats(
      PROGRESS({
        achievements: ["first-step", "streak-7"],
        history: Array(5)
          .fill(null)
          .map(() => ({ date: today, correct: true })),
      })
    );
    const rows = document.querySelectorAll(".ach-row");
    expect(rows.length).toBe(7); // 9 - 2 obtidas (r15: catálogo cresceu p/ 9)
    expect([...rows].some((r) => r.textContent.includes("7 dias"))).toBe(false);
  });

  it("passed-exam usa alvo percentual do cert (CTFL 26/40 = 65%) com formato próprio", () => {
    renderStats(
      PROGRESS({
        achievements: ["first-step"],
        examHistory: [{ date: todayLocal(), pct: 40, passed: false, n: 40 }],
      })
    );
    const row = [...document.querySelectorAll(".ach-row")].find((r) =>
      r.textContent.includes("Aprovado")
    );
    expect(row).toBeTruthy();
    expect(row.textContent).toContain("40% de 65%");
  });

  it("barra tem semântica de progressbar (aria-valuenow/max/min)", () => {
    const today = todayLocal();
    renderStats(
      PROGRESS({
        achievements: ["first-step"],
        history: Array(5)
          .fill(null)
          .map(() => ({ date: today, correct: true })),
      })
    );
    const bar = document.querySelector('.ach-bar[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("7");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-label")).toContain("7 dias");
  });
});

// ─── r10: lembrete diário (card de notificações do Stats) ───
describe("r10: Stats — lembrete diário", () => {
  const RealNotification = global.Notification;
  let listenerCalls = 0;
  let handler = null;

  function installNotification(permission) {
    global.Notification = Object.assign(function Notification() {}, {
      permission,
      requestPermission: vi.fn().mockResolvedValue(permission),
    });
    Object.defineProperty(window.navigator, "serviceWorker", {
      value: {},
      configurable: true,
    });
  }
  function uninstallNotification() {
    global.Notification = RealNotification;
    delete window.navigator.serviceWorker;
  }

  beforeEach(() => {
    localStorage.clear();
    listenerCalls = 0;
    handler = () => {
      listenerCalls++;
    };
    window.addEventListener("synapse:reminder-changed", handler);
  });
  afterEach(() => {
    if (handler) window.removeEventListener("synapse:reminder-changed", handler);
    uninstallNotification();
  });

  it("permissão concedida: toggle desligado por padrão, input desabilitado", () => {
    installNotification("granted");
    renderStats(PROGRESS());
    const toggle = screen.getByRole("checkbox");
    expect(toggle).not.toBeChecked();
    const time = screen.getByLabelText(/horário do lembrete/i);
    expect(time).toBeDisabled();
    expect(time.value).toBe("19:00");
    expect(screen.queryByText(/lembrete ativo/i)).toBeNull();
  });

  it("ligar o lembrete persiste, habilita o horário, emite o evento pro App e mostra o status", () => {
    installNotification("granted");
    renderStats(PROGRESS());
    fireEvent.click(screen.getByRole("checkbox"));
    expect(localStorage.getItem("synapse.reminderEnabled")).toBe("1");
    expect(screen.getByLabelText(/horário do lembrete/i)).toBeEnabled();
    expect(screen.getByText(/lembrete ativo todos os dias às 19:00/i)).toBeInTheDocument();
    expect(listenerCalls).toBe(1);
  });

  it("mudar o horário persiste e re-emite o evento", () => {
    installNotification("granted");
    renderStats(PROGRESS());
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText(/horário do lembrete/i), {
      target: { value: "07:30" },
    });
    expect(localStorage.getItem("synapse.reminderTime")).toBe("07:30");
    expect(listenerCalls).toBe(2);
  });

  it("horário vazio/inválido não grava (input em branco durante a digitação)", () => {
    installNotification("granted");
    renderStats(PROGRESS());
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText(/horário do lembrete/i), {
      target: { value: "" },
    });
    expect(localStorage.getItem("synapse.reminderTime")).toBe(null); // default não polui
  });

  it("permissão pendente: mostra o botão de ativar, sem o toggle", () => {
    installNotification("default");
    renderStats(PROGRESS());
    expect(screen.getByRole("button", { name: /ativar notificações/i })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("estado ligado é reidratado do storage (render já vem checked)", () => {
    installNotification("granted");
    localStorage.setItem("synapse.reminderEnabled", "1");
    localStorage.setItem("synapse.reminderTime", "06:45");
    renderStats(PROGRESS());
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText(/horário do lembrete/i)).toBeEnabled();
    expect(screen.getByLabelText(/horário do lembrete/i).value).toBe("06:45");
    expect(screen.getByText(/lembrete ativo todos os dias às 06:45/i)).toBeInTheDocument();
  });
});

// r11 — Data da prova (contagem regressiva + ritmo) e desempenho por K-level.
// O card de data renderiza SEMPRE (estado vazio = convite); o de K-level
// só com progresso. Ambos conversam com o banco REAL do ctfl (test-setup).
const isoOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

describe("r11: Stats — card Data da prova", () => {
  it("estado convite sem data: hint + input, sem contagem", () => {
    renderStats(PROGRESS());
    expect(screen.getByText(/Planeje a reta final/i)).toBeInTheDocument();
    expect(document.getElementById("exam-date-input")).toBeTruthy();
    expect(screen.queryByText(/faltam \d+ dias/i)).toBeNull();
  });

  it("definir data persiste em synapse.examDate e mostra contagem + ritmo", () => {
    renderStats(PROGRESS());
    // PROGRESS fixture: attempts={} → seenCount 0 → left = 220 (pool de
    // estudo r13), pace = 220/10 = 22/dia — o ritmo planeja cobrir o MATERIAL
    // DE ESTUDO; as 80 exclusivas de simulado não são treináveis
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(10) },
    });
    expect(localStorage.getItem("synapse.examDate")).toBe(isoOffset(10));
    expect(screen.getByText(/faltam 10 dias/i)).toBeInTheDocument();
    expect(screen.getByText(/~22 questões\/dia/i)).toBeInTheDocument();
    expect(screen.getByText(/220 restantes/i)).toBeInTheDocument();
  });

  it("1 dia → singular “falta 1 dia” + tom de urgência (warn)", () => {
    renderStats(PROGRESS());
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(1) },
    });
    expect(screen.getByText(/falta 1 dia/i)).toBeInTheDocument();
    const days = document.querySelector(".exam-days");
    expect(days.className).toMatch(/warn/); // ≤7 dias = reta final âmbar
  });

  it("no dia: “É hoje!” e sem linha de ritmo", () => {
    const { container } = renderStats(PROGRESS());
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(0) },
    });
    expect(screen.getByText(/É hoje!/i)).toBeInTheDocument();
    // sem linha de ritmo (o card inteiro não tem .exam-pace hoje)
    expect(container.querySelector(".exam-pace")).toBeNull();
  });

  it("data passada: mensagem neutra + input para a próxima", () => {
    renderStats(PROGRESS());
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(-2) },
    });
    expect(screen.getByText(/A data passou/i)).toBeInTheDocument();
    expect(document.getElementById("exam-date-input")).toBeTruthy();
  });

  it("banco coberto: recomenda revisão em vez de volume", () => {
    // seenCount ≥ totalBank: usa o banco REAL (300 questões do ctfl) — todas
    // com attempts dá covered 300 → coverPace null → examPaceCovered
    const bank = getBank("ctfl");
    const attempts = {};
    bank.ALL.forEach((q) => {
      attempts[q.id] = { count: 1, correct: 1 };
    });
    renderStats(PROGRESS({ attempts }));
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(10) },
    });
    expect(screen.getByText(/faltam 10 dias/i)).toBeInTheDocument();
    expect(screen.getByText(/foque em revisão, não em volume/i)).toBeInTheDocument();
  });

  it("Limpar (confirm ok) volta ao estado convite e apaga o setting", () => {
    renderStats(PROGRESS());
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(10) },
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: /limpar/i }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(localStorage.getItem("synapse.examDate")).toBe("");
    expect(screen.getByText(/Planeje a reta final/i)).toBeInTheDocument();
    expect(screen.getByText(/Data da prova removida/i)).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("confirm negado NÃO limpa", () => {
    renderStats(PROGRESS());
    fireEvent.change(document.getElementById("exam-date-input"), {
      target: { value: isoOffset(10) },
    });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: /limpar/i }));
    expect(localStorage.getItem("synapse.examDate")).toBe(isoOffset(10));
    expect(screen.getByText(/faltam 10 dias/i)).toBeInTheDocument();
    confirmSpy.mockRestore();
  });
});

describe("r11: Stats — card Desempenho por K-level", () => {
  it("esconde o card sem progresso (total 0)", () => {
    renderStats(PROGRESS({ total: 0, correct: 0 }));
    expect(screen.queryByText(/Desempenho por K-level/i)).toBeNull();
  });

  it("join attempts × banco REAL: linhas por K com acerto e cobertura", () => {
    const bank = getBank("ctfl");
    // r13: kLevelBreakdown roda sobre o POOL DE ESTUDO — attempts em ids do
    // pool exclusivo não entram na junção (e o denominador é o study por K)
    const k1 = bank.STUDY.filter((q) => q.kLevel === 1)
      .slice(0, 5)
      .map((q) => q.id);
    const k1Total = bank.STUDY.filter((q) => q.kLevel === 1).length;
    const attempts = {};
    // 4 questões 2/2 (8 acertos) + 1 questão 0/2 → 10 answers, 8 correct = 80%
    k1.forEach((id, i) => {
      attempts[id] = { count: 2, correct: i < 4 ? 2 : 0 };
    });
    const { container } = renderStats(PROGRESS({ attempts }));
    // chip + % com tom ok (80% ≥ corte 65 do ctfl)
    expect(container.querySelector(".klevel-chip").textContent).toBe("K1");
    expect(container.querySelector(".klevel-pct.ok")).toBeTruthy();
    // sr-only com o resumo completo por K
    expect(screen.getByText(/K1: 80% de acerto em 10 respostas/i)).toBeInTheDocument();
    // barra de cobertura: 5 distintas do pool de estudo no K1 (62 de estudo
    // — as 16 K1 exclusivas de simulado ficam de fora) → 5/62 ≈ 8%
    const fill = container.querySelector(".klevel-fill");
    expect(fill.style.width).toBe(`${Math.min(100, Math.round((5 / k1Total) * 100))}%`);
  });

  it("K sem tentativas mostra “—” (pct null) e sem tom", () => {
    const { container } = renderStats(PROGRESS({ attempts: {} }));
    // PROGRESS tem total 30 mas attempts vazio → todos os K com pct null
    const pcts = container.querySelectorAll(".klevel-pct");
    expect(pcts.length).toBeGreaterThan(0);
    pcts.forEach((p) => {
      expect(p.textContent).toBe("—");
      expect(p.className).not.toMatch(/ ok| no/);
    });
    expect(container.querySelector(".klevel-pct.ok")).toBeNull();
  });
});
