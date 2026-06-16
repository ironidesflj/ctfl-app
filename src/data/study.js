export const FLASHCARDS = [
  { d: "fund", front: "7 Princípios de Teste", back: "1. Teste mostra presença de defeitos\n2. Teste exaustivo é impossível\n3. Testes antecipados economizam\n4. Agrupamento de defeitos\n5. Paradoxo do pesticida\n6. Teste depende do contexto\n7. Ausência de erros é falácia" },
  { d: "fund", front: "Erro → Defeito → Falha", back: "Erro: ação humana que gera resultado incorreto\nDefeito: a manifestação do erro no artefato/código\nFalha: comportamento incorreto observado em execução" },
  { d: "fund", front: "Verificação vs Validação", back: "Verificação: \"construímos corretamente?\" (vs. especificação)\nValidação: \"construímos o produto certo?\" (vs. necessidade real)" },
  { d: "proc", front: "Atividades do Processo de Teste (v4.0)", back: "1. Planejamento\n2. Monitoramento e Controle\n3. Análise\n4. Modelagem\n5. Implementação\n6. Execução\n7. Conclusão" },
  { d: "proc", front: "Níveis de Teste", back: "• Componente / Unidade\n• Integração de componentes\n• Sistema\n• Integração de sistema\n• Aceitação (UAT, operacional, contratual, regulatório)" },
  { d: "proc", front: "Confirmação vs Regressão", back: "Confirmação (re-teste): re-executa o caso que falhou após a correção\nRegressão: verifica se a mudança não quebrou áreas não alteradas" },
  { d: "est", front: "Tipos de Revisão (menos → mais formal)", back: "Informal → Walkthrough → Revisão Técnica → Inspeção\n\nInspeção = mais formal: moderador, papéis, métricas, entry/exit criteria" },
  { d: "est", front: "Papéis numa revisão formal", back: "Moderador (lidera), Autor (responsável pelo artefato/retrabalho), Escriba (registra), Revisores (encontram defeitos), Gestor (decide)" },
  { d: "tec", front: "BVA 2 pontos vs 3 pontos", back: "2 pontos: o limite e o adjacente inválido (ex: 17, 18 / 65, 66)\n3 pontos: o limite, 1 abaixo e 1 acima (ex: 17, 18, 19 / 64, 65, 66)" },
  { d: "tec", front: "Famílias de Técnicas", back: "Caixa-preta: EP, BVA, tabela de decisão, transição de estados\nCaixa-branca: cobertura de instrução, decisão\nExperiência: suposição de erro, exploratório, checklist" },
  { d: "tec", front: "Cobertura: instruções vs decisões", back: "100% de cobertura de decisões garante 100% de instruções, mas não o contrário. Decisão é a cobertura mais forte das duas." },
  { d: "mgmt", front: "Nível de Risco", back: "Risco = Probabilidade de ocorrência × Impacto\n\nUsado para priorizar: maior risco → testado primeiro e com mais profundidade" },
  { d: "mgmt", front: "Severidade vs Prioridade", back: "Severidade: impacto técnico do defeito no sistema\nPrioridade: urgência de correção sob a ótica do negócio\n(podem ser independentes)" },
  { d: "mgmt", front: "Risco de Produto vs Projeto", back: "Produto: afeta a qualidade do produto (falha, segurança, desempenho)\nProjeto: afeta atingir os objetivos (prazo, custo, recursos, fornecedor)" },
  { d: "fer", front: "Benefícios e Riscos da Automação", back: "Benefícios: velocidade, repetibilidade, regressão consistente\nRiscos: custo de manutenção, falsa sensação de segurança, ROI incerto se mal planejada" }
];

export const SYLLABUS_ITEMS = [
  { d: "fund", kw: "Erro → Defeito → Falha", desc: "Cadeia causal: ação humana (erro) gera defeito no artefato, que ao executar causa falha." },
  { d: "fund", kw: "7 Princípios de Teste", desc: "Todos podem cair. Memorize a lista e um exemplo de cada (pesticida, agrupamento, etc.)." },
  { d: "fund", kw: "Processo e Atividades", desc: "Planejamento, monitoramento/controle, análise, modelagem, implementação, execução, conclusão." },
  { d: "proc", kw: "Níveis e Tipos", desc: "Níveis: componente, integração, sistema, aceitação. Tipos: funcional, não-funcional, caixa-branca, mudança." },
  { d: "proc", kw: "Confirmação e Regressão", desc: "Re-teste confirma a correção; regressão detecta efeitos colaterais de mudanças." },
  { d: "proc", kw: "Manutenção e gatilhos", desc: "Modificações, migração, atualização e aposentadoria disparam teste de manutenção." },
  { d: "est", kw: "Estática vs Dinâmica", desc: "Estática: sem execução (revisões, análise). Dinâmica: executando. Encontram defeitos diferentes." },
  { d: "est", kw: "Processo de Revisão", desc: "Planejamento, início, revisão individual, comunicação/análise, correção. Conheça os papéis." },
  { d: "tec", kw: "Caixa-preta", desc: "EP, BVA, tabela de decisão, transição de estados. Aplicação (K3): calcular fronteiras, montar regras." },
  { d: "tec", kw: "Caixa-branca", desc: "Cobertura de instrução vs decisão; decisão é mais forte que instrução." },
  { d: "tec", kw: "Baseadas em experiência", desc: "Suposição de erro, exploratório, checklist. Complementam as formais." },
  { d: "mgmt", kw: "Planejamento e Risco", desc: "Plano, estimativa, teste baseado em risco (probabilidade × impacto), critérios de entrada/saída." },
  { d: "mgmt", kw: "Monitoramento e Defeitos", desc: "Métricas, relatórios, gestão de configuração e relatório de defeito (severidade vs prioridade)." },
  { d: "fer", kw: "Categorias de Ferramentas", desc: "Gestão, estática, execução, dados, desempenho. Cada uma apoia uma atividade." },
  { d: "fer", kw: "Benefícios e Riscos", desc: "ROI da automação, manutenção, seleção de ferramenta, projeto piloto antes de escalar." }
];
