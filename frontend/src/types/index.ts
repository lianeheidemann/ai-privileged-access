// Contratos dos dados do protótipo; espelham as respostas planejadas da futura API /api.
export type Contagem = [string, number]

export interface Equipamento {
  patrimonio: string
  categoria: string
  setor: string
  status: string
  aquisicao: string
  precoCentavos: number
}

export interface Movimentacao {
  id: number
  patrimonio: string
  data: string
  origem: string
  destino: string
  tipo: string
}

export interface Chamado {
  id: number
  patrimonio: string
  aberto: string
  prioridade: string
  problema: string
  status: string
  custoCentavos: number
}

export interface ResumoDataset {
  dataReferencia: string
  totais: Record<string, number>
  equipamentosPorStatus: Contagem[]
  equipamentosPorCategoria: Contagem[]
  chamadosPorStatus: Contagem[]
  chamadosPorPrioridade: Contagem[]
  movimentacoesPorTipo: Contagem[]
  serieMensal: { mes: string; chamados: number; movimentacoes: number }[]
}

export type NomeTabela = 'equipamentos' | 'movimentacoes' | 'chamados'
export interface TabelaDemo {
  equipamentos: Equipamento[]
  movimentacoes: Movimentacao[]
  chamados: Chamado[]
}
