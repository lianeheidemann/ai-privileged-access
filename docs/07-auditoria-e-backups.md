# 07 — Auditoria, hashes e backups consistentes

> **Trilha complementar (qualidade dos dados).** Esta etapa não bloqueia a trilha principal de segurança da IA local (00 → 01 → 02 → 03 → 04). Ela pode ser feita em paralelo ou depois do corte vertical da [etapa 02](02-assistente-local.md).

**Objetivo:** registrar operações e acessos do **DataGuard AI**, produzir evidências e verificar/restaurar backups **sem destruir o banco principal**. O sistema não substitui o mecanismo corporativo de backup nem deve assumir permissão de escrita no banco de origem.

**Pré-requisito:** [etapa 06](06-integridade-e-transacoes.md).

**Confidencialidade empresarial:** logs de prompts, consultas, erros, respostas, exports e backups podem conter dados sigilosos. Registrar por padrão apenas IDs, identidades autorizadas, contagens, resultados e timestamps; aplicar mascaramento, retenção limitada, criptografia conforme a política da organização e controle de acesso aos arquivos. Não usar logs de aplicação como cópia de dados do cliente.

## 1. Separar as garantias

| Mecanismo | O que demonstra | O que NÃO demonstra |
| --- | --- | --- |
| Restrições SQLite | Escritas respeitam regras estruturais | Registros fazem sentido para o negócio |
| Transações | Operações confirmam ou falham em conjunto | Mudança foi autorizada |
| SHA-256 de backup | Arquivo corresponde a um hash conhecido | Origem era correta ou alteração foi autorizada |
| HMAC de eventos | Evento corresponde a uma chave e cadeia de referência | Impossibilidade de ataque com a chave comprometida |
| Cópia em local separado | Facilita recuperação | Garantia contra comprometimento de todo o PC |

## Passo 1 — Planejar a trilha de eventos

Adicionar, em migration, tabelas como `eventos_auditoria` e `execucoes_auditoria`, mantendo os dados sintéticos intactos.

Campos recomendados de evento:
`event_id`, `sequence`, `occurred_at_utc`, `entity`, `entity_id`, `operation`, `old_data_json`, `new_data_json`, `previous_mac`, `event_mac`, `format_version`.

- Registrar autor/origem de operação quando disponível; sem inventar identidade.
- Padronizar serialização JSON (ordem de chaves, UTF-8, datas UTC, formato versionado).
- Registrar dados mínimos necessários, evitando duplicar informações confidenciais.
- O serviço de gravação deve persistir a alteração do domínio e o registro do evento **atomicamente**.
- **HMAC usa segredo fora do banco**, não um campo SQLite. Não gravar segredo nem `.env` no Git.

**Limite importante:** operações feitas diretamente por outro processo no arquivo SQLite podem contornar um log que depende apenas do código Python. Para evoluir, estudar trilha via triggers, permissões no sistema e captura de eventos em transações; a assinatura externa ainda precisa de um fluxo confiável. Um mecanismo totalmente resistente a adulteração exige infraestrutura adicional.

## Passo 2 — Implementar a cadeia verificável

Representação conceitual:

```text
# Cada evento inclui uma autenticação encadeada usando segredo mantido fora do banco
MAC_0 = ancora_inicial_confiavel
MAC_1 = HMAC(chave, serializacao_canonica(evento_1) + MAC_0)
MAC_2 = HMAC(chave, serializacao_canonica(evento_2) + MAC_1)
...
```

Salvar **âncora e último estado confiável** fora da base auditada. Verificar sequência, formato, HMAC e divergências de quantidade.

Testes:
- Modificar um evento.
- Reordenar dois eventos.
- Apagar evento intermediário.
- Apagar o evento final, preservando âncora externa.

As quatro tentativas devem ser detectadas **na simulação em que a chave e as âncoras estão protegidas**.

## Passo 3 — Criar backup consistente

Usar `sqlite3.Connection.backup` para produzir um snapshot consistente mesmo quando a origem está em uso. Evitar copiar diretamente o arquivo de banco ativo em modo WAL.

```python
# Copia o banco aberto para um snapshot SQLite independente
import sqlite3

with sqlite3.connect("runtime/databases/inventario.db") as origem:
    with sqlite3.connect("runtime/backups/inventario_snapshot.db") as destino:
        origem.backup(destino)
```

Criar nomes únicos por timestamp e ID da execução; nunca sobrescrever silenciosamente um snapshot. Calcular SHA-256 **depois** de concluir e fechar o destino.

## Passo 4 — Criar manifesto de integridade

Salvar, de preferência em local protegido separado:
- `backup_id`;
- nome e tamanho do snapshot;
- `sha256`;
- criação UTC;
- versão do esquema;
- resultado de `integrity_check` e `foreign_key_check` do snapshot;
- referência ao último evento/audit anchor, se houver.

Um manifesto no **mesmo diretório editável** do backup é útil para detectar acidente, mas **não é uma prova resistente a adulteração maliciosa**. Diferenciar essa demonstração didática de armazenamento protegido real.

## Passo 5 — Validar a restauração

1. Localizar o snapshot e seu manifesto.
2. Recalcular SHA-256 e comparar com referência confiável.
3. Se falhar, interromper restauração e gerar alerta.
4. Copiar/restaurar em um **destino temporário novo**.
5. Rodar PRAGMAs e comparar contagens essenciais.
6. Só depois considerar uma restauração do banco principal, com aprovação explícita e backup prévio.

Nunca substituir automaticamente `runtime/databases/inventario.db`.

## Passo 6 — Testar cenários de falha

| Caso | Teste | Resultado |
| --- | --- | --- |
| B01 | Backup válido | Hash e PRAGMAs aprovados |
| B02 | Mudar um byte da cópia de teste | Hash diverge |
| B03 | Apagar ou editar evento | HMAC/âncora acusa inconsistência |
| B04 | Faltar chave ou âncora confiável | Estado **não verificável**, não aprovado |
| B05 | Restaurar em destino novo | Contagens e estrutura preservadas |
| B06 | Falhar a criação de backup | Operação sinalizada como erro, não como sucesso |

Arquivos previstos: `src/dataguard/audit/events.py`, `hash_chain.py`, `backup.py`, `manifest.py`, `tests/test_audit.py`, `tests/test_backup.py`.

### Critérios para concluir

- [ ] Eventos de teste registram antes/depois, sequência e origem.
- [ ] Alteração e truncamento de eventos são detectados com âncora confiável.
- [ ] Backup consistente é criado e verificado.
- [ ] Restauração ensaiada **somente em cópia temporária**.
- [ ] Falta de evidências é relatada como inconclusiva.
- [ ] Segredos, backups e manifestos privados ficam fora do GitHub.

**Próxima etapa da trilha complementar:** [08 — Anomalias e ML](08-anomalias-e-ml.md).
