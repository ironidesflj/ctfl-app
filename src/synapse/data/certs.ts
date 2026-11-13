/* Synapse · data/certs.ts
   Metadados das certificações — portado do handoff (data/certs.js) com o
   seed `seen` zerado: o progresso real vive no store. Totais de estudo por
   capítulo vêm de banks/meta.json (gerado por scripts/generate-study-slices.mjs).
   Regras de exame: ISTQB Exam Structures & Rules v1.18.

   status 'soon' e 'legacy' não têm capítulos: prova sem banco não abre —
   não invente syllabus, peso ou cartão (regra 3 e regra 12 do handoff). */

import type { Cert } from "../types";
import bankMeta from "./banks/meta.json";

type LiveCertId = keyof typeof bankMeta.perCert;

function studyTotal(certId: LiveCertId, chapter: number): number {
  const chapters = bankMeta.perCert[certId]?.chapters as Record<string, number> | undefined;
  return chapters?.[String(chapter)] ?? 0;
}

export const CERT_ORDER = ["ctfl", "ctal-ta", "ctal-tm", "ct-ai", "ctal-at", "ctfl-at"] as const;

export const CERTS: Record<string, Cert> = {
  ctfl: {
    id: "ctfl",
    code: "CTFL",
    name: "Foundation Level",
    status: "live",
    version: "v4.0",
    year: 2023,
    exam: { q: 40, min: 60, pass: 26, points: 40, pct: 65, scoring: "count" },
    nextChapter: 4,
    chapters: [
      {
        n: 1,
        name: { pt: "Fundamentos", en: "Fundamentals" },
        sub: { pt: "Fundamentos do Teste", en: "Fundamentals of Testing" },
        examQ: 8,
        kLevels: { "1": 2, "2": 6 },
        total: studyTotal("ctfl", 1),
        topics: [
          { pt: "Erro → Defeito → Falha", en: "Error → Defect → Failure" },
          { pt: "7 Princípios de Teste", en: "7 Testing Principles" },
          { pt: "Processo e Atividades", en: "Test Process and Activities" },
        ],
      },
      {
        n: 2,
        name: { pt: "Teste no Ciclo", en: "Testing in the Lifecycle" },
        sub: {
          pt: "Teste ao Longo do Ciclo de Desenvolvimento",
          en: "Testing Throughout the SDLC",
        },
        examQ: 6,
        kLevels: { "1": 2, "2": 4 },
        total: studyTotal("ctfl", 2),
        topics: [
          { pt: "Níveis e Tipos", en: "Levels and Types" },
          { pt: "Confirmação e Regressão", en: "Confirmation and Regression" },
          { pt: "Manutenção e gatilhos", en: "Maintenance and Triggers" },
        ],
      },
      {
        n: 3,
        name: { pt: "Teste Estático", en: "Static Testing" },
        sub: { pt: "Teste Estático", en: "Static Testing" },
        examQ: 4,
        kLevels: { "1": 2, "2": 2 },
        total: studyTotal("ctfl", 3),
        topics: [
          { pt: "Estática vs Dinâmica", en: "Static vs Dynamic" },
          { pt: "Processo de Revisão", en: "Review Process" },
        ],
      },
      {
        n: 4,
        name: { pt: "Técnicas de Teste", en: "Test Techniques" },
        sub: { pt: "Técnicas de Teste", en: "Test Techniques" },
        examQ: 11,
        kLevels: { "2": 6, "3": 5 },
        total: studyTotal("ctfl", 4),
        topics: [
          { pt: "Caixa-preta", en: "Black-box" },
          { pt: "Caixa-branca", en: "White-box" },
          { pt: "Baseadas em experiência", en: "Experience-based" },
        ],
      },
      {
        n: 5,
        name: { pt: "Gerenc. de Teste", en: "Test Management" },
        sub: { pt: "Gerenciamento das Atividades de Teste", en: "Test Management" },
        examQ: 9,
        kLevels: { "1": 1, "2": 5, "3": 3 },
        total: studyTotal("ctfl", 5),
        topics: [
          { pt: "Planejamento e Risco", en: "Planning and Risk" },
          { pt: "Monitoramento e Defeitos", en: "Monitoring and Defects" },
        ],
      },
      {
        n: 6,
        name: { pt: "Ferramentas", en: "Tools" },
        sub: { pt: "Ferramentas de Apoio ao Teste", en: "Tool Support for Testing" },
        examQ: 2,
        kLevels: { "1": 1, "2": 1 },
        total: studyTotal("ctfl", 6),
        topics: [
          { pt: "Categorias de Ferramentas", en: "Tool Categories" },
          { pt: "Benefícios e Riscos", en: "Benefits and Risks" },
        ],
      },
    ],
  },
  "ctal-ta": {
    id: "ctal-ta",
    code: "CTAL-TA",
    name: "Test Analyst",
    status: "live",
    version: "v4.0",
    year: 2024,
    exam: { q: 45, min: 120, pass: 51, points: 78, pct: 65, scoring: "points" },
    nextChapter: 3,
    chapters: [
      {
        n: 1,
        name: { pt: "Tarefas no Processo de Teste", en: "Test Process Tasks" },
        sub: {
          pt: "As Tarefas do Analista de Testes no Processo de Teste",
          en: "Tasks in the Test Process",
        },
        examQ: 8,
        kLevels: { "2": 7, "3": 1 },
        total: studyTotal("ctal-ta", 1),
        topics: [
          { pt: "Papel do TA no SDLC (K2)", en: "TA Role in the SDLC (K2)" },
          { pt: "Tarefas do TA nas 4 atividades (K2)", en: "TA Tasks in the 4 Activities (K2)" },
          {
            pt: "Alto vs baixo nível + qualidade do TC (K2)",
            en: "High vs Low Level + TC Quality (K2)",
          },
          { pt: "Oráculos, dados e ambientes (K2)", en: "Oracles, Data and Environments (K2)" },
        ],
      },
      {
        n: 2,
        name: { pt: "Teste Baseado em Risco", en: "Risk-Based Testing" },
        sub: {
          pt: "As Tarefas do Analista de Testes em Teste Baseado em Risco",
          en: "Risk-Based Testing Tasks",
        },
        examQ: 3,
        kLevels: { "2": 1, "4": 2 },
        total: studyTotal("ctal-ta", 2),
        topics: [
          { pt: "TBR: análise + controle (K2)", en: "RBT: Analysis + Control (K2)" },
          { pt: "Contribuição do TA na análise (K2)", en: "TA Contribution to Analysis (K2)" },
          { pt: "Impacto de mudanças → regressão (K4)", en: "Impact of Changes → Regression (K4)" },
        ],
      },
      {
        n: 3,
        name: { pt: "Análise e Design", en: "Test Analysis & Design" },
        sub: { pt: "Análise e Design de Testes", en: "Test Analysis and Design" },
        examQ: 22,
        kLevels: { "2": 4, "3": 16, "4": 2 },
        total: studyTotal("ctal-ta", 3),
        topics: [
          { pt: "Famílias de técnicas v4.0", en: "v4.0 Technique Families" },
          { pt: "Domain testing (K3 — aplicar)", en: "Domain Testing (K3 — apply)" },
          { pt: "Combinatorial (K3) + random (K2)", en: "Combinatorial (K3) + Random (K2)" },
          {
            pt: "CRUD (K2) + estados e cenários (K3)",
            en: "CRUD (K2) + States and Scenarios (K3)",
          },
        ],
      },
      {
        n: 4,
        name: { pt: "Qualidade", en: "Quality Characteristics" },
        sub: { pt: "Teste de Características de Qualidade", en: "Testing Quality Characteristics" },
        examQ: 4,
        kLevels: { "2": 4 },
        total: studyTotal("ctal-ta", 4),
        topics: [
          {
            pt: "Funcional: completude × corretude × apropriação (K2)",
            en: "Functional: Completeness × Correctness × Appropriateness (K2)",
          },
          {
            pt: "Usabilidade, flexibilidade, compatibilidade (K2)",
            en: "Usability, Flexibility, Compatibility (K2)",
          },
        ],
      },
      {
        n: 5,
        name: { pt: "Prevenção de Defeitos", en: "Defect Prevention" },
        sub: { pt: "Prevenção de Defeitos de Software", en: "Software Defect Prevention" },
        examQ: 8,
        kLevels: { "2": 2, "3": 4, "4": 2 },
        total: studyTotal("ctal-ta", 5),
        topics: [
          { pt: "Prevenção: 3 frentes (K2)", en: "Prevention: 3 Fronts (K2)" },
          {
            pt: "Modelos + revisões na contenção (K3)",
            en: "Models + Reviews in Containment (K3)",
          },
          {
            pt: "Resultados → melhorias (K4) + classificação → RCA (K2)",
            en: "Results → Improvements (K4) + Classification → RCA (K2)",
          },
        ],
      },
    ],
  },
  "ctal-tm": {
    id: "ctal-tm",
    code: "CTAL-TM",
    name: "Test Manager",
    status: "live",
    version: "v3.0",
    year: 2024,
    exam: { q: 50, min: 120, pass: 58, points: 88, pct: 65, scoring: "points" },
    nextChapter: 1,
    chapters: [
      {
        n: 1,
        name: { pt: "Atividades de Teste", en: "Test Activities" },
        sub: { pt: "Gerenciamento das Atividades de Teste", en: "Managing the Test Activities" },
        examQ: 26,
        kLevels: { "2": 14, "3": 4, "4": 8 },
        total: studyTotal("ctal-tm", 1),
        topics: [
          {
            pt: "Processo de teste: planejamento, monitoramento, conclusão (K2)",
            en: "Test process: planning, monitoring, completion (K2)",
          },
          {
            pt: "Stakeholders e matriz poder-interesse (K2)",
            en: "Stakeholders and the power-interest matrix (K2)",
          },
          {
            pt: "Contexto: híbrido e modelos de SDLC (K2)",
            en: "Context: hybrid and SDLC models (K2)",
          },
          {
            pt: "Analisar o projeto → atividades de gestão (K4)",
            en: "Analyze the project → management activities (K4)",
          },
        ],
      },
      {
        n: 2,
        name: { pt: "O Produto", en: "The Product" },
        sub: { pt: "Gerenciamento do Produto", en: "Managing the Product" },
        examQ: 15,
        kLevels: { "2": 7, "3": 4, "4": 4 },
        total: studyTotal("ctal-tm", 2),
        topics: [
          {
            pt: "Métricas por atividade de gestão (K2)",
            en: "Metrics per management activity (K2)",
          },
          {
            pt: "Relatórios que capacitam decisões (K4)",
            en: "Reports that empower decisions (K4)",
          },
          {
            pt: "Estimativa: fatores e técnicas (K2/K4)",
            en: "Estimation: factors and techniques (K2/K4)",
          },
          {
            pt: "Defeitos: fluxo, comitê, ágil e híbrido (K3/K2)",
            en: "Defects: workflow, committee, Agile and hybrid (K3/K2)",
          },
        ],
      },
      {
        n: 3,
        name: { pt: "O Time de Teste", en: "The Test Team" },
        sub: { pt: "Gerenciamento do Time de Teste", en: "Managing the Team" },
        examQ: 9,
        kLevels: { "2": 5, "3": 2, "4": 2 },
        total: studyTotal("ctal-tm", 3),
        topics: [
          {
            pt: "Competências e skills do time (K2/K4)",
            en: "Team competences and skills (K2/K4)",
          },
          { pt: "Avaliar, desenvolver e liderar (K2)", en: "Assess, develop and lead (K2)" },
          {
            pt: "Motivação, custo da qualidade e custo-benefício (K2/K3)",
            en: "Motivation, cost of quality and cost-benefit (K2/K3)",
          },
        ],
      },
    ],
  },
  "ct-ai": {
    id: "ct-ai",
    code: "CT-AI",
    name: "AI Testing",
    status: "live",
    version: "v2.0",
    year: 2026,
    exam: { q: 40, min: 60, pass: 29, points: 44, pct: 65, scoring: "points" },
    nextChapter: 6,
    chapters: [
      {
        n: 1,
        name: { pt: "Introdução à IA", en: "Intro to AI" },
        sub: {
          pt: "Introdução à Inteligência Artificial",
          en: "Introduction to Artificial Intelligence",
        },
        examQ: 6,
        kLevels: { "2": 6 },
        total: studyTotal("ct-ai", 1),
        topics: [
          { pt: "Efeito de IA, IA vs ML vs DL (K2)", en: "AI Effect, AI vs ML vs DL (K2)" },
          { pt: "Aprendizado por reforço e RAG (K2)", en: "Reinforcement Learning & RAG (K2)" },
          {
            pt: "Hardware, nuvem/edge e frameworks (K2)",
            en: "Hardware, Cloud/Edge & Frameworks (K2)",
          },
          {
            pt: "Normas e regulação de risco em IA (K2)",
            en: "AI Risk Standards & Regulation (K2)",
          },
        ],
      },
      {
        n: 2,
        name: { pt: "Qualidade em IA", en: "AI Quality" },
        sub: {
          pt: "Características de Qualidade para Sistemas Baseados em IA",
          en: "Quality Characteristics for AI-Based Systems",
        },
        examQ: 3,
        kLevels: { "2": 3 },
        total: studyTotal("ct-ai", 2),
        topics: [
          {
            pt: "Equidade, transparência e explicabilidade (K2)",
            en: "Fairness, Transparency & Explainability (K2)",
          },
          {
            pt: "Autonomia, não-determinismo e segurança (K2)",
            en: "Autonomy, Non-Determinism & Safety (K2)",
          },
          {
            pt: "Critérios de aceitação quantitativos (K2)",
            en: "Quantitative Acceptance Criteria (K2)",
          },
        ],
      },
      {
        n: 3,
        name: { pt: "Machine Learning", en: "Machine Learning" },
        sub: { pt: "Aprendizado de Máquina (ML)", en: "Machine Learning" },
        examQ: 7,
        kLevels: { "2": 6, "3": 1 },
        total: studyTotal("ct-ai", 3),
        topics: [
          {
            pt: "Tipos de ML, LLMs, RAG e splits (K2)",
            en: "ML Types, LLMs, RAG & Data Splits (K2)",
          },
          { pt: "Sobreajuste e subajuste (K2)", en: "Overfitting & Underfitting (K2)" },
          {
            pt: "Matriz de confusão e métricas funcionais (K3)",
            en: "Confusion Matrix & Functional Metrics (K3)",
          },
          {
            pt: "Redes neurais e medidas de cobertura (K2)",
            en: "Neural Networks & Coverage Measures (K2)",
          },
        ],
      },
      {
        n: 4,
        name: { pt: "Teste de IA", en: "Testing AI" },
        sub: {
          pt: "Teste de Sistemas Baseados em IA",
          en: "Testing AI-Based Systems",
        },
        examQ: 7,
        kLevels: { "2": 6, "3": 1 },
        total: studyTotal("ct-ai", 4),
        topics: [
          {
            pt: "Problema do oráculo e avaliação probabilística (K2)",
            en: "Test Oracle Problem & Probabilistic Eval (K2)",
          },
          {
            pt: "Alucinação e viés em IA generativa (K2)",
            en: "Hallucination & Bias in Generative AI (K2)",
          },
          {
            pt: "Red teaming para sistemas baseados em LLM (K3)",
            en: "Red Teaming for LLM-Based Systems (K3)",
          },
          {
            pt: "Teste de modelo vs sistema e risco (K2)",
            en: "Model vs System & Risk-Based Testing (K2)",
          },
        ],
      },
      {
        n: 5,
        name: { pt: "Dados de Entrada", en: "Input Data" },
        sub: {
          pt: "Teste de Dados de Entrada para Sistemas de ML",
          en: "Input Data Testing for ML Systems",
        },
        examQ: 6,
        kLevels: { "2": 5, "3": 1 },
        total: studyTotal("ct-ai", 5),
        topics: [
          {
            pt: "Dimensões de qualidade e representatividade (K2)",
            en: "Data Quality Dimensions & Representativeness (K2)",
          },
          {
            pt: "Teste dinâmico de viés e esquemas do pipeline (K2)",
            en: "Dynamic Bias Testing & Pipeline Schemas (K2)",
          },
          {
            pt: "Restrições de dataset e validação de dados (K3)",
            en: "Dataset Constraints & Data Validation (K3)",
          },
          { pt: "Correção de rótulos (K2)", en: "Label Correctness (K2)" },
        ],
      },
      {
        n: 6,
        name: { pt: "Teste de Modelos", en: "Model Testing" },
        sub: {
          pt: "Teste de Modelos para Sistemas de ML",
          en: "Model Testing for ML Systems",
        },
        examQ: 9,
        kLevels: { "2": 8, "3": 1 },
        total: studyTotal("ct-ai", 6),
        topics: [
          {
            pt: "Model cards e limiares estatísticos (K2)",
            en: "Model Cards & Statistical Thresholds (K2)",
          },
          {
            pt: "Teste adversarial e detecção de drift (K2)",
            en: "Adversarial Testing & Drift Detection (K2)",
          },
          {
            pt: "Teste metamórfico para sistemas de ML (K3)",
            en: "Metamorphic Testing for ML Systems (K3)",
          },
          {
            pt: "Testes A/B e back-to-back em modelos (K2)",
            en: "A/B Testing & Back-to-Back Testing (K2)",
          },
        ],
      },
      {
        n: 7,
        name: { pt: "Desenvolvimento ML", en: "ML Dev Testing" },
        sub: {
          pt: "Teste de Desenvolvimento de ML",
          en: "ML Development Testing",
        },
        examQ: 2,
        kLevels: { "2": 2 },
        total: studyTotal("ct-ai", 7),
        topics: [
          {
            pt: "Pipeline de ML, MLOps e reprodutibilidade (K2)",
            en: "ML Pipeline, MLOps & Reproducibility (K2)",
          },
          {
            pt: "Canário, shadow, blue-green e teste de API (K2)",
            en: "Canary, Shadow, Blue-Green & API Testing (K2)",
          },
        ],
      },
    ],
  },
  "ctal-at": {
    id: "ctal-at",
    code: "CTAL-AT",
    name: "Advanced Test Automation",
    status: "soon",
    version: "v2.0",
    year: null,
    exam: null,
    nextChapter: null,
    chapters: [],
  },
  "ctfl-at": {
    id: "ctfl-at",
    code: "CTFL-AT",
    name: "Agile Tester",
    status: "legacy",
    version: "v1.0",
    year: null,
    exam: null,
    nextChapter: null,
    chapters: [],
  },
};

export const BANK_META = {
  examRules: "ISTQB Exam Structures & Rules v1.18",
  bank: `synapse bank v${bankMeta.version} · study pools (${Object.keys(bankMeta.perCert).join(", ")})`,
  updated: bankMeta.generatedDate,
  version: bankMeta.version,
  totalQuestions: bankMeta.totalQuestions,
  live: bankMeta.live,
  perCert: bankMeta.perCert,
};

/** Links externos do produto (shell). */
export const LINKS = {
  feedback: "https://github.com/ironidesflj/ctfl-app/issues/new?template=feedback.yml",
  repository: "https://github.com/ironidesflj/ctfl-app",
  authorGithub: "https://github.com/ironidesflj",
  authorLinkedin: "https://linkedin.com/in/ironjunior",
  noos: "https://noos.study/pt/",
  istqb: "https://www.istqb.org/certifications",
  istqbGlossary: "https://glossary.istqb.org/",
} as const;
