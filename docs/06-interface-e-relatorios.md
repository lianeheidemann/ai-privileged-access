# 06 — Interface web local: React + TypeScript + FastAPI

> **Status:** plano de implementação, não funcionalidade concluída. A interface será executada **no próprio computador**, no navegador, sem hospedagem nem APIs externas. Esta etapa substitui a antiga proposta em Streamlit/Plotly.

**Objetivo:** integrar os serviços Python já testados a uma interface profissional, dark e minimalista, com React + TypeScript e uma API FastAPI local.

**Pré-requisitos:** etapas [01–05](README.md), ou pelo menos o banco, as consultas e os detectores determinísticos para uma interface inicial sem LLM.

## 1. Stack oficial da interface

| Responsabilidade | Escolha | Observação |
| --- | --- | --- |
| Frontend | React + TypeScript | Navegação, estado e componentes |
| Ferramenta de build | Vite | Desenvolvimento na máquina; build estático de produção |
| Componentes | shadcn/ui | Componentes personalizáveis, usados apenas quando agregarem valor |
| Estilo | Tailwind CSS | Tema dark, espaçamentos, layouts responsivos |
| Ícones | Lucide React | Conjunto único, sem misturar estilos |
| Tabelas | TanStack Table | Paginação, ordenação, filtros e seleção |
| Gráficos | Recharts | Indicadores e séries históricas |
| Requisições | TanStack Query + fetch | Busca, cache e estados loading/error |
| Backend/API | Python + FastAPI + Pydantic | Contratos tipados, validação, acesso aos serviços Python |
| Banco | SQLite inicialmente | **Somente o backend** acessa o arquivo |
| IA | Ollama local | **Somente o backend** chama o modelo |
| Testes | pytest + Vitest/Testing Library | API, componentes e fluxos |

**Linguagens principais:** **Python**, **TypeScript** e **SQL**. HTML/CSS são empregados pelos componentes React e Tailwind. Não precisamos de Next.js, Node.js como servidor de produção nem de um serviço separado de frontend. Node.js será usado **apenas para ferramentas do frontend e geração do build**.

O React **não** se conecta diretamente ao SQLite nem ao Ollama. A API deve aplicar validação, autorização (quando introduzida), limites e seleção das consultas permitidas.

## 2. Desenho de arquitetura — mesmo notebook

~~~mermaid
flowchart TD
    U["Navegador local"] -->|"127.0.0.1:5173 (dev)"| V["React + Vite"]
    V -->|"/api"| F["FastAPI · 127.0.0.1:8000"]
    F --> S["Regras, detecção, auditoria"]
    F --> Q["Consultas validadas (somente leitura para chat)"]
    S --> DB[("SQLite no disco")]
    Q --> DB
    Q --> O["Ollama · 127.0.0.1:11434"]
~~~

**Em produção local:** executar o build estático React e fazer o FastAPI servi-lo, na mesma origem **http://127.0.0.1:8000**. Assim, Vite não precisa permanecer ligado.

| Serviço | Porta no desenvolvimento | Acesso permitido |
| --- | --- | --- |
| Vite | 127.0.0.1:5173 | Navegador no próprio Windows |
| FastAPI | 127.0.0.1:8000 | Frontend local |
| Ollama | 127.0.0.1:11434 | Backend Python |
| SQLite | Sem porta de rede | Processo Python com permissões apropriadas |

As configurações concretas de bind, proxy, firewall e validação offline estão em [08 — Arquitetura de rede e segurança](08-arquitetura-de-rede-e-seguranca.md), **seção 2.1**. Essa parte local é aplicável ao MVP; a implantação na intranet continua sendo uma expansão **posterior**.

## 3. Estrutura planejada

~~~text
dataguard-ai/
├── frontend/                         # Criar nesta etapa
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── data-table/
│   │   │   └── ui/                   # Componentes shadcn/ui, conforme necessidade
│   │   ├── pages/
│   │   │   ├── Overview.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Integrity.tsx
│   │   │   ├── Anomalies.tsx
│   │   │   ├── Assistant.tsx
│   │   │   ├── Backups.tsx
│   │   │   └── Experiments.tsx
│   │   ├── services/                 # Cliente HTTP; nenhum SQL
│   │   ├── types/                    # Tipos de resposta
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.ts
│   └── dist/                          # Build gerado; ignorar no Git se desejado
├── src/dataguard/
│   ├── api/                            # Criar nesta etapa
│   │   ├── main.py
│   │   ├── routes/
│   │   └── schemas.py
│   ├── db/
│   ├── integrity/
│   ├── audit/
│   ├── detection/
│   ├── assistant/
│   └── reports/
├── runtime/                           # Dados/relatórios privados locais; ignorar no Git
└── tests/
    ├── test_api.py
    └── ...
