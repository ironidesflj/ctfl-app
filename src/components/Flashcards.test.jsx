// r15 (roadmap R18) — UX dos Flashcards: teclado (espaço/1-4/setas), undo de
// mis-tap, nota pós-avaliação ("volta em Nd"), fila zerada com próxima
// revisão e contadores de fila nos chips de capítulo.
// Harness STATEFUL: setProgress re-renderiza como o App faz (a fila "due"
// depende do progresso atualizado para esvaziar).
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Flashcards from "./Flashcards.jsx";
import { getSRSCard } from "../lib/storage.js";

afterEach(cleanup);

const PROGRESS = (over = {}) => ({
  total: 5,
  correct: 3,
  byDomain: {},
  seen: {},
  attempts: {},
  flashcards: {},
  saved: [],
  history: [],
  srs: {},
  srsStats: {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    reviews: 0,
    lastReview: null,
    todayDate: null,
    todayCount: 0,
  },
  lastStudyDate: null,
  achievements: [],
  examHistory: [],
  ...over,
});

// Harness com estado de verdade: setProgress aplica o updater e re-renderiza
// (o Flashcards depende do progresso fresco p/ recomputar a fila due). O
// estado corrente volta pro teste via callback em useEffect — mutar props
// ou ref durante o render é proibido (react-hooks/immutability / refs);
// escrever num closure FORA do React é o caminho legal.
function Harness({ initial, onState, route = "/ctfl/flash" }) {
  const [progress, setProgress] = useState(initial);
  useEffect(() => {
    onState(progress);
  }, [progress, onState]);
  return (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/:cert/flash"
          element={<Flashcards lang="pt" progress={progress} setProgress={setProgress} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

function renderFlash(progress, route) {
  const api = { state: progress };
  render(<Harness initial={progress} onState={(p) => (api.state = p)} route={route} />);
  return { getState: () => api.state };
}

const iso = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

describe("r15: Flashcards — teclado", () => {
  it("Espaço vira o cartão (sem depender de foco/botão)", () => {
    renderFlash(PROGRESS());
    expect(document.querySelector(".flash-card-inner.flipped")).toBeNull();
    fireEvent.keyDown(window, { key: " " });
    expect(document.querySelector(".flash-card-inner.flipped")).not.toBeNull();
  });

  it("1–4 avaliam quando virado (again/hard/good/easy) e alimentam contadores", () => {
    const r = renderFlash(PROGRESS());
    fireEvent.keyDown(window, { key: " " }); // vira
    fireEvent.keyDown(window, { key: "3" }); // good
    const st = r.getState();
    expect(st.srs["fc-fund-01"]).toBeTruthy();
    expect(st.srsStats.good).toBe(1);
    expect(st.srsStats.reviews).toBe(1);
  });

  it("1–4 não avaliam com o cartão fechado (flip é obrigatório)", () => {
    const r = renderFlash(PROGRESS());
    fireEvent.keyDown(window, { key: "4" });
    expect(r.getState().srsStats.reviews).toBe(0);
    expect(r.getState().srs["fc-fund-01"]).toBeUndefined();
  });
});

describe("r15: Flashcards — nota pós-avaliação + undo", () => {
  it("mostra o que a avaliação agendou (label + intervalo)", () => {
    renderFlash(PROGRESS());
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Bom" }));
    expect(screen.getByText(/Bom → volta em 1d/)).toBeTruthy();
  });

  it("undo restaura cartão NOVO (entrada some) e desconta o contador", () => {
    const r = renderFlash(PROGRESS());
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Fácil" }));
    let st = r.getState();
    expect(st.srsStats.easy).toBe(1);
    expect(st.srs["fc-fund-01"]).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Desfazer/i }));
    st = r.getState();
    expect(getSRSCard(st, "fc-fund-01")).toBeNull(); // era novo → volta a ser novo
    expect(st.srsStats.easy).toBe(0);
    expect(st.srsStats.reviews).toBe(0);
  });

  it("undo restaura estado pré-existente (não-novo) intacto", () => {
    const prev = {
      easeFactor: 2.2,
      interval: 6,
      repetitions: 2,
      dueDate: iso(6),
    };
    const r = renderFlash(PROGRESS({ srs: { "fc-fund-01": prev } }));
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Errei" }));
    fireEvent.click(screen.getByRole("button", { name: /Desfazer/i }));
    expect(getSRSCard(r.getState(), "fc-fund-01")).toEqual(prev);
  });

  // r16 (Red Team): trocar de filtro entre avaliar e desfazer não pode
  // descaracterizar o "volta pro cartão certo".
  it("undo após trocar de chip devolve ao FILTRO e cartão avaliados", () => {
    const r = renderFlash(PROGRESS());
    // avalia o 1º cartão no filtro "Todos"
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Bom" }));
    expect(r.getState().srsStats.reviews).toBe(1);
    // troca pro chip do capítulo 2 (lista diferente)
    fireEvent.click(screen.getByRole("button", { name: "Teste no Ciclo" }));
    expect(r.getState().srsStats.reviews).toBe(1);
    // desfaz: volta pro "Todos" e pro cartão avaliado (contador 1/15)
    fireEvent.click(screen.getByRole("button", { name: /Desfazer/i }));
    const allChip = screen.getByRole("button", { name: "Todos" });
    expect(allChip.className).toContain("on");
    expect(screen.getByText("1 / 15")).toBeTruthy();
    expect(r.getState().srsStats.reviews).toBe(0);
  });
});

