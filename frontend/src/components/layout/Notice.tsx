// Aviso de rodapé que explicita o caráter demonstrativo de cada tela.
import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 flex gap-3 rounded-xl border border-border bg-muted/60 p-4 text-sm leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
      <span><strong className="text-foreground">{title}</strong> {children}</span>
    </div>
  )
}
