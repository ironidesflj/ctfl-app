# Estado atual verificado — 2026-10-14 (v3.11.0)

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
- E2E Chromium: 3/3 verdes, cobrindo seleção, estudo, persistência, idioma,
  onboarding reentry, conclusão/persistência de simulado e release notes.
- CI: `npm ci` + lint + format + testes + build + Playwright.
- Banco: threshold 0; `ctalta-106` e `ctalta-120` são allowlist explícita,
  continuam visíveis e fora das baselines; resumo 7/7.
- Sync: workflow cobre os dois JSONs, valida checksum e abre PR para merge
  manual.

## Aplicação auditada v3.11.0

- Bases locais desta aplicação: app `699f8bf`; banco `dcf5d36`. O lote v3.11.0
  permanece no working tree para revisão/commit pelo Iron.
- O pacote-fonte v3.11.0 foi cruzado com a auditoria E2E consolidada e com o
  relatório independente antes da integração; documentação/CI regressivos do
  pacote não substituíram as regras canônicas deste SDD.
- App atualizado para v3.11.0: rascunho e retomada de simulado, amostragem por
  capítulo/K-level, backup completo, métricas de atividade, data da prova,
  lembrete local, PWA autoral/offline e atualização gentil.
- Banco atualizado para `1.4.0-e2e-round2`: CTAL-TM com gabaritos 50/50/50/50,
  correções auditadas de índice/letra e explicações imunes ao shuffle.
- Performance: entrada inicial passou de aproximadamente 2,5 MB para 354 KB;
  bancos live são chunks lazy por certificação. O chunk CTAL-TA (~669 KB)
  ainda gera warning não bloqueante acima de 500 KB.
- Qualidade verificada: lint sem warnings, Prettier limpo, 289/289 testes,
  build verde, 3/3 smokes Playwright e guardas 7/7 nos dois bancos com
  `threshold 0`.
- O falso positivo novo `aitest-177` foi revisado manualmente antes de entrar
  na baseline; `ctalta-106` e `ctalta-120` continuam fora das baselines e na
  allowlist explícita por guarda.

## Cruzamento das auditorias

- Achados críticos live resolvidos: viés de comprimento CTAL-TA (11% PT / 12%
  EN no pick-longest atual), prontidão por blueprint/cobertura, identidade de
  certificação, corte de simulado, persistência e acessibilidade principal.
- Achados técnicos adicionais resolvidos na v3.11.0: corrida de storage,
  limite oculto de 99 questões, contagem do Syllabus, streak-30 inalcançável,
  draft de simulado e carregamento monolítico do banco.
- Certificações latentes continuam fora do produto live: CT-AI, CTAL-TM e
  CTFL-AT ainda apresentam dívida psicométrica e/ou ausência de metadados
  completos. Não promover sem nova fase de conteúdo e guardas verdes.
- Flashcards ainda não alimentam Stats; separação dos pools estudo/simulado
  continua como decisão de produto adiada.

## Comunicação e página institucional

- Toast PWA avisa toda atualização técnica pronta para aplicar; releases
  significativas também exibem um modal bilíngue uma vez por versão após o
  reload. Primeira visita recebe apenas o onboarding.
- Conteúdo institucional reconciliado: duas certificações live, CT-AI v2.0,
  simulado por blueprint/retomada, prontidão atual e limites reais do PT/EN.
- A página institucional completa continua restrita à primeira visita; retorno
  sempre visível e seção global de feedback permanecem no plano.

## Produto live

- CTFL v4.0: 300 questões.
- CTAL-TA v4.0: 200 questões.
- Ambas passam nas guardas psicométricas bloqueantes.
- CT-AI, CTAL-TM e CTFL-AT permanecem latentes e não devem ser promovidas sem
  saneamento de conteúdo e metadados de exame.
- Estudo e simulado compartilham o mesmo pool; não há questões exclusivas de
  avaliação nem exclusão automática de questões já vistas.
