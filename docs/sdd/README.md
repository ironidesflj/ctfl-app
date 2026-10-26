# SDD canônico do Synapse

Esta é a fonte de verdade versionada para decisões de produto e estado entre os
repositórios `ctfl-app` e `ctfl-question-bank-ptbr`.

## Arquivos ativos

- `spec-identidade-visual-2026-10.md`: aplicação gradual do patch visual,
  etapas concluídas localmente e próximas verificações.

- `constitution.md`: regras permanentes de decisão, execução e fechamento.
- `current-state.md`: estado verificado dos dois repositórios.
- `plan.md`: próximos itens autorizados, adiados e fora de escopo.
- `spec-onboarding-reentry.md`: spec histórica reconstruída e fechada.
- `spec-release-communication.md`: toast técnico + modal de novidades para
  releases significativas.
- `spec-institutional-access.md`: retorno global à apresentação completa sem
  perder rota ou estado.
- `spec-global-feedback.md`: canal externo público com aviso de privacidade e
  nenhuma coleta pelo app.

As specs 1 (Stats/gamificação), 2 (prontidão por blueprint) e 3
(desalinhamento de letra) estão fechadas. O snapshot histórico detalhado que
originou este diretório permanece no workspace agregador em `sdd_extracted/`,
mas não é mais canônico porque não pertence a um repositório Git.

Toda atualização futura deve alterar `current-state.md` e `plan.md` no mesmo
lote do código/documentação correspondente. Mudanças no banco devem registrar
o commit daquele repositório e a saída determinística das guardas.
