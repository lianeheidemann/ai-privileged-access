# Scripts do dataset sintético

Somente biblioteca padrão do Python (3.10+). Execute a partir da raiz do repositório.

| Script | Uso | Altera arquivos? |
| --- | --- | --- |
| `validar_dataset.py` | Contagens, chaves, gabarito, vazamento de rótulos e hashes do manifesto | Não |
| `gerar_perguntas.py` | Recalcula `data/avaliacao/perguntas_assistente.csv` | Sim |
| `gerar_manifesto.py` | Recalcula `data/MANIFEST.sha256` após mudança revisada | Sim |
| `gerar_resumo_frontend.py` | Agregados reais para o protótipo em `frontend/src/data/demo-summary.json` | Sim |
| `migrar_v2.py` | Migração única v1 → v2, já aplicada; recusa reexecução | — |

~~~powershell
# Confere o dataset antes de importar para o SQLite
python scripts/dataset/validar_dataset.py
~~~

`comum.py` contém as sete regras de referência usadas **apenas para validar o dataset**. O detector da etapa 10 deve ser implementado de forma independente em `src/dataguard/detection/`.
