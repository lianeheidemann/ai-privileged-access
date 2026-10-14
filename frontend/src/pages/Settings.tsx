// Configurações: preferências locais (tema e linhas por página) e estado do ambiente.
import { Info, Monitor, Moon, ShieldCheck, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePreferences } from '@/lib/preferences'

const ambiente: [string, string][] = [
  ['Aplicação', 'DataGuard AI — protótipo 0.8'],
  ['Dados', 'Sintéticos (dataset v2)'],
  ['Modelo de IA', 'Não conectado'],
  ['API interna', 'Não conectada'],
  ['Autorização', 'Papéis fictícios planejados no MVP'],
]

export default function Settings() {
  const { dark, setDark, pageSize, setPageSize } = usePreferences()
  return (
    <>
      <PageHeader eyebrow="Data workspace / settings" title="Configurações" description="Preferências da demonstração e informações do ambiente." status="Ambiente local" />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><Monitor className="size-5" /></span><div><CardTitle>Aparência e tabelas</CardTitle><CardDescription>Aplicadas imediatamente; não são salvas após recarregar.</CardDescription></div></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><strong className="text-sm">Tema da interface</strong><p className="text-sm text-muted-foreground">Alterne entre escuro e claro.</p></div>
              <div className="flex gap-2" role="group" aria-label="Tema">
                <Button variant={dark ? 'secondary' : 'outline'} aria-pressed={dark} onClick={() => setDark(true)}><Moon /> Escuro</Button>
                <Button variant={!dark ? 'secondary' : 'outline'} aria-pressed={!dark} onClick={() => setDark(false)}><Sun /> Claro</Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><strong className="text-sm">Linhas por página</strong><p className="text-sm text-muted-foreground">Usado nas tabelas da tela Consultas.</p></div>
              <div className="w-28"><Select aria-label="Linhas por página" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>{[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}</Select></div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><span className="grid size-10 place-items-center rounded-lg bg-accent text-primary"><ShieldCheck className="size-5" /></span><div><CardTitle>Sobre o ambiente</CardTitle><CardDescription>Estado atual do protótipo.</CardDescription></div></CardHeader>
          <CardContent>
            <dl className="divide-y divide-border text-sm">{ambiente.map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>
            <div className="mt-4 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground"><Info className="size-4 shrink-0" />Autenticação, autorização e a conexão com o Ollama local serão implementadas no backend FastAPI.</div>
          </CardContent>
        </Card>
      </div>
      <Notice title="Prévia de interface.">Esta tela não administra permissões, credenciais, servidores ou políticas reais. Nenhuma configuração é enviada para a rede.</Notice>
    </>
  )
}
