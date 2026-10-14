// API simulada do protótipo: lê o JSON estático gerado dos CSVs sintéticos, sem rede.
// As funções têm a mesma forma prevista para os endpoints FastAPI (/api/...), para que
// a troca futura altere apenas este módulo.
import type { NomeTabela, ResumoDataset, TabelaDemo } from '@/types'

// Import dinâmico: o JSON (~165 kB) só é baixado quando alguma tela pede dados.
const carregar = async () => (await import('@/data/demo-summary.json')).default as unknown as ResumoDataset & TabelaDemo

export async function getResumo(): Promise<ResumoDataset> {
  const { equipamentos: _e, movimentacoes: _m, chamados: _c, ...agregados } = await carregar()
  return agregados
}

export async function getTabela<T extends NomeTabela>(nome: T): Promise<TabelaDemo[T]> {
  return (await carregar())[nome]
}
