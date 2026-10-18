# 10 — Detectar anomalias: regras primeiro, ML depois

> **Trilha complementar (qualidade dos dados).** Esta etapa não bloqueia a trilha principal de segurança da IA local (02 → 03 → 04 → 05 → 06). Ela pode ser feita em paralelo ou depois do corte vertical da [etapa 04](04-assistente-local.md).

**Objetivo:** demonstrar uma **funcionalidade de análise empresarial** sobre dados sintéticos: localizar comportamentos fora do padrão e medir a qualidade da detecção, sem tornar o ML requisito para toda consulta segura.

**Pré-requisito:** [etapa 08](08-integridade-e-transacoes.md); a etapa 09 é recomendada para preservar evidências. **Não usar IA generativa para decidir o que é erro.**

**Segurança dos dados:** executar extração e processamento dentro do ambiente autorizado; obter apenas campos e períodos necessários; não transmitir datasets ou vetores derivados a serviços externos; não publicar amostras reais, modelos treinados com dados sensíveis ou relatórios identificáveis. A política de retenção também se aplica a features e resultados.

## Passo 1 — Entender o gabarito separado

O dataset contém 750 equipamentos, com **50 casos sintéticos marcados** em `data/ground_truth/gabarito_anomalias.csv`. Distribuição:

| Classe | Casos | Padrão documentado |
| --- | ---: | --- |
| `preco_extremo` | 8 | Compra 5–10 vezes o valor de referência da categoria |
| `aquisicao_futura` | 7 | Compra posterior a **2026-10-13** |
| `garantia_anterior_compra` | 7 | Garantia termina antes da aquisição |
| `chamado_antigo_aberto` | 7 | Chamado ainda aberto há mais de 365 dias na data de referência |
| `movimentacao_apos_descarte` | 7 | Movimentação após descarte |
| `movimentacao_excessiva` | 7 | Pelo menos 14 movimentações em uma janela móvel de 30 dias |
| `reparos_repetidos` | 7 | Pelo menos seis chamados em uma janela móvel de 30 dias |
| **Total** | **50** | **Rótulos artificiais para avaliação** |

**Regra essencial:** a detecção não deve ler o gabarito nem usar IDs ou patrimônios como sinal. Este arquivo entra somente na rotina de avaliação. Na v2 do dataset, os IDs das anomalias foram embaralhados e os textos, horários e datas que as denunciavam foram neutralizados (`validar_dataset.py` verifica). A data de referência deve ser um parâmetro explícito, inicialmente **2026-10-13**, para não mudar os resultados com o passar do tempo.

O gabarito contém casos injetados conhecidos. Na v2, as sete regras de referência sinalizam **exatamente** os 50 casos, mas variações de limiar podem gerar alertas adicionais: eles exigem revisão e não devem ser classificados automaticamente como falsos positivos.

**Limitação metodológica (circularidade):** as classes foram plantadas segundo regras determinísticas. Um detector por regras com os mesmos limiares as reproduz **por construção**, então precision e recall altos das regras **validam a implementação, não a capacidade de generalização**. Relate isso nos resultados. A comparação informativa é entre o Isolation Forest (que não conhece as regras) e as regras, e entre limiares diferentes.

## Passo 2 — Implementar baseline por regras

Arquivo: `src/ai_privileged_access/detection/rule_detector.py`.

1. Criar regras independentes com nomes estáveis (`R01` etc.).
2. Cada regra recebe conexão SQLite em modo leitura e data de referência.
3. Retornar uma lista com `equipamento_id`, regra, evidências, status, severidade sugerida e instante de avaliação.
4. Para janelas de 30 dias, trabalhar com **intervalos móveis reais**, não apenas datas do mesmo mês.
5. Para anomalias em movimentações e chamados, agregar por `equipamento_id`, preservando IDs dos eventos que justificam o alerta.
6. Tornar os limiares parâmetros explícitos, testáveis e versionados.
7. Não fundir categorias distintas em um único rótulo vago de "anomalia".

Exemplo de formato de resultado:

```json
{
  "equipamento_id": 0,
  "detector": "regra_preco_categoria",
  "tipo": "preco_fora_padrao",
  "status": "suspeita",
  "evidencias": {"preco_centavos": 0, "referencia_centavos": 0},
  "detector_version": "0.1"
}
```

