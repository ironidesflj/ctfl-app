# Spec — Comunicação de releases significativas

**Status:** FECHADA — 2026-10-14.

## Problema

O PWA já avisa quando um novo service worker está pronto, mas o aviso técnico
apenas oferece recarregar. Depois da atualização, o usuário não recebe um resumo
do que mudou. Usar um popup em toda alteração menor criaria fadiga e reduziria a
chance de leitura.

## Decisão

1. O toast PWA existente continua avisando toda atualização técnica disponível.
2. Releases marcadas explicitamente como significativas exibem um modal “O que
   mudou” depois que a nova versão carrega.
3. O modal aparece uma única vez por versão, registrado localmente sem dados
   pessoais ou telemetria.
4. Usuários de primeira visita veem somente o onboarding; a release atual é
   marcada como vista ao concluí-lo para evitar dois modais consecutivos.
5. A comunicação é bilíngue, dispensável, não força atualização e não altera
   progresso, rota ou estado de simulado.

## Régua de fidelidade

- [x] Configuração explícita de versão, importância e conteúdo PT/EN.
- [x] Modal acessível com `role="dialog"`, foco inicial, trap de foco e Escape.
- [x] Persistência “uma vez por versão” coberta por teste.
- [x] Primeiro onboarding não é seguido pelo modal da mesma versão.
- [x] Toast PWA anterior permanece funcional.
- [x] README, CHANGELOG, SDD e testes atualizados no mesmo lote.

## Evidência de fechamento

- 289/289 testes unitários/de componentes.
- 3/3 smokes Playwright, incluindo exibição única por versão.
- Lint sem warnings, Prettier e build verdes.
- `public/sw.js` atualizado para `r13-v1`, garantindo que o deploy dispare o
  ciclo real de atualização do service worker.

## Fora de escopo

- Push notification com o app fechado.
- Backend, cadastro, analytics ou segmentação de usuários.
- Mostrar popup para correções silenciosas ou alterações editoriais pequenas.
