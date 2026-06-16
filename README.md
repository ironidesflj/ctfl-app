# CTFL Prep — ISTQB Foundation Level v4.0

App de preparação para o exame **ISTQB Certified Tester Foundation Level (CTFL) v4.0**.
React + Vite, instalável como PWA, funciona offline. Banco de **120 questões** em PT-BR.

## Funcionalidades

- **Quiz — modo Estudo:** feedback e explicação a cada questão; filtra por domínio e quantidade.
- **Quiz — modo Simulado:** 40 questões na proporção do exame, cronômetro de 75 min, revisão de erros no fim.
- **Flashcards** e **Syllabus** por capítulo.
- **Progresso** por domínio, com **exportar/importar** (sincronização manual entre aparelhos, sem login).
- Alternativas embaralhadas a cada exibição; tags de nível K1/K2/K3.

## Rodar localmente

```bash
npm install
npm run dev
```

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
  lib/storage.js                  persistência local + export/import
  components/                     Quiz, Flashcards, Syllabus, Stats
  App.jsx, main.jsx, styles.css
```

## Atualizar o banco de questões

O banco é gerado pelo script `build_bank.py` (no repositório do banco). Após gerar um novo
`ctfl-questions-ptbr.json`, substitua o arquivo em `src/data/`. O inglês entrará como `locales.en`
em cada questão, sem alterar o código.

## Aviso

Material de estudo independente, **não afiliado ao ISTQB**. Baseado na estrutura pública do syllabus CTFL v4.0.x