~~~

**Não criar um segundo motor de regras no frontend.** O backend reaproveita os serviços das etapas 01–05; os componentes da tela somente solicitam dados e representam estados.

## 4. Passo a passo da implementação

### 06.1 — API FastAPI mínima, antes das telas

1. Adicionar FastAPI, Uvicorn e Pydantic às dependências Python (fixar versões compatíveis).
2. Criar `src/dataguard/api/main.py` com uma aplicação FastAPI.
3. Adicionar `GET /api/health` para reportar **estado real** de API e dependências, diferenciando `ok`, `degraded` e `unavailable`.
4. Expor consultas e resultados pelos serviços Python existentes; a API não executa SQL arbitrário enviado pelo navegador.
5. Validar `limit`, `offset`, `sort`, filtros e IDs com Pydantic; impor limites máximos de resultados e tempos.
6. Criar testes com TestClient e banco temporário; falha do Ollama não deve impedir consulta técnica ao SQLite.

Rotas **planejadas**, que só existirão após implementação:

| Método/rota | Responsabilidade | Contrato resumido |
| --- | --- | --- |
| `GET /api/health` | Saúde da API e dependências | Estados por componente; nunca expor segredos |
| `GET /api/summary` | Métricas do dashboard | Quantidades, execução de referência, timestamp |
| `GET /api/inventory` | Lista paginada | `items`, `total`, `limit`, `offset` |
| `GET /api/audits` | Resultados de auditorias | Histórico, status e identificadores |
| `POST /api/audits/run` | Executar auditoria controlada | `run_id` e progresso/resultado; sem SQL do usuário |
| `GET /api/anomalies` | Alertas e evidências | Filtros, `detector_version`, IDs e dados necessários |
| `POST /api/chat` | Pergunta de linguagem natural | Intenção aprovada, evidências e explicação local |
| `GET /api/backups` | Manifestos de backups | Metadados e estado de verificação |
| `GET /api/experiments` | Resultados avaliados | Métricas do experimento; sem vazar gabarito para inferência |

Operações de escrita, como iniciar auditorias e gerar backups, devem ter validação, trilha de auditoria e autorização adequada ao cenário; **não confundir consulta do assistente com comandos administrativos**.

**Aceite 06.1:** `GET /api/health` e ao menos uma consulta real funcionam localmente e têm testes. Nenhum serviço da API precisa enviar dados a um provedor externo.

### 06.2 — Inicializar o frontend React + Vite

1. Instalar uma versão estável compatível do Node.js localmente.
2. Criar o projeto React + TypeScript **dentro de `frontend/`** usando Vite.
3. Instalar/configurar Tailwind CSS e, conforme a tela exigir, shadcn/ui, Lucide, TanStack Table/Query e Recharts.
4. Configurar o Vite para `host: '127.0.0.1'`, `port: 5173`, `strictPort: true` e proxy `/api` → `http://127.0.0.1:8000` (ver documento 08).
5. Organizar os componentes, configurações de tema e contratos TypeScript em pastas distintas.

No PowerShell, **após configurar o frontend**:

~~~powershell
# Inicia o servidor Vite no loopback do notebook
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
~~~

A interface deve fazer requisições relativas (`fetch('/api/summary')`) em vez de chamar IPs fixos da rede corporativa, o que facilita a execução offline e a futura intranet. Configure o fallback da SPA ao servir o build no FastAPI sem sobrescrever rotas `/api/`.

**Aceite 06.2:** a interface abre em `http://127.0.0.1:5173`; `/api/health` é alcançável pelo proxy e a LAN não alcança a porta do Vite.

### 06.3 — Sistema visual e componentes reutilizáveis

**Direção:** dark, moderna e minimalista; sem neon, gradientes chamativos nem excesso de cartões. Preferir informações auditáveis a decoração.

