"""Valida o dataset sintético: contagens, chaves, gabarito e ausência de vazamento de rótulos.

Uso: python scripts/dataset/validar_dataset.py
Retorna código 1 se alguma checagem falhar. Somente leitura.
"""
from __future__ import annotations

import hashlib
import sys
from collections import Counter, defaultdict

from comum import (
    CLASSES_ESPERADAS,
    CONTAGENS_ESPERADAS,
    DADOS,
    GABARITO,
    TABELAS,
    avaliar_regras,
    carregar_tabelas,
    dt,
    ler_csv,
)

falhas: list[str] = []


def checar(condicao: bool, mensagem: str) -> None:
    print(("OK    " if condicao else "FALHA ") + mensagem)
    if not condicao:
        falhas.append(mensagem)


def checar_contagens(tabelas) -> None:
    for nome in TABELAS:
        checar(len(tabelas[nome]) == CONTAGENS_ESPERADAS[nome], f"{nome}: {len(tabelas[nome])} registros")
    for nome in TABELAS:
        ids = [int(r["id"]) for r in tabelas[nome]]
        checar(len(ids) == len(set(ids)), f"{nome}: IDs únicos")


def checar_chaves(tabelas) -> None:
    ids = {nome: {int(r["id"]) for r in tabelas[nome]} for nome in TABELAS}
    refs = [
        ("responsaveis", "setor_id", "setores", False),
        ("equipamentos", "categoria_id", "categorias", False),
        ("equipamentos", "responsavel_id", "responsaveis", True),
        ("equipamentos", "setor_id", "setores", False),
        ("movimentacoes", "equipamento_id", "equipamentos", False),
        ("movimentacoes", "setor_origem_id", "setores", False),
        ("movimentacoes", "setor_destino_id", "setores", False),
        ("chamados", "equipamento_id", "equipamentos", False),
    ]
    for tabela, coluna, alvo, opcional in refs:
        invalidas = [
            r["id"] for r in tabelas[tabela]
            if not (opcional and r[coluna] == "") and int(r[coluna]) not in ids[alvo]
        ]
        checar(not invalidas, f"FK {tabela}.{coluna} → {alvo}")
    patrimonios = [e["patrimonio"] for e in tabelas["equipamentos"]]
    checar(len(patrimonios) == len(set(patrimonios)), "equipamentos.patrimonio único")


def checar_gabarito(tabelas, gabarito) -> dict[str, set[int]]:
    por_classe: dict[str, set[int]] = defaultdict(set)
    for g in gabarito:
        por_classe[g["tipo_anomalia"]].add(int(g["equipamento_id"]))
    contagem = {k: len(v) for k, v in por_classe.items()}
    checar(contagem == CLASSES_ESPERADAS, f"gabarito: {len(gabarito)} casos em {len(contagem)} classes")
    equip = {int(e["id"]): e["patrimonio"] for e in tabelas["equipamentos"]}
    checar(all(equip.get(int(g["equipamento_id"])) == g["patrimonio"] for g in gabarito), "gabarito: patrimônio confere")

    ids = sorted(int(g["equipamento_id"]) for g in gabarito)
    maior_sequencia = atual = 1
    for a, b in zip(ids, ids[1:]):
        atual = atual + 1 if b == a + 1 else 1
        maior_sequencia = max(maior_sequencia, atual)
    checar(maior_sequencia <= 5, f"gabarito: IDs não contíguos (maior sequência = {maior_sequencia})")

    regras = avaliar_regras(tabelas)
    for classe, esperados in sorted(por_classe.items()):
        faltando = esperados - regras[classe]
        extras = regras[classe] - esperados
        checar(not faltando, f"regra {classe}: todos os casos rotulados satisfazem a classe")
        if extras:
            print(f"AVISO  regra {classe}: {len(extras)} equipamento(s) não rotulado(s) também satisfazem: {sorted(extras)}")
    return por_classe


