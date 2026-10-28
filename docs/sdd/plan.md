# Plano atual — 2026-10-28

## Entrega 4.1.0

- Diff do app reformulado e dos seis bancos gerados conferido.
- Gerador, testes, lint, tipos e build aprovados localmente.
- Código enviado à branch `feat/synapse-4-1-redesign` e PR draft #8 aberto para `main`. A revisão automática bloqueou o push direto à branch padrão por causa da substituição ampla; o merge depende de revisão explícita.
- Conferir CI do PR e, após merge, o deploy e os fluxos de primeira visita e atualização em produção.

## Próximos itens, fora desta entrega

- Projetar e testar a migração opcional do progresso 3.18.0 para o modelo 4.1.0, preservando as chaves originais e tratando IDs de questões que mudaram.
- Revalidar as guardas editoriais e a sincronização com `ctfl-question-bank-ptbr` antes de atualizar conteúdo. Não afrouxar thresholds para fechar uma guarda.
- Acrescentar cobertura de navegador para primeira visita, atualização e simulado no novo app.

As specs da fase Vite 3.x são histórico. Decisões ativas de produto e estado ficam em `current-state.md`, neste plano e em `spec-reformulacao-2026-10.md`.
