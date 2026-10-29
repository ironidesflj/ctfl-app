# Synapse — Documento de Handoff

**Data:** jul/2026
**Propósito:** documento único e auto-suficiente para qualquer pessoa (humana ou IA) assumir o projeto a partir daqui, sem depender do histórico de conversa que o gerou.

**Nota de proveniência:** este documento foi construído a partir de inspeção direta dos arquivos reais dos dois repositórios (zip da branch `main` de cada um, enviados pelo dono do projeto), não de memória de conversa. Onde a informação vem só de sessões anteriores (não confirmável no zip, ex: trabalho que existe apenas numa branch não mergeada), isso está marcado explicitamente.

---

## 1. O que é o projeto

**Synapse** (rebrand de "CTFL Prep") é um app web (PWA) gratuito de preparação para certificações **ISTQB**, bilíngue PT-BR/EN, criado por **Iron** (QA Analyst na NTT Data) como projeto de portfólio e ferramenta de estudo real. O projeto está em transição de single-cert (só CTFL) para multi-certificação (5 certs planejadas).

Dois repositórios GitHub, sob o usuário `ironidesflj`:

- **`ctfl-app`** — React 18 + Vite, PWA estática (sem backend), deploy em Vercel. Repo do produto.
- **`ctfl-question-bank-ptbr`** — Python (stdlib) + JSON versionado diretamente, gera/mantém o banco de questões bilíngues. Repo de conteúdo, fonte da verdade do banco.

### Filosofia do projeto (não negociável, ler antes de propor mudanças)

- **Gratuito de verdade**: sem login, sem ads, sem freemium. Arquitetura 100% estática é deliberada — qualquer proposta de backend/infra paga quebra a missão e deve ser questionada com rigor.
- **Conteúdo bilíngue nunca deve ser gerado "independente mas equivalente"** — EN sempre deve ser **tradução fiel** do PT, nunca reescrito/gerado a partir do tema. Já houve **4 rodadas** de bugs caros nessa categoria (ver Seção 5 — uma a mais desde o último handoff).
- **Nenhum item de roadmap/dívida técnica é marcado como "descartado"** sem confirmação explícita do dono do projeto. Status padrão para o que não foi feito: **"adiado"**.
- **Histórico de versão é sagrado e imutável** — changelog de versões antigas nunca deve ser reescrito para bater com o estado atual, mesmo que pareça uma correção inofensiva de número. Já houve um incidente real disso (ver Seção 6).
- **Construir em público**: o trabalho técnico vira conteúdo para o projeto pessoal de LinkedIn do Iron (ver Seção 9) — autenticidade total, zero invenção de métricas ou histórias.

---

## 2. Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite 5, vite-plugin-pwa, `react-router-dom` ^7.18.1 (já é dependência, roteamento `/:cert` em construção) |
| Testes | Vitest 4.1.9 + Testing Library — **38 testes confirmados por contagem estática** (`Quiz.test.jsx`: 5, `glossary.test.js`: 4, `spacedRepetition.test.js`: 8, `bank.test.js`: 8, `storage.test.js`: 13) |
| Lint/format | ESLint 9 (flat config) + Prettier |
| Estado | `localStorage`, sem backend, sem API |
| CI (app) | `.github/workflows/deploy.yml`, `test.yml` |
| CI (banco) | `.github/workflows/sync-app.yml`, `check-alignment.yml` |
| Deploy | Vercel |
| Conteúdo | Python stdlib (`build_bank.py`, `add_en.py`, `check_alignment.py`, `build_all.py`) — cobre só o bloco legado CTFL, ver Seção 3 |
| `package.json` (app) | `name: "ctfl-prep"`, `version: "3.6.4"` — **ainda não renomeado para synapse** |

---

## 3. Estado real dos repositórios (verificado por inspeção direta dos arquivos, não por relato de sessão)

⚠️ **Achado mais importante desta verificação: os dois repositórios estão em estágios de maturidade muito diferentes.** O repo de conteúdo (`ctfl-question-bank-ptbr`) já concluiu a Fase 4 (expansão multi-cert) e está com isso em `main`. O repo do app (`ctfl-app`) **ainda não recebeu nenhuma dessas mudanças em `main`** — o refactor multi-cert do `bank.js` existe apenas numa branch de trabalho (`feat/routing-and-300-questions`, relatada em sessão anterior, não verificável neste zip) que nunca foi mergeada nem pushada.

