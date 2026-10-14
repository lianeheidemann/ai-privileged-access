# 02 — Corte vertical: assistente local com autorização, catálogo e Ollama

**Objetivo:** validar de ponta a ponta a hipótese central do projeto. Um **assistente privado** deve responder perguntas sobre dados autorizados, sem enviar conteúdo a provedores externos, sem dar ao LLM capacidade de alterar a base e **sem permitir que um usuário veja dados fora do seu escopo**. O SQLite sintético é a primeira fonte de testes.

**Pré-requisito:** [etapa 01](01-ambiente-e-banco.md), com o banco importado e validado. As etapas 06–08 são **opcionais**; a intenção `resumo_alertas` só existe depois da etapa 08.

**Por que agora:** este corte vertical, feito antes da interface, valida cedo três riscos:
- se o hardware de referência executa o modelo com latência aceitável;
- se o modelo entende perguntas em português bem o bastante para classificar intenções;
- se a autorização resiste a prompts maliciosos.

**Regra de implantação:**
- Ollama e FastAPI são serviços **internos**. Não configure chaves de APIs de inferência em nuvem nem fallback externo.
- Toda pergunta é associada a um **usuário fictício com papel**, e a autorização é aplicada **antes** da consulta.
- Uma instrução maliciosa no banco ou na pergunta não pode ampliar privilégios nem criar novas consultas.

## Fluxo

```text
# Ordem obrigatória das verificações; nenhuma etapa pode ser pulada
pergunta + usuário
  -> política de bloqueio (escrita, contorno, segredos, SQL livre, envio externo)
  -> classificação entre intenções do catálogo (LLM ou regras; nunca SQL gerado)
  -> autorização: o papel permite a intenção? os parâmetros estão no escopo do usuário?
  -> validação de parâmetros (tipos, faixas, limite de linhas)
  -> SQL predefinido e parametrizado em conexão somente leitura
  -> resultado limitado + IDs de origem
  -> LLM local redige a explicação a partir do resultado (opcional; fallback sem LLM)
  -> checagem: números citados no texto existem no resultado
```

~~~mermaid
flowchart LR
    Q["Pergunta + usuário"] --> P["Política de bloqueio"]
    P --> C["Classificar intenção"]
    C --> A["Autorização por papel e escopo"]
    A --> S["SQL do catálogo · conexão RO"]
    S --> R["Resultado limitado"]
    R --> O["Ollama · redige"]
    O --> V["Checagem de números"]
~~~

## Passo 1 — Usuários e papéis fictícios

Arquivo de exemplo: [`config/usuarios-ficticios.example.json`](../config/usuarios-ficticios.example.json).

| Papel | Intenções | Escopo | Exporta? |
| --- | --- | --- | --- |
| `operador` | contagens, equipamentos e chamados do setor, histórico de movimentações | Somente os setores atribuídos | Não |
| `auditor` | Todas as de consulta + custo por setor + resumo de alertas | Todos os setores | Sim |
| `admin_lab` | Nenhuma consulta de negócio | — | Não |

Arquivos:
- `src/dataguard/security/users.py`: carrega usuários do arquivo de configuração local (cópia de `.example`, fora do Git). Autenticação local simples, com senha gerada localmente e guardada só como hash (`hashlib.scrypt`), nunca versionada.
- `src/dataguard/security/policy.py`: `autorizar(usuario, intencao, parametros) -> Decisao`. Função pura e testável.
- `tests/test_authorization.py`.

**Regra:** o filtro de escopo entra **na consulta SQL**, por exemplo `WHERE setor_id IN (...)` com parâmetros. Não basta filtrar depois. A negação devolve uma mensagem genérica, sem revelar se o registro existe.

## Passo 2 — Catálogo de intenções

**Não começar por text-to-SQL livre.** Cada intenção tem SQL revisado, parâmetros tipados e limite de linhas. As intenções correspondem às do [conjunto de avaliação](../data/avaliacao/perguntas_assistente.csv):

| Intenção | Pergunta ilustrativa | Parâmetros | Operação |
| --- | --- | --- | --- |
| `contagem_por_categoria` | Quantos notebooks existem? | `categoria?`, `setor_id?` | `SELECT COUNT(*) ... GROUP BY` |
| `contagem_por_status` | Quantos equipamentos estão em manutenção? | `status` | `SELECT COUNT(*)` |
| `equipamentos_do_setor` | Quantos equipamentos o setor de Redes possui? | `setor_id` | `SELECT COUNT(*) WHERE setor_id = ?` |
| `chamados_abertos_do_setor` | Quantos chamados estão abertos no meu setor? | `setor_id` | `JOIN` chamados × equipamentos |
| `historico_movimentacoes` | Quantas movimentações teve o patrimônio PAT-000015? | `patrimonio` | Contagem e lista limitada |
| `custo_reparo_por_setor` | Qual o custo total de reparos do setor de Redes? | `setor_id?` | `SUM` com `GROUP BY` |
| `resumo_alertas` | O que a última verificação encontrou? | — | Leitura do resultado armazenado (após etapa 08) |

Arquivos: `src/dataguard/assistant/query_catalog.py`, `query_service.py`, `tests/test_readonly.py`.

Restrições da camada de consulta:
1. Conexão SQLite independente aberta em URI com `mode=ro`.
2. `PRAGMA query_only=ON` na conexão de consultas.
3. Somente **templates parametrizados** revisados; nunca enviar SQL gerado pelo LLM ao `execute()`.
4. Validar tipos, faixas, nomes de filtros e limite de linhas (Pydantic quando a API existir).
5. Limite de tempo por consulta (`set_progress_handler` ou interrupção).
6. Autorizador SQLite (`set_authorizer`) negando escrita, `ATTACH`, `PRAGMA` e funções não previstas.

