# Pools exclusivos de estudo e simulado

| Certificação | Estudo | Simulado | Total |
| --- | ---: | ---: | ---: |
| CTFL | 220 | 80 | 300 |
| CTAL-TA | 110 | 90 | 200 |
| CTAL-TM | 101 | 99 | 200 |

Estudar, Flashcards, cobertura, prontidão e revisão espaçada usam apenas o pool de estudo. Os simulados oficial e personalizado usam apenas o pool de simulado. Os IDs e objetos dos dois pools não se cruzam.

`bank-source/` contém as fontes incluídas nesta versão do app. `bun run bank:build` regenera os seis JSONs em `src/synapse/data/banks/` e valida os totais, a distribuição por capítulo, os gabaritos, os idiomas e a separação dos pools. O relatório gerado fica em `scripts/bank-report.json`.
