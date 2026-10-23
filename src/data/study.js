// Conteúdo de estudo — Flashcards + itens de Syllabus.
//
// Arquitetura (r14): cada item carrega `cert` ("ctfl" | "ctal-ta" | "ctal-tm") + `ch`
// (número do capítulo, 1–6 CTFL / 1–5 CTAL-TA / 1–3 CTAL-TM). O campo `d` (domínio) é
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

  /* ─────────── CTAL-TM v3.0 (r19 — 21 cards, ids fc-tm-*) ───────────
     Fonte: ISTQB CTAL-TM v3.0 Syllabus (2024/05/03, istqb.org) — Managing
     the Test Activities / Managing the Product / Managing the Team.
     Distribuição por capítulo proporcional ao peso oficial do exame
     (cap1 26/50 questões · cap2 15/50 · cap3 9/50). */
  /* ─────────── Capítulo 1 — Managing the Test Activities (11 cards) ─────────── */
  // 1.1 The Test Process
  {
    id: "fc-tm-101",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Planejamento de teste: as 5 tarefas",
        back: "Iniciar o mais cedo possível (ideal: antes dos requisitos); iterativo, com replanejamento:\n1. Compreender o contexto e organizar o planejamento (política e estratégia organizacionais, escopo, item de teste; aprovação dos stakeholders)\n2. Identificar e analisar os riscos de produto\n3. Identificar as abordagens de tratamento de risco (preventiva, corretiva, mitigadora)\n4. Definir a abordagem de teste + estimar e alocar recursos (equipe, ferramentas, ambientes, dados)\n5. Estabelecer o plano — aceito por TODOS os stakeholders (divergências resolvidas)\nISO/IEC/IEEE 29119-2 cobre esses processos (níveis projeto, programa, portfólio)",
      },
      en: {
        front: "Test planning: the 5 tasks",
        back: "Start as early as possible (ideally before requirements); iterative, with re-planning:\n1. Understand the context and organize test planning (org policy and strategy, scope, test item; stakeholder approval)\n2. Identify and analyze product risks\n3. Identify risk treatment approaches (preventive, corrective, mitigating)\n4. Define the test approach + estimate and allocate resources (staff, tools, environments, data)\n5. Establish the plan — accepted by ALL stakeholders (disagreements settled)\nISO/IEC/IEEE 29119-2 covers these processes (project, program, portfolio levels)",
      },
    },
  },
  {
    id: "fc-tm-102",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Monitoramento × Controle de teste",
        back: "MONITORAMENTO: coletar e registrar resultados, identificar desvios do planejado, identificar e analisar riscos novos, monitorar mudanças nos riscos conhecidos\nCONTROLE: comparar o progresso real com o plano e agir — implementar o plano e as diretivas, gerenciar desvios, tratar riscos novos/alterados, confirmar a prontidão para iniciar, conceder/obter aprovação da conclusão com base nos critérios de saída\nDiretivas típicas: repriorizar testes (risco virou problema), reavaliar critérios de entrada/saída após retrabalho, ajustar cronograma, adicionar recursos\nAmbos são atividades CONTÍNUAS; o controle realimenta o replanejamento",
      },
      en: {
        front: "Test Monitoring vs. Test Control",
        back: "MONITORING: collect and record results, identify deviations from plan, identify and analyze new risks, monitor changes in known risks\nCONTROL: compare actual progress against the plan and act — implement the plan and directives, manage deviations, treat new/changed risks, establish readiness to begin testing, grant/obtain completion approval based on exit criteria\nTypical directives: re-prioritize tests (risk became an issue), re-evaluate entry/exit criteria after rework, adjust the schedule, add resources\nBoth are ONGOING activities; control feeds back into re-planning",
      },
    },
  },
  {
    id: "fc-tm-103",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Conclusão do teste: as 5 tarefas",
        back: "Ocorre em marcos (release, fim de iteração, fim de nível); defeitos sem solução viram change requests ou itens do product backlog:\n1. Criar e aprovar o relatório de conclusão (consolida planos, resultados, relatórios de progresso e defeitos)\n2. Arquivar o testware no gerenciamento de configuração (casos para reuso; resultados, logs e relatórios temporariamente)\n3. Entregar o testware a quem precisa (defeitos adiados/aceitos comunicados)\n4. Limpar e restaurar o ambiente ao estado predefinido (dados, ferramentas, drivers, stubs, scripts)\n5. Levantar lições aprendidas (retrospectivas; pode cobrir o SDLC inteiro)",
      },
      en: {
        front: "Test completion: the 5 tasks",
        back: "Occurs at milestones (release, iteration end, test level completion); unresolved defects become change requests or product backlog items:\n1. Create and approve the test completion report (consolidates plans, results, progress reports, defects)\n2. Archive testware in configuration management (cases for reuse; results, logs, reports temporarily)\n3. Hand over testware to those who need it (deferred/accepted defects communicated)\n4. Clean and restore the environment to a pre-defined state (data, tools, drivers, stubs, scripts)\n5. Capture lessons learned (retrospectives; may cover the whole SDLC)",
      },
    },
  },
  // 1.2 The Context of Testing
  {
    id: "fc-tm-104",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Matriz poder-interesse: os 4 quadrantes",
        back: "PROMOTORES (influência ALTA, interesse ALTO): colaboradores-chave — moldam a estratégia e o plano de teste\nLATENTES (influência alta, interesse baixo): decisões de alocação de recursos e direção; sem interesse no dia a dia\nDEFENSORES (influência baixa, interesse alto): feedback qualitativo — manter engajados com updates e discussões específicas\nAPÁTICOS (influência baixa, interesse baixo): informar em marcos significativos; consultar em temas pontuais traz insights\nA matriz: aproveita a expertise, apoia a gestão de riscos (interesse + influência → mitigação proativa) e valoriza perspectivas diversas",
      },
      en: {
        front: "Power-interest matrix: the 4 quadrants",
        back: "PROMOTERS (HIGH influence, HIGH interest): key collaborators — shape the test strategy and plan\nLATENTS (high influence, low interest): resource allocation and high-level direction decisions; no day-to-day interest\nDEFENDERS (low influence, high interest): qualitative feedback — keep engaged with regular updates and specific discussions\nAPATHETICS (low influence, low interest): update on major milestones; seeking their input on specific issues yields insights\nThe matrix: leverages expertise, supports risk management (interest + influence → proactive mitigation), values diverse perspectives",
      },
    },
  },
  {
    id: "fc-tm-105",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Sequencial × iterativo + modelo híbrido",
        back: "SEQUENCIAL (ex.: V-model) × ITERATIVO (ex.: Scrum):\n• Estimativa: detalhada e precoce por nível × iterativa, no planning das histórias\n• Testware: estratégia, plano, casos, cronograma × critérios de aceitação e DoD (documentação mínima)\n• Papéis: gerente de teste dedicado × papéis integrados; facilitador/coach substitui o TM\n• Ferramentas: gestão por fases × CI/CD e automação centrais (teste contínuo)\n• Abordagem e automação: agendada por fases × embutida nas iterações; regressão automatizada no CI/CD\n• Relatório e métricas: por marcos × contínuo com dashboards em tempo real; + velocidade e burndown\nHÍBRIDO — por quê: transição para o Agile ou fit for purpose (adequação ao propósito, ex.: projeto de alto risco); o quê: avaliar a capacidade da equipe de transitar, combinar estrutura + flexibilidade, scrum-of-scrums de testadores, rastrear esforços e casos dentro dos sprints",
      },
      en: {
        front: "Sequential vs. iterative + hybrid model",
        back: "SEQUENTIAL (e.g., V-model) vs. ITERATIVE (e.g., Scrum):\n• Estimation: early, detailed per level × iterative, part of story planning\n• Testware: strategy, plan, cases, schedule × acceptance criteria and DoD; minimal documentation\n• Roles: dedicated test manager × integrated roles; facilitator/coach replaces the TM\n• Tools: phase-based test management × CI/CD and automation central (continuous testing)\n• Approach and automation: scheduled per phase × embedded in iterations; automated regression in CI/CD\n• Reporting and metrics: milestone-based × continuous with real-time dashboards; + velocity and burndown\nHYBRID — why: transition to Agile or fit for purpose (e.g., high-risk project); what: assess the team's ability to switch, combine structure + flexibility, testers' scrum-of-scrums, track effort and cases within sprints",
      },
    },
  },
  // 1.3 Risk-Based Testing
  {
    id: "fc-tm-106",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "TBR: identificação e avaliação de riscos",
        back: "TBR = identificação + avaliação + monitoramento + mitigação de riscos dirigindo o teste; quanto maior o nível → testar mais cedo, mais intenso e prolongado\nIDENTIFICAÇÃO (o TM colhe dos stakeholders; amostra mais ampla possível; lista acordada com o PM): entrevistas com especialistas, avaliações independentes, retrospectivas, workshops de risco, brainstorming, checklists, experiência passada\nAVALIAÇÃO: nível de risco = PROBABILIDADE (complexidade de tecnologia/arquitetura, imaturidade, pessoal, conflitos, fornecedores, distribuição, liderança fraca, pressões, falta de QA cedo, mudanças frequentes) × IMPACTO (frequência de uso, criticidade, reputação, receita, perdas financeiras/legais, integrações, sem contorno, segurança)\nDados estatisticamente válidos → quantitativo; senão qualitativo: escalas ordinais combinadas em MATRIZ DE RISCO (classificação relativa)",
      },
      en: {
        front: "RBT: risk identification and assessment",
        back: "RBT = identification + assessment + monitoring + mitigation of risks driving testing; higher level → test earlier, more intensely, longer\nIDENTIFICATION (TM gathers from stakeholders; broadest sample; list agreed with PM): expert interviews, independent assessments, retrospectives, risk workshops, brainstorming, checklists, past experience\nASSESSMENT: risk level = LIKELIHOOD (technology/architecture complexity, immaturity, personnel, conflict, suppliers, distribution, weak leadership, pressures, no early QA, high change rates) × IMPACT (frequency of use, criticality, reputation, revenue, financial/legal losses, integration, no workaround, safety)\nStatistically valid data → quantitative; otherwise qualitative: ordinal scales combined in a RISK MATRIX (relative rating)",
      },
    },
  },
  {
    id: "fc-tm-107",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "TBR: mitigação e priorização (K4)",
        back: "Esforço/tempo PROPORCIONAL ao risco: alto → começar cedo, técnicas mais rigorosas, pessoas mais qualificadas; baixo → mais tarde, menos rigor\nAnalisar: itens de teste (rigor não uniforme no objeto), características de qualidade, níveis e tipos (estático, dinâmico ou ambos), SDLC (critérios de entrada), requisitos regulatórios (IEC 61508 prescreve técnicas e cobertura)\nO nível também influencia: revisões de work products, independência e extensão da regressão\nOutras medidas de tratamento: plano de contingência (contornos), transferência (fornecedor), aceitação\nDEPTH-FIRST: ordem estritamente decrescente de risco (mitigar os maiores o quanto antes); com o tempo apertando, trocar para BREADTH-FIRST (≥1 teste por risco com prioridade máxima — visão geral da qualidade)\nTempo esgotado sem executar tudo → recomendação justificada: estender o teste ou aceitar o risco residual (reportar progresso como risco residual apoia a decisão de release)",
      },
      en: {
        front: "RBT: mitigation and prioritization (K4)",
        back: "Effort/time PROPORTIONAL to risk: high → start early, more rigorous techniques, most qualified people; low → later, less rigor\nAnalyze: test items (non-uniform rigor within the object), quality characteristics, levels and types (static, dynamic, or both), SDLC (entry criteria), regulatory requirements (IEC 61508 prescribes techniques and coverage)\nLevel also drives: work product reviews, independence, extent of regression\nOther treatment measures: contingency plan (workarounds), transfer (vendor), acceptance\nDEPTH-FIRST: strict descending risk order (mitigate the highest ASAP); as time gets tight, switch to BREADTH-FIRST (≥1 test per risk at top priority — overall quality view)\nTime consumed without running everything → justified recommendation: extend testing or accept residual risk (reporting progress as residual risk supports release decisions)",
      },
    },
  },
  {
    id: "fc-tm-108",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Técnicas de TBR: pesadas × leves",
        back: "PESADAS (formais; procedimentos e documentação detalhados; stakeholders amplos; fatores detalhados + fórmulas; sistemas críticos à segurança):\n• Análise de perigo — identifica os perigos por trás de cada risco\n• Custo da exposição — probabilidade de falha + custo da perda típica + custo de testar\n• FMEA (e variantes) — riscos, causas e efeitos prováveis; severidade, prioridade e detecção\n• Análise de árvore de falhas — das falhas para os defeitos que as causam, até as causas-raiz\nLEVES (menos completas; probabilidade + impacto em escala ordinal; grupo menor): SST (exige especificação de requisitos), PRAM e PRISMA (usam requisitos e/ou outras especificações, mas funcionam só com entrada dos stakeholders)\nDificuldades: avaliar o nível (dados históricos), keen beginnings (monitorar e reportar), déjà vu (pessoas certas, mitigar só o importante), riscos-chave perdidos (treinar), stakeholder churn (análise contínua)",
      },
      en: {
        front: "RBT techniques: heavyweight vs. lightweight",
        back: "HEAVYWEIGHT (formal; defined procedures and detailed documentation; broad stakeholders; detailed factors + formulas; safety-critical):\n• Hazard analysis — identifies the hazards underlying each risk\n• Cost of exposure — failure likelihood + cost of a typical loss + cost of testing for it\n• FMEA (and variants) — risks, potential causes, likely effects; severity, priority, detection rates\n• Fault tree analysis — from failures to the defects causing them, down to root causes\nLIGHTWEIGHT (less thorough; likelihood + impact on an ordinal scale; smaller group): SST (requires requirements specs), PRAM and PRISMA (use requirements and/or other specs but can work purely from stakeholder input)\nDifficulties: assessing risk level (historical data), keen beginnings (monitor and report), déjà vu (right people, mitigate only what matters), key risks missed (training), stakeholder churn (ongoing analysis)",
      },
    },
  },
  // 1.4 The Project Test Strategy
  {
    id: "fc-tm-109",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Estratégia de teste do projeto + S.M.A.R.T.",
        back: "Estratégia = como testar naquele contexto para atingir os objetivos; principal resultado do planejamento; documentada no plano de teste (no sequencial e quando contratos/regulações exigem)\nEscolha da ABORDAGEM (níveis, tipos, técnicas, práticas — scriptado, manual, back-to-back) analisando: domínio, objetivos organizacionais e características de qualidade, objetivos/tipo do projeto, recursos, SDLC, interfaces com outros sistemas, disponibilidade de dados de teste\nExemplos: manutenibilidade → análise estática/revisão de código; performance → testes de sistema scriptados; utilidade funcional → aceitação manual colaborativa\nPlanos: por release (plano mestre), por nível, por característica (segurança, performance), por iteração no ágil/híbrido\nS.M.A.R.T. p/ objetivos e critérios de saída: Específico, Mensurável, Atingível, Relevante e Temporal (prazo definido)",
      },
      en: {
        front: "Project test strategy + S.M.A.R.T.",
        back: "Strategy = how to test in that context to meet objectives; main outcome of test planning; documented in the test plan (sequential models and contracts/regulations often require it)\nAPPROACH selection (levels, types, techniques, practices — scripted, manual, back-to-back) by analyzing: domain, organizational goals and quality characteristics, project goals/type, resources, SDLC, interfaces with other systems, test data availability\nExamples: maintainability → static analysis/code review; performance → scripted system tests; functional usefulness → collaborative manual acceptance\nPlans: per release (master test plan), per level, per characteristic (security, performance), per iteration in Agile/hybrid\nS.M.A.R.T. for objectives and exit criteria: Specific, Measurable, Achievable, Relevant, Timely",
      },
    },
  },
  // 1.5 Improving the Test Process
  {
    id: "fc-tm-110",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Melhoria do processo: IDEAL e abordagens",
        back: "Teste costuma responder por 30-40% (pelo menos) dos custos do projeto; melhoria organizacional > projeto, mas funciona nos dois\nIDEAL (baseado no PDCA; organizacional ou projeto/equipe): Iniciar (objetivos e escopo acordados) → Diagnosticar (avaliar o processo atual) → Estabelecer (plano de melhoria priorizado por ROI/risco/benefícios) → Agir (treinar, pilotar, implantar) → Aprender (verificar benefícios; só então o próximo ciclo)\nMODEL-BASED (compara com melhores práticas externas): TMMi (5 níveis de maturidade; áreas de processo e metas por nível) e TPI NEXT (16 áreas-chave × 4 níveis; checkpoints; matriz de maturidade)\nANALÍTICA (dados do próprio projeto; combinável com a model-based): causa-raiz (Ishikawa/fishbone sobre clusters de defeitos), métricas/indicadores (eficácia, eficiência, previsibilidade), GQM (objetivo → perguntas → métricas)\nRETROSPECTIVA (5 passos): introdução → coletar dados → derivar melhorias → decidir ações (poucas!) → fechar; no sequencial integra a conclusão; no ágil, a cada iteração",
      },
      en: {
        front: "Process improvement: IDEAL and approaches",
        back: "Testing often accounts for at least 30-40% of project costs; organizational improvement > project level, but both work\nIDEAL (based on PDCA; organizational or project/team): Initiating (objectives and scope agreed) → Diagnosing (assess the current process) → Establishing (improvement plan prioritized by ROI/risk/benefits) → Acting (train, pilot, deploy) → Learning (verify benefits; only then the next cycle)\nMODEL-BASED (compares to external best practices): TMMi (5 maturity levels; process areas and goals per level) and TPI NEXT (16 key areas × 4 levels; checkpoints; maturity matrix)\nANALYTICAL (data from the project itself; combinable with model-based): root cause analysis (Ishikawa/fishbone on defect clusters), metrics/indicators (effectiveness, efficiency, predictability), GQM (goal → questions → metrics)\nRETROSPECTIVE (5 steps): introduction → collect data → derive improvements → decide actions (few!) → close; in sequential it is part of test completion; in Agile, every iteration",
      },
    },
  },
  // 1.6 Test Tools
  {
    id: "fc-tm-111",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        front: "Ferramentas: tipos, introdução, ROI e ciclo de vida",
        back: "3 tipos de ferramentas de negócio: comercial, código aberto, custom\nSELEÇÃO: oportunidades de melhoria, compatibilidade com as tecnologias, integração técnica e organizacional no SDLC, avaliação contra requisitos e critérios objetivos, avaliar fornecedor/suporte, requisitos internos de treinamento, prós/contras das licenças → PoC por último\nADOÇÃO: projeto piloto, adaptar processos E ferramenta, diretrizes de uso, treinamento/coaching/mentoria, rollout incremental, coletar dados do uso real, definir o DONO\nROI — não recorrentes (requisitos, avaliação+PoC, aquisição, diretrizes, treinamento inicial, integração, hardware) × recorrentes (licenças/suporte, manutenção, treinamento contínuo, portabilidade) + custos de oportunidade; riscos: imaturidade, mudança de política do fornecedor, custos maiores e benefícios menores que o esperado\nCICLO DE VIDA (4 estágios, administrador nomeado): Aquisição (dono decide convenções) → Suporte e manutenção → Evolução → Aposentadoria (dados preservados/arquivados)\nMétricas por ferramenta: gestão de teste (status por caso), requisitos (rastreabilidade), defeitos (densidade, DDP), análise estática (complexidade), performance (tempos de resposta)",
      },
      en: {
        front: "Tools: types, introduction, ROI and lifecycle",
        back: "3 types of business tools: commercial, open-source, custom\nSELECTION: improvement opportunities, technology compatibility, technical and organizational SDLC integration, evaluation against clear requirements and objective criteria, evaluate vendor/support, internal training requirements, licensing pros/cons → PoC last\nADOPTION: pilot project, adapt processes AND tool, usage guidelines, training/coaching/mentoring, incremental rollout, gather data from actual use, define the OWNER\nROI — non-recurring (requirements, evaluation+PoC, purchase, guidelines, initial training, integration, hardware) × recurring (licensing/support, maintenance, ongoing training, porting) + opportunity costs; risks: immaturity, vendor policy changes, higher costs and lower benefits than expected\nLIFECYCLE (4 stages, administrator appointed): Acquisition (owner decides conventions) → Support and maintenance → Evolution → Retirement (data preserved/archived)\nMetrics per tool: test management (case status), requirements (traceability), defects (density, DDP), static analysis (complexity), performance (response times)",
      },
    },
  },

  /* ─────────── Capítulo 2 — Managing the Product (6 cards) ─────────── */
  // 2.1 Test Metrics
  {
    id: "fc-tm-201",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        front: "Métricas de teste: categorias e uso por atividade",
        back: "O que é medido é feito; métricas = indicadores de se os objetivos de teste foram atingidos\nCategorias: PROJETO (progresso vs critérios de saída — % executado/aprovado/falhou), PRODUTO (atributos vs expectativa de qualidade dos usuários), PROCESSO (capacidade, eficácia e eficiência do teste)\nDefinidas no PLANEJAMENTO alinhadas aos objetivos da estratégia; cada métrica: definida, medida, monitorada, reportada\nMONITORAMENTO/CONTROLE: progresso das atividades (relatório de progresso — ex.: % de casos por status, estimativa e custo reais vs planejados)\nCONCLUSÃO: atingimento dos objetivos e critérios de saída (relatório de conclusão — ex.: coberturas de requisitos e de risco de produto, defeitos resolvidos vs acumulados)\nEficácia de detecção: DDP (defect detection percentage)",
      },
      en: {
        front: "Test metrics: categories and use per activity",
        back: "What gets measured gets done; metrics = indicators of whether test objectives were met\nCategories: PROJECT (progress vs exit criteria — % executed/passed/failed), PRODUCT (attributes vs users' quality expectations), PROCESS (test process capability, effectiveness, efficiency)\nDefined in PLANNING aligned with the strategy's objectives; each metric: defined, measured, monitored, reported\nMONITORING/CONTROL: activity progress (progress report — e.g., % cases by status, actual vs planned estimate and cost)\nCOMPLETION: achievement of objectives and exit criteria (completion report — e.g., requirements and product risk coverage, resolved vs accumulated defects)\nDetection effectiveness: DDP (defect detection percentage)",
      },
    },
  },
  {
    id: "fc-tm-202",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        front: "Relatórios de teste por audiência (K4)",
        back: "Objetivo: entendimento IMEDIATO para a gestão — reportar como snapshot ou tendência (evolução no tempo)\nNíveis altos (sistema, integração de sistemas, aceitação, segurança): base de teste = requisitos, casos de uso, histórias, riscos de produto; cobertura ESTRUTURAL é mais aplicável nos níveis baixos (instrução no componente, interface na integração de componentes)\n100% de cobertura estrutural nos níveis baixos NÃO elimina defeitos e riscos nos níveis altos\nPOR OBJETIVO — riscos: % com todos os testes aprovados / com falhas / ainda não testados; defeitos: resolvidos vs acumulados + quebras por item, origem, release, nível/iteração de introdução-detecção-remoção, severidade/prioridade, causa-raiz, status; progresso: planejados-implementados-executados-aprovados-falhos-bloqueados-pulados + horas reais vs planejadas; cobertura: requisitos, risco, código; custos: risco residual dos não testados + custo real vs planejado\nCombinar categorias (tendência de defeitos abertos × testes executados); poucos defeitos novos + critérios de saída acordados → decidir ENCERRAR",
      },
      en: {
        front: "Test reporting by audience (K4)",
        back: "Goal: IMMEDIATE understanding for management — report as a snapshot or a trend (evolution over time)\nHigher levels (system, system integration, acceptance, security): test basis = requirements, use cases, user stories, product risks; STRUCTURAL coverage is more applicable at lower levels (statement at component, interface at component integration)\n100% structural coverage at low levels does NOT eliminate defects and risks at higher levels\nBY PURPOSE — risks: % with all tests passed / with failures / not yet fully tested; defects: resolved vs accumulated + breakdowns by item, source, release, level/iteration of introduction-detection-removal, severity/priority, root cause, status; progress: planned-implemented-executed-passed-failed-blocked-skipped + actual vs planned hours; coverage: requirements, risk, code; costs: residual risk of untested components + actual vs planned cost\nCombine categories (open defect trend × executed tests); few new defects + agreed exit criteria → decide to STOP",
      },
    },
  },
  // 2.2 Test Estimation
  {
    id: "fc-tm-203",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        front: "Estimativa de teste: o quê e fatores",
        back: "ESFORÇO (horas-pessoa ou story points; esforço ≠ duração), TEMPO (dias corridos e úteis; marcos e prazo), CUSTO (orçamento: recursos, ferramentas, infraestrutura) — triângulo tempo-custo-qualidade: valores interdependentes\nFATORES DO ESFORÇO:\n• Produto: qualidade da base de teste, tamanho do objeto, complexidade do domínio, requisitos de qualidade (segurança, confiabilidade)\n• Processo de desenvolvimento: estabilidade/maturidade, modelo (ágil/iterativo/híbrido), automação, ferramentas e ambientes\n• Pessoas: satisfação (feriados, férias), skills e experiência (projetos e domínio)\n• Resultados do teste: nº e severidade dos defeitos, retrabalho\n• Contexto: distribuição entre unidades, localização, complexidade, tipo de trabalho (virtual/presencial)\nPremissas SEMPRE documentadas como parte da estimativa; atualizar com nova informação; dados históricos apoiam",
      },
      en: {
        front: "Test estimation: what and factors",
        back: "EFFORT (person hours or story points; effort ≠ duration), TIME (calendar and working days; milestones and deadline), COST (budget: resources, tools, infrastructure) — time-cost-quality triangle: interdependent values\nEFFORT FACTORS:\n• Product: test basis quality, size of the test object, domain complexity, quality characteristic requirements (security, reliability)\n• Development process: stability/maturity, model (Agile/iterative/hybrid), automation, tools and environments\n• People: satisfaction (holidays, vacation), skills and experience (projects and domain)\n• Test results: number and severity of defects, rework\n• Context: distribution across subsidiaries, location, complexity, type of work (virtual/on-site)\nAssumptions ALWAYS documented as part of the estimate; update with new information; historical data helps",
      },
    },
  },
  {
    id: "fc-tm-204",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        front: "Técnicas de estimativa e seleção (K4)",
        back: "Duas famílias: BASEADA EM MÉTRICAS (dados históricos: razões, extrapolação) × BASEADA EM ESPECIALISTAS (Delphi, Wideband Delphi, planning poker)\nPrática comum: estimar o nº de casos derivados da base de teste (decomposição bottom-up das tarefas)\nCritérios de seleção:\n• Erro da estimativa — três pontos (otimista, provável, pessimista) dá valor esperado + desvio-padrão\n• Disponibilidade de dados — razões e extrapolação exigem histórico confiável\n• Disponibilidade de especialistas — Delphi e planning poker dependem deles\n• Conhecimento de modelagem — extrapolação e três pontos usam fórmulas\n• Restrições de tempo — planning poker é rápido; extrapolação é mais difícil\nDicas: complexidade baixa → métricas; alta → especialistas; sequencial → Wideband Delphi; ágil → planning poker; estimativa entregue à gestão com justificativa (parâmetros mudam → reajustar)",
      },
      en: {
        front: "Estimation techniques and selection (K4)",
        back: "Two families: METRIC-BASED (historical data: ratios, extrapolation) vs. EXPERT-BASED (Delphi, Wideband Delphi, planning poker)\nCommon practice: estimate the number of test cases derived from the test basis (bottom-up task decomposition)\nSelection criteria:\n• Estimation error — three-point (optimistic, likely, pessimistic) yields expected value + standard deviation\n• Data availability — ratios and extrapolation need reliable history\n• Expert availability — Delphi and planning poker rely on them\n• Modeling knowledge — extrapolation and three-point use formulas\n• Time constraints — planning poker is quick; extrapolation is harder\nTips: low complexity → metrics; high → experts; sequential → Wideband Delphi; Agile → planning poker; deliver the estimate to management with justification (parameters change → adjust)",
      },
    },
  },
  // 2.3 Defect Management
  {
    id: "fc-tm-205",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        front: "Gerenciamento de defeitos: o fluxo de trabalho",
        back: "Teste ESTÁTICO procura defeitos; DINÂMICO revela por falha (anomalia = discrepância real × esperado; falso-negativo = o tester não observa a anomalia)\nTeste que falha nem sempre gera relatório (ex.: TDD — os testes falham por design até o desenvolvimento terminar)\nFluxo simples: ABERTO (novo) → EM ANDAMENTO → [REJEITADO (inválido, teste errado, duplicado — com motivo)] → RESOLVIDO (corrigido, pronto para o reteste → teste de confirmação segue os passos do relatório) → FECHADO (terminal, após confirmação bem-sucedida ou aceite da rejeição)\nExtensões comuns: REABERTO, ACEITO, ESCLARECIMENTO, ADIADO\nBoas práticas: definir organizacional; duplicatas/falsos-positivos com estado próprio ou motivo; UM terminal com motivo de fechamento; nomes consistentes com outras entidades (histórias, tarefas); estados consecutivos sob papéis DIFERENTES; >1 transição de saída por estado; atributos mínimos\nDetectar e remover na MESMA fase (contenção de fase) minimiza o custo da qualidade",
      },
      en: {
        front: "Defect management: the workflow",
        back: "STATIC testing searches for defects; DYNAMIC reveals them via failure (anomaly = actual vs expected discrepancy; false-negative = the tester does not observe the anomaly)\nA failed test does not always create a report (e.g., TDD — tests fail by design until development is complete)\nSimple workflow: OPEN (new) → IN PROGRESS → [REJECTED (invalid, wrong test, duplicate — with reason)] → RESOLVED (fixed, ready for retest → confirmation test follows the report's steps) → CLOSED (terminal, after successful confirmation or acknowledging rejection)\nCommon extensions: RE-OPENED, ACCEPTED, CLARIFICATION, DEFERRED\nGood practices: define organization-wide; duplicates/false-positives with their own state or reason; ONE terminal state with closure reason; names consistent with other entities (stories, tasks); consecutive states under DIFFERENT roles; >1 outgoing transition per state; minimal attributes\nDetecting and removing in the SAME phase (phase containment) minimizes cost of quality",
      },
    },
  },
  {
    id: "fc-tm-206",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        front: "Defeitos: comitê, ágil, híbrido e melhoria",
        back: "COMITÊ de gerenciamento de defeitos (cross-functional: TM, desenvolvimento, fornecedores, gestão do projeto/produto) decide corrigir (e qual equipe)/rejeitar/adiar na REUNIÃO DE TRIAGEM, pesando benefícios, riscos e custos; ferramenta NÃO substitui comunicação — as duas são necessárias\nÁGIL (leve; sem relatório quando se resolve conversando): relatório QUANDO bloqueia o sprint sem correção imediata na equipe, não se resolve na iteração (regra comum: mesmo dia), depende de outra equipe, depende de fornecedor, ou pedido explícito; não resolvido → product backlog; formalidade conforme co-localização, fusos, nº de equipes, maturidade, tamanho, riscos do produto, regulação\nHÍBRIDO: sincronizar ferramentas (ideal: uma só; prática: sincronização automática), POs nas reuniões (mais frequentes, podem ser mais curtas), plano único alinhado + transparência via dashboards/backlog\nMELHORIA com os dados: fases de introdução/detecção/remoção (contenção + custo da qualidade), causa-raiz, clusters (riscos técnicos, refactoring), reabertos (debugging), duplicatas/rejeitados (qualidade do relatório)",
      },
      en: {
        front: "Defects: committee, Agile, hybrid and improvement",
        back: "DEFECT MANAGEMENT COMMITTEE (cross-functional: TM, development, suppliers, project/product management) decides to fix (and which team)/reject/defer in the TRIAGE MEETING, weighing benefits, risks and costs; a tool is NOT a substitute for communication — both are needed\nAGILE (lightweight; no report when it can be resolved by talking): create a report WHEN it blocks sprint activities without an immediate in-team fix, cannot be resolved within the iteration (common rule: same day), depends on another team, depends on a supplier, or explicitly requested; unresolved → product backlog; formality per co-location, time zones, number of teams, maturity, size, product risks, regulation\nHYBRID: synchronize tools (ideal: one; practice: automatic sync), POs in the meetings (more frequent, may be shorter), one aligned project plan + transparency via dashboards/backlog\nIMPROVEMENT with the data: phases of introduction/detection/removal (containment + cost of quality), root causes, clusters (technical risks, refactoring), re-opened (debugging quality), duplicates/rejected (report quality)",
      },
    },
  },

  /* ─────────── Capítulo 3 — Managing the Team (4 cards) ─────────── */
  // 3.1 The Test Team
  {
    id: "fc-tm-301",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        front: "As 4 áreas de competência (+ skills por atividade)",
        back: "PROFISSIONAL: tarefas especializadas — técnicas de teste, expertise tecnológica e de negócio, gestão de projetos\nMETODOLÓGICA: gerais, independentes do domínio, para tarefas complexas/novas — analíticas, conceituais, julgamento\nSOCIAL: comunicação, cooperação, gestão de conflitos (intra e intercultural) — adaptabilidade, assertividade\nPESSOAL: autogestão, autorresponsabilidade, receber críticas, confiabilidade, resiliência, disciplina, abertura a mudanças, disposição para ajudar/aprender e delegar\nPor atividade (K4): planejamento → conceitual; monitoramento/controle → gestão de projetos; análise → analíticas; design → técnicas + conceitual; implementação → julgamento + técnica; execução → técnica; conclusão → comunicação + responsabilidade\nÁgil exige MAIS competência social que o sequencial documental; equipe autogerida, mais autogestão e disciplina; hierárquica, o líder delega",
      },
      en: {
        front: "The 4 areas of competence (+ skills per activity)",
        back: "PROFESSIONAL: specialized tasks — test techniques, technological and business expertise, project management\nMETHODOLOGICAL: general, domain-independent, for complex/novel tasks — analytical, conceptual, judgment\nSOCIAL: communication, cooperation, conflict management (intra and intercultural) — adaptability, assertiveness\nPERSONAL: self-management, personal responsibility, taking criticism, reliability, resilience, discipline, openness to change, willingness to help/learn, delegation\nPer activity (K4): planning → conceptual; monitoring/control → project management; analysis → analytical; design → techniques + conceptual; implementation → judgment + technical; execution → technical; completion → communication + responsibility\nAgile demands MORE social competence than document-centric sequential; self-organized team, more self-management and discipline; hierarchical, the leader delegates",
      },
    },
  },
  {
    id: "fc-tm-302",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        front: "Avaliar e desenvolver skills + Tuckman",
        back: "AVALIAR: matriz de habilidades (exigidas × disponíveis); Belbin (equipes eficazes misturam tipos de papel/personalidade), DISG, PCM; demonstrando tarefas típicas (esboçar estratégia e discutir feedback, revisar a base e comunicar achados, escolher técnicas, aplicar técnicas, escrever relatório de conclusão) + certificações, experiência, diplomas; no ágil: retrospectivas e feedback\nDESENVOLVER: treinamento (conhecimento predefinido), autoestudo, aprendizado entre pares, mentoria/coaching (individuais), treinamento no trabalho (mistura)\nProfissional/metodológica ← treinamento + autoestudo (ex.: ISTQB); social/pessoal ← treinamento + coaching (troca social, feedback e reflexão são os fatores-chave)\nLÍDER: planejar, monitorar, controlar, reportar + conhecimento de teste (abordagens, estratégias, técnicas, SDLC); resiliência, delegar, ser aceito pela equipe, afirmar os interesses do teste\nTUCKMAN: Forming (ajudar a entrar) → Storming (resolver conflitos) → Norming (disciplina e valores acordados) → Performing (delegar responsabilidade) → Adjourning (valorizar quem sai)",
      },
      en: {
        front: "Assess and develop skills + Tuckman",
        back: "ASSESS: skills matrix (required vs available); Belbin (effective teams mix role/personality types), DISG, PCM; demonstrating typical test tasks (outline a strategy and discuss feedback, review the test basis and communicate findings, choose techniques, apply techniques, write a completion report) + certifications, experience, degrees; in Agile: retrospectives and feedback\nDEVELOP: training (predefined knowledge), self-study, peer learning, mentoring/coaching (individual), training on the job (a mix)\nProfessional/methodological ← training + self-study (e.g., ISTQB); social/personal ← training + coaching (social exchange, feedback and reflection are the key success factors)\nLEADER: plan, monitor, control, report + test knowledge (approaches, strategies, techniques, SDLC); resilience, delegation, being accepted by the team, asserting test interests\nTUCKMAN: Forming (help members join) → Storming (resolve conflicts) → Norming (discipline and agreed values) → Performing (delegate responsibility) → Adjourning (appreciation with departing members)",
      },
    },
  },
  {
    id: "fc-tm-303",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        front: "Herzberg: motivadores × fatores de higiene",
        back: "MOTIVADORES (percebidos conscientemente; geram crescimento e satisfação):\n• Reconhecimento e apreciação pelo trabalho (incentivos, abordagem individual)\n• Maior responsabilidade e autonomia (ex.: definir os processos de teste da equipe)\n• Tarefas interessantes, significativas e desafiadoras (ex.: escolher e introduzir uma nova ferramenta)\n• Evolução e desenvolvimento profissional (tester sênior → gerente de teste, dono do processo)\nFATORES DE HIGIENE (dados como certos; cumpri-los não gera satisfação; se faltam, DESMOTIVAM): remuneração adequada, política de pessoal e estilo de gestão apreciativos, condições de trabalho agradáveis (especificações claras, objetos maduros, defeitos corrigidos, ambiente estável), segurança (emprego e acordos), bons relacionamentos\nPapel do TM: eliminar continuamente os desmotivadores E criar/reforçar os motivadores",
      },
      en: {
        front: "Herzberg: motivators vs. hygiene factors",
        back: "MOTIVATORS (consciously perceived; lead to growth and satisfaction):\n• Recognition and appreciation for the work (incentives, individual approach)\n• Increased responsibility and autonomy (e.g., defining the team's test processes)\n• Interesting, meaningful, challenging tasks (e.g., selecting and introducing a new tool)\n• Professional advancement and development (senior tester → test manager, process owner)\nHYGIENE FACTORS (taken for granted; fulfilling them does not create satisfaction; if missing, they DEMOTIVATE): appropriate remuneration, appreciative personnel policy and management style, pleasant working conditions (unambiguous specifications, mature test objects, fixed defects, stable environment), safety (job and adhered agreements), good relationships\nTM's role: continuously eliminate demotivators AND create/strengthen motivators",
      },
    },
  },
  // 3.2 Stakeholder Relationships
  {
    id: "fc-tm-304",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        front: "Custo da qualidade e custo-benefício do teste",
        back: "4 categorias (Feigenbaum — adotada pelo CTAL-TM; o FL v4 apresenta Boehm):\nPREVENÇÃO DE DEFEITOS (proativas: qualificação dos desenvolvedores, revisão precoce da base, boa comunicação) + AVALIAÇÃO (detecção: teste estático e dinâmico, revisões) = pró-ativas\nFALHA INTERNA (reativas antes da entrega: corrigir defeitos achados no teste, contornos) × FALHA EXTERNA (pós-release, sem valor agregado: perda de receita/ativos/saúde/vida/ambiente, custos legais, teste/implantação/suporte extras, defeitos de campo)\nAvaliação + falha interna costumam ser MUITO menores que a falha externa → teste é extremamente valioso (business case)\nEconomia média por defeito = falha externa − (avaliação + falha interna); ex.: 4.000 − (500 + 200) = 3.300\nBenefícios QUALITATIVOS (reputação, releases previsíveis, confiança, proteção legal) × QUANTITATIVOS (defeitos achados/prevenidos/corrigidos pré-release, riscos conhecidos e documentados, informação para a decisão de go-live)\nCurva de Boehm: quanto mais tarde o defeito é achado, maior o custo → testar cedo; TBR investe esforço proporcional ao risco (nem teste demais, nem de menos)",
      },
      en: {
        front: "Cost of quality and cost-benefit of testing",
        back: "4 categories (Feigenbaum — adopted by CTAL-TM; the FL v4 presents Boehm):\nDEFECT PREVENTION (proactive: developer qualification, early test basis review, good communication) + APPRAISAL (detection: static and dynamic testing, reviews) = proactive\nINTERNAL FAILURE (reactive before delivery: fixing defects found in testing, workarounds) vs. EXTERNAL FAILURE (post-release, non-value-added: loss of revenue/assets/health/life/environment, legal costs, extra testing/deployment/support, field defects)\nAppraisal + internal failure are usually MUCH lower than external failure → testing is extremely valuable (business case)\nAverage savings per defect = external failure − (appraisal + internal failure); e.g., 4,000 − (500 + 200) = 3,300\nQUALITATIVE benefits (reputation, predictable releases, confidence, legal protection) vs. QUANTITATIVE (defects found/prevented/fixed pre-release, known and documented risks, information for go-live decisions)\nBoehm's curve: the later a defect is found, the higher the cost → test early; RBT invests effort proportional to risk (neither too much nor too little testing)",
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

  /* ─────────── CTAL-TM v3.0 (r19 — 18 itens, ids syl-tm-*) ─────────── */
  /* ─────────── Capítulo 1 — Managing the Test Activities (10 itens) ─────────── */
  {
    id: "syl-tm-101",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Processo de teste: planejamento, monitoramento, conclusão (K2)",
        desc: "As 3 atividades que o TM gerencia (o processo completo com análise/design/implementação/execução é do FL v4): 5 tarefas do planejamento, monitoramento × controle contínuos e 5 tarefas da conclusão. ISO/IEC/IEEE 29119-2. 2 questões.",
      },
      en: {
        kw: "Test process: planning, monitoring, completion (K2)",
        desc: "The 3 activities the TM manages (the full process incl. analysis/design/implementation/execution is FL v4): 5 planning tasks, continuous monitoring vs. control, and 5 completion tasks. ISO/IEC/IEEE 29119-2. 2 questions.",
      },
    },
  },
  {
    id: "syl-tm-102",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Stakeholders e matriz poder-interesse (K2)",
        desc: "Interesses por grupo (desenvolvedores, testadores, PM/PO/usuários de negócio, operações, clientes e usuários) e a classificação nos 4 quadrantes — Promotores, Latentes, Defensores, Apáticos (influência × interesse): decore os 4 pares, caem casos de classificação.",
      },
      en: {
        kw: "Stakeholders and the power-interest matrix (K2)",
        desc: "Interests per group (developers, testers, PM/PO/business users, operations, customers and users) and classifying them into the 4 quadrants — Promoters, Latents, Defenders, Apathetics (influence × interest): memorize the 4 pairs; classification scenarios appear.",
      },
    },
  },
  {
    id: "syl-tm-103",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Contexto: híbrido e modelos de SDLC (K2)",
        desc: "Razões do híbrido (transição para o Agile, fit for purpose) + tabela sequencial × iterativo (estimativa, testware, papéis, ferramentas, automação, relatórios, métricas) + atividades de gestão por nível (componente → aceitação) e por tipo (funcional, não funcional, caixa-preta, caixa-branca).",
      },
      en: {
        kw: "Context: hybrid and SDLC models (K2)",
        desc: "Reasons for hybrid (transition to Agile, fit for purpose) + the sequential vs. iterative table (estimation, testware, roles, tools, automation, reporting, metrics) + management activities per level (component → acceptance) and per type (functional, non-functional, black-box, white-box).",
      },
    },
  },
  {
    id: "syl-tm-104",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Analisar o projeto → atividades de gestão (K4)",
        desc: "Dado um cenário, determinar as atividades que enfatizam planejamento (escopo completo, riscos, recursos), monitoramento (execução, ferramentas/ambientes, colaboração) e controle (gestão adaptativa, portões de qualidade). 2 questões K4 — pratique com cenários completos.",
      },
      en: {
        kw: "Analyze the project → management activities (K4)",
        desc: "Given a scenario, determine activities emphasizing planning (comprehensive scope, risks, resources), monitoring (execution, tools/environments, collaboration) and control (adaptive management, quality gates). 2 K4 questions — practice with full scenarios.",
      },
    },
  },
  {
    id: "syl-tm-105",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "TBR: identificação e avaliação (K2)",
        desc: "As 7 técnicas de identificação com a amostra mais ampla de stakeholders; avaliação = probabilidade × impacto (fatores de cada), matriz de risco; quantitativo só com dados estatisticamente válidos, senão ordinal qualitativo.",
      },
      en: {
        kw: "RBT: identification and assessment (K2)",
        desc: "The 7 identification techniques with the broadest stakeholder sample; assessment = likelihood × impact (factors for each), risk matrix; quantitative only with statistically valid data, otherwise qualitative ordinal.",
      },
    },
  },
  {
    id: "syl-tm-106",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "TBR: mitigação pelo nível de risco (K4)",
        desc: "Selecionar atividades proporcionais ao risco: início, rigor da técnica, nível (estático/dinâmico/ambos), equipe mais qualificada nos maiores riscos, regulações (IEC 61508); depth-first × breadth-first; risco residual e a recomendação justificada de estender × aceitar. 2 questões K4.",
      },
      en: {
        kw: "RBT: mitigation by risk level (K4)",
        desc: "Select activities proportional to risk: start point, technique rigor, level (static/dynamic/both), most qualified people on the highest risks, regulations (IEC 61508); depth-first vs. breadth-first; residual risk and the justified recommendation to extend vs. accept. 2 K4 questions.",
      },
    },
  },
  {
    id: "syl-tm-107",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Técnicas de TBR: pesadas × leves (K2)",
        desc: "Pesadas (análise de perigo, custo da exposição, FMEA, árvore de falhas — formais, fórmulas, safety-critical) × leves (SST, PRAM, PRISMA — probabilidade e impacto em escala ordinal). Métricas de sucesso e as 5 dificuldades (keen beginnings, déjà vu, churn de stakeholders...).",
      },
      en: {
        kw: "RBT techniques: heavyweight vs. lightweight (K2)",
        desc: "Heavyweight (hazard analysis, cost of exposure, FMEA, fault tree analysis — formal, formulas, safety-critical) vs. lightweight (SST, PRAM, PRISMA — likelihood and impact on an ordinal scale). Success metrics and the 5 difficulties (keen beginnings, déjà vu, stakeholder churn...).",
      },
    },
  },
  {
    id: "syl-tm-108",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Estratégia do projeto + S.M.A.R.T. (K4/K3)",
        desc: "Fatores da abordagem (domínio, objetivos organizacionais e do projeto, recursos, SDLC, interfaces, dados de teste) — a seleção é K4 (2 questões); S.M.A.R.T. para objetivos e critérios de saída (Específico, Mensurável, Atingível, Relevante, Temporal) é K3 (2 questões).",
      },
      en: {
        kw: "Project strategy + S.M.A.R.T. (K4/K3)",
        desc: "Approach factors (domain, organizational and project goals, resources, SDLC, interfaces, test data) — selection is K4 (2 questions); S.M.A.R.T. for objectives and exit criteria (Specific, Measurable, Achievable, Relevant, Timely) is K3 (2 questions).",
      },
    },
  },
  {
    id: "syl-tm-109",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Melhoria: IDEAL, modelos e retrospectivas (K2/K3)",
        desc: "IDEAL (Iniciar, Diagnosticar, Estabelecer, Agir, Aprender — baseado no PDCA); model-based (TMMi 5 níveis, TPI NEXT 16 áreas-chave) × analítica (causa-raiz, métricas, GQM); implementar a retrospectiva em 5 passos é o K3 do capítulo (2 questões).",
      },
      en: {
        kw: "Improvement: IDEAL, models and retrospectives (K2/K3)",
        desc: "IDEAL (Initiating, Diagnosing, Establishing, Acting, Learning — based on PDCA); model-based (TMMi 5 levels, TPI NEXT 16 key areas) vs. analytical (root cause analysis, metrics, GQM); implementing the 5-step retrospective is the chapter's K3 (2 questions).",
      },
    },
  },
  {
    id: "syl-tm-110",
    cert: "ctal-tm",
    ch: 1,
    d: "manager",
    locales: {
      pt: {
        kw: "Ferramentas de teste (K2/K4)",
        desc: "Tipos (comercial, código aberto, custom); boas práticas de seleção e adoção (piloto, PoC por último, diretrizes, dono); ROI com custos recorrentes × não recorrentes + riscos e benefícios — o plano de seleção é K4 (2 questões); ciclo de vida (aquisição, suporte/manutenção, evolução, aposentadoria) e métricas por ferramenta.",
      },
      en: {
        kw: "Test tools (K2/K4)",
        desc: "Types (commercial, open-source, custom); selection and adoption good practices (pilot, PoC last, guidelines, owner); ROI with recurring vs. non-recurring costs + risks and benefits — the selection plan is K4 (2 questions); lifecycle (acquisition, support/maintenance, evolution, retirement) and per-tool metrics.",
      },
    },
  },

  /* ─────────── Capítulo 2 — Managing the Product (5 itens) ─────────── */
  {
    id: "syl-tm-201",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        kw: "Métricas por atividade de gestão (K2)",
        desc: "Categorias (projeto, produto, processo) e o uso por atividade: definidas no planejamento, progresso no monitoramento/controle, objetivos e critérios de saída na conclusão; exemplos (coberturas, % por status, defeitos resolvidos vs totais, custo, DDP).",
      },
      en: {
        kw: "Metrics per management activity (K2)",
        desc: "Categories (project, product, process) and use per activity: defined in planning, progress in monitoring/control, objectives and exit criteria in completion; examples (coverages, % by status, resolved vs total defects, cost, DDP).",
      },
    },
  },
  {
    id: "syl-tm-202",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        kw: "Relatórios que capacitam decisões (K4)",
        desc: "Analisar resultados para criar relatórios que capacitam stakeholders a decidir: snapshot × tendência, métricas por objetivo (riscos, defeitos, progresso, cobertura, custos), cobertura estrutural nos níveis baixos (100% não elimina riscos nos altos), encerrar quando defeitos caem + critérios acordados. 2 questões K4.",
      },
      en: {
        kw: "Reports that empower decisions (K4)",
        desc: "Analyze results to create reports that empower stakeholders to decide: snapshot vs. trend, metrics by purpose (risks, defects, progress, coverage, costs), structural coverage at low levels (100% does not eliminate risks at high levels), stop when defects fall + agreed criteria. 2 K4 questions.",
      },
    },
  },
  {
    id: "syl-tm-203",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        kw: "Estimativa: fatores e técnicas (K2/K4)",
        desc: "Esforço/tempo/custo (triângulo tempo-custo-qualidade) e os 5 grupos de fatores (produto, processo de desenvolvimento, pessoas, resultados do teste, contexto); baseada em métricas × em especialistas (três pontos, Delphi/Wideband Delphi, planning poker, extrapolação) — a seleção por contexto é K4 (2 questões).",
      },
      en: {
        kw: "Estimation: factors and techniques (K2/K4)",
        desc: "Effort/time/cost (time-cost-quality triangle) and the 5 factor groups (product, development process, people, test results, context); metric-based vs. expert-based (three-point, Delphi/Wideband Delphi, planning poker, extrapolation) — context-driven selection is K4 (2 questions).",
      },
    },
  },
  {
    id: "syl-tm-204",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        kw: "Defeitos: fluxo, comitê, ágil e híbrido (K3/K2)",
        desc: "Workflow (ABERTO → EM ANDAMENTO → RESOLVIDO → FECHADO + REJEITADO etc.) com as boas práticas de desenho — implementá-lo é K3 (2 questões); comitê cross-functional e triagem; quando criar relatório no ágil; desafios do híbrido (ferramentas, priorização com PO, plano alinhado).",
      },
      en: {
        kw: "Defects: workflow, committee, Agile and hybrid (K3/K2)",
        desc: "Workflow (OPEN → IN PROGRESS → RESOLVED → CLOSED + REJECTED etc.) with design good practices — implementing it is K3 (2 questions); cross-functional committee and triage; when to create reports in Agile; hybrid challenges (tools, prioritization with PO, aligned plan).",
      },
    },
  },
  {
    id: "syl-tm-205",
    cert: "ctal-tm",
    ch: 2,
    d: "manager",
    locales: {
      pt: {
        kw: "Dados de defeitos → melhoria (K3)",
        desc: "Obrigatórios no relatório: título, descrição (passos para reproduzir), severidade, prioridade — coletar só o que agrega valor (usar os dados e a classificação é K3, 2 questões); estatísticas para melhoria: fases de introdução/detecção/remoção, causa-raiz, clusters, reabertos, duplicatas/rejeitados.",
      },
      en: {
        kw: "Defect data → improvement (K3)",
        desc: "Mandatory in the report: title, description (steps to reproduce), severity, priority — collect only what adds value (using data and classification is K3, 2 questions); statistics for improvement: phases of introduction/detection/removal, root cause, clusters, re-opened, duplicates/rejected.",
      },
    },
  },

  /* ─────────── Capítulo 3 — Managing the Team (3 itens) ─────────── */
  {
    id: "syl-tm-301",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        kw: "Competências e skills do time (K2/K4)",
        desc: "As 4 áreas (profissional, metodológica, social, pessoal) com exemplos; dado o contexto do projeto, determinar as skills exigidas por atividade de teste é K4 (2 questões): planejamento → conceitual, análise → analítica, execução → técnica, conclusão → comunicação e responsabilidade.",
      },
      en: {
        kw: "Team competences and skills (K2/K4)",
        desc: "The 4 areas (professional, methodological, social, personal) with examples; given the project context, determining required skills per test activity is K4 (2 questions): planning → conceptual, analysis → analytical, execution → technical, completion → communication and responsibility.",
      },
    },
  },
  {
    id: "syl-tm-302",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        kw: "Avaliar, desenvolver e liderar (K2)",
        desc: "Matriz de habilidades, Belbin e a demonstração de tarefas típicas; 5 abordagens de desenvolvimento (treinamento, autoestudo, pares, mentoria/coaching, no trabalho) e o que serve para cada competência; habilidades de gestão e as fases de Tuckman (Forming → Adjourning).",
      },
      en: {
        kw: "Assess, develop and lead (K2)",
        desc: "Skills matrix, Belbin and demonstrating typical tasks; 5 development approaches (training, self-study, peer learning, mentoring/coaching, on the job) and which suits each competence; management skills and Tuckman's phases (Forming → Adjourning).",
      },
    },
  },
  {
    id: "syl-tm-303",
    cert: "ctal-tm",
    ch: 3,
    d: "manager",
    locales: {
      pt: {
        kw: "Motivação, custo da qualidade e custo-benefício (K2/K3)",
        desc: "Herzberg: motivadores × fatores de higiene (exemplos de cada); as 4 categorias de custo da qualidade (prevenção, avaliação, falha interna, falha externa — Feigenbaum); o cálculo do custo-benefício (economia média por defeito) é K3 (2 questões).",
      },
      en: {
        kw: "Motivation, cost of quality and cost-benefit (K2/K3)",
        desc: "Herzberg: motivators vs. hygiene factors (examples of each); the 4 cost of quality categories (prevention, appraisal, internal failure, external failure — Feigenbaum); the cost-benefit calculation (average savings per defect) is K3 (2 questions).",
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