Os zeros acima são **placeholders do formato**, não valores reais de um registro.

## Passo 3 — Criar features para Machine Learning

Arquivo: `src/ai_privileged_access/detection/features.py`.

Sugestões de atributos derivados:
- Razão entre preço pago e valor de referência de sua categoria.
- Idade do equipamento em meses na data de referência.
- Contagem de movimentações na janela móvel de 30 dias.
- Contagem de chamados de manutenção na janela móvel de 30 dias.
- Tempo máximo de chamado ainda aberto.
- Intervalo entre aquisição, garantia e descarte, quando existir.

**Cuidados:**
- Não usar `equipamento_id`, `patrimonio` nem tipo do gabarito como features.
- Não usar o resultado das regras como feature no primeiro experimento, pois isso reduz a independência entre os métodos.
- Não confundir campos ausentes legítimos com zeros.
- Preparar transformações sem olhar o conjunto de teste final.
- Registrar versão das features, parâmetros e semente.

## Passo 4 — Implementar Isolation Forest

Arquivos: `src/ai_privileged_access/detection/isolation_forest.py`, `tests/test_detection.py`.

1. Construir o baseline exclusivamente por regras.
2. Definir **antes** da avaliação o protocolo de treino/validação/teste e o conjunto de features.
3. Treinar um `IsolationForest` com `random_state` fixo.
4. Guardar o `decision_function` / score, parâmetros e versão.
5. Calibrar limiar na validação, sem usar gabarito do teste final para escolhê-lo.
6. Comparar cada previsão com a avaliação de regras.
7. Exibir `anomalia estatística`, não `integridade violada`.

**O ML é exploratório.** Com apenas 750 equipamentos e taxa de anomalias de 6,7% (alta em relação a ambientes reais), os resultados podem variar bastante. **Não declarar generalização para ambientes empresariais reais.**
- Repetir o treino com várias seeds (por exemplo, 10) e reportar média e desvio.
- Ajustar `contamination` sem usar o gabarito do teste final, ou usar o score contínuo com limiar calibrado na validação.
- Para comparações rigorosas, gerar datasets sintéticos adicionais com outras seeds, taxas de contaminação menores (1–2%) e distribuições diferentes.

## Passo 5 — Avaliar com o gabarito

Arquivo: `src/ai_privileged_access/detection/evaluate.py`.

A avaliação junta alertas e gabarito **somente depois que as previsões foram congeladas**.

| Métrica | Significado |
| --- | --- |
| Precision | Entre os alertas emitidos, quantos correspondem a casos conhecidos |
| Recall | Entre os casos conhecidos, quantos foram detectados |
| F1 | Equilíbrio entre precision e recall |
| Falsos positivos | Alertas fora do gabarito, sujeitos à revisão manual |
| Latência | Tempo de execução por detector |
| Cobertura por classe | Quais tipos de anomalia cada método conseguiu identificar |

Comparar **regras**, **Isolation Forest** e **união/combinação dos dois**, com o mesmo conjunto de avaliação. Registrar erros e resultados por classe, em vez de somente um número agregado.

## Passo 6 — Visualização simples dos resultados

Antes de integrar **FastAPI e a interface React + TypeScript** (etapa 05), gerar um CSV/JSON com:
- Quantidade de alertas por detector.
- IDs detectados e evidências.
- Scores e limiares.
- Métricas por classe, quando aplicáveis.
- Data de referência, versão, seed e duração.

### Critérios para concluir

- [ ] Sete classes conhecidas podem ser investigadas por regras documentadas.
- [ ] Detector não carrega gabarito durante inferência.
- [ ] Resultado por equipamento inclui evidências legíveis.
- [ ] Modelo estatístico e regras geram saídas separadas.
- [ ] Avaliação foi realizada sem calibrar em cima do teste final.
- [ ] Falsos positivos não são automaticamente chamados de corrupção de dados.

**Separação de camadas:** os detectores permanecem em Python e retornam resultados estruturados; a futura API FastAPI apenas os expõe, e React/Recharts apenas os apresenta. Nunca realizar cálculos de detecção dentro dos componentes de interface.

**Ao concluir:** exponha os alertas ao assistente pela intenção `resumo_alertas` (papel auditor) da [etapa 04](04-assistente-local.md) e à interface pela [etapa 05](05-interface-e-relatorios.md).
