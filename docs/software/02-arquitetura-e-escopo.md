# 02 — Arquitetura, escopo e decisões

**Objetivo:** definir a arquitetura de uma **IA privada para consultar e analisar dados empresariais com segurança**. Os controles validados são autorização, consultas somente leitura, minimização e operação sem inferência externa. O inventário sintético é apenas o primeiro caso de validação.

**Pré-requisito:** nenhum. **Não implementar código de aplicação nesta etapa.**

## 1. O problema que o projeto resolve

A solução deve conectar-se de forma controlada a uma fonte de dados interna e responder perguntas de usuários autorizados, sem enviar registros a provedores externos e sem que o modelo de linguagem amplie privilégios. O protótipo começa com banco local e dados sintéticos; a integração corporativa é posterior. O MVP usará **React + TypeScript em um navegador local**, conectado por **FastAPI** aos serviços Python.

A pergunta de pesquisa se divide em hipóteses verificáveis:

| Hipótese | Como verificar | Etapa |
| --- | --- | --- |
| H1 — Autorização no backend impede respostas fora do escopo, mesmo com prompts maliciosos | Perguntas `acesso_negado` e `adversarial` do conjunto de avaliação | 04, 06 |
| H2 — Catálogo de consultas em conexão somente leitura impede escrita pelo assistente | Hash do banco antes e depois das perguntas adversariais | 04, 06 |
| H3 — Um modelo local de 3–4B no hardware de referência responde com utilidade em português | Acerto e latência nas perguntas `normal` | 04, 06 |
| H4 — A operação não depende de serviços externos | Captura de tráfego com internet desligada | 06 |
| H5 — Na rede privada, banco e LLM ficam inacessíveis fora do backend | Testes N01–N12 | 07 |

A trilha complementar (etapas 08–10) separa quatro conceitos de qualidade de dados:

| Conceito | Pergunta | Como verificar |
| --- | --- | --- |
| Integridade estrutural | O arquivo SQLite e suas páginas estão consistentes? | `PRAGMA integrity_check` |
| Integridade referencial | Existem referências para registros inexistentes? | `PRAGMA foreign_key_check` |
| Regras de negócio | Existem datas, estados ou operações logicamente incoerentes? | Consultas SQL/Python |
| Anomalia estatística | Algo é incomum em relação aos demais registros? | Estatísticas e ML |

**Integridade criptográfica** é outra dimensão: validar que uma cópia ou evidência não mudou **desde uma referência confiável**. Isso não prova que seu conteúdo era correto quando a referência foi criada.

## 2. Requisitos de segurança desde o início

- Definir **fronteiras de confiança** entre navegador, API, inferência e banco, com matriz de fluxos autorizados.
- Bloquear **tráfego de saída por padrão** durante a operação. Registrar exceções justificadas e testar DNS, HTTP(S), telemetria e atualizações automáticas.
- Diferenciar API **interna** (FastAPI/Ollama) de API **externa**: proibir chamadas a provedores de inferência em nuvem.
- **Autorização por papel e por escopo desde o MVP**, com usuários fictícios ([`config/usuarios-ficticios.example.json`](../../config/usuarios-ficticios.example.json)), aplicada no backend antes de qualquer consulta. Identidade corporativa fica para a etapa 07.
- Não encaminhar tabelas inteiras ao LLM. Limitar campos, linhas e conteúdo retornado.
- Proteger logs, backups, relatórios, prompts e respostas contra exposição de dados sensíveis.
- Validar com testes negativos, monitoramento de conexões e revisão de permissões. **Nenhuma topologia garante vazamento zero.**

A implantação com PostgreSQL, segmentação e TLS ocorre na [etapa 07](07-arquitetura-de-rede-e-seguranca.md), mas estes requisitos influenciam o MVP desde agora.

## 3. Escopo inicial e limites

**Fazer no MVP:**
- Banco SQLite local gerado a partir dos seis CSVs sintéticos validados.
- Autenticação local simples com **usuários e papéis fictícios** (operador por setor, auditor, administrador de laboratório) e autorização no backend.
- Catálogo de **consultas parametrizadas** em conexão somente leitura, com limites de linhas e tempo.
- Assistente em português que classifica a pergunta entre intenções conhecidas e usa o Ollama local **apenas para redigir** a explicação.
- Interface React conectada à API, relatório exportável e experimentos reprodutíveis com metas numéricas.
- Trilha complementar: verificações de integridade, trilha de eventos, backups e detecção de padrões incomuns.

