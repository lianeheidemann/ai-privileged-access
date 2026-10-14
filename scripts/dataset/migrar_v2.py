"""Migra o dataset sintético da versão 1 para a 2, removendo vazamentos de rótulo.

Execução única, já aplicada ao repositório. Não execute novamente sobre a v2:
o script recusa rodar se `dataset_info.json` já indicar a versão 2.

Correções (seed fixa 20261013):
1. Permuta os IDs de equipamentos (antes, as 50 anomalias ocupavam os IDs 701–750)
   e atualiza patrimônio, número de série, movimentações, chamados e gabarito.
2. Neutraliza textos exclusivos das linhas anômalas ("Teste: ...", "Falha recorrente").
3. Iguala horários, prioridades, tipos, minutos e centavos dos registros anômalos
   à distribuição dos registros normais.
4. Encerra chamados antigos abertos de equipamentos não rotulados como
   `chamado_antigo_aberto`, que satisfaziam essa regra sem constar do gabarito.
5. Renumera movimentações e chamados em ordem cronológica.
6. Dispersa no tempo as rajadas e os descartes anômalos, que na v1 caíam nos mesmos
   dias do calendário para todos os equipamentos de cada classe.
"""
from __future__ import annotations

import json
import random
from collections import Counter
from datetime import datetime, timedelta

from comum import CSV_DIR, DADOS, DATA_REFERENCIA, GABARITO, SEED, dt, escrever_csv, ler_csv

TEXTO_MOV = "Movimentação simulada"
TEXTO_CHAMADO = "Chamado sintético para teste"
INICIO_RAJADAS_V1 = datetime(2026, 9, 15)


def sortear_data(rng: random.Random, minimo: datetime, maximo: datetime) -> datetime:
    """Sorteia um dia entre dois instantes (inclusive), preservando a meia-noite."""
    dias = max(0, (maximo.date() - minimo.date()).days)
    return datetime.combine(minimo.date() + timedelta(days=rng.randint(0, dias)), datetime.min.time())


def dispersar_no_tempo(rng, equipamentos, movimentacoes, chamados, gabarito) -> None:
    """Desloca rajadas e descartes anômalos para datas sorteadas, mantendo cada regra satisfeita."""
    referencia = datetime.combine(DATA_REFERENCIA, datetime.min.time())
    classe = {int(g["equipamento_id"]): g["tipo_anomalia"] for g in gabarito}
    por_id = {int(e["id"]): e for e in equipamentos}
    movs_de: dict[int, list[dict]] = {}
    for m in movimentacoes:
        movs_de.setdefault(int(m["equipamento_id"]), []).append(m)
    chamados_de: dict[int, list[dict]] = {}
    for c in chamados:
        chamados_de.setdefault(int(c["equipamento_id"]), []).append(c)

    for eid, tipo in sorted(classe.items()):
        e = por_id[eid]
        aquisicao = dt(e["data_aquisicao"])
        if tipo == "movimentacao_apos_descarte":
            descarte_antigo = dt(e["data_descarte"])
            depois = [m for m in movs_de.get(eid, []) if dt(m["ocorrido_em"]).date() > descarte_antigo.date()]
            antes = [dt(m["ocorrido_em"]) for m in movs_de.get(eid, []) if m not in depois]
            antes += [dt(c["encerrado_em"] or c["aberto_em"]) for c in chamados_de.get(eid, [])]
            minimo = max([aquisicao + timedelta(days=90)] + [d + timedelta(days=1) for d in antes])
            descarte = sortear_data(rng, minimo, referencia - timedelta(days=60))
            e["data_descarte"] = descarte.date().isoformat()
            for m in depois:
                novo = descarte + timedelta(days=rng.randint(2, 45), hours=rng.randint(7, 17), minutes=rng.randint(0, 59))
                m["ocorrido_em"] = min(novo, referencia - timedelta(hours=1)).isoformat(timespec="seconds")
        elif tipo in ("movimentacao_excessiva", "reparos_repetidos"):
            eventos = movs_de.get(eid, []) if tipo == "movimentacao_excessiva" else chamados_de.get(eid, [])
            campo = "ocorrido_em" if tipo == "movimentacao_excessiva" else "aberto_em"
            rajada = [ev for ev in eventos if dt(ev[campo]) >= INICIO_RAJADAS_V1]
            inicio = min(dt(ev[campo]) for ev in rajada)
            duracao = max(dt(ev[campo]) for ev in rajada) - inicio
            limite = dt(e["data_descarte"]) if e["data_descarte"] else referencia
            novo_inicio = sortear_data(rng, aquisicao + timedelta(days=30), limite - duracao - timedelta(days=3))
            for ev in rajada:
                antigo = dt(ev[campo])
                novo = novo_inicio + (antigo - inicio) + timedelta(hours=rng.randint(-12, 12))
                if tipo == "movimentacao_excessiva":
                    novo = novo.replace(minute=rng.randint(0, 59))
                else:
                    if ev["encerrado_em"]:
                        ev["encerrado_em"] = (novo + (dt(ev["encerrado_em"]) - antigo)).isoformat(timespec="seconds")
                ev[campo] = novo.isoformat(timespec="seconds")


