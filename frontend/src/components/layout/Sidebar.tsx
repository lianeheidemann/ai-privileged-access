// Menu lateral fixo no desktop e gaveta no mobile.
import { ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { sections, type Section } from './navigation'

interface Props {
  active: Section
  open: boolean
  onNavigate: (section: Section) => void
  onClose: () => void
}

export function Sidebar({ active, open, onNavigate, onClose }: Props) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" aria-label="Fechar menu" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar px-4 pb-5 pt-7 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-2 pb-10">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary"><ShieldCheck className="size-5" /></span>
          <span className="text-lg font-bold tracking-tight">
            DataGuard <span className="text-primary">AI</span>
            <small className="mt-0.5 block text-[9px] font-semibold tracking-[0.18em] text-muted-foreground">PRIVATE DATA WORKSPACE</small>
          </span>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" aria-label="Fechar menu" onClick={onClose}><X /></Button>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-muted-foreground">WORKSPACE</div>
        <nav aria-label="Navegação principal" className="grid gap-1">
          {sections.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onNavigate(name)}
              aria-current={active === name ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-card',
                active === name && 'bg-accent font-bold text-foreground',
              )}
            >
              <Icon className={cn('size-[18px]', active === name && 'text-primary')} />
              {name}
              {active === name && <span className="absolute right-0 h-5 w-[3px] rounded bg-primary" />}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-border px-3 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold"><span className="size-1.5 rounded-full bg-success" />Ambiente demonstrativo</div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Dados 100% sintéticos. Sem conexão com bancos reais, API ou IA.</p>
        </div>
      </aside>
    </>
  )
}
