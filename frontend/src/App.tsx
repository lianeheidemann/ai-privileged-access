// Exibe a visão geral demonstrativa, sem conexão com dados empresariais.
import { useState } from 'react'
import DataSources from './DataSources'
import { Activity, ArrowUpRight, BarChart3, ChevronDown, Database, FileText, LayoutDashboard, Menu, MessageSquareText, Moon, Search, Settings2, ShieldCheck, Sun, X } from 'lucide-react'

type Section = 'Visão geral' | 'Fontes de dados' | 'Consultas' | 'Análises' | 'Assistente' | 'Relatórios' | 'Configurações'
const sections: { name: Section; icon: typeof Database }[] = [
  { name: 'Visão geral', icon: LayoutDashboard }, { name: 'Fontes de dados', icon: Database },
  { name: 'Consultas', icon: Search }, { name: 'Análises', icon: BarChart3 },
  { name: 'Assistente', icon: MessageSquareText }, { name: 'Relatórios', icon: FileText },
  { name: 'Configurações', icon: Settings2 },
]
const datasets = [
  { name: 'Equipamentos', kind: 'Inventário sintético', count: '750 registros' },
  { name: 'Movimentações', kind: 'Eventos sintéticos', count: '2.095 registros' },
  { name: 'Chamados', kind: 'Atendimentos sintéticos', count: '1.196 registros' },
]
export default function App() {
  const [active, setActive] = useState<Section>('Visão geral')
  const [light, setLight] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = (section: Section) => { setActive(section); setMenuOpen(false) }
  return <div className={light ? 'app light' : 'app'}>
    {menuOpen && <button className="scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-icon"><ShieldCheck size={21}/></span><span>DataGuard <strong>AI</strong><small>PRIVATE DATA WORKSPACE</small></span><button className="mobile-close icon-button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Navegação principal">{sections.map(({name,icon:Icon}) => <button key={name} className={active === name ? 'nav-item selected' : 'nav-item'} onClick={() => navigate(name)}><Icon size={18}/><span>{name}</span>{active === name && <span className="nav-indicator"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-line"><span className="status-dot"/> Ambiente demonstrativo</div><p>Sem conexão com bancos reais ou serviços de IA.</p></div>
    </aside>
    <div className="main-area">
      <header className="topbar"><div className="top-left"><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={21}/></button><span>Workspace</span><span className="crumb">/</span><strong>{active}</strong></div><div className="top-actions"><span className="environment">DEMONSTRAÇÃO</span><button className="icon-button theme" aria-label={light ? 'Ativar tema escuro' : 'Ativar tema claro'} title="Alternar tema" onClick={() => setLight(!light)}>{light ? <Moon size={18}/> : <Sun size={18}/>}</button><div className="avatar">DG</div></div></header>
      <main className="content">
        {active === 'Visão geral' ? <>
          <div className="heading"><div><div className="eyebrow">DATA WORKSPACE / OVERVIEW</div><h1>Visão geral</h1><p>Um espaço para consultar, organizar e compreender seus dados.</p></div><span className="pill"><span className="status-dot"/> Protótipo visual</span></div>
          <div className="welcome"><div><span className="welcome-tag"><Activity size={14}/> AMBIENTE LOCAL</span><h2>Informações mais acessíveis.<br/>Decisões mais simples.</h2><p>Explore fontes de dados, prepare consultas e visualize resultados em um único ambiente.</p><button className="primary" onClick={() => navigate('Consultas')}>Explorar consultas <ArrowUpRight size={17}/></button></div><div className="welcome-art" aria-hidden="true"><div className="art-grid"/><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="art-dot"/></div></div>
          <div className="section-heading"><div><h2>Áreas de trabalho</h2><p>Acesse as principais funcionalidades planejadas.</p></div></div>
          <div className="feature-grid"><button className="feature" onClick={() => navigate('Fontes de dados')}><span className="feature-icon"><Database size={21}/></span><strong>Fontes de dados</strong><span>Visualize e organize as fontes disponíveis.</span><ArrowUpRight className="feature-arrow" size={17}/></button><button className="feature" onClick={() => navigate('Assistente')}><span className="feature-icon"><MessageSquareText size={21}/></span><strong>Assistente privado</strong><span>Faça perguntas sobre informações autorizadas.</span><ArrowUpRight className="feature-arrow" size={17}/></button><button className="feature" onClick={() => navigate('Relatórios')}><span className="feature-icon"><FileText size={21}/></span><strong>Relatórios</strong><span>Reúna resultados em apresentações claras.</span><ArrowUpRight className="feature-arrow" size={17}/></button></div>
          <div className="section-heading datasets-heading"><div><h2>Dados de demonstração</h2><p>Exemplos do dataset sintético disponível no projeto.</p></div><span className="muted-link">Somente referência <ChevronDown size={15}/></span></div>
          <div className="data-table"><div className="table-head"><span>CONJUNTO</span><span>TIPO</span><span>VOLUME</span></div>{datasets.map(d=><div className="table-row" key={d.name}><span className="dataset-name"><Database size={17}/>{d.name}</span><span>{d.kind}</span><span>{d.count}</span></div>)}</div>
          <p className="disclaimer">Interface inicial de demonstração. Os dados exibidos são referências estáticas do dataset sintético; nenhuma API, consulta ou modelo de IA está conectado.</p>
        </> : active === 'Fontes de dados' ? <DataSources /> : <div className="placeholder"><span className="feature-icon"><span>{(() => {const Icon = sections.find(s => s.name === active)!.icon; return <Icon size={24}/>})()}</span></span><div className="eyebrow">INTERFACE PLANEJADA</div><h1>{active}</h1><p>Esta área será desenvolvida nas próximas etapas. A primeira versão apresenta apenas a navegação e a visão geral.</p><button className="secondary" onClick={() => navigate('Visão geral')}>Voltar à visão geral</button></div>}
      </main>
    </div>
  </div>
}
