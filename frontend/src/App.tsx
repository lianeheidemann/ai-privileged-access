// Shell do protótipo visual: navegação entre as sete telas, sem backend, banco ou IA conectados.
import { lazy, Suspense, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import type { Section } from '@/components/layout/navigation'
import Overview from '@/pages/Overview'

// As demais telas são carregadas sob demanda para manter o pacote inicial pequeno.
const DataSources = lazy(() => import('@/pages/DataSources'))
const Queries = lazy(() => import('@/pages/Queries'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Assistant = lazy(() => import('@/pages/Assistant'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))

export default function App() {
  const [active, setActive] = useState<Section>('Visão geral')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = (section: Section) => {
    setActive(section)
    setMenuOpen(false)
  }
  const pages: Record<Section, JSX.Element> = {
    'Visão geral': <Overview onNavigate={navigate} />,
    'Fontes de dados': <DataSources />,
    Consultas: <Queries />,
    Análises: <Analytics />,
    Assistente: <Assistant />,
    Relatórios: <Reports />,
    Configurações: <Settings />,
  }
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar active={active} open={menuOpen} onNavigate={navigate} onClose={() => setMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <Topbar active={active} onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-11">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>{pages[active]}</Suspense>
        </main>
      </div>
    </div>
  )
}
