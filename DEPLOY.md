# Deploy — Synapse 4.1.0

O app usa Next.js 16 com App Router. Para produção, configure o projeto Vercel com a raiz deste repositório e framework **Next.js**. Use `bun install --frozen-lockfile` e `bun run build`. A rota do app é `/`. `vercel.json` define o framework Next.js e retira a saída `dist` herdada da configuração Vite para cada deployment desta versão.

O projeto não requer banco de dados, secrets ou migrações de servidor. Os bancos de questões já são versionados em `src/synapse/data/banks/`. Execute `bun run bank:build`, `bun run test`, `bun run lint`, `bun run typecheck` e `bun run build` antes de publicar.

O service worker (`public/sw.js`) é registrado apenas em produção. Uma atualização fica em espera até o usuário aceitá-la no toast; isso evita trocar arquivos durante um simulado. Teste a primeira visita, a atualização e o carregamento recorrente em um navegador real após o deploy. O histórico do app 3.18.0 permanece nas chaves antigas do navegador, sem importação automática nesta versão.

GitHub Pages e o antigo fluxo de build Vite foram removidos: esta entrega requer hospedagem que execute Next.js.
