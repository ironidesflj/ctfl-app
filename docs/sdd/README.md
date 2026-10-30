# SDD canônico do Synapse

Esta é a fonte versionada para decisões de produto e estado entre o app Synapse
e o repositório `ctfl-question-bank-ptbr`. Os registros com data identificam
qual fase descrevem; use o cabeçalho de `current-state.md` para o estado mais
recente deste checkout.

## Arquivos ativos

- `constitution.md`: regras permanentes de decisão, execução e fechamento.
- `current-state.md`: estado verificado e histórico de integrações dos dois
  repositórios.
- `plan.md`: próximos itens autorizados, adiados e fora de escopo.
- `axon-adoption-plan.md`: auditoria do dossiê Noos e rollout seguro das cinco
  fatias, preservando IDs internas e o pool de simulado.
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