| Papel | Cor de referência |
| --- | --- |
| Fundo principal | `#0B111A` |
| Superfícies | `#131E2B` |
| Bordas | `#293849` |
| Texto principal | `#E8EEF5` |
| Texto secundário | `#9AAABC` |
| Ação principal | `#3B82F6` |
| Erro confirmado | `#F87171` |
| Estado aprovado | `#34D399` |

Criar primeiro: **AppShell** (sidebar + header), cartões de indicadores, tabela paginada, status de verificação, painel de evidências e estados `loading` / `empty` / `error`. Botões devem representar ações existentes; **não colocar números, status online ou resultados fictícios como se fossem reais**.

### 06.4 — Implementar páginas em ordem de valor

| Ordem | Página | Conteúdo mínimo |
| --- | --- | --- |
| 1 | Visão geral | Estado de verificação, contagens reais, última auditoria |
| 2 | Inventário | TanStack Table com filtros/paginação implementados no backend |
| 3 | Integridade | PRAGMAs, regras executadas e evidências rastreáveis |
| 4 | Anomalias | Score/limiar, regra, ID do registro e revisão humana |
| 5 | Assistente | Perguntas, dados de origem, resposta e indisponibilidade do Ollama |
| 6 | Backups | Snapshot/manifesto; nenhuma restauração destrutiva por padrão |
| 7 | Experimentos | Precision, recall, F1 e latência; gráficos somente quando houver dados |

A navegação lateral deve permanecer curta e consistente. O status **integridade estrutural aprovada** não significa ausência de anomalias. Mostrar "ainda não verificado" quando não existir execução.

### 06.5 — Relatórios e exportações

Reutilizar `src/dataguard/reports/` (etapa 02/03). Preferir CSV e JSON; PDF pode ser uma melhoria posterior.

O relatório deve conter `audit_run_id`, data UTC, versão da regra/modelo, data de referência do dataset, totais, evidências e verificações inconclusivas. Os endpoints de exportação devem aplicar a mesma autorização que a consulta exibida e **não incluir o gabarito na operação cotidiana**.

### 06.6 — Empacotar a versão web **offline local**

Depois de concluir as telas:

~~~powershell
# Gera os arquivos de produção do React sem hospedar a interface externamente
cd frontend
npm run build
~~~

1. Configurar FastAPI para servir os arquivos estáticos em `frontend/dist/` e manter `/api` reservado ao backend.
2. Iniciar o backend em `127.0.0.1:8000`, sem Vite durante o uso normal.
3. Acessar `http://127.0.0.1:8000` no navegador.
4. Hospedar localmente **todas** as fontes, estilos, ícones e bibliotecas; não depender de CDN, Google Fonts, telemetria ou recursos remotos em runtime.
5. Testar com internet desligada **depois** de baixar pacotes, modelos e outros arquivos necessários.
6. Registrar os endereços de escuta e verificar que nenhum serviço está publicado na LAN.

## 5. Testes e critérios de aceite

- [ ] Frontend e FastAPI compilam/iniciam localmente, sem hospedagem.
- [ ] `127.0.0.1:5173` (desenvolvimento) e `127.0.0.1:8000` (API/produção local) funcionam.
- [ ] Ollama é acessado pelo backend, nunca diretamente pela UI.
- [ ] Consultas e alertas exibem resultados reais com IDs/evidências.
- [ ] O app mostra estados de carregamento, ausência de dados, erro e LLM indisponível.
- [ ] A tabela suporta paginação e filtros no servidor; nenhuma consulta sem limites.
- [ ] Nenhuma pergunta do assistente gera escrita SQL.
- [ ] Testes automatizados para API e componentes críticos.
- [ ] A aplicação compilada funciona offline, inclusive sem Vite.
- [ ] Os serviços não ficam expostos inadvertidamente à LAN.
- [ ] Layout é legível em notebook e larguras menores; teclado e contraste adequados.

**Critério de conclusão:** qualquer pessoa que execute o protótipo em seu próprio computador, seguindo as instruções, consegue visualizar o inventário, resultados de auditoria, anomalias e consultas permitidas, distinguindo fatos, suspeitas e erros.

**Próxima etapa:** [07 — Testes e experimentos](07-testes-e-experimentos.md). A etapa [08 — Redes e segurança](08-arquitetura-de-rede-e-seguranca.md) é uma **expansão posterior**.
