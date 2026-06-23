// Glossário ISTQB CTFL v4.0 — 70 termos essenciais (PT/EN).
export const GLOSSARY = [
  {
    id: "gl-fund-01",
    chapter: 1,
    pt: { term: "Defeito", def: "Imperfeição em um artefato (código, requisito, documento) que pode causar um comportamento incorreto do sistema. É a manifestação de um erro humano." },
    en: { term: "Defect", def: "An imperfection in a work product (code, requirement, document) that may cause incorrect system behavior. It is the manifestation of a human error." }
  },
  {
    id: "gl-fund-02",
    chapter: 1,
    pt: { term: "Erro", def: "Ação humana que produz um resultado incorreto, como um mal-entendido de requisito ou um erro de digitação no código. Sinônimo: engano (mistake)." },
    en: { term: "Error", def: "A human action that produces an incorrect result, such as a misunderstood requirement or a coding mistake. Synonym: mistake." }
  },
  {
    id: "gl-fund-03",
    chapter: 1,
    pt: { term: "Falha", def: "Comportamento incorreto e observável do sistema durante a execução, causado por um defeito presente no código ou artefato." },
    en: { term: "Failure", def: "Observable incorrect behavior of a system during execution, caused by a defect present in the code or artifact." }
  },
  {
    id: "gl-fund-04",
    chapter: 1,
    pt: { term: "Cobertura", def: "O grau em que um conjunto de itens definidos (instruções, decisões, partições, requisitos) foi exercitado por uma suíte de testes, geralmente expresso em percentual." },
    en: { term: "Coverage", def: "The degree to which a defined set of items (statements, decisions, partitions, requirements) has been exercised by a test suite, usually expressed as a percentage." }
  },
  {
    id: "gl-fund-05",
    chapter: 1,
    pt: { term: "Oráculo de teste", def: "Mecanismo usado para determinar o resultado esperado de um teste, permitindo comparar com o resultado real e decidir se o teste passou ou falhou." },
    en: { term: "Test oracle", def: "A mechanism used to determine the expected result of a test, enabling comparison with the actual result to decide whether the test passed or failed." }
  },
  {
    id: "gl-fund-06",
    chapter: 1,
    pt: { term: "Agrupamento de defeitos", def: "Princípio de teste segundo o qual um pequeno número de módulos costuma concentrar a maioria dos defeitos de um sistema (defect clustering)." },
    en: { term: "Defect clustering", def: "Testing principle stating that a small number of modules typically contain most of the defects in a system." }
  },
  {
    id: "gl-fund-07",
    chapter: 1,
    pt: { term: "Paradoxo do pesticida", def: "Princípio de teste que descreve como repetir os mesmos casos de teste, sem revisá-los, tende a parar de revelar novos defeitos (pesticide paradox)." },
    en: { term: "Pesticide paradox", def: "Testing principle describing how repeating the same test cases without revising them tends to stop revealing new defects." }
  },
  {
    id: "gl-fund-08",
    chapter: 1,
    pt: { term: "Testware", def: "Conjunto de artefatos produzidos durante o processo de teste: planos, condições, casos, dados, scripts e relatórios." },
    en: { term: "Testware", def: "The set of artifacts produced during the testing process: plans, conditions, cases, data, scripts, and reports." }
  },
  {
    id: "gl-fund-09",
    chapter: 1,
    pt: { term: "Base de teste", def: "Qualquer artefato (requisitos, design, código, lista de riscos) a partir do qual condições de teste podem ser derivadas." },
    en: { term: "Test basis", def: "Any artifact (requirements, design, code, risk list) from which test conditions can be derived." }
  },
  {
    id: "gl-fund-10",
    chapter: 1,
    pt: { term: "Testabilidade", def: "Grau em que um artefato de trabalho facilita a sua própria verificação por meio de testes." },
    en: { term: "Testability", def: "The degree to which a work product facilitates testing of itself." }
  },
  {
    id: "gl-fund-11",
    chapter: 1,
    pt: { term: "Caso de teste", def: "Conjunto de pré-condições, entradas, ações e resultados esperados desenvolvido para verificar a conformidade com um requisito específico." },
    en: { term: "Test case", def: "A set of preconditions, inputs, actions, and expected results developed to verify compliance with a specific requirement." }
  },
  {
    id: "gl-fund-12",
    chapter: 1,
    pt: { term: "Independência de teste", def: "Grau em que o teste é realizado por alguém diferente do autor do artefato, reduzindo o viés cognitivo do autor." },
    en: { term: "Test independence", def: "The degree to which testing is performed by someone other than the artifact's author, reducing the author's cognitive bias." }
  },

  // Capítulo 2 — Teste ao Longo do Ciclo (10 termos)
  { id: "gl-proc-01", chapter: 2, pt: { term: "Teste de componente", def: "Nível de teste que verifica componentes individuais de forma isolada, geralmente realizado pelo próprio desenvolvedor." }, en: { term: "Component testing", def: "A test level that verifies individual components in isolation, typically performed by the developer." } },
  { id: "gl-proc-02", chapter: 2, pt: { term: "Teste de integração", def: "Nível de teste que verifica as interfaces e interações entre componentes ou entre sistemas distintos." }, en: { term: "Integration testing", def: "A test level that verifies the interfaces and interactions between components or between distinct systems." } },
  { id: "gl-proc-03", chapter: 2, pt: { term: "Teste de sistema", def: "Nível de teste que avalia o comportamento e as capacidades do sistema completo e integrado." }, en: { term: "System testing", def: "A test level that evaluates the behavior and capabilities of the complete, integrated system." } },
  { id: "gl-proc-04", chapter: 2, pt: { term: "Teste de aceitação", def: "Nível de teste que determina se o sistema atende às necessidades do usuário, do negócio ou a requisitos contratuais/regulatórios." }, en: { term: "Acceptance testing", def: "A test level that determines whether the system meets user needs, business needs, or contractual/regulatory requirements." } },
  { id: "gl-proc-05", chapter: 2, pt: { term: "Teste funcional", def: "Tipo de teste que avalia o que o sistema faz, verificando suas funções em relação aos requisitos funcionais." }, en: { term: "Functional testing", def: "A test type that evaluates what the system does, verifying its functions against functional requirements." } },
  { id: "gl-proc-06", chapter: 2, pt: { term: "Teste não funcional", def: "Tipo de teste que avalia atributos de qualidade do sistema, como desempenho, usabilidade, segurança e confiabilidade." }, en: { term: "Non-functional testing", def: "A test type that evaluates quality attributes of the system, such as performance, usability, security, and reliability." } },
  { id: "gl-proc-07", chapter: 2, pt: { term: "Teste de regressão", def: "Tipo de teste que verifica se uma mudança no sistema introduziu efeitos colaterais em áreas previamente funcionais." }, en: { term: "Regression testing", def: "A test type that checks whether a change to the system has introduced side effects in previously working areas." } },
  { id: "gl-proc-08", chapter: 2, pt: { term: "Teste de confirmação", def: "Re-execução de um caso de teste que falhou anteriormente, para confirmar se a correção do defeito foi bem-sucedida." }, en: { term: "Confirmation testing", def: "Re-execution of a previously failed test case to confirm that the defect fix was successful." } },
  { id: "gl-proc-09", chapter: 2, pt: { term: "Shift-left", def: "Prática de antecipar atividades de teste para fases mais iniciais do ciclo de desenvolvimento, reduzindo o custo de correção de defeitos." }, en: { term: "Shift-left", def: "The practice of moving testing activities to earlier stages of the development lifecycle, reducing the cost of fixing defects." } },
  { id: "gl-proc-10", chapter: 2, pt: { term: "TDD", def: "Test-Driven Development. Abordagem em que um teste é escrito antes do código de produção, que é então implementado apenas para fazer o teste passar." }, en: { term: "TDD", def: "Test-Driven Development. An approach where a test is written before the production code, which is then implemented just enough to make the test pass." } },

  // Capítulo 3 — Teste Estático (8 termos)
  { id: "gl-est-01", chapter: 3, pt: { term: "Análise estática", def: "Avaliação de artefatos (código, requisitos) sem executá-los, geralmente realizada por ferramentas que detectam padrões, vulnerabilidades ou violações de regras." }, en: { term: "Static analysis", def: "Evaluation of artifacts (code, requirements) without executing them, typically performed by tools that detect patterns, vulnerabilities, or rule violations." } },
  { id: "gl-est-02", chapter: 3, pt: { term: "Teste estático", def: "Forma de teste que examina artefatos de trabalho sem executar o software, incluindo revisões e análise estática." }, en: { term: "Static testing", def: "A form of testing that examines work products without executing the software, including reviews and static analysis." } },
  { id: "gl-est-03", chapter: 3, pt: { term: "Revisão", def: "Avaliação de um artefato por uma ou mais pessoas, com o objetivo de encontrar defeitos e melhorar a qualidade." }, en: { term: "Review", def: "An evaluation of a work product by one or more people, aimed at finding defects and improving quality." } },
  { id: "gl-est-04", chapter: 3, pt: { term: "Walkthrough", def: "Tipo de revisão em que o autor conduz os participantes pelo artefato para obter entendimento comum e feedback." }, en: { term: "Walkthrough", def: "A type of review in which the author guides participants through the artifact to gain shared understanding and feedback." } },
  { id: "gl-est-05", chapter: 3, pt: { term: "Revisão técnica", def: "Tipo de revisão conduzida por pares tecnicamente qualificados para obter consenso e tomar decisões técnicas." }, en: { term: "Technical review", def: "A type of review conducted by technically qualified peers to reach consensus and make technical decisions." } },
  { id: "gl-est-06", chapter: 3, pt: { term: "Inspeção", def: "Tipo de revisão mais formal, com papéis definidos, métricas e critérios de entrada/saída." }, en: { term: "Inspection", def: "The most formal type of review, with defined roles, metrics, and entry/exit criteria." } },
  { id: "gl-est-07", chapter: 3, pt: { term: "Critério de entrada", def: "Pré-condições que devem ser satisfeitas antes do início de uma atividade de teste ou revisão." }, en: { term: "Entry criteria", def: "Preconditions that must be satisfied before a test or review activity can begin." } },
  { id: "gl-est-08", chapter: 3, pt: { term: "Critério de saída", def: "Condições que determinam quando uma atividade de teste ou revisão pode ser considerada concluída." }, en: { term: "Exit criteria", def: "Conditions that determine when a test or review activity can be considered complete." } },

  // Capítulo 4 — Técnicas de Teste (18 termos)
  { id: "gl-tec-01", chapter: 4, pt: { term: "Caixa-preta", def: "Categoria de técnicas de teste que derivam casos a partir da especificação, sem conhecimento da estrutura interna do sistema." }, en: { term: "Black-box", def: "A category of test techniques that derive test cases from the specification, without knowledge of the system's internal structure." } },
  { id: "gl-tec-02", chapter: 4, pt: { term: "Caixa-branca", def: "Categoria de técnicas de teste que derivam casos a partir da estrutura interna do código, como fluxo de controle e decisões." }, en: { term: "White-box", def: "A category of test techniques that derive test cases from the internal structure of the code, such as control flow and decisions." } },
  { id: "gl-tec-03", chapter: 4, pt: { term: "Particionamento de equivalência", def: "Técnica caixa-preta que divide o domínio de entrada em partições onde todos os valores são tratados de forma equivalente pelo sistema." }, en: { term: "Equivalence partitioning", def: "A black-box technique that divides the input domain into partitions where all values are expected to be treated equivalently by the system." } },
  { id: "gl-tec-04", chapter: 4, pt: { term: "Valor-fronteira", def: "Análise (BVA) que testa os limites entre partições de equivalência, onde defeitos tendem a se concentrar." }, en: { term: "Boundary value analysis", def: "A technique (BVA) that tests the boundaries between equivalence partitions, where defects tend to cluster." } },
  { id: "gl-tec-05", chapter: 4, pt: { term: "Tabela de decisão", def: "Técnica caixa-preta que representa combinações de condições (causas) e suas ações (efeitos) resultantes, útil para regras de negócio." }, en: { term: "Decision table", def: "A black-box technique that represents combinations of conditions (causes) and their resulting actions (effects), useful for business rules." } },
  { id: "gl-tec-06", chapter: 4, pt: { term: "Transição de estado", def: "Técnica caixa-preta que modela o comportamento de um sistema como estados, eventos e transições entre eles." }, en: { term: "State transition", def: "A black-box technique that models a system's behavior as states, events, and the transitions between them." } },
  { id: "gl-tec-07", chapter: 4, pt: { term: "Cobertura de instrução", def: "Medida de cobertura caixa-branca que indica a porcentagem de instruções executáveis exercitadas pelos testes." }, en: { term: "Statement coverage", def: "A white-box coverage measure indicating the percentage of executable statements exercised by the tests." } },
  { id: "gl-tec-08", chapter: 4, pt: { term: "Cobertura de decisão", def: "Medida de cobertura caixa-branca que indica se cada decisão foi exercitada como verdadeira e como falsa. Mais forte que a cobertura de instrução." }, en: { term: "Decision coverage", def: "A white-box coverage measure indicating whether each decision has been exercised as both true and false. Stronger than statement coverage." } },
  { id: "gl-tec-09", chapter: 4, pt: { term: "MC/DC", def: "Modified Condition/Decision Coverage. Critério de cobertura rigoroso que exige que cada condição afete independentemente o resultado da decisão. Usado em sistemas críticos (aviação, automotivo)." }, en: { term: "MC/DC", def: "Modified Condition/Decision Coverage. A rigorous coverage criterion requiring each condition to independently affect the decision's outcome. Used in safety-critical systems (aviation, automotive)." } },
  { id: "gl-tec-10", chapter: 4, pt: { term: "Teste exploratório", def: "Abordagem baseada em experiência em que aprendizado, design e execução de testes ocorrem simultaneamente, guiados pelo conhecimento do testador." }, en: { term: "Exploratory testing", def: "An experience-based approach in which learning, test design, and execution occur simultaneously, guided by the tester's knowledge." } },
  { id: "gl-tec-11", chapter: 4, pt: { term: "Suposição de erro", def: "Técnica baseada em experiência (error guessing) que antecipa defeitos prováveis com base em conhecimento de falhas comuns." }, en: { term: "Error guessing", def: "An experience-based technique that anticipates likely defects based on knowledge of common failure modes." } },
  { id: "gl-tec-12", chapter: 4, pt: { term: "Checklist", def: "Técnica baseada em experiência que utiliza uma lista de itens a verificar, derivada de heurísticas e lições aprendidas." }, en: { term: "Checklist", def: "An experience-based technique that uses a list of items to verify, derived from heuristics and lessons learned." } },
  { id: "gl-tec-13", chapter: 4, pt: { term: "ATDD", def: "Acceptance Test-Driven Development. Abordagem colaborativa em que testes de aceitação são definidos antes da implementação, a partir dos critérios de aceitação." }, en: { term: "ATDD", def: "Acceptance Test-Driven Development. A collaborative approach in which acceptance tests are defined before implementation, based on acceptance criteria." } },
  { id: "gl-tec-14", chapter: 4, pt: { term: "BDD", def: "Behavior-Driven Development. Abordagem que descreve o comportamento esperado do sistema em linguagem natural estruturada (Given-When-Then), guiando o desenvolvimento e os testes." }, en: { term: "BDD", def: "Behavior-Driven Development. An approach that describes the system's expected behavior in structured natural language (Given-When-Then), guiding development and testing." } },
  { id: "gl-tec-15", chapter: 4, pt: { term: "Condição de teste", def: "Item ou evento que pode ser verificado por um ou mais casos de teste, derivado da base de teste." }, en: { term: "Test condition", def: "An item or event that can be verified by one or more test cases, derived from the test basis." } },
  { id: "gl-tec-16", chapter: 4, pt: { term: "Critérios de aceitação", def: "Conjunto de condições que uma user story deve satisfazer para ser considerada concluída e aceita." }, en: { term: "Acceptance criteria", def: "A set of conditions that a user story must satisfy to be considered complete and accepted." } },
  { id: "gl-tec-17", chapter: 4, pt: { term: "Cobertura de condição", def: "Critério de cobertura caixa-branca que exige que cada condição individual dentro de uma decisão seja exercitada como verdadeira e como falsa." }, en: { term: "Condition coverage", def: "A white-box coverage criterion requiring each individual condition within a decision to be exercised as both true and false." } },
  { id: "gl-tec-18", chapter: 4, pt: { term: "Test charter", def: "Documento breve que define a missão ou foco de uma sessão de teste exploratório com tempo determinado (time-boxed)." }, en: { term: "Test charter", def: "A brief document defining the mission or focus of a time-boxed exploratory testing session." } },

  // Capítulo 5 — Gerenciamento (17 termos)
  { id: "gl-mgmt-01", chapter: 5, pt: { term: "Plano de teste", def: "Documento que descreve escopo, objetivos, abordagem, recursos, cronograma, riscos e critérios de entrada/saída do esforço de teste." }, en: { term: "Test plan", def: "A document describing the scope, objectives, approach, resources, schedule, risks, and entry/exit criteria of the test effort." } },
  { id: "gl-mgmt-02", chapter: 5, pt: { term: "Estratégia de teste", def: "Descrição geral, em nível organizacional, da abordagem de teste a ser aplicada nos projetos." }, en: { term: "Test strategy", def: "A general, organization-level description of the testing approach to be applied across projects." } },
  { id: "gl-mgmt-03", chapter: 5, pt: { term: "Risco de produto", def: "Possibilidade de o produto não atender às necessidades do usuário ou apresentar defeitos que afetem sua qualidade." }, en: { term: "Product risk", def: "The possibility that the product may not meet user needs or may have defects affecting its quality." } },
  { id: "gl-mgmt-04", chapter: 5, pt: { term: "Risco de projeto", def: "Possibilidade de eventos que afetem a capacidade do projeto de atingir seus objetivos, como prazo, custo e recursos." }, en: { term: "Project risk", def: "The possibility of events affecting the project's ability to meet its objectives, such as schedule, cost, and resources." } },
  { id: "gl-mgmt-05", chapter: 5, pt: { term: "Teste baseado em risco", def: "Abordagem que usa a avaliação de risco (probabilidade × impacto) para priorizar o que testar, quanto e em que ordem." }, en: { term: "Risk-based testing", def: "An approach that uses risk assessment (probability × impact) to prioritize what to test, how much, and in what order." } },
  { id: "gl-mgmt-06", chapter: 5, pt: { term: "Severidade", def: "Medida do impacto técnico de um defeito sobre o sistema." }, en: { term: "Severity", def: "A measure of the technical impact a defect has on the system." } },
  { id: "gl-mgmt-07", chapter: 5, pt: { term: "Prioridade", def: "Medida da urgência de correção de um defeito, sob a ótica do negócio. Pode ser independente da severidade." }, en: { term: "Priority", def: "A measure of the urgency of fixing a defect, from a business perspective. Can be independent of severity." } },
  { id: "gl-mgmt-08", chapter: 5, pt: { term: "Rastreabilidade", def: "Capacidade de relacionar elementos da base de teste (requisitos, riscos) com condições e casos de teste, apoiando análise de cobertura e impacto." }, en: { term: "Traceability", def: "The ability to relate test basis elements (requirements, risks) to test conditions and cases, supporting coverage and impact analysis." } },
  { id: "gl-mgmt-09", chapter: 5, pt: { term: "Monitoramento de teste", def: "Atividade que coleta informações sobre o progresso do teste para compará-las com o planejado." }, en: { term: "Test monitoring", def: "An activity that collects information about test progress to compare it against what was planned." } },
  { id: "gl-mgmt-10", chapter: 5, pt: { term: "Controle de teste", def: "Atividade que toma ações corretivas (replanejar, realocar) com base nas informações do monitoramento de teste." }, en: { term: "Test control", def: "An activity that takes corrective actions (replanning, reallocating) based on information from test monitoring." } },
  { id: "gl-mgmt-11", chapter: 5, pt: { term: "Gestão de configuração", def: "Prática que garante identificação e versionamento consistentes de itens de teste e testware, com rastreabilidade." }, en: { term: "Configuration management", def: "A practice that ensures consistent identification and versioning of test items and testware, with traceability." } },
  { id: "gl-mgmt-12", chapter: 5, pt: { term: "Pirâmide de teste", def: "Modelo que recomenda muitos testes de unidade na base e poucos testes de UI/E2E no topo, equilibrando velocidade e custo." }, en: { term: "Test pyramid", def: "A model recommending many unit tests at the base and few UI/E2E tests at the top, balancing speed and cost." } },
  { id: "gl-mgmt-13", chapter: 5, pt: { term: "Quadrantes de teste", def: "Modelo que classifica tipos de teste por foco em negócio/tecnologia e por apoiar a equipe ou criticar o produto." }, en: { term: "Testing quadrants", def: "A model classifying test types by business/technology focus and by whether they support the team or critique the product." } },
  { id: "gl-mgmt-14", chapter: 5, pt: { term: "Definition of Done", def: "Conjunto de critérios de saída acordados pela equipe, que define quando um item de trabalho é considerado verdadeiramente concluído." }, en: { term: "Definition of Done", def: "A set of exit criteria agreed upon by the team, defining when a work item is considered truly complete." } },
  { id: "gl-mgmt-15", chapter: 5, pt: { term: "Relatório de progresso de teste", def: "Documento que informa as partes interessadas sobre o andamento do teste e apoia decisões durante a execução." }, en: { term: "Test progress report", def: "A document informing stakeholders about testing progress and supporting decisions during execution." } },
  { id: "gl-mgmt-16", chapter: 5, pt: { term: "Relatório de conclusão de teste", def: "Documento produzido ao final de um nível ou marco de teste, resumindo resultados, cobertura e lições aprendidas." }, en: { term: "Test completion report", def: "A document produced at the end of a test level or milestone, summarizing results, coverage, and lessons learned." } },
  { id: "gl-mgmt-17", chapter: 5, pt: { term: "Análise de impacto", def: "Avaliação das mudanças necessárias no testware e nas áreas do sistema afetadas por uma alteração, usada na manutenção." }, en: { term: "Impact analysis", def: "Assessment of the changes needed in testware and the system areas affected by a modification, used in maintenance testing." } },

  // Capítulo 6 — Ferramentas (5 termos)
  { id: "gl-fer-01", chapter: 6, pt: { term: "Ferramenta de gestão de teste", def: "Ferramenta que apoia o gerenciamento de casos de teste, execução, rastreabilidade e relatórios (ex: Jira+Xray, TestRail)." }, en: { term: "Test management tool", def: "A tool that supports managing test cases, execution, traceability, and reporting (e.g., Jira+Xray, TestRail)." } },
  { id: "gl-fer-02", chapter: 6, pt: { term: "Ferramenta de análise estática", def: "Ferramenta que examina código ou outros artefatos sem executá-los, identificando violações de padrões e vulnerabilidades." }, en: { term: "Static analysis tool", def: "A tool that examines code or other artifacts without executing them, identifying standard violations and vulnerabilities." } },
  { id: "gl-fer-03", chapter: 6, pt: { term: "ROI da automação", def: "Retorno sobre investimento da automação de teste, que depende do custo de implementação e manutenção frente aos benefícios de execução repetida." }, en: { term: "Automation ROI", def: "Return on investment of test automation, which depends on implementation and maintenance cost relative to the benefits of repeated execution." } },
  { id: "gl-fer-04", chapter: 6, pt: { term: "Projeto piloto", def: "Implantação inicial e limitada de uma ferramenta nova, usada para avaliar seu ajuste à organização antes da adoção em larga escala." }, en: { term: "Pilot project", def: "An initial, limited deployment of a new tool, used to evaluate its fit with the organization before large-scale adoption." } },
  { id: "gl-fer-05", chapter: 6, pt: { term: "Prova de conceito", def: "Avaliação prática (PoC) de uma ferramenta para verificar se ela atende aos requisitos antes de uma decisão formal de adoção." }, en: { term: "Proof of concept", def: "A practical evaluation (PoC) of a tool to verify it meets requirements before a formal adoption decision." } }
];

export function localizedGlossary(lang = "pt") {
  return GLOSSARY.map((g) => ({ id: g.id, chapter: g.chapter, ...g[lang] }));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWordBoundaryMatch(text, term) {
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapeRegex(term)}([^\\p{L}\\p{N}]|$)`,
    "iu"
  );
  return pattern.test(text);
}

// Helper para o link inline: dado um texto de explicação, encontra
// termos do glossário mencionados nele (case-insensitive, match por palavra)
export function findGlossaryTermsInText(text, lang = "pt") {
  const terms = localizedGlossary(lang);
  return terms.filter((t) => hasWordBoundaryMatch(text, t.term));
}
