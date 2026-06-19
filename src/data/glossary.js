// Glossário ISTQB CTFL v4.0 — meta de 70 termos essenciais (PT/EN).
// TODO: ainda faltam termos dos capítulos 2-6 (atualmente só os 12 de Cap.1/fund).
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
  }
];

export function localizedGlossary(lang = "pt") {
  return GLOSSARY.map((g) => ({ id: g.id, chapter: g.chapter, ...g[lang] }));
}

// Helper para o link inline: dado um texto de explicação, encontra
// termos do glossário mencionados nele (case-insensitive, match por palavra)
export function findGlossaryTermsInText(text, lang = "pt") {
  const terms = localizedGlossary(lang);
  return terms.filter((t) =>
    text.toLowerCase().includes(t.term.toLowerCase())
  );
}