**Não fazer agora:**
- Identidade corporativa (SSO, AD, OIDC), cloud, dados empresariais ou pessoais reais.
- Treinar ou ajustar LLM, criar endpoints públicos ou permitir edição pelo assistente.
- Permitir SQL livre, inclusive gerado pelo modelo, ou restauração destrutiva com um clique.
- Considerar alertas como problemas confirmados sem validação adicional.

## 4. Princípios de arquitetura

~~~mermaid
flowchart TD
    U["Navegador local"] --> R["React + TypeScript · Vite (dev)"]
    R -->|"/api"| F["FastAPI · Python"]
    F --> Z["Autenticação local + autorização por papel"]
    Z --> Q["Catálogo de consultas · conexão somente leitura"]
    Q --> DB[("SQLite local")]
    Q --> LLM["Ollama · LLM local (só redige)"]
    Z --> S["Trilha complementar: integridade, anomalias"]
    S --> DB
    F --> E["Logs mínimos, backups e manifestos"]
~~~

1. **O banco é a fonte de fatos; o LLM não é.** Números exibidos vêm do resultado SQL, não do texto gerado.
2. **Autorização antes da consulta.** O papel do usuário define intenções e escopo. O LLM só vê dados que o usuário já pode ver.
3. **Leitura e escrita são serviços distintos.** A interface de perguntas não recebe credenciais de escrita.
4. **Confirmação, suspeita e explicação são saídas diferentes.**
5. **Os dados de teste permanecem auditáveis:** gabarito separado, semente fixa e manifesto SHA-256.
6. **A aplicação funciona offline depois do preparo.** Prompts e arquivos não são enviados a provedores externos.
7. **Toda ação relevante produz um resultado testável**, inclusive as negações.

### 4.1 — Tecnologias e limites da rede local

| Camada | Tecnologia definida | Quando implementar |
| --- | --- | --- |
| Banco | Python + SQLite | Etapa 03 |
| Autorização, catálogo e assistente | Python + Ollama local | Etapa 04 (corte vertical) |
| API e contratos de dados | Python + FastAPI + Pydantic | Etapa 05 |
| Interface web local | React + TypeScript + Vite, Tailwind, shadcn/ui, TanStack, Recharts | Protótipo pronto; conexão à API na etapa 05 |
| Qualidade de dados (complementar) | Python + SQLite + scikit-learn | Etapas 08–10 |
| Rede corporativa | PostgreSQL, RLS, TLS, identidade corporativa, segmentação | Etapa 07, **somente após o MVP** |

Justificativas e alternativas estão em [Stack e decisões de software](00-decisoes-tecnologicas.md).

Em desenvolvimento, Vite, FastAPI e Ollama ficam restritos ao **loopback 127.0.0.1**. Em uso local, depois do build, o FastAPI pode servir os arquivos React compilados, sem Vite e sem hospedagem externa. O **SQLite não tem porta de rede**. O frontend nunca chama o banco nem o Ollama diretamente.

## 5. Modelo de dados existente

Os arquivos de origem (dataset **v2**, ver [`dataset_info.json`](../../data/dataset_info.json)) são:

| Tabela futura | Arquivo | Chaves ou relacionamentos |
| --- | --- | --- |
| `categorias` | `data/csv/categorias.csv` | `id`, `nome`, `vida_util_meses`, `valor_referencia_centavos` |
| `setores` | `data/csv/setores.csv` | `id`, `codigo`, `nome`, `unidade` |
| `responsaveis` | `data/csv/responsaveis.csv` | `id`, `identificador_ficticio`, `setor_id` → setores |
| `equipamentos` | `data/csv/equipamentos.csv` | `id`, `patrimonio`, `numero_serie`, `categoria_id`, `responsavel_id`, `setor_id`, datas, custo, status |
| `movimentacoes` | `data/csv/movimentacoes.csv` | `id`, `equipamento_id`, `ocorrido_em`, `setor_origem_id`, `setor_destino_id`, `tipo`, `observacao` |
| `chamados` | `data/csv/chamados.csv` | `id`, `equipamento_id`, datas, prioridade, tipo, status, custo, descrição |

**Data de referência:** usar **2026-10-13** nas regras de tempo. Não usar `date.today()` para avaliar o dataset: isso alteraria as respostas ao longo dos anos.

Há **50 anomalias propositalmente inseridas**, descritas apenas no gabarito de avaliação, **sem violar as constraints básicas**: o esquema não deve proibir todas as situações que o detector precisa identificar. A v2 removeu os sinais que permitiam reconhecer as anomalias sem aplicar as regras (IDs contíguos, textos, horários e datas exclusivos). `scripts/dataset/validar_dataset.py` verifica isso.

