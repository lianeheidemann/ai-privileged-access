# Documentação de software

Guias de implementação do DataGuard AI. A numeração (00–10) é única no projeto e segue a ordem de leitura; o índice completo, com a pasta de [hardware](../hardware/README.md), está no [guia de desenvolvimento](../README.md).

## Referência

| Doc | Conteúdo |
| --- | --- |
| [00 — Stack e decisões de software](00-stack-e-decisoes-de-software.md) | Por que cada tecnologia foi escolhida, alternativas, riscos, versões e candidatos a modelo local |

## Trilha principal (segurança da IA local)

Ordem: 02 → 03 → 04 → 05 → 06.

| Etapa | Doc | Entrega |
| --- | --- | --- |
| 02 | [Arquitetura e escopo](02-arquitetura-e-escopo.md) | Limites, ameaças e decisões registrados |
| 03 | [Ambiente e banco](03-ambiente-e-banco.md) | SQLite gerado dos CSVs validados |
| 04 | [Assistente local](04-assistente-local.md) | Corte vertical com papéis, catálogo somente leitura e Ollama |
| 05 | [Interface e relatórios](05-interface-e-relatorios.md) | API FastAPI e protótipo React conectado |
| 06 | [Testes e experimentos](06-testes-e-experimentos.md) | Metas numéricas medidas e teste offline |

Os guias visuais por tela estão em [`interface/`](interface/README.md).

## Implantação posterior

| Etapa | Doc | Entrega |
| --- | --- | --- |
| 07 | [Rede e segurança](07-arquitetura-de-rede-e-seguranca.md) | Rede privada, PostgreSQL/RLS, identidade e testes de vazamento |

## Trilha complementar (qualidade dos dados)

Não bloqueia a trilha principal; pode ser feita em paralelo ou depois da [etapa 04](04-assistente-local.md).

| Etapa | Doc | Entrega |
| --- | --- | --- |
| 08 | [Integridade e transações](08-integridade-e-transacoes.md) | Verificador com testes de falha e rollback |
| 09 | [Auditoria e backups](09-auditoria-e-backups.md) | Evidências verificáveis e restauração testada |
| 10 | [Anomalias e ML](10-anomalias-e-ml.md) | Alertas com evidências; ML exploratório |
