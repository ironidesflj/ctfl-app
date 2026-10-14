import { describe, it, expect } from "vitest";
import { examVerdict } from "./Quiz.jsx";

/* r13 — veredito de simulado com os DOIS modelos oficiais de pontuação.
   CTFL v4.0: contagem simples (26/40). CTAL-TA v4.0: pontuação ponderada
   por K-level (K2=1, K3=2, K4=3 → 78 pontos, corte 51). Fonte: istqb.org
   (Exam Structure das certificações). A função é PURA e é a única fonte
   do veredito — os testes travam os dois modelos e o corte proporcional
   do simulado personalizado. */

const CTFL = {
  questions: 40,
  passMark: 26,
  passMarkPct: 65,
  totalPoints: 40,
  scoring: "count",
  timeMinutes: 60,
  timeMinutesNonNative: 75,
};
const TA = {
  questions: 45,
  passMark: 51,
  passMarkPct: 65,
  totalPoints: 78,
  scoring: "points",
  pointsByK: { 2: 1, 3: 2, 4: 3 },
  timeMinutes: 120,
  timeMinutesNonNative: 150,
};

// monta questões falsas com K fixo e gabarito na opção 0
const mk = (kLevels) =>
  kLevels.map((k, i) => ({
    id: "q" + i,
    chapter: 1,
    kLevel: k,
    answer: 0,
  }));
// opts alinhados: [ [{correct:true}, {correct:false}...], ... ]
const mkOpts = (n) =>
  Array.from({ length: n }, () => [
    { text: "a", correct: true },
    { text: "b", correct: false },
    { text: "c", correct: false },
    { text: "d", correct: false },
  ]);
// responde: "0" = correta, "1" = errada, null = em branco
const mkAnswers = (pattern) => pattern.map((p) => (p === null ? null : p === "0" ? 0 : 1));

describe("examVerdict — modelo count (CTFL)", () => {
  it("26 acertos de 40: aprovado no corte exato", () => {
    const qs = mk(Array(40).fill(2));
    const answers = mkAnswers([...Array(26).fill("0"), ...Array(14).fill("1")]);
    const v = examVerdict(qs, mkOpts(40), answers, CTFL);
    expect(v.scoring).toBe("count");
    expect(v.score).toBe(26);
    expect(v.pointsTotal).toBe(40);
    expect(v.pct).toBe(65);
    expect(v.passMarkEff).toBe(26);
    expect(v.passed).toBe(true);
  });

  it("25 acertos de 40: reprovado 1 abaixo do corte", () => {
    const qs = mk(Array(40).fill(2));
    const answers = mkAnswers([...Array(25).fill("0"), ...Array(15).fill("1")]);
    const v = examVerdict(qs, mkOpts(40), answers, CTFL);
    expect(v.passed).toBe(false);
    expect(v.pct).toBe(63);
  });

  it("em branco não pontua nem conta como acerto", () => {
    const qs = mk(Array(4).fill(2));
    const v = examVerdict(qs, mkOpts(4), mkAnswers(["0", null, null, null]), CTFL);
    expect(v.score).toBe(1);
    expect(v.pct).toBe(25);
    expect(v.passed).toBe(false);
  });
});

describe("examVerdict — modelo points (CTAL-TA)", () => {
  // blueprint CTAL-TA: K2=18, K3=21, K4=6 → 78 pontos
  const K_MIX = [...Array(18).fill(2), ...Array(21).fill(3), ...Array(6).fill(4)];

  it("prova perfeita: 45 questões, 78 pontos, pct 100", () => {
    const qs = mk(K_MIX);
    const v = examVerdict(qs, mkOpts(45), mkAnswers(Array(45).fill("0")), TA);
    expect(v.scoring).toBe("points");
    expect(v.score).toBe(45);
    expect(v.points).toBe(78);
    expect(v.pointsTotal).toBe(78);
    expect(v.pct).toBe(100);
    expect(v.passed).toBe(true);
  });

  it("todas K4 erradas, resto certo: 60/78 pontos (perde 6×3) = aprovado", () => {
    const qs = mk(K_MIX);
    const answers = K_MIX.map((k) => (k === 4 ? "1" : "0"));
    const v = examVerdict(qs, mkOpts(45), mkAnswers(answers), TA);
    expect(v.score).toBe(39); // 45 - 6 K4
    expect(v.points).toBe(60); // 78 - 6×3
    expect(v.pointsTotal).toBe(78);
    expect(v.pct).toBe(77);
    expect(v.passed).toBe(true);
  });

  it("corte 51/78: 50 pontos reprova, 51 aprova (peso K muda o veredito)", () => {
    // 51 pontos de perda total 27: 6×K4 (18) + 1×K3 (2) + 7×K2 (7)
    let k4Left = 6,
      k3Left = 1,
      k2Left = 7;
    const answers = K_MIX.map((k) => {
      if (k === 4 && k4Left > 0) {
        k4Left--;
        return "1";
      }
      if (k === 3 && k3Left > 0) {
        k3Left--;
        return "1";
      }
      if (k === 2 && k2Left > 0) {
        k2Left--;
        return "1";
      }
      return "0";
    });
    const v51 = examVerdict(mk(K_MIX), mkOpts(45), mkAnswers(answers), TA);
    expect(v51.points).toBe(51);
    expect(v51.passed).toBe(true);
    // 50 pontos: erra UMA K2 adicional (ainda certa) → 51-1 = 50 → reprovado
    const okK2 = K_MIX.findIndex((k, i) => k === 2 && answers[i] === "0");
    answers[okK2] = "1";
    const v50 = examVerdict(mk(K_MIX), mkOpts(45), mkAnswers(answers), TA);
    expect(v50.points).toBe(50);
    expect(v50.passed).toBe(false);
  });

  it("K desconhecido sem mapeamento cai no default de 1 ponto", () => {
    const qs = mk([2, 3, 9]); // kLevel 9 fora do mapa
    const v = examVerdict(qs, mkOpts(3), mkAnswers(["0", "0", "0"]), TA);
    expect(v.points).toBe(1 + 2 + 1);
  });

  it("custom: corte escala pelo total de pontos da seleção (65.38%)", () => {
    // 10 K3 = 20 pontos → corte = ceil(51/78 × 20) = 14
    const qs = mk(Array(10).fill(3));
    const answers = mkAnswers([...Array(7).fill("0"), ...Array(3).fill("1")]);
    const v = examVerdict(qs, mkOpts(10), answers, TA, { custom: true });
    expect(v.pointsTotal).toBe(20);
    expect(v.passMarkEff).toBe(14);
    expect(v.points).toBe(14);
    expect(v.passed).toBe(true);
  });
});

describe("examVerdict — casos limite", () => {
  it("prova vazia não divide por zero", () => {
    const v = examVerdict([], [], [], CTFL);
    expect(v.pct).toBe(0);
    expect(v.passed).toBe(false);
  });

  it("custom vazio no modelo points não divide por zero", () => {
    const v = examVerdict([], [], [], TA, { custom: true });
    expect(v.passMarkEff).toBe(1);
    expect(v.passed).toBe(false);
  });

  it("resposta undefined é tratada como em branco", () => {
    const qs = mk([2, 2]);
    const v = examVerdict(qs, mkOpts(2), [undefined, 0], CTFL);
    expect(v.score).toBe(1);
  });
});
