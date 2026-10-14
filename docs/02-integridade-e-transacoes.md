# 02 — Integridade, transações e regras de negócio

> **Trilha complementar (qualidade dos dados).** Esta etapa não bloqueia a trilha principal de segurança da IA local (00 → 01 → 05 → 06 → 07). Ela pode ser feita em paralelo ou depois do corte vertical da [etapa 05](05-assistente-local.md).

**Objetivo:** impedir operações inválidas no banco sintético, detectar inconsistências e registrar resultados verificáveis. No cenário empresarial, **o DataGuard AI não deve executar alterações no banco de origem**; usar consultas e verificações somente leitura. **Não integrar IA nesta etapa.**

**Pré-requisito:** [etapa 01](01-ambiente-e-banco.md) concluída.

**Fronteira de acesso:** separar o banco de testes (onde constraints e transações podem ser exercitadas) da fonte empresarial (somente leitura e permissões mínimas). Nenhum teste destrutivo, `PRAGMA` de manutenção ou escrita deve ser executado em produção. Validar privilégios também no SGBD, não apenas no código Python.

## Passo 1 — Criar o serviço de verificação

Arquivos sugeridos:
- `src/dataguard/integrity/sqlite_checks.py`
- `src/dataguard/integrity/business_rules.py`
- `src/dataguard/integrity/models.py` (estrutura de achados)
- `tests/test_integrity.py`
- `tests/test_transactions.py`

O resultado de cada verificação deve conter:
`check_id`, `status` (`pass`, `fail`, `warning`, `error`), `executed_at_utc`, `record_ids`, `evidence`, `details` e `ruleset_version`.

**Diferenciar:** `fail` é violação confirmada; `warning` é suspeita; `error` significa que a verificação não pôde ser concluída. Erro de execução não equivale a integridade aprovada.

## Passo 2 — Rodar as checagens nativas

```sql
-- Verifica consistência estrutural e violações de chaves estrangeiras do SQLite
PRAGMA integrity_check;
PRAGMA foreign_key_check;
```

**Aceite:** `integrity_check` responde `ok` no banco íntegro e `foreign_key_check` não retorna linhas.

**Importante:** `integrity_check` não substitui `foreign_key_check` e nenhum dos dois entende regras como "uma movimentação ocorreu depois do descarte".

## Passo 3 — Testar constraints

Criar testes que tentem:
1. Inserir `patrimonio` duplicado → erro de unicidade.
2. Inserir responsável com `setor_id` inexistente → erro de FK.
3. Inserir equipamento com `preco_centavos < 0` → erro de `CHECK`.
4. Inserir `NULL` em coluna obrigatória → erro de `NOT NULL`.

Executar cada teste em **banco temporário ou transação revertida**; nunca modificar os CSVs versionados para simular falhas.

## Passo 4 — Implementar e demonstrar transações

Criar uma operação experimental com **duas escritas relacionadas**, por exemplo inserir uma movimentação e atualizar o setor atual do equipamento.

- Se as duas escritas ocorrerem: `COMMIT`.
- Se a segunda falhar: `ROLLBACK` da primeira.
- Capturar o erro com exceção e repropagá-lo para o teste.
- Executar com `foreign_keys=ON`, habilitado antes de iniciar a transação.

Exemplo de intenção do teste:

```text
# Demonstra o comportamento atômico esperado no teste de transação
estado_inicial -> (INSERIR movimentacao + ATUALIZAR equipamento)
falha_controlada_na_segunda_etapa -> ROLLBACK
estado_final == estado_inicial
```

**Aceite:** após falha controlada, o banco fica idêntico ao estado inicial para as linhas envolvidas.

## Passo 5 — Regras de negócio e achados explicáveis

Separar da camada de constraints as regras que devem ser **detectadas** no dataset:

| ID | Regra | Evidência |
| --- | --- | --- |
| R01 | `data_aquisicao > 2026-10-13` | Data de aquisição |
| R02 | `garantia_fim < data_aquisicao` | Duas datas |
| R03 | Movimentação posterior a `data_descarte` | Datas e ID da movimentação |
| R04 | Chamado ainda aberto há mais de 365 dias na data de referência | Datas e status |
| R05 | Pelo menos 14 movimentações em uma janela móvel de 30 dias | Quantidade, intervalo e IDs |
| R06 | Pelo menos seis chamados (qualquer tipo de problema) em uma janela móvel de 30 dias | Quantidade, intervalo e IDs |
| R07 | Preço muito superior ao valor de referência da categoria (limiar parametrizável) | Valores em centavos e razão |

**Não chamar R07 de corrupção comprovada:** é um indicador a revisar. Não colocar a resposta do gabarito na lógica de detecção; derivar regras do domínio, parâmetros e observações. `scripts/dataset/comum.py` contém uma versão de referência dessas regras **usada só para validar o dataset**; implemente o verificador de forma independente e compare os resultados nos testes.

Para regras de janela temporal, verificar intervalos móveis reais (não apenas mês do calendário). Para R03, comparar timestamps da movimentação com a data de descarte mediante convenção documentada de horário. Para R04, usar a **data de referência fixa** do dataset.

## Passo 6 — Gerar uma execução de auditoria

A execução deve ter:
- ID único.
- Momento de início e fim em UTC.
- Versão do esquema e das regras.
- Quantidade de registros avaliados.
- Lista de achados com justificativa e IDs de origem.
- Resultado final `pass`/`warnings`/`fail`/`error`.

Gravar resultados inicialmente como JSON em `runtime/reports/`, ignorado no Git. O mecanismo criptográfico virá na etapa 03.

### Critérios para concluir

- [ ] Constraints comprovadas por testes.
- [ ] `integrity_check` e `foreign_key_check` funcionando.
- [ ] Teste de `COMMIT` e de `ROLLBACK`.
- [ ] Pelo menos R01, R02, R03 e R07 implementadas com evidências.
- [ ] Falha de auditoria retorna estado `error`, nunca "tudo íntegro".
- [ ] Execução gera relatório JSON reproduzível e sem LLM.

**Próxima etapa da trilha complementar:** [03 — Auditoria e backups](03-auditoria-e-backups.md).
