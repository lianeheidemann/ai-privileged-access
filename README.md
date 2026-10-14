# DataGuard AI

<p>
  <img src="assets/badges/badge_em-construcao.svg" alt="Em construção" height="28">
</p>

<p><sub><strong>BACKEND · BANCO · IA</strong></sub></p>
<p>
  <img height="21" alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=FFFFFF">
  <img height="21" alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=FFFFFF">
  <img height="21" alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=FFFFFF">
  <img height="21" alt="Ollama" src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=FFFFFF">
  <img height="21" alt="scikit-learn" src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=FFFFFF">
</p>

<p><sub><strong>FRONTEND · INTERFACE</strong></sub></p>
<p>
  <img height="21" alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img height="21" alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=FFFFFF">
  <img height="21" alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E">
  <img height="21" alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=FFFFFF">
  <img height="21" alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=FFFFFF">
  <img height="21" alt="TanStack" src="https://img.shields.io/badge/TanStack-FF4154?style=for-the-badge&logo=reactquery&logoColor=FFFFFF">
  <img height="21" alt="Recharts" src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge">
</p>

**Local Database Integrity Auditing · Anomaly Detection · Private AI Assistant**

Projeto experimental para auditoria da integridade de dados, detecção de anomalias e consultas em português por IA **local**, com interface web no próprio computador, **sem APIs externas de inferência**.

## Status atual — levantamento de requisitos e planejamento técnico

> [!WARNING]
> **EM CONSTRUÇÃO — IMPLEMENTAÇÃO AINDA NÃO INICIADA.**
>
> O DataGuard AI está atualmente na fase de **levantamento de requisitos, definição dos pré-requisitos técnicos, escolha das tecnologias e documentação da arquitetura**. As funcionalidades descritas neste README ainda serão implementadas e testadas. Não há, neste momento, uma aplicação funcional disponível para execução.
>
> **Já disponível:** documentação do planejamento e dataset sintético em CSV, incluindo o *ground truth* para avaliação.
>
> **Ainda a desenvolver:** banco SQLite operacional, serviços Python, verificações de integridade, detecção de anomalias, integração com Ollama, API FastAPI, interface React/TypeScript, testes e experimentos. A arquitetura empresarial de rede privada está prevista para uma fase posterior.

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

![Arquitetura local planejada do DataGuard AI](assets/diagrams/arquitetura-local.svg)

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

![Modelo de dados sintético do DataGuard AI](assets/diagrams/modelo-dados.svg)

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

**Estado dos entregáveis:** requisitos e pré-requisitos técnicos documentados, tecnologias selecionadas e dataset sintético disponível. **Desenvolvimento da aplicação, validação e benchmarks ainda pendentes.**
