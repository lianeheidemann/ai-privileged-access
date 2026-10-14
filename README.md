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

**Private AI · Secure Data Access · On-Premises Processing**

**DataGuard AI:** solução planejada para **agilizar o trabalho diário com dados nas empresas**, permitindo consultar informações, organizar resultados, apoiar análises e gerar relatórios por meio de IA executada na infraestrutura controlada da organização. O protótipo inicial utiliza dados sintéticos para desenvolver e testar essas funcionalidades, sem depender de serviços externos de inferência.

## Status atual — levantamento de requisitos e planejamento técnico

> [!WARNING]
> **EM CONSTRUÇÃO — PRIMEIRA INTERFACE VISUAL DISPONÍVEL.**
>
> O DataGuard AI está atualmente na fase de **levantamento de requisitos, definição dos pré-requisitos técnicos, escolha das tecnologias e documentação da arquitetura**. A primeira interface React já possui uma tela de visão geral demonstrativa, mas os serviços de dados e IA ainda não foram implementados. Não há, neste momento, uma aplicação completa disponível para uso empresarial.
>
> **Já disponível:** documentação do planejamento, dataset sintético em CSV (incluindo o *ground truth*) e [primeira interface React de demonstração](frontend/README.md), com navegação e temas claro/escuro.
>
> **Ainda a desenvolver:** banco SQLite operacional, serviços Python, verificações de integridade, detecção de anomalias, integração com Ollama, API FastAPI, demais telas e integração de dados, testes e experimentos. A **implantação empresarial** será posterior ao protótipo, mas seus **requisitos de segurança orientam todas as etapas**.

## Objetivo

**Objetivo principal:** desenvolver uma solução de IA privada que **simplifique e acelere processos cotidianos de tratamento de dados**. Usuários autorizados poderão localizar informações, realizar consultas, obter resumos, organizar resultados e produzir relatórios, mantendo o processamento sob controle da organização. A arquitetura prevê permissões mínimas, consultas rastreáveis e restrição de conexões externas. Verificações de qualidade e detecção de anomalias são **recursos complementares**, não o foco principal.

O DataGuard AI pretende reunir as seguintes capacidades:

| Capacidade | Objetivo |
| --- | --- |
| **Consultas assistidas por IA** | Facilitar a busca e a compreensão de informações em fontes internas autorizadas |
| **Organização e análise de dados** | Aplicar filtros, resumir resultados e apoiar atividades recorrentes |
| **Relatórios** | Apresentar e exportar informações conforme as permissões do usuário |
| **Qualidade dos dados** | Identificar inconsistências e registros atípicos que possam prejudicar processos operacionais |

