# Estado do SDD — 2026-10-29

## Estado atual

- Axon: fatia 1 em implementação com pin exato de `@ironidesflj/axon@0.2.2`.
  O pacote ainda não é importado pelo app; nenhuma ID pública ou manifesto foi
  emitido. Auditoria e sequência segura em `axon-adoption-plan.md`.
- Synapse 4.1.0 Vite integrada à `main` no PR #9 (`143f6ae`). CTFL, CTAL-TA e
  CTAL-TM estão disponíveis; a dívida editorial de CTAL-TM continua aberta.
- A primeira visita mostra a abertura completa e o onboarding uma vez; a aba
  Hoje fica oculta durante a transição. Visitas comuns usam abertura rápida;
  após 12 horas fora do app, a abertura completa retorna sem onboarding.
- A migração do progresso 3.18 e o backup foram verificados por testes unitários
  e de navegador. O relatório Lighthouse local apontou um botão de lembrete
  sem nome acessível, corrigido no ajuste pós-4.1. A nota de performance mistura
  a animação deliberada de entrada com scripts de extensões do Chrome.
- Artefatos históricos encontrados em Downloads foram movidos para um arquivo
  local fora do Git, com manifesto e SHA-256; não são fonte canônica do banco.

## Histórico — referência de 2026-10-24

> O registro abaixo documenta a fase de proteção canônica do banco em 24/10;
> não descreve integralmente o checkout Vite atual. Para a referência deste
> checkout, consulte o adendo datado no fim do arquivo. Detalhes de release
> publicados permanecem no `CHANGELOG.md`.

Revisão editorial em andamento: banco candidato 1.6.1-editorial.1 sincronizado
LOCALMENTE na fonte e no app; versão do aplicativo permanece 3.17.0. Sem envio.
Primeiro lote: 12 questões lidas, oito reformuladas em PT/EN; gabaritos, IDs,
pools e as outras 192 questões preservados. Restam 188 questões para leitura
semântica e revisão independente do lote. Quatro guardas ainda reprovam.
Registro: banco/editorial/ctaltm-batch-01.json e CTALTM_QUALITY_REVIEW.md.

App v3.17.0 publicado na linha a5f664f. Correção de proteção canônica aplicada
LOCALMENTE, sem commit/push: fonte reconciliada para v1.6.0-ctaltm, monólitos
idênticos e fatias verificadas. CTAL-TM incluído nas guardas bloqueantes.
O sync e o novo job canonical-bank do app agora rejeitam divergência e dívida
de qualidade, mas os workflows ainda não foram executados no GitHub.

Validação técnica local: 11 testes de proteção do banco, 443 testes do app,
cinco E2E Chromium, formatação, lint e build aprovados. Snapshot histórico
docs/sdd/Archive ignorado pelo Prettier, sem inclusão no commit.

Bloqueio editorial aberto: CTAL-TM falha LENGTH_BIAS, LENGTH_EFFECT_SIZE,
HEDGE_RATIO e RUNS_TEST (exit 1). Triagem gerada para 200 questões; revisão
semântica completa pendente. Nenhuma baseline ou tolerância nova adicionada.
Spec ativa: spec-canonical-bank-protection.md. Evidências detalhadas no banco:
CTALTM_QUALITY_REVIEW.md e ctaltm-quality-triage.json.

## Histórico de integrações

Integração seletiva CTAL-TM: 200 questões (101 estudo/99 simulado), conteúdo
bilíngue e blueprint 50 questões/88 pontos/corte 58/120 minutos.
Corrigido alvo percentual de aprovação de provas pontuadas no Stats e conquistas.
Questões CTFL/CTAL-TA preservadas na comparação estrutural dos pacotes.
Mantidos storage e ajustes institucionais locais. Cache r20-v1.
Limitação: K4 CTAL-TM só no simulado; estudo sem amostra K4 não satisfaz
o gate de prontidão K4 existente. Não relaxado o gate para esconder essa dívida.

Integração seletiva v3.16.0: paletas por certificação com 20 guardas de
identidade/contraste e cabeçalho mobile adaptado para manter a troca de cert.
Mantido o storage local: undo integral do histórico cheio, datas e contadores.
Service worker r19-v1; 422 testes, lint e build aprovados antes da validação mobile.

Integração seletiva do pacote v3.15.1: acessibilidade do heatmap, atividade
SRS, resumos de revisões e limite SM-2 de 365 dias. Corrigido localmente o
undo com histórico cheio e a restauração da data de atividade e contadores.
Preservados recursos institucionais, imagem social e configuração local.
Service worker r18-v1; 402 testes, lint e build aprovados.

Aplicado o pacote corretivo v3.14.1: desfazer na celebração e entre filtros,
revogação de conquistas SRS no desfazer, CTA direto para pendentes, contador
da fila e datas locais. Service worker r16-v2. Suíte: 385 testes e lint verdes.

Integração do pacote v3.14.0: painel SRS no Progresso, atalhos e desfazer nos
Flashcards, contadores de revisão e duas conquistas. Preservados os ajustes
locais de navegação, release notes, conteúdo e imagem social Synapse.
Service worker r16-v1; build recompilada para a raiz do domínio.
Sem commit, push ou publicação nesta integração.

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

## Candidata Synapse 4.1.0 Vite — registro antes do merge

- Branch `feat/synapse-vite-redesign`; candidata Synapse 4.1.0 em revisão.
  A versão 3.18.0 permanece como base em produção até o merge. Esta branch não
  representa publicação.
- A interface atual está em `src/synapse/` e usa React + Vite. `store.tsx`
  carrega bancos de estudo e de simulado por certificação; há dados para CTFL,
  CTAL-TA e CTAL-TM em `src/synapse/data/banks/`.
- CTAL-TM está disponível na interface, mas sua revisão editorial segue aberta.
  A proteção canônica e as quatro falhas registradas para o banco no bloco de
  24/10 continuam pendências; disponibilidade no app não equivale a aprovação
  editorial.
- O README deste checkout resume comandos e estrutura atuais; `DEPLOY.md`
  descreve Vercel como destino oficial e Pages como opção manual. O workflow
  `deploy.yml` publica a partir da raiz e não configura build de subpath por si.
- Não há, neste adendo, confirmação de publicação nem contagens atuais de
  testes/build. Consulte a execução de CI da branch antes de registrar esses
  gates como aprovados.
