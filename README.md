# CTFL Prep — ISTQB Foundation Level v4.0

App de preparação para o exame **ISTQB Certified Tester Foundation Level (CTFL) v4.0**.
React + Vite, instalável como PWA, funciona offline. Banco de **200 questões** em PT-BR.

## Funcionalidades

- **Quiz — modo Estudo:** feedback por questão, filtra domínio/quantidade, modo **"Errei antes"**
  (aparece quando há histórico de erros).
- **Quiz — modo Simulado:** 40 questões proporcionais ao exame, cronômetro 75 min, revisão no fim.
- **Flashcards:** marcação Sei/Não sei, filtro "Revisar (N)" para cards pendentes.
- **Syllabus** por capítulo.
- **Syllabus acionável:** botão "Estudar este capítulo" abre o Quiz pré-filtrado.
- **Progresso** por domínio com exportar/importar JSON (sincronização manual entre aparelhos).
- **PWA:** instalável no celular, funciona offline.
- **Banco:** 200 questões PT-BR, distribuição proporcional ao exame CTFL v4.0.

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
  lib/storage.js                  persistência local, memória por questão (seen) + export/import
  components/                     Quiz, Flashcards, Syllabus, Stats
  App.jsx, main.jsx, styles.css
```

## Atualizar o banco de questões

O banco é gerado pelo script `build_bank.py` (no repositório do banco). Após gerar um novo
`ctfl-questions-ptbr.json`, substitua o arquivo em `src/data/`. O inglês entrará como `locales.en`
em cada questão, sem alterar o código.

## Aviso

Material de estudo independente, **não afiliado ao ISTQB**. Baseado na estrutura pública do syllabus CTFL v4.0.x

## Changelog

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
