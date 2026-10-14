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

- **Quiz — modo Estudo:** feedback por questão, filtra domínio/quantidade, modo **"Errei antes"**
  (aparece quando há histórico de erros).
- **Quiz — modo Simulado:** questões proporcionais ao blueprint oficial de cada certificação (CTFL: 40q/75min; CTAL-TA: 45q/150min), revisão no fim.
- **Flashcards:** marcação Sei/Não sei, filtro "Revisar (N)" para cards pendentes.
- **Syllabus** por capítulo.
- **Syllabus acionável:** botão "Estudar este capítulo" abre o Quiz pré-filtrado.
- **Progresso** por domínio com exportar/importar JSON (sincronização manual entre aparelhos).
- **PWA:** instalável no celular, funciona offline.
- **Banco:** multi-certificação (`getBank(certId)`), CTFL (300q) e CTAL-TA
  (200q) no ar, distribuição proporcional ao blueprint oficial de cada uma.
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
  data/synapse-question-bank.json banco multi-cert (schema i18n, 1100q, 5 certs)
  data/study.js                    flashcards + tópicos do syllabus
  lib/certs.config.js              config por certificação (capítulos, domínios)
  lib/bank.js                      getBank(certId) — factory: filtros, amostra do simulado
  lib/storage.js                   persistência local, memória por questão (seen) + export/import
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

O CI executa todos esses gates, incluindo dois smokes E2E em Chromium: fluxo de
estudo/persistência/idioma/onboarding e conclusão/persistência de simulado.

## Aviso

Material de estudo independente, **não afiliado ao ISTQB**. Baseado na estrutura pública do syllabus CTFL v4.0.x

## Changelog

Histórico completo em [CHANGELOG.md](./CHANGELOG.md).
