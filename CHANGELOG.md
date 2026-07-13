# Changelog

### Unreleased

### v3.10.0 — 2026-07-13

Prontidão baseada em blueprint oficial de exame (Spec 2), hierarquia do
Stats e gamificação (Spec 1), fix de rótulos do radar, sync do banco de
questões embutido no app e hardening de acessibilidade/i18n/persistência
(Fase 3). 12 commits desde v3.9.0.

- feat(readiness): **prontidão agora usa o blueprint oficial do exame**
  (`getReadinessV2`) em vez de fórmula estatística pura — exige cobertura
  mínima de todos os capítulos (≥40% do banco) e piso de cobertura por
  nível cognitivo (K1-K4, proporcional ao peso de cada nível na prova
  real), ponderado pelo peso real de cada capítulo. Sem afirmar "pronto"
  com capítulo ou tipo de questão descoberto. Cert sem blueprint preenchido
  cai no comportamento estatístico anterior sem quebrar.
- feat(stats): **hierarquia do card de prontidão redesenhada** — veredito em
  destaque, Wilson CI/cobertura/point movidos pra `<details>` (linguagem
  natural em primeiro plano, estatística como detalhe explorável). Estado
  bloqueado nomeia especificamente os capítulos/níveis faltantes.
- feat(gamification): **2 conquistas novas** (`chapter-complete`,
  `bank-complete`) somadas às 4 já existentes (`first-step`, `streak-7`,
  `streak-30`, `passed-exam`) — mesma fonte de dado já computada
  (`coverageByChapter`), zero tracking novo.
- fix: `Stats.jsx` usava `certId.toUpperCase()` pra identificar o cert em
  vez de `cert.label` — funcionava por coincidência nos 2 certs live, mas
  quebraria num cert futuro cujo label não seja o certId maiúsculo.
- fix: interpolação de string dupla em `t()` deixava "Intervalo real: %–%"
  em branco no card de prontidão (placeholder já era consumido antes do
  `.replace()` externo rodar).
- fix: cache de `allInLang("pt")` — retorna `ALL` diretamente em vez de
  remapear, reduz trabalho redundante no hot path do Quiz.
- content: banco sincronizado pós Fase 1 (elimina viés de comprimento de
  resposta, CRÍT-1) + HEDGE_RATIO/RUNS_TEST (rebalanceia qualificadores
  absolutistas e ordem de opções) — ver `ctfl-question-bank-ptbr` pro
  detalhe completo dessas mudanças de conteúdo.
- fix: teste de streak usava `toISOString()` (sempre UTC) em vez do
  timezone local que `getStreak()` realmente usa — falhava
  deterministicamente perto da meia-noite UTC.
- fix(a11y): rótulos de eixo do radar (Stats) tinham colisão em 3
  combinações cert/idioma (CTFL PT cap2≡cap3, CTFL EN cap4≡cap5, CTAL-TA
  EN cap1≡cap3) — dois capítulos diferentes mostrando o mesmo texto no
  gráfico. Campo `short` explícito por capítulo substitui o corte
  automático da primeira palavra do nome. Guarda adicionada contra `NaN`
  em `radarCoverage` quando um capítulo não tem questões no banco
  (`cov.total===0`).
- content: banco de questões embutido no app (`src/data/`) sincronizado
  com o repo do banco pela primeira vez desde antes da Spec 2 — traz
  `chapterWeights.ctfl` corrigido, `examBlueprint` (ausente até aqui, o
  que fazia `getReadinessV2` cair sempre no fallback estatístico em
  produção) e as reescritas de desalinhamento de letra da Spec 3. A
  prontidão por blueprint só passa a funcionar de fato a partir desta
  versão.
- feat(a11y): hardening de acessibilidade, i18n e persistência (Fase 3) —
  navegação por abas com ARIA completo (`tablist`/`tabpanel`, roving
  `tabindex`, setas/Home/End pelo teclado), `aria-live` no feedback do
  quiz (leitor de tela anuncia a explicação ao responder), `aria-label`
  no logo do masthead, strings do Onboarding/Quiz movidas pro dicionário
  de i18n (fim de condicionais `lang==="en"` inline), erros de
  `localStorage` deixam de falhar silenciosamente, validação de import de
  progresso mais estrita, banco de questões (2,5MB) separado em chunk
  próprio no build.

### v3.9.0

Rebrand visual — 4 briefings em paralelo (cor, mark, copy, layout seletor).

- feat: **marca visual** (`BrandMark`/`BrandMarkOutline` em `src/components/`,
  grafo aprovado v2 do Claude Design) substitui iniciais textuais no masthead
  e seletor. Favicon/ícones PWA trocados (v1 checkmark → v2 grafo).
