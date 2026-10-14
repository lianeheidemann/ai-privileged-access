// Definições de colunas TanStack Table para as fontes sintéticas.
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatCents, formatDate, label } from '@/lib/format'
import type { Chamado, Equipamento, Movimentacao } from '@/types'

const statusVariant = (s: string) => (s === 'ativo' || s === 'resolvido' ? 'success' : s === 'descartado' || s === 'aberto' ? 'warning' : 'default')
const StatusBadge = ({ value }: { value: string }) => <Badge variant={statusVariant(value)}>{label(value)}</Badge>

export const equipamentoColumns: ColumnDef<Equipamento, any>[] = [
  { accessorKey: 'patrimonio', header: 'Patrimônio' },
  { accessorKey: 'categoria', header: 'Categoria' },
  { accessorKey: 'setor', header: 'Setor' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge value={getValue()} /> },
  { accessorKey: 'aquisicao', header: 'Aquisição', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'precoCentavos', header: 'Preço', cell: ({ getValue }) => formatCents(getValue()) },
]

export const movimentacaoColumns: ColumnDef<Movimentacao, any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'patrimonio', header: 'Patrimônio' },
  { accessorKey: 'data', header: 'Data', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'tipo', header: 'Tipo', cell: ({ getValue }) => label(getValue()) },
  { accessorKey: 'origem', header: 'Origem' },
  { accessorKey: 'destino', header: 'Destino' },
]

export const chamadoColumns: ColumnDef<Chamado, any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'patrimonio', header: 'Patrimônio' },
  { accessorKey: 'aberto', header: 'Abertura', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'problema', header: 'Problema' },
  { accessorKey: 'prioridade', header: 'Prioridade', cell: ({ getValue }) => label(getValue()) },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge value={getValue()} /> },
  { accessorKey: 'custoCentavos', header: 'Custo', cell: ({ getValue }) => formatCents(getValue()) },
]
