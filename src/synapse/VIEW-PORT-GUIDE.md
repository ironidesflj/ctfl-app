# Guia de portabilidade das views — Synapse handoff → Next.js

Este guia é obrigatório para quem portar uma view do protótipo para o app real.

## Contexto

O app Synapse (preparação ISTQB) está sendo reconstruído em Next.js 16 (App Router,
TypeScript) aplicando o handoff em sua totalidade. O protótipo (vanilla JS, sem build)
é a especificação comportamental: **porta a lógica fielmente**; o CSS já está global
e verbatim em `src/app/globals.css` — **não crie CSS novo**.

- Protótipo (leia o arquivo da sua view): `/home/z/my-project/upload/extracted/handoff/synapse/js/<view>.js`
- CSS de referência (classes já existentes): `/home/z/my-project/upload/extracted/handoff/synapse/synapse.css` (Estudar) e `synapse-app.css` (demais abas)
- App real: `/home/z/my-project/src/synapse/views/<View>.tsx` (substitua o stub)
- View de referência já portada: `src/synapse/views/Hoje.tsx` — siga o mesmo padrão
- Handoff completo: `/home/z/my-project/upload/extracted/handoff/synapse/HANDOFF.md`

## Regras invioláveis (handoff)

1. **Uma casca.** A view nunca renderiza cabeçalho/trilho/idioma/tema — isso é do `Shell`.
2. **DOM = classes do protótipo.** As strings HTML do JS do protótipo definem exatamente
   as classes (`hero`, `kicker`, `lead`, `plan-head`, `facts`, `view-foot`...). O JSX deve
   produzir a mesma árvore. Mantenha os atributos `data-od-id` onde existirem.
3. **Nada de número inventado.** Dado ausente → "—", estado vazio ou frase honesta.
4. **PT/EN** via `t()`; o idioma é `state.lang`. Copy local (blocos `COPY` no JS da view)
   é portado para dentro do componente como objeto `{ pt: {...}, en: {...} }`.
5. **Nenhuma lib externa** (nada de lucide, framer, shadcn). SVGs inline como no protótipo.
6. **Não edite** `store.tsx`, `Shell.tsx`, `globals.css`, `types.ts` ou `data/*`.
   Se algo faltar na API do store, reporte no final da sua resposta.

## API do store (`useSynapse()`)

Leia `src/synapse/store.tsx` para a assinatura completa. Resumo:

```ts
const ss = useSynapse();
ss.state            // { cert, lang, theme, seen, attempts, log, cards, srs, checkins, exam }
ss.tab, ss.mounted, ss.bankStatus, ss.navSeq
ss.goTab(tab, { cap })          // navegação interna (substitui href="estudar.html?cap=3")
ss.peekCap()                    // cap pendente desta navegação (leia no efeito de mount)
ss.setCert(id)                  // troca de prova (só provas live)
ss.setLang / ss.setTheme / ss.setSession(on) / ss.announce(msg)
ss.scrollTop() / ss.focusId(id)
ss.cert()                       // metadados da prova ativa
ss.questionsFor()               // Bank: { "1": Question[], ... } (já carregado — o Shell só monta a view quando pronto)
ss.chapterOf(n) / ss.nextChapter(c) / ss.coverage(c) / ss.seenFor(ch) / ss.pctFor(ch)
ss.attemptsFor(ch) / ss.accuracy() / ss.readiness() / ss.cutText(ex) / ss.kLevels()
ss.lastSession() / ss.markSeen(qid, ch) / ss.recordAttempt(qid, ch, ok) / ss.logSession(entry)
ss.cardList() / ss.cardState(qid) / ss.dueCards() / ss.rateCard(qid, rating, ch) / ss.cardStats()
ss.checkins() / ss.streak() / ss.examDate() / ss.setExamDate(v) / ss.daysToExam()
ss.todayAttempts(ch?) / ss.todayReviews() / ss.todayActivity() / ss.weekActivity() / ss.activity(12)
ss.t('study.title')             // strings PT/EN (ver data/strings.ts)
ss.links                        // feedback, istqbGlossary, noos...
```

Utilitários exportados do store: `fmt(str, vars)`, `pad2(n)`, `dayKey(ts?)`, `daysAgo(n)`, `isLive(id)`.

## Conversões protótipo → React

| Protótipo                                                    | React                                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `SS.esc(x)` em template string                               | `{x}` no JSX (React escapa sozinho)                                                        |
| `data-action="foo"` + actions map                            | `onClick={handler}` no elemento                                                            |
| `href="estudar.html?cap=3"`                                  | `onClick={() => ss.goTab("estudar", { cap: 3 })}` (botão)                                  |
| `href="flashcards.html"`                                     | `onClick={() => ss.goTab("flashcards")}` (botão)                                           |
| `href="hoje.html"` / `progresso.html` / `certificacoes.html` | `ss.goTab("hoje" / "progresso" / "certs")`                                                 |
| link externo (feedback, ISTQB)                               | `<a href target="_blank" rel="noopener noreferrer">`                                       |
| `SS.render()`                                                | `setState` local — a view re-renderiza sozinha                                             |
| `config.reset()`                                             | automático: o Shell remonta a view ao trocar de prova (`key`)                              |
| `config.ready()`                                             | `useEffect(() => {...}, [])` de mount                                                      |
| handler `key(e)` delegado                                    | `useEffect` com `document.addEventListener("keydown", ...)` + cleanup                      |
| `SS.focusId('qTitle')` após render                           | `window.setTimeout(() => ss.focusId("qTitle"), 0)` ou efeito                               |
| `SS.setSession(!!session)`                                   | efeito: `useEffect(() => { ss.setSession(on); return () => ss.setSession(false); }, [on])` |
| `var filter = 'all'` (estado de view)                        | `useState`                                                                                 |
| `SS.announce(...)`                                           | `ss.announce(...)`                                                                         |

Teclado (portar as guardas do protótipo): ignore eventos quando `e.target.tagName`
for `INPUT`/`A`/`SUMMARY`; em `BUTTON` ignore Espaço/Enter (o clique nativo cuida).

`inert`/`aria-hidden` das faces do flashcard: use a prop `inert={bool}` do React 19
(ou `aria-hidden` + `inert` via ref se necessário).

## Estados vazios (regra 12)

- Prova `status !== 'live'`: hero `empty-hero` com `t('study.emptyTitle')` +
  `t('study.emptyBody')` + botão `t('study.emptyAction')` → `ss.setCert('ctfl')`
  (exceto onde o protótipo usa `t('cert.choose')` → `ss.goTab('certs')` — siga o
  protótipo de cada view).
- Fila vazia, sem sessões, sem conferências: use os copy `*None`/`*Empty` do protótipo.

## Verificação (obrigatória ao terminar)

1. `cd /home/z/my-project && bun run lint` — zero erros no(s) seu(s) arquivo(s).
2. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200.
3. Leia as últimas linhas de `dev.log` — sem erros de compilação.
4. Confira classe por classe do markup contra o protótipo.

Ao terminar, responda com: o que portou, decisões tomadas, e qualquer desvio do
protótipo (com justificativa).
