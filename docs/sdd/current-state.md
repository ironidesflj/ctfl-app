# Estado atual — 2026-10-28

## App 4.1.0

O repositório `ctfl-app` agora contém o app Synapse reformulado em Next.js 16/React 19, na rota `/`. A casca única oferece Hoje, Estudar, Simulado, Flashcards, Progresso, Certificações, Glossário e Sobre. CTFL, CTAL-TA e CTAL-TM estão disponíveis em PT/EN; as demais certificações aparecem sem ação até terem conteúdo.

A abertura completa mostra a constelação por 3,6 s e termina no onboarding reformulado, identificado por `synapse.onboarding.v2`. O fluxo de primeira visita aparece uma vez por navegador e pode ser reaberto em Sobre. Nas visitas recorrentes, o splash rápido cobre o carregamento do banco. O onboarding não duplica autor, fontes ou feedback da página Sobre; as explicações de métricas ficam em Progresso.

Progresso apresenta um heatmap móvel de 12 semanas, alinhado à segunda-feira. A coluna da semana atual termina no dia de hoje; dias futuros são inertes e invisíveis. O contorno do dia atual é desenhado dentro da célula para não ser recortado.

Os pools de estudo e simulado são exclusivos: CTFL 220/80, CTAL-TA 110/90 e CTAL-TM 101/99. O gerador `scripts/build-bank.mjs` valida totais, capítulos, IDs, gabaritos, PT/EN e ausência de interseção. O relatório inclui 700 IDs únicos. O app usa `localStorage`; o service worker oferece cache e atualização controlada pelo usuário. Não há backend ou banco de dados de servidor.

## Verificação desta entrega

`bun run bank:build`, `bun run test`, `bun run lint`, `bun run typecheck` e `bun run build` passaram localmente e no CI do PR #8. O preview local foi inspecionado no navegador em Progresso, incluindo o recorte do dia atual. O CI também confirmou que os bancos gerados estão versionados. O preview Vercel do PR ficou pronto com `vercel.json` configurado para Next.js; produção aguarda revisão e merge.

## Limite de migração

O modelo de progresso 4.1.0 difere do 3.18.0. As chaves antigas não são removidas, mas não há importação automática para o novo modelo. Antes de propor migração, validar dados reais, mapeamento de IDs, histórico e possibilidade de desfazer; nunca sobrescrever o armazenamento legado sem backup.

O conteúdo editorial e as guardas canônicas do repositório `ctfl-question-bank-ptbr` permanecem sob a governança daquele repositório. Este push atualiza somente o app. Os registros de 3.x neste diretório e no Git anterior são históricos.
