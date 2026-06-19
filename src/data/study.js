export const FLASHCARDS = [
  { id: "fc-fund-01", d: "fund", locales: { pt: { front: "7 Princípios de Teste", back: "1. Teste mostra presença de defeitos\n2. Teste exaustivo é impossível\n3. Testes antecipados economizam\n4. Agrupamento de defeitos\n5. Paradoxo do pesticida\n6. Teste depende do contexto\n7. Ausência de erros é falácia" } } },
  { id: "fc-fund-02", d: "fund", locales: { pt: { front: "Erro → Defeito → Falha", back: "Erro: ação humana que gera resultado incorreto\nDefeito: a manifestação do erro no artefato/código\nFalha: comportamento incorreto observado em execução" } } },
  { id: "fc-fund-03", d: "fund", locales: { pt: { front: "Verificação vs Validação", back: "Verificação: \"construímos corretamente?\" (vs. especificação)\nValidação: \"construímos o produto certo?\" (vs. necessidade real)" } } },
  { id: "fc-proc-01", d: "proc", locales: { pt: { front: "Atividades do Processo de Teste (v4.0)", back: "1. Planejamento\n2. Monitoramento e Controle\n3. Análise\n4. Modelagem\n5. Implementação\n6. Execução\n7. Conclusão" } } },
  { id: "fc-proc-02", d: "proc", locales: { pt: { front: "Níveis de Teste", back: "• Componente / Unidade\n• Integração de componentes\n• Sistema\n• Integração de sistema\n• Aceitação (UAT, operacional, contratual, regulatório)" } } },
  { id: "fc-proc-03", d: "proc", locales: { pt: { front: "Confirmação vs Regressão", back: "Confirmação (re-teste): re-executa o caso que falhou após a correção\nRegressão: verifica se a mudança não quebrou áreas não alteradas" } } },
  { id: "fc-est-01", d: "est", locales: { pt: { front: "Tipos de Revisão (menos → mais formal)", back: "Informal → Walkthrough → Revisão Técnica → Inspeção\n\nInspeção = mais formal: moderador, papéis, métricas, entry/exit criteria" } } },
  { id: "fc-est-02", d: "est", locales: { pt: { front: "Papéis numa revisão formal", back: "Moderador (lidera), Autor (responsável pelo artefato/retrabalho), Escriba (registra), Revisores (encontram defeitos), Gestor (decide)" } } },
  { id: "fc-tec-01", d: "tec", locales: { pt: { front: "BVA 2 pontos vs 3 pontos", back: "2 pontos: o limite e o adjacente inválido (ex: 17, 18 / 65, 66)\n3 pontos: o limite, 1 abaixo e 1 acima (ex: 17, 18, 19 / 64, 65, 66)" } } },
  { id: "fc-tec-02", d: "tec", locales: { pt: { front: "Famílias de Técnicas", back: "Caixa-preta: EP, BVA, tabela de decisão, transição de estados\nCaixa-branca: cobertura de instrução, decisão\nExperiência: suposição de erro, exploratório, checklist" } } },
  { id: "fc-tec-03", d: "tec", locales: { pt: { front: "Cobertura: instruções vs decisões", back: "100% de cobertura de decisões garante 100% de instruções, mas não o contrário. Decisão é a cobertura mais forte das duas." } } },
  { id: "fc-mgmt-01", d: "mgmt", locales: { pt: { front: "Nível de Risco", back: "Risco = Probabilidade de ocorrência × Impacto\n\nUsado para priorizar: maior risco → testado primeiro e com mais profundidade" } } },
  { id: "fc-mgmt-02", d: "mgmt", locales: { pt: { front: "Severidade vs Prioridade", back: "Severidade: impacto técnico do defeito no sistema\nPrioridade: urgência de correção sob a ótica do negócio\n(podem ser independentes)" } } },
  { id: "fc-mgmt-03", d: "mgmt", locales: { pt: { front: "Risco de Produto vs Projeto", back: "Produto: afeta a qualidade do produto (falha, segurança, desempenho)\nProjeto: afeta atingir os objetivos (prazo, custo, recursos, fornecedor)" } } },
  { id: "fc-fer-01", d: "fer", locales: { pt: { front: "Benefícios e Riscos da Automação", back: "Benefícios: velocidade, repetibilidade, regressão consistente\nRiscos: custo de manutenção, falsa sensação de segurança, ROI incerto se mal planejada" } } }
];

