// Apresenta o catálogo demonstrativo de fontes sintéticas, com busca e detalhes locais.
import { useState } from 'react'
import { Database, Search, ShieldCheck, X } from 'lucide-react'

const datasets = [
  {name:'Equipamentos',category:'Inventário',records:750,description:'Itens cadastrados para o ambiente de demonstração.',fields:'Identificador, categoria, setor, responsável'},
  {name:'Movimentações',category:'Operações',records:2095,description:'Histórico sintético de movimentações de equipamentos.',fields:'Identificador, equipamento, data, origem, destino'},
  {name:'Chamados',category:'Atendimentos',records:1196,description:'Solicitações e atendimentos do cenário fictício.',fields:'Identificador, assunto, status, data'},
  {name:'Responsáveis',category:'Cadastros',records:90,description:'Pessoas fictícias associadas aos registros.',fields:'Identificador, nome, setor'},
  {name:'Setores',category:'Cadastros',records:18,description:'Estrutura organizacional de demonstração.',fields:'Identificador, nome do setor'},
  {name:'Categorias',category:'Cadastros',records:12,description:'Classificações utilizadas no inventário.',fields:'Identificador, descrição'},
]
export default function DataSources() {
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('Todas')
  const [selected,setSelected]=useState<string|null>(null)
  const filtered=datasets.filter(d=>(category==='Todas'||d.category===category)&&[d.name,d.category].join(' ').toLowerCase().includes(query.toLowerCase()))
  const detail=datasets.find(d=>d.name===selected)
  const format=(n:number)=>new Intl.NumberFormat('pt-BR').format(n)
  return <>
    <div className="heading"><div><div className="eyebrow">DATA WORKSPACE / SOURCES</div><h1>Fontes de dados</h1><p>Conheça os conjuntos de dados disponíveis para consulta.</p></div><span className="pill"><span className="status-dot"/> Dados fictícios</span></div>
    <div className="source-summary"><div className="summary-tile"><span>Conjuntos</span><strong>06</strong></div><div className="summary-tile"><span>Registros</span><strong>4.161</strong></div><div className="summary-tile"><span>Ambiente</span><strong>Demo</strong></div></div>
    <div className="section-heading"><div><h2>Catálogo de fontes</h2><p>Explore os dados sintéticos previstos para o protótipo.</p></div></div>
    <div className="sources-toolbar"><label className="source-search"><Search size={17}/><input aria-label="Buscar fontes" type="search" placeholder="Buscar conjunto de dados" value={query} onChange={e=>setQuery(e.target.value)}/></label><select className="source-filter" aria-label="Filtrar fontes" value={category} onChange={e=>setCategory(e.target.value)}>{['Todas','Inventário','Operações','Atendimentos','Cadastros'].map(c=><option key={c} value={c}>{c==='Todas'?'Todas as fontes':c}</option>)}</select></div>
    <div className="source-list">{filtered.length?filtered.map(d=><div className="source-card" key={d.name}><span className="source-card-icon"><Database size={21}/></span><div className="source-card-info"><strong>{d.name}</strong><p>{d.description}</p></div><div className="source-card-side"><strong>{format(d.records)}</strong><span>registros sintéticos</span></div><button className="source-open" onClick={()=>setSelected(selected===d.name?null:d.name)}>Detalhes</button></div>):<div className="empty-source">Nenhuma fonte corresponde à busca.</div>}</div>
    {detail&&<div className="source-detail"><div className="detail-top"><h3>{detail.name}</h3><button className="source-open" onClick={()=>setSelected(null)} aria-label="Fechar detalhes"><X size={15}/></button></div><div className="detail-grid"><div className="detail-cell"><small>Categoria</small><strong>{detail.category}</strong></div><div className="detail-cell"><small>Registros</small><strong>{format(detail.records)}</strong></div><div className="detail-cell"><small>Origem</small><strong>CSV sintético</strong></div></div><p className="disclaimer"><strong>Campos ilustrativos:</strong> {detail.fields}. Nenhum arquivo foi carregado nesta prévia.</p></div>}
    <div className="source-note"><ShieldCheck size={21}/><span><strong>Ambiente de demonstração.</strong> Estes conjuntos representam dados fictícios documentados no projeto. Conexões corporativas e permissões serão implementadas posteriormente.</span></div>
  </>
}
