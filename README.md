<h1 align="center">AI Privileged Access</h1>

<p align="center"><strong>PRIVATE AI   •   SECURE DATA ACCESS   •   ON-PREMISES PROCESSING</strong></p>

<p align="center">
<a href="https://github.com/lianeheidemann/ai-privileged-access/actions/workflows/deploy-pages.yml">
<img alt="CI & Deploy" src="https://img.shields.io/github/actions/workflow/status/lianeheidemann/ai-privileged-access/deploy-pages.yml?branch=main&style=flat-square&label=CI%20%26%20Deploy&logo=githubactions&logoColor=white&labelColor=222938">
</a>
<a href="https://lianeheidemann.github.io/ai-privileged-access/">
<img alt="Live Demo" src="https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-426D91?style=flat-square&logo=githubpages&logoColor=white&labelColor=222938">
</a><br>
  <img src="assets/badges/badge_em-construcao.svg" alt="Em construção" width="210" >
</p>

---

<p align="center">
  <sub><strong>Backend · Banco de Dados · IA (planejados)</strong></sub>
</p>

<p align="center">
  <img height="21" alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=FFFFFF">
  <img height="21" alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=FFFFFF">
  <img height="21" alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=FFFFFF">
  <img height="21" alt="Ollama" src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=FFFFFF">
  <img height="21" alt="scikit-learn" src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=FFFFFF">
</p>

<p align="center">
  <sub><strong>Frontend · Protótipo Visual (em uso)</strong></sub>
</p>

<p align="center">
  <img height="21" alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img height="21" alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=FFFFFF">
  <img height="21" alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E">
  <img height="21" alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=FFFFFF">
  <img height="21" alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=FFFFFF">
  <img height="21" alt="TanStack" src="https://img.shields.io/badge/TanStack-FF4154?style=for-the-badge&logo=reactquery&logoColor=FFFFFF">
  <img height="21" alt="Recharts" src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge">
  <img height="21" alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=FFFFFF">
</p>

<h2 align="center">
<img width="320" src="assets/privileged-access-v1.png">
</h2>

<p align="center"><strong>- ESTABELECER CRITÉRIOS PARA O ACESSO PRIVILEGIADO É ESSENCIAL<br>PARA A GARANTIA DA *QUALIDADE* E A AVALIAÇÃO DO *DESEMPENHO* DO SISTEMA?<br><br>- ESSE FOI O PRINCIPAL PROBLEMA IDENTIFICADO, E QUE PRECISA SER ENFRENTADO E RESOLVIDO..</strong></p>

---

**AI Privileged Access** é um projeto de estudo e validação técnica sobre **segurança na integração de inteligência artificial local a dados empresariais**. A pergunta central é: *quais controles são necessários para que um LLM executado na infraestrutura da organização ajude usuários autorizados a consultar e analisar dados, sem vazar informações nem ampliar privilégios?*

> [!NOTE]
> O caso de uso é agilizar consultas, análises e relatórios. O protótipo usa **SQLite e dados 100% sintéticos**. A arquitetura prevê conectores somente leitura para outros SGBDs, sem migrar as fontes corporativas.

## Status atual

> [!WARNING]
> **EM CONSTRUÇÃO — FASE DE PRÉ-REQUISITOS TÉCNICOS E PROTÓTIPO VISUAL.**
>
> **Já disponível:**
> - documentação de arquitetura, ameaças e testes;
> - [stack e decisões de software](docs/software/);
> - [dimensionamento de hardware](docs/hardware/);
> - dataset sintético, validado por script, com gabarito e [conjunto de perguntas de avaliação](data/avaliacao/perguntas_assistente.csv);
> - **protótipo visual React** com as sete telas, alimentado por agregados reais do dataset sintético e coberto por testes.
>
> **Ainda não implementado:** banco SQLite operacional, serviços Python/FastAPI, autorização por papel, integração com Ollama, consultas reais, validação dos controles de segurança e benchmarks. **Não existe sistema funcional nem aplicação pronta para uso empresarial.**

### Protótipo visual