export const SYLLABUS_ITEMS = [
  { id: "syl-fund-01", d: "fund", locales: { pt: { kw: "Erro → Defeito → Falha", desc: "Cadeia causal: ação humana (erro) gera defeito no artefato, que ao executar causa falha." } } },
  { id: "syl-fund-02", d: "fund", locales: { pt: { kw: "7 Princípios de Teste", desc: "Todos podem cair. Memorize a lista e um exemplo de cada (pesticida, agrupamento, etc.)." } } },
  { id: "syl-fund-03", d: "fund", locales: { pt: { kw: "Processo e Atividades", desc: "Planejamento, monitoramento/controle, análise, modelagem, implementação, execução, conclusão." } } },
  { id: "syl-proc-01", d: "proc", locales: { pt: { kw: "Níveis e Tipos", desc: "Níveis: componente, integração, sistema, aceitação. Tipos: funcional, não-funcional, caixa-branca, mudança." } } },
  { id: "syl-proc-02", d: "proc", locales: { pt: { kw: "Confirmação e Regressão", desc: "Re-teste confirma a correção; regressão detecta efeitos colaterais de mudanças." } } },
  { id: "syl-proc-03", d: "proc", locales: { pt: { kw: "Manutenção e gatilhos", desc: "Modificações, migração, atualização e aposentadoria disparam teste de manutenção." } } },
  { id: "syl-est-01", d: "est", locales: { pt: { kw: "Estática vs Dinâmica", desc: "Estática: sem execução (revisões, análise). Dinâmica: executando. Encontram defeitos diferentes." } } },
  { id: "syl-est-02", d: "est", locales: { pt: { kw: "Processo de Revisão", desc: "Planejamento, início, revisão individual, comunicação/análise, correção. Conheça os papéis." } } },
  { id: "syl-tec-01", d: "tec", locales: { pt: { kw: "Caixa-preta", desc: "EP, BVA, tabela de decisão, transição de estados. Aplicação (K3): calcular fronteiras, montar regras." } } },
  { id: "syl-tec-02", d: "tec", locales: { pt: { kw: "Caixa-branca", desc: "Cobertura de instrução vs decisão; decisão é mais forte que instrução." } } },
  { id: "syl-tec-03", d: "tec", locales: { pt: { kw: "Baseadas em experiência", desc: "Suposição de erro, exploratório, checklist. Complementam as formais." } } },
  { id: "syl-mgmt-01", d: "mgmt", locales: { pt: { kw: "Planejamento e Risco", desc: "Plano, estimativa, teste baseado em risco (probabilidade × impacto), critérios de entrada/saída." } } },
  { id: "syl-mgmt-02", d: "mgmt", locales: { pt: { kw: "Monitoramento e Defeitos", desc: "Métricas, relatórios, gestão de configuração e relatório de defeito (severidade vs prioridade)." } } },
  { id: "syl-fer-01", d: "fer", locales: { pt: { kw: "Categorias de Ferramentas", desc: "Gestão, estática, execução, dados, desempenho. Cada uma apoia uma atividade." } } },
  { id: "syl-fer-02", d: "fer", locales: { pt: { kw: "Benefícios e Riscos", desc: "ROI da automação, manutenção, seleção de ferramenta, projeto piloto antes de escalar." } } }
];

export function localizedFlashcard(card, lang = "pt") {
  const loc = card.locales[lang] || card.locales.pt;
  return { id: card.id, d: card.d, ...loc };
}

export function flashcardsInLang(lang = "pt") {
  return FLASHCARDS.map((c) => localizedFlashcard(c, lang));
}

export function localizedSyllabusItem(item, lang = "pt") {
  const loc = item.locales[lang] || item.locales.pt;
  return { id: item.id, d: item.d, ...loc };
}

export function syllabusInLang(lang = "pt") {
  return SYLLABUS_ITEMS.map((i) => localizedSyllabusItem(i, lang));
}
