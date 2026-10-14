# Synapse — Multi-Certificação ISTQB

App de preparação para os exames de certificação ISTQB.
React + Vite, instalável como PWA, funciona offline.

## Estado atual (1.100 questões)

**Conteúdo no Ar (Lançado):**

- **CTFL v4.0:** 300 questões
- **CTAL-TA v4.0:** 200 itens

**Roadmap de Lançamentos Futuros (Em Breve):**

- **CTAL-TM v3.0:** 200 itens (em breve)
- **CT-AI v2.0:** 200 itens (em breve)
- **CTAL-AT v2.0:** 200 itens (em breve - syllabus totalmente novo do zero, a ser gerado)

**Conteúdo Legado:**

- **CTFL-AT (Agile Tester v2014):** 200 itens (adormecido/sunset pela ISTQB, substituído pelo CTAL-AT v2.0. O conteúdo é mantido no repositório por razões de arquivo, mas não entrará no roadmap de lançamentos).

## Funcionalidades

- **Quiz — modo Estudo:** pool exclusivo (CTFL: 220; CTAL-TA: 110), feedback por questão, filtra domínio/quantidade,
  marca questões, oferece modo **"Errei antes"** e treino dirigido por
  capítulo/K-level.
- **Quiz — modo Simulado:** pool exclusivo (CTFL: 80; CTAL-TA: 90), questões
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
- **Banco:** multi-certificação (`getBank(certId)`), CTFL (300q) e CTAL-TA
  (200q) no ar, com pools de estudo/simulado mutuamente exclusivos e
  distribuição proporcional ao blueprint oficial de cada uma.
- **Toggle PT/EN no header:** alterna o idioma das questões, Flashcards,
  Syllabus e Glossário nas duas certificações disponíveis.

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

- **Vercel/Netlify:** importe o repositório; build `npm run build`, diretório de saída `dist`.
- **GitHub Pages:** o workflow é manual; para subpath, gere a build com o
  `--base` correspondente e valide roteamento/deep links antes de publicar.

## Estrutura

```
src/
  data/banks/                    chunks lazy das certificações live
  data/synapse-question-bank.json fonte de verdade do teste de integridade
  data/study.js                    flashcards + tópicos do syllabus
  lib/certs.config.js              config por certificação (capítulos, domínios)
  lib/bank.js                      getBank(certId) — factory: filtros, amostra do simulado
  lib/activity.js                  métricas, metas, datas e recortes de atividade
  lib/pwa.js                       registro e atualização gentil do service worker
  lib/settings.js                  preferências e migração das chaves legadas
  lib/storage.js                   persistência por cert, rascunho e backup
  components/                      Quiz, Flashcards, Syllabus, Stats
  App.jsx, main.jsx, styles.css
```

## Atualizar o banco de questões

O banco é mantido no repositório `ctfl-question-bank-ptbr`. Push de
`ctfl-questions-ptbr.json` ou `synapse-question-bank.json` na branch `main` dispara
`sync-app.yml`, que abre um Pull Request neste repositório com somente os arquivos
alterados e valida os checksums da origem e do destino. O merge continua manual.

O pipeline legado `build_all.py` encadeia `build_bank.py` → `add_en.py` →
`check_alignment.py`, mas cobre apenas `ctfl-questions-ptbr.json`. O banco multi-cert
de 1.100 questões é versionado diretamente no repositório do banco.

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

O CI executa todos esses gates. A suíte unitária/de componentes tem 340 testes;
os três smokes E2E em Chromium cobrem seleção, estudo, persistência, idioma,
onboarding, conclusão/persistência de simulado e novidades por versão.

## Aviso

Material de estudo independente, **não afiliado ao ISTQB**. Baseado na estrutura pública do syllabus CTFL v4.0.x

## Changelog

Histórico completo em [CHANGELOG.md](./CHANGELOG.md).
