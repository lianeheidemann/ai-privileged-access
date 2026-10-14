"""Gera os dados estáticos do protótipo visual a partir dos CSVs sintéticos.

Uso: python scripts/dataset/gerar_resumo_frontend.py
Saída: frontend/src/data/demo-summary.json

O arquivo substitui números ilustrativos por agregados reais do dataset sintético.
O gabarito de anomalias NÃO é incluído. Não usar com dados reais: o JSON vai para o build público.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import date

from comum import DATA_REFERENCIA, RAIZ, carregar_tabelas, dt

AMOSTRA_EVENTOS = 200


def meses_ate(referencia: date, quantidade: int) -> list[str]:
    ano, mes = referencia.year, referencia.month
    saida = []
    for _ in range(quantidade):
        saida.append(f"{ano:04d}-{mes:02d}")
        mes -= 1
        if mes == 0:
            ano, mes = ano - 1, 12
    return list(reversed(saida))


def main() -> None:
    t = carregar_tabelas()
    categorias = {c["id"]: c["nome"] for c in t["categorias"]}
    setores = {s["id"]: s["nome"] for s in t["setores"]}
    patrimonio = {e["id"]: e["patrimonio"] for e in t["equipamentos"]}
    meses = meses_ate(DATA_REFERENCIA, 12)
    abertos_mes = Counter(dt(c["aberto_em"]).strftime("%Y-%m") for c in t["chamados"])
    movs_mes = Counter(dt(m["ocorrido_em"]).strftime("%Y-%m") for m in t["movimentacoes"])

    resumo = {
        "_aviso": "Gerado por scripts/dataset/gerar_resumo_frontend.py a partir de dados 100% sintéticos. Não editar manualmente.",
        "dataReferencia": DATA_REFERENCIA.isoformat(),
        "totais": {nome: len(linhas) for nome, linhas in t.items()},
        "equipamentosPorStatus": Counter(e["status"] for e in t["equipamentos"]).most_common(),
        "equipamentosPorCategoria": Counter(categorias[e["categoria_id"]] for e in t["equipamentos"]).most_common(),
        "chamadosPorStatus": Counter(c["status"] for c in t["chamados"]).most_common(),
        "chamadosPorPrioridade": Counter(c["prioridade"] for c in t["chamados"]).most_common(),
        "movimentacoesPorTipo": Counter(m["tipo"] for m in t["movimentacoes"]).most_common(),
        "serieMensal": [{"mes": m, "chamados": abertos_mes[m], "movimentacoes": movs_mes[m]} for m in meses],
        "equipamentos": [
            {
                "patrimonio": e["patrimonio"],
                "categoria": categorias[e["categoria_id"]],
                "setor": setores[e["setor_id"]],
                "status": e["status"],
                "aquisicao": e["data_aquisicao"],
                "precoCentavos": int(e["preco_centavos"]),
            }
            for e in t["equipamentos"]
        ],
        "movimentacoes": [
            {
                "id": int(m["id"]),
                "patrimonio": patrimonio[m["equipamento_id"]],
                "data": m["ocorrido_em"],
                "origem": setores[m["setor_origem_id"]],
                "destino": setores[m["setor_destino_id"]],
                "tipo": m["tipo"],
            }
            for m in t["movimentacoes"][-AMOSTRA_EVENTOS:]
        ],
        "chamados": [
            {
                "id": int(c["id"]),
                "patrimonio": patrimonio[c["equipamento_id"]],
                "aberto": c["aberto_em"],
                "prioridade": c["prioridade"],
                "problema": c["tipo_problema"],
                "status": c["status"],
                "custoCentavos": int(c["custo_reparo_centavos"]),
            }
            for c in t["chamados"][-AMOSTRA_EVENTOS:]
        ],
    }
    destino = RAIZ / "frontend" / "src" / "data" / "demo-summary.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(resumo, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Resumo gravado em {destino.relative_to(RAIZ)} ({destino.stat().st_size // 1024} KiB)")


if __name__ == "__main__":
    main()
