# 05 — API FastAPI e interface React conectada

> **Status:** o **protótipo visual React já existe** em [`frontend/`](../../frontend/), com as sete telas, a stack definida e testes. O que falta nesta etapa é a **API FastAPI** e a troca da API simulada (`frontend/src/services/demo-api.ts`) por chamadas reais. Tudo roda **no próprio computador**, sem hospedagem nem APIs externas.

**Objetivo:** expor pela API FastAPI os serviços da trilha principal (autorização, catálogo, assistente) e, quando existirem, os da trilha complementar, conectando o protótipo React a eles. A primeira execução é local. A interface corporativa posterior será acessível apenas a usuários autorizados na intranet.

**Pré-requisitos:** etapas [03](03-ambiente-e-banco.md) e [04](04-assistente-local.md). As etapas 08–10 são opcionais: telas e rotas que dependem delas mostram "ainda não disponível".

**Fronteira de segurança:**
- A interface nunca recebe credenciais de banco, tokens de serviço ou acesso direto ao Ollama.
- A API verifica identidade e papel **a cada requisição**, com os usuários fictícios da etapa 04.
- Aplica limites de exportação e paginação e não retorna colunas sigilosas por padrão.
- Identidade corporativa (OIDC/AD) fica para a etapa 07.

**Guias breves por tela:** [`docs/software/interface/`](interface/README.md).

## 1. Stack da interface

| Responsabilidade | Escolha | Situação |
| --- | --- | --- |
| Frontend | React 18 + TypeScript | Implementado |
| Build | Vite 6 | Implementado |
| Componentes | Padrão shadcn/ui (`src/components/ui/`, `components.json`) | Implementado |
| Estilo | Tailwind CSS 4, tokens em `src/index.css` | Implementado |
| Ícones | Lucide React | Implementado |
| Tabelas | TanStack Table | Implementado (paginação no cliente) |
| Requisições | TanStack Query | Implementado sobre API simulada; trocar por `fetch('/api/...')` |
| Gráficos | Recharts | Implementado |
| Testes do frontend | Vitest + Testing Library | Implementado |
| Backend/API | Python + FastAPI + Pydantic | **Esta etapa** |
| Banco | SQLite | **Somente o backend** acessa o arquivo |
| IA | Ollama local | **Somente o backend** chama o modelo |
| Testes da API | pytest + TestClient | **Esta etapa** |

**Linguagens:** Python, TypeScript e SQL. O Node.js serve **apenas às ferramentas de build**; não há Next.js nem servidor Node em produção.

## 2. Arquitetura — mesmo notebook

~~~mermaid
flowchart TD
    U["Navegador local"] -->|"127.0.0.1:5173 (dev)"| V["React + Vite"]
    V -->|"/api"| F["FastAPI · 127.0.0.1:8000"]
    F --> Z["Sessão local + autorização por papel"]
    Z --> Q["Catálogo de consultas (RO)"]
    Z --> S["Trilha complementar (quando existir)"]
    Q --> DB[("SQLite no disco")]
    S --> DB
    Q --> O["Ollama · 127.0.0.1:11434"]
~~~

**Em produção local:** gerar o build React e servi-lo pelo FastAPI na mesma origem, **http://127.0.0.1:8000**, sem Vite.

| Serviço | Endereço | Acesso permitido |
| --- | --- | --- |
| Vite (somente dev) | 127.0.0.1:5173 | Navegador no próprio Windows |
| FastAPI | 127.0.0.1:8000 | Frontend local |
| Ollama | 127.0.0.1:11434 | Backend Python |
| SQLite | Sem porta de rede | Processo Python |

Bind, proxy, firewall e validação offline: [07 — Rede e segurança, seção 2.1](07-arquitetura-de-rede-e-seguranca.md).

## 3. Estrutura