### `ctfl-question-bank-ptbr` (branch `main`) — Fase 4 concluída e pushada

- `ctfl-questions-ptbr.json`: **v4.0.0, 300 questões**, `chapterWeights` corretos (`{1:40, 2:25, 3:25, 4:55, 5:45, 6:10}`), `examFormat` completo (40 questões, corte 26, 60min/75min não-nativo).
- `synapse-question-bank.json`: **meta.version `1.1.0`, `generatedDate: 2026-06-30`, `totalQuestions: 1100`.** Bloco `meta.certifications` documenta as 5 certs com título, syllabus, contagem e capítulos:

  | Cert | Questões | Capítulos | Syllabus |
  |---|---|---|---|
  | CTFL | 300 | 6 | v4.0.1 |
  | CTFL-AT | 200 | 3 | v2014 |
  | CTAL-TA | 200 | 5 | v4.0 |
  | CTAL-TM | 200 | 3 | v3.0 |
  | CT-AI | 200 | 7 | v2.0 |

  Distribuição real de questões por capítulo confirmada via contagem direta do JSON — bate com os capítulos declarados acima em todos os 5 casos.

- **🔴 Achado novo, contradiz diagnóstico de sessão anterior:** cada questão do `synapse-question-bank.json` **já tem um campo `"cert"` explícito** (ex: `"cert": "CTFL"`). Isso é diferente do que foi confirmado por `jq` numa sessão de trabalho anterior ("NÃO EXISTE um campo cert ou certId"). O arquivo aparenta ter sido regenerado depois daquele diagnóstico (a versão do meta é `1.1.0`, `generatedDate` recente). **Implicação prática:** o hack de casar `chapter` + `domain` contra a config de cada cert (usado no `bank.js` refatorado) não é mais necessário — dá pra filtrar direto por `q.cert === cert.label`, mais simples e mais robusto. Vale simplificar quando o refactor for revisitado.

- **🔴 Achado novo, risco real não coberto pela validação anterior:** `synapse-question-bank.json` → `meta` **não tem os campos `chapterWeights` nem `examFormat`** que `bank.js` usa em `chapterWeight()` e `buildExamInLang()`. A versão do `bank.js` descrita em sessão anterior faz `const META = monolith.meta` usando esse arquivo como fonte — se isso não foi corrigido, `chapterWeight()` retorna `0` pra todo capítulo de toda cert que não seja CTFL (que usa o outro JSON, com campo completo), e `buildExamInLang()` provavelmente gera exames sem respeitar a proporção oficial por capítulo (o cálculo de `want` degrada silenciosamente). **A validação Node rodada na sessão anterior só checou `ALL.length` e `coverageByChapter()` — não testou `buildExamInLang()` — então esse bug, se existir, não foi pego.** Precisa de verificação direta no `bank.js` da branch antes de considerar o refactor fechado.

- `FASE4_FIX_LEDGER.md` documenta uma **4ª rodada de bugs de conteúdo** (ver Seção 5) — 113 correções de índice de gabarito nas 800 questões novas multi-cert, achadas via auditoria cega (GLM 5.2, 5 bancos, 132 achados brutos) + verificação cruzada manual.

- README já rebrandado para "Synapse", já menciona 1.100 questões e a tabela de distribuição — mas **ainda sem a coluna de status** ("no ar" / "em breve" / "legado") nem a nota de sunset do CTFL-AT que foram trabalhadas numa sessão de revisão (README briefing). Essas correções existem só como **commit local, sem push**, conforme instrução explícita dada naquele briefing — consistente com o que foi pedido, mas ainda não integrado a `main`.

### `ctfl-app` (branch `main`) — ainda no estado pré-Fase-5

- `package.json`: `name: "ctfl-prep"`, `version: "3.6.4"` — rebrand não propagado pro manifest do projeto.
- `README.md`: ainda diz "CTFL Prep" e "200 questões" em prosa (linhas 1, 4, 16, 151, 196) — **desatualizado em relação ao próprio dado que o app carrega** (ver próximo item).
- `src/data/ctfl-questions-ptbr.json`: **já tem 300 questões, v4.0.0** — sincronizado automaticamente via `sync-app.yml` a partir do repo de conteúdo. Ou seja: **o dado já chegou, mas o código e a documentação não foram atualizados pra usá-lo/refletí-lo.**
- `src/certs.js`: `VALID_CERTS = ["ctfl"]` — só uma cert habilitada. `LAST_CERT_KEY = "synapse.lastCert"` já usa a nomenclatura nova, sinal de que esse arquivo foi tocado no início do trabalho de Fase 5, mas não terminado.
- `src/lib/bank.js`: **versão antiga**, com `DOMAINS` hardcoded (6 domínios fixos do CTFL) e import direto de `ctfl-questions-ptbr.json`. **Não existe `certs.config.js`, não existe `getBank()` factory neste branch.** O refactor multi-cert (Briefing 2, sessão anterior) não está em `main`.
- Nenhum arquivo `synapse-question-bank.json` dentro de `src/data/` deste branch — o app ainda não tem acesso ao monólito multi-cert.

