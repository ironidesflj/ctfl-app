// Glossário ISTQB multi-certificação — conteúdo CTFL e CTAL-TA em PT/EN.
export const GLOSSARY = [
  {
    cert: "ctfl",
    id: "gl-fund-01",
    chapter: 1,
    pt: {
      term: "Defeito",
      def: "Imperfeição em um artefato (código, requisito, documento) que pode causar um comportamento incorreto do sistema. É a manifestação de um erro humano.",
    },
    en: {
      term: "Defect",
      def: "An imperfection in a work product (code, requirement, document) that may cause incorrect system behavior. It is the manifestation of a human error.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-02",
    chapter: 1,
    pt: {
      term: "Erro",
      def: "Ação humana que produz um resultado incorreto, como um mal-entendido de requisito ou um erro de digitação no código. Sinônimo: engano (mistake).",
    },
    en: {
      term: "Error",
      def: "A human action that produces an incorrect result, such as a misunderstood requirement or a coding mistake. Synonym: mistake.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-03",
    chapter: 1,
    pt: {
      term: "Falha",
      def: "Comportamento incorreto e observável do sistema durante a execução, causado por um defeito presente no código ou artefato.",
    },
    en: {
      term: "Failure",
      def: "Observable incorrect behavior of a system during execution, caused by a defect present in the code or artifact.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-04",
    chapter: 1,
    pt: {
      term: "Cobertura",
      def: "O grau em que um conjunto de itens definidos (instruções, decisões, partições, requisitos) foi exercitado por uma suíte de testes, geralmente expresso em percentual.",
    },
    en: {
      term: "Coverage",
      def: "The degree to which a defined set of items (statements, decisions, partitions, requirements) has been exercised by a test suite, usually expressed as a percentage.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-05",
    chapter: 1,
    pt: {
      term: "Oráculo de teste",
      def: "Mecanismo usado para determinar o resultado esperado de um teste, permitindo comparar com o resultado real e decidir se o teste passou ou falhou.",
    },
    en: {
      term: "Test oracle",
      def: "A mechanism used to determine the expected result of a test, enabling comparison with the actual result to decide whether the test passed or failed.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-06",
    chapter: 1,
    pt: {
      term: "Agrupamento de defeitos",
      def: "Princípio de teste segundo o qual um pequeno número de módulos costuma concentrar a maioria dos defeitos de um sistema (defect clustering).",
    },
    en: {
      term: "Defect clustering",
      def: "Testing principle stating that a small number of modules typically contain most of the defects in a system.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-07",
    chapter: 1,
    pt: {
      term: "Paradoxo do pesticida",
      def: "Princípio de teste que descreve como repetir os mesmos casos de teste, sem revisá-los, tende a parar de revelar novos defeitos (pesticide paradox).",
    },
    en: {
      term: "Pesticide paradox",
      def: "Testing principle describing how repeating the same test cases without revising them tends to stop revealing new defects.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-08",
    chapter: 1,
    pt: {
      term: "Testware",
      def: "Conjunto de artefatos produzidos durante o processo de teste: planos, condições, casos, dados, scripts e relatórios.",
    },
    en: {
      term: "Testware",
      def: "The set of artifacts produced during the testing process: plans, conditions, cases, data, scripts, and reports.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-09",
    chapter: 1,
    pt: {
      term: "Base de teste",
      def: "Qualquer artefato (requisitos, design, código, lista de riscos) a partir do qual condições de teste podem ser derivadas.",
    },
    en: {
      term: "Test basis",
      def: "Any artifact (requirements, design, code, risk list) from which test conditions can be derived.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-10",
    chapter: 1,
    pt: {
      term: "Testabilidade",
      def: "Grau em que um artefato de trabalho facilita a sua própria verificação por meio de testes.",
    },
    en: {
      term: "Testability",
      def: "The degree to which a work product facilitates testing of itself.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-11",
    chapter: 1,
    pt: {
      term: "Caso de teste",
      def: "Conjunto de pré-condições, entradas, ações e resultados esperados desenvolvido para verificar a conformidade com um requisito específico.",
    },
    en: {
      term: "Test case",
      def: "A set of preconditions, inputs, actions, and expected results developed to verify compliance with a specific requirement.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fund-12",
    chapter: 1,
    pt: {
      term: "Independência de teste",
      def: "Grau em que o teste é realizado por alguém diferente do autor do artefato, reduzindo o viés cognitivo do autor.",
    },
    en: {
      term: "Test independence",
      def: "The degree to which testing is performed by someone other than the artifact's author, reducing the author's cognitive bias.",
    },
  },

  // Capítulo 2 — Teste ao Longo do Ciclo (10 termos)
  {
    cert: "ctfl",
    id: "gl-proc-01",
    chapter: 2,
    pt: {
      term: "Teste de componente",
      def: "Nível de teste que verifica componentes individuais de forma isolada, geralmente realizado pelo próprio desenvolvedor.",
    },
    en: {
      term: "Component testing",
      def: "A test level that verifies individual components in isolation, typically performed by the developer.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-02",
    chapter: 2,
    pt: {
      term: "Teste de integração",
      def: "Nível de teste que verifica as interfaces e interações entre componentes ou entre sistemas distintos.",
    },
    en: {
      term: "Integration testing",
      def: "A test level that verifies the interfaces and interactions between components or between distinct systems.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-03",
    chapter: 2,
    pt: {
      term: "Teste de sistema",
      def: "Nível de teste que avalia o comportamento e as capacidades do sistema completo e integrado.",
    },
    en: {
      term: "System testing",
      def: "A test level that evaluates the behavior and capabilities of the complete, integrated system.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-04",
    chapter: 2,
    pt: {
      term: "Teste de aceitação",
      def: "Nível de teste que determina se o sistema atende às necessidades do usuário, do negócio ou a requisitos contratuais/regulatórios.",
    },
    en: {
      term: "Acceptance testing",
      def: "A test level that determines whether the system meets user needs, business needs, or contractual/regulatory requirements.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-05",
    chapter: 2,
    pt: {
      term: "Teste funcional",
      def: "Tipo de teste que avalia o que o sistema faz, verificando suas funções em relação aos requisitos funcionais.",
    },
    en: {
      term: "Functional testing",
      def: "A test type that evaluates what the system does, verifying its functions against functional requirements.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-06",
    chapter: 2,
    pt: {
      term: "Teste não funcional",
      def: "Tipo de teste que avalia atributos de qualidade do sistema, como desempenho, usabilidade, segurança e confiabilidade.",
    },
    en: {
      term: "Non-functional testing",
      def: "A test type that evaluates quality attributes of the system, such as performance, usability, security, and reliability.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-07",
    chapter: 2,
    pt: {
      term: "Teste de regressão",
      def: "Tipo de teste que verifica se uma mudança no sistema introduziu efeitos colaterais em áreas previamente funcionais.",
    },
    en: {
      term: "Regression testing",
      def: "A test type that checks whether a change to the system has introduced side effects in previously working areas.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-08",
    chapter: 2,
    pt: {
      term: "Teste de confirmação",
      def: "Re-execução de um caso de teste que falhou anteriormente, para confirmar se a correção do defeito foi bem-sucedida.",
    },
    en: {
      term: "Confirmation testing",
      def: "Re-execution of a previously failed test case to confirm that the defect fix was successful.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-09",
    chapter: 2,
    pt: {
      term: "Shift-left",
      def: "Prática de antecipar atividades de teste para fases mais iniciais do ciclo de desenvolvimento, reduzindo o custo de correção de defeitos.",
    },
    en: {
      term: "Shift-left",
      def: "The practice of moving testing activities to earlier stages of the development lifecycle, reducing the cost of fixing defects.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-proc-10",
    chapter: 2,
    pt: {
      term: "TDD",
      def: "Test-Driven Development. Abordagem em que um teste é escrito antes do código de produção, que é então implementado apenas para fazer o teste passar.",
    },
    en: {
      term: "TDD",
      def: "Test-Driven Development. An approach where a test is written before the production code, which is then implemented just enough to make the test pass.",
    },
  },

  // Capítulo 3 — Teste Estático (8 termos)
  {
    cert: "ctfl",
    id: "gl-est-01",
    chapter: 3,
    pt: {
      term: "Análise estática",
      def: "Avaliação de artefatos (código, requisitos) sem executá-los, geralmente realizada por ferramentas que detectam padrões, vulnerabilidades ou violações de regras.",
    },
    en: {
      term: "Static analysis",
      def: "Evaluation of artifacts (code, requirements) without executing them, typically performed by tools that detect patterns, vulnerabilities, or rule violations.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-02",
    chapter: 3,
    pt: {
      term: "Teste estático",
      def: "Forma de teste que examina artefatos de trabalho sem executar o software, incluindo revisões e análise estática.",
    },
    en: {
      term: "Static testing",
      def: "A form of testing that examines work products without executing the software, including reviews and static analysis.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-03",
    chapter: 3,
    pt: {
      term: "Revisão",
      def: "Avaliação de um artefato por uma ou mais pessoas, com o objetivo de encontrar defeitos e melhorar a qualidade.",
    },
    en: {
      term: "Review",
      def: "An evaluation of a work product by one or more people, aimed at finding defects and improving quality.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-04",
    chapter: 3,
    pt: {
      term: "Walkthrough",
      def: "Tipo de revisão em que o autor conduz os participantes pelo artefato para obter entendimento comum e feedback.",
    },
    en: {
      term: "Walkthrough",
      def: "A type of review in which the author guides participants through the artifact to gain shared understanding and feedback.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-05",
    chapter: 3,
    pt: {
      term: "Revisão técnica",
      def: "Tipo de revisão conduzida por pares tecnicamente qualificados para obter consenso e tomar decisões técnicas.",
    },
    en: {
      term: "Technical review",
      def: "A type of review conducted by technically qualified peers to reach consensus and make technical decisions.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-06",
    chapter: 3,
    pt: {
      term: "Inspeção",
      def: "Tipo de revisão mais formal, com papéis definidos, métricas e critérios de entrada/saída.",
    },
    en: {
      term: "Inspection",
      def: "The most formal type of review, with defined roles, metrics, and entry/exit criteria.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-07",
    chapter: 3,
    pt: {
      term: "Critério de entrada",
      def: "Pré-condições que devem ser satisfeitas antes do início de uma atividade de teste ou revisão.",
    },
    en: {
      term: "Entry criteria",
      def: "Preconditions that must be satisfied before a test or review activity can begin.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-est-08",
    chapter: 3,
    pt: {
      term: "Critério de saída",
      def: "Condições que determinam quando uma atividade de teste ou revisão pode ser considerada concluída.",
    },
    en: {
      term: "Exit criteria",
      def: "Conditions that determine when a test or review activity can be considered complete.",
    },
  },

  // Capítulo 4 — Técnicas de Teste (18 termos)
  {
    cert: "ctfl",
    id: "gl-tec-01",
    chapter: 4,
    pt: {
      term: "Caixa-preta",
      def: "Categoria de técnicas de teste que derivam casos a partir da especificação, sem conhecimento da estrutura interna do sistema.",
    },
    en: {
      term: "Black-box",
      def: "A category of test techniques that derive test cases from the specification, without knowledge of the system's internal structure.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-02",
    chapter: 4,
    pt: {
      term: "Caixa-branca",
      def: "Categoria de técnicas de teste que derivam casos a partir da estrutura interna do código, como fluxo de controle e decisões.",
    },
    en: {
      term: "White-box",
      def: "A category of test techniques that derive test cases from the internal structure of the code, such as control flow and decisions.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-03",
    chapter: 4,
    pt: {
      term: "Particionamento de equivalência",
      def: "Técnica caixa-preta que divide o domínio de entrada em partições onde todos os valores são tratados de forma equivalente pelo sistema.",
    },
    en: {
      term: "Equivalence partitioning",
      def: "A black-box technique that divides the input domain into partitions where all values are expected to be treated equivalently by the system.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-04",
    chapter: 4,
    pt: {
      term: "Valor-fronteira",
      def: "Análise (BVA) que testa os limites entre partições de equivalência, onde defeitos tendem a se concentrar.",
    },
    en: {
      term: "Boundary value analysis",
      def: "A technique (BVA) that tests the boundaries between equivalence partitions, where defects tend to cluster.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-05",
    chapter: 4,
    pt: {
      term: "Tabela de decisão",
      def: "Técnica caixa-preta que representa combinações de condições (causas) e suas ações (efeitos) resultantes, útil para regras de negócio.",
    },
    en: {
      term: "Decision table",
      def: "A black-box technique that represents combinations of conditions (causes) and their resulting actions (effects), useful for business rules.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-06",
    chapter: 4,
    pt: {
      term: "Transição de estado",
      def: "Técnica caixa-preta que modela o comportamento de um sistema como estados, eventos e transições entre eles.",
    },
    en: {
      term: "State transition",
      def: "A black-box technique that models a system's behavior as states, events, and the transitions between them.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-07",
    chapter: 4,
    pt: {
      term: "Cobertura de instrução",
      def: "Medida de cobertura caixa-branca que indica a porcentagem de instruções executáveis exercitadas pelos testes.",
    },
    en: {
      term: "Statement coverage",
      def: "A white-box coverage measure indicating the percentage of executable statements exercised by the tests.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-08",
    chapter: 4,
    pt: {
      term: "Cobertura de decisão",
      def: "Medida de cobertura caixa-branca que indica se cada decisão foi exercitada como verdadeira e como falsa. Mais forte que a cobertura de instrução.",
    },
    en: {
      term: "Decision coverage",
      def: "A white-box coverage measure indicating whether each decision has been exercised as both true and false. Stronger than statement coverage.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-09",
    chapter: 4,
    pt: {
      term: "MC/DC",
      def: "Modified Condition/Decision Coverage. Critério de cobertura rigoroso que exige que cada condição afete independentemente o resultado da decisão. Usado em sistemas críticos (aviação, automotivo).",
    },
    en: {
      term: "MC/DC",
      def: "Modified Condition/Decision Coverage. A rigorous coverage criterion requiring each condition to independently affect the decision's outcome. Used in safety-critical systems (aviation, automotive).",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-10",
    chapter: 4,
    pt: {
      term: "Teste exploratório",
      def: "Abordagem baseada em experiência em que aprendizado, design e execução de testes ocorrem simultaneamente, guiados pelo conhecimento do testador.",
    },
    en: {
      term: "Exploratory testing",
      def: "An experience-based approach in which learning, test design, and execution occur simultaneously, guided by the tester's knowledge.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-11",
    chapter: 4,
    pt: {
      term: "Suposição de erro",
      def: "Técnica baseada em experiência (error guessing) que antecipa defeitos prováveis com base em conhecimento de falhas comuns.",
    },
    en: {
      term: "Error guessing",
      def: "An experience-based technique that anticipates likely defects based on knowledge of common failure modes.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-12",
    chapter: 4,
    pt: {
      term: "Checklist",
      def: "Técnica baseada em experiência que utiliza uma lista de itens a verificar, derivada de heurísticas e lições aprendidas.",
    },
    en: {
      term: "Checklist",
      def: "An experience-based technique that uses a list of items to verify, derived from heuristics and lessons learned.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-13",
    chapter: 4,
    pt: {
      term: "ATDD",
      def: "Acceptance Test-Driven Development. Abordagem colaborativa em que testes de aceitação são definidos antes da implementação, a partir dos critérios de aceitação.",
    },
    en: {
      term: "ATDD",
      def: "Acceptance Test-Driven Development. A collaborative approach in which acceptance tests are defined before implementation, based on acceptance criteria.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-14",
    chapter: 4,
    pt: {
      term: "BDD",
      def: "Behavior-Driven Development. Abordagem que descreve o comportamento esperado do sistema em linguagem natural estruturada (Given-When-Then), guiando o desenvolvimento e os testes.",
    },
    en: {
      term: "BDD",
      def: "Behavior-Driven Development. An approach that describes the system's expected behavior in structured natural language (Given-When-Then), guiding development and testing.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-15",
    chapter: 4,
    pt: {
      term: "Condição de teste",
      def: "Item ou evento que pode ser verificado por um ou mais casos de teste, derivado da base de teste.",
    },
    en: {
      term: "Test condition",
      def: "An item or event that can be verified by one or more test cases, derived from the test basis.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-16",
    chapter: 4,
    pt: {
      term: "Critérios de aceitação",
      def: "Conjunto de condições que uma user story deve satisfazer para ser considerada concluída e aceita.",
    },
    en: {
      term: "Acceptance criteria",
      def: "A set of conditions that a user story must satisfy to be considered complete and accepted.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-17",
    chapter: 4,
    pt: {
      term: "Cobertura de condição",
      def: "Critério de cobertura caixa-branca que exige que cada condição individual dentro de uma decisão seja exercitada como verdadeira e como falsa.",
    },
    en: {
      term: "Condition coverage",
      def: "A white-box coverage criterion requiring each individual condition within a decision to be exercised as both true and false.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-tec-18",
    chapter: 4,
    pt: {
      term: "Test charter",
      def: "Documento breve que define a missão ou foco de uma sessão de teste exploratório com tempo determinado (time-boxed).",
    },
    en: {
      term: "Test charter",
      def: "A brief document defining the mission or focus of a time-boxed exploratory testing session.",
    },
  },

  // Capítulo 5 — Gerenciamento (17 termos)
  {
    cert: "ctfl",
    id: "gl-mgmt-01",
    chapter: 5,
    pt: {
      term: "Plano de teste",
      def: "Documento que descreve escopo, objetivos, abordagem, recursos, cronograma, riscos e critérios de entrada/saída do esforço de teste.",
    },
    en: {
      term: "Test plan",
      def: "A document describing the scope, objectives, approach, resources, schedule, risks, and entry/exit criteria of the test effort.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-02",
    chapter: 5,
    pt: {
      term: "Estratégia de teste",
      def: "Descrição geral, em nível organizacional, da abordagem de teste a ser aplicada nos projetos.",
    },
    en: {
      term: "Test strategy",
      def: "A general, organization-level description of the testing approach to be applied across projects.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-03",
    chapter: 5,
    pt: {
      term: "Risco de produto",
      def: "Possibilidade de o produto não atender às necessidades do usuário ou apresentar defeitos que afetem sua qualidade.",
    },
    en: {
      term: "Product risk",
      def: "The possibility that the product may not meet user needs or may have defects affecting its quality.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-04",
    chapter: 5,
    pt: {
      term: "Risco de projeto",
      def: "Possibilidade de eventos que afetem a capacidade do projeto de atingir seus objetivos, como prazo, custo e recursos.",
    },
    en: {
      term: "Project risk",
      def: "The possibility of events affecting the project's ability to meet its objectives, such as schedule, cost, and resources.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-05",
    chapter: 5,
    pt: {
      term: "Teste baseado em risco",
      def: "Abordagem que usa a avaliação de risco (probabilidade × impacto) para priorizar o que testar, quanto e em que ordem.",
    },
    en: {
      term: "Risk-based testing",
      def: "An approach that uses risk assessment (probability × impact) to prioritize what to test, how much, and in what order.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-06",
    chapter: 5,
    pt: {
      term: "Severidade",
      def: "Medida do impacto técnico de um defeito sobre o sistema.",
    },
    en: {
      term: "Severity",
      def: "A measure of the technical impact a defect has on the system.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-07",
    chapter: 5,
    pt: {
      term: "Prioridade",
      def: "Medida da urgência de correção de um defeito, sob a ótica do negócio. Pode ser independente da severidade.",
    },
    en: {
      term: "Priority",
      def: "A measure of the urgency of fixing a defect, from a business perspective. Can be independent of severity.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-08",
    chapter: 5,
    pt: {
      term: "Rastreabilidade",
      def: "Capacidade de relacionar elementos da base de teste (requisitos, riscos) com condições e casos de teste, apoiando análise de cobertura e impacto.",
    },
    en: {
      term: "Traceability",
      def: "The ability to relate test basis elements (requirements, risks) to test conditions and cases, supporting coverage and impact analysis.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-09",
    chapter: 5,
    pt: {
      term: "Monitoramento de teste",
      def: "Atividade que coleta informações sobre o progresso do teste para compará-las com o planejado.",
    },
    en: {
      term: "Test monitoring",
      def: "An activity that collects information about test progress to compare it against what was planned.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-10",
    chapter: 5,
    pt: {
      term: "Controle de teste",
      def: "Atividade que toma ações corretivas (replanejar, realocar) com base nas informações do monitoramento de teste.",
    },
    en: {
      term: "Test control",
      def: "An activity that takes corrective actions (replanning, reallocating) based on information from test monitoring.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-11",
    chapter: 5,
    pt: {
      term: "Gestão de configuração",
      def: "Prática que garante identificação e versionamento consistentes de itens de teste e testware, com rastreabilidade.",
    },
    en: {
      term: "Configuration management",
      def: "A practice that ensures consistent identification and versioning of test items and testware, with traceability.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-12",
    chapter: 5,
    pt: {
      term: "Pirâmide de teste",
      def: "Modelo que recomenda muitos testes de unidade na base e poucos testes de UI/E2E no topo, equilibrando velocidade e custo.",
    },
    en: {
      term: "Test pyramid",
      def: "A model recommending many unit tests at the base and few UI/E2E tests at the top, balancing speed and cost.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-13",
    chapter: 5,
    pt: {
      term: "Quadrantes de teste",
      def: "Modelo que classifica tipos de teste por foco em negócio/tecnologia e por apoiar a equipe ou criticar o produto.",
    },
    en: {
      term: "Testing quadrants",
      def: "A model classifying test types by business/technology focus and by whether they support the team or critique the product.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-14",
    chapter: 5,
    pt: {
      term: "Definition of Done",
      def: "Conjunto de critérios de saída acordados pela equipe, que define quando um item de trabalho é considerado verdadeiramente concluído.",
    },
    en: {
      term: "Definition of Done",
      def: "A set of exit criteria agreed upon by the team, defining when a work item is considered truly complete.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-15",
    chapter: 5,
    pt: {
      term: "Relatório de progresso de teste",
      def: "Documento que informa as partes interessadas sobre o andamento do teste e apoia decisões durante a execução.",
    },
    en: {
      term: "Test progress report",
      def: "A document informing stakeholders about testing progress and supporting decisions during execution.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-16",
    chapter: 5,
    pt: {
      term: "Relatório de conclusão de teste",
      def: "Documento produzido ao final de um nível ou marco de teste, resumindo resultados, cobertura e lições aprendidas.",
    },
    en: {
      term: "Test completion report",
      def: "A document produced at the end of a test level or milestone, summarizing results, coverage, and lessons learned.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-mgmt-17",
    chapter: 5,
    pt: {
      term: "Análise de impacto",
      def: "Avaliação das mudanças necessárias no testware e nas áreas do sistema afetadas por uma alteração, usada na manutenção.",
    },
    en: {
      term: "Impact analysis",
      def: "Assessment of the changes needed in testware and the system areas affected by a modification, used in maintenance testing.",
    },
  },

  // Capítulo 6 — Ferramentas (5 termos)
  {
    cert: "ctfl",
    id: "gl-fer-01",
    chapter: 6,
    pt: {
      term: "Ferramenta de gestão de teste",
      def: "Ferramenta que apoia o gerenciamento de casos de teste, execução, rastreabilidade e relatórios (ex: Jira+Xray, TestRail).",
    },
    en: {
      term: "Test management tool",
      def: "A tool that supports managing test cases, execution, traceability, and reporting (e.g., Jira+Xray, TestRail).",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fer-02",
    chapter: 6,
    pt: {
      term: "Ferramenta de análise estática",
      def: "Ferramenta que examina código ou outros artefatos sem executá-los, identificando violações de padrões e vulnerabilidades.",
    },
    en: {
      term: "Static analysis tool",
      def: "A tool that examines code or other artifacts without executing them, identifying standard violations and vulnerabilities.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fer-03",
    chapter: 6,
    pt: {
      term: "ROI da automação",
      def: "Retorno sobre investimento da automação de teste, que depende do custo de implementação e manutenção frente aos benefícios de execução repetida.",
    },
    en: {
      term: "Automation ROI",
      def: "Return on investment of test automation, which depends on implementation and maintenance cost relative to the benefits of repeated execution.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fer-04",
    chapter: 6,
    pt: {
      term: "Projeto piloto",
      def: "Implantação inicial e limitada de uma ferramenta nova, usada para avaliar seu ajuste à organização antes da adoção em larga escala.",
    },
    en: {
      term: "Pilot project",
      def: "An initial, limited deployment of a new tool, used to evaluate its fit with the organization before large-scale adoption.",
    },
  },
  {
    cert: "ctfl",
    id: "gl-fer-05",
    chapter: 6,
    pt: {
      term: "Prova de conceito",
      def: "Avaliação prática (PoC) de uma ferramenta para verificar se ela atende aos requisitos antes de uma decisão formal de adoção.",
    },
    en: {
      term: "Proof of concept",
      def: "A practical evaluation (PoC) of a tool to verify it meets requirements before a formal adoption decision.",
    },
  } /* ─────────── CTAL-TA v4.0 (37 termos — Syllabus GA 2025/05/02, istqb.org) ─────────── */,
  // Capítulo 1 — Tarefas no Processo de Teste (6 termos)
  {
    cert: "ctal-ta",
    id: "gl-ta-101",
    chapter: 1,
    pt: {
      term: "Caso de teste de alto nível",
      def: "Caso de teste (abstrato/lógico) que indica quais condições de teste cobre, sem dados concretos — pré-condições, entradas e resultados ficam em nível abstrato. Base para 1+ casos de baixo nível.",
    },
    en: {
      term: "High-level test case",
      def: "An (abstract/logical) test case that states which test conditions it covers, without concrete data — preconditions, inputs, and results remain abstract. Basis for 1+ low-level test cases.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-102",
    chapter: 1,
    pt: {
      term: "Caso de teste de baixo nível",
      def: "Caso de teste (concreto/físico) com pré-condições, dados de entrada, resultados esperados e pós-condições específicos e executáveis. Refinamento detalhado de um caso de alto nível.",
    },
    en: {
      term: "Low-level test case",
      def: "A (concrete/physical) test case with specific, executable preconditions, input data, expected results, and postconditions. A detailed refinement of a high-level test case.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-103",
    chapter: 1,
    pt: {
      term: "Oráculo de teste",
      def: "Fonte usada para determinar os resultados esperados no teste dinâmico: especificação, experiência humana, implementação de referência ou propriedades do sistema.",
    },
    en: {
      term: "Test oracle",
      def: "The source used to determine expected results in dynamic testing: a specification, human experience, a reference implementation, or system properties.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-104",
    chapter: 1,
    pt: {
      term: "Pseudo-oráculo",
      def: "Sistema desenvolvido independentemente que atende à mesma especificação do objeto de teste (ex: sistema legado ou versão simplificada), usado para gerar resultados esperados. Comum em sistemas críticos.",
    },
    en: {
      term: "Pseudo-oracle",
      def: "An independently developed system that fulfills the same specification as the test object (e.g., a legacy system or simplified version), used to generate expected results. Typical for critical systems.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-105",
    chapter: 1,
    pt: {
      term: "Teste keyword-driven",
      def: "Abordagem em que scripts de teste são compostos por palavras-chave (de ação e verificação) com parâmetros, na camada de abstração adequada — executáveis de forma automatizada ou manual.",
    },
    en: {
      term: "Keyword-driven testing",
      def: "An approach where test scripts are composed of action and verification keywords with parameters, at the appropriate abstraction layer — executable automatically or manually.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-106",
    chapter: 1,
    pt: {
      term: "Testware",
      def: "Artefatos produzidos pelo teste: casos de teste, procedimentos, dados, scripts, ambientes e resultados. Gerenciado com ferramentas e controle de versão como qualquer outro produto de trabalho.",
    },
    en: {
      term: "Testware",
      def: "Artifacts produced by testing: test cases, procedures, data, scripts, environments, and results. Managed with tools and version control like any other work product.",
    },
  },
  // Capítulo 2 — Teste Baseado em Risco (5 termos)
  {
    cert: "ctal-ta",
    id: "gl-ta-201",
    chapter: 2,
    pt: {
      term: "Análise de risco",
      def: "Atividade que compreende a identificação de riscos e sua avaliação (estimativa de probabilidade e impacto para determinar o nível de risco).",
    },
    en: {
      term: "Risk analysis",
      def: "The activity comprising risk identification and risk assessment (estimating probability and impact to determine risk level).",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-202",
    chapter: 2,
    pt: {
      term: "Identificação de risco",
      def: "Etapa em que riscos de produto são levantados via retrospectivas, workshops, brainstorming, checklists e entrevistas com stakeholders. O TA contribui com conhecimento do sistema e do que costuma dar errado.",
    },
    en: {
      term: "Risk identification",
      def: "The step where product risks are raised via retrospectives, workshops, brainstorming, checklists, and stakeholder interviews. The TA contributes system knowledge and awareness of what usually goes wrong.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-203",
    chapter: 2,
    pt: {
      term: "Avaliação de risco",
      def: "Estimativa colaborativa do nível de risco considerando frequência de uso, criticidade das funções afetadas, impacto de falha e probabilidade de ocorrência.",
    },
    en: {
      term: "Risk assessment",
      def: "A collaborative estimate of risk level considering frequency of use, criticality of affected features, failure impact, and likelihood of occurrence.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-204",
    chapter: 2,
    pt: {
      term: "Registro de riscos",
      def: "Lista de riscos identificados com seu nível, prioridade e ações de mitigação. O TA o atualiza conforme mudanças e resultados de teste.",
    },
    en: {
      term: "Risk register",
      def: "The list of identified risks with their level, priority, and mitigation actions. The TA updates it as changes and test results arrive.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-205",
    chapter: 2,
    pt: {
      term: "Controle de risco",
      def: "Parte do teste baseado em risco que define e executa ações de mitigação — inclusive a análise do impacto de mudanças para determinar o escopo do teste de regressão (K4 do CTAL-TA).",
    },
    en: {
      term: "Risk control",
      def: "The part of risk-based testing that defines and executes mitigation actions — including analyzing the impact of changes to determine regression test scope (the CTAL-TA K4).",
    },
  },
  // Capítulo 3 — Análise e Design de Testes (14 termos)
  {
    cert: "ctal-ta",
    id: "gl-ta-301",
    chapter: 3,
    pt: {
      term: "Domain testing",
      def: "Técnica baseada em dados que verifica o comportamento nas partições de equivalência e suas bordas, definidas por expressões booleanas (AND/OR/NOT) sobre variáveis que interagem. Na v4.0 engloba EP e BVA.",
    },
    en: {
      term: "Domain testing",
      def: "A data-based technique that verifies behavior on equivalence partitions and their borders, defined by Boolean expressions (AND/OR/NOT) over interacting variables. In v4.0 it subsumes EP and BVA.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-302",
    chapter: 3,
    pt: {
      term: "Pontos ON / OFF / IN / OUT",
      def: "Itens de cobertura do domain testing: ON está na borda (fechada) ou o mais perto dela por dentro (borda aberta); OFF está fora (borda fechada) ou na borda (aberta); IN pertence à partição; OUT está fora. O mesmo ponto pode ter tipos diferentes para bordas diferentes.",
    },
    en: {
      term: "ON / OFF / IN / OUT points",
      def: "Domain testing coverage items: ON lies on the (closed) border or closest inside it (open border); OFF lies outside (closed border) or on the border (open); IN belongs to the partition; OUT lies outside. The same point can have different types for different borders.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-303",
    chapter: 3,
    pt: {
      term: "Falha de interação",
      def: "Falha provocada por uma combinação específica de valores de parâmetros, e não por um valor isolado. É o alvo do teste combinatorial.",
    },
    en: {
      term: "Interaction failure",
      def: "A failure triggered by a specific combination of parameter values rather than a single value. It is the target of combinatorial testing.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-304",
    chapter: 3,
    pt: {
      term: "Teste combinatorial",
      def: "Técnica que revela falhas de interação explorando combinações de valores de parâmetros (de configuração ou de dados de entrada).",
    },
    en: {
      term: "Combinatorial testing",
      def: "A technique that reveals interaction failures by exploring combinations of parameter values (configuration or input data).",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-305",
    chapter: 3,
    pt: {
      term: "Cobertura base choice",
      def: "Critério combinatorial: escolhe-se um par parâmetro-valor base por parâmetro; itens de cobertura derivam do conjunto base trocando um par por vez por cada valor não-base.",
    },
    en: {
      term: "Base choice coverage",
      def: "A combinatorial criterion: one base parameter-value pair per parameter; coverage items derive from the base set by swapping one pair at a time for each non-base value.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-306",
    chapter: 3,
    pt: {
      term: "Cobertura pairwise",
      desc: undefined,
      def: "Critério combinatorial em que os itens de cobertura são pares de parâmetro-valor para quaisquer dois parâmetros. Ferramentas geram os itens, mas achar o conjunto mínimo é difícil — EP antes reduz os valores.",
    },
    en: {
      term: "Pairwise coverage",
      def: "A combinatorial criterion where coverage items are pairs of parameter-values for any two parameters. Tools generate the items, but finding a minimal set is hard — applying EP first reduces values.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-307",
    chapter: 3,
    pt: {
      term: "Teste random",
      def: "Seleção aleatória de dados de entrada segundo uma distribuição de probabilidade (perfil operacional p/ validação; uso-agnóstico p/ verificação). Não tem critério de cobertura — sai por contagem/tempo.",
    },
    en: {
      term: "Random testing",
      def: "Random input selection per a probability distribution (operational profile for validation; usage-agnostic for verification). No coverage criteria — exits by count/time.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-308",
    chapter: 3,
    pt: {
      term: "Teste random adaptativo",
      def: "Teste random GUIADO: ajusta a distribuição com base nos valores já selecionados, evoluindo ao longo do tempo — explora o fato de que defeitos se agrupam em regiões do domínio.",
    },
    en: {
      term: "Adaptive random testing",
      def: "GUIDED random testing: adjusts the distribution based on previously selected values, evolving over time — exploits the fact that defects cluster in domain regions.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-309",
    chapter: 3,
    pt: {
      term: "Teste CRUD",
      def: "Verifica o ciclo de vida das entidades de dados: Create, Read, Update, Delete. Completude (estático) checa se todo o ciclo existe por entidade; consistência (dinâmico) checa a integração das funções.",
    },
    en: {
      term: "CRUD testing",
      def: "Verifies the lifecycle of data entities: Create, Read, Update, Delete. Completeness (static) checks the whole cycle exists per entity; consistency (dynamic) checks functions integrate correctly.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-310",
    chapter: 3,
    pt: {
      term: "Matriz CRUD",
      def: "Visão geral do ciclo de vida das entidades: linhas = funções, colunas = entidades; cada célula marca C, R, U ou D. A leitura (R) costuma estar implícita nas operações C-U-D.",
    },
    en: {
      term: "CRUD matrix",
      def: "An overview of the entity lifecycle: rows = functions, columns = entities; each cell marks C, R, U, or D. Read (R) is often implicit in C-U-D operations.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-311",
    chapter: 3,
    pt: {
      term: "Teste metamórfico",
      def: "Gera casos follow-up a partir de um caso-fonte aplicando uma relação metamórfica; fonte + follow-ups formam um procedimento com avaliação conjunta. Útil na presença do problema do oráculo.",
    },
    en: {
      term: "Metamorphic testing",
      def: "Generates follow-up cases from a source case by applying a metamorphic relation; source + follow-ups form one procedure with joint evaluation. Useful in the presence of the oracle problem.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-312",
    chapter: 3,
    pt: {
      term: "Relação metamórfica (RM)",
      def: "Propriedade do objeto de teste que descreve como uma mudança nas entradas se reflete nos resultados esperados (ex: permutar a série mantém a média; multiplicar por x multiplica a média).",
    },
    en: {
      term: "Metamorphic relation (MR)",
      def: "A property of the test object describing how a change in inputs is reflected in expected results (e.g., permuting the series keeps the average; multiplying by x multiplies the average).",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-313",
    chapter: 3,
    pt: {
      term: "Teste baseado em sessão",
      def: "Gerenciamento do teste exploratório por sessões com charters, debriefs e métricas; dá estrutura à exploração mantendo a flexibilidade.",
    },
    en: {
      term: "Session-based testing",
      def: "Management of exploratory testing via sessions with charters, debriefs, and metrics; provides structure to exploration while keeping flexibility.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-314",
    chapter: 3,
    pt: {
      term: "Crowd testing",
      def: "Teste executado por uma multidão distribuída de testers (plataformas de crowd). Benefícios: escala e diversidade; limitações: coordenação, qualidade variável, propriedade intelectual.",
    },
    en: {
      term: "Crowd testing",
      def: "Testing performed by a distributed crowd of testers (crowd platforms). Benefits: scale and diversity; limitations: coordination, variable quality, intellectual property.",
    },
  },
  // Capítulo 4 — Características de Qualidade (8 termos)
  {
    cert: "ctal-ta",
    id: "gl-ta-401",
    chapter: 4,
    pt: {
      term: "Completude funcional",
      def: 'Sub-característica da adequação funcional: o grau em que o conjunto de funções cobre todas as tarefas especificadas e os objetivos do usuário. Pergunta-chave: "tudo o que foi pedido está implementado?"',
    },
    en: {
      term: "Functional completeness",
      def: 'Functional suitability sub-characteristic: the degree to which the set of functions covers all specified tasks and user objectives. Key question: "is everything asked for implemented?"',
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-402",
    chapter: 4,
    pt: {
      term: "Corretude funcional",
      def: "Sub-característica: o grau em que o produto fornece resultados corretos (precisos, consistentes) para entradas válidas e inválidas. Requer oráculo eficaz; testável em qualquer nível.",
    },
    en: {
      term: "Functional correctness",
      def: "Sub-characteristic: the degree to which the product provides correct (accurate, consistent) results for valid and invalid inputs. Requires an effective oracle; testable at any level.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-403",
    chapter: 4,
    pt: {
      term: "Apropriação funcional",
      def: 'Sub-característica: o grau em que as funções facilitam a realização das tarefas e objetivos especificados — "o que existe atende às necessidades do usuário?" Avaliada com revisões de UI, exploratório e demos.',
    },
    en: {
      term: "Functional appropriateness",
      def: 'Sub-characteristic: the degree to which functions facilitate accomplishing specified tasks and objectives — "does what exists meet user needs?" Assessed via UI reviews, exploratory, and demos.',
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-404",
    chapter: 4,
    pt: {
      term: "Usabilidade (ISO 25010/25019)",
      def: "Conceito amplo centrado no usuário no CTAL-TA v4.0: capacidade de interação (eficaz/eficiente/satisfatória em contexto de uso), experiência do usuário e acessibilidade.",
    },
    en: {
      term: "Usability (ISO 25010/25019)",
      def: "The broad user-centered concept in CTAL-TA v4.0: interaction capability (effective/efficient/satisfactory in context of use), user experience, and accessibility.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-405",
    chapter: 4,
    pt: {
      term: "Acessibilidade",
      def: "Garantia de que usuários com deficiências, origens culturais diversas ou barreiras linguísticas consigam usar o sistema de forma eficaz e eficiente.",
    },
    en: {
      term: "Accessibility",
      def: "Ensuring users with disabilities, diverse cultural backgrounds, or language barriers can use the system effectively and efficiently.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-406",
    chapter: 4,
    pt: {
      term: "Adaptabilidade",
      def: "Sub-característica da flexibilidade: capacidade de funcionar em diferentes ambientes (hardware, software, infraestrutura, usos) sem intervenções além das aceitas para o propósito.",
    },
    en: {
      term: "Adaptability",
      def: "Flexibility sub-characteristic: the ability to function in different environments (hardware, software, infrastructure, uses) without interventions beyond those accepted for the purpose.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-407",
    chapter: 4,
    pt: {
      term: "Instalabilidade",
      def: "Sub-característica da flexibilidade: facilidade e sucesso de instalação/desinstalação do produto nos ambientes-alvo especificados.",
    },
    en: {
      term: "Installability",
      def: "Flexibility sub-characteristic: ease and success of installing/uninstalling the product in specified target environments.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-408",
    chapter: 4,
    pt: {
      term: "Interoperabilidade",
      def: "Sub-característica da compatibilidade: capacidade de trocar dados/usar serviços com outros sistemas. Testa-se com dados compatíveis, ICDs e ambientes que representem os sistemas reais.",
    },
    en: {
      term: "Interoperability",
      def: "Compatibility sub-characteristic: the ability to exchange data/use services with other systems. Tested with compatible data, ICDs, and environments representing real systems.",
    },
  },
  // Capítulo 5 — Prevenção de Defeitos (4 termos)
  {
    cert: "ctal-ta",
    id: "gl-ta-501",
    chapter: 5,
    pt: {
      term: "Prevenção de defeitos",
      def: "Ações que reduzem a probabilidade de (re)ocorrência de defeitos e sua propagação p/ fases seguintes: impedir introdução, impedir fuga (contenção) e impedir recorrência (RCA).",
    },
    en: {
      term: "Defect prevention",
      def: "Actions reducing the likelihood of defect (re)occurrence and propagation to subsequent phases: prevent introduction, prevent escape (containment), prevent recurrence (RCA).",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-502",
    chapter: 5,
    pt: {
      term: "Contenção de fase",
      def: "Política de detectar e remover o defeito na MESMA fase do SDLC em que foi introduzido (análogo ao shift-left no Agile). Reduz o custo de qualidade.",
    },
    en: {
      term: "Phase containment",
      def: "The policy of detecting and removing a defect in the SAME SDLC phase where it was introduced (the Agile shift-left analogue). Reduces the cost of quality.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-503",
    chapter: 5,
    pt: {
      term: "Phase containment effectiveness (PCE)",
      def: "Métrica: defeitos introduzidos E removidos na própria fase ÷ total de defeitos introduzidos na fase. PCE alto = menos fugas para fases posteriores.",
    },
    en: {
      term: "Phase containment effectiveness (PCE)",
      def: "Metric: defects introduced AND removed in the same phase ÷ total defects introduced in that phase. High PCE = fewer escapes to later phases.",
    },
  },
  {
    cert: "ctal-ta",
    id: "gl-ta-504",
    chapter: 5,
    pt: {
      term: "Classificação de defeitos",
      def: "Agrupar defeitos por tipo/origem para revelar padrões, alimentar a análise de causa-raiz e definir ações que impedem a recorrência.",
    },
    en: {
      term: "Defect classification",
      def: "Grouping defects by type/origin to reveal patterns, feed root cause analysis, and define actions preventing recurrence.",
    },
  },
];

export function localizedGlossary(lang = "pt") {
  return GLOSSARY.map((g) => ({
    id: g.id,
    cert: g.cert,
    chapter: g.chapter,
    ...g[lang],
  }));
}

/** r14: termos escopados por certificação (campo explícito `cert`). */
export function glossaryForCert(lang = "pt", certId) {
  return localizedGlossary(lang).filter((g) => g.cert === certId);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWordBoundaryMatch(text, term) {
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(term)}([^\\p{L}\\p{N}]|$)`, "iu");
  return pattern.test(text);
}

// Helper para o link inline: dado um texto de explicação, encontra
// termos do glossário mencionados nele (case-insensitive, match por palavra)
export function findGlossaryTermsInText(text, lang = "pt") {
  const terms = localizedGlossary(lang);
  return terms.filter((t) => hasWordBoundaryMatch(text, t.term));
}