- feat: **cores por cert:** CTAL-TA herda verde-azulado `#0f8a86`/`#4dd4cf`
  (antes do CTFL-AT); CTFL-AT virou cinza de legado `#6e6a86`/`#9691ab` (não
  removido, apenas desatualizado).
- feat: **seletor de certificação é grid de cards** (antes lista) — ícone
  solto sem caixa colorida, tracejado + badge nos desabilitados, flutuante.
- feat: **copy da Onboarding** atualiza pra multi-cert real (remove afirmação
  de CTFL como única cert; `statDomains` → `statCerts`, exigiu 1 linha de
  sincronismo em `Onboarding.jsx:47`, commit `7a9a38e`).

4 commits em `ctfl-app 2`, build/testes verdes. Documentação (BRAND.md,
plan-e-tasks.md, spec-estado-atual.md) atualizada em sincronia.

### v3.8.1

Varredura de QA adversarial (4 frentes em paralelo — storage, quiz/simulado,
roteamento, dados/i18n) + correções. Causa raiz principal: progresso era um
único objeto global (`ctfl_progress_v1`), cego a certificação.

- fix: **progresso agora é por certificação** (`synapse.progress.v1.<certId>`,
  antes global) — corrige questão salva/errada em CTFL aparecendo no CTAL-TA,
  e a colisão de `byDomain` por número de capítulo entre certs (CTFL cap.1
  "fund" e CTAL-TA cap.1 "analyst" gravavam no mesmo balde). Migração
  automática da chave legada pro namespace `ctfl`. Export/import/reset agora
  escopados por cert (arquivo exportado identifica de qual cert veio, import
  rejeita arquivo de cert diferente).
- fix: card de capítulo no Quiz mostrava "x/" com denominador vazio
  (`META.total` nunca existiu no meta do banco) — agora mostra contagem real
  de questões disponíveis no capítulo sobre o total do cert.
- fix: simulado do CTAL-TA que batia o corte oficial (29/45 = 64,4%) era
  reportado como reprovado — corte estava fixo em 65% em vez de ler
  `examFormat[certId].passMark`. Corrigido na tela E no histórico persistido
  (`logExamResult`, que tinha o mesmo hardcode independente).
- fix: resultado do simulado nunca era salvo no histórico (`logExamResult`
  existia e era testado, mas nunca chamado no fluxo real do app).
- fix: corrida entre auto-finish (tempo zerou) e clique manual em "Finalizar"
  podia contar cada resposta em dobro — `finish()` agora é idempotente.
- fix: trocar PT/EN no meio do simulado/quiz deixava o texto da questão
  travado no idioma do início — agora re-localiza ao trocar, sem perder
  respostas já dadas.
- feat: Flashcards/Syllabus/Glossário mostram "conteúdo em breve" no CTAL-TA
  em vez de vazar material do CTFL (esses três só têm conteúdo pro CTFL
  ainda — decisão de produto: empty state, não gerar conteúdo agora).
- fix: `Syllabus.jsx` tinha o mesmo bug do `META.total` (denominador vazio).
- fix: **rebrand nunca tinha sido integrado** — favicon/ícones novos
  (`brand-assets/`, gerados na Fase 4 mas nunca copiados pro app), título/
  meta OG/Twitter/manifest PWA trocados de "CTFL Prep" pra "Synapse", brand
  tag do onboarding.
- fix: cert "coming soon" `ctal-at-v2` no seletor não tinha token de cor no
  CSS (bug introduzido no v3.8.0, corrigido no mesmo ciclo).

Execução: 4 agentes em lanes de arquivo disjuntas (sem sobreposição),
supervisionados — reconciliação entre lanes (o hardcode duplicado do corte
em `logExamResult`) fechada pelo supervisor com teste de regressão próprio.
62 testes (era 47), build limpo, verificado ao vivo no browser.

### v3.8.0

Masthead dinâmico por certificação + seletor de certificações (P4).

- feat: masthead lê `mark`/`fullName`/label/versão do cert ativo na rota
  (antes hardcoded "CT"/"CTFL Prep" mesmo dentro do CTAL-TA); neutro
  ("Synapse") em `/` e `/select`, sem cor de cert aplicada.
- feat: cores por certificação via `data-cert` no elemento raiz + tokens
  CSS (`brand-assets/synapse-cert-tokens.css`, mesclados em `styles.css`).
- feat: `CertSelector` — tela dedicada (`/` sem `lastCert` salvo, e
  `/select`) e badge no masthead (clicável, troca de cert em qualquer
  tela). Lista certs vivos (CTFL, CTAL-TA) e "coming soon" (CTAL-TM, CT-AI,
  CTAL-AT v2.0); CTFL-AT (legado/sunset) fica fora da lista, numa nota
  separada — não é removido do repo, só sem destaque.