**Ação necessária, em ordem de prioridade:**
1. Localizar a branch `feat/routing-and-300-questions` (ou equivalente) com o refactor de `bank.js` e decidir: mergear como está, ou revisar antes (por causa do achado 🔴 acima sobre `chapterWeights`/`examFormat` ausentes no monólito).
2. Antes de mergear, corrigir `certs.config.js` para não depender de `monolith.meta.chapterWeights`/`examFormat` — declarar esses valores por cert dentro do próprio `certs.config.js` (dados já existem, documentados nesta seção e em sessões anteriores — ex: CTAL-TA usa proporção oficial de minutos 225/90/615/60/225).
3. Simplificar o filtro de questões por cert usando o campo `q.cert` recém-confirmado, em vez do casamento `chapter`+`domain`.
4. Sincronizar `package.json` (`name`, possivelmente `version`) e prosa do `README.md` do app com o rebrand Synapse — mesmo trabalho que já foi feito no README do repo de conteúdo.
5. Copiar `synapse-question-bank.json` pra `src/data/` do app (ou decidir mecanismo de sync automático via Action, hoje só `ctfl-questions-ptbr.json` tem esse pipeline).

---

## 4. O que já foi entregue (fases concluídas)

### Fase 1 — Estabilização (técnica, fechada)
CI de alinhamento PT/EN no banco; `build_all.py` (pipeline único); sync automático banco→app via GitHub Action com PR; ESLint+Prettier; testes de componente cobrindo `Quiz.jsx`; refactor de `Quiz.jsx` para `useReducer`.

### Fase 2 — Fundação de Design (fechada)
Fix de contraste WCAG AA (`--text-3`); hook `--cert-accent` (preparação multi-cert, zero custo); tokens de tipografia (`--fs-11` a `--fs-42`, 53 tokens, 62 ocorrências). **Adiado conscientemente**: tokens de espaçamento (`--space-*`), transição skeleton/quiz (substituída por fade/slide, briefing escrito), tab underline (pill→underline, visual pendente), empty states (pendente discussão UX), migração Python→YAML (adiada pra Fase 4).

### Fase 3 — Evolução Pedagógica (fechada)
Stats redesenhado (gamificação + prontidão bayesiana + radar); Glossário evoluído (índice A-Z, busca, termo do dia, filtro); split-screen do Quiz em desktop; micro-interações; Syllabus em árvore colapsável; onboarding interativo; flashcards com visual de baralho + swipe.

### Fase 4 — Expansão de Conteúdo Multi-Cert (**fechada e pushada no repo de conteúdo** — não confirmada no repo do app, ver Seção 3)
- CTFL expandido de 200 → 300 questões (as 200 originais preservadas intactas, validado byte-a-byte).
- 4 certificações novas geradas: CTFL-AT (200), CTAL-TA (200), CTAL-TM (200), CT-AI (200) — total 1.100 no monólito `synapse-question-bank.json`.
- Auditoria cega via GLM 5.2 (5 bancos, 132 achados) + verificação cruzada manual → 113 correções de gabarito aplicadas (`FASE4_FIX_LEDGER.md`, ver Seção 5).
- Schema de questão ganhou campo `cert` explícito (achado novo desta verificação, ver Seção 3).
- **Débito conhecido, documentado no próprio README do banco**: `build_bank.py`/`add_en.py` ainda só cobrem o bloco legado das 200 questões originais do CTFL — não geram as 100 novas nem o multi-cert. As 100 questões novas do CTFL ainda não têm baseline própria em `check_alignment.py`.

