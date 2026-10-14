// Tabela genérica com TanStack Table: ordenação, busca global e paginação no cliente.
import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/format'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  pageSize?: number
  searchPlaceholder?: string
  ariaLabel: string
}

export function DataTable<T>({ data, columns, pageSize = 10, searchPlaceholder = 'Filtrar resultados', ariaLabel }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    sortDescFirst: false,
    initialState: { pagination: { pageSize } },
  })
  const { pageIndex } = table.getState().pagination
  const filtradas = table.getFilteredRowModel().rows.length

  return (
    <div className="space-y-3">
      <label className="relative block max-w-sm">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={globalFilter} onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }} placeholder={searchPlaceholder} className="pl-9" />
      </label>
      <div className="rounded-lg border border-border">
        <Table aria-label={ariaLabel}>
          <TableHeader>
            {table.getHeaderGroups().map((grupo) => (
              <TableRow key={grupo.id} className="hover:bg-transparent">
                {grupo.headers.map((header) => {
                  const ordem = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id} aria-sort={ordem === 'asc' ? 'ascending' : ordem === 'desc' ? 'descending' : 'none'}>
                      <button type="button" className="inline-flex items-center gap-1.5 uppercase" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {ordem === 'asc' ? <ArrowUp className="size-3.5" /> : ordem === 'desc' ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-50" />}
                      </button>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">Nenhum registro corresponde ao filtro.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{formatNumber(filtradas)} de {formatNumber(data.length)} registros</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Página anterior"><ChevronLeft /></Button>
          <span>Página {pageIndex + 1} de {Math.max(1, table.getPageCount())}</span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Próxima página"><ChevronRight /></Button>
        </div>
      </div>
    </div>
  )
}