def checar_vazamentos(tabelas, anomalos: set[int]) -> None:
    """Procura sinais que separem linhas anômalas das normais sem aplicar as regras."""
    alvos = {
        "equipamentos": ("id", ["descricao", "status"]),
        "movimentacoes": ("equipamento_id", ["tipo", "observacao"]),
        "chamados": ("equipamento_id", ["tipo_problema", "prioridade", "status", "descricao"]),
    }
    for tabela, (chave, colunas) in alvos.items():
        linhas = tabelas[tabela]
        for coluna in colunas:
            normais = {r[coluna] for r in linhas if int(r[chave]) not in anomalos}
            exclusivos = {r[coluna] for r in linhas if int(r[chave]) in anomalos} - normais
            checar(not exclusivos, f"vazamento {tabela}.{coluna}: nenhum valor exclusivo das anomalias")

    def horarios(tabela: str, coluna: str, chave: str) -> tuple[Counter, Counter]:
        normal, anomalo = Counter(), Counter()
        for r in tabelas[tabela]:
            if r[coluna]:
                destino = anomalo if int(r[chave]) in anomalos else normal
                destino[dt(r[coluna]).strftime("%H:%M:%S")] += 1
        return normal, anomalo

    for tabela, coluna in [("chamados", "aberto_em"), ("chamados", "encerrado_em")]:
        normal, anomalo = horarios(tabela, coluna, "equipamento_id")
        checar(set(anomalo) <= set(normal), f"vazamento {tabela}.{coluna}: horários das anomalias existem nos normais")

    def taxa_minuto_zero(anom: bool) -> float:
        linhas = [m for m in tabelas["movimentacoes"] if (int(m["equipamento_id"]) in anomalos) == anom]
        return sum(dt(m["ocorrido_em"]).minute == 0 for m in linhas) / len(linhas)

    checar(taxa_minuto_zero(True) <= max(0.05, 3 * taxa_minuto_zero(False)), "vazamento movimentacoes.ocorrido_em: minutos redondos")

    def taxa_redondo(tabela: str, coluna: str, chave: str, anom: bool) -> float:
        linhas = [r for r in tabelas[tabela] if (int(r[chave]) in anomalos) == anom]
        return sum(int(r[coluna]) % 100 == 0 for r in linhas) / len(linhas)

    checar(
        taxa_redondo("equipamentos", "preco_centavos", "id", True) <= max(0.05, 3 * taxa_redondo("equipamentos", "preco_centavos", "id", False)),
        "vazamento equipamentos.preco_centavos: proporção de valores redondos",
    )
    checar(
        abs(taxa_redondo("chamados", "custo_reparo_centavos", "equipamento_id", True)
            - taxa_redondo("chamados", "custo_reparo_centavos", "equipamento_id", False)) <= 0.2,
        "vazamento chamados.custo_reparo_centavos: proporção de valores redondos",
    )
    for tabela in ("movimentacoes", "chamados"):
        coluna = "ocorrido_em" if tabela == "movimentacoes" else "aberto_em"
        linhas = tabelas[tabela]
        checar(all(a[coluna] <= b[coluna] for a, b in zip(linhas, linhas[1:])), f"{tabela}: IDs em ordem cronológica")


def checar_manifesto() -> None:
    manifesto = DADOS / "MANIFEST.sha256"
    if not manifesto.exists():
        print("AVISO  data/MANIFEST.sha256 ausente")
        return
    for linha in manifesto.read_text(encoding="utf-8").splitlines():
        esperado, nome = linha.split(maxsplit=1)
        atual = hashlib.sha256((DADOS / nome).read_bytes()).hexdigest()
        checar(atual == esperado, f"SHA-256 de data/{nome}")


def main() -> None:
    tabelas = carregar_tabelas()
    gabarito = ler_csv(GABARITO)[1]
    checar_contagens(tabelas)
    checar_chaves(tabelas)
    por_classe = checar_gabarito(tabelas, gabarito)
    checar_vazamentos(tabelas, set().union(*por_classe.values()))
    checar_manifesto()
    print(f"\n{len(falhas)} falha(s).")
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
