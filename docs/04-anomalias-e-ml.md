# 04 — Detectar anomalias: regras primeiro, ML depois

**Objetivo:** demonstrar uma **funcionalidade de análise empresarial** sobre dados sintéticos: localizar comportamentos fora do padrão e medir a qualidade da detecção, sem tornar o ML requisito para toda consulta segura.

**Pré-requisito:** [etapa 02](02-integridade-e-transacoes.md); a etapa 03 é recomendada para preservar evidências. **Não usar IA generativa para decidir o que é erro.**

**Segurança dos dados:** executar extração e processamento dentro do ambiente autorizado; obter apenas campos e períodos necessários; não transmitir datasets ou vetores derivados a serviços externos; não publicar amostras reais, modelos treinados com dados sensíveis ou relatórios identificáveis. A política de retenção também se aplica a features e resultados.

## Passo 1 — Entender o gabarito separado

O dataset contém 750 equipamentos, com **50 casos sintéticos marcados** em `data/ground_truth/gabarito_anomalias.csv`. Distribuição:

| Classe | Casos | Padrão documentado |
| --- | ---: | --- |
| `preco_extremo` | 8 | Compra 5–10 vezes o valor de referência da categoria |
| `aquisicao_futura` | 7 | Compra posterior a **2026-10-13** |
| `garantia_anterior_compra` | 7 | Garantia termina antes da aquisição |
| `chamado_antigo_aberto` | 7 | Chamado aberto há mais de 365 dias |
| `movimentacao_apos_descarte` | 7 | Movimentação após descarte |
| `movimentacao_excessiva` | 7 | Pelo menos 14 movimentações em 30 dias |
| `reparos_repetidos` | 7 | Pelo menos seis chamados de manutenção em 30 dias |
| **Total** | **50** | **Rótulos artificiais para avaliação** |

**Regra essencial:** a detecção não deve ler o gabarito nem usar diretamente os IDs 701–750. Este arquivo entra somente na rotina de avaliação. A data de referência deve ser um parâmetro explícito, inicialmente **2026-10-13**, para não mudar os resultados com o passar do tempo.

O gabarito contém casos injetados conhecidos, não necessariamente **todas** as observações que possam ser anômalas. Alertas adicionais exigem revisão; não classificá-los automaticamente como falsos positivos sem examinar os dados.

## Passo 2 — Implementar baseline por regras

Arquivo: `src/dataguard/detection/rule_detector.py`.

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
  "equipamento_id": 701,
  "detector": "regra_preco_categoria",
  "tipo": "preco_fora_padrao",
  "status": "suspeita",
  "evidencias": {"preco_centavos": 0, "referencia_centavos": 0},
  "detector_version": "0.1"
}
```

Os zeros acima são **placeholders do formato**, não valores reais do registro 701.

## Passo 3 — Criar features para Machine Learning

Arquivo: `src/dataguard/detection/features.py`.

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

Arquivos: `src/dataguard/detection/isolation_forest.py`, `tests/test_detection.py`.

1. Construir o baseline exclusivamente por regras.
2. Definir **antes** da avaliação o protocolo de treino/validação/teste e o conjunto de features.
3. Treinar um `IsolationForest` com `random_state` fixo.
4. Guardar o `decision_function` / score, parâmetros e versão.
5. Calibrar limiar na validação, sem usar gabarito do teste final para escolhê-lo.
6. Comparar cada previsão com a avaliação de regras.
7. Exibir `anomalia estatística`, não `integridade violada`.

Com apenas 750 equipamentos, os resultados de ML podem variar e as 50 anomalias artificiais são concentradas em um subconjunto. **Não declarar generalização para ambientes empresariais reais.** Para comparações rigorosas, considerar gerar datasets sintéticos adicionais com diferentes seeds e distribuições.

## Passo 5 — Avaliar com o gabarito

Arquivo: `src/dataguard/detection/evaluate.py`.

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

Antes de integrar **FastAPI e a interface React + TypeScript** (etapa 06), gerar um CSV/JSON com:
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

**Próxima etapa:** [05 — Assistente local](05-assistente-local.md).
