# Memory operacional do Synapse

Atualizado em 2026-11-06. Fonte canônica de estado: `current-state.md`; plano
ativo: `plan.md`; histórico de releases: `../../CHANGELOG.md`.

## Produto publicado

- Synapse 4.1.0, React + Vite, PWA, produção em https://ctfl-app.vercel.app/.
- CTFL v4.0, CTAL-TA v4.0 e CTAL-TM v3.0 estão acessíveis no app.
- CTAL-TM tecnicamente acessível não equivale a aprovação editorial.
- Links Axon cobrem 431 questões dos pools de estudo. O hub exibe a ordem
  canônica do banco; não publica os pools exclusivos de simulado.
- Desde o PR #18 o app publica `/manifest.jsonl` (431 linhas de estudo, sem
  simulado); SHA-256 `1bdcde8e…` idêntico ao do hub, conferido no CI pelo job
  `manifest-parity`.
- Progresso é local ao dispositivo. Migração e backup da linha antiga foram
  cobertos por testes na release 4.1.

## Regra importante de respostas

- O banco mantém a ordem oficial das alternativas e o índice canônico correto.
- Simulado e Estudar embaralham opções por sessão; `optOrder` mapeia a posição
  visual para o índice original (no Simulado, inclusive ao retomar rascunho).
- O PR #17 corrigiu a regressão de Estudar (antes exibia a ordem original do
  banco). O teste de componente cobre seleção, letra visual, troca de idioma e
  sessão de salvas; o feedback anuncia a letra da posição visual.
- Não mudar a ordem canônica no hub para imitar uma sessão aleatória do app.

## Governança

- Não alterar o repositório do Noos nem publicar conteúdo no hub sem autorização
  explícita.
- Preservar IDs internas, identidade das respostas, progresso local e separação
  entre pool de estudo e pool de simulado.
- Atualizar `current-state.md`, `plan.md`, README e changelog quando um novo
  comportamento for implementado ou publicado. Não reescrever fatos históricos.
- Checkout atual: branch `docs/integrate-synapse-sdd` (integração documental
  sobre a `main`). O clone antigo tinha um arquivo não rastreado
  `docs/sdd/axon-adoption-plan 2.md`; o clone novo não tem duplicados e nenhum
  arquivo " 2.md" deve ser adicionado.

## Verificações da integração Axon

- App PR #15 integrado à main no commit `2c0b2b7`.
- CI da main passou, incluindo 15 testes E2E Chromium.
- PR #17 (shuffle em Estudar) mergeado na main; a suíte tinha 452 testes.
- PR #18 publica `/manifest.jsonl` no app: 431 linhas de estudo, SHA-256
  `1bdcde8e…` igual ao do hub; o CI compara o SHA no job `manifest-parity`.
- As 862 URLs PT/EN do domínio principal do hub responderam HTTP 200 na
  validação de release; domínio de contingência verificado por amostra.