- fix: troca de cert força remount das rotas (`key={certId}`) — sem isso,
  estado local do Quiz (`useReducer`) vazava do cert antigo pro novo.
- fix: `VALID_CERTS` incluía só `"ctfl"` mesmo com CTAL-TA já pronto no
  banco — rota `/ctal-ta/*` redirecionava pra home sem motivo.

### v3.7.0

Multi-cert de verdade — merge do refactor `getBank(certId)` (branch
`feat/routing-and-300-questions`, 3 commits antigos nunca revisados + 2
novos deste ciclo) pra `main`:

- feat: `bank.js` virou factory multi-cert (`getBank(certId)`), CTFL e
  CTAL-TA funcionando com blueprint real (chapterWeights/examFormat vêm do
  bank JSON v1.2.0, chaveados por cert).
- fix: `META.total`/`META.examFormat` eram globais, não escopados por cert
  — causavam `TypeError` ao montar o simulado (mascarado antes por fallback
  de preenchimento aleatório que ignorava o blueprint em silêncio). Agora
  escopados em `bank.js` e `Quiz.jsx` (3 sites).
- fix: `vite.config.js` — limite de precache do `vite-plugin-pwa` subido
  pra 3MB (banco multi-cert de 1100 questões passou do limite default de
  2MiB, `npm run build` falhava).
- testes: guard de distribuição por capítulo (`bank.test.js`) agora roda
  pros dois certs (`describe.each`), pega regressão de blueprint que os
  testes de contagem simples não pegavam.
- dívida conhecida (não corrigida neste ciclo): `Quiz.test.jsx` tem 5
  testes falhando (`Cert desconhecida: "undefined"`) — harness de teste
  não envolve o componente numa rota com `useParams`, pré-existente à
  branch mesclada, não é regressão deste release.

### v3.6.4

Fase 1 de estabilização técnica (sem mudança visível para o usuário final):

- fix: copy de `coverageDesc` atualizado para incluir o modo Simulado
- fix: `notifications.js` usa paths relativos (`./icon-192.png`), evita 404 em deploy de subpath
- refactor: código morto removido de `bank.js` (`buildExam`, `byDomain` — substituídas por `*InLang`)
- refactor: `Quiz.jsx` migrado de `useState` múltiplo para `useReducer` explícito
- tooling: ESLint + Prettier configurados (`npm run lint`, `npm run format:check`)
- testes: 30 testes de componente novos cobrindo `Quiz.jsx` (antes sem cobertura), incluindo
  regressão exata do bug `seen`/5c93296 e do timeout do Simulado
- testes: total sobe de 22 para 31

### v3.6.3

- fix: modo Simulado agora registra `seen` por questão (faltava o
  argumento `questionId` na chamada de `onAnswer()` dentro de `finish()`).
  A cobertura por capítulo na aba Progresso estava ignorando todas as
  questões respondidas no exam.

### v3.6.2
- fix: corrige 87 questões com índice de resposta EN incorreto (bug de
  ordenação anterior ao desalinhamento de tema já corrigido). O tema
  EN estava certo, mas a ordem das opções EN não espelhava a ordem PT
  (já rebalanceada antes do EN existir), então `answer` apontava para
  a opção errada em inglês. Afeta majoritariamente Cap.1, Cap.2, Cap.4
  e a totalidade do Cap.5 original (27/27). Inclui caso especial
  `ch4-11`/`ch4-12`, que tinham o bloco EN inteiro trocado entre si.

### v3.6.1
- fix: corrige desalinhamento de conteúdo PT/EN em 77 questões (38% do
  banco) onde o texto em inglês tratava de tópico diferente do
  português — causa raiz: questões EN da expansão (120→200) foram
  geradas como conteúdo novo em vez de tradução fiel. Reescrito com
  tradução real do PT existente.

### v3.6.0
- fix: hero do onboarding agora destaca a proposta de valor em vez de
  repetir o nome do produto
- feat: animação de flip 3D nos flashcards
- fix: tab bar usa scroll horizontal em vez de wrap imprevisível em
  telas pequenas
- fix: seções de Progresso (Precisão/Cobertura) com rótulos distintivos
  para reduzir confusão visual

### v3.5.0
- feat: grade de navegação no modo Simulado — visualiza e salta entre
  as 40 questões, com indicação de respondidas/em branco (auditoria de
  design, item de maior impacto identificado)

### v3.4.1
- fix: semântica do botão "Salvar questão" corrigida (ação em destaque,
  estado salvo em cor de confirmação)
- fix: botões de avaliação SRS (Again/Hard/Good/Easy) agora têm cores
  distintas por valência, reduzindo carga cognitiva na revisão