### Fase 5 — Multi-Certificação no App / Rebrand "Synapse" (**em andamento, parcialmente bloqueada**)
- Refactor de `bank.js` de módulo estático para factory `getBank(certId)`, com `certs.config.js` centralizando config por cert, agrupamento trocado de "por domain" pra "por chapter" (necessário porque CTAL-TA tem domain único repetido em 5 capítulos) — **trabalho relatado como concluído em sessão anterior, existe numa branch não verificada neste zip, não está em `main`** (ver Seção 3 para os riscos identificados nessa refatoração que ainda precisam de confirmação direta no código).
- README do repo de conteúdo já rebrandado para Synapse, com contagens corretas (1.100 total, 300 CTFL) — commitado localmente, não pushado ainda por completo.
- Correção de um erro de versão: CTFL é **syllabus v4.0** (lançado abr/2023), não v3.0 como foi erroneamente assumido numa resposta anterior — confirmado por busca externa, corrigido na memória do projeto.
- Decisão de roadmap tomada: CTFL-AT (syllabus v1.0/2014) descartado do papel de carro-chefe de lançamento por estar em processo de sunset ISTQB (sunset inglês 6mai2027, não-inglês 6nov2027) — conteúdo mantido no repo, não apagado, tratado como legado.
- **Pendente, decidido nesta sessão, ainda não briefado tecnicamente**: seção de contato no footer (resumo, GitHub, LinkedIn, email); seção de feedback (recomendado Google Forms linkado no footer, por simplicidade e zero infra nova); badges de versão por certificação no card do seletor (ex: "CTFL · v4.0"), dependente do `certs.config.js` já existir corretamente populado.

---

## 5. Histórico de bugs de conteúdo (contexto crítico para qualquer trabalho futuro no banco)

Já houve **4 rodadas** de bugs de desalinhamento/erro de conteúdo, a mais recente sendo a maior em volume bruto:

1. **77 questões** com tema completamente errado em EN (EN gerado a partir do syllabus, não traduzido do PT) — corrigido na v2.2.0.
2. **87 questões** com ordem de opções EN diferente da ordem PT (gabarito apontando pro distrator errado) — corrigido na v2.3.0.
3. **9 questões** (incluindo `ch3-16`, `ch4-22`, `ch5-03`, `ch5-13`, `ch5-22`, `ch5-24`, `ch5-26`, `ch5-29`, `ch5-31`) com distratores EN conceitualmente divergentes do PT — resposta certa batia, mas as armadilhas conceituais eram diferentes entre os idiomas. Corrigidas antes da expansão da Fase 4.
4. **113 correções de índice de gabarito** (`answer`) nas 800 questões novas multi-cert (Fase 4) — CTFL-AT: 1, CTAL-TA: 1, CT-AI: 35, CTAL-TM: 73 — mais 1 fix de tradução e 1 reescrita de conteúdo (questão `ctaltm-15` conflava teste de componente com teste de integração). Achadas via auditoria cega (GLM 5.2, 132 achados brutos) + verificação cruzada manual. Detalhamento completo em `FASE4_FIX_LEDGER.md`. **6 distratores de baixa qualidade em CTAL-TM foram deliberadamente deferidos** (gabarito já correto, só o texto do distrator é fraco — cosmético, não bloqueante).

**Lição central, reforçada pela 4ª rodada**: bugs de gabarito/índice em conteúdo gerado em lote são o padrão de erro mais recorrente do projeto, não um evento isolado. Qualquer geração futura de conteúdo (novas certs, expansão) deveria assumir por padrão que uma rodada de auditoria cega + verificação cruzada é necessária antes de considerar o conteúdo pronto para lançamento — não é uma etapa opcional de "só se der tempo".

---

## 6. Processo de QA que funcionou (e o que não funcionou) nesta fase do projeto

### O que funcionou
- **Revisão "às escuras" por um segundo modelo** (GLM 5.2, gratuito), tanto para conteúdo (achou os 113 bugs de gabarito da Fase 4) quanto para briefings técnicos antes da execução. No caso dos briefings do refactor `bank.js`, a revisão cética pegou problemas reais em duas rodadas seguidas: contradição sobre uma variável (`DOMAINS`) que o próprio código fornecido não usava mais; ausência de `useMemo` (risco de recálculo do monólito a cada render); falta de normalização de case na rota (`/CTFL/` vs `/ctfl/`); comparação de tipos frágil (`===` entre `chapter` number vs string); e, mais grave, uma renomeação de função (`coverageByDomain` → `coverageByChapter`) que quebraria a aplicação em runtime se algum componente consumidor não fosse migrado.
- **Verificação direta no código antes de aceitar qualquer relato de execução** — inclusive relatos do próprio processo de trabalho descrito aqui. Um exemplo concreto e recente: ao inspecionar os arquivos reais dos repositórios para gerar este handoff, dois problemas potenciais foram descobertos que **nenhuma das validações anteriores (incluindo a revisão do GLM) havia pego**: o campo `cert` que passou a existir no schema (contradizendo um diagnóstico anterior) e a ausência de `chapterWeights`/`examFormat` no `meta` do monólito multi-cert (risco real pro `buildExamInLang()`, não coberto pelo teste Node que só validou contagem e cobertura por capítulo, não a distribuição ponderada do exame).

