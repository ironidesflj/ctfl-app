# Plano atual

## Identidade visual — 2026-10-26

Plano incremental em `spec-identidade-visual-2026-10.md`. Etapas 1–3
concluídas localmente; etapa 4 aplicada e conferida visualmente.
Etapa 5 aplicada com contraste calculado e conferida visualmente;
etapa 6 auditada sem necessidade de copiar a landing; etapas 7–8 auditadas,
com melhorias funcionais separadas do patch visual. A revisão navegável
confirmou foco e cabeçalho sticky e corrigiu a paleta de cert no tema escuro.
Os gates locais fecharam com 447 testes, lint, formatação, build e 5 E2E
Chromium. Aceite visual do Iron recebido em 2026-10-26 para commit local
deste lote. Push e publicação dependem de pedido separado.

O plano abaixo registra o estado histórico da fase de proteção canônica.

## Fase autorizada em 2026-10-24

Spec ativa: `spec-canonical-bank-protection.md`. Sem autorização de push.

- Aplicado localmente: reconciliação v1.6.0-ctaltm na fonte, cobertura LIVE
  CTAL-TM nas guardas, proteções de sync/CI e comparação integral de fatias.
- Aplicado localmente: exclusão do snapshot histórico do format check.
- Evidência técnica: 11 testes de proteção, 443 testes app, cinco E2E,
  formatação/lint/build aprovados; fontes/fatias idênticas.
- NÃO CONCLUÍDO: revisão editorial integral CTAL-TM. Quatro guardas permanecem
  bloqueantes. Não alterar baseline/threshold para fechar a fase.
- Após revisão: versionar alterações de conteúdo na fonte, regenerar fatias,
  validar tudo e apresentar os diffs. Publicar primeiro a fonte e depois o app
  somente após autorização; não enviar esta fase como se o conteúdo estivesse verde.

## Registro histórico do plano anterior

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

## Fechado e publicado — v3.12.0

1. Pools exclusivos para estudo e simulado nas certificações live.
2. Pontuação oficial ponderada do CTAL-TA e tempos nativos BSTQB.
3. Cobertura, prontidão, SRS, erradas, salvos e pontos fracos restritos ao pool
   de estudo; simulados oficiais e personalizados restritos ao pool de prova.
4. Comunicação da release 3.12 e renovação do cache PWA.

## Implementado localmente — v3.13.0

1. Conteúdo completo de Flashcards, Syllabus e Glossário para CTAL-TA em PT/EN.
2. Escopo explícito de conteúdo por certificação e capítulo, incluindo SRS.
3. Heatmap de 12 semanas com calendário real, detalhe interativo e alvos de
   toque acessíveis.
4. Comunicação da release 3.13 e renovação do cache PWA.

## Pendentes solicitados pelo Iron

Nenhum dos dois itens registrados em 2026-10-14 permanece pendente de
implementação: foram tratados separadamente em `spec-institutional-access.md`
e `spec-global-feedback.md` e já estão publicados. A v3.13 permanece local até
validação final e autorização posterior para commit/push.

## Adiado por decisão do Iron

- Integração Flashcards → Stats.
- Escolha e preparação da próxima certificação live.

## Dívidas conhecidas, não bloqueantes

- Chunk lazy do CTAL-TA com aproximadamente 669 KB e warning acima de 500 KB.
- CT-AI, CTAL-TM e CTFL-AT com dívida psicométrica latente.
- `ctalta-106` e `ctalta-120` continuam inconclusivos e visíveis até decisão de
  conteúdo específica.
- `vite-plugin-pwa` permanece inerte em `devDependencies`; remoção exige
  reconciliar os lockfiles npm/Bun no mesmo lote.
