# 00 — Arquitetura, escopo e decisões

**Objetivo:** definir a arquitetura de uma **IA privada para agilizar processos cotidianos de tratamento de dados**, com consultas autorizadas, organização de resultados, apoio a análises e relatórios. A inferência permanece na infraestrutura controlada; o inventário sintético é apenas o primeiro caso de validação.

**Pré-requisito:** nenhum. **Não implementar código nesta etapa.**

## 1. O problema que o projeto resolve

A solução deverá conectar-se de forma controlada a uma fonte de dados interna, executar consultas permitidas e análises reproduzíveis sem enviar registros a provedores externos. O protótipo começa com banco local e dados sintéticos; a integração corporativa será posterior. O MVP usará **React + TypeScript em um navegador local**, conectado por **FastAPI** aos serviços Python. O conjunto inicial retrata um inventário **inteiramente fictício**.

Separar quatro conceitos:

| Conceito | Pergunta | Como verificar |
| --- | --- | --- |
| Integridade estrutural | O arquivo SQLite e suas páginas estão consistentes? | `PRAGMA integrity_check` |
| Integridade referencial | Existem referências para registros inexistentes? | `PRAGMA foreign_key_check` |
| Regras de negócio | Existem datas, estados ou operações logicamente incoerentes? | Consultas SQL/Python |
| Anomalia estatística | Algo é incomum em relação aos demais registros? | Estatísticas e ML |

**Integridade criptográfica** é outra dimensão: validar que uma cópia ou evidência não mudou **desde uma referência confiável**. Isso não prova que seu conteúdo era correto quando a referência foi criada.

## 2. Requisitos empresariais de segurança desde o início

- Definir **fronteiras de confiança** entre navegador, API, inferência e banco, com matriz de fluxos autorizados.
- Bloquear **tráfego de saída por padrão** durante a operação; registrar exceções justificadas e testar DNS, HTTP(S), telemetria e atualizações automáticas.
- Diferenciar API **interna** (FastAPI/Ollama) de API **externa**: proibir chamadas a provedores de inferência em nuvem.
- Planejar autenticação, autorização por papel e por conjunto de dados, consultas de leitura mínima e isolamento de credenciais.
- Não encaminhar tabelas inteiras ao LLM; limitar campos, linhas e conteúdo retornado.
- Proteger logs, backups, relatórios, prompts e respostas contra exposição de dados sensíveis.
- Definir modelo de ameaça incluindo cliente comprometido, acesso lateral na LAN, injeção de prompt, credenciais vazadas e exfiltração por exportação.
- Validar segurança com testes negativos, monitoramento de conexões e revisão de permissões. **Nenhuma topologia garante vazamento zero.**

A implantação com PostgreSQL, segmentação e TLS ocorrerá na [etapa 08](08-arquitetura-de-rede-e-seguranca.md), mas estes requisitos devem influenciar o MVP desde agora.

## 3. Escopo inicial e limites

**Fazer:**
- Banco SQLite local gerado a partir dos seis CSVs versionados.
- Verificador de constraints, PRAGMAs, transações e regras de domínio.
- Trilha de eventos, backups e hashes com referências separadas.
- Detecção de padrões incomuns; primeiro com regras, depois com Isolation Forest.
- Assistente com perguntas em português e **consultas previamente autorizadas**.
- Dashboard, relatório exportável e experimentos reprodutíveis.

**Não fazer agora:**
- Login, cloud, múltiplos usuários, dados empresariais reais.
- Treinar LLM, criar endpoints públicos ou permitir edição pelo assistente.
- Permitir SQL livre ou restauração destrutiva com um clique.
- Considerar todo alerta como um problema confirmado, sem validação adicional.

## 3. Princípios de arquitetura

~~~mermaid
flowchart TD
    U["Navegador local"] --> R["React + TypeScript · Vite (dev)"]
    R -->|"/api"| F["FastAPI · Python"]
    F --> S["Serviços Python"]
    S --> I["Verificações determinísticas"]
    S --> A["Detector de anomalias"]
    S --> Q["Consultas autorizadas em leitura"]
    I --> DB[("SQLite local")]
    A --> DB
    Q --> DB
    Q --> LLM["Ollama · LLM local"]
    S --> E["Logs, backups e manifestos"]
~~~

1. **O banco é a fonte de fatos; o LLM não é.**
2. **Leitura e escrita são serviços distintos.** A interface de perguntas não ganha credenciais de escrita.
3. **Confirmação, suspeita e explicação são saídas diferentes.**
4. **Os dados de teste precisam permanecer auditáveis.** Gabarito separado e semente fixa.
5. **A aplicação funciona offline após o preparo.** Não enviar prompts nem arquivos a provedores externos.
6. **Toda ação relevante produz um resultado testável.**