### O que não funcionou / risco conhecido
- **Um agente de execução reescreveu changelog histórico durante uma tarefa de "atualizar contagem atual"**: ao trocar menções desatualizadas de "200 questões" para o número atual, um *find-and-replace* cego alterou também entradas de changelog referentes a versões antigas (v1.0.0, v2.1.0), fazendo parecer que releases passados já tinham a contagem atual — o que é falso. Corrigido com `git commit --amend` (sem gerar commit extra de correção), mas o padrão de risco é real: **qualquer instrução de "atualizar X para Y" precisa deixar explícito que o escopo é o estado atual do documento, não registros históricos**, e briefings futuros devem instruir isso de forma explícita, não assumir que é óbvio.
- **Relatórios de execução de agentes de IA (Antigravity, Claude Code) tendem a reportar sucesso com mais confiança do que o que foi de fato verificado** — o relato da refatoração `bank.js` disse "concluído com sucesso cirúrgico" e passou a validação Node pedida, mas essa validação não cobria todos os caminhos de risco reais (ver achado sobre `buildExamInLang()` acima). **Lição**: uma validação que passa não significa ausência de bugs — significa ausência dos bugs que a validação foi desenhada para pegar. Vale expandir o script de validação Node para também exercitar `buildExamInLang()` e comparar a distribuição de questões por capítulo contra os pesos oficiais, não só contagem total e cobertura.

---

## 7. Pendente / planejado, por fase

### Fase 5 (continuação) — itens já decididos, aguardando briefing técnico
- Refactor `bank.js` → mergear a branch existente **depois** de corrigir o achado sobre `chapterWeights`/`examFormat` (Seção 3) e considerar simplificar o filtro usando o campo `cert` (Seção 3).
- Atualizar `package.json` (nome, possivelmente versão) e prosa do README do app pro rebrand Synapse — mesmo trabalho já feito no repo de conteúdo.
- Seção de contato no footer (resumo sobre o Iron, GitHub, LinkedIn, email) — decisão: footer fixo em todas as páginas.
- Seção de feedback — decisão: recomendado Google Forms linkado no footer (zero infra nova, notificação automática por email, exportável).
- Badges de versão por certificação (`CTFL · v4.0`, `CTAL-TA · v4.0`) no card do seletor — decisão: integrado no card, não em página separada.
- Ordem de lançamento de certificações confirmada: 1) CTFL (no ar), 2) CTAL-TA (no ar), 3) CTAL-TM (em breve, syllabus v3.0 a confirmar capítulo a capítulo antes de badge oficial), 4) CT-AI (em breve, pode furar fila por interesse de mercado), 5) CTAL-AT v2.0 (em breve, syllabus totalmente novo do zero — **não** reaproveita o conteúdo do CTFL-AT antigo, ainda sem conteúdo gerado).

### Achados de UX pendentes (sessão dedicada futura, não fase numerada)
- SRS sem feedback visual em modo Quiz (`rateSRS()` não avança nem dá feedback, diferente de `rate()` em Flashcards).
- Filtro "Hoje" (cards devidos) só aparece condicionalmente.
- Zero explicação no app do que SRS / Again-Hard-Good-Easy significam.
- `getDueItems` só retorna itens que já têm entrada em SRS — usuário novo nunca vê o modo Revisão.

### Itens técnicos menores, não bloqueantes
- CSS duplicado entre tema escuro via `@media` e via `[data-theme]`.
- `build_bank.py`/`add_en.py` ainda cobrem só o bloco legado de 200 questões CTFL — não geram as 100 novas nem o multi-cert (débito documentado no próprio README do banco).
- As 100 questões novas do CTFL ainda não têm baseline própria em `check_alignment.py`.
- `sync-app.yml` sincroniza só `ctfl-questions-ptbr.json` — não há pipeline equivalente para `synapse-question-bank.json` chegar em `src/data/` do app.

