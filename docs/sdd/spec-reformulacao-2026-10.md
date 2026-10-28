# Reformulação do app — aceite 2026-10-28

## Escopo

Aplicar ao repositório local o app reformulado recebido no pacote de trabalho, preservando os pools reais do banco e a identidade Synapse. A aplicação roda em Next.js 16, com casca única e oito views. A experiência de primeira visita contém abertura da constelação e onboarding guiado; métricas ficam em Progresso, informação institucional em Sobre.

## Ajustes aceitos no preview

- Abertura completa de 3,6 s, com aproximadamente 1,5 s após a marca terminar de aparecer. Abertura rápida permanece vinculada ao carregamento do banco.
- Nova chave `synapse.onboarding.v2`, para que o fluxo reformulado apareça uma vez também a quem concluiu o anterior.
- Heatmap de 12 semanas móveis, alinhadas à segunda. Dias futuros da semana atual não são exibidos. O contorno do dia atual fica dentro da célula.

## Régua de fechamento

Gerador de bancos sem erros, teste do modo de boot, lint, tipos e build verdes; README, deploy, changelog, CI, `current-state.md` e `plan.md` coerentes com a versão 4.1.0. A migração de progresso legado é uma fase separada, registrada no plano, sem apagar chaves anteriores.
