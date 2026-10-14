// Sexta interface: visualização e exportação de relatórios ilustrativos, sem dados empresariais.
import { useState } from 'react'
import { Download, FileText, ShieldCheck, Table2, BarChart3 } from 'lucide-react'

type Report = {id:string; title:string; source:string; description:string; columns:string[]; rows:string[][]}
const reports:Report[]=[
  {id:'inventario',title:'Resumo de equipamentos',source:'Equipamentos',description:'Amostra de itens por setor e situação.',columns:['Item','Setor','Situação'],rows:[['Notebook','Tecnologia','Em uso'],['Monitor','Administrativo','Disponível'],['Projetor','Educação','Manutenção']]},
  {id:'atendimentos',title:'Panorama de chamados',source:'Chamados',description:'Amostra de solicitações e seus estados.',columns:['Chamado','Tipo','Situação'],rows:[['CH-001','Equipamento','Aberto'],['CH-002','Acesso','Em andamento'],['CH-003','Manutenção','Concluído']]},
  {id:'operacoes',title:'Movimentações recentes',source:'Movimentações',description:'Amostra de operações de inventário.',columns:['Registro','Item','Operação'],rows:[['MOV-001','EQ-001','Entrada'],['MOV-002','EQ-004','Saída'],['MOV-003','EQ-002','Transferência']]},
]
function exportCsv(report:Report) {
  const quote=(v:string)=>'"'+v.replace(/"/g,'""')+'"'
  const csv='\uFEFF'+[report.columns,...report.rows].map(row=>row.map(quote).join(';')).join('\r\n')
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}))
  const a=document.createElement('a');a.href=url;a.download='dataguard-demo-'+report.id+'.csv';a.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}
export default function Reports(){
  const [id,setId]=useState(reports[0].id)
  const [mode,setMode]=useState<'Tabela'|'Resumo'>('Tabela')
  const report=reports.find(r=>r.id===id)!
  return <>
    <div className="heading"><div><div className="eyebrow">DATA WORKSPACE / REPORTS</div><h1>Relatórios</h1><p>Organize informações e prepare resultados para compartilhar.</p></div><span className="pill"><span className="status-dot"/> Amostras fictícias</span></div>
    <div className="report-list">{reports.map(r=><button className={'report-card '+(r.id===id?'report-card-active':'')} key={r.id} onClick={()=>setId(r.id)}><span className="feature-icon"><FileText size={19}/></span><strong>{r.title}</strong><small>{r.source}</small></button>)}</div>
    <section className="report-preview"><div className="report-preview-head"><div><span className="eyebrow">PRÉVIA DO RELATÓRIO</span><h2>{report.title}</h2><p>{report.description}</p></div><button className="report-download" onClick={()=>exportCsv(report)}><Download size={16}/> Exportar CSV</button></div><div className="report-switch"><button className={mode==='Tabela'?'active':''} onClick={()=>setMode('Tabela')}><Table2 size={16}/> Tabela</button><button className={mode==='Resumo'?'active':''} onClick={()=>setMode('Resumo')}><BarChart3 size={16}/> Resumo</button></div>{mode==='Tabela'?<div className="query-table-wrap"><table className="query-table"><thead><tr>{report.columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{report.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>:<div className="report-overview"><div className="summary-tile"><span>Fonte ilustrada</span><strong className="report-stat-text">{report.source}</strong></div><div className="summary-tile"><span>Linhas da amostra</span><strong>{report.rows.length}</strong></div><div className="summary-tile"><span>Colunas</span><strong>{report.columns.length}</strong></div></div>}</section>
    <div className="source-note"><ShieldCheck size={20}/><span><strong>Demonstração offline.</strong> A exportação gera somente os exemplos exibidos nesta interface. Relatórios reais, permissões e integração com dados corporativos ainda não foram implementados.</span></div>
  </>
}
