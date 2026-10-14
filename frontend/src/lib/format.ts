// Formatação pt-BR e rótulos legíveis para os códigos do dataset sintético.
const numero = new Intl.NumberFormat('pt-BR')
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatNumber = (n: number) => numero.format(n)
export const formatCents = (centavos: number) => moeda.format(centavos / 100)
export const formatPercent = (parte: number, total: number) =>
  total ? `${((parte / total) * 100).toFixed(1).replace('.', ',')}%` : '0%'
export const formatDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

const rotulos: Record<string, string> = {
  ativo: 'Ativo',
  estoque: 'Em estoque',
  manutencao: 'Manutenção',
  descartado: 'Descartado',
  resolvido: 'Resolvido',
  aberto: 'Aberto',
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
  transferencia: 'Transferência',
  devolucao: 'Devolução',
  emprestimo: 'Empréstimo',
  retorno_manutencao: 'Retorno de manutenção',
}

export const label = (codigo: string) => rotulos[codigo] ?? codigo

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const formatMonth = (anoMes: string) => {
  const [ano, mes] = anoMes.split('-')
  return `${meses[Number(mes) - 1]}/${ano.slice(2)}`
}
