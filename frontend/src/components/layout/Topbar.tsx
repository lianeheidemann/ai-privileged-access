// Barra superior com trilha, selo de ambiente e alternância de tema.
import { Menu, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/lib/preferences'
import type { Section } from './navigation'

export function Topbar({ active, onOpenMenu }: { active: Section; onOpenMenu: () => void }) {
  const { dark, setDark } = usePreferences()
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-8 lg:px-11">
      <div className="flex items-center gap-3 text-sm">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={onOpenMenu}><Menu /></Button>
        <span className="hidden text-muted-foreground sm:inline">Workspace</span>
        <span className="hidden text-muted-foreground sm:inline">/</span>
        <strong>{active}</strong>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-md border border-border px-2.5 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground sm:inline">DEMONSTRAÇÃO</span>
        <Button variant="ghost" size="icon" aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={() => setDark(!dark)}>
          {dark ? <Sun /> : <Moon />}
        </Button>
        <span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-bold text-primary" aria-hidden="true">DG</span>
      </div>
    </header>
  )
}
