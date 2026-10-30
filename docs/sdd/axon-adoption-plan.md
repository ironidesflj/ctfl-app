# Axon no Synapse — plano auditado em 2026-10-30

## Estado e limites

- `@ironidesflj/axon@0.2.2` é a versão publicada e registrada pelo Noos.
  A assinatura real de `verifyChecksum` é `verifyChecksum(record)`; os exemplos
  de duas chamadas no guia publicado estão incorretos.
- O banco canônico vive em `ctfl-question-bank-ptbr`. O app consome fatias
  derivadas. Alterar apenas os JSONs do app seria perdido no próximo sync.
- As IDs internas (`ch1-01`, `ctalta-03` etc.) já indexam progresso, cartões,
  questões salvas e rascunhos nos dispositivos dos alunos. Elas não serão
  substituídas por IDs públicas. A ligação será um campo ou mapa estável
  `internalId -> SYN-*`, mantido na fonte canônica e validado no app.
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
2. **Fatia 2 — identidade preparada, sem publicação.** Na fonte canônica,
   criar um registro de IDs públicas para um lote editorial de até 50 questões
   **CTFL de estudo**. Preservar `id` interno e registrar `lastIssued` por prova.
   O gerador deve recusar colisões, mudanças de mapeamento e qualquer item do
   pool `exam`. Flag de build desativada por padrão; revisar o diff do lote
   antes de tornar qualquer ID pública.
3. **Fatia 3 — snapshot e integridade.** Definir o idioma e a referência do
   lote. Gerar `version: 1` e checksum sobre o snapshot com o Axon; em edições,
   incrementar a versão e recalcular o checksum sem alterar a ID. Testar
   mutação, checksum inválido e estabilidade do mapeamento.
4. **Fatia 4 — manifesto em CI.** Gerar um `manifest.jsonl` só das questões
   aprovadas, com `aliases: []`, parsear e verificar cada registro no CI.
   Publicar primeiro como artefato de CI para revisão. Só depois de confirmar
   conteúdo, licenças, idioma, referências e IDs, servir o arquivo e entregá-lo
   ao repositório do hub. A publicação de ID é irreversível.
5. **Fatia 5 — link visível.** Após o hub responder 200 para todas as IDs do
   lote, exibir a ID e o link canônico nas questões correspondentes. Sem fetch
   ao hub em runtime. Validar PT/EN, mobile, offline e fallback de domínio.

Cada fatia seguinte tem PR e gate próprios. As flags de build permanecem
desligadas até o aceite de cada fatia. O progresso dos alunos e o banco de
simulado não entram no contrato público.
