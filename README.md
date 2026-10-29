# Synapse — Multi-Certificação ISTQB

App de preparação para exames de certificação ISTQB. A versão 4.1.0 está na
`main` desde o PR #9. Usa React + Vite, pode ser instalada como PWA e oferece
suporte offline.

## Catálogo de conteúdo (1.100 questões)

**Certificações disponíveis:**

- **CTFL v4.0:** 300 questões
- **CTAL-TA v4.0:** 200 questões
- **CTAL-TM v3.0:** 200 questões

**Roadmap:**

- **CT-AI v2.0:** 200 itens (em breve)
- **CTAL-AT v2.0:** previsto; conteúdo ainda não publicado

**Conteúdo Legado:**

- **CTFL-AT (Agile Tester v2014):** 200 itens (adormecido/sunset pela ISTQB, substituído pelo CTAL-AT v2.0. O conteúdo é mantido no repositório por razões de arquivo, mas não entrará no roadmap de lançamentos).

## Funcionalidades

- **Quiz — modo Estudo:** pool exclusivo (CTFL: 220; CTAL-TA: 110; CTAL-TM: 110), feedback por questão, filtra domínio/quantidade,
  marca questões, oferece modo **"Errei antes"** e treino dirigido por
  capítulo/K-level.
- **Quiz — modo Simulado:** pool exclusivo (CTFL: 80; CTAL-TA: 90; CTAL-TM: 90), questões
  estratificadas pelo blueprint oficial de capítulo e K-level (CTFL: 40q/60min;
  CTAL-TA: 45q/120min e pontuação K2=1, K3=2, K4=3; corte 51/78), personalização,
  grade de navegação, rascunho persistido, retomada e revisão no fim.
- **Flashcards:** conteúdo PT/EN para CTFL e CTAL-TA, marcação Sei/Não sei e
  filtro "Revisar (N)" para cards pendentes.
- **Syllabus e Glossário:** conteúdo por certificação e capítulo, incluindo os
  cinco capítulos e objetivos K4 do CTAL-TA.
- **Syllabus acionável:** botão "Estudar este capítulo" abre o Quiz pré-filtrado.
- **Progresso:** prontidão por blueprint, radar por domínio, desempenho por
  K-level, heatmap interativo de 12 semanas, seis conquistas, meta diária, histórico de
  simulados, data da prova, exportação CSV e backup/restauração JSON.
- **PWA:** instalável, shell e rotas offline, splash iOS claro/escuro, atalhos
  e atualização gentil sem interromper a sessão.
- **Novidades de versão:** toast avisa quando a atualização está pronta; após
  releases significativas, um resumo bilíngue aparece uma única vez por versão.
- **Sobre o Synapse:** acesso permanente no footer reabre a apresentação
  institucional completa, com funcionamento, FAQ, autor e redes, sem perder a
  rota ou o estado atual.
- **Feedback:** link global e seção institucional abrem um Issue Form público no
  GitHub; o app não envia nem armazena progresso, respostas ou dados pessoais.
- **Banco:** três certificações disponíveis, com pools de estudo/simulado
  separados e distribuição conforme o blueprint de cada exame. A revisão
  editorial e as guardas do banco CTAL-TM seguem em andamento; consulte o
  changelog e o SDD antes de tratar esse conteúdo como editorialmente fechado.
- **Toggle PT/EN no header:** alterna o idioma das questões, Flashcards,
  Syllabus e Glossário nas certificações disponíveis.

## Acesso institucional e feedback

O footer das áreas principais oferece “Sobre o Synapse” e “Enviar feedback”. A
apresentação é interna e funciona offline; o feedback abre um formulário público
do GitHub e exige conexão e conta. Não inclua dados pessoais, arquivos de backup,
respostas de simulados, tokens ou informações sensíveis.

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

Vercel é o destino oficial, com build `npm run build` e saída `dist`. Netlify
também pode servir o build. O workflow de GitHub Pages é opcional e manual;
deploy em subpath exige configurar `--base` e validar rotas/deep links. Veja
[DEPLOY.md](./DEPLOY.md) para os passos e limitações do PWA.

## Banco de questões

Os bancos usados pelo app ficam em `src/synapse/data/banks/` e são carregados
por certificação. O monólito `src/synapse/data/synapse-question-bank.json` é
mantido como referência para testes de integridade do split. A governança,
sincronização e publicação da fonte canônica estão descritas no SDD e nos
workflows do repositório do banco.

## Qualidade

```bash
npm ci
npm run lint
npm run format:check
npm run test
npm run build
npx playwright install chromium # apenas na primeira execução local
npm run test:e2e
```

O CI executa lint, formatação, testes, build e E2E em Chromium. Para os números
mais recentes de cobertura e estado de publicação, consulte o changelog e o
SDD; eles variam entre fases de desenvolvimento.

## Aviso

Material de estudo independente, **não afiliado ao ISTQB**. Baseado na estrutura pública do syllabus CTFL v4.0.x

## Changelog

Histórico completo em [CHANGELOG.md](./CHANGELOG.md).
