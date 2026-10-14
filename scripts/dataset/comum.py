"""Funções compartilhadas pelos scripts do dataset sintético (somente biblioteca padrão)."""
from __future__ import annotations

import csv
from datetime import date, datetime, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DADOS = RAIZ / "data"
CSV_DIR = DADOS / "csv"
GABARITO = DADOS / "ground_truth" / "gabarito_anomalias.csv"
DATA_REFERENCIA = date(2026, 10, 13)
SEED = 20261013

TABELAS = ["categorias", "setores", "responsaveis", "equipamentos", "movimentacoes", "chamados"]
CONTAGENS_ESPERADAS = {
    "categorias": 12,
    "setores": 18,
    "responsaveis": 90,
    "equipamentos": 750,
    "movimentacoes": 2095,
    "chamados": 1196,
}
CLASSES_ESPERADAS = {
    "preco_extremo": 8,
    "aquisicao_futura": 7,
    "garantia_anterior_compra": 7,
    "chamado_antigo_aberto": 7,
    "movimentacao_apos_descarte": 7,
    "movimentacao_excessiva": 7,
    "reparos_repetidos": 7,
}


def ler_csv(caminho: Path) -> tuple[list[str], list[dict[str, str]]]:
    """Lê um CSV UTF-8 com cabeçalho e devolve colunas e linhas."""
    with caminho.open(encoding="utf-8", newline="") as arquivo:
        leitor = csv.DictReader(arquivo)
        return list(leitor.fieldnames or []), list(leitor)


def escrever_csv(caminho: Path, colunas: list[str], linhas: list[dict[str, str]]) -> None:
    """Grava um CSV UTF-8 com quebras de linha LF."""
    with caminho.open("w", encoding="utf-8", newline="") as arquivo:
        escritor = csv.DictWriter(arquivo, fieldnames=colunas, lineterminator="\n")
        escritor.writeheader()
        escritor.writerows(linhas)


def carregar_tabelas() -> dict[str, list[dict[str, str]]]:
    """Carrega as seis tabelas de domínio."""
    return {nome: ler_csv(CSV_DIR / f"{nome}.csv")[1] for nome in TABELAS}


def dt(valor: str) -> datetime:
    """Converte data ISO (com ou sem hora) em datetime."""
    return datetime.fromisoformat(valor) if "T" in valor else datetime.fromisoformat(valor + "T00:00:00")


def max_eventos_em_janela(instantes: list[datetime], dias: int = 30) -> int:
    """Maior quantidade de eventos dentro de qualquer janela móvel de `dias` dias."""
    ordenados = sorted(instantes)
    inicio = melhor = 0
    for fim, atual in enumerate(ordenados):
        while atual - ordenados[inicio] > timedelta(days=dias):
            inicio += 1
        melhor = max(melhor, fim - inicio + 1)
    return melhor


def avaliar_regras(tabelas: dict[str, list[dict[str, str]]], referencia: date = DATA_REFERENCIA) -> dict[str, set[int]]:
    """Aplica as sete regras documentadas e devolve os IDs de equipamento que cada uma sinaliza.

    Usado apenas para validar o dataset; não substitui o detector da etapa 08.
    """
    ref = datetime.combine(referencia, datetime.min.time())
    categorias = {int(c["id"]): int(c["valor_referencia_centavos"]) for c in tabelas["categorias"]}
    resultado: dict[str, set[int]] = {classe: set() for classe in CLASSES_ESPERADAS}
    descarte: dict[int, datetime] = {}
    for e in tabelas["equipamentos"]:
        eid = int(e["id"])
        razao = int(e["preco_centavos"]) / categorias[int(e["categoria_id"])]
        if razao >= 4:
            resultado["preco_extremo"].add(eid)
        if dt(e["data_aquisicao"]) > ref:
            resultado["aquisicao_futura"].add(eid)
        if dt(e["garantia_fim"]) < dt(e["data_aquisicao"]):
            resultado["garantia_anterior_compra"].add(eid)
        if e["data_descarte"]:
            descarte[eid] = dt(e["data_descarte"])

    movimentos: dict[int, list[datetime]] = {}
    for m in tabelas["movimentacoes"]:
        eid = int(m["equipamento_id"])
        instante = dt(m["ocorrido_em"])
        movimentos.setdefault(eid, []).append(instante)
        if eid in descarte and instante.date() > descarte[eid].date():
            resultado["movimentacao_apos_descarte"].add(eid)
    for eid, instantes in movimentos.items():
        if max_eventos_em_janela(instantes) >= 14:
            resultado["movimentacao_excessiva"].add(eid)

    chamados: dict[int, list[datetime]] = {}
    for c in tabelas["chamados"]:
        eid = int(c["equipamento_id"])
        aberto = dt(c["aberto_em"])
        chamados.setdefault(eid, []).append(aberto)
        if not c["encerrado_em"] and (ref - aberto).days > 365:
            resultado["chamado_antigo_aberto"].add(eid)
    for eid, instantes in chamados.items():
        if max_eventos_em_janela(instantes) >= 6:
            resultado["reparos_repetidos"].add(eid)
    return resultado