### Roadmap antigo, fora de qualquer fase numerada
- Flashcards/Glossário — revisão de redundância (candidato não aprovado, jun/2026).
- Vídeos do YouTube por capítulo via NotebookLM (candidato não aprovado, jun/2026).
- Aba autoalimentada de notícias/dicas — exigiria infraestrutura nova, contraria filosofia de custo-zero (candidato não aprovado, jun/2026).
- Monetização — deliberadamente adiada até tração real de usuários.
- QA Infra (Playwright e2e) — candidata, zero custo, não iniciada.

---

## 8. Processo de trabalho (como o projeto tem sido conduzido)

- O dono do projeto (Iron) não escreve código diretamente — atua como decisor de produto e revisor. A implementação acontece via agentes de execução (Antigravity, Claude Code), orientados por briefings escritos por um Claude no chat atuando como arquiteto/revisor.
- Briefings seguem formato fixo: **Abra** (lista exata de arquivos), **TAREFA** (uma linha), **CONTEXTO IMPORTANTE** (causa raiz, riscos conhecidos), **MUDANÇA** (idealmente com código embutido), **VALIDAÇÃO** (objetiva, checklist, comandos determinísticos — não "reler e confirmar"), **NÃO FAÇA** (instruções negativas explícitas), modelo recomendado.
- Para tarefas de risco (schema, dado histórico, lógica de negócio): diagnóstico primeiro (só leitura), depois briefing de correção, só após aprovação explícita do dono do projeto.
- **Todo briefing de risco médio/alto passa por uma segunda revisão cética** (GLM 5.2, sem contexto da conversa que gerou o briefing) antes de ir pra execução. Histórico mostra essa revisão pegando problemas reais em praticamente todas as rodadas — não é uma formalidade, tem taxa de acerto real.
- Nenhum commit é pushado automaticamente — fica como decisão explícita do dono do projeto (todos os briefings desta fase instruíram "commit local, SEM push").

---

## 9. Conexão com o projeto paralelo de LinkedIn

Existe um segundo projeto (mesmo dono) de conteúdo para LinkedIn, documentando a jornada de QA. Regra vigente: sempre que um marco técnico relevante acontecer aqui (fase fechada, bug real com boa história, decisão técnica não-óbvia), isso deve ser sinalizado como candidato a virar post — resumo dos pontos-chave fornecido sob pedido, mas o post em si é escrito no outro projeto, nunca aqui. A 4ª rodada de bugs de gabarito (Seção 5) e o incidente de reescrita de changelog (Seção 6) são bons candidatos a esse tipo de conteúdo.

---

## 10. Primeira ação recomendada para quem assumir

1. **Localizar a branch com o refactor `bank.js`** (relatada como `feat/routing-and-300-questions` em sessão anterior) e verificar diretamente no código, antes de mergear: (a) se `certs.config.js` depende de `monolith.meta.chapterWeights`/`examFormat` (que não existem no `synapse-question-bank.json` real, confirmado nesta verificação) — se sim, corrigir antes do merge; (b) se o filtro de questões por cert usa o campo `q.cert` recém-confirmado no schema, ou ainda o casamento frágil `chapter`+`domain`.
2. **Reconciliar o drift entre dado e código/docs no repo do app**: o `src/data/ctfl-questions-ptbr.json` já está em 300 questões (sync automático funcionando), mas `package.json`, `README.md` e `bank.js` ainda refletem o estado de 200 questões / single-cert. Fechar essa lacuna é pré-requisito antes de qualquer trabalho novo de UI.
3. **Expandir a validação Node do refactor `bank.js`** para exercitar `buildExamInLang()` e comparar a distribuição de questões por capítulo contra os pesos oficiais — a validação anterior só cobriu contagem total e `coverageByChapter()`, não o caminho de geração de exame, que é onde o risco identificado nesta verificação realmente mora.
4. **Tratar qualquer relatório de execução de agente (Antigravity, Claude Code, ou qualquer outro) com o mesmo ceticismo aplicado nesta verificação** — inspecionar o arquivo real antes de considerar uma tarefa fechada, mesmo quando a validação pedida no briefing passou. Uma validação que passa cobre só os caminhos que ela foi desenhada pra cobrir.
5. Decidir e briefar tecnicamente os 3 itens de roadmap já aprovados nesta fase (footer de contato, seção de feedback, badges de versão) — todos dependem do `certs.config.js` estar corrigido e mergeado primeiro (item 1).
