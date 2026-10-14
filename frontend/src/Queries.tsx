// Implementa a terceira tela com consultas simuladas, sem acesso a bancos ou APIs.
import { useState } from 'react'
import { Database, Search, ShieldCheck } from 'lucide-react'

const samples: Record<string, string[][]> = {
  Equipamentos: [['EQ-001','Notebook','Tecnologia','Em uso'],['EQ-002','Monitor','Administrativo','Disponível'],['EQ-003','Impressora','Operações','Em uso'],['EQ-004','Projetor','Educação','Manutenção']],
  Movimentações: [['MOV-001','EQ-001','Tecnologia','Entrada'],['MOV-002','EQ-004','Educação','Saída'],['MOV-003','EQ-002','Administrativo','Transferência']],
  Chamados: [['CH-001','Equipamento','Aberto','Prioridade média'],['CH-002','Acesso','Em andamento','Prioridade baixa'],['CH-003','Manutenção','Concluído','Prioridade alta']],
  Responsáveis: [['R-001','Pessoa fictícia A','Tecnologia','Ativo'],['R-002','Pessoa fictícia B','Administrativo','Ativo']],
  Setores: [['S-001','Tecnologia','Unidade A','Ativo'],['S-002','Administrativo','Unidade B','Ativo']],
  Categorias: [['C-001','Computadores','Inventário','Ativo'],['C-002','Periféricos','Inventário','Ativo']],
}
export default function Queries() {
  const [source,setSource] = useState('Equipamentos')
  const [search,setSearch] = useState('')
  const [run,setRun] = useState(false)
  const [filter,setFilter] = useState('')
  const results = samples[source].filter(row => row.join(' ').toLocaleLowerCase('pt-BR').includes(filter.toLocaleLowerCase('pt-BR')))
  return <>
    <div className="heading"><div><div className="eyebrow">DATA WORKSPACE / QUERIES</div><h1>Consultas</h1><p>Explore informações organizadas por fonte, com filtros simples.</p></div><span className="pill"><span className="status-dot"/> Simulação local</span></div>
    <div className="query-panel"><div className="query-title"><span className="feature-icon"><Search size={20}/></span><div><strong>Nova consulta</strong><p>Selecione uma fonte e visualize uma amostra fictícia.</p></div></div>
      <div className="query-controls"><label className="query-label">Fonte de dados<select className="source-filter" value={source} onChange={e=>{setSource(e.target.value);setRun(false);setSearch('');setFilter('')}}>{Object.keys(samples).map(name=><option key={name}>{name}</option>)}</select></label><label className="query-label">Filtrar resultados<input className="query-input" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ex.: Tecnologia, notebook..."/></label></div>
      <button className="primary" onClick={()=>{setFilter(search);setRun(true)}}><Search size={16}/> Executar demonstração</button>
    </div>
    {run && <div className="query-results"><div className="query-result-head"><div><h2>Resultados</h2><p>{results.length} de {samples[source].length} exemplos ilustrativos</p></div><span className="query-chip">Amostra estática</span></div><div className="query-table-wrap"><table className="query-table"><thead><tr><th>ID</th><th>Descrição</th><th>Área / Estado</th><th>Situação</th></tr></thead><tbody>{results.length ? results.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i}>{cell}</td>)}</tr>) : <tr><td colSpan={4}>Nenhum exemplo encontrado para o filtro.</td></tr>}</tbody></table></div></div>}
    <div className="source-note"><ShieldCheck size={20}/><span><strong>Demonstração sem acesso a dados reais.</strong> Os resultados desta página são exemplos criados para testar a interface. Não são consultas executadas no dataset CSV, no banco de dados ou por IA.</span></div>
  </>
}
