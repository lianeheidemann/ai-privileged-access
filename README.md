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

**Proposta de IA privada para empresas:** arquitetura para consultar e analisar bancos de dados corporativos dentro da infraestrutura controlada da organização, sem depender de APIs externas de inferência. O protótipo inicial utiliza dados sintéticos e execução local para validar segurança, integridade e detecção de anomalias.

## Status atual — levantamento de requisitos e planejamento técnico

> [!WARNING]
> **EM CONSTRUÇÃO — IMPLEMENTAÇÃO AINDA NÃO INICIADA.**
>
> O DataGuard AI está atualmente na fase de **levantamento de requisitos, definição dos pré-requisitos técnicos, escolha das tecnologias e documentação da arquitetura**. As funcionalidades descritas neste README ainda serão implementadas e testadas. Não há, neste momento, uma aplicação funcional disponível para execução.
>
> **Já disponível:** documentação do planejamento e dataset sintético em CSV, incluindo o *ground truth* para avaliação.
>
> **Ainda a desenvolver:** banco SQLite operacional, serviços Python, verificações de integridade, detecção de anomalias, integração com Ollama, API FastAPI, interface React/TypeScript, testes e experimentos. A **implantação empresarial** será posterior ao protótipo, mas seus **requisitos de segurança orientam todas as etapas**.

## Objetivo

**Objetivo principal:** propor e avaliar uma solução de IA privada para empresas, permitindo acesso controlado a bancos internos e processamento local de informações, com restrição de tráfego externo, permissões mínimas e evidências de segurança. Auditoria e detecção de anomalias são **casos de uso para validar essa arquitetura**, não sua finalidade exclusiva.

O DataGuard AI pretende reunir três capacidades demonstrativas:

| Capacidade | Objetivo |
| --- | --- |
| **Integridade de dados** | Verificar relações, transações, regras de negócio, evidências e backups de forma reproduzível |
| **Detecção de anomalias** | Identificar registros e comportamentos incomuns, distinguindo suspeitas de falhas comprovadas |
| **Assistente de IA local** | Explicar resultados e responder perguntas por meio de consultas predefinidas de somente leitura |