Consulte a [**demonstração no GitHub Pages**](https://lianeheidemann.github.io/ai-privileged-access/). As sete telas usam Tailwind CSS, componentes no padrão shadcn/ui, TanStack Table/Query e Recharts.

O protótipo **não se conecta** a banco, backend ou IA. Os números vêm de um JSON gerado a partir dos CSVs sintéticos. O assistente demonstra a política de bloqueio (escrita, contorno de regras, segredos, SQL livre, envio externo) e responde só com números do dataset, **sem LLM**.

## Documentação

O ponto de partida é o [**guia de desenvolvimento**](docs/README.md): ele explica as duas trilhas, a ordem de leitura, a stack, o padrão de trabalho e a primeira tarefa.

| Pasta | Conteúdo |
| --- | --- |
| [`docs/`](docs/) | Guia de desenvolvimento |
| [`docs/hardware/`](docs/hardware/) | Estimativa de requisitos de hardware: do MVP em um notebook à operação em alta disponibilidade (+100 funcionários) |
| [`docs/software/`](docs/software/) | Stack e decisões de software, da arquitetura à anomalia e ML |
| [`docs/software/interface/`](docs/software/interface/) | Guias de direção visual |

Outros READMEs: [scripts do dataset](scripts/dataset/) (validação e geração).

## Objetivo

**Objetivo principal:** investigar e validar os **controles de segurança** necessários para integrar IA local a dados empresariais:

- **autorização** por papel e por escopo de dados, aplicada no backend e no banco, nunca no prompt;
- **catálogo de consultas** parametrizadas em conexão somente leitura, sem SQL livre gerado pelo modelo;
- **minimização**: o modelo recebe apenas resultados que o usuário pode ver, limitados em linhas e campos;
- **resistência a prompt injection**, inclusive instruções armazenadas nos próprios dados;
- **operação sem inferência externa**, com bloqueio de saída verificável;
- **logs, exportações e mensagens de erro** que não vazem dados fora do escopo.

**Trilha complementar:** integridade, auditoria e detecção de anomalias (etapas 08–10) demonstram análises úteis sobre os dados, mas **não são o foco** e não bloqueiam a trilha principal.

**A IA auxilia na interpretação, mas não é fonte de fatos.** Números exibidos vêm de consultas determinísticas; o modelo apenas redige a explicação.

## Metas de validação

Ainda **não existem resultados medidos**. Estas são as metas de aceite definidas antes da implementação, detalhadas na [etapa 06](docs/software/06-testes-e-experimentos.md):

| Dimensão | Meta |
| --- | --- |
| Perguntas normais do [conjunto de avaliação](data/avaliacao/perguntas_assistente.csv) | ≥ 90% com valor idêntico ao esperado |
| Perguntas adversariais e de acesso negado | **100%** negadas, sem consulta fora do escopo |
| Escritas provocadas pelo assistente | **0** (hash do banco igual antes e depois) |
| Linhas fora do escopo do papel em respostas, exports e logs | **0** |
| Conexões de saída durante a operação offline | **0** não autorizadas |
| Portas na LAN no cenário local | **0** (bind somente em `127.0.0.1`) |
| Latência do assistente | p50 e p95 medidos e publicados com o hardware; alvo inicial p95 ≤ 15 s no notebook de referência |

## Arquitetura do MVP

**Protótipo de validação:** um único notebook Windows 11. O React abre no navegador, mas frontend, backend, banco e IA executam **localmente**, sem hospedagem externa. Referência: RTX 3060 Laptop (6 GB de VRAM) e 16 GB de RAM; veja [Dimensionamento de hardware](docs/hardware/).

![Arquitetura local planejada do AI Privileged Access](assets/diagrams/arquitetura-local.svg)

| Serviço | Desenvolvimento local | Papel |
| --- | --- | --- |
| Frontend | `http://127.0.0.1:5173` | Vite durante o desenvolvimento |
| Backend | `http://127.0.0.1:8000` | FastAPI: autenticação local, autorização por papel, catálogo de consultas |
| Ollama | `http://127.0.0.1:11434` | Inferência chamada **somente** pelo backend |
| SQLite | Arquivo em `runtime/` | Persistência local, **sem porta TCP** |

**Autorização desde o MVP:** usuários e papéis **fictícios** ([`config/usuarios-ficticios.example.json`](config/usuarios-ficticios.example.json)): operador restrito a setores, auditor e administrador de laboratório. O backend aplica o escopo antes de qualquer consulta. Identidade corporativa (OIDC/AD), PostgreSQL com RLS e TLS ficam para a etapa 07.

**Segurança desde a primeira etapa:**
- limites de confiança e matriz de fluxos permitidos;
- bloqueio de saída por padrão;
- bind em `127.0.0.1`;
- conexão de consulta somente leitura e SQL parametrizado;
- testes de firewall, isolamento e execução offline.

Loopback reduz a exposição à rede, mas **não substitui autorização**: qualquer processo local pode alcançar `127.0.0.1`, inclusive o Ollama, que não tem autenticação própria.

Consulte [05 — Interface](docs/software/05-interface-e-relatorios.md) e [07 — Rede privada e segurança](docs/software/07-arquitetura-de-rede-e-seguranca.md).

## Arquitetura empresarial proposta

A implantação futura permitirá que **usuários autorizados** consultem dados corporativos por uma **API interna**, com inferência no ambiente da empresa e acesso ao banco por **conectores somente leitura** (PostgreSQL, SQL Server, MySQL), conforme as políticas da organização, **sem exigir migração do banco corporativo**.

Requisitos de segurança dessa fase:
- identidade corporativa;
- autorização por perfil;
- segmentação de rede;
- TLS entre serviços;
- bloqueio de conexões externas não autorizadas.

**A autorização deve ser aplicada pelo backend e pelas permissões efetivas do banco, não por instruções ao modelo.**

![Arquitetura empresarial planejada do AI Privileged Access](assets/diagrams/arquitetura-empresarial.svg)

**Diagrama conceitual, não implementado.** A ausência de vazamentos não é garantida pelo desenho; ela exige testes de rede, permissões, registros e tratamento de dados ([etapa 07](docs/software/07-arquitetura-de-rede-e-seguranca.md)).

## Tecnologias

A justificativa, as alternativas consideradas e os riscos de cada escolha estão em [**Stack e decisões de software**](docs/software/00-stack-e-decisoes-de-software.md).

| Camada | Stack | Situação |
| --- | --- | --- |
| Frontend | **React 18, TypeScript, Vite 6** | Em uso no protótipo |
| Componentes e estilos | **Tailwind CSS 4, componentes no padrão shadcn/ui, Lucide React** | Em uso no protótipo |
| Tabelas e dados | **TanStack Table, TanStack Query** | Em uso (API simulada local) |
| Gráficos | **Recharts** | Em uso no protótipo |
| Testes do frontend | **Vitest, Testing Library** | Em uso |
| Scripts do dataset | **Python 3.10+** (biblioteca padrão) | Em uso |
| Backend/API | **Python, FastAPI, Pydantic** | Planejado (etapa 05) |
| Banco de validação | **SQLite** (`sqlite3`); não é exigência da solução empresarial | Planejado (etapa 03) |
| IA | **Ollama** com modelo local de 3–4B quantizado; nuvem e fallback externo desabilitados | Planejado (etapa 04) |
| Machine Learning | **scikit-learn**, pandas, NumPy — trilha complementar | Planejado (etapa 10) |
| Testes do backend | **pytest** | Planejado |
| Fontes corporativas | Conectores somente leitura para **PostgreSQL, SQL Server, MySQL** | Futuro (etapa 07) |

As versões exatas em uso, as versões de referência do backend e as alternativas consideradas estão em [Stack e decisões de software](docs/software/00-stack-e-decisoes-de-software.md#versões). O hardware necessário para o MVP e para escalas maiores está em [Dimensionamento de hardware](docs/hardware/README.md).

**Linguagens predominantes:** Python, TypeScript e SQL. O **Node.js** serve apenas às ferramentas de build do frontend. Na distribuição local, o FastAPI servirá o build estático.

## Dados sintéticos

A pasta [`data/`](data/) contém os CSVs que darão origem ao SQLite local. **Nenhum dado pessoal ou empresarial real.**

| Arquivo | Registros | Descrição |
| --- | ---: | --- |
| [`categorias.csv`](data/csv/categorias.csv) | 12 | Categorias e valores de referência |
| [`setores.csv`](data/csv/setores.csv) | 18 | Setores fictícios |
| [`responsaveis.csv`](data/csv/responsaveis.csv) | 90 | Identidades sintéticas |
| [`equipamentos.csv`](data/csv/equipamentos.csv) | 750 | Patrimônio, preço, aquisição, garantia e estado |
| [`movimentacoes.csv`](data/csv/movimentacoes.csv) | 2.095 | Eventos de movimentação |
| [`chamados.csv`](data/csv/chamados.csv) | 1.196 | Chamados técnicos e reparos |
| **Total** | **4.161** | **Seis conjuntos de registros** |

Arquivos de apoio:

| Arquivo | Uso |
| --- | --- |
| [`ground_truth/gabarito_anomalias.csv`](data/ground_truth/gabarito_anomalias.csv) | 50 anomalias em 7 classes. **Somente para avaliação**, nunca para o detector ou o assistente |
| [`avaliacao/perguntas_assistente.csv`](data/avaliacao/perguntas_assistente.csv) | 28 perguntas (normais, acesso negado, adversariais e fora do escopo) com resultado esperado calculado |
| [`dataset_info.json`](data/dataset_info.json) | Versão, seed, data de referência (**13/10/2026**), histórico e limitações |
| [`MANIFEST.sha256`](data/MANIFEST.sha256) | Hashes SHA-256 de todos os arquivos de dados |

Ver [`scripts/dataset/`](scripts/dataset/README.md). **Limitação conhecida:** as classes foram plantadas por regras determinísticas, então um detector por regras com os mesmos limiares as reproduz por construção. O gabarito valida a **implementação**, não o desempenho em dados reais.

![Modelo de dados sintético do AI Privileged Access](assets/diagrams/modelo-dados.svg)

## Roadmap — trilha principal e trilha complementar

Os documentos são **guias** com tarefas, arquivos previstos, testes e critérios de aceite. Não representam módulos implementados.

![Roadmap do AI Privileged Access — trilha principal e trilha complementar](assets/diagrams/roadmap.svg)

| Etapa | Trilha | Objetivo | Documento |
| --- | --- | --- | --- |
| 00 | Referência | Alternativas, riscos, versões e candidatos a modelo de cada tecnologia | [Stack e decisões de software](docs/software/00-stack-e-decisoes-de-software.md) |
| 02 | Principal | Arquitetura, escopo, ameaças e decisões | [Arquitetura e escopo](docs/software/02-arquitetura-e-escopo.md) |
| 03 | Principal | Ambiente Python, esquema SQLite e importação validada | [Banco de dados](docs/software/03-ambiente-e-banco.md) |
| 04 | Principal | **Corte vertical:** autorização por papel, catálogo somente leitura e Ollama local | [Assistente local](docs/software/04-assistente-local.md) |
| 05 | Principal | FastAPI + conexão do protótipo React à API real | [Interface e relatórios](docs/software/05-interface-e-relatorios.md) |
| 06 | Principal | Testes, metas numéricas, segurança e execução offline | [Testes e experimentos](docs/software/06-testes-e-experimentos.md) |
| 07 | Implantação posterior | Intranet privada, PostgreSQL/RLS, identidade corporativa e prevenção de vazamentos | [Rede e segurança](docs/software/07-arquitetura-de-rede-e-seguranca.md) |
| 08 | Complementar | Restrições, transações e regras de negócio | [Integridade](docs/software/08-integridade-e-transacoes.md) |
| 09 | Complementar | Auditoria, hashes e backups | [Evidências e backups](docs/software/09-auditoria-e-backups.md) |
| 10 | Complementar | Regras de anomalia e Isolation Forest exploratório | [Anomalias e ML](docs/software/10-anomalias-e-ml.md) |

Os documentos estão numerados na ordem de leitura: **00** de referência, **02–07** na trilha principal e **08–10** na complementar. Consulte o [guia de desenvolvimento](docs/README.md), que traz a equivalência com a numeração antiga.

### Estrutura do repositório

Itens sem marcação **existem no repositório**. Os marcados como *(planejado)* ou *(futuro)* ainda não foram criados.

~~~text
ai-privileged-access/
├── README.md
├── .github/workflows/             # CI: valida o dataset, testa, compila e publica a demo
├── .gitattributes                 # Dados em LF, para os hashes do manifesto
├── .gitignore                     # Exclui runtime/, bancos, segredos e builds
├── docs/                          # Guia de desenvolvimento (docs/README.md)
│   ├── hardware/                  # Dimensionamento de hardware
│   └── software/                  # 00 — Stack e decisões; 02–10 — etapas
│       └── interface/             # Um guia de direção visual por tela
├── assets/
│   ├── badges/                    
│   └── diagrams/                  # SVGs da arquitetura e do modelo de dados
├── data/
│   ├── csv/                       # Seis conjuntos sintéticos 
│   ├── ground_truth/              # Gabarito de anomalias (somente avaliação)
│   ├── avaliacao/                 # Perguntas do assistente com resultado esperado
│   ├── dataset_info.json          # Versão, seed, data de referência e limitações
│   └── MANIFEST.sha256            # Hashes SHA-256 dos arquivos de dados
├── scripts/dataset/               # Validação, manifesto, perguntas e resumo do frontend
├── config/                        # Exemplos sem segredos (usuários e papéis fictícios)
├── frontend/                      # Protótipo React + TypeScript + Vite
│   └── src/                       # pages/, components/, services/ (API simulada), lib/, test/
├── src/ai_privileged_access/                 # Backend Python (planejado)
│   ├── db/                        # SQLite de demonstração
│   ├── security/                  # Autenticação local, papéis e políticas
│   ├── assistant/                 # Catálogo de consultas e cliente Ollama
│   ├── api/                       # FastAPI interna
│   ├── reports/                   # Exportação controlada
│   ├── integrity/ audit/ detection/   # Trilha complementar
│   └── connectors/                # Fontes corporativas somente leitura (futuro)
├── tests/                         # Testes Python (planejado)
├── pyproject.toml                 # Metadados e dependências do backend (planejado)
├── deployment/                    # Laboratório corporativo futuro
└── runtime/                       # Bancos, logs e evidências locais; fora do Git (planejado)
~~~

## Segurança e limitações

> [!CAUTION]
> **Requisito central:** nenhum dado corporativo pode ser enviado a APIs externas ou a serviços de inferência em nuvem.
> - O Ollama usará **apenas modelos locais**, sem fallback hospedado, com recursos de nuvem desabilitados e bloqueados por política de rede verificável.
> - **API interna não é API externa:** FastAPI e Ollama se comunicam somente dentro da infraestrutura autorizada.

**Controle de consultas:** o assistente não tem acesso direto ao SGBD. Antes de executar uma consulta do catálogo, com credencial de privilégio mínimo, o backend valida:
- identidade e papel;
- escopo e parâmetros;
- limites de linhas e de tempo.

Instruções recebidas pelo modelo, inclusive as vindas dos próprios dados, **não substituem essas verificações**.

**Ameaças consideradas** ([etapa 02](docs/software/02-arquitetura-e-escopo.md)):
- injeção de prompt direta e indireta;
- processos locais acessando o Ollama;
- DNS rebinding e CSRF contra serviços em loopback;
- procedência dos modelos baixados e cadeia de dependências (lockfile e hashes);
- cifragem em repouso;
- CSV injection em exportações;
- respostas alucinadas;
- conformidade com a LGPD quando houver dados reais.

A IA não poderá executar SQL arbitrário nem alterar o banco. Alertas de qualidade não são erros confirmados. Hashes e HMAC só identificam alterações quando comparados com referências confiáveis. Segredos, bancos operacionais, backups e logs privados não são versionados.

**Estado dos entregáveis:**
- **Concluídos:** proposta e pré-requisitos documentados, tecnologias justificadas, dataset sintético v2 validado com conjunto de avaliação, protótipo visual testado.
- **Pendentes:** backend, autorização, integração com IA, validação dos controles de segurança e benchmarks.

## Licença

Ainda **não definida**: o repositório não tem arquivo `LICENSE`, e sem ele o código não pode ser reutilizado. A escolha está registrada como decisão em aberto em [Stack e decisões de software](docs/software/00-stack-e-decisoes-de-software.md#decisões-em-aberto).
