// Gera CSV para exportação local, neutralizando fórmulas (CSV/formula injection) antes do download.
const PREFIXOS_PERIGOSOS = ['=', '+', '-', '@', '\t', '\r']

export function sanitizeCell(valor: string | number): string {
  const texto = String(valor)
  const neutralizado = PREFIXOS_PERIGOSOS.some((p) => texto.startsWith(p)) && !/^-?\d+([.,]\d+)?$/.test(texto) ? `'${texto}` : texto
  return `"${neutralizado.replace(/"/g, '""')}"`
}

export function toCsv(colunas: string[], linhas: (string | number)[][]): string {
  return '﻿' + [colunas, ...linhas].map((linha) => linha.map(sanitizeCell).join(';')).join('\r\n')
}

export function downloadCsv(nomeArquivo: string, colunas: string[], linhas: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(colunas, linhas)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
