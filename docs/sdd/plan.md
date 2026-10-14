# Plano atual

## Fechado nesta fase

1. Reconciliação e versionamento do SDD.
2. Gates técnicos do app + smoke E2E.
3. Governança das baselines/threshold do banco e documentação de sync.
4. Aplicação e reconciliação da v3.11.0 contra as auditorias E2E e independente,
   preservando os gates canônicos do SDD.
5. Code-split lazy dos bancos live, PWA autoral/offline e pacote de correções e
   features r2–r12 descrito no changelog da v3.11.0.
6. Comunicação de releases significativas uma vez por versão, preservando o
   toast técnico do PWA; home institucional reconciliada com o estado live.
7. Acesso institucional permanente e feedback global por Issue Form, publicados
   em `origin/main` no commit `172a2db`.

## Implementado localmente — v3.12.0

1. Pools exclusivos para estudo e simulado nas certificações live.
2. Pontuação oficial ponderada do CTAL-TA e tempos nativos BSTQB.
3. Cobertura, prontidão, SRS, erradas, salvos e pontos fracos restritos ao pool
   de estudo; simulados oficiais e personalizados restritos ao pool de prova.
4. Comunicação da release 3.12 e renovação do cache PWA.

## Pendentes solicitados pelo Iron

Nenhum dos dois itens registrados em 2026-10-14 permanece pendente de
implementação: foram tratados separadamente em `spec-institutional-access.md`
e `spec-global-feedback.md` e já estão publicados. A v3.12 permanece local até
validação final e autorização posterior para commit/push.

## Adiado por decisão do Iron

- Integração Flashcards → Stats.
- Escolha e preparação da próxima certificação live.

## Dívidas conhecidas, não bloqueantes

- Chunk lazy do CTAL-TA com aproximadamente 669 KB e warning acima de 500 KB.
- Conteúdo de Flashcards/Syllabus/Glossário disponível apenas para CTFL.
- CT-AI, CTAL-TM e CTFL-AT com dívida psicométrica latente.
- `ctalta-106` e `ctalta-120` continuam inconclusivos e visíveis até decisão de
  conteúdo específica.
- `vite-plugin-pwa` permanece inerte em `devDependencies`; remoção exige
  reconciliar os lockfiles npm/Bun no mesmo lote.