Uma API validará as operações e uma interface local apresentará os resultados. As **tecnologias específicas** estão consolidadas na seção [Linguagens e tecnologias definidas](#linguagens-e-tecnologias-definidas).

**A IA explica achados, mas não certifica a integridade dos dados.** Confirmações técnicas dependem de regras e verificações reproduzíveis; alertas estatísticos são **suspeitas**, não prova de corrupção ou fraude.

## Questão de pesquisa e abordagem experimental

**Problema investigado:** como permitir que empresas utilizem IA sobre seus próprios bancos de dados, em infraestrutura controlada, **sem depender de inferência em nuvem nem expor informações confidenciais por conexões externas não autorizadas**, mantendo consultas rastreáveis e permissões restritas?

O projeto pretende estudar a viabilidade técnica dessa combinação em um ambiente controlado, considerando quatro aspectos: **confiabilidade dos resultados**, **capacidade de detectar inconsistências**, **desempenho em hardware local** e **redução da exposição dos dados à rede**.

A avaliação será conduzida com dados **inteiramente sintéticos** e um gabarito separado de anomalias conhecidas. As regras e os modelos serão comparados com esse gabarito; as respostas da IA serão verificadas quanto à correspondência com consultas autorizadas e evidências do banco. Também serão medidos tempos de execução e uso de recursos, além de realizados testes de operação offline e de exposição de serviços.

**Hipótese de trabalho, ainda não validada:** uma arquitetura empresarial de IA privada, com isolamento de rede, controle de saída, acesso mínimo ao banco e inferência interna, pode reduzir caminhos de exposição de dados e permitir análises úteis. A segurança precisa ser demonstrada por testes, não presumida por ser uma IA local.

A metodologia detalhada e os critérios de avaliação estão previstos em [04 — Anomalias e ML](docs/04-anomalias-e-ml.md) e [07 — Testes e experimentos](docs/07-testes-e-experimentos.md). **Nenhum ganho de segurança, precisão ou desempenho é afirmado antes dos testes.**

## Arquitetura oficial do MVP

**Protótipo de validação:** um único notebook Windows 11. O React abre no navegador, mas frontend, backend, banco e IA executam **localmente**, sem necessidade de hospedagem externa.

![Arquitetura local planejada do DataGuard AI](assets/diagrams/arquitetura-local.svg)

| Serviço | Desenvolvimento local | Papel |
| --- | --- | --- |
| Frontend | `http://127.0.0.1:5173` | Vite durante o desenvolvimento |
| Backend | `http://127.0.0.1:8000` | FastAPI e futuras rotas `/api/` |
| Ollama | `http://127.0.0.1:11434` | Inferência feita pelo backend |
| SQLite | Arquivo em `runtime/` | Persistência local, **sem porta TCP** |

**Distribuição local planejada:** após gerar o build do React, o próprio FastAPI poderá servir a interface em **http://127.0.0.1:8000**. O servidor de desenvolvimento Vite não será necessário para executar o aplicativo normalmente.

**Segurança desde a primeira etapa:** definir limites de confiança, fluxos permitidos, política de saída sem internet, minimização dos dados e testes de não exfiltração; usar bind em `127.0.0.1`, aplicar acesso somente leitura às consultas do assistente, parametrizar SQL e testar firewall, isolamento e execução offline. Loopback reduz exposição à rede, mas **não substitui controles de autorização ou segurança do computador**.

Consultar [06 — Interface React/FastAPI](docs/06-interface-e-relatorios.md) e [08 — Rede privada e segurança](docs/08-arquitetura-de-rede-e-seguranca.md).

## Arquitetura empresarial proposta

A implantação futura pretende permitir que **usuários autorizados** consultem dados corporativos por meio de uma **API interna**, com inferência no ambiente da empresa e acesso ao banco por **conectores somente leitura**. Autenticação, autorização, segmentação, TLS entre serviços e bloqueio de conexões externas não autorizadas fazem parte dos requisitos de segurança.

![Arquitetura empresarial planejada do DataGuard AI](assets/diagrams/arquitetura-empresarial.svg)

**Diagrama conceitual, não implementado.** Os serviços internos (FastAPI e Ollama) não dependem de APIs públicas de IA. A ausência de vazamentos não é garantida pelo desenho: exigirá testes de rede, permissões, registros e tratamento de dados. A implantação está detalhada na [etapa 08 — Rede privada e segurança](docs/08-arquitetura-de-rede-e-seguranca.md).

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

## Resultados e avaliação — planejados

**Ainda não existem resultados experimentais, métricas medidas nem benchmarks publicados.** Após a implementação, os experimentos deverão registrar:

| Dimensão | Medições previstas |
| --- | --- |
| Detecção de anomalias | Precisão (*precision*), revocação (*recall*), F1 e falsos positivos, comparados ao gabarito sintético |
| Integridade e auditoria | Verificações aprovadas/reprovadas, evidências identificadas e testes de restauração |
| Desempenho | Tempo de importação, auditoria, consultas e detecção; consumo de CPU e memória |
| IA local | Latência das respostas, aderência às consultas autorizadas e comportamento sem internet |
| Segurança | Exposição de portas, tentativas de acesso indevido e isolamento de dados no cenário local |

Os métodos, critérios de aceite e testes estão descritos na [etapa 07 — Testes e experimentos](docs/07-testes-e-experimentos.md). Nenhum resultado deve ser apresentado como validado antes de sua execução.

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
| **08 (implantação posterior)** | Validar arquitetura corporativa em intranet privada, PostgreSQL, permissões e prevenção de vazamentos | [Arquitetura de rede e segurança](docs/08-arquitetura-de-rede-e-seguranca.md) |

A implementação será incremental: **requisitos empresariais de segurança desde a etapa 00; protótipo SQLite e serviços Python; interface/API; validação offline; por último, laboratório empresarial em rede privada**. Consulte o [guia de desenvolvimento](docs/README.md).

### Estrutura planejada de código

A organização separa **dados sintéticos de demonstração**, **serviços internos** e **futuras integrações corporativas**. Os diretórios marcados como planejados ainda não representam funcionalidades implementadas.

~~~text
dataguard-ai/
├── README.md
├── docs/                          # Requisitos, arquitetura e testes
├── assets/diagrams/               # SVGs do protótipo e arquitetura
├── data/                          # Somente CSVs e gabarito sintéticos
├── src/dataguard/                 # Backend Python (planejado)
│   ├── db/                        # SQLite de demonstração
│   ├── connectors/                # Futuras fontes corporativas somente leitura
│   ├── security/                  # Autenticação, autorização e políticas
│   ├── integrity/                 # Verificações determinísticas
│   ├── audit/                     # Eventos, evidências e backups
│   ├── detection/                 # Regras e Machine Learning
│   ├── assistant/                 # Ollama e catálogo de consultas permitidas
│   ├── reports/                   # Resultados e exportação controlada
│   └── api/                       # FastAPI interna
├── frontend/                      # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── config/                        # Exemplos sem segredos e políticas versionadas
├── deployment/                    # Laboratório corporativo futuro
│   ├── network/                   # Segmentação e fluxos autorizados
│   └── security/                  # Firewall, TLS e restrições de saída
├── tests/                         # Integridade, autorização e testes offline
└── runtime/                       # Bancos, logs e evidências locais; fora do Git
~~~

**Separação essencial:** o banco da empresa continua sob controle da organização. Os conectores deverão usar identidades com privilégios mínimos, consultas previamente aprovadas e nenhuma credencial armazenada no repositório. `deployment/` documentará um laboratório futuro, não uma infraestrutura já existente.

## Segurança e limitações

**Requisito central:** nenhum dado corporativo deve ser enviado a APIs externas ou serviços de inferência em nuvem. A operação prevista deve aplicar bloqueio de saída por padrão, exceções documentadas, autenticação, autorização por perfil, consultas somente leitura, minimização de dados, logs sem conteúdo confidencial e testes de tráfego. **API interna não é API externa:** FastAPI e Ollama podem comunicar-se somente dentro da infraestrutura autorizada.

O MVP será executado **localmente**, com dados sintéticos, consultas autorizadas e serviços vinculados a `127.0.0.1`. O funcionamento offline e o isolamento de rede **ainda precisarão ser testados**.

A IA não poderá executar SQL arbitrário nem alterar o banco. **Anomalias não são prova de fraude**; hashes e HMAC só identificam alterações quando comparados com referências confiáveis. Segredos, bancos operacionais, backups e logs privados não devem ser versionados.

Para os controles e testes completos, consulte [03 — Auditoria e backups](docs/03-auditoria-e-backups.md), [05 — Assistente local](docs/05-assistente-local.md), [07 — Testes](docs/07-testes-e-experimentos.md) e [08 — Rede privada](docs/08-arquitetura-de-rede-e-seguranca.md).

**Estado dos entregáveis:** proposta empresarial e pré-requisitos técnicos documentados, tecnologias selecionadas e dataset sintético disponível. **Desenvolvimento da aplicação, validação e benchmarks ainda pendentes.**