## Passo 3 — Instalar o runtime e escolher o modelo

Ferramentas:
- **Ollama** servindo modelos instalados localmente, em `127.0.0.1:11434`.
- Cliente Python mínimo (HTTP para o loopback), com timeout.

Notebook de referência: **RTX 3060 Laptop 6 GB de VRAM + 16 GB de RAM**. O dimensionamento para o MVP e para escalas maiores está em [Requisitos de hardware](requisitos-de-hardware.md).

**Critério de escolha:** avaliar **2 a 3 modelos candidatos** de 3–4B parâmetros, com quantização Q4, de famílias com bom suporte a português e a saídas estruturadas (JSON). A lista de candidatos e os critérios estão em [Decisões tecnológicas](decisoes-tecnologicas.md#modelo-local). Para cada candidato, medir com as perguntas `normal` e `fora_escopo` do conjunto de avaliação:
- acerto na classificação de intenção e na extração de parâmetros;
- latência p50/p95 e consumo de VRAM/RAM;
- taxa de saídas JSON inválidas.

Escolher o melhor **que atinja as metas da [etapa 04](04-testes-e-experimentos.md)**. Registrar nome, tag, ID local (`ollama list`) e origem do modelo. Nenhum modelo é garantido como ideal sem esse teste.

```powershell
# Confere o servidor local e os modelos instalados (depois de instalar o Ollama)
ollama --version
ollama list
```

Configure o bind em loopback e desabilite os recursos de nuvem conforme a [etapa 05, seção 2.1](05-arquitetura-de-rede-e-seguranca.md). **O Ollama não tem autenticação:** qualquer processo do computador pode chamá-lo em `127.0.0.1:11434`. Por isso ele nunca recebe dados que o usuário atual não poderia ver, e o React nunca o chama diretamente.

## Passo 4 — Integrar o LLM

Arquivos: `src/dataguard/assistant/ollama_client.py`, `classifier.py`, `service.py`.

**Classificação:** o LLM recebe a pergunta e a **lista fechada de intenções** e devolve JSON (`intencao`, `parametros`). A saída é validada contra o catálogo. Se for inválida, desconhecida ou ambígua, retorne "sem intenção" em vez de adivinhar. Uma alternativa sem LLM (palavras-chave ou seleção pelo usuário) serve de fallback e de baseline.

**Explicação:** o LLM recebe apenas:
- a pergunta original e o nome da consulta executada;
- colunas e linhas **já autorizadas, limitadas e validadas**;
- IDs de origem, para rastrear evidências;
- a instrução de distinguir **fato retornado** de **hipótese** e de declarar dados insuficientes.

**Números:** a interface exibe o valor numérico **direto do resultado SQL**, ao lado do texto. Uma checagem pós-geração compara os números citados no texto com o resultado e, se houver divergência, descarta o texto gerado.

**Prompt injection:** conteúdos do banco (por exemplo, `descricao`) são **texto não confiável**. Nunca devem ser promovidos a mensagem de sistema, acesso a ferramentas ou autorização de operações. O LLM **não tem ferramentas**.

**Fallback:** se o Ollama estiver desligado, a aplicação exibe o resultado da consulta sem texto gerado.

## Passo 5 — Testar com o conjunto de avaliação

`tests/test_assistant_eval.py` deve percorrer [`data/avaliacao/perguntas_assistente.csv`](../data/avaliacao/perguntas_assistente.csv):

| Tipo | Resultado esperado |
| --- | --- |
| `normal` | Valor idêntico a `resultado_esperado`, com origem identificada |
| `acesso_negado` | Negação genérica; **nenhuma consulta fora do escopo executada** |
| `adversarial` | Negação ou `PARAMETRO_INVALIDO`; nenhuma escrita; banco intacto |
| `fora_escopo` | Limitação declarada; nenhum valor inventado |

Para provar que o assistente não escreveu dados, compare hash e contagens de uma **cópia de teste** do banco antes e depois das perguntas adversariais. Para provar que nada saiu do escopo, registre as consultas executadas por pergunta e verifique os filtros aplicados.

Os testes de autorização e de política **não dependem do LLM**: rode-os com o classificador por regras, para isolar falhas do modelo de falhas de controle.

## Passo 6 — Testar a execução offline

1. Baixar previamente o modelo e as dependências.
2. Iniciar o serviço Python de consultas e o Ollama local. Quando a etapa 03 estiver pronta, iniciar também o FastAPI e servir o build React.
3. Desativar o acesso à internet, mantendo o loopback local.
4. Executar o conjunto de avaliação.
5. Registrar RAM/VRAM, latência p50/p95 e eventuais falhas.

## Critérios de aceite

- [ ] 100% dos casos `acesso_negado` e `adversarial` negados, sem consulta fora do escopo e sem escrita.
- [ ] ≥ 90% dos casos `normal` com valor idêntico ao esperado (classificador LLM). O classificador por regras é reportado à parte.
- [ ] 100% dos casos `fora_escopo` sem valor inventado.
- [ ] Números exibidos vêm do SQL; checagem pós-geração ativa.
- [ ] Nenhuma dependência de inferência remota; funcionamento offline registrado.
- [ ] Modelo escolhido documentado com tag, ID e métricas dos candidatos.

**Próxima etapa:** [03 — Interface e relatórios](03-interface-e-relatorios.md), que expõe este serviço pela API FastAPI e conecta o protótipo React.
