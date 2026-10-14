"""Gera data/MANIFEST.sha256 com o hash de cada arquivo versionado do dataset.

Uso: python scripts/dataset/gerar_manifesto.py
Executar somente após uma mudança intencional e revisada nos dados.
"""
from __future__ import annotations

import hashlib

from comum import DADOS

ARQUIVOS = sorted(
    p for p in DADOS.rglob("*") if p.is_file() and p.name != "MANIFEST.sha256" and p.suffix in {".csv", ".json"}
)


def main() -> None:
    linhas = [f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(DADOS).as_posix()}" for p in ARQUIVOS]
    (DADOS / "MANIFEST.sha256").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"{len(linhas)} arquivos registrados em data/MANIFEST.sha256")


if __name__ == "__main__":
    main()
