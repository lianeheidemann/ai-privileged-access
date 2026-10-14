# DataGuard AI

**Local Database Integrity Auditing · Anomaly Detection · Private AI Assistant**

Projeto experimental para auditoria da integridade de dados, detecção de anomalias e consultas em português por IA **local**, com interface web no próprio computador, **sem APIs externas de inferência**.

> **Estado do projeto:** o dataset sintético e os guias de implementação estão disponíveis. A aplicação, os endpoints, a interface e os modelos integrados **ainda são planejados**. Os diagramas abaixo ilustram o desenho pretendido e não comprovam funcionalidades existentes.

## Objetivo

O DataGuard AI pretende combinar três mecanismos complementares:

| Capacidade | O que será feito | Tecnologias |
| --- | --- | --- |
| **Integridade** | Verificar esquema, relações, transações, regras de negócio, backups e evidências | Python, SQLite, SHA-256, HMAC |
| **Detecção de anomalias** | Identificar comportamentos incomuns com regras e Machine Learning | Python, SQL, pandas, scikit-learn / Isolation Forest |
| **Assistente de IA local** | Responder perguntas com consultas predefinidas de somente leitura e explicar achados | Ollama + LLM compacto quantizado, Python |
| **Aplicação e API** | Validar parâmetros, executar serviços e controlar exposição de dados | Python + FastAPI + Pydantic |
| **Interface web local** | Dashboard, inventário, alertas, chat e relatórios | React + TypeScript + Vite |

**A IA explica achados, mas não certifica a integridade dos dados.** Confirmações técnicas dependem de regras e verificações reproduzíveis; alertas estatísticos são **suspeitas**, não prova de corrupção ou fraude.

## Arquitetura oficial do MVP

**Execução inicial:** um único notebook Windows 11. O React abre no navegador, mas frontend, backend, banco e IA executam **localmente**, sem necessidade de hospedagem externa.

~~~mermaid
flowchart TD
    USER["Navegador no próprio notebook"] --> REACT["React + TypeScript · Vite (dev)"]
    REACT -->|"/api (HTTP local)"| API["Python · FastAPI"]
    API --> CORE["Serviços: integridade, auditoria, detecção"]
    API --> Q["Catálogo de consultas autorizado"]
    CORE --> DB[("SQLite · arquivo local")]
    Q --> DB
    Q --> AI["Ollama · LLM local"]
    CORE --> E["Relatórios, backups e manifestos"]
    AI --> API
    E --> API
~~~

| Serviço | Desenvolvimento local | Papel |
| --- | --- | --- |
| Frontend | `http://127.0.0.1:5173` | Vite durante o desenvolvimento |
| Backend | `http://127.0.0.1:8000` | FastAPI e futuras rotas `/api/` |
| Ollama | `http://127.0.0.1:11434` | Inferência feita pelo backend |
| SQLite | Arquivo em `runtime/` | Persistência local, **sem porta TCP** |

**Distribuição local planejada:** após gerar o build do React, o próprio FastAPI poderá servir a interface em **http://127.0.0.1:8000**. O servidor de desenvolvimento Vite não será necessário para executar o aplicativo normalmente.

**Segurança:** usar bind em `127.0.0.1`, aplicar acesso somente leitura às consultas do assistente, parametrizar SQL e testar firewall, isolamento e execução offline. Loopback reduz exposição à rede, mas **não substitui controles de autorização ou segurança do computador**.

Consultar [06 — Interface React/FastAPI](docs/06-interface-e-relatorios.md) e [08 — Rede privada e segurança](docs/08-arquitetura-de-rede-e-seguranca.md).

## Linguagens e tecnologias definidas

| Camada | Stack |
| --- | --- |
| Frontend | **React, TypeScript, Vite** |
| Componentes e estilos | **Tailwind CSS, shadcn/ui, Lucide React** |
| Tabelas e dados remotos | **TanStack Table, TanStack Query** |
| Gráficos | **Recharts** |
| Backend/API | **Python, FastAPI, Pydantic** |
| Banco inicial | **SQLite** (`sqlite3`) |
| IA | **Ollama local** + modelo quantizado compatível |
| Machine Learning | **scikit-learn**, pandas e NumPy |
| Testes | **pytest**, Vitest e Testing Library (quando implementados) |
| Expansão empresarial futura | **PostgreSQL**, TLS, firewall, autenticação/autorização e segmentação de rede |

**Linguagens predominantes:** Python, TypeScript e SQL. HTML/CSS integram o frontend. O **Node.js** serve às ferramentas de desenvolvimento/build do frontend; não é necessário como servidor separado na distribuição local planejada.

### Estilo visual

Interface **dark, minimalista e responsiva**, com fundo em azul-marinho escuro, bordas discretas, textos legíveis e foco em tabelas e evidências. Gráficos serão usados quando acrescentarem informação; sem gradientes chamativos ou efeitos decorativos excessivos.

**Telas planejadas:** Visão geral, Inventário, Integridade, Anomalias, Assistente local, Backups e Experimentos.

