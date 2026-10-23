# Pools Exclusivos: Estudo × Simulado (r13)

## O modelo

Cada certificação tem **dois pools disjuntos de questões**:

| Pool                     | CTFL | CTAL-TA | Alimenta                                                                              |
| ------------------------ | ---- | ------- | ------------------------------------------------------------------------------------- |
| **Estudo**               | 220  | 110     | Quiz, erradas, salvos, SRS, pontos fracos, flashcards de questão, cobertura/prontidão |
| **Simulado (exclusivo)** | 80   | 90      | Simulado oficial (blueprint) e simulado personalizado                                 |

Nenhuma questão circula entre os dois mundos: o que você treina no estudo
**nunca aparece** num simulado, e as exclusivas de simulado **nunca aparecem**
nos modos de estudo. O resultado da prova mede conhecimento real, sem efeito
de memorização.

Os números vêm do design: o pool de simulado equivale a **F = 2 blueprints
completos** por célula (capítulo × K-level). Isso garante:

1. **Fidelidade oficial**: toda prova sorteia a distribuição exata do
   blueprint ISTQB (capítulo × K-level);
2. **2 provas disjuntas**: duas rodadas seguidas nunca precisam repetir
   questão (além disso, o sorteio por célula dá variedade combinatória);
3. **Material de estudo preservado**: o dia a dia do app continua com a
   maioria do banco (220 de 300 no CTFL).

Certs sem `examBlueprint` no meta (CTFL-AT, CTAL-TM, CT-AI — ainda "em
breve") ficam 100% no pool de estudo até ganharem blueprint ao saírem do
estado "em breve".

## Por que partir o banco existente (e não redigir questões novas)?

Decisão registrada da r13, após estudo nas fontes oficiais (apenas
istqb.org e bstqb.online/ctfb):

1. **Qualidade auditada** — o banco passou por verificações de alinhamento
   (`check_alignment.py`, ledger FASE4 com 98 fixes de letra, 110 de índice).
   Questões novas trariam risco de desvio editorial e de "alucinação".
2. **Fonte da verdade** — o conteúdo já deriva dos syllabus oficiais; não há
   material mais oficial para redigir contra.
3. **Determinismo verificável** — a partição é um script com seed fixa,
   idempotente, testado em ambas as direções (`pools-exclusivos.test.js`).
4. **Custo/benefício** — 300 questões (CTFL) atendem os dois mundos sem
   content risk.

Caminho futuro documentado: quando um cert novo entrar, se o banco dele não
cobrir 1× o blueprint, aí sim será necessário autorar questões novas (a
regra do script já avisa quando o pool é insuficiente).

## Dificuldade: fidelidade, não inflação

**Não aumentamos a dificuldade dos simulados artificialmente.** As fontes
oficiais definem a dificuldade pelo _blueprint_ (mix de K-levels) e pelas
condições de prova. A rodada r13 corrigiu o app para colar nessas regras:

|               | CTFL v4.0                               | CTAL-TA v4.0                       |
| ------------- | --------------------------------------- | ---------------------------------- |
| Questões      | 40                                      | 45                                 |
| Pontuação     | 1 ponto por questão                     | K2=1 · K3=2 · K4=3 → **78 pontos** |
| Corte         | **26/40** (65%)                         | **51/78** (65%)                    |
| Tempo         | **60 min**                              | **120 min**                        |
| Extensão +25% | só não-nativos, solicitada na inscrição | idem                               |

- **Cronômetro**: o app usava o tempo estendido (75/150 min) por padrão;
  agora usa o tempo nativo do BSTQB (prova em português no Brasil), igual à
  condição real do candidato brasileiro.
- **CTAL-TA por pontos** (correção importante): o app calculava 29/45 em
  contagem simples; o modelo oficial v4.0 é ponderado por K-level — o
  simulado agora mostra `pontos/78 pts`, e o veredito segue 51/78.
- A dificuldade _percebida_ sobe naturalmente com a exclusividade (questões
  nunca vistas) — sem inflar artificialmente e sem descalibrar a previsão de
  prontidão.

## Como a partição foi feita

Script: `partition_pools.py` **no repositório do banco** (fonte da verdade
do conteúdo). Execução idempotente com seed fixa (`0x5A12E5`):

```
python3 partition_pools.py     # marca q.pool = "study" | "exam" no monólito
node scripts/split-bank.mjs    # regenera as fatias por cert (app)
```

Regras:

- Pool de simulado = F× blueprint por célula (F=2), escolhidas com
  **gabarito balanceado** (anti-viés: o CTAL-TM concentra alternativa 0;
  partição produz 22/21/20/17 no CTFL e 23/23/21/23 no CTAL-TA);
- Hard-fail se alguma célula ficar menor que 1× blueprint;
- `meta.poolSplit` registra fonte, seed, regra e contagens.

## Invariantes (travados por teste)

`src/lib/pools-exclusivos.test.js`:

- interseção estudo × simulado **vazia** (id e objeto);
- `buildExamInLang`/`buildCustomExamInLang` sorteiam **só** do pool exclusivo
  (30 sorteios), mantendo blueprint exato;
- `byChapterInLang`, `buildWeakFocusInLang`, cobertura e prontidão operam
  **só** sobre o pool de estudo;
- células do blueprint atendem ≥1× e ≥2× (F=2);
- gabarito do pool de exame balanceado (<40% por índice).

`src/components/quiz-examscoring.test.jsx`: os dois modelos oficiais de
pontuação (count e points), corte exato, custom proporcional, casos limite.

## Notas de produto (decisões deliberadas)

- **Revisar erros do último simulado** ("🔁 Repetir erros") é fluxo pós-prova
  e usa os ids da prova — é como se aprende com a prova que acabou de fazer
  (o BSTQB inclusive publica exames de exemplo com gabarito). Depois disso,
  futuros simulados podem re-sortear essas questões — igual aos exames reais,
  que reaproveitam pool entre aplicações.
- **Cobertura/prontidão** medem o material de estudo; exames têm histórico
  próprio. Usuários antigos veem a cobertura recalculada sobre o pool de
  estudo (220 no CTFL) — coerente com o que é treinável.
- Tentativas antigas em questões que migraram para o pool exclusivo são
  preservadas no histórico, mas não alimentam mais seletores de estudo.

## Fontes oficiais consultadas (r13)

- istqb.org — CTFL v4.0: 40 questões, 26 para aprovação, 60 min (+25%
  não-nativo); CTAL-TA v4.0: 45 questões, 78 pontos, corte 51, 120 min.
- bstqb.online/ctfl — exame em português no Brasil; tempo estendido apenas
  mediante solicitação na inscrição; +10 min finais para transcrever o
  gabarito (não se aplica a app); exames de exemplo públicos (Sets A/B).

# CTAL-TM v3.0 — v3.17.0

200 questões: 101 de estudo e 99 exclusivas de simulado. Prova com 50
questões e 88 pontos; aprovação a partir de 58 pontos; duração de 120 min.
Distribuição por capítulo: 26/15/9. Na célula capítulo 2/K3 há 7 questões
para 2 × 4 posições: duas formas inteiramente disjuntas não são garantidas.
As 28 questões K4 estão no simulado; falta conteúdo K4 no pool de estudo.