describe("r15: Flashcards — fila zerada e chips", () => {
  it("avaliar a última pendência mostra celebração + próxima revisão + saída", () => {
    // único cartão due HOJE; Fácil agenda amanhã → fila esvazia na hora
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        dueDate: iso(0),
      },
    };
    renderFlash(PROGRESS({ srs }));
    fireEvent.click(screen.getByRole("button", { name: /Para revisar hoje/i }));
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Fácil" }));
    expect(screen.getByText(/Fila de revisão em dia!/)).toBeTruthy();
    // Fácil na 2ª repetição → interval 6 (SM-2) → próxima revisão daqui a 6d
    expect(screen.getByText(new RegExp(iso(6)))).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ver todos os cartões/i })).toBeTruthy();
  });

  // r16 (QA v3.14.0): avaliar a última pendência trocava a tela pela
  // celebração e ESVAZIA o undo junto — o mis-tap da última avaliação
  // ficava irreversível.
  it("undo continua disponível NA celebração e devolve o cartão à fila", () => {
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        dueDate: iso(0),
      },
    };
    const r = renderFlash(PROGRESS({ srs }));
    fireEvent.click(screen.getByRole("button", { name: /Para revisar hoje/i }));
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Fácil" }));
    // celebração no lugar, mas a nota + undo continuam vivas
    expect(screen.getByText(/Fila de revisão em dia!/)).toBeTruthy();
    const undoBtn = screen.getByRole("button", { name: /Desfazer/i });
    expect(undoBtn).toBeTruthy();
    fireEvent.click(undoBtn);
    // cartão de volta: contador coerente e entrada restaurada
    expect(screen.getByText("1 / 1")).toBeTruthy();
    expect(r.getState().srs["fc-fund-01"]).toEqual(srs["fc-fund-01"]);
    expect(r.getState().srsStats.reviews).toBe(0);
  });

  // r16: o avanço pós-avaliação usava o comprimento ANTIGO da fila — avaliar
  // o penúltimo deixava idx além do fim e o contador marcava "3 / 2".
  it("avaliar o penúltimo da fila mantém contador e cartão coerentes (sem 3/2)", () => {
    const mk = () => ({
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
      dueDate: iso(0),
    });
    const srs = {
      "fc-fund-01": mk("a"),
      "fc-fund-02": mk("b"),
      "fc-fund-03": mk("c"),
    };
    const r = renderFlash(PROGRESS({ srs }));
    fireEvent.click(screen.getByRole("button", { name: /Para revisar hoje \(3\)/i }));
    expect(screen.getByText("1 / 3")).toBeTruthy();
    // vai pro 2º cartão e avalia — a fila encolhe para 2
    fireEvent.click(screen.getByRole("button", { name: /Próximo/ }));
    fireEvent.click(screen.getByRole("button", { name: /toque para revelar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Bom" }));
    // sem "3 / 2": ou mostra o próximo válido com contagem coerente
    const counter = document.querySelector(".center-num").textContent;
    expect(counter).toMatch(/^\d+ \/ \d+$/);
    const [cur, tot] = counter.split(" / ").map(Number);
    expect(cur).toBeLessThanOrEqual(tot);
    expect(tot).toBe(2);
    expect(r.getState().srsStats.reviews).toBe(1);
  });

  // r16 (QA v3.14.0): o CTA "Revisar N agora" do Stats abre ?due=1 —
  // a promessa do botão é a FILA, não o baralho completo.
  it("?due=1 abre direto na fila pendente (chip da fila selecionado)", () => {
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        dueDate: iso(0),
      },
    };
    renderFlash(PROGRESS({ srs }), "/ctfl/flash?due=1");
    const dueChip = screen
      .getByRole("button", { name: /Para revisar hoje \(1\)/i })
      .closest("button");
    expect(dueChip.className).toContain("on");
    expect(screen.getByText("1 / 1")).toBeTruthy();
  });

  it("?due=1 com fila vazia cai no baralho completo (bookmark antigo)", () => {
    renderFlash(PROGRESS(), "/ctfl/flash?due=1");
    const allChip = screen.getByRole("button", { name: "Todos" });
    expect(allChip.className).toContain("on");
    expect(screen.queryByRole("button", { name: /Para revisar hoje/i })).toBeNull();
  });

  it("chips de capítulo mostram contador quando há fila no capítulo", () => {
    const srs = {
      "fc-fund-01": {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        dueDate: iso(0),
      },
    };
    renderFlash(PROGRESS({ srs }));
    const chip = screen.getByText("Fundamentos").closest("button");
    expect(chip.querySelector("sup.chip-due-n")).toBeTruthy();
    expect(chip.querySelector("sup.chip-due-n").textContent).toBe("1");
    // sem fila no capítulo 2 → chip limpo
    const chip2 = screen.getByText("Teste no Ciclo").closest("button");
    expect(chip2.querySelector("sup.chip-due-n")).toBeNull();
  });

  it("dica de teclado presente no DOM (CSS esconde em touch)", () => {
    renderFlash(PROGRESS());
    expect(screen.getByText(/Espaço vira/i)).toBeTruthy();
  });
});
