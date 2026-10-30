# Axon no Synapse — plano auditado em 2026-10-30

Fatia 1 integrada na `main` do app (PR #12). As 431 IDs de estudo foram
reservadas; a expansão está no PR #7 do banco. As 50 retenções foram revistas,
com as 8 últimas questões corrigidas em PT/EN. A prévia local cobre todas as
431 IDs, sem questões retidas; IDs internas e índices de resposta foram
mantidos. Duas questões CTFL sobre casos de uso estão marcadas como conteúdo
complementar fora do exame CTFL v4.0.1, com fonte avançada CTAL-TA.
O manifesto e os links estão preparados localmente; CI, Git/deploy e verificação
HTTP pública continuam pendentes. A revisão está em
`../ctfl-question-bank-ptbr/editorial/axon-study-reference-review-2026-10-30.md`.

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

| Fatia | Escopo                                            | Estado                                                   |
| ----- | ------------------------------------------------- | -------------------------------------------------------- |
| 1     | Dependência Axon pinada, sem uso em produção      | Integrada (PR #12)                                       |
| 2     | Reservar IDs estáveis para pools de estudo ativos | 50 integradas (PR #1); expansão de 381 no PR #7 do banco |
| 3     | Gerar/validar snapshots PT-BR e checksum          | 431 previews válidos localmente; nenhum `held`           |
| 4     | Rodar preview em CI e guardar artefato temporário | Atualização para 431 pendente no CI/PR do app            |
| 5     | Preparar manifesto no hub e links no app          | Preparado localmente para 431; sem integração/deploy     |

Nenhuma questão permanece retida. Nenhum conteúdo novo foi servido pelo app/hub em produção.

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
- As 431 referências candidatas foram revisadas individualmente e têm fonte
  específica no ledger. As duas questões CTFL sobre casos de uso indicam explicitamente seu caráter complementar e apontam para o syllabus avançado.

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
   sete dias. A validação local de 431 snapshots passou; o CI precisa rodar na
   atualização do PR do app. O arquivo cobre as 431 questões de estudo. No
   lançamento, publicar primeiro o manifesto do hub (ou coordenar as duas
   publicações) para que o app não mostre links antes de as rotas existirem.
   IDs reservadas não significam conteúdo publicado.
5. **Fatia 5 — link visível.** O link está preparado localmente para 431 IDs
   com snapshots aprovados; não faz fetch ao hub em runtime. O manifesto e as
   páginas PT/EN foram compilados localmente sem rejeições. Após integração e
   deploy, confirmar HTTP 200 para cada destino, fallback de domínio e fluxo real
   offline. PT/EN e layout mobile foram conferidos localmente no app.

A preparação local está concluída para 431 registros, mas CI e integração Git
ainda faltam. O progresso dos alunos e o banco de simulado não entram no
contrato público.
