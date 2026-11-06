# Memory operacional do Synapse

Atualizado em 2026-11-06. Fonte canônica de estado: `current-state.md`; plano
ativo: `plan.md`; histórico de releases: `../../CHANGELOG.md`.

## Produto publicado

- Synapse 4.1.0, React + Vite, PWA, produção em https://ctfl-app.vercel.app/.
- CTFL v4.0, CTAL-TA v4.0 e CTAL-TM v3.0 estão acessíveis no app.
- CTAL-TM tecnicamente acessível não equivale a aprovação editorial.
- Links Axon cobrem 431 questões dos pools de estudo. O hub exibe a ordem
  canônica do banco; não publica os pools exclusivos de simulado.
- Progresso é local ao dispositivo. Migração e backup da linha antiga foram
  cobertos por testes na release 4.1.

## Regra importante de respostas

- O banco mantém a ordem oficial das alternativas e o índice canônico correto.
- O Simulado embaralha questões e opções; `optOrder` mapeia a posição visual
  para o índice original, inclusive ao retomar rascunho.
- A tela Estudar atualmente não embaralha opções. Isso é uma regressão, não uma
  decisão explícita; a correção e o feedback em letra visual estão pendentes.
- Não mudar a ordem canônica no hub para imitar uma sessão aleatória do app.

## Governança

- Não alterar o repositório do Noos nem publicar conteúdo no hub sem autorização
  explícita.
- Preservar IDs internas, identidade das respostas, progresso local e separação
  entre pool de estudo e pool de simulado.
- Atualizar `current-state.md`, `plan.md`, README e changelog quando um novo
  comportamento for implementado ou publicado. Não reescrever fatos históricos.
- Checkout visto na última auditoria: `feat/axon-manifest-preview`; há um
  arquivo não rastreado `docs/sdd/axon-adoption-plan 2.md`. Preservar e revisar
  antes de qualquer limpeza.

## Verificações da integração Axon

- App PR #15 integrado à main no commit `2c0b2b7`.
- CI da main passou, incluindo 15 testes E2E Chromium.
- As 862 URLs PT/EN do domínio principal do hub responderam HTTP 200 na
  validação de release; domínio de contingência verificado por amostra.
