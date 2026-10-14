// Conteúdo de estudo — Flashcards + itens de Syllabus.
//
// Arquitetura (r14): cada item carrega `cert` ("ctfl" | "ctal-ta") + `ch`
// (número do capítulo, 1–6 CTFL / 1–5 CTAL-TA). O campo `d` (domínio) é
// mantido por compatibilidade com o CTFL, mas o escopo por certificação é
// feito pelo campo explícito `cert` — o domínio sozinho não distingue
// capítulos dentro do CTAL-TA (todos os 5 compartilham "analyst").
//
// Fonte do conteúdo CTAL-TA: ISTQB CTAL-TA v4.0 Syllabus (GA 2025/05/02,
// istqb.org) — estrutura de capítulos, learning objectives e definições.
// SRS: ids namespaced por cert (fc-ta-*, syl-ta-*) — o estado SM-2 vive no
// progresso POR CERT, então nunca colide entre certificações.

export const FLASHCARDS = [
  /* ─────────── CTFL v4.0 (15 cards — ids preservados p/ SRS legado) ─────────── */
  {
    id: "fc-fund-01",
    cert: "ctfl",
    ch: 1,
    d: "fund",
    locales: {
      pt: {
        front: "7 Princípios de Teste",
        back: "1. Teste mostra presença de defeitos\n2. Teste exaustivo é impossível\n3. Testes antecipados economizam\n4. Agrupamento de defeitos\n5. Paradoxo do pesticida\n6. Teste depende do contexto\n7. Ausência de erros é falácia",
      },
      en: {
        front: "7 Testing Principles",
        back: "1. Testing shows the presence of defects\n2. Exhaustive testing is impossible\n3. Early testing saves time\n4. Defect clustering\n5. Pesticide paradox\n6. Testing is context-dependent\n7. Absence-of-errors is a fallacy",
      },
    },
  },
  {
    id: "fc-fund-02",
    cert: "ctfl",
    ch: 1,
    d: "fund",
    locales: {
      pt: {
        front: "Erro → Defeito → Falha",
        back: "Erro: ação humana que gera resultado incorreto\nDefeito: a manifestação do erro no artefato/código\nFalha: comportamento incorreto observado em execução",
      },
      en: {
        front: "Error → Defect → Failure",
        back: "Error: human action that produces an incorrect result\nDefect: the manifestation of the error in the artifact/code\nFailure: incorrect behavior observed during execution",
      },
    },
  },
  {
    id: "fc-fund-03",
    cert: "ctfl",
    ch: 1,
    d: "fund",
    locales: {
      pt: {
        front: "Verificação vs Validação",
        back: 'Verificação: "construímos corretamente?" (vs. especificação)\nValidação: "construímos o produto certo?" (vs. necessidade real)',
      },
      en: {
        front: "Verification vs Validation",
        back: 'Verification: "are we building it correctly?" (vs. specification)\nValidation: "are we building the right product?" (vs. real need)',
      },
    },
  },
  {
    id: "fc-proc-01",
    cert: "ctfl",
    ch: 2,
    d: "proc",
    locales: {
      pt: {
        front: "Atividades do Processo de Teste (v4.0)",
        back: "1. Planejamento\n2. Monitoramento e Controle\n3. Análise\n4. Modelagem\n5. Implementação\n6. Execução\n7. Conclusão",
      },
      en: {
        front: "Test Process Activities (v4.0)",
        back: "1. Planning\n2. Monitoring and Control\n3. Analysis\n4. Design\n5. Implementation\n6. Execution\n7. Completion",
      },
    },
  },
  {
    id: "fc-proc-02",
    cert: "ctfl",
    ch: 2,
    d: "proc",
    locales: {
      pt: {
        front: "Níveis de Teste",
        back: "• Componente / Unidade\n• Integração de componentes\n• Sistema\n• Integração de sistema\n• Aceitação (UAT, operacional, contratual, regulatório)",
      },
      en: {
        front: "Test Levels",
        back: "• Component / Unit\n• Component Integration\n• System\n• System Integration\n• Acceptance (UAT, operational, contractual, regulatory)",
      },
    },
  },
  {
    id: "fc-proc-03",
    cert: "ctfl",
    ch: 2,
    d: "proc",
    locales: {
      pt: {
        front: "Confirmação vs Regressão",
        back: "Confirmação (re-teste): re-executa o caso que falhou após a correção\nRegressão: verifica se a mudança não quebrou áreas não alteradas",
      },
      en: {
        front: "Confirmation vs Regression",
        back: "Confirmation (re-testing): re-runs the case that failed after the fix\nRegression: checks that the change did not break unaffected areas",
      },
    },
  },
  {
    id: "fc-est-01",
    cert: "ctfl",
    ch: 3,
    d: "est",
    locales: {
      pt: {
        front: "Tipos de Revisão (menos → mais formal)",
        back: "Informal → Walkthrough → Revisão Técnica → Inspeção\n\nInspeção = mais formal: moderador, papéis, métricas, entry/exit criteria",
      },
      en: {
        front: "Review Types (least → most formal)",
        back: "Informal → Walkthrough → Technical Review → Inspection\n\nInspection = most formal: moderator, roles, metrics, entry/exit criteria",
      },
    },
  },
  {
    id: "fc-est-02",
    cert: "ctfl",
    ch: 3,
    d: "est",
    locales: {
      pt: {
        front: "Papéis numa revisão formal",
        back: "Moderador (lidera), Autor (responsável pelo artefato/retrabalho), Escriba (registra), Revisores (encontram defeitos), Gestor (decide)",
      },
      en: {
        front: "Roles in a Formal Review",
        back: "Moderator (leads), Author (owns the artifact/rework), Scribe (records), Reviewers (find defects), Manager (decides)",
      },
    },
  },
  {
    id: "fc-tec-01",
    cert: "ctfl",
    ch: 4,
    d: "tec",
    locales: {
      pt: {
        front: "BVA 2 pontos vs 3 pontos",
        back: "2 pontos: o limite e o adjacente inválido (ex: 17, 18 / 65, 66)\n3 pontos: o limite, 1 abaixo e 1 acima (ex: 17, 18, 19 / 64, 65, 66)",
      },
      en: {
        front: "2-value vs 3-value BVA",
        back: "2-value: the boundary and the adjacent invalid value (e.g., 17, 18 / 65, 66)\n3-value: the boundary, 1 below, and 1 above (e.g., 17, 18, 19 / 64, 65, 66)",
      },
    },
  },
  {
    id: "fc-tec-02",
    cert: "ctfl",
    ch: 4,
    d: "tec",
    locales: {
      pt: {
        front: "Famílias de Técnicas",
        back: "Caixa-preta: EP, BVA, tabela de decisão, transição de estados\nCaixa-branca: cobertura de instrução, decisão\nExperiência: suposição de erro, exploratório, checklist",
      },
      en: {
        front: "Technique Families",
        back: "Black-box: EP, BVA, decision table, state transition\nWhite-box: statement coverage, decision coverage\nExperience-based: error guessing, exploratory, checklist",
      },
    },
  },
  {
    id: "fc-tec-03",
    cert: "ctfl",
    ch: 4,
    d: "tec",
    locales: {
      pt: {
        front: "Cobertura: instruções vs decisões",
        back: "100% de cobertura de decisões garante 100% de instruções, mas não o contrário. Decisão é a cobertura mais forte das duas.",
      },
      en: {
        front: "Statement vs Decision Coverage",
        back: "100% decision coverage guarantees 100% statement coverage, but not the reverse. Decision is the stronger of the two coverage criteria.",
      },
    },
  },
  {
    id: "fc-mgmt-01",
    cert: "ctfl",
    ch: 5,
    d: "mgmt",
    locales: {
      pt: {
        front: "Nível de Risco",
        back: "Risco = Probabilidade de ocorrência × Impacto\n\nUsado para priorizar: maior risco → testado primeiro e com mais profundidade",
      },
      en: {
        front: "Risk Level",
        back: "Risk = Probability of occurrence × Impact\n\nUsed to prioritize: highest risk → tested first and in greatest depth",
      },
    },
  },
  {
    id: "fc-mgmt-02",
    cert: "ctfl",
    ch: 5,
    d: "mgmt",
    locales: {
      pt: {
        front: "Severidade vs Prioridade",
        back: "Severidade: impacto técnico do defeito no sistema\nPrioridade: urgência de correção sob a ótica do negócio\n(podem ser independentes)",
      },
      en: {
        front: "Severity vs Priority",
        back: "Severity: technical impact of the defect on the system\nPriority: urgency of the fix from the business perspective\n(can be independent of each other)",
      },
    },
  },
  {
    id: "fc-mgmt-03",
    cert: "ctfl",
    ch: 5,
    d: "mgmt",
    locales: {
      pt: {
        front: "Risco de Produto vs Projeto",
        back: "Produto: afeta a qualidade do produto (falha, segurança, desempenho)\nProjeto: afeta atingir os objetivos (prazo, custo, recursos, fornecedor)",
      },
      en: {
        front: "Product Risk vs Project Risk",
        back: "Product: affects product quality (failure, security, performance)\nProject: affects meeting objectives (schedule, cost, resources, supplier)",
      },
    },
  },
  {
    id: "fc-fer-01",
    cert: "ctfl",
    ch: 6,
    d: "fer",
    locales: {
      pt: {
        front: "Benefícios e Riscos da Automação",
        back: "Benefícios: velocidade, repetibilidade, regressão consistente\nRiscos: custo de manutenção, falsa sensação de segurança, ROI incerto se mal planejada",
      },
      en: {
        front: "Automation Benefits and Risks",
        back: "Benefits: speed, repeatability, consistent regression\nRisks: maintenance cost, false sense of security, uncertain ROI if poorly planned",
      },
    },
  },

  /* ─────────── CTAL-TA v4.0 (21 cards — Syllabus GA 2025/05/02) ─────────── */
  // Cap 1 — As Tarefas do Analista de Testes no Processo de Teste
  {
    id: "fc-ta-101",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        front: "Papel do Analista de Testes (TA)",
        back: "Foco maior nas necessidades de negócio do que nos aspectos técnicos\nTeste principalmente FUNCIONAL + não-funcional centrado no usuário (usabilidade, adaptabilidade, instalabilidade, interoperabilidade)\nTécnicas caixa-preta e baseadas em experiência (não caixa-branca)\nMelhora a eficácia com prevenção de defeitos",
      },
      en: {
        front: "Test Analyst (TA) Role",
        back: "Focuses more on business needs than technical aspects\nMainly FUNCTIONAL testing + user-focused non-functional (usability, adaptability, installability, interoperability)\nBlack-box and experience-based techniques (not white-box)\nImproves effectiveness via defect prevention",
      },
    },
  },
  {
    id: "fc-ta-102",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        front: "Caso de teste de ALTO vs BAIXO nível",
        back: "Alto nível (abstrato/lógico): indica quais CONDIÇÕES o caso cobre, sem dados concretos\nBaixo nível (concreto/físico): pré-condições, dados, resultados esperados e pós-condições específicos\n1 alto nível → 1+ baixo nível\nA transição é conceitual→técnica, frequentemente adiada p/ implementação",
      },
      en: {
        front: "HIGH-level vs LOW-level Test Case",
        back: "High-level (abstract/logical): states which CONDITIONS are covered, no concrete data\nLow-level (concrete/physical): specific preconditions, data, expected results, postconditions\n1 high-level → 1+ low-level\nThe transition is conceptual→technical, often deferred to implementation",
      },
    },
  },
  {
    id: "fc-ta-103",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        front: "Problema do Oráculo de Teste + soluções",
        back: "Oráculo = fonte dos resultados esperados. Problema: oráculo custo-efetivo indisponível\nFatores: complexidade de dados, não-determinismo (IA), comportamento probabilístico, requisitos ausentes/ambíguos\nSoluções: pseudo-oráculo, model-based, property-based, metamórfico, oráculo humano",
      },
      en: {
        front: "Test Oracle Problem + Solutions",
        back: "Oracle = source of expected results. Problem: no cost-effective oracle available\nFactors: data complexity, non-determinism (AI), probabilistic behavior, missing/ambiguous requirements\nSolutions: pseudo-oracle, model-based, property-based, metamorphic, human oracle",
      },
    },
  },
  {
    id: "fc-ta-104",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        front: "Teste keyword-driven",
        back: "Scripts especificados com PALAVRAS-CHAVE (ação/verificação) + parâmetros na camada de abstração certa\nPassos do TA: especificar keywords, casos, passos extras (pré/verificação/limpeza), manter, executar (auto ou manual) e analisar falhas",
      },
      en: {
        front: "Keyword-Driven Testing",
        back: "Scripts specified with KEYWORDS (action/verification) + parameters at the right abstraction layer\nTA steps: specify keywords, test cases, extra steps (pre/verify/cleanup), maintain, execute (auto or manual), analyze failures",
      },
    },
  },
  // Cap 2 — As Tarefas do TA em Teste Baseado em Risco
  {
    id: "fc-ta-201",
    cert: "ctal-ta",
    ch: 2,
    d: "analyst",
    locales: {
      pt: {
        front: "Teste Baseado em Risco (TBR)",
        back: "Abordagem que prioriza o esforço de teste pelo NÍVEL DE RISCO dos itens\nO Gerente de Teste DETERMINA a abordagem; o TA a IMPLEMENTA ativamente\n= análise de risco (identificação + avaliação) + controle de risco + monitoramento regular (1x por iteração em ciclos iterativos)",
      },
      en: {
        front: "Risk-Based Testing (RBT)",
        back: "Approach prioritizing test effort by item RISK LEVEL\nThe Test Manager DETERMINES the approach; the TA actively IMPLEMENTS it\n= risk analysis (identification + assessment) + risk control + regular monitoring (once per iteration in iterative lifecycles)",
      },
    },
  },
  {
    id: "fc-ta-202",
    cert: "ctal-ta",
    ch: 2,
    d: "analyst",
    locales: {
      pt: {
        front: "TA na IDENTIFICAÇÃO de riscos",
        back: "Contribui com experiência e conhecimento do sistema em:\n• Retrospectivas e workshops de risco\n• Brainstorming e checklists\n• Entrevistas com stakeholders (quais riscos são mais significativos p/ cada um)",
      },
      en: {
        front: "TA in Risk IDENTIFICATION",
        back: "Contributes system experience and knowledge via:\n• Retrospectives and risk workshops\n• Brainstorming and checklists\n• Stakeholder interviews (which risks matter most to each)",
      },
    },
  },
  {
    id: "fc-ta-203",
    cert: "ctal-ta",
    ch: 2,
    d: "analyst",
    locales: {
      pt: {
        front: "Impacto de mudanças → escopo de regressão (K4)",
        back: "O TA ANALISA o impacto de mudanças p/ determinar o escopo do teste de regressão\nNa avaliação de risco estima: frequência de uso, criticidade das funções afetadas, impacto de falha, probabilidade de falha\nNo controle: atualiza o registro de riscos e ajusta as ações de mitigação",
      },
      en: {
        front: "Impact of Changes → Regression Scope (K4)",
        back: "The TA ANALYZES the impact of changes to determine regression test scope\nIn risk assessment estimates: frequency of use, criticality of affected features, failure impact, failure likelihood\nIn risk control: updates the risk register and adjusts mitigation actions",
      },
    },
  },
  // Cap 3 — Análise e Design de Testes
  {
    id: "fc-ta-301",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Famílias de técnicas v4.0 (TA)",
        back: "Baseadas em DADOS: domain testing, combinatorial, random\nBaseadas em COMPORTAMENTO: CRUD, transição de estados, cenários\nBaseadas em REGRAS: tabela de decisão, metamórfico\nBaseadas em EXPERIÊNCIA: charters/sessões, checklists, crowd\n(v4.0 reagrupou EP/BVA dentro de domain testing)",
      },
      en: {
        front: "v4.0 Technique Families (TA)",
        back: "DATA-based: domain testing, combinatorial, random\nBEHAVIOR-based: CRUD, state transition, scenario\nRULE-based: decision table, metamorphic\nEXPERIENCE-based: charters/sessions, checklists, crowd\n(v4.0 regrouped EP/BVA into domain testing)",
      },
    },
  },
  {
    id: "fc-ta-302",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Domain testing — pontos de cobertura",
        back: "Partições definidas por expressões booleanas (AND/OR/NOT) sobre variáveis que interagem; cada condição atômica define uma BORDA\nBorda FECHADA: ≤, ≥, = · Borda ABERTA: <, >, ≠\nON (na borda/mais perto dentro), OFF (fora/na borda), IN, OUT\nCobertura simplificada: 1 ON + 1 OFF por borda (= : 1 ON + 2 OFF)",
      },
      en: {
        front: "Domain Testing — coverage points",
        back: "Partitions defined by Boolean expressions (AND/OR/NOT) over interacting variables; each atomic condition defines a BORDER\nCLOSED border: ≤, ≥, = · OPEN border: <, >, ≠\nON (on border/closest inside), OFF (outside/on border), IN, OUT\nSimplified coverage: 1 ON + 1 OFF per border (= : 1 ON + 2 OFF)",
      },
    },
  },
  {
    id: "fc-ta-303",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Combinatorial testing",
        back: "Revela FALHAS DE INTERAÇÃO (combinações específicas de valores de parâmetros)\nBase choice: 1 par base por parâmetro; varia 1 par por vez\nPairwise: todos os pares de valores de 2 parâmetros quaisquer\nDica: aplicar EP antes p/ reduzir o nº de valores",
      },
      en: {
        front: "Combinatorial Testing",
        back: "Reveals INTERACTION FAILURES (specific parameter value combinations)\nBase choice: one base pair per parameter; vary one pair at a time\nPairwise: all pairs of values for any 2 parameters\nTip: apply EP first to reduce the number of values",
      },
    },
  },
  {
    id: "fc-ta-304",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Random testing",
        back: "Seleciona dados ALEATORIAMENTE do domínio de entrada segundo distribuição de probabilidade\nValidação → perfil operacional; Verificação → uso-agnóstico (sem viés)\nGuiado (adaptive: defeitos se agrupam) vs não-guiado (distribuição fixa)\nSEM critério de cobertura → saída por nº de testes ou tempo",
      },
      en: {
        front: "Random Testing",
        back: "Selects inputs RANDOMLY from the input domain per a probability distribution\nValidation → operational profile; Verification → usage-agnostic (no bias)\nGuided (adaptive: defects cluster) vs unguided (fixed distribution)\nNO coverage criteria → exit by number of tests or time",
      },
    },
  },
  {
    id: "fc-ta-305",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "CRUD testing",
        back: "Verifica o CICLO DE VIDA de entidades de dados: Create, Read, Update, Delete\nMatriz CRUD: linhas = funções, colunas = entidades (C/R/U/D)\nR frequentemente IMPLÍCITO nas operações C-U-D\nCompletude (estático): toda operação existe p/ cada entidade\nConsistência (dinâmico): funções interagem corretamente + testes negativos",
      },
      en: {
        front: "CRUD Testing",
        back: "Verifies the DATA ENTITY LIFECYCLE: Create, Read, Update, Delete\nCRUD matrix: rows = functions, columns = entities (C/R/U/D)\nR often IMPLICIT in C-U-D operations\nCompleteness (static): every operation exists per entity\nConsistency (dynamic): functions interact correctly + negative tests",
      },
    },
  },
  {
    id: "fc-ta-306",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Metamorphic testing",
        back: "Relação metamórfica (RM) = propriedade que liga mudança na ENTRADA ao resultado ESPERADO\nCaso-fonte + casos follow-up (gerados da RM) = 1 procedimento com avaliação conjunta\nEx.: permutar a série → mesma média; multiplicar por x → média × x\nResolve o problema do oráculo; MRs podem ser combinados",
      },
      en: {
        front: "Metamorphic Testing",
        back: "Metamorphic relation (MR) = property linking an INPUT change to the EXPECTED result\nSource case + follow-up cases (from the MR) = 1 procedure with joint evaluation\nE.g.: permuting the series → same average; multiplying by x → average × x\nSolves the oracle problem; MRs can be combined",
      },
    },
  },
  {
    id: "fc-ta-307",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Test charter (session-based)",
        back: 'Missão da sessão de teste exploratório: "Explore [alvo] com [recursos] para descobrir [informação]"\nFatores: cliente/requisitos (jornadas do usuário), produto (fluxos, design, interfaces), gerenciamento (tempo, esforço, valor)\nDá estrutura + flexibilidade — NÃO especifica as suítes da sessão',
      },
      en: {
        front: "Test Charter (session-based)",
        back: 'Mission of the exploratory test session: "Explore [target] with [resources] to discover [information]"\nFactors: customer/requirements (user journeys), product (flows, design, interfaces), management (time, effort, value)\nProvides structure + flexibility — does NOT specify session test suites',
      },
    },
  },
  {
    id: "fc-ta-308",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        front: "Seleção de técnicas + automação do design (K4)",
        back: "Seleção guiada pelos RISCOS DE PRODUTO da situação\nAutomação do design de teste:\nBenefícios — velocidade, cobertura consistente, menos erro humano\nRiscos — manutenção, competência, dependência de ferramenta, falsa segurança",
      },
      en: {
        front: "Technique Selection + Design Automation (K4)",
        back: "Selection guided by the situation's PRODUCT RISKS\nTest design automation:\nBenefits — speed, consistent coverage, less human error\nRisks — maintenance, competence, tool dependency, false security",
      },
    },
  },
  // Cap 4 — Teste de Características de Qualidade
  {
    id: "fc-ta-401",
    cert: "ctal-ta",
    ch: 4,
    d: "analyst",
    locales: {
      pt: {
        front: "Adequação funcional: 3 sub-características",
        back: "COMPLETUDE: tudo o que foi pedido está implementado? (revisão de requisitos cedo, cenários, rastreabilidade essencial)\nCORRETUDE: resultados precisos/consistentes p/ entradas válidas e inválidas? (oráculo eficaz; qualquer nível; mais no componente)\nAPROPRIEIDADE: o que existe atende às necessidades do usuário? (revisões de UI, exploratório, demos)",
      },
      en: {
        front: "Functional Suitability: 3 Sub-characteristics",
        back: "COMPLETENESS: is everything asked for implemented? (early requirement review, scenarios, traceability essential)\nCORRECTNESS: are results accurate/consistent for valid and invalid inputs? (effective oracle; any level; mostly component)\nAPPROPRIATENESS: does what exists meet user needs? (UI reviews, exploratory, demos)",
      },
    },
  },
  {
    id: "fc-ta-402",
    cert: "ctal-ta",
    ch: 4,
    d: "analyst",
    locales: {
      pt: {
        front: "Usability — foco e contribuição do TA",
        back: "Avalia: capacidade de interação (eficaz/eficiente/satisfatória), experiência do usuário (antes/durante/depois), acessibilidade (deficiências, culturas, idiomas)\nTA contribui: revisões de usabilidade (adapta checklists) e sessões de teste de usabilidade (tarefas predefinidas com usuários)",
      },
      en: {
        front: "Usability — Focus and TA Contribution",
        back: "Evaluates: interaction capability (effective/efficient/satisfactory), user experience (before/during/after), accessibility (disabilities, cultures, languages)\nTA contributes: usability reviews (adapts checklists) and usability test sessions (predefined tasks with users)",
      },
    },
  },
  {
    id: "fc-ta-403",
    cert: "ctal-ta",
    ch: 4,
    d: "analyst",
    locales: {
      pt: {
        front: "Flexibilidade e Compatibilidade (TA)",
        back: "Flexibilidade = ADAPTABILIDADE (diferentes ambientes/plataformas) + INSTALABILIDADE (instalação/desinstalação em ambientes-alvo)\nCompatibilidade/Interoperabilidade = TROCA DE DADOS entre sistemas (ICDs, padrões)\nTA: dados de teste compatíveis, ambientes variados, especificações de interface",
      },
      en: {
        front: "Flexibility and Compatibility (TA)",
        back: "Flexibility = ADAPTABILITY (different environments/platforms) + INSTALLABILITY (install/uninstall in target environments)\nCompatibility/Interoperability = DATA EXCHANGE between systems (ICDs, standards)\nTA: compatible test data, varied environments, interface specifications",
      },
    },
  },
  // Cap 5 — Prevenção de Defeitos de Software
  {
    id: "fc-ta-501",
    cert: "ctal-ta",
    ch: 5,
    d: "analyst",
    locales: {
      pt: {
        front: "Prevenção de defeitos — 3 frentes",
        back: "1. Prevenir a INTRODUÇÃO (atividades de QA)\n2. Prevenir a FUGA p/ fases subsequentes (phase containment)\n3. Prevenir a RECORRÊNCIA (análise de causa-raiz)\nResponsabilidade de TODA a equipe; benefícios: custo, produtividade, qualidade\nTA: análise de risco, revisão de requisitos/modelos, retrospectivas, dados de defeitos",
      },
      en: {
        front: "Defect Prevention — 3 Fronts",
        back: "1. Prevent INTRODUCTION (QA activities)\n2. Prevent ESCAPE to subsequent phases (phase containment)\n3. Prevent RECURRENCE (root cause analysis)\nWhole team responsibility; benefits: cost, productivity, quality\nTA: risk analysis, reviewing requirements/models, retrospectives, defect data",
      },
    },
  },
  {
    id: "fc-ta-502",
    cert: "ctal-ta",
    ch: 5,
    d: "analyst",
    locales: {
      pt: {
        front: "Phase containment + PCE",
        back: "Objetivo: detectar E remover o defeito na MESMA fase em que foi introduzido (shift-left análogo no Agile)\nPCE = defeitos introduzidos E removidos na fase ÷ total introduzidos na fase\nPCE alto → menos fugas p/ fases posteriores → menor custo de qualidade\nTA: avaliar a qualidade da base de teste (modelagem + revisões)",
      },
      en: {
        front: "Phase Containment + PCE",
        back: "Goal: detect AND remove the defect in the SAME phase it was introduced (shift-left analogue in Agile)\nPCE = defects introduced AND removed in phase ÷ total introduced in phase\nHigh PCE → fewer escapes to later phases → lower cost of quality\nTA: evaluate test basis quality (modeling + reviews)",
      },
    },
  },
  {
    id: "fc-ta-503",
    cert: "ctal-ta",
    ch: 5,
    d: "analyst",
    locales: {
      pt: {
        front: "Classificação de defeitos → RCA",
        back: "Classificar defeitos por TIPO revela PADRÕES → alimenta a análise de causa-raiz → ações que impedem a recorrência\nTA (K4): analisa resultados de teste p/ identificar melhorias na DETECÇÃO de defeitos (técnicas, áreas de risco, dados/ambientes)",
      },
      en: {
        front: "Defect Classification → RCA",
        back: "Classifying defects by TYPE reveals PATTERNS → feeds root cause analysis → actions preventing recurrence\nTA (K4): analyzes test results to identify improvements in defect DETECTION (techniques, risk areas, data/environments)",
      },
    },
  },
];

