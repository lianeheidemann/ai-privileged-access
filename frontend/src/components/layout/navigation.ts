// Seções do workspace e seus ícones.
import { BarChart3, Database, FileText, LayoutDashboard, MessageSquareText, Search, Settings2, type LucideIcon } from 'lucide-react'

export type Section = 'Visão geral' | 'Fontes de dados' | 'Consultas' | 'Análises' | 'Assistente' | 'Relatórios' | 'Configurações'

export const sections: { name: Section; icon: LucideIcon }[] = [
  { name: 'Visão geral', icon: LayoutDashboard },
  { name: 'Fontes de dados', icon: Database },
  { name: 'Consultas', icon: Search },
  { name: 'Análises', icon: BarChart3 },
  { name: 'Assistente', icon: MessageSquareText },
  { name: 'Relatórios', icon: FileText },
  { name: 'Configurações', icon: Settings2 },
]
