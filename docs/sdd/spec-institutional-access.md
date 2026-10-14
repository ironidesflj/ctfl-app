# Spec — Acesso institucional permanente

**Status:** IMPLEMENTADA E VALIDADA LOCALMENTE em 2026-10-14; aprovação final,
commit e push aguardam o Iron.

## Problema e ground truth

A apresentação institucional completa existia somente na primeira visita. A
reentrada da aba Progresso é deliberadamente reduzida a métricas e FAQ e não
mostra a explicação completa, “Sobre o autor”, LinkedIn e GitHub.

O overlay de reentrada já preservava a rota, ocultava header/footer, bloqueava o
scroll de fundo e implementava diálogo, foco inicial, trap de foco, Escape e
retorno de foco.

## Decisão

- Reutilizar o overlay acessível com uma variante `about` que renderiza todo o
  conteúdo institucional do onboarding.
- Expor “Sobre o Synapse” / “About Synapse” no footer do shell global.
- Fechar pelo X, Escape ou CTA “Voltar” sem navegar, recarregar ou desmontar a
  rota anterior.
- Não alterar o onboarding inicial nem a reentrada reduzida de métricas.
- Não escrever progresso, preferências, `onboardingDone` ou estado de release
  ao abrir ou fechar a apresentação.

## Régua de fidelidade

- [x] A ação pertence ao shell global, inclusive na seleção de certificação.
- [x] A apresentação contém produto, funcionamento, FAQ, autor e links sociais.
- [x] URL e estado da tela anterior são preservados.
- [x] PT/EN, onboarding inicial e reentrada reduzida mantêm suas semânticas.
- [x] O diálogo mantém foco, Escape, retorno de foco e bloqueio de scroll.
- [x] Nenhum backend, banco, dependência ou persistência foi introduzido.

## Evidência de fechamento

- Testes de componente cobrem a ação global, a variante completa, a variante
  reduzida e a preservação do estado da tela.
- O smoke E2E abre e fecha a apresentação em uma rota de certificação e
  confirma a mesma URL.
- Gates completos e diff de fechamento ficam registrados em `current-state.md`.

## Fora de escopo

Nova rota, redesign do onboarding, mudança de progresso, quiz, PWA ou release.
