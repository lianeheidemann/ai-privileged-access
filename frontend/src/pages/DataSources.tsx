// Catálogo das fontes sintéticas com busca, filtro e detalhes.
import { useState } from 'react'
import { Database, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatTile } from '@/components/layout/StatTile'
import { useResumo } from '@/services/queries'
import { formatNumber } from '@/lib/format'

const fontes = [
  { key: 'equipamentos', name: 'Equipamentos', category: 'Inventário', description: 'Itens do inventário fictício de TI.', fields: 'patrimônio, número de série, categoria, setor, responsável, datas, preço, status' },
  { key: 'movimentacoes', name: 'Movimentações', category: 'Operações', description: 'Histórico de transferências, empréstimos e manutenções.', fields: 'equipamento, data e hora, setor de origem, setor de destino, tipo' },
  { key: 'chamados', name: 'Chamados', category: 'Atendimentos', description: 'Solicitações técnicas e reparos.', fields: 'equipamento, abertura, encerramento, prioridade, problema, status, custo' },
  { key: 'responsaveis', name: 'Responsáveis', category: 'Cadastros', description: 'Identidades sintéticas, sem dados pessoais reais.', fields: 'identificador fictício, setor' },
  { key: 'setores', name: 'Setores', category: 'Cadastros', description: 'Estrutura organizacional fictícia.', fields: 'código, nome, unidade' },
  { key: 'categorias', name: 'Categorias', category: 'Cadastros', description: 'Classificações e valores de referência.', fields: 'nome, vida útil, valor de referência' },
]

export default function DataSources() {
  const { data } = useResumo()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [selected, setSelected] = useState<string | null>(null)
  const filtered = fontes.filter((f) => (category === 'Todas' || f.category === category) && `${f.name} ${f.category}`.toLowerCase().includes(query.toLowerCase()))
  const detail = fontes.find((f) => f.key === selected)
  const count = (key: string) => data?.totais[key] ?? 0
  const total = data ? Object.values(data.totais).reduce((a, b) => a + b, 0) : 0
  return (
    <>
      <PageHeader eyebrow="Data workspace / sources" title="Fontes de dados" description="Conjuntos disponíveis para consulta no ambiente de demonstração." status="Dados fictícios" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Conjuntos" value="6" />
        <StatTile label="Registros" value={formatNumber(total)} />
        <StatTile label="Origem" value="CSV sintético" hint="Dataset v2, validado por script" />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar fontes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Buscar conjunto de dados" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </label>
        <div className="sm:w-56">
          <Select aria-label="Filtrar fontes" value={category} onChange={(e) => setCategory(e.target.value)}>
            {['Todas', 'Inventário', 'Operações', 'Atendimentos', 'Cadastros'].map((c) => <option key={c} value={c}>{c === 'Todas' ? 'Todas as fontes' : c}</option>)}
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {filtered.length ? filtered.map((f) => (
          <Card key={f.key} className="flex flex-wrap items-center gap-4 p-4">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><Database className="size-5" /></span>
            <div className="min-w-48 flex-1"><strong>{f.name}</strong><p className="text-sm text-muted-foreground">{f.description}</p></div>
            <div className="text-right"><strong>{formatNumber(count(f.key))}</strong><div className="text-xs text-muted-foreground">registros</div></div>
            <Button variant="outline" size="sm" onClick={() => setSelected(selected === f.key ? null : f.key)}>Detalhes</Button>
          </Card>
        )) : <Card className="p-6 text-center text-sm text-muted-foreground">Nenhuma fonte corresponde à busca.</Card>}
      </div>
      {detail && (
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold">{detail.name}</h3><Button variant="ghost" size="icon" aria-label="Fechar detalhes" onClick={() => setSelected(null)}><X /></Button></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div><small className="text-muted-foreground">Categoria</small><div className="font-semibold">{detail.category}</div></div>
            <div><small className="text-muted-foreground">Registros</small><div className="font-semibold">{formatNumber(count(detail.key))}</div></div>
            <div><small className="text-muted-foreground">Arquivo</small><div className="font-semibold">data/csv/{detail.key}.csv</div></div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground"><strong className="text-foreground">Campos:</strong> {detail.fields}.</p>
        </Card>
      )}
      <Notice title="Ambiente de demonstração.">O gabarito de anomalias não é exposto na interface. Conexões corporativas usarão conectores somente leitura e autorização por papel no backend.</Notice>
    </>
  )
}