export const SYLLABUS_ITEMS = [
  /* ─────────── CTFL v4.0 ─────────── */
  {
    id: "syl-fund-01",
    cert: "ctfl",
    ch: 1,
    d: "fund",
    locales: {
      pt: {
        kw: "Erro → Defeito → Falha",
        desc: "Cadeia causal: ação humana (erro) gera defeito no artefato, que ao executar causa falha.",
      },
      en: {
        kw: "Error → Defect → Failure",
        desc: "Causal chain: a human action (error) introduces a defect in the artifact, which causes a failure when executed.",
      },
    },
  },
  {
    id: "syl-fund-02",
    cert: "ctfl",
    ch: 1,
    d: "fund",
    locales: {
      pt: {
        kw: "7 Princípios de Teste",
        desc: "Todos podem cair. Memorize a lista e um exemplo de cada (pesticida, agrupamento, etc.).",
      },
      en: {
        kw: "7 Testing Principles",
        desc: "All of them can appear on the exam. Memorize the list and one example of each (pesticide, clustering, etc.).",
      },
    },
  },
  {
    id: "syl-fund-03",
    cert: "ctfl",
    ch: 1,
    d: "fund",
    locales: {
      pt: {
        kw: "Processo e Atividades",
        desc: "Planejamento, monitoramento/controle, análise, modelagem, implementação, execução, conclusão.",
      },
      en: {
        kw: "Test Process and Activities",
        desc: "Planning, monitoring/control, analysis, design, implementation, execution, completion.",
      },
    },
  },
  {
    id: "syl-proc-01",
    cert: "ctfl",
    ch: 2,
    d: "proc",
    locales: {
      pt: {
        kw: "Níveis e Tipos",
        desc: "Níveis: componente, integração, sistema, aceitação. Tipos: funcional, não-funcional, caixa-branca, mudança.",
      },
      en: {
        kw: "Levels and Types",
        desc: "Levels: component, integration, system, acceptance. Types: functional, non-functional, white-box, change-related.",
      },
    },
  },
  {
    id: "syl-proc-02",
    cert: "ctfl",
    ch: 2,
    d: "proc",
    locales: {
      pt: {
        kw: "Confirmação e Regressão",
        desc: "Re-teste confirma a correção; regressão detecta efeitos colaterais de mudanças.",
      },
      en: {
        kw: "Confirmation and Regression",
        desc: "Re-testing confirms the fix; regression detects side effects from changes.",
      },
    },
  },
  {
    id: "syl-proc-03",
    cert: "ctfl",
    ch: 2,
    d: "proc",
    locales: {
      pt: {
        kw: "Manutenção e gatilhos",
        desc: "Modificações, migração, atualização e aposentadoria disparam teste de manutenção.",
      },
      en: {
        kw: "Maintenance and Triggers",
        desc: "Modifications, migration, upgrades, and retirement trigger maintenance testing.",
      },
    },
  },
  {
    id: "syl-est-01",
    cert: "ctfl",
    ch: 3,
    d: "est",
    locales: {
      pt: {
        kw: "Estática vs Dinâmica",
        desc: "Estática: sem execução (revisões, análise). Dinâmica: executando. Encontram defeitos diferentes.",
      },
      en: {
        kw: "Static vs Dynamic",
        desc: "Static: no execution (reviews, analysis). Dynamic: with execution. They find different types of defects.",
      },
    },
  },
  {
    id: "syl-est-02",
    cert: "ctfl",
    ch: 3,
    d: "est",
    locales: {
      pt: {
        kw: "Processo de Revisão",
        desc: "Planejamento, início, revisão individual, comunicação/análise, correção. Conheça os papéis.",
      },
      en: {
        kw: "Review Process",
        desc: "Planning, kick-off, individual review, communication/analysis, fixing. Know the roles.",
      },
    },
  },
  {
    id: "syl-tec-01",
    cert: "ctfl",
    ch: 4,
    d: "tec",
    locales: {
      pt: {
        kw: "Caixa-preta",
        desc: "EP, BVA, tabela de decisão, transição de estados. Aplicação (K3): calcular fronteiras, montar regras.",
      },
      en: {
        kw: "Black-box",
        desc: "EP, BVA, decision table, state transition. Application (K3): calculating boundaries, building rules.",
      },
    },
  },
  {
    id: "syl-tec-02",
    cert: "ctfl",
    ch: 4,
    d: "tec",
    locales: {
      pt: {
        kw: "Caixa-branca",
        desc: "Cobertura de instrução vs decisão; decisão é mais forte que instrução.",
      },
      en: {
        kw: "White-box",
        desc: "Statement vs decision coverage; decision is stronger than statement.",
      },
    },
  },
  {
    id: "syl-tec-03",
    cert: "ctfl",
    ch: 4,
    d: "tec",
    locales: {
      pt: {
        kw: "Baseadas em experiência",
        desc: "Suposição de erro, exploratório, checklist. Complementam as formais.",
      },
      en: {
        kw: "Experience-based",
        desc: "Error guessing, exploratory, checklist. They complement the formal techniques.",
      },
    },
  },
  {
    id: "syl-mgmt-01",
    cert: "ctfl",
    ch: 5,
    d: "mgmt",
    locales: {
      pt: {
        kw: "Planejamento e Risco",
        desc: "Plano, estimativa, teste baseado em risco (probabilidade × impacto), critérios de entrada/saída.",
      },
      en: {
        kw: "Planning and Risk",
        desc: "Test plan, estimation, risk-based testing (probability × impact), entry/exit criteria.",
      },
    },
  },
  {
    id: "syl-mgmt-02",
    cert: "ctfl",
    ch: 5,
    d: "mgmt",
    locales: {
      pt: {
        kw: "Monitoramento e Defeitos",
        desc: "Métricas, relatórios, gestão de configuração e relatório de defeito (severidade vs prioridade).",
      },
      en: {
        kw: "Monitoring and Defects",
        desc: "Metrics, reports, configuration management, and defect reports (severity vs priority).",
      },
    },
  },
  {
    id: "syl-fer-01",
    cert: "ctfl",
    ch: 6,
    d: "fer",
    locales: {
      pt: {
        kw: "Categorias de Ferramentas",
        desc: "Gestão, estática, execução, dados, desempenho. Cada uma apoia uma atividade.",
      },
      en: {
        kw: "Tool Categories",
        desc: "Management, static, execution, data, performance. Each supports a different activity.",
      },
    },
  },
  {
    id: "syl-fer-02",
    cert: "ctfl",
    ch: 6,
    d: "fer",
    locales: {
      pt: {
        kw: "Benefícios e Riscos",
        desc: "ROI da automação, manutenção, seleção de ferramenta, projeto piloto antes de escalar.",
      },
      en: {
        kw: "Benefits and Risks",
        desc: "Automation ROI, maintenance, tool selection, pilot project before scaling.",
      },
    },
  },

  /* ─────────── CTAL-TA v4.0 ─────────── */
  // Cap 1 — Tarefas no Processo (8 questões na prova)
  {
    id: "syl-ta-101",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        kw: "Papel do TA no SDLC (K2)",
        desc: "TA foca nas necessidades de negócio; funcional + não-funcional centrado no usuário; caixa-preta e experiência; saiba resumir o envolvimento em cada modelo de ciclo de vida.",
      },
      en: {
        kw: "TA Role in the SDLC (K2)",
        desc: "TA focuses on business needs; functional + user-focused non-functional; black-box and experience-based; be able to summarize involvement in each lifecycle model.",
      },
    },
  },
  {
    id: "syl-ta-102",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        kw: "Tarefas do TA nas 4 atividades (K2)",
        desc: "Análise (identifica condições), modelagem (casos), implementação (scripts/dados/keyword-driven), execução (compara resultados, reporta). Um resumo por atividade.",
      },
      en: {
        kw: "TA Tasks in the 4 Activities (K2)",
        desc: "Analysis (identify conditions), design (test cases), implementation (scripts/data/keyword-driven), execution (compare results, report). One summary per activity.",
      },
    },
  },
  {
    id: "syl-ta-103",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        kw: "Alto vs baixo nível + qualidade do TC (K2)",
        desc: "Conceito, quando adiar a concreção e os critérios de qualidade de um caso de teste (rastreável, auto-explicável...). 1 alto → N baixo.",
      },
      en: {
        kw: "High vs Low Level + TC Quality (K2)",
        desc: "Concept, when to defer concretization, and test case quality criteria (traceable, self-explanatory...). 1 high → N low.",
      },
    },
  },
  {
    id: "syl-ta-104",
    cert: "ctal-ta",
    ch: 1,
    d: "analyst",
    locales: {
      pt: {
        kw: "Oráculos, dados e ambientes (K2)",
        desc: "Problema do oráculo e 5 soluções; requisitos de dados de teste e de ambiente; ferramentas de gestão do testware. Exemplos práticos caem na prova.",
      },
      en: {
        kw: "Oracles, Data and Environments (K2)",
        desc: "Oracle problem and 5 solutions; test data and environment requirements; testware management tools. Practical examples appear on the exam.",
      },
    },
  },
  // Cap 2 — Risco (3 questões, 2 delas K4!)
  {
    id: "syl-ta-201",
    cert: "ctal-ta",
    ch: 2,
    d: "analyst",
    locales: {
      pt: {
        kw: "TBR: análise + controle (K2)",
        desc: "TM determina a abordagem, TA implementa. Análise = identificação + avaliação; controle = mitigação + registro de riscos; monitoramento regular.",
      },
      en: {
        kw: "RBT: Analysis + Control (K2)",
        desc: "TM determines the approach, TA implements. Analysis = identification + assessment; control = mitigation + risk register; regular monitoring.",
      },
    },
  },
  {
    id: "syl-ta-202",
    cert: "ctal-ta",
    ch: 2,
    d: "analyst",
    locales: {
      pt: {
        kw: "Contribuição do TA na análise (K2)",
        desc: "Retrospectivas, workshops, brainstorming, checklists, entrevistas; estima frequência de uso, criticidade, impacto e probabilidade de falha.",
      },
      en: {
        kw: "TA Contribution to Analysis (K2)",
        desc: "Retrospectives, workshops, brainstorming, checklists, interviews; estimates frequency of use, criticality, failure impact and likelihood.",
      },
    },
  },
  {
    id: "syl-ta-203",
    cert: "ctal-ta",
    ch: 2,
    d: "analyst",
    locales: {
      pt: {
        kw: "Impacto de mudanças → regressão (K4)",
        desc: "ANALISAR o impacto de mudanças para definir o escopo da regressão é o único K4 do capítulo — caem cenários completos. Pratique com mudanças reais (novo requisito, correção, refatoração).",
      },
      en: {
        kw: "Impact of Changes → Regression (K4)",
        desc: "ANALYZING the impact of changes to define regression scope is the chapter's only K4 — full scenarios appear. Practice with real changes (new requirement, fix, refactor).",
      },
    },
  },
  // Cap 3 — Análise e Design (22 questões — o coração da prova!)
  {
    id: "syl-ta-301",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        kw: "Famílias de técnicas v4.0",
        desc: "Dados: domain, combinatorial, random. Comportamento: CRUD, estados, cenários. Regras: tabela de decisão, metamórfico. Experiência: charters, checklists, crowd. A nomenclatura MUDOU da v3 — decore as 4 famílias.",
      },
      en: {
        kw: "v4.0 Technique Families",
        desc: "Data: domain, combinatorial, random. Behavior: CRUD, states, scenarios. Rules: decision table, metamorphic. Experience: charters, checklists, crowd. Naming CHANGED from v3 — memorize the 4 families.",
      },
    },
  },
  {
    id: "syl-ta-302",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        kw: "Domain testing (K3 — aplicar)",
        desc: "Expressões booleanas, bordas abertas/fechadas, pontos ON/OFF/IN/OUT, coberturas simplificada e confiável. Substitui EP+BVA da foundation — pratique com 2 variáveis interagindo.",
      },
      en: {
        kw: "Domain Testing (K3 — apply)",
        desc: "Boolean expressions, open/closed borders, ON/OFF/IN/OUT points, simplified and reliable coverage. Replaces foundation EP+BVA — practice with 2 interacting variables.",
      },
    },
  },
  {
    id: "syl-ta-303",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        kw: "Combinatorial (K3) + random (K2)",
        desc: "Falhas de interação; base choice (varia 1 par por vez) e pairwise (todos os pares); EP antes para reduzir valores. Random: guiado (adaptive) vs não-guiado, sem critério de cobertura — saída por contagem/tempo.",
      },
      en: {
        kw: "Combinatorial (K3) + Random (K2)",
        desc: "Interaction failures; base choice (vary one pair at a time) and pairwise (all pairs); EP first to reduce values. Random: guided (adaptive) vs unguided, no coverage criteria — exit by count/time.",
      },
    },
  },
  {
    id: "syl-ta-304",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        kw: "CRUD (K2) + estados e cenários (K3)",
        desc: "Matriz funções×entidades; completude estática + consistência dinâmica. Transição de estados e cenários: aplique cobertura de transições/estados e jornadas de usuário completas.",
      },
      en: {
        kw: "CRUD (K2) + States and Scenarios (K3)",
        desc: "Functions×entities matrix; static completeness + dynamic consistency. State transition and scenarios: apply transition/state coverage and complete user journeys.",
      },
    },
  },
  {
    id: "syl-ta-305",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        kw: "Tabela de decisão (K3) + metamórfico (K3)",
        desc: "Regras = combinações de condições; N condições → 2^N regras (com impossíveis marcadas). Metamórfico: RM, caso-fonte + follow-ups, resolve oráculo — saiba criar follow-ups.",
      },
      en: {
        kw: "Decision Table (K3) + Metamorphic (K3)",
        desc: "Rules = condition combinations; N conditions → 2^N rules (mark impossibles). Metamorphic: MR, source + follow-up cases, solves oracles — know how to create follow-ups.",
      },
    },
  },
  {
    id: "syl-ta-306",
    cert: "ctal-ta",
    ch: 3,
    d: "analyst",
    locales: {
      pt: {
        kw: "Experiência + seleção (K4)",
        desc: "Charters (Explore/com/descobrir), checklists e crowd (benefícios/limitações). SELEÇÃO de técnica por risco de produto é K4 — o segundo K4 da prova. Automação do design: benefícios vs riscos.",
      },
      en: {
        kw: "Experience + Selection (K4)",
        desc: "Charters (Explore/with/discover), checklists and crowd (benefits/limitations). Technique SELECTION by product risk is K4 — the exam's second K4. Design automation: benefits vs risks.",
      },
    },
  },
  // Cap 4 — Qualidade (4 questões)
  {
    id: "syl-ta-401",
    cert: "ctal-ta",
    ch: 4,
    d: "analyst",
    locales: {
      pt: {
        kw: "Funcional: completude × corretude × apropriação (K2)",
        desc: "A pergunta-chave de cada uma (tudo pedido existe? resultados corretos? atende necessidades?) + nível/técnica mais adequada de cada.",
      },
      en: {
        kw: "Functional: Completeness × Correctness × Appropriateness (K2)",
        desc: "Each one's key question (all asked-for exists? correct results? meets needs?) + each one's best-fit level/technique.",
      },
    },
  },
  {
    id: "syl-ta-402",
    cert: "ctal-ta",
    ch: 4,
    d: "analyst",
    locales: {
      pt: {
        kw: "Usabilidade, flexibilidade, compatibilidade (K2)",
        desc: "Usabilidade: interação/UX/acessibilidade + revisões e sessões. Flexibilidade: adaptabilidade + instalabilidade. Compatibilidade: interoperabilidade e troca de dados. Como o TA CONTRIBUI em cada.",
      },
      en: {
        kw: "Usability, Flexibility, Compatibility (K2)",
        desc: "Usability: interaction/UX/accessibility + reviews and sessions. Flexibility: adaptability + installability. Compatibility: interoperability and data exchange. How the TA CONTRIBUTES to each.",
      },
    },
  },
  // Cap 5 — Prevenção de Defeitos (8 questões, 1 K4)
  {
    id: "syl-ta-501",
    cert: "ctal-ta",
    ch: 5,
    d: "analyst",
    locales: {
      pt: {
        kw: "Prevenção: 3 frentes (K2)",
        desc: "Impedir introdução (QA), fuga (phase containment) e recorrência (RCA). Responsabilidade de toda a equipe; TA traz conhecimento de domínio e análise.",
      },
      en: {
        kw: "Prevention: 3 Fronts (K2)",
        desc: "Prevent introduction (QA), escape (phase containment) and recurrence (RCA). Whole team responsibility; TA brings domain knowledge and analysis.",
      },
    },
  },
  {
    id: "syl-ta-502",
    cert: "ctal-ta",
    ch: 5,
    d: "analyst",
    locales: {
      pt: {
        kw: "Modelos + revisões na contenção (K3)",
        desc: "Usar um MODELO do objeto p/ achar defeitos em especificação (diagramas revelam inconsistências); aplicar técnica de revisão à base de teste.",
      },
      en: {
        kw: "Models + Reviews in Containment (K3)",
        desc: "Use a MODEL of the object to find specification defects (diagrams reveal inconsistencies); apply a review technique to the test basis.",
      },
    },
  },
  {
    id: "syl-ta-503",
    cert: "ctal-ta",
    ch: 5,
    d: "analyst",
    locales: {
      pt: {
        kw: "Resultados → melhorias (K4) + classificação → RCA (K2)",
        desc: "Terceiro K4: analisar resultados p/ melhorar a DETECÇÃO (técnicas, áreas, dados). Classificação de defeitos por tipo alimenta a causa-raiz e impede recorrência.",
      },
      en: {
        kw: "Results → Improvements (K4) + Classification → RCA (K2)",
        desc: "Third K4: analyze results to improve DETECTION (techniques, areas, data). Defect classification by type feeds root cause analysis and prevents recurrence.",
      },
    },
  },
];

export function localizedFlashcard(card, lang = "pt") {
  const loc = card.locales[lang] || card.locales.pt;
  return { id: card.id, cert: card.cert, ch: card.ch, d: card.d, ...loc };
}

export function flashcardsInLang(lang = "pt") {
  return FLASHCARDS.map((c) => localizedFlashcard(c, lang));
}

/** r14: flashcards escopados por certificação (campo explícito `cert`). */
export function flashcardsForCert(lang = "pt", certId) {
  return flashcardsInLang(lang).filter((c) => c.cert === certId);
}

export function localizedSyllabusItem(item, lang = "pt") {
  const loc = item.locales[lang] || item.locales.pt;
  return { id: item.id, cert: item.cert, ch: item.ch, d: item.d, ...loc };
}

export function syllabusInLang(lang = "pt") {
  return SYLLABUS_ITEMS.map((i) => localizedSyllabusItem(i, lang));
}

/** r14: itens de syllabus escopados por certificação. */
export function syllabusForCert(lang = "pt", certId) {
  return syllabusInLang(lang).filter((i) => i.cert === certId);
}
