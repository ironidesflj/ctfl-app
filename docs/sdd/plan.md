# Plano de manutenção pós-release — 2026-11-06

> A 4.1.0 e a integração Axon estão publicadas. Os registros abaixo são
> históricos, exceto a seção “Pendências atuais”.

## Pendências atuais

- Atualizar handoff/memória operacional junto aos próximos ajustes de produto.
- Não alterar o hub sem autorização explícita do usuário.

## Concluído recentemente

- Embaralhamento no modo Estudar: corrigido no PR #17 (permutação por sessão,
  correção e letra do feedback ligadas à posição visual, com teste de
  componente). Simulado já fazia isso; o hub permanece na ordem canônica.

## Adiado ou fora do lote atual

- A revisão editorial CTAL-TM e questões não liberadas permanecem sob a
  governança do banco; disponibilidade técnica no app não significa aprovação.
- Otimização do chunk CTAL-TA e outras melhorias de UX não bloqueiam o release.

> A fase abaixo foi registrada em 2026-10-24 para o app anterior. O checkout
> Vite 4.1.0 atual é descrita em `current-state.md`.

## Fase autorizada em 2026-10-24

Spec ativa: `spec-canonical-bank-protection.md`. Sem autorização de push.

- Aplicado localmente: reconciliação v1.6.0-ctaltm na fonte, cobertura LIVE
  CTAL-TM nas guardas, proteções de sync/CI e comparação integral de fatias.
- Aplicado localmente: exclusão do snapshot histórico do format check.
- Evidência técnica: 11 testes de proteção, 443 testes app, cinco E2E,
  formatação/lint/build aprovados; fontes/fatias idênticas.
- CONCLUÍDO em 09/nov/2026: revisão editorial integral do CTAL-TM (62 itens no
  banco 1.7.3, 0 gabaritos alterados; guardas 7/7). K4 mínimo suprido
  (`ctaltm-121` → TM-1.3.4 K4); ampliação aguarda novo pacote de questões.
- Fluxo seguido: conteúdo primeiro na fonte canônica, depois sync e app, com
  manifesto e paridade SHA verificados.

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
- CT-AI e CTFL-AT com dívida psicométrica latente (CTAL-TM resolvido em 09/nov/2026).
- `ctalta-106` e `ctalta-120` continuam inconclusivos e visíveis até decisão de
  conteúdo específica.
- `vite-plugin-pwa` permanece inerte em `devDependencies`; remoção exige
  reconciliar os lockfiles npm/Bun no mesmo lote.

## Encaminhamento para a candidata 4.1.0 Vite — 2026-10-29

- Revisão editorial CTAL-TM e guardas canônicas: **resolvidas em 09/nov/2026**
  (registro histórico da fase de 24/10 mantido para rastreabilidade).
- Documentação de produto e deploy: README, CHANGELOG e DEPLOY descrevem a
  candidata Vite e mantêm 3.18.0 como base em produção até o merge.
- CI e publicação: verificar os gates da candidata antes de declarar a migração
  fechada ou registrar qualquer publicação.

## Concluído em 2026-11-09

- Revisão editorial CTAL-TM: **fechada** em 09/nov/2026 — 62 itens no banco canônico 1.7.3 (14 do relatório + 48 da leitura integral), 0 gabaritos alterados; guardas 7/7; fatias regeneradas por gerador versionado; manifesto `7313f302…` reingerido no hub. Relatório: `REVISAO-CTAL-TM.md`.
- K4: mínimo suprido (`ctaltm-121` → TM-1.3.4 K4). Ampliação aguarda novo pacote de questões do mantenedor.
- Axon 0.3.0 adotado (`retired`/`isRetired`): gerador propaga `retired`; app pronto para a política epitáfio.
- Pendente: decisão editorial do CTAL-TA (`ctalta-106`, `ctalta-120`).

- **2026-11-11:** QA canônico concluído; P1 de rascunho de simulado corrigido no
  PR #41 (`6665375`). Próximo: manter o checkout canônico em `main` (não usar o
  branch Next antigo como fonte de QA) e repetir o gate completo antes de release.
