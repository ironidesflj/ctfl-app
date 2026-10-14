# Plano atual

## Fechado nesta fase

1. Reconciliação e versionamento do SDD.
2. Gates técnicos do app + smoke E2E.
3. Governança das baselines/threshold do banco e documentação de sync.
4. Aplicação e reconciliação da v3.11.0 contra as auditorias E2E e independente,
   preservando os gates canônicos do SDD.
5. Code-split lazy dos bancos live, PWA autoral/offline e pacote de correções e
   features r2–r12 descrito no changelog da v3.11.0.
6. Comunicação de releases significativas uma vez por versão, preservando o
   toast técnico do PWA; home institucional reconciliada com o estado live.

## Pendentes solicitados pelo Iron

1. Especificar e implementar um caminho sempre visível para voltar à página
   inicial institucional do app. Essa página deve explicar o produto e como ele
   funciona, além de conter uma seção “Sobre mim” com redes e dados de contato.
2. Especificar e implementar uma seção de feedback dos usuários, fácil de
   encontrar em todas as áreas principais do app. A spec deve decidir canal,
   consentimento, privacidade, armazenamento e tratamento das mensagens antes
   da implementação.

## Adiado por decisão do Iron

- Integração Flashcards → Stats.
- Escolha e preparação da próxima certificação live.
- Eventual separação entre pool de estudo e pool reservado de simulado.

## Dívidas conhecidas, não bloqueantes

- Chunk lazy do CTAL-TA com aproximadamente 669 KB e warning acima de 500 KB.
- Conteúdo de Flashcards/Syllabus/Glossário disponível apenas para CTFL.
- CT-AI, CTAL-TM e CTFL-AT com dívida psicométrica latente.
- `ctalta-106` e `ctalta-120` continuam inconclusivos e visíveis até decisão de
  conteúdo específica.
- `vite-plugin-pwa` permanece inerte em `devDependencies`; remoção exige
  reconciliar os lockfiles npm/Bun no mesmo lote.
