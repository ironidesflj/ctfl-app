# Identidade Visual — Synapse (referência atual)

Este documento registra a identidade visual **já implementada** em produção, extraída
de `src/styles.css`. Não é uma proposta nova — é o estado real, para servir de
referência e evitar inconsistência em futuras mudanças.

> Quando o projeto evoluir para multi-certificação (rebranding, novo nome — ver
> roadmap), este documento deve ser revisado como ponto de partida, não descartado.

## Cor de marca

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--accent` | `#5a4be7` | `#8b7dff` | Cor primária — botões, links, destaque |
| `--accent-soft` | `#ece9fc` | `#241f3d` | Fundo suave (cards selecionados, badges) |
| `--accent-text` | `#3b2fb0` | `#b9aeff` | Texto sobre fundo suave |

Roxo/violeta é a cor de marca em todos os contextos (claro e escuro) — não varia
o hue, só a luminosidade entre os temas.

## Cores de feedback

| Token | Light | Dark | Significado |
|---|---|---|---|
| `--ok` | `#0f8a5f` | `#45c98e` | Sucesso, aprovado, K1 |
| `--no` | `#c5362f` | `#f0726a` | Erro, reprovado |
| `--warn` | `#b5730a` | `#e0a04a` | Atenção, K3 (questões difíceis) |

## Neutros

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#f6f5f9` | `#0f0e16` |
| `--surface` | `#ffffff` | `#1a1825` |
| `--surface-2` | `#f0eef6` | `#221f30` |
| `--text` | `#1b1830` | `#ecebf5` |
| `--text-2` | `#5c5775` | `#a8a3c2` |
| `--text-3` | `#8a85a3` | `#76728f` |

Tema segue `prefers-color-scheme` por padrão, com override manual via
`data-theme="light"` / `data-theme="dark"` (implementado em v2.5.0).

## Tipografia

| Papel | Fonte | Onde aparece |
|---|---|---|
| Display (títulos, números grandes) | **Space Grotesk** (peso 700/500) | h1, h2, scores, stat-val |
| Corpo (texto geral) | **Inter** (peso 400/500) | parágrafos, botões, labels |
| Mono (dados técnicos) | **JetBrains Mono** (peso 500) | tags K1/K2/K3, timer, logo "CT", contadores de domínio |

Carregadas via Google Fonts no `index.html`.

## Nome e Logo

- **Mark**: grafo de 4 nós conectados (`polyline points="9,36 18,17 29,26 39,11"`,
  viewBox 48×48) — não é mais texto/iniciais. Duas variantes, cores propositalmente
  invertidas entre si:
  - `BrandMark` (`src/components/BrandMark.jsx`, export default) — pra uso *dentro*
    de uma caixa `background: var(--cert-accent)` (masthead, badge). Traço branco,
    nó final branco, 3 nós intermediários com `fill: var(--cert-accent)` (mesma cor
    do fundo, criam o efeito de "furo" com anel branco).
  - `BrandMarkOutline` (mesmo arquivo, named export) — pra uso *solto*, sem caixa de
    fundo (grid do seletor de certificação). `currentColor` no traço e no nó final;
    3 nós intermediários com `fill: var(--surface-2)` (cor de fundo do card, mesmo
    princípio de "furo", invertido porque aqui o fundo é claro/escuro neutro, não
    colorido).
  - **Não homogeneizar as duas** — a inversão é intencional, não inconsistência.
- Favicon (`public/favicon.svg`) e ícone-fonte PWA (`public/icon-source.svg`,
  gera `icon-192.png`/`icon-512.png`) usam o mesmo grafo, fixos na cor-base do
  app (`#5a4be7`) — não variam por cert, só o mark dentro do app varia.
- Origem: `brand-assets/` entregue pelo Claude Design (2 rodadas — v1 era um
  checkmark simples, já substituído; v2, atual, é este grafo).
- "Synapse" segue em texto Space Grotesk ao lado do mark — sem logotipo
  tipográfico único combinando os dois.

## Raio de borda

| Token | Valor | Uso |
|---|---|---|
| `--radius` | 14px | Cards, botões grandes |
| `--radius-sm` | 10px | Chips, botões menores, inputs |
| Pills/badges | 999px (full) | Tags, chips de filtro, badges de domínio |

## Tom de voz (aplicado no copy do app)

- Direto, sem jargão de marketing. Frases curtas.
- PT-BR informal mas preciso tecnicamente (ex: "Aprovado ✓" / "Abaixo da nota de corte").
- EN espelha o mesmo registro direto, sem floreio.
- Emojis usados com moderação, só em badges de nível (K1/K2/K3 via cor, não emoji)
  e em mensagens de resultado (🏆/✅/📚 no compartilhamento).

## O que NÃO existe ainda (decidir apenas na fase de rebranding multi-certificação)

- Variações de logo (monocromático, ícone isolado para redes sociais)
- Guia de tom de voz para marketing/landing page (hoje só existe tom de produto)
- Brand voice em inglês formalizado além da tradução literal de strings