~~~text
dataguard-ai/
├── frontend/                          # Já existe
│   └── src/
│       ├── components/ui/             # Primitivas shadcn/ui
│       ├── components/layout/         # Sidebar, Topbar, cabeçalhos
│       ├── components/data-table/     # DataTable (TanStack Table)
│       ├── pages/                     # As sete telas
│       ├── services/                  # demo-api.ts → substituir por cliente /api
│       ├── lib/  types/  test/
│       └── data/demo-summary.json     # Remover do build quando a API existir
├── src/dataguard/
│   ├── api/                           # Criar nesta etapa
│   │   ├── main.py
│   │   ├── deps.py                    # Sessão, usuário atual, papel
│   │   ├── routes/
│   │   └── schemas.py
│   ├── security/  assistant/  db/  reports/
│   └── integrity/  audit/  detection/ # Se existirem
└── tests/
    ├── test_api.py
    └── test_api_authorization.py
~~~

**Não crie um segundo motor de regras no frontend.** A política do assistente no protótipo (`src/lib/demo-assistant.ts`) é **só demonstração**: a política real fica no backend (etapa 04). Os componentes apenas solicitam dados e representam estados. Os nomes de intenção usados na demonstração (`chamados_abertos`, `listar_fontes`) são simplificados e **não são o contrato**: valem os nomes do catálogo da [etapa 04](04-assistente-local.md).

## 4. Passo a passo

### 05.1 — API FastAPI mínima

1. Adicionar FastAPI, Uvicorn e Pydantic às dependências Python, com versões fixadas e hashes.
2. Criar `src/dataguard/api/main.py`.
3. `GET /api/health` reporta o **estado real** da API e das dependências (`ok`, `degraded`, `unavailable`).
4. Sessão local: `POST /api/session` com um usuário fictício. Usar cookie `HttpOnly` e `SameSite=Strict`, com expiração curta.
5. **Toda rota de dados** depende do usuário atual e chama `policy.autorizar` antes do serviço.
6. Validar `limit`, `offset`, `sort`, filtros e IDs com Pydantic e impor limites máximos de resultados e de tempo.
7. Validar `Host` e `Origin` (defesa contra DNS rebinding e CSRF). Não usar CORS coringa.
8. Criar testes com TestClient e banco temporário. A falha do Ollama não deve impedir a consulta técnica.

Rotas **planejadas**, organizadas pelas sete telas:

| Método/rota | Tela | Responsabilidade |
| --- | --- | --- |
| `GET /api/health` | Configurações | Saúde da API e das dependências; nunca expor segredos |
| `POST /api/session`, `DELETE /api/session` | — | Sessão local com usuário fictício |
| `GET /api/summary` | Visão geral, Análises | Agregados **no escopo do usuário** |
| `GET /api/sources` | Fontes de dados | Fontes e contagens visíveis ao papel |
| `GET /api/records/{fonte}` | Consultas | Lista paginada no servidor (`items`, `total`, `limit`, `offset`), filtrada pelo escopo |
| `POST /api/chat` | Assistente | Pergunta → intenção aprovada, resultado, IDs de origem e explicação local |
| `GET /api/reports/{id}`, `GET /api/reports/{id}.csv` | Relatórios | Mesmo escopo da consulta; CSV neutralizado contra fórmulas |
| `GET /api/findings` | Análises | Alertas da trilha complementar, quando existirem |

As operações administrativas (auditoria, backup) ficam fora do assistente e exigem o papel adequado.

**Aceite 05.1:**
- `GET /api/health`, a sessão e ao menos uma consulta real funcionam e têm testes;
- `test_api_authorization.py` cobre os casos `acesso_negado` do conjunto de avaliação;
- nenhum dado é enviado a provedor externo.

### 05.2 — Conectar o protótipo à API