### v3.4.0
- fix: acessibilidade — touch targets elevados para ≥44px (chips, botões,
  tabs, avaliação SRS), contraste corrigido no botão Voltar e no timer em
  alerta, fonte mínima 12px em badges técnicos (auditoria de design)

### v3.3.0
- feat: landing page completa (Onboarding expandido) — features detalhadas,
  mockup visual, prova social, FAQ, seção sobre o autor com links

### v3.2.1
- fix: title e description encurtados para evitar truncamento em previews
  sociais; adicionado og:site_name (resolve os 4 avisos do meta-tag inspector)

### v3.2.0
- feat: SEO básico — meta tags Open Graph/Twitter Card, robots.txt, sitemap.xml
- feat: imagem de compartilhamento social (og-image.png) para links
  compartilhados em redes sociais e WhatsApp

### v3.1.0
- feat: CI no GitHub Actions — roda os 22 testes unitários e o build a
  cada push/PR na main, bloqueando merge se algo quebrar

### v3.0.0
- feat: suite de testes unitários (Vitest) para a lógica pura — SM-2,
  storage/progresso, e integridade do banco de questões (200 questões,
  sem duplicatas no simulado, respostas válidas)

### v2.9.0
- feat: notificações locais (Web Notifications API) avisando sobre itens
  SRS atrasados e ausência de estudo prolongada — suporte em Android/desktop;
  iOS PWA tem suporte limitado e pode não funcionar de forma confiável

### v2.8.0
- feat: modo Revisão (SRS) no Quiz, com algoritmo SM-2 compartilhado
- feat: Flashcards migrados para avaliação SM-2 (Errei/Difícil/Bom/Fácil)
- feat: toda resposta no Quiz alimenta automaticamente o sistema de repetição espaçada

### v2.7.0
- feat: motor de repetição espaçada SM-2 (lib isolada, ainda não integrado à UI)

### v2.6.1
- fix: Onboarding e Glossary agora usam o dicionário central de i18n
  (últimas 2 strings hardcoded do levantamento)

### v2.6.0
- fix: tradução completa de interface (i18n) — ~68 strings hardcoded em PT
  substituídas por dicionário central (ui-strings.js), incluindo nomes de
  domínio, labels de tabs, botões, mensagens de progresso e rodapé
- refactor: DOMAINS em bank.js agora bilíngue (pt/en)

### v2.5.0
- feat: histórico de evolução nas estatísticas (últimos 14 dias de atividade)
- feat: toggle manual de tema (claro/escuro/automático) no header

### v2.4.0
- feat: Glossário ISTQB integrado (70 termos essenciais, PT/EN, busca e
  filtro por capítulo)
- feat: termos do glossário destacados automaticamente nas explicações do Quiz

### v2.3.0
- Flashcards e Syllabus 100% bilíngues: 15 flashcards + 15 itens de syllabus
  com tradução EN completa. Encerra a internacionalização em todas as quatro
  telas (Quiz, Simulado, Flashcards, Syllabus).

### v2.2.0
- Refactor: Flashcards e Syllabus migrados para schema i18n (locales.pt/en),
  preparando para tradução EN. Conteúdo PT inalterado.

### v2.1.0
- Banco de questões 100% bilíngue: 200/200 questões com tradução EN completa
  (Capítulos 1-6), criadas diretamente em inglês a partir do syllabus oficial
  ISTQB CTFL v4.0 (não traduzidas)
- Encerra o épico de internacionalização G1+G2

### v2.0.1
- Fix: label do toggle PT/EN exibia o próximo idioma em vez do idioma atual
  do conteúdo exibido

### v2.0.0
- Arquitetura multilíngue: toggle PT/EN no header
- Questões exibidas no idioma selecionado (fallback PT quando EN não disponível)
- EN flashcards e syllabus: coming soon

### v1.8.0
- Tela de onboarding no primeiro acesso (apresenta os modos e o banco)

### v1.7.0
- Salvar questões: marque qualquer questão durante o estudo e revise depois (modo Salvos)

### v1.6.0
- Cobertura por capítulo na aba Progresso (questões vistas / total)

### v1.5.0
- Corrige export/import: campo `seen` (modo Errei antes) agora persiste entre aparelhos
- Botão Voltar no quiz (durante e após a sessão)

### v1.4.0
- Syllabus acionável: navegação direta do capítulo para o Quiz filtrado

### v1.3.0
- Versão exibida no rodapé do app
- README atualizado

### v1.2.0
- Flashcards com marcação Sei/Não sei
- Filtro "Revisar (N)" no deck de flashcards

### v1.1.0
- Memória por questão (campo `seen` no progresso)
- Modo "Errei antes" no Quiz

### v1.0.0
- Lançamento inicial: 120 questões, Quiz, Flashcards, Syllabus, Progresso, PWA
