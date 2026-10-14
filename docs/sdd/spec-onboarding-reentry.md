# Spec — Onboarding reentry

**Status:** FECHADA — implementação `794e027`; changelog `fdbe34b`.

## Decisão

O onboarding reaberto é um overlay reduzido a métricas e FAQ. X e “Voltar”
fecham o overlay sem recarregar a página ou alterar a rota. Header/footer ficam
ocultos e o scroll de fundo é bloqueado. O fluxo completo da primeira visita
permanece inalterado.

## Régua de fidelidade

- [x] Rota e progresso preservados.
- [x] Sem remoção de `localStorage` ou navegação forçada para `/select`.
- [x] Conteúdo reduzido apenas no modo reentry.
- [x] Nenhuma alteração em prontidão, gamificação ou banco.
- [x] Smoke E2E fecha o overlay e confirma a mesma URL.