O conjunto [`data/avaliacao/perguntas_assistente.csv`](../../data/avaliacao/perguntas_assistente.csv) define as perguntas, o usuário fictício, a intenção esperada e o resultado esperado de cada caso de teste do assistente.

## 6. Modelo de ameaças

| Risco | Mitigação planejada | Limitação |
| --- | --- | --- |
| Usuário obtém dados de outro setor pelo assistente | Autorização por papel e escopo no backend, antes da consulta; filtros na própria SQL | Erros de implementação; precisa de testes negativos |
| Prompt injection direta ("ignore as regras", "você é admin") | Política de bloqueio antes da classificação; o LLM não tem ferramentas nem autoridade | Modelo ainda pode gerar texto enganoso |
| Prompt injection indireta (instruções gravadas em campos do banco) | Dados tratados como texto não confiável; nunca promovidos a instrução | Idem |
| Perguntas que tentam modificar o banco | Catálogo de SELECTs, conexão `mode=ro` e `query_only` | Nunca confiar só no prompt |
| Resposta alucinada (número inventado) | Números exibidos vêm do resultado SQL; o LLM só redige; checagem pós-geração dos números citados | O texto pode interpretar mal o resultado |
| Processo local usa o Ollama ou a API em `127.0.0.1` | Ollama sem porta exposta além do loopback; autenticação na API; conta de usuário dedicada | O **Ollama não tem autenticação**: qualquer processo local pode chamá-lo |
| Site malicioso no navegador ataca serviços locais (CSRF, DNS rebinding) | Validar `Host` e `Origin`, sem CORS coringa, token de sessão, sem cookies permissivos | Exige testes específicos |
| Modelo adulterado ou de origem duvidosa | Baixar de fonte oficial, registrar o identificador do modelo (`ollama list`) e a origem, não usar formatos que executam código | Confiança na cadeia do fornecedor |
| Dependência comprometida (npm/PyPI) | Lockfile commitado, `npm ci`, hashes no `requirements`, revisão de atualizações | Ataques ainda não conhecidos |
| Roubo do notebook ou do arquivo SQLite | Cifragem de disco (BitLocker); para dados reais, avaliar SQLCipher ou SGBD com cifragem | Fora do controle da aplicação |
| CSV/formula injection em exportações | Neutralizar células que começam com `=`, `+`, `-` ou `@` (já no protótipo) | Outros formatos (PDF/XLSX) exigem cuidado próprio |
| Vazamento por logs e mensagens de erro | Logs só com IDs, papel, intenção, contagem e resultado; erros genéricos ao cliente | Retenção precisa de política |
| Alteração de backups | SHA-256 com referência confiável separada | Hash local é adulterável junto com o arquivo |
| Manipulação de eventos | HMAC encadeado, com âncora e chave fora do banco | Controle total do computador compromete ambos |
| Tratamento de dados pessoais (LGPD) | MVP só com dados sintéticos. Para dados reais: base legal, minimização, retenção e RIPD/DPIA | Requer análise jurídica da organização |

## 7. Decisões registradas

| Decisão | Situação |
| --- | --- |
| Repositório contém somente código, documentação e dados sintéticos; nunca segredos ou bancos reais | Aplicada (`.gitignore`) |
| `runtime/` é a pasta de trabalho local, ignorada no Git | Aplicada |
| SQLite criado a partir dos CSVs, sem versionar um banco operacional | Registrada (etapa 03) |
| Dataset com data de referência fixa, seed e manifesto SHA-256 | Aplicada (`dataset_info.json`, `MANIFEST.sha256`) |
| React é interface local; FastAPI é o único ponto de acesso ao banco e ao Ollama | Registrada (etapa 05) |
| Autorização por papel fictício no backend desde o MVP | Registrada (etapa 04) |
| Assistente sem operações de escrita e sem SQL arbitrário, inclusive gerado pelo LLM | Registrada (etapa 04) |
| Números da resposta vêm do SQL; o LLM só redige | Registrada (etapa 04) |
| Dependências travadas por lockfile | Aplicada no frontend; backend na etapa 03 |
| Revisão de alertas confirmada manualmente pelo usuário | Registrada (trilha complementar) |
| Cada execução de auditoria tem identificador e versão das regras | Registrada (trilha complementar) |

**Concluído quando:** estas decisões estiverem compreendidas. Próxima etapa: [03 — Ambiente e banco](03-ambiente-e-banco.md).
