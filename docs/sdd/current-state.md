# Estado atual verificado — 2026-10-14

## Repositórios de referência

- Banco antes desta manutenção: `e83ace8097e6955064fedf87acdadd2cc0285927`.
- App antes desta manutenção: `020982a56eafcf139811d9e0afb8627b05ba7bc2`.
- Os ZIPs do GitHub e os arquivos funcionais locais eram equivalentes.
- Os dois JSONs embutidos no app tinham SHA-256 idêntico às fontes do banco.

## Specs fechadas

- Spec 1 — hierarquia do Stats + gamificação: `9258e5e`.
- Spec 2 — prontidão por blueprint: banco `ec1d49d`, app `a2d2c61`, sync
  funcional `0d23eb7`.
- Spec 3 — desalinhamento de letra: `a956612`, baseline final `e83ace8`.
- Onboarding reentry: `794e027`, changelog `fdbe34b`.
- Radar z-order: `020982a`.

## Fase de manutenção 2026-10-14

- Lint: verde, sem erros ou avisos.
- Prettier: `format:check` verde; JSONs grandes do banco ficam fora da
  formatação mecânica.
- Unit/component: 75/75 verdes.
- Build/PWA: verde; permanece warning conhecido do chunk do banco (~2,16 MB).
- E2E Chromium: 2/2 verdes, cobrindo seleção, estudo, persistência, idioma,
  onboarding reentry e conclusão/persistência de simulado.
- CI: `npm ci` + lint + format + testes + build + Playwright.
- Banco: threshold 0; `ctalta-106` e `ctalta-120` são allowlist explícita,
  continuam visíveis e fora das baselines; resumo 7/7.
- Sync: workflow cobre os dois JSONs, valida checksum e abre PR para merge
  manual.

## Produto live

- CTFL v4.0: 300 questões.
- CTAL-TA v4.0: 200 questões.
- Ambas passam nas guardas psicométricas bloqueantes.
- CT-AI, CTAL-TM e CTFL-AT permanecem latentes e não devem ser promovidas sem
  saneamento de conteúdo e metadados de exame.
- Estudo e simulado compartilham o mesmo pool; não há questões exclusivas de
  avaliação nem exclusão automática de questões já vistas.
