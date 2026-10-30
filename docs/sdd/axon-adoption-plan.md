# Axon no Synapse — plano auditado em 2026-10-30

A dependência Axon foi integrada no PR #12 do app. As 431 IDs de estudo e
as correções editoriais foram integradas no PR #7 do banco; o manifesto PT-BR
correspondente foi publicado no hub pelo PR #1. Sua impressão digital coincide
com a prévia gerada a partir do banco. O PR #15 do app disponibiliza os links.
As oito correções finais preservam IDs internas e índices de resposta. Duas
questões CTFL sobre casos de uso indicam que são conteúdo complementar fora do
exame CTFL v4.0.1. A revisão detalhada está no banco canônico em
`editorial/axon-study-reference-review-2026-10-30.md`.

## Estado e limites

### Escopo do banco inteiro (não é o escopo do lote atual)

O banco canônico contém 1.100 questões: 300 CTFL, 200 CTFL-AT, 200 CTAL-TA,
200 CTAL-TM e 200 CT-AI. A partição atual registra 431 questões de estudo nas
três provas ativas (CTFL 220, CTAL-TA 110, CTAL-TM 101), 269 questões
exclusivas de simulado (80 + 90 + 99) e 400 questões de CTFL-AT/CT-AI, fora do
escopo ativo atual. Os pools de simulado ficam permanentemente fora de qualquer
manifesto público.

O plano de cinco fatias abaixo descreve **as etapas técnicas da integração**,
não cinco rodadas de leitura manual das 1.100 questões. As três rodadas de
expansão deste escopo foram organizadas por prova: CTFL (170 restantes),
CTAL-TA (110) e CTAL-TM (101). Com o primeiro lote CTFL de 50, cobrem os 431
itens de estudo das provas ativas. A triagem automática encontrou 431 referências candidatas após revisão e correção das 50 retenções; nenhuma permanece `held`. As 400 questões CTFL-AT/CT-AI continuam fora do escopo ativo;
as 269 questões de simulado ficam permanentemente excluídas.

### Andamento da integração Axon (escopo ativo)

| Fatia | Escopo                                            | Estado                                           |
| ----- | ------------------------------------------------- | ------------------------------------------------ |
| 1     | Dependência Axon pinada, sem uso em produção      | Integrada (PR #12)                               |
| 2     | Reservar IDs estáveis para pools de estudo ativos | 431 integradas no banco (PR #7)                  |
| 3     | Gerar/validar snapshots PT-BR e checksum          | 431 previews válidos localmente; nenhum `held`   |
| 4     | Rodar preview em CI e guardar artefato temporário | Prévia de 431 validada em CI no PR #15           |
| 5     | Preparar manifesto no hub e links no app          | Hub publicado; links preparados no PR #15 do app |

Nenhuma questão permanece retida. O hub já serve o manifesto em produção.

- `@ironidesflj/axon@0.2.2` é a versão publicada e registrada pelo Noos.
  A assinatura real de `verifyChecksum` é `verifyChecksum(record)`; os exemplos
  de duas chamadas no guia publicado estão incorretos.
- O banco canônico vive em `ctfl-question-bank-ptbr`. O app consome fatias
  derivadas. Alterar apenas os JSONs do app seria perdido no próximo sync.
- As IDs internas (`ch1-01`, `ctalta-03` etc.) já indexam progresso, cartões,
  questões salvas e rascunhos nos dispositivos dos alunos. Elas não serão
  substituídas por IDs públicas. A ligação será um campo ou mapa estável
  `internalId -> SYN-*`, mantido na fonte canônica e validado no app.
- O Axon exige ID no formato `PREFIXO-PROVA-SEQ`, com o código da prova sem
  hífen: `SYN-CTALTA-*` e `SYN-CTALTM-*`.
- O banco tem 1.100 questões, mas apenas 700 pertencem às três provas ativas.
  Destas, 269 estão no pool exclusivo de simulado. O manifesto público não
  pode expor esse pool nem certificações latentes. CTAL-TM ainda tem dívida
  editorial aberta.
- O parser do Axon aceita uma linha por ID; repetir a mesma ID em PT e EN
  rejeita a segunda linha. A primeira publicação precisa escolher um idioma
  canônico por questão. O snapshot PT-BR é a proposta inicial para CTFL.
- As 431 questões candidatas têm referência específica no ledger. As duas
  questões CTFL sobre casos de uso indicam explicitamente seu caráter complementar e apontam para o syllabus avançado.

## Sequência de implementação

1. **Fatia 1 — link inerte.** Instalar a versão exata com lockfile e registrar
   aqui. Nenhum import de produção, alteração do banco ou ID publicada.
   Aceite: `npm ci`, lint, testes, build, E2E e bundle sem Axon.
2. **Fatia 2 — identidade preparada, sem publicação de conteúdo.** Na fonte
   canônica, reservar IDs para CTFL, CTAL-TA e CTAL-TM de estudo. Preservar as
   IDs internas e registrar `lastIssued` por prova. A guarda deve recusar
   colisões, remapeamentos e qualquer questão do pool `exam`.
3. **Fatia 3 — snapshot e integridade.** Gerar prévia PT-BR das 431 candidatas
   com `version: 1`, resposta em letra e checksum calculado/verificado pelo
   Axon. Não há itens `held`.
4. **Fatia 4 — manifesto em CI.** A prévia gera JSONL somente em diretório
   temporário, exige zero rejeições e checksum válido e guarda o artefato por
   sete dias. A prévia local e o CI do PR #15 validaram 431 snapshots; o
   manifesto correspondente foi publicado no hub pelo PR #1.
5. **Fatia 5 — link visível.** O link está preparado no PR #15 para 431 IDs
   com snapshots aprovados; não faz fetch ao hub em runtime. O manifesto e as
   páginas PT/EN foram publicados no hub. PT/EN, layout mobile e uso offline
   foram conferidos no app; confirmar o funcionamento público após o deploy.

O progresso dos alunos e o banco de simulado não entram no contrato público.
