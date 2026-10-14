# Estado atual verificado — 2026-10-15 (v3.13.0 local)

## Repositórios de referência

- App v3.12.0 confirmado em `origin/main`: `498397d`.
- Banco v1.5.0-pools confirmado em `origin/main`: `32e6e7e`.
- Os dois JSONs embutidos no app tinham SHA-256 idêntico às fontes do banco no
  fechamento da integração v3.11.0.
- A integração v3.13.0 está aplicada localmente e ainda não foi commitada nem enviada.

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
- Unit/component: 329 testes após a integração v3.12.0.
- Build/PWA: verde; permanece warning conhecido do chunk CTAL-TA (~669 KB).
- E2E Chromium: 3/3 verdes, cobrindo seleção, estudo, persistência, idioma,
  onboarding reentry, conclusão/persistência de simulado e release notes.
- CI: `npm ci` + lint + format + testes + build + Playwright.
- Banco: threshold 0; `ctalta-106` e `ctalta-120` são allowlist explícita,
  continuam visíveis e fora das baselines; resumo 7/7.
- Sync: workflow cobre os dois JSONs, valida checksum e abre PR para merge
  manual.

## Aplicação auditada v3.11.0

- Bases anteriores desta aplicação: app `699f8bf`; banco `dcf5d36`. O lote foi
  reconciliado, commitado e enviado nos commits `90cb96c` e `5f8a9f7`.
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
- Flashcards ainda não alimentam Stats; a separação dos pools estudo/simulado
  foi implementada na v3.12.0.

## Comunicação, página institucional e feedback

- Toast PWA avisa toda atualização técnica pronta para aplicar; releases
  significativas também exibem um modal bilíngue uma vez por versão após o
  reload. Primeira visita recebe apenas o onboarding.
- Conteúdo institucional reconciliado: duas certificações live, CT-AI v2.0,
  simulado por blueprint/retomada, prontidão atual e limites reais do PT/EN.
- “Sobre o Synapse” no footer global reabre a apresentação completa sem trocar
  rota nem perder o estado da tela. A reentrada reduzida de métricas permanece.
- “Enviar feedback” fica no footer e na apresentação institucional. Abre um
  Issue Form público com aviso de privacidade; nenhum dado local é enviado.
- A solução não cria Neon, schema, migration, backend, login, tenant, segredo,
  analytics ou nova persistência.

## Aplicação v3.12.0 — estado local

- Banco `1.5.0-pools` gerado deterministicamente e idêntico ao pacote entregue.
- CTFL: 220 estudo + 80 simulado; CTAL-TA: 110 estudo + 90 simulado.
- CTAL-TA: K2=1, K3=2, K4=3, total 78, corte 51; tempos nativos 60/120 min.
- Modal de novidades atualizado para v3.12.0 e cache PWA renovado para `r14-v1`.
- Gates finais: lint e Prettier verdes, 329/329 testes unitários/de componente,
  build verde, 3/3 smokes Playwright e guardas 7/7 nos dois bancos com
  `threshold 0`. Permanece apenas o warning conhecido do chunk CTAL-TA (~672 KB).

## Produto live

- CTFL v4.0: 300 questões.
- CTAL-TA v4.0: 200 questões.
- Ambas passam nas guardas psicométricas bloqueantes.
- CT-AI, CTAL-TM e CTFL-AT permanecem latentes e não devem ser promovidas sem
  saneamento de conteúdo e metadados de exame.
- Estudo e simulado usam pools mutuamente exclusivos nas duas certificações live.

## Aplicação v3.13.0 — estado local

- CTAL-TA recebe conteúdo real em PT/EN: 21 flashcards, 18 itens de syllabus e
  37 termos de glossário, escopados por certificação e capítulo.
- Heatmap redesenhado com 12 semanas alinhadas ao calendário, rótulos de
  mês/dia, dias futuros ocultos e inspeção acessível por toque/clique/teclado.
- Recursos institucionais, feedback, release notes, E2E e CI estrito foram
  preservados apesar de estarem ausentes ou regressivos no pacote de origem.
- Versão 3.13.0 e cache PWA `r15-v1`; lint e Prettier verdes, 340/340
  testes unitários/de componente, build verde e 3/3 smokes Playwright.
- Contagens verificadas por assert: 21 flashcards, 18 itens de syllabus e 37
  termos de glossário CTAL-TA, todos bilíngues e cobrindo os cinco capítulos.