def main() -> None:
    info_path = DADOS / "dataset_info.json"
    info = json.loads(info_path.read_text(encoding="utf-8"))
    if str(info.get("versao", "1")).startswith("2"):
        raise SystemExit("Dataset já está na versão 2; migração não reaplicada.")

    rng = random.Random(SEED)
    col_eq, equipamentos = ler_csv(CSV_DIR / "equipamentos.csv")
    col_mov, movimentacoes = ler_csv(CSV_DIR / "movimentacoes.csv")
    col_ch, chamados = ler_csv(CSV_DIR / "chamados.csv")
    col_gb, gabarito = ler_csv(GABARITO)
    anomalos = {int(g["equipamento_id"]) for g in gabarito}
    chamado_antigo = {int(g["equipamento_id"]) for g in gabarito if g["tipo_anomalia"] == "chamado_antigo_aberto"}

    # 6. Dispersão temporal (antes da permutação, com os IDs originais).
    dispersar_no_tempo(rng, equipamentos, movimentacoes, chamados, gabarito)

    # 1. Permutação dos IDs de equipamentos.
    antigos = [int(e["id"]) for e in equipamentos]
    novos = antigos[:]
    rng.shuffle(novos)
    mapa = dict(zip(antigos, novos))
    for e in equipamentos:
        antigo = int(e["id"])
        novo = mapa[antigo]
        if antigo in anomalos and int(e["preco_centavos"]) % 100 == 0:
            e["preco_centavos"] = str(int(e["preco_centavos"]) + rng.randint(1, 99))
        e["id"] = str(novo)
        e["patrimonio"] = f"PAT-{novo:06d}"
        prefixo = e["numero_serie"].rsplit("-", 1)[0]
        e["numero_serie"] = f"{prefixo}-{novo:06d}"
    equipamentos.sort(key=lambda e: int(e["id"]))

    # 2–3. Movimentações: textos, tipos e minutos alinhados aos registros normais.
    tipos_normais = [m["tipo"] for m in movimentacoes if int(m["equipamento_id"]) not in anomalos]
    for m in movimentacoes:
        if int(m["equipamento_id"]) in anomalos:
            m["observacao"] = TEXTO_MOV
            m["tipo"] = rng.choice(tipos_normais)
            m["ocorrido_em"] = dt(m["ocorrido_em"]).replace(minute=rng.randint(0, 59)).isoformat(timespec="seconds")
        m["equipamento_id"] = str(mapa[int(m["equipamento_id"])])

    # 2–4. Chamados.
    normais = [c for c in chamados if int(c["equipamento_id"]) not in anomalos]
    problemas_normais = [c["tipo_problema"] for c in normais]
    prioridades_normais = [c["prioridade"] for c in normais]
    referencia = datetime.combine(DATA_REFERENCIA, datetime.min.time())
    encerrados_por_regra = 0
    for c in chamados:
        eid = int(c["equipamento_id"])
        aberto = dt(c["aberto_em"])
        if not c["encerrado_em"] and (referencia - aberto).days > 365 and eid not in chamado_antigo:
            fim = (aberto + timedelta(days=rng.randint(1, 20))).replace(hour=16, minute=0, second=0)
            c["encerrado_em"] = fim.isoformat(timespec="seconds")
            c["status"] = "resolvido"
            encerrados_por_regra += 1
        if eid in anomalos:
            c["descricao"] = TEXTO_CHAMADO
            if c["tipo_problema"] == "Falha recorrente":
                c["tipo_problema"] = rng.choice(problemas_normais)
            c["prioridade"] = rng.choice(prioridades_normais)
            aberto = aberto.replace(hour=8, minute=0, second=0)
            c["aberto_em"] = aberto.isoformat(timespec="seconds")
            if c["encerrado_em"]:
                c["encerrado_em"] = dt(c["encerrado_em"]).replace(hour=16, minute=0, second=0).isoformat(timespec="seconds")
            custo = int(c["custo_reparo_centavos"])
            c["custo_reparo_centavos"] = str(round(custo / 100) * 100)
        c["equipamento_id"] = str(mapa[eid])

    # 5. Renumeração cronológica.
    movimentacoes.sort(key=lambda m: (m["ocorrido_em"], int(m["id"])))
    for i, m in enumerate(movimentacoes, start=1):
        m["id"] = str(i)
    chamados.sort(key=lambda c: (c["aberto_em"], int(c["id"])))
    for i, c in enumerate(chamados, start=1):
        c["id"] = str(i)

    for g in gabarito:
        novo = mapa[int(g["equipamento_id"])]
        g["equipamento_id"] = str(novo)
        g["patrimonio"] = f"PAT-{novo:06d}"
    gabarito.sort(key=lambda g: (g["tipo_anomalia"], int(g["equipamento_id"])))

    escrever_csv(CSV_DIR / "equipamentos.csv", col_eq, equipamentos)
    escrever_csv(CSV_DIR / "movimentacoes.csv", col_mov, movimentacoes)
    escrever_csv(CSV_DIR / "chamados.csv", col_ch, chamados)
    escrever_csv(GABARITO, col_gb, gabarito)

    status = Counter(c["status"] for c in chamados)
    print(f"Equipamentos permutados: {len(mapa)}")
    print(f"Chamados antigos encerrados fora da classe chamado_antigo_aberto: {encerrados_por_regra}")
    print(f"Status dos chamados: {dict(status)}")


if __name__ == "__main__":
    main()