1. Configurar o proxy do Vite `/api` → `http://127.0.0.1:8000` (ver etapa 07, seção 2.1). Manter `host: '127.0.0.1'` e `strictPort: true`.
2. Substituir `src/services/demo-api.ts` por um cliente `fetch('/api/...')` com o **mesmo formato de retorno**. Os hooks de `services/queries.ts` e as telas não devem precisar mudar.
3. Levar paginação e filtros da `DataTable` para o servidor (`manualPagination`, `manualFiltering`, `manualSorting`).
4. Tela de login simples para escolher o usuário fictício. Exibir o papel na barra superior.
5. Assistente: chamar `POST /api/chat` e exibir separadamente o valor do SQL, o texto do LLM e a origem.
6. Remover `src/data/demo-summary.json` do build de produção local; manter só para a demonstração no GitHub Pages, se desejado.

**Aceite 05.2:**
- a interface abre em `http://127.0.0.1:5173` e consome `/api` pelo proxy;
- um operador não vê dados de outro setor em nenhuma tela;
- a LAN não alcança a porta do Vite.

### 05.3 — Sistema visual

Já definido no protótipo: tema escuro e claro com tokens em `frontend/src/index.css` (padrão shadcn/ui, identidade azul-marinho), sem neon nem gradientes chamativos. Ao conectar a API, acrescentar:
- estados `loading`, `empty`, `error` e `forbidden` em todas as telas;
- selo "ainda não verificado" quando não houver execução;
- nenhum número, status online ou resultado fictício apresentado como real.

### 05.4 — Conteúdo das sete telas com dados reais

| Tela | Conteúdo mínimo |
| --- | --- |
| Visão geral | Contagens no escopo do usuário, papel atual, estado das dependências |
| Fontes de dados | Fontes visíveis ao papel e suas contagens |
| Consultas | TanStack Table com paginação, filtros e ordenação **no servidor** |
| Análises | Agregados no escopo; alertas da trilha complementar quando existirem |
| Assistente | Pergunta, intenção, valor do SQL, explicação do LLM, origem e estado do Ollama |
| Relatórios | Prévia e exportação com a mesma autorização das consultas |
| Configurações | Tema, linhas por página, saúde da API, modelo local em uso |

### 05.5 — Relatórios e exportações

Preferir CSV e JSON; PDF fica como melhoria posterior. O relatório contém:
- usuário/papel (pseudônimo) e data UTC;
- versão das consultas e do modelo;
- data de referência do dataset e totais.

Os endpoints de exportação aplicam **a mesma autorização** da consulta exibida, neutralizam fórmulas (como já faz `frontend/src/lib/csv.ts`) e **nunca incluem o gabarito**.

### 05.6 — Empacotar a versão local offline

~~~powershell
# Gera os arquivos de produção do React (executar dentro de frontend)
npm ci
npm run build
~~~

1. FastAPI serve `frontend/dist/` e mantém `/api` reservado ao backend, com fallback de SPA.
2. Backend em `127.0.0.1:8000`, sem Vite no uso normal.
3. Todas as fontes, estilos, ícones e bibliotecas são locais. O protótipo já não usa CDN.
4. Testar com a internet desligada **depois** de baixar pacotes e modelos.
5. Registrar os endereços de escuta e verificar que nenhum serviço está publicado na LAN.

## 5. Critérios de aceite

- [ ] Frontend e FastAPI iniciam localmente, sem hospedagem.
- [ ] O Ollama é acessado só pelo backend.
- [ ] Toda rota de dados exige sessão e aplica o escopo do papel; testes cobrem as negações.
- [ ] Consultas exibem resultados reais com IDs de origem.
- [ ] Estados de carregamento, vazio, erro, acesso negado e LLM indisponível.
- [ ] Paginação e filtros no servidor; nenhuma consulta sem limite.
- [ ] Nenhuma pergunta do assistente gera escrita SQL.
- [ ] Testes automatizados da API (pytest) e do frontend (Vitest) passando.
- [ ] A aplicação compilada funciona offline, sem Vite.
- [ ] Os serviços não ficam expostos à LAN.
- [ ] Layout legível em notebook e em telas estreitas; teclado e contraste adequados.

**Próxima etapa:** [06 — Testes e experimentos](06-testes-e-experimentos.md). A etapa [07 — Rede e segurança](07-arquitetura-de-rede-e-seguranca.md) é uma **expansão posterior**.
