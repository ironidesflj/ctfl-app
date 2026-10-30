# Axon no Synapse — plano auditado em 2026-10-30

Fatia 1 integrada na `main` do app (PR #12). O primeiro lote de 50 IDs CTFL foi
integrado na `main` do banco (PR #1). As três rodadas seguintes agora preparam
as 381 questões restantes dos pools de estudo CTFL, CTAL-TA e CTAL-TM: 431 IDs
no total, com validação Axon confirmada localmente. A prévia local produz 381
snapshots válidos em diretório temporário; 50 itens ficam `held` para revisão
editorial final. A expansão do banco e do CI ainda precisa passar por PRs. O
hub e o app não servem esse manifesto.

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
itens de estudo das provas ativas. A triagem automática encontrou 381
referências candidatas e 50 dúvidas `held`, reunidas em fila para a revisão
editorial final. As 400 questões CTFL-AT/CT-AI continuam fora do escopo ativo;
as 269 questões de simulado ficam permanentemente excluídas.

### Andamento da integração Axon (escopo ativo)

| Fatia | Escopo                                            | Estado                                                         |
| ----- | ------------------------------------------------- | -------------------------------------------------------------- |
| 1     | Dependência Axon pinada, sem uso em produção      | Integrada (PR #12)                                             |
| 2     | Reservar IDs estáveis para pools de estudo ativos | 50 integradas (PR #1); expansão de 381 no PR #7 do banco       |
| 3     | Gerar/validar snapshots PT-BR e checksum          | 381 previews válidos localmente; 50 `held`                     |
| 4     | Rodar preview em CI e guardar artefato temporário | Atualização para 381 pendente no CI/PR do app                  |
| 5     | Publicar no hub e exibir links no app             | Não iniciada; aguarda gate editorial e publicação do manifesto |

As 50 retenções e demais dúvidas editoriais ficam numa fila final; elas não
bloqueiam a preparação mecânica dos outros itens. Nenhum conteúdo está servido
pelo app ou pelo hub.

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
- As questões atuais não têm uma referência oficial específica por item.
  Antes de publicar snapshots, revisar a referência a exibir no hub.

## Sequência de implementação

1. **Fatia 1 — link inerte.** Instalar a versão exata com lockfile e registrar
   aqui. Nenhum import de produção, alteração do banco ou ID publicada.
   Aceite: `npm ci`, lint, testes, build, E2E e bundle sem Axon.
2. **Fatia 2 — identidade preparada, sem publicação de conteúdo.** Na fonte
   canônica, reservar IDs para CTFL, CTAL-TA e CTAL-TM de estudo. Preservar as
   IDs internas e registrar `lastIssued` por prova. A guarda deve recusar
   colisões, remapeamentos e qualquer questão do pool `exam`.
3. **Fatia 3 — snapshot e integridade.** Gerar prévia PT-BR das 381 candidatas
   com `version: 1`, resposta em letra e checksum calculado/verificado pelo
   Axon. Os 50 itens `held` ficam fora do manifesto.
4. **Fatia 4 — manifesto em CI.** A prévia gera JSONL somente em diretório
   temporário, exige zero rejeições e checksum válido e guarda o artefato por
   sete dias. A validação local de 381 snapshots passou; o CI precisa rodar na
   atualização do PR do app. As dúvidas editoriais ficam para o gate final.
   Somente após aprovação editorial e publicação no hub o arquivo poderá ser
   servido pelo app. IDs reservadas não significam conteúdo publicado.
5. **Fatia 5 — link visível.** Após o hub responder 200 para todas as IDs do
   lote, exibir a ID e o link canônico nas questões correspondentes. Sem fetch
   ao hub em runtime. Validar PT/EN, mobile, offline e fallback de domínio.

Cada fatia seguinte tem PR e gate próprios. As flags de build permanecem
desligadas até o aceite de cada fatia. O progresso dos alunos e o banco de
simulado não entram no contrato público.
