// Cabeçalho padrão das páginas, com trilha, título, descrição e selo de estado.
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

interface Props {
  eyebrow: string
  title: string
  description: string
  status: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, status, actions }: Props) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <Badge variant="success"><span className="size-1.5 rounded-full bg-success" />{status}</Badge>
      </div>
    </div>
  )
}
