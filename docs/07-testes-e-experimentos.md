# 07 — Testes, benchmarks e demonstração reproduzível

**Objetivo:** provar o que o DataGuard AI realiza, evitar alegações exageradas e preparar o projeto para apresentação no GitHub ou em portfólio acadêmico.

**Pré-requisito:** funcionalidades das etapas anteriores que serão avaliadas.

## Passo 1 — Criar suíte de testes

Organizar `tests/` por responsabilidade:

| Arquivo sugerido | O que testar |
| --- | --- |
| `test_schema.py` | Constraints, FKs e importação |
| `test_transactions.py` | Atomicidade, COMMIT e ROLLBACK |
| `test_integrity.py` | PRAGMAs e regras de negócio |
| `test_audit_chain.py` | HMAC, edição e truncamento |
| `test_backups.py` | Snapshot, manifesto e restauração |
| `test_detection.py` | Regras, scores e gabarito |
| `test_queries.py` | Consultas autorizadas e entradas maliciosas |
| `test_offline.py` | Execução sem dependência de rede externa |

Usar `pytest` e bancos temporários. **Nunca executar um teste destrutivo no arquivo real de trabalho**.

## Passo 2 — Matriz essencial de cenários

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| T01 | Patrimônio duplicado | Escrita rejeitada por UNIQUE |
| T02 | Chave estrangeira inexistente | Escrita rejeitada |
| T03 | Preço negativo | Rejeitado por CHECK |
| T04 | Falha durante duas escritas | ROLLBACK completo |
| T05 | SQLite íntegro | `integrity_check` = `ok` |
| T06 | FK inválida em banco de ensaio preparado | `foreign_key_check` acusa |
| T07 | Garantia anterior à compra | Regra de negócio gera evidência |
| T08 | Backup adulterado | SHA-256 diverge |
| T09 | Evento modificado | Cadeia HMAC diverge |
| T10 | Evento final removido | Âncora externa acusa diferença |
| T11 | Restauração temporária | Integridade e contagens conferem |
| T12 | Consulta de inventário em português | Dados e referência corretos |
| T13 | Prompt solicita DELETE/UPDATE | Operação negada, banco intacto |
| T14 | Instrução maliciosa em descrição | Ignorada como comando |
| T15 | Execução offline | Sem tráfego externo necessário |
| T16 | Mesmo dataset/seed/versão | Resultado determinístico equivalente |

**Observação:** o teste T06 exige uma cópia de teste configurada para conter a violação; o banco de origem deve permanecer íntegro.

## Passo 3 — Definir métricas

### Detecção

- TP, FP, FN e TN definidos por **equipamento** e também por **tipo de anomalia**, quando aplicável.
- Precision = TP / (TP + FP).
- Recall = TP / (TP + FN).
- F1 = 2 × precision × recall / (precision + recall).
- Alertas por 1.000 registros e tempo de execução por detector.

Ao usar o gabarito de 50 casos conhecidos, chamar os demais de **não rotulados como anomalia injetada**; não pressupor que são perfeitamente normais. Conferir manualmente alertas adicionais.

### Integridade

- Quantidade de verificações aprovadas, reprovadas e inconclusivas.
- Taxa de detecção de adulterações simuladas.
- Tempo de backup, tamanho do snapshot e resultado da restauração.
- Número de operações indevidas rejeitadas.

### Assistente

- Correção da resposta para perguntas com resposta SQL conhecida.
- Taxa de negação de comandos proibidos.
- Latência mediana e percentis da consulta + geração.
- Consumo de RAM e VRAM durante respostas.

## Passo 4 — Planejar experimentos reproduzíveis

Registrar em JSON/CSV:
- Data do experimento e **data de referência 2026-10-13** para o dataset.
- Hash/versão dos CSVs e versão do schema.
- Código/commit Git, versão das regras e seed.
- Python, SQLite, scikit-learn, Ollama e modelo/quantização.
- Hardware (CPU, GPU, RAM/VRAM, SO).
- Duração e resultado por componente.

Executar comparações úteis:
1. SQL/regras versus Isolation Forest.
2. Isolation Forest isolado versus união com regras.
3. Diferentes limiares **calibrados em validação**.
4. Consultas com e sem geração de texto.
5. Tempo de auditoria/backup sob volumes distintos de **dados sintéticos adicionais**.

Não utilizar o mesmo conjunto final de teste repetidamente para decidir hiperparâmetros; isso pode produzir métricas artificialmente otimistas.

## Passo 5 — Validar confidencialidade e operação offline

Preparar o ambiente com todos os pacotes e pesos baixados. Depois:

- Desconectar internet.
- Iniciar interface, SQLite e Ollama em loopback.
- Executar verificações e perguntas predefinidas.
- Conferir que nenhuma função essencial depende de chamadas externas.
- Verificar ausência de chaves e dados privados em commits/logs.
- Documentar o que precisa de internet **somente na fase de instalação**.

A ausência de tráfego externo ajuda na confidencialidade, mas **não equivale a segurança completa do equipamento**.

## Passo 6 — Preparar apresentação

Produtos finais planejados:
- README com capturas **reais** do app, não mockups apresentados como funcionalidade pronta.
- Diagrama de arquitetura atualizado com os componentes implementados.
- Demonstração reproduzível com dados fictícios.
- Relatórios de testes e benchmarks com limitações.
- Comparação de métodos e discussão de ameaças.
- Lista de funcionalidades concluídas e próximas melhorias.

## Checklist final

- [ ] Instalação reproduzível a partir de ambiente limpo.
- [ ] Todos os testes obrigatórios implementados e executados.
- [ ] Integridade estrutural, referencial e de negócio distinguida.
- [ ] HMAC/hash verificável com referência independente no cenário de teste.
- [ ] Detector não depende do gabarito em inferência.
- [ ] Assistente não escreve no banco.
- [ ] Fluxos essenciais funcionam offline.
- [ ] Métricas e limitações aparecem no repositório.
- [ ] Nenhuma evidência, dado real ou segredo foi exposto.

**Ao concluir:** atualizar o [README principal](../README.md), substituindo a arquitetura planejada por capturas reais e uma descrição clara do que está implementado.
