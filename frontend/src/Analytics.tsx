// Quarta interface: análises demonstrativas com filtros e gráficos de dados sintéticos ilustrativos.
import { useState } from 'react'
import { BarChart3, ChartNoAxesColumn, ShieldCheck, TrendingUp } from 'lucide-react'

type Dataset = 'Equipamentos' | 'Chamados' | 'Movimentações'
const samples: Record<Dataset, { total: number; label: string; values: {name:string;value:number}[] }> = {
  Equipamentos: { total: 750, label: 'Distribuição ilustrativa por situação', values: [{name:'Em uso',value:420},{name:'Disponíveis',value:195},{name:'Manutenção',value:90},{name:'Outros',value:45}] },
  Chamados: { total: 1196, label: 'Distribuição ilustrativa por situação', values: [{name:'Concluídos',value:728},{name:'Em andamento',value:278},{name:'Abertos',value:190}] },
  Movimentações: { total: 2095, label: 'Distribuição ilustrativa por tipo', values: [{name:'Transferências',value:970},{name:'Entradas',value:680},{name:'Saídas',value:445}] },
}
export default function Analytics() {
  const [source,setSource] = useState<Dataset>('Equipamentos')
  const [view,setView] = useState<'Barras'|'Proporções'>('Barras')
  const data = samples[source]
  const max = Math.max(...data.values.map(v=>v.value))
  const fmt = (n:number) => new Intl.NumberFormat('pt-BR').format(n)
  return <>
    <div className="heading"><div><div className="eyebrow">DATA WORKSPACE / ANALYTICS</div><h1>Análises</h1><p>Explore distribuições e resumos de forma clara.</p></div><span className="pill"><span className="status-dot"/> Dados ilustrativos</span></div>
    <div className="analytics-toolbar"><label className="query-label">Conjunto de dados<select className="source-filter" value={source} onChange={e=>setSource(e.target.value as Dataset)}>{Object.keys(samples).map(s=><option key={s}>{s}</option>)}</select></label><label className="query-label">Visualização<select className="source-filter" value={view} onChange={e=>setView(e.target.value as 'Barras'|'Proporções')}><option>Barras</option><option>Proporções</option></select></label></div>
    <div className="analytics-stats"><div className="summary-tile"><span>Registros de referência</span><strong>{fmt(data.total)}</strong></div><div className="summary-tile"><span>Categorias exibidas</span><strong>{data.values.length}</strong></div><div className="summary-tile"><span>Maior categoria</span><strong className="analytics-stat-label">{data.values.reduce((a,b)=>a.value>b.value?a:b).name}</strong></div></div>
    <div className="analytics-layout"><section className="analytics-panel"><div className="analytics-panel-title"><span className="feature-icon"><ChartNoAxesColumn size={19}/></span><div><h2>Distribuição dos registros</h2><p>{data.label}</p></div></div><div className="analytics-bars">{data.values.map((item,i)=><div className="analytics-bar-row" key={item.name}><div className="analytics-bar-label"><span>{item.name}</span><strong>{view==='Barras'?fmt(item.value):((item.value/data.total)*100).toFixed(1).replace('.',',')+'%'}</strong></div><div className="analytics-track"><div className="analytics-fill" style={{width:((item.value/(view==='Barras'?max:data.total))*100)+'%',opacity:1-i*.12}}/></div></div>)}</div><p className="analytics-footnote">Valores de exemplo para avaliar a apresentação visual. Não foram calculados a partir dos CSVs.</p></section><section className="analytics-panel analytics-insights"><div className="analytics-panel-title"><span className="feature-icon"><TrendingUp size={19}/></span><div><h2>Resumo</h2><p>Leitura rápida da distribuição</p></div></div><div className="analytics-highlight"><span>Categoria mais representativa</span><strong>{data.values.reduce((a,b)=>a.value>b.value?a:b).name}</strong><small>{fmt(max)} registros ilustrativos</small></div><div className="analytics-detail-list">{data.values.map(item=><div key={item.name}><span>{item.name}</span><strong>{((item.value/data.total)*100).toFixed(1).replace('.',',')}%</strong></div>)}</div></section></div>
    <div className="source-note"><ShieldCheck size={20}/><span><strong>Protótipo visual.</strong> Os números das categorias são fictícios. Apenas os totais dos conjuntos correspondem ao inventário sintético documentado; ainda não há processamento real, API ou IA nesta tela.</span></div>
  </>
}
