// Análises: distribuições e série mensal calculadas do dataset sintético, com Recharts.
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartNoAxesColumn, PieChart as PieIcon, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatTile } from '@/components/layout/StatTile'
import { useResumo } from '@/services/queries'
import { formatMonth, formatNumber, formatPercent, label } from '@/lib/format'
import type { Contagem, ResumoDataset } from '@/types'

const CORES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
const visoes: { id: string; titulo: string; dados: (r: ResumoDataset) => Contagem[] }[] = [
  { id: 'equip-status', titulo: 'Equipamentos por status', dados: (r) => r.equipamentosPorStatus },
  { id: 'equip-categoria', titulo: 'Equipamentos por categoria', dados: (r) => r.equipamentosPorCategoria },
  { id: 'chamados-prioridade', titulo: 'Chamados por prioridade', dados: (r) => r.chamadosPorPrioridade },
  { id: 'chamados-status', titulo: 'Chamados por status', dados: (r) => r.chamadosPorStatus },
  { id: 'mov-tipo', titulo: 'Movimentações por tipo', dados: (r) => r.movimentacoesPorTipo },
]
const tooltipStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' }
const eixo = { stroke: 'var(--muted-foreground)', fontSize: 12 }

export default function Analytics() {
  const { data } = useResumo()
  const [visaoId, setVisaoId] = useState(visoes[0].id)
  if (!data) return <p className="text-sm text-muted-foreground">Carregando…</p>
  const visao = visoes.find((v) => v.id === visaoId)!
  const serie = visao.dados(data).map(([nome, valor]) => ({ nome: label(nome), valor }))
  const total = serie.reduce((a, b) => a + b.valor, 0)
  const maior = serie[0]
  const mensal = data.serieMensal.map((m) => ({ ...m, rotulo: formatMonth(m.mes) }))

  return (
    <>
      <PageHeader eyebrow="Data workspace / analytics" title="Análises" description="Distribuições e tendências calculadas do dataset sintético." status="Dados sintéticos" />
      <div className="mb-6 max-w-xs"><Select aria-label="Visualização" value={visaoId} onChange={(e) => setVisaoId(e.target.value)}>{visoes.map((v) => <option key={v.id} value={v.id}>{v.titulo}</option>)}</Select></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Registros na visão" value={formatNumber(total)} />
        <StatTile label="Categorias" value={String(serie.length)} />
        <StatTile label="Maior grupo" value={maior.nome} hint={`${formatNumber(maior.valor)} · ${formatPercent(maior.valor, total)}`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><ChartNoAxesColumn className="size-5" /></span><div><CardTitle>{visao.titulo}</CardTitle><CardDescription>Contagem absoluta por grupo</CardDescription></div></CardHeader>
          <CardContent className="h-72" role="img" aria-label={`Gráfico de barras: ${visao.titulo}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" {...eixo} tickFormatter={formatNumber} />
                <YAxis type="category" dataKey="nome" width={130} {...eixo} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} formatter={(v) => formatNumber(Number(v))} />
                <Bar isAnimationActive={false} dataKey="valor" name="Registros" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><PieIcon className="size-5" /></span><div><CardTitle>Composição</CardTitle><CardDescription>Participação percentual</CardDescription></div></CardHeader>
          <CardContent>
            <div className="h-48" role="img" aria-label={`Gráfico de rosca: ${visao.titulo}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie isAnimationActive={false} data={serie} dataKey="valor" nameKey="nome" innerRadius="58%" outerRadius="90%" stroke="var(--card)" strokeWidth={2}>
                    {serie.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatNumber(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {serie.slice(0, 6).map((item, i) => (
                <li key={item.nome} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: CORES[i % CORES.length] }} /><span className="flex-1 text-muted-foreground">{item.nome}</span><strong>{formatPercent(item.valor, total)}</strong></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><TrendingUp className="size-5" /></span><div><CardTitle>Últimos 12 meses</CardTitle><CardDescription>Chamados abertos e movimentações por mês; o último mês é parcial (até a data de referência)</CardDescription></div></CardHeader>
        <CardContent className="h-72" role="img" aria-label="Gráfico de linhas com chamados e movimentações por mês">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mensal} margin={{ left: 0, right: 16, top: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="rotulo" {...eixo} />
              <YAxis {...eixo} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line isAnimationActive={false} type="monotone" dataKey="movimentacoes" name="Movimentações" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
              <Line isAnimationActive={false} type="monotone" dataKey="chamados" name="Chamados" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Notice title="Agregados reais do dataset sintético.">Os números foram calculados por script a partir dos CSVs versionados; não há processamento no navegador nem dados empresariais. Indicadores estatísticos não confirmam erros sem verificação.</Notice>
    </>
  )
}
