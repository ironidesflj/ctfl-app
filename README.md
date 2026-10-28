# Synapse

App de preparação para certificações ISTQB, em português e inglês. A versão 4.1.0 usa Next.js 16, React 19 e armazenamento local no navegador. CTFL, CTAL-TA e CTAL-TM têm estudo, flashcards, simulado, progresso, syllabus e glossário.

## Rodar e validar

Requer Bun 1.3 ou mais recente.

```sh
bun install --frozen-lockfile
bun run dev
```

Abra `http://localhost:3000/`. Para verificar a entrega:

```sh
bun run bank:build
bun run test
bun run lint
bun run typecheck
bun run build
```

O gerador lê `bank-source/` e escreve os pools de estudo e simulado em `src/synapse/data/banks/`. O relatório fica em `scripts/bank-report.json`. As questões de estudo e simulado são exclusivas entre si.

## Primeira visita e dados

A constelação completa dura 3,6 s, pode ser pulada e conduz ao onboarding reformulado. Ele aparece uma vez por navegador com a chave `synapse.onboarding.v2` e pode ser reaberto em **Sobre → Como funciona**. Nas visitas seguintes, a abertura rápida cobre o carregamento do banco.

O progresso é salvo em `localStorage` por navegador e por certificação. O heatmap de Progresso mostra 12 semanas alinhadas de segunda a domingo; a janela avança toda segunda-feira e os dias futuros não aparecem. O service worker oferece cache local e atualização com aceite do usuário.

**Migração:** a versão 4.1.0 usa um modelo de progresso diferente do app Vite 3.18.0. As chaves antigas permanecem no navegador, mas não são importadas automaticamente. Não limpe os dados do site se precisar recuperá-las. Uma migração validada está registrada no [plano do SDD](docs/sdd/plan.md).

## Documentação

- [Estado e plano canônicos](docs/sdd/README.md)
- [Histórico de versões](CHANGELOG.md)
- [Pools de questões](POOLS.md)
- [Deploy](DEPLOY.md)