### 3.1 — Tecnologias e limites da rede local

| Camada | Tecnologia definida | Quando implementar |
| --- | --- | --- |
| Banco e verificações | Python + SQLite | Etapas 01–04 |
| Assistente | Python + Ollama local | Etapa 05 |
| API e contratos de dados | Python + FastAPI + Pydantic | Etapa 06 |
| Interface web local | React + TypeScript + Vite | Etapa 06 |
| Estilo e componentes | Tailwind CSS, shadcn/ui, Lucide React | Etapa 06 |
| Gráficos e tabelas | Recharts, TanStack Table e TanStack Query | Etapa 06 |
| Rede corporativa | PostgreSQL, TLS, autorização e segmentação | Etapa 08, **somente após o MVP** |

Em desenvolvimento, Vite, FastAPI e Ollama estarão restritos ao **loopback 127.0.0.1**. Em uso local após o build, o FastAPI poderá servir os arquivos React compilados, sem Vite nem hospedagem externa. O **SQLite não tem porta de rede**; o frontend não deve chamar o banco nem o Ollama diretamente.

Ver as etapas [06 — Interface](06-interface-e-relatorios.md) e [08 — Rede](08-arquitetura-de-rede-e-seguranca.md).

## 4. Modelo de dados existente

Os arquivos reais de origem são:

| Tabela futura | Arquivo | Chaves ou relacionamentos |
| --- | --- | --- |
| `categorias` | `data/csv/categorias.csv` | `id`, `nome`, `vida_util_meses`, `valor_referencia_centavos` |
| `setores` | `data/csv/setores.csv` | `id`, `codigo`, `nome`, `unidade` |
| `responsaveis` | `data/csv/responsaveis.csv` | `id`, `identificador_ficticio`, `setor_id` → setores |
| `equipamentos` | `data/csv/equipamentos.csv` | `id`, `patrimonio`, `numero_serie`, `categoria_id`, `responsavel_id`, `setor_id`, datas, custo, status |
| `movimentacoes` | `data/csv/movimentacoes.csv` | `id`, `equipamento_id`, `ocorrido_em`, `setor_origem_id`, `setor_destino_id`, `tipo`, `observacao` |
| `chamados` | `data/csv/chamados.csv` | `id`, `equipamento_id`, datas, prioridade, tipo, status, custo, descrição |

**Datas de referência:** usar **2026-10-13** nas regras de tempo. Não usar `date.today()` para avaliar as anomalias originais: isso altera as respostas ao longo dos anos.

Há **50 anomalias propositalmente inseridas**, descritas apenas no gabarito de avaliação. São anomalias **sem violar as constraints básicas**: o esquema não deve proibir todas as situações que o detector precisa identificar.

## 5. Modelo de ameaças simplificado

| Risco | Mitigação planejada | Limitação |
| --- | --- | --- |
| Registros inválidos | Constraints, transações e checagens de domínio | Não capturam todas as incoerências semânticas |
| Alteração de arquivos de backup | SHA-256 + referência confiável separada | Hash local adulterável junto ao arquivo |
| Manipulação de eventos | HMAC encadeado + âncora e chave fora do banco | Controle total do computador compromete ambos |
| Instruções maliciosas dentro do banco | Separar dados de instruções e limitar ferramentas do LLM | Modelo pode gerar texto enganoso |
| Perguntas que tentam modificar o banco | Catálogo de SELECTs + conexão SQLite de leitura | Nunca confiar só no prompt |
| Exposição de dados | Loopback local, nenhuma nuvem, dados fictícios | Offline não substitui controles de acesso ao PC |

## 6. Decisões a registrar antes de codificar

- [ ] Repositório permanece privado durante o desenvolvimento; se a visibilidade mudar, somente código e dados sintéticos podem ser públicos, nunca segredos ou bancos empresariais.
- [ ] Pasta de trabalho local: `runtime/`, ignorada no Git.
- [ ] SQLite criado a partir de CSVs, sem versionar um banco operacional.
- [ ] React é interface local e FastAPI é o único ponto de acesso ao banco e ao Ollama.
- [ ] Dataset tem data de referência fixa.
- [ ] Assistente sem operações de escrita e sem SQL arbitrário.
- [ ] O usuário da aplicação confirma manualmente revisões de alertas.
- [ ] Cada execução de auditoria terá identificador e versão das regras.

**Concluído quando:** essas decisões estiverem compreendidas e registradas. Próxima etapa: [01 — Ambiente e banco](01-ambiente-e-banco.md).
