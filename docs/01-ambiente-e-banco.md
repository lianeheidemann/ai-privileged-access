# 01 — Preparar o ambiente e criar o SQLite

**Objetivo:** construir uma base sintética de teste para uma futura solução de **IA privada empresarial**, sem utilizar nem copiar bancos reais de organizações. Transformar os seis CSVs já existentes em SQLite com relações e tipos definidos. **Nesta etapa, não há IA nem interface gráfica.**

**Entrada:** `data/csv/*.csv` (dataset **v2**). **Saída esperada:** `runtime/databases/inventario.db` e testes de importação.

**Decisão técnica:** nesta etapa, **Python + biblioteca padrão sqlite3** são suficientes. A interface **React + TypeScript + Vite** e a API **FastAPI** só serão implementadas na [etapa 03](03-interface-e-relatorios.md). Separar desde já a persistência da apresentação para não misturar código de UI com consultas SQL.

## Decisão sobre o banco de dados empresarial

**Não é necessário alterar os seis CSVs nem as seis tabelas de domínio agora.** O inventário é um *fixture* sintético de validação; não deve ser apresentado como esquema universal de bancos empresariais. Para a implantação real, não substituir nem migrar automaticamente o banco da empresa: planejar **conector de leitura**, usuário de banco dedicado com permissões mínimas e **visões autorizadas**. PostgreSQL é uma opção para o laboratório de rede da etapa 05, não uma exigência para todos os clientes.

Separar conceitualmente **banco de origem** (dados empresariais, mantidos sob controle da organização) e **banco operacional do DataGuard AI** (configuração, execução, resultados e auditoria, com retenção mínima). Nunca copiar uma base completa para inferência por conveniência.

**Evoluções de metadados a planejar, sem criar agora:** `fontes_dados` (identificador lógico, tipo de SGBD, endpoint interno referenciado sem segredo), `politicas_acesso` (perfil, fonte, conjunto autorizado), `consultas_permitidas` (ID, versão, parâmetros e limites), `execucoes_consulta` (quem, quando, finalidade, status, volume, sem SQL sensível), `politicas_retencao` e `versoes_conectores`. Não armazenar senhas em tabelas; usar mecanismo de segredos da implantação.

## Passo 0 — Validar o dataset antes de importar

```powershell
# Confere contagens, chaves, gabarito, vazamento de rótulos e hashes do manifesto
python scripts/dataset/validar_dataset.py
```

O resultado deve terminar em `0 falha(s)`. Se algum hash divergir, os CSVs foram alterados: não importe até entender a mudança. Arquivos de dados usam LF (`.gitattributes`). Se o Git estiver configurado com `core.autocrlf=true` e os hashes falharem, faça um novo checkout dos arquivos de `data/`.

## Passo 1 — Preparar o Python no Windows

Criar um ambiente virtual na raiz do repositório:

```powershell
# Cria e ativa um ambiente virtual local em PowerShell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
```

Se a execução de scripts estiver bloqueada, use o Python diretamente pelo caminho `.venv\Scripts\python.exe` ou ajuste a política **somente no escopo apropriado**. O projeto usa SQLite pela biblioteca padrão. **Não é necessário instalar Node.js, React, Tailwind ou FastAPI para executar esta etapa.**

