// Consultas: leitura das fontes sintéticas com TanStack Table (ordenação, filtro e paginação).
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/DataTable'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePreferences } from '@/lib/preferences'
import { useTabela } from '@/services/queries'
import type { NomeTabela } from '@/types'
import { chamadoColumns, equipamentoColumns, movimentacaoColumns } from './columns'

const fontes: { key: NomeTabela; label: string; hint: string }[] = [
  { key: 'equipamentos', label: 'Equipamentos', hint: 'Todos os 750 registros' },
  { key: 'movimentacoes', label: 'Movimentações', hint: 'Amostra: 200 eventos mais recentes' },
  { key: 'chamados', label: 'Chamados', hint: 'Amostra: 200 chamados mais recentes' },
]

function Resultado({ fonte, pageSize }: { fonte: NomeTabela; pageSize: number }) {
  const equipamentos = useTabela('equipamentos')
  const movimentacoes = useTabela('movimentacoes')
  const chamados = useTabela('chamados')
  if (fonte === 'equipamentos') return equipamentos.data ? <DataTable ariaLabel="Equipamentos" data={equipamentos.data} columns={equipamentoColumns} pageSize={pageSize} /> : <Carregando />
  if (fonte === 'movimentacoes') return movimentacoes.data ? <DataTable ariaLabel="Movimentações" data={movimentacoes.data} columns={movimentacaoColumns} pageSize={pageSize} /> : <Carregando />
  return chamados.data ? <DataTable ariaLabel="Chamados" data={chamados.data} columns={chamadoColumns} pageSize={pageSize} /> : <Carregando />
}

const Carregando = () => <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>

export default function Queries() {
  const [fonte, setFonte] = useState<NomeTabela>('equipamentos')
  const { pageSize } = usePreferences()
  const atual = fontes.find((f) => f.key === fonte)!
  return (
    <>
      <PageHeader eyebrow="Data workspace / queries" title="Consultas" description="Explore registros por fonte, com filtros, ordenação e paginação." status="Leitura local" />
      <Card>
        <CardHeader className="flex-wrap">
          <span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><Search className="size-5" /></span>
          <div className="min-w-48 flex-1"><CardTitle>Fonte de dados</CardTitle><CardDescription>{atual.hint}. Clique no cabeçalho para ordenar.</CardDescription></div>
          <div className="w-full sm:w-48"><Select aria-label="Fonte de dados" value={fonte} onChange={(e) => setFonte(e.target.value as NomeTabela)}>{fontes.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</Select></div>
        </CardHeader>
        <CardContent><Resultado key={fonte} fonte={fonte} pageSize={pageSize} /></CardContent>
      </Card>
      <Notice title="Somente leitura, sem banco conectado.">Os registros vêm do JSON gerado a partir dos CSVs sintéticos. Na etapa 05, esta tela consumirá a API FastAPI, que aplicará autorização por papel e limites de linhas antes de responder.</Notice>
    </>
  )
}
