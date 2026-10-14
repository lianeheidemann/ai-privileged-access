// Ordenação, filtro e paginação da DataTable (TanStack Table).
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/DataTable'

type Linha = { nome: string; valor: number }
const dados: Linha[] = Array.from({ length: 12 }, (_, i) => ({ nome: `Item ${String.fromCharCode(65 + i)}`, valor: (i * 7) % 12 }))
const colunas: ColumnDef<Linha, any>[] = [
  { accessorKey: 'nome', header: 'Nome' },
  { accessorKey: 'valor', header: 'Valor' },
]
const linhasDoCorpo = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)

describe('DataTable', () => {
  it('pagina conforme o tamanho de página', async () => {
    const user = userEvent.setup()
    render(<DataTable ariaLabel="Teste" data={dados} columns={colunas} pageSize={5} />)
    expect(linhasDoCorpo()).toHaveLength(5)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
  })

  it('ordena pela coluna clicada', async () => {
    const user = userEvent.setup()
    render(<DataTable ariaLabel="Teste" data={dados} columns={colunas} pageSize={20} />)
    await user.click(screen.getByRole('button', { name: /Valor/ }))
    const valores = linhasDoCorpo().map((r) => Number(within(r).getAllByRole('cell')[1].textContent))
    expect(valores).toEqual([...valores].sort((a, b) => a - b))
  })

  it('filtra pela busca global e mostra estado vazio', async () => {
    const user = userEvent.setup()
    render(<DataTable ariaLabel="Teste" data={dados} columns={colunas} pageSize={20} />)
    await user.type(screen.getByPlaceholderText('Filtrar resultados'), 'Item C')
    expect(linhasDoCorpo()).toHaveLength(1)
    await user.type(screen.getByPlaceholderText('Filtrar resultados'), 'zzz')
    expect(screen.getByText('Nenhum registro corresponde ao filtro.')).toBeInTheDocument()
  })
})
