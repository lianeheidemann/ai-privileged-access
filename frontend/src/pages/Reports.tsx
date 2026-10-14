// Relatórios: prévias calculadas do dataset sintético e exportação CSV com proteção contra fórmulas.
import { useState } from 'react'
import { BarChart3, Download, FileText, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatTile } from '@/components/layout/StatTile'
import { downloadCsv } from '@/lib/csv'
import { formatNumber, formatPercent, label } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useResumo } from '@/services/queries'
import type { Contagem, ResumoDataset } from '@/types'

const relatorios: { id: string; titulo: string; fonte: string; descricao: string; dados: (r: ResumoDataset) => Contagem[] }[] = [
  { id: 'inventario', titulo: 'Equipamentos por categoria', fonte: 'Equipamentos', descricao: 'Quantidade e participação de cada categoria.', dados: (r) => r.equipamentosPorCategoria },
  { id: 'chamados', titulo: 'Chamados por prioridade', fonte: 'Chamados', descricao: 'Distribuição dos chamados técnicos.', dados: (r) => r.chamadosPorPrioridade },
  { id: 'movimentacoes', titulo: 'Movimentações por tipo', fonte: 'Movimentações', descricao: 'Operações registradas no inventário.', dados: (r) => r.movimentacoesPorTipo },
]

export default function Reports() {
  const { data } = useResumo()
  const [id, setId] = useState(relatorios[0].id)
  const [modo, setModo] = useState<'Tabela' | 'Resumo'>('Tabela')
  const relatorio = relatorios.find((r) => r.id === id)!
  const linhas = data ? relatorio.dados(data) : []
  const total = linhas.reduce((a, [, n]) => a + n, 0)
  const exportar = () => downloadCsv(`dataguard-demo-${relatorio.id}.csv`, ['Grupo', 'Registros', 'Participação'], linhas.map(([g, n]) => [label(g), n, formatPercent(n, total)]))
  return (
    <>
      <PageHeader eyebrow="Data workspace / reports" title="Relatórios" description="Organize resultados e prepare-os para compartilhar." status="Dados sintéticos" />
      <div className="grid gap-3 md:grid-cols-3">
        {relatorios.map((r) => (
          <button key={r.id} onClick={() => setId(r.id)} aria-pressed={r.id === id} className={cn('rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/60', r.id === id ? 'border-primary' : 'border-border')}>
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary"><FileText className="size-4" /></span>
            <strong className="mt-3 block text-sm">{r.titulo}</strong>
            <small className="text-muted-foreground">{r.fonte}</small>
          </button>
        ))}
      </div>
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Prévia do relatório</div><h2 className="mt-1 text-xl font-bold">{relatorio.titulo}</h2><p className="text-sm text-muted-foreground">{relatorio.descricao}</p></div>
          <Button onClick={exportar} disabled={!linhas.length}><Download /> Exportar CSV</Button>
        </div>
        <div className="mt-5 inline-flex rounded-lg border border-border p-1" role="group" aria-label="Modo de exibição">
          {(['Tabela', 'Resumo'] as const).map((m) => (
            <Button key={m} variant={modo === m ? 'secondary' : 'ghost'} size="sm" aria-pressed={modo === m} onClick={() => setModo(m)}>{m === 'Tabela' ? <Table2 /> : <BarChart3 />}{m}</Button>
          ))}
        </div>
        <div className="mt-4">
          {modo === 'Tabela' ? (
            <Table>
              <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Grupo</TableHead><TableHead className="text-right">Registros</TableHead><TableHead className="text-right">Participação</TableHead></TableRow></TableHeader>
              <TableBody>{linhas.map(([g, n]) => <TableRow key={g}><TableCell>{label(g)}</TableCell><TableCell className="text-right">{formatNumber(n)}</TableCell><TableCell className="text-right">{formatPercent(n, total)}</TableCell></TableRow>)}</TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Fonte" value={relatorio.fonte} />
              <StatTile label="Total de registros" value={formatNumber(total)} />
              <StatTile label="Grupos" value={String(linhas.length)} />
            </div>
          )}
        </div>
      </Card>
      <Notice title="Exportação local e protegida.">O CSV é gerado no navegador, apenas com os agregados exibidos, e células iniciadas por =, +, - ou @ são neutralizadas contra injeção de fórmulas. No sistema real, a exportação seguirá a mesma autorização das consultas.</Notice>
    </>
  )
}
