# CTFL Prep — ISTQB Foundation Level v4.0

App de preparação para o exame **ISTQB Certified Tester Foundation Level (CTFL) v4.0**.
React + Vite, instalável como PWA, funciona offline. Banco de **300 questões** em PT-BR.

**Total do projeto (5 certificações): 1.100 questões** — CTFL (300) e CTFL-AT (200) já publicadas = 500; as outras três (CTAL-TA, CTAL-TM, CT-AI) somam 600 (200 cada), geradas e no repositório, aguardando lançamento na Fase 5.

## Funcionalidades

- **Quiz — modo Estudo:** feedback por questão, filtra domínio/quantidade, modo **"Errei antes"**
  (aparece quando há histórico de erros).
- **Quiz — modo Simulado:** 40 questões proporcionais ao exame, cronômetro 75 min, revisão no fim.
- **Flashcards:** marcação Sei/Não sei, filtro "Revisar (N)" para cards pendentes.
- **Syllabus** por capítulo.
- **Syllabus acionável:** botão "Estudar este capítulo" abre o Quiz pré-filtrado.
- **Progresso** por domínio com exportar/importar JSON (sincronização manual entre aparelhos).
- **PWA:** instalável no celular, funciona offline.
- **Banco:** 300 questões PT-BR, distribuição proporcional ao exame CTFL v4.0.
- **Toggle PT/EN no header:** alterna o idioma das questões no Quiz e Simulado
  (Flashcards e Syllabus permanecem em PT, com aviso "coming soon" em EN).

## Rodar localmente

```bash
npm install
npm run dev
```

Para verificar lint e formatação: `npm run lint` e `npm run format:check`.

Abra o endereço mostrado no terminal (normalmente http://localhost:5173).
Aqui o `localStorage` funciona de verdade, então o progresso persiste entre sessões.

## Gerar build de produção

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build localmente para conferência
```

## Deploy

- **Vercel/Netlify:** importe o repositório; build `npm run build`, diretório de saída `dist`.
- **GitHub Pages:** publique o conteúdo de `dist/`. O `base: "./"` no `vite.config.js` já trata caminhos relativos.

## Estrutura

```
src/
  data/ctfl-questions-ptbr.json   banco de questões (schema i18n)
  data/study.js                   flashcards + tópicos do syllabus
  lib/bank.js                     carregamento, filtros, amostra do simulado
  lib/storage.js                  persistência local, memória por questão (seen) + export/import
  components/                     Quiz, Flashcards, Syllabus, Stats
  App.jsx, main.jsx, styles.css
```

## Atualizar o banco de questões

O banco é gerado pelo script `build_all.py` (no repositório do banco), que encadeia
`build_bank.py` → `add_en.py` → `check_alignment.py` num único comando. Ao dar push do
`ctfl-questions-ptbr.json` atualizado na branch `main` do repositório do banco, uma
GitHub Action (`sync-app.yml`) abre automaticamente um Pull Request neste repositório
atualizando `src/data/ctfl-questions-ptbr.json` — não é mais necessário copiar o arquivo
manualmente. Revise e faça o merge do PR gerado.

## Aviso

Material de estudo independente, **não afiliado ao ISTQB**. Baseado na estrutura pública do syllabus CTFL v4.0.x

## Changelog

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
