// Visão geral: contexto do protótipo, atalhos e totais reais do dataset sintético.
import { Activity, ArrowUpRight, Database, FileText, MessageSquareText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatTile } from '@/components/layout/StatTile'
import type { Section } from '@/components/layout/navigation'
import { useResumo } from '@/services/queries'
import { formatDate, formatNumber } from '@/lib/format'

const atalhos: { section: Section; icon: typeof Database; title: string; text: string }[] = [
  { section: 'Fontes de dados', icon: Database, title: 'Fontes de dados', text: 'Veja os conjuntos sintéticos disponíveis.' },
  { section: 'Assistente', icon: MessageSquareText, title: 'Assistente privado', text: 'Perguntas restritas a um catálogo autorizado.' },
  { section: 'Relatórios', icon: FileText, title: 'Relatórios', text: 'Reúna resultados e exporte com segurança.' },
]

export default function Overview({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { data } = useResumo()
  const totais = data?.totais
  const totalRegistros = totais ? Object.values(totais).reduce((a, b) => a + b, 0) : 0
  return (
    <>
      <PageHeader eyebrow="Data workspace / overview" title="Visão geral" description="Um espaço para consultar, organizar e compreender dados autorizados." status="Protótipo visual" />
      <Card className="relative overflow-hidden p-7 sm:p-9">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[11px] font-bold tracking-widest text-primary"><Activity className="size-3.5" />AMBIENTE LOCAL</span>
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">IA privada sobre dados autorizados.<br />Sem inferência externa.</h2>
          <p className="mt-3 text-sm text-muted-foreground">Consultas, análises e relatórios com autorização aplicada no backend e modelo executado localmente. Esta prévia usa apenas o dataset sintético.</p>
          <Button className="mt-6" onClick={() => onNavigate('Consultas')}>Explorar consultas <ArrowUpRight /></Button>
        </div>
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-72 rounded-full border border-border opacity-70" />
        <div aria-hidden="true" className="absolute -bottom-24 right-24 size-56 rounded-full bg-accent opacity-60" />
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Registros sintéticos" value={formatNumber(totalRegistros)} hint="Seis tabelas de domínio" />
        <StatTile label="Equipamentos" value={formatNumber(totais?.equipamentos ?? 0)} hint="Inventário fictício de TI" />
        <StatTile label="Data de referência" value={data ? formatDate(data.dataReferencia) : '—'} hint="Fixa, para resultados reproduzíveis" />
      </div>

      <h2 className="mt-10 text-lg font-bold">Áreas de trabalho</h2>
      <p className="text-sm text-muted-foreground">Acesse as principais funcionalidades planejadas.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {atalhos.map(({ section, icon: Icon, title, text }) => (
          <button key={section} onClick={() => onNavigate(section)} className="group rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60">
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><Icon className="size-5" /></span>
            <strong className="mt-4 flex items-center justify-between">{title}<ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" /></strong>
            <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
          </button>
        ))}
      </div>
      <Notice title="Protótipo visual.">Os totais vêm do dataset sintético versionado (gerados por script, sem API). Nenhuma consulta, autenticação ou modelo de IA está conectado.</Notice>
    </>
  )
}