Uma API validará as operações e uma interface local apresentará os resultados. As **tecnologias específicas** estão consolidadas na seção [Linguagens e tecnologias definidas](#linguagens-e-tecnologias-definidas).

**A IA auxilia na interpretação e no tratamento das informações, mas não substitui validações técnicas.** Verificações de qualidade devem usar regras reproduzíveis, e resultados estatísticos devem ser apresentados como indicadores que precisam de contexto.

## Validação técnica da solução

Antes de conectar o DataGuard AI a bancos de dados reais, a implementação será validada em um ambiente controlado, com **dados sintéticos**. Essa etapa permitirá testar consultas em linguagem natural, organização e apresentação de resultados, geração de relatórios, qualidade dos dados e inferência local.

Os testes deverão avaliar **correção das consultas e dos relatórios**, **tempo necessário para tarefas frequentes**, **desempenho no hardware disponível**, **controle de acesso aos dados** e **comportamento da aplicação sem conexões externas de IA**. O dataset sintético também permitirá testar verificações complementares de qualidade; as respostas do assistente serão comparadas aos resultados de consultas autorizadas.

Na futura implantação em rede corporativa, também será necessário validar permissões, isolamento entre serviços, registros de auditoria e regras de tráfego. **Executar a IA localmente reduz a dependência de serviços externos, mas não garante, por si só, a ausência de vazamentos.**

Os procedimentos e critérios de teste estão documentados em [04 — Anomalias e ML](docs/04-anomalias-e-ml.md), [07 — Testes e experimentos](docs/07-testes-e-experimentos.md) e [08 — Rede privada e segurança](docs/08-arquitetura-de-rede-e-seguranca.md).

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

A implantação futura pretende permitir que **usuários autorizados** consultem dados corporativos por meio de uma **API interna**, com inferência no ambiente da empresa e acesso ao banco por **conectores somente leitura**. A proposta é conectar-se a bancos já existentes, como PostgreSQL, SQL Server ou MySQL, conforme as necessidades e políticas da organização, **sem exigir migração do banco corporativo para SQLite ou PostgreSQL**.

A identidade corporativa (quando disponível), a autenticação, a autorização por perfil, a segmentação de rede, o TLS entre serviços e o bloqueio de conexões externas não autorizadas fazem parte dos requisitos de segurança. **A autorização deve ser aplicada pelo backend e pelas permissões efetivas do banco, não apenas por instruções ao modelo de IA.**

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
| IA | **Ollama** com modelo instalado e executado localmente; recursos de nuvem e fallback externo desabilitados ou bloqueados por política |
| Machine Learning | **scikit-learn**, pandas e NumPy |
| Testes | **pytest**, Vitest e Testing Library (quando implementados) |
| Fontes corporativas futuras | Conectores planejados para **PostgreSQL, SQL Server, MySQL** e outros SGBDs, conforme compatibilidade e autorização da organização |
| Identidade e segurança empresarial | Integração planejada com identidade corporativa, TLS, firewall, autorização por perfil e segmentação de rede |

**Linguagens predominantes:** Python, TypeScript e SQL. HTML/CSS integram o frontend. O **Node.js** serve às ferramentas de desenvolvimento/build do frontend; não é necessário como servidor separado na distribuição local planejada.

### Estilo visual

Interface **dark, minimalista e responsiva**, com fundo em azul-marinho escuro, bordas discretas, textos legíveis e foco em tabelas e evidências. Gráficos serão usados quando acrescentarem informação; sem gradientes chamativos ou efeitos decorativos excessivos.

**Telas principais planejadas:** Visão geral, Fontes de dados, Consultas, Análises, Assistente, Relatórios e Configurações. **Recursos complementares:** histórico de operações, verificações de qualidade e módulos demonstrativos baseados no inventário sintético. A interface definitiva será ajustada conforme os testes.

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

**Separação essencial:** o banco da empresa continua sob controle da organização, independentemente do SGBD utilizado. Os conectores deverão usar identidades com privilégios mínimos, consultas previamente aprovadas e nenhuma credencial armazenada no repositório. `deployment/` documentará um laboratório futuro, não uma infraestrutura já existente.

## Segurança e limitações

**Requisito central:** nenhum dado corporativo deve ser enviado a APIs externas ou serviços de inferência em nuvem. O Ollama deverá utilizar **apenas modelos locais**, sem fallback para modelos hospedados; qualquer recurso de nuvem deverá ser desabilitado ou bloqueado por políticas de rede verificáveis. A operação prevista deve aplicar bloqueio de saída por padrão, exceções documentadas, autenticação, autorização por perfil, consultas somente leitura, minimização de dados, logs sem conteúdo confidencial e testes de tráfego. **API interna não é API externa:** FastAPI e Ollama podem comunicar-se somente dentro da infraestrutura autorizada.

**Controle de consultas:** o assistente não recebe acesso direto e irrestrito ao SGBD. O backend valida a identidade, as permissões, os parâmetros e o catálogo de consultas permitidas antes de executar operações com uma credencial de banco de **privilégios mínimos**. Instruções recebidas pelo modelo, inclusive conteúdos vindos dos dados, **não podem substituir essas verificações**; respostas devem respeitar filtros e mascaramento de dados sensíveis.

O MVP será executado **localmente**, com dados sintéticos, consultas autorizadas e serviços vinculados a `127.0.0.1`. O funcionamento offline e o isolamento de rede **ainda precisarão ser testados**.

A IA não poderá executar SQL arbitrário nem alterar o banco. Alertas de qualidade não devem ser tratados como erros confirmados sem verificação; hashes e HMAC só identificam alterações quando comparados com referências confiáveis. Segredos, bancos operacionais, backups e logs privados não devem ser versionados.

Para os controles e testes completos, consulte [03 — Auditoria e backups](docs/03-auditoria-e-backups.md), [05 — Assistente local](docs/05-assistente-local.md), [07 — Testes](docs/07-testes-e-experimentos.md) e [08 — Rede privada](docs/08-arquitetura-de-rede-e-seguranca.md).

**Estado dos entregáveis:** proposta empresarial e pré-requisitos técnicos documentados, tecnologias selecionadas, dataset sintético disponível e **primeira tela React demonstrativa criada**. Backend, integrações, validação e benchmarks ainda pendentes.