## Dados sintéticos já disponíveis

A pasta [`data/`](data/) contém os dados originais em CSV para gerar o SQLite local nas primeiras etapas.

| Arquivo | Registros | Descrição |
| --- | ---: | --- |
| [`categorias.csv`](data/csv/categorias.csv) | 12 | Categorias e valores de referência |
| [`setores.csv`](data/csv/setores.csv) | 18 | Setores fictícios |
| [`responsaveis.csv`](data/csv/responsaveis.csv) | 90 | Identidades sintéticas |
| [`equipamentos.csv`](data/csv/equipamentos.csv) | 750 | Patrimônio, preço, aquisição, garantia e estado |
| [`movimentacoes.csv`](data/csv/movimentacoes.csv) | 2.095 | Eventos de movimentação |
| [`chamados.csv`](data/csv/chamados.csv) | 1.196 | Chamados técnicos e reparos |
| **Total** | **4.161** | **Seis conjuntos de registros** |

Há **50 anomalias intencionais**, em sete categorias, documentadas em [`data/ground_truth/gabarito_anomalias.csv`](data/ground_truth/gabarito_anomalias.csv). O gabarito é **somente para avaliação**, não para entrada do detector nem para respostas do assistente.

~~~mermaid
erDiagram
    CATEGORIAS ||--o{ EQUIPAMENTOS : classifica
    SETORES ||--o{ RESPONSAVEIS : aloca
    SETORES ||--o{ EQUIPAMENTOS : localiza
    RESPONSAVEIS o|--o{ EQUIPAMENTOS : assume
    EQUIPAMENTOS ||--o{ MOVIMENTACOES : possui
    EQUIPAMENTOS ||--o{ CHAMADOS : registra
~~~

A data de referência do dataset é **13/10/2026** (arquivo [`dataset_info.json`](data/dataset_info.json)). Regras temporais devem usar essa data fixa para preservar os resultados.

## Roadmap de desenvolvimento — por etapas

Os arquivos abaixo são **guias**, com tarefas, arquivos previstos, testes e critérios de aceite. Não representam módulos implementados.

| Etapa | Objetivo | Documento |
| --- | --- | --- |
| 00 | Arquitetura, escopo e ameaças | [Arquitetura e decisões](docs/00-arquitetura-e-escopo.md) |
| 01 | Ambiente Python, esquema SQLite e importação | [Banco de dados](docs/01-ambiente-e-banco.md) |
| 02 | Restrições, transações e verificações | [Integridade](docs/02-integridade-e-transacoes.md) |
| 03 | Auditoria, hashes e backups | [Evidências e backups](docs/03-auditoria-e-backups.md) |
| 04 | Regras de anomalia e Isolation Forest | [Anomalias e ML](docs/04-anomalias-e-ml.md) |
| 05 | Serviço de perguntas usando Ollama local | [Assistente local](docs/05-assistente-local.md) |
| 06 | FastAPI + interface React/TypeScript | [Interface e relatórios](docs/06-interface-e-relatorios.md) |
| 07 | Testes, métricas, segurança e execução offline | [Testes e experimentos](docs/07-testes-e-experimentos.md) |
| **08 (posterior)** | Intranet privada, PostgreSQL, permissões e prevenção de vazamentos | [Arquitetura de rede e segurança](docs/08-arquitetura-de-rede-e-seguranca.md) |

**Comece pelo [índice de documentação](docs/README.md).** A implementação será incremental: **primeiro banco e serviços Python; depois frontend/API; por último, laboratório empresarial de rede privada**.

### Estrutura planejada de código

~~~text
dataguard-ai/
├── README.md
├── docs/                           # Guias atuais
├── data/                           # CSVs e gabarito atuais
├── src/dataguard/                  # A implementar
│   ├── db/
│   ├── integrity/
│   ├── audit/
│   ├── detection/
│   ├── assistant/
│   ├── reports/
│   └── api/                        # FastAPI (etapa 06)
├── frontend/                       # React + Vite (etapa 06)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── tests/
└── runtime/                        # Banco e evidências locais; ignorar no Git
~~~

## Requisitos de segurança e limitações

- Os CSVs são **100% fictícios**; nunca usar dados empresariais reais nos experimentos publicados.
- Após baixar pacotes, modelos, bibliotecas e assets, **o uso deve funcionar sem internet**; isso será validado por testes, não presumido.
- O navegador **não acessa SQLite ou Ollama diretamente**: a API implementa as consultas autorizadas.
- A IA não terá ferramenta para executar SQL arbitrário nem para editar o banco.
- SHA-256 e HMAC **detectam alterações relativas a referências confiáveis**, mas não impedem adulteração.
- A expansão 08 utilizará rede privada e PostgreSQL **sem substituir o MVP SQLite nem expor serviços ao público**.
- Arquivos `.env`, segredos, bancos de produção, backups e logs privados **não devem ser versionados**.

**Estado dos entregáveis:** dados e documentação disponíveis; implementação e benchmarks pendentes.
