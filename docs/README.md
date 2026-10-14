# Guia de desenvolvimento — DataGuard AI

Este é o **ponto de partida** para construir o DataGuard AI como **proposta de IA privada para empresas**, em partes, sem tentar implementar toda a aplicação de uma vez. O inventário sintético é um caso de teste; o objetivo final é permitir análises autorizadas em bancos internos, com inferência na infraestrutura da organização e controles de prevenção de vazamento.

**Situação atual:** os **seis CSVs sintéticos** e o **gabarito separado** estão disponíveis em `data/`. O banco SQLite, a aplicação Python, a API FastAPI, a interface React e a IA integrada **ainda serão implementados**.

**Regra transversal:** requisitos de rede, egress, identidade, segregação, autorização e confidencialidade devem ser definidos na etapa 00 e verificados em cada etapa. A etapa 08 executa a **implantação empresarial**, não inaugura o planejamento de segurança.

## Sequência recomendada

```mermaid
flowchart LR
    A["0 · Planejar"] --> B["1 · Banco"]
    B --> C["2 · Integridade"]
    C --> D["3 · Auditoria"]
    D --> E["4 · Anomalias"]
    E --> F["5 · IA local"]
    F --> G["6 · FastAPI + React"]
    G --> H["7 · Testes finais"]
    H -. "Implantação empresarial posterior" .-> I["8 · Laboratório de rede privada"]
```

| Ordem | Documento | Entrega verificável |
| --- | --- | --- |
| 0 | [Arquitetura e escopo](00-arquitetura-e-escopo.md) | Limites e responsabilidades decididos |
| 1 | [Ambiente e banco](01-ambiente-e-banco.md) | SQLite gerado dos CSVs e relações conferidas |
| 2 | [Integridade e transações](02-integridade-e-transacoes.md) | Verificador com testes de falha e rollback |
| 3 | [Auditoria e backups](03-auditoria-e-backups.md) | Evidências verificáveis e restauração testada |
| 4 | [Anomalias e Machine Learning](04-anomalias-e-ml.md) | Alertas com evidências, baseline e comparação |
| 5 | [Assistente local](05-assistente-local.md) | Serviço Python de consulta segura + Ollama, sem interface ainda |
| 6 | [Interface e relatórios](06-interface-e-relatorios.md) | API FastAPI e frontend React + TypeScript + Vite, local e offline |
| 7 | [Testes e experimentos](07-testes-e-experimentos.md) | Resultados reproduzíveis e teste offline |
| 8 **(futura)** | [Arquitetura de rede e segurança](08-arquitetura-de-rede-e-seguranca.md) | Rede privada, PostgreSQL, acesso restrito e testes de vazamento |

> **Etapa 08 é uma expansão posterior.** Não substitui nem altera a sequência do MVP (00–07). O guia inclui arquitetura cliente-servidor, laboratório isolado, RBAC/RLS, TLS, firewall, Ollama e testes de proteção contra vazamento. A seção **2.1** da etapa 08 documenta o *loopback* local e já poderá ser aplicada durante o desenvolvimento da interface.

## Stack definida e separação das etapas

| Camada | Tecnologia | Implementação |
| --- | --- | --- |
| Banco e regras | Python + SQLite | Etapas 01–04 |
| IA local e consultas | Python + Ollama | Etapa 05 |
| Backend web | Python + FastAPI + Pydantic | Etapa 06 |
| Frontend web local | React + TypeScript + Vite | Etapa 06 |
| Estilo e componentes | Tailwind CSS + shadcn/ui + Lucide React | Etapa 06 |
| Tabelas e gráficos | TanStack Table/Query + Recharts | Etapa 06 |
| Servidor de banco em rede privada | PostgreSQL, TLS e controles de acesso | Etapa 08 (futura) |

**Interface web local não é hospedagem na internet.** Durante o desenvolvimento, Vite e FastAPI usam `127.0.0.1`; depois do build, o FastAPI poderá servir os arquivos React estáticos. Somente o backend acessa SQLite e Ollama.

A etapa 01 requer apenas Python e SQLite; **não instale React, Node.js nem FastAPI antes de chegar à etapa 06**, salvo necessidade de testes específicos.

## Como estudar e implementar cada etapa

1. Leia **somente o documento da etapa atual**.
2. Crie os arquivos que ele especifica, sem antecipar módulos de fases posteriores.
3. Escreva testes para o comportamento principal (inclusive casos de falha).
4. Execute os testes e compare com os **critérios de aceite** do documento.
5. Registre limitações e pequenas decisões no commit ou nas anotações da etapa.
6. Só avance quando a etapa funcionar isoladamente.

### Padrão de trabalho sugerido

- Um branch por etapa, como `feat/01-sqlite-dataset` e `feat/02-integrity`.
- Commits pequenos, com nomes objetivos (`feat:`, `test:`, `docs:`, `fix:`).
- A aplicação nunca deve carregar o `gabarito_anomalias.csv` na execução normal.
- Nunca enviar bancos reais, chaves, `.env`, checkpoints grandes, backups ou logs com dados privados para o GitHub.
- Se uma etapa exigir mudar o esquema, documente uma migration em vez de substituir o banco silenciosamente.

## Estrutura prevista ao longo do desenvolvimento

```text
dataguard-ai-/
├── README.md
├── docs/                         # Guias de implementação (esta pasta)
├── data/
│   ├── csv/                      # Dados sintéticos, já versionados
│   ├── ground_truth/             # Gabarito para avaliação, já versionado
│   └── dataset_info.json
├── src/dataguard/                # A criar na etapa 1
│   ├── db/
│   ├── integrity/
│   ├── audit/
│   ├── detection/
│   ├── assistant/
│   ├── reports/
│   └── api/                       # FastAPI, a criar na etapa 06
├── frontend/                     # React + TypeScript + Vite, etapa 06
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── tests/                        # A criar na etapa 1
├── scripts/                      # A criar conforme necessário
├── runtime/                      # A criar localmente; ignorar no Git
│   ├── databases/
│   ├── backups/
│   └── reports/
├── pyproject.toml                # A criar na etapa 1
└── .gitignore                    # A criar na etapa 1
```

**Nota:** a estrutura acima é **planejada**; não indica que os arquivos de código já existem.

## Primeira tarefa

Abra [**01 — Ambiente e banco**](01-ambiente-e-banco.md). O objetivo inicial é conseguir importar os seis CSVs, criar o SQLite e consultar contagens/relações corretamente, **sem IA e sem interface gráfica**.

Depois disso, a etapa 2 ensinará a diferenciar erro de estrutura, violação de regras de negócio e anomalia estatística.

## Regra geral de qualidade

Para cada funcionalidade, registre:

| Pergunta | Exemplo |
| --- | --- |
| Qual é a entrada? | Arquivo CSV, evento ou pergunta |
| Qual é a saída? | Consulta, resultado, alerta ou relatório |
| O que pode falhar? | FK inválida, backup adulterado, consulta proibida |
| Como provar que funciona? | Teste reproduzível com resultado esperado |
| Qual é o limite? | Um score estatístico **não prova fraude** |

Voltar ao [README principal](../README.md).