Arquivos a criar nesta etapa:
- `pyproject.toml` — metadados (Python ≥ 3.10; alvo 3.12 ou superior, ver [Decisões tecnológicas](decisoes-tecnologicas.md#versões)) e dependência de `pytest` com versão fixada. Gere os hashes (`pip install --require-hashes`) quando as dependências crescerem.
- O `.gitignore` da raiz já ignora `.venv/`, `__pycache__/`, `runtime/`, `.env`, chaves e `*.db`/`*.sqlite3`. Revise-o, mas não o recrie.
- `src/dataguard/db/schema.sql` — criação das tabelas.
- `src/dataguard/db/connection.py` — conexão configurada.
- `src/dataguard/db/import_csv.py` — importador idempotente ou recriação explícita.
- `tests/test_database.py` — testes do esquema, importação e FKs.

## Passo 2 — Conferir os CSVs de origem

Os dados já estão em `data/csv/`. Conferir os cabeçalhos reais antes de definir o esquema:

| Tabela | Registros esperados | Observação |
| --- | ---: | --- |
| categorias | 12 | Preços de referência em **centavos** |
| setores | 18 | Identificadores de setor |
| responsaveis | 90 | `setor_id` obrigatório |
| equipamentos | 750 | `responsavel_id` e `data_descarte` podem estar vazios |
| movimentacoes | 2.095 | Vínculo ao equipamento e aos setores |
| chamados | 1.196 | `encerrado_em` pode estar vazio |

**Total esperado:** 4.161 registros de dados (não inclui gabarito). Arquivos CSV usam cabeçalho.

## Passo 3 — Projetar as tabelas e constraints

Definir tipos e relações correspondentes aos CSVs, preservando todos os campos.

**Constraints mínimas sugeridas:**
- `id INTEGER PRIMARY KEY` em cada tabela.
- `categorias.nome`, `setores.codigo`, `equipamentos.patrimonio` únicos.
- FKs de `responsaveis.setor_id`, `equipamentos.categoria_id`, `equipamentos.responsavel_id`, `equipamentos.setor_id`, `movimentacoes.equipamento_id`, seus setores e `chamados.equipamento_id`.
- `preco_centavos >= 0` e `custo_reparo_centavos >= 0` por `CHECK`.
- Campos obrigatórios de acordo com os valores existentes. Usar `NULL` nos campos opcionais, não string vazia.
- Índices nas FKs e datas consultadas com frequência.

**Não criar `CHECK(garantia_fim >= data_aquisicao)` nem `CHECK(data_aquisicao <= hoje)` neste banco de experimentos.** Essas situações fazem parte das anomalias sintéticas e devem entrar na fase de regras de negócio.

Exemplo de configuração da conexão:

```python
# Abre o SQLite habilitando validação de chaves estrangeiras em cada conexão
import sqlite3

con = sqlite3.connect("runtime/databases/inventario.db")
con.execute("PRAGMA foreign_keys = ON")
assert con.execute("PRAGMA foreign_keys").fetchone()[0] == 1
```

Ative `foreign_keys` **antes de começar qualquer transação**. Evite `executescript` dentro de uma transação de importação que deva ser totalmente atômica, pois ele pode efetuar um COMMIT pendente.

## Passo 4 — Criar o importador

Importar usando a biblioteca `csv` ou `pandas`, em ordem de dependência:

1. `categorias`
2. `setores`
3. `responsaveis`
4. `equipamentos`
5. `movimentacoes`
6. `chamados`

Regras para o importador:
- Executar a criação do schema **antes** da carga de dados.
- Converter identificadores e valores monetários para inteiro.
- Converter campo CSV vazio para `None` quando a coluna for opcional.
- Preservar textos e datas originais; guardar datas em formato ISO 8601.
- Usar comandos SQL com placeholders `?`.
- Fazer a carga de dados em **uma transação**: falha em uma tabela deve fazer `ROLLBACK`.
- Oferecer opção explícita para recriar somente um **banco de testes**, não apagar bancos de usuários automaticamente.
- Não carregar `data/ground_truth/gabarito_anomalias.csv` na base operacional.

## Passo 5 — Verificar os resultados

Rodar as seguintes consultas no banco já importado:

```sql
-- Confere a quantidade de registros em tabelas principais
SELECT COUNT(*) FROM categorias;     -- 12
SELECT COUNT(*) FROM setores;        -- 18
SELECT COUNT(*) FROM responsaveis;   -- 90
SELECT COUNT(*) FROM equipamentos;   -- 750
SELECT COUNT(*) FROM movimentacoes;  -- 2095
SELECT COUNT(*) FROM chamados;       -- 1196
```

E verificar a integridade referencial:

```sql
-- Não deve retornar linhas se todas as chaves estrangeiras estiverem válidas
PRAGMA foreign_key_check;
```

### Testes a implementar

- [ ] Tabelas e índices criados.
- [ ] Contagens de todas as tabelas conferidas.
- [ ] Relações `equipamentos → categorias`, `equipamentos → setores`, `movimentacoes → equipamentos` e `chamados → equipamentos` válidas.
- [ ] Opções vazias importadas como `NULL`.
- [ ] Mesmo script reproduz o banco a partir dos CSVs sem duplicar linhas.
- [ ] Importação interrompida não deixa carga parcial.
- [ ] Gabarito e perguntas de avaliação não aparecem entre as tabelas operacionais.
- [ ] Teste chama `validar_dataset.py` (ou suas funções) antes da importação.

**Critério de aceite:** `validar_dataset.py` sem falhas; o banco SQLite é construído localmente e reproduz os 4.161 registros, com `foreign_key_check` vazio.

**Próxima etapa (trilha principal):** [02 — Assistente local](02-assistente-local.md), corte vertical com papéis, catálogo e Ollama. **Trilha complementar:** [06 — Integridade e transações](06-integridade-e-transacoes.md). O futuro FastAPI deverá reutilizar estas funções de banco, sem duplicar a lógica de persistência.
