# Spec — Feedback global sem coleta pelo app

**Status:** IMPLEMENTADA E VALIDADA LOCALMENTE em 2026-10-14; aprovação final,
commit e push aguardam o Iron.

## Problema e ground truth

O Synapse não oferecia um canal global de feedback. O produto é um PWA
estático, local-first, sem cadastro, backend, contas ou tenants. Criar banco ou
API apenas para esta primeira versão aumentaria riscos de privacidade, abuso,
retenção e suporte.

O repositório `ironidesflj/ctfl-app` é público e o GitHub Issues foi confirmado
como habilitado por consulta direta em 2026-10-14.

## Decisão

- Expor “Enviar feedback” / “Send feedback” no footer global e na apresentação
  institucional.
- Abrir em nova aba um Issue Form dedicado, com `noopener noreferrer`.
- Pedir somente tipo, área opcional e mensagem.
- Avisar antes do clique e no formulário que GitHub exige conta e publica perfil
  e mensagem; proibir dados pessoais, backups, respostas, tokens e segredos.
- Não preencher automaticamente rota, progresso, respostas, métricas, storage
  ou identificadores do dispositivo.

## Guardrails de dados e segurança

- **Sem Neon, schema ou migration.** Nenhum dado de produto novo é persistido.
- **Sem backend ou multi-tenant.** Nenhuma identidade ou isolamento de tenant é
  criado por esta fase.
- **Sem transmissão implícita.** Nenhum `fetch`, beacon, webhook, analytics,
  segredo ou variável de ambiente; só o clique abre o domínio externo.
- **Sem renderização externa.** Issues não retornam ao app, reduzindo XSS e
  responsabilidade de moderação no produto.
- Possíveis falhas de segurança não devem ser publicadas no formulário.

## Régua de fidelidade

- [x] O canal é encontrável no shell global e na página institucional.
- [x] O destino é o template `feedback.yml` do repositório correto.
- [x] Os avisos de publicidade e privacidade aparecem antes do link e no form.
- [x] Nenhum dado local é anexado ou transmitido automaticamente.
- [x] Nenhum backend, banco, login, dependência de runtime ou segredo foi criado.

## Evidência de fechamento

- Testes confirmam URL, `rel`, presença global e conteúdo institucional.
- O Issue Form versionado valida tipo, mensagem e aceite do aviso público.
- Gates completos e busca adversarial por transmissão/persistência ficam
  registrados em `current-state.md`.

## Riscos residuais aceitos

O GitHub exige conta, o feedback não é privado nem anônimo, depende de conexão
e pode receber spam. Feedback privado/anônimo exige nova spec com consentimento,
retenção, exclusão, abuso, custo e responsabilidade operacional.
