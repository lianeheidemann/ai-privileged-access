# 06 — Interface do DataGuard AI e relatórios

**Objetivo:** transformar verificações, detectores e consultas já testados em uma interface local simples e profissional.

**Pré-requisito:** [etapas 01–05](README.md), ou pelo menos as camadas determinísticas para um protótipo sem LLM.

## Passo 1 — Escolher a organização da interface

Proposta: **Streamlit** com navegação por páginas e gráficos **Plotly**. Evitar criar uma SPA inteira antes de validar o funcionamento.

| Página | Elementos | Ação principal |
| --- | --- | --- |
| **Visão geral** | KPIs, histórico, alertas recentes | Ver saúde da base |
| **Inventário** | Tabela, filtros por setor/status/categoria | Consultar registros |
| **Integridade** | Resultado das verificações e evidências | Executar auditoria |
| **Anomalias** | Classes, scores, justificativas, revisão | Investigar alertas |
| **Assistente local** | Perguntas, resultado, IDs e fonte | Consultar em português |
| **Backups** | Lista, SHA-256, validações | Criar e validar cópias |
| **Experimentos** | Precision/recall/F1, latência | Comparar detectores |

**Sugestão de navegação:** menu lateral enxuto com as páginas acima; não misturar o status de "banco íntegro" com "zero anomalias".

## Passo 2 — Montar a primeira tela: visão geral

Esboço funcional:

```text
+-----------------------------------------------------------+
| DataGuard AI                     Banco local  |  OFFLINE   |
+-----------------------------------------------------------+
| Equipamentos | Verificações | Alertas | Última execução  |
|     750      |  (dinâmico)  | (real)  |   (dinâmico)     |
+-----------------------------------------------------------+
| Alertas por categoria              | Histórico auditoria  |
| [gráfico de barras]                | [gráfico temporal]    |
+-----------------------------------------------------------+
| Últimos achados                                            |
| ID   | regra | evidência | origem | status                |
+-----------------------------------------------------------+
```

Os rótulos `dinâmico` e `real` representam valores a calcular no aplicativo; **não colocar métricas inventadas** na implementação.

### Convenção visual

- Visual minimalista, sem brilho/neon desnecessário.
- Tabelas primeiro: filtros e informações verificáveis antes de gráficos decorativos.
- Diferenciar cores e texto de **erro confirmado**, **suspeita**, **inconclusivo** e **sem problema detectado**.
- Não depender apenas da cor: usar rótulos, ícones e explicações.
- Identificar sempre **data de referência, dataset e execução**.
- Exibir "sem verificação executada" quando ainda não houver execução — não mostrar "íntegro" por padrão.

## Passo 3 — Implementar a navegação em fatias

1. Construir apenas **Visão geral + Inventário**.
2. Integrar **Integridade** e listar achados determinísticos.
3. Integrar **Anomalias**, com filtros por tipo e detector.
4. Integrar **Assistente**, exibindo respostas **com origem e consulta utilizada**.
5. Integrar **Backups** sem restauração destrutiva.
6. Adicionar **Experimentos** quando métricas estiverem disponíveis.

Criar `app.py` e páginas/componentes reutilizáveis em `src/dataguard/ui/` (ou `pages/` conforme a organização escolhida). A camada de interface **não deverá implementar SQL nem regras de detecção**; apenas chamar serviços testados.

## Passo 4 — Painel de anomalias

Colunas mínimas da tabela:

| Campo | Função |
| --- | --- |
| Equipamento | Identificador/patrimônio |
| Tipo | Regra de negócio ou anomalia estatística |
| Detector | Nome e versão |
| Gravidade | Nível de atenção |
| Evidência | Valor, referência, datas ou eventos |
| Revisão | Pendente, confirmado, descartado |
| Execução | Origem rastreável |

Permitir expandir a linha para detalhes, sem perder os filtros. O status "confirmado" só muda com **ação explícita do usuário**, nunca automaticamente porque a IA respondeu algo.

## Passo 5 — Relatórios e exportações

Arquivos: `src/dataguard/reports/export_csv.py`, `export_json.py`; PDF opcional somente após as saídas principais estarem estáveis.

Cada relatório deve incluir:
- ID da execução e data UTC.
- Dataset, data de referência e versão das regras/modelos.
- Resumo das verificações estruturais/referenciais.
- Alertas e seus IDs de evidência.
- Número de registros avaliados.
- Avisos sobre verificações inconclusivas.
- Limitações da detecção estatística.

**Não colocar o gabarito no relatório comum de operação.** Ele pertence ao relatório de **experimentos**, para evitar vazamento de rótulos.

## Passo 6 — Validação da experiência

- [ ] Interface renderiza sem Ollama.
- [ ] Nenhum botão altera banco por engano.
- [ ] Um alerta exibe dados verificáveis.
- [ ] Gráficos e tabelas são consistentes entre si.
- [ ] Filtros não omitem silenciosamente registros.
- [ ] Exportação contém IDs de execução e versões.
- [ ] Layout é legível em notebook e em largura reduzida.

**Critério de aceite:** uma pessoa consegue abrir o app e entender *o que foi verificado, o que é suspeita e de onde saiu cada conclusão*.

**Próxima etapa:** [07 — Testes e experimentos](07-testes-e-experimentos.md).
