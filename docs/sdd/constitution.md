# Constitution — Synapse

1. Iron é a autoridade de aprovação de fase e push.
2. Nenhuma tarefa fecha por relato: exige diff, exit code, teste ou assert
   reproduzível.
3. Todo bug corrigido deve ganhar teste ou guarda permanente quando aplicável.
4. Uma fase trata um conceito; expansão de escopo exige nova decisão.
5. Implementação não reescreve a decisão que deveria cumprir.
6. Toda spec declara régua objetiva de fidelidade e pode falhar por desvio de
   escopo mesmo com testes verdes.
7. Edições de JSON grande usam alvo/âncora específica e validação de diff.
8. Auditoria de conteúdo aceita `INCONCLUSIVO`; esses casos ficam fora de
   baselines de falsos positivos e recebem allowlist explícita por guarda.
9. Threshold de CI é global e estrito; o estado normal é zero suspeita nova.
10. Regras de exame vêm de fonte oficial e ficam no JSON por certificação, não
    hardcoded na UI.
11. README, CHANGELOG e CI fazem parte da régua de fechamento.
12. `docs/sdd/` neste repositório é o local canônico do SDD. Snapshots externos
    são históricos e não substituem este registro versionado.
