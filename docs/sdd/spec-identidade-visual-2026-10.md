# Identidade visual Synapse — aplicação por etapas

Referências: `synapse-patch.md` e `synapse-patch.html` recebidos em 2026-10-26.
A prévia HTML é referência visual; o código e os dados existentes do app prevalecem.
O seletor atual de certificações é a referência aprovada pelo Iron.

## Estado nesta rodada

1. **Concluído localmente — seletor e cabeçalho:** cartões existentes preservados
   (símbolos, cores, fonte dos códigos, borda tracejada e rótulo “em breve”);
   sombra leve e tile do cabeçalho reduzido. O nome do produto passa a ser
   sempre “Synapse” no cabeçalho; certificação fica no subtítulo e no chip.
   Sem mudança de navegação.
2. **Concluído localmente — marca:** traço curvo e nós refinados; marca do
   cabeçalho usa o violeta Synapse em qualquer certificação. A marca colorida
   dos cartões continua identificando cada cert.
3. **Concluído localmente — leitura do quiz:** enunciado 18 px e 58ch no
   desktop, 16 px no mobile; alternativas 15/14 px. Testes do quiz: 23/23.
4. **Concluído localmente — acesso durante rolagem:** cabeçalho fica sticky
   apenas quando a tela contém o quiz (incluindo revisão/resultado). Na
   revisão longa, “Voltar ao resultado” fica visível e aponta para o resumo
   sem reiniciar a sessão. Cabeçalho em `top: 0` verificado no navegador e
   atalho coberto por E2E. A ação “Voltar” e as abas foram preservadas.

## Restante do patch, em ordem sugerida

5. **Acessibilidade visual — verificada localmente:** contraste
   calculado para bordas de controles (`#7a7396` sobre papel: 4,10:1;
   `#6b6590` sobre superfície escura: 3,24:1). Abas, alternativas e cartões
   “em breve” usam esse token. A opacidade dos cartões desabilitados foi
   removida para preservar a leitura; o tracejado e o texto mantêm o estado
   explícito. O anel de foco de 2 px já existia. O seletor foi inspecionado
   no navegador e medido em viewport de 390 px sem overflow horizontal.
   Na revisão navegável, foco por teclado exibiu anel sólido de 2 px e o
   cabeçalho permaneceu em `top: 0` após rolagem. O tema escuro revelou um
   bug preexistente: a preferência fica no elemento raiz e a regra de cor por
   certificação exigia tema e cert no mesmo elemento. Os seletores foram
   corrigidos e a cor CTFL escura foi confirmada no navegador (`#b9aeff`
   para texto, `#241f3d` para fundo suave). Tema claro forçado também deixa
   de herdar a paleta escura quando o sistema operacional está em dark mode.
   O E2E confirmou cabeçalho e troca de cert a 390 px em três certificações.
6. **Landing e apresentação institucional — auditada:** `Onboarding.jsx` já
   traz badge, quatro indicadores, seis recursos, demo interativa, prova
   social, explicação das métricas, cinco FAQs e autor. Nenhuma dessas seções
   precisa ser copiada do patch. O cartão de retomada proposto fica adiado:
   seus números são demonstrativos e a retomada real depende do estado local
   do usuário. Aceite: não duplicar a apresentação nem publicar números
   fictícios.
7. **Estados e microinterações — auditados, sem reescrita:** já há carregamento
   do banco com `role=status`, estados vazios em Flashcards/Stats, regras de
   movimento reduzido e alvos de 44 px para os controles do cabeçalho em
   ponteiro touch. Erro de carregamento do banco e mensagem offline contextual
   ainda podem ser estudados como melhoria independente; o patch não traz
   evidência para reestruturar esses fluxos agora.
8. **Auditoria funcional — alegações sem confirmação:** o simulado guarda
   `optOrder` no rascunho e restaura a posição correta por `origIndex`; a
   revisão renderiza `q.exp` tanto para acertos quanto para erros. O histórico
   de resultado não oferece snapshot completo para reabrir uma revisão após
   recarregar: isso é uma proposta funcional separada, que precisa de spec de
   compatibilidade antes de implementação. Não alterar gabarito, storage ou
   conteúdo nesta etapa visual.

## Revisão navegável

Abrir o app local pelo Vite, navegar por `/select`, escolher uma certificação,
entrar no Quiz e testar modo Estudo, Simulado, resultado e revisão. Conferir
desktop e viewport 320–430 px em tema claro/escuro, com foco por teclado.
Não usar a prévia HTML estática como substituta desses fluxos reais.

## Fora desta aplicação

- Substituir os cartões por linhas/monogramas da prévia.
- Inserir “by Noos”, “Axon” ou vínculos de marca sem decisão de produto.
- Copiar números ou progresso demonstrativos da prévia para o app real.
- Alterar banco de questões, blueprint, nota de corte, IDs ou pools.

## Gates do lote visual

- 447 testes unitários/de componentes, lint, formatação e build: aprovados.
- 5 fluxos E2E Chromium: aprovados, incluindo troca de cert no mobile,
  simulado com revisão e retorno ao resultado.
- Diff do banco, blueprint, pontuação, pools e persistência: nenhum.
- Revisão visual final no navegador local: aceita pelo Iron em 2026-10-26.

Aceite visual recebido para commit local deste lote. Push e publicação
dependem de pedido separado; propostas funcionais das etapas 7–8 seguem fora
deste lote.
