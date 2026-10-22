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
function Harness({ initial, onState }) {
  const [progress, setProgress] = useState(initial);
  useEffect(() => {
    onState(progress);
  }, [progress, onState]);
  return (
    <MemoryRouter initialEntries={["/ctfl/flash"]}>
      <Routes>
        <Route
          path="/:cert/flash"
          element={<Flashcards lang="pt" progress={progress} setProgress={setProgress} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

function renderFlash(progress) {
  const api = { state: progress };
  render(<Harness initial={progress} onState={(p) => (api.state = p)} />);
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
