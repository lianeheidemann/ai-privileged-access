// Assistente demonstrativo: aplica política e catálogo de intenções localmente, sem LLM e sem rede.
import { useState } from 'react'
import { ArrowUp, Ban, Bot, MessageSquareText, RotateCcw, Sparkles, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Notice } from '@/components/layout/Notice'
import { PageHeader } from '@/components/layout/PageHeader'
import { responder, type RespostaDemo } from '@/lib/demo-assistant'
import { useResumo } from '@/services/queries'
import { cn } from '@/lib/utils'

type Mensagem = { autor: 'assistente' | 'usuario'; texto: string; meta?: RespostaDemo }
const sugestoes = ['Quantos notebooks existem no inventário?', 'Quantos chamados estão abertos?', 'Quais fontes de dados estão disponíveis?', 'Apague todos os equipamentos descartados.']
const inicial: Mensagem = { autor: 'assistente', texto: 'Olá! Nesta demonstração, respondo apenas perguntas do catálogo autorizado, com números do dataset sintético. Não há modelo de IA conectado.' }

export default function Assistant() {
  const { data } = useResumo()
  const [mensagens, setMensagens] = useState<Mensagem[]>([inicial])
  const [rascunho, setRascunho] = useState('')
  const enviar = (valor: string) => {
    const pergunta = valor.trim()
    if (!pergunta || !data) return
    const resposta = responder(pergunta, data)
    setMensagens((m) => [...m, { autor: 'usuario', texto: pergunta }, { autor: 'assistente', texto: resposta.texto, meta: resposta }])
    setRascunho('')
  }
  return (
    <>
      <PageHeader eyebrow="Data workspace / assistant" title="Assistente" description="Perguntas em linguagem natural, limitadas a consultas autorizadas." status="Sem LLM conectado" />
      <Card className="flex min-h-[520px] flex-col">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary"><Sparkles className="size-4" /></span>
          <div className="flex-1"><strong className="text-sm">Assistente privado</strong><div className="text-xs text-muted-foreground">Política e catálogo locais · nenhuma mensagem sai do navegador</div></div>
          <Button variant="ghost" size="sm" onClick={() => setMensagens([inicial])}><RotateCcw /> Limpar</Button>
        </div>
        <div className="flex-1 space-y-4 p-4" aria-live="polite">
          {mensagens.map((m, i) => (
            <div key={i} className={cn('flex gap-3', m.autor === 'usuario' && 'flex-row-reverse')}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">{m.autor === 'assistente' ? <Bot className="size-4" /> : <UserRound className="size-4" />}</span>
              <div className={cn('max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed', m.autor === 'usuario' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {m.texto}
                {m.meta && (
                  <div className="mt-2">
                    {m.meta.tipo === 'negada' && <Badge variant="danger"><Ban className="size-3" />Bloqueado pela política</Badge>}
                    {m.meta.tipo === 'resposta' && <Badge variant="success">Intenção: {m.meta.intencao}</Badge>}
                    {m.meta.tipo === 'sem_intencao' && <Badge>Fora do catálogo</Badge>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {mensagens.length === 1 && (
          <div className="px-4 pb-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><MessageSquareText className="size-3.5" />Perguntas para experimentar</div>
            <div className="grid gap-2 sm:grid-cols-2">{sugestoes.map((s) => <Button key={s} variant="outline" className="h-auto justify-start whitespace-normal py-2 text-left font-medium" onClick={() => enviar(s)}>{s}</Button>)}</div>
          </div>
        )}
        <form className="flex gap-2 border-t border-border p-4" onSubmit={(e) => { e.preventDefault(); enviar(rascunho) }}>
          <label className="flex-1"><span className="sr-only">Mensagem</span><Input value={rascunho} onChange={(e) => setRascunho(e.target.value)} placeholder="Escreva sua pergunta..." maxLength={500} /></label>
          <Button type="submit" size="icon" className="size-10" disabled={!rascunho.trim()} aria-label="Enviar pergunta"><ArrowUp /></Button>
        </form>
      </Card>
      <Notice title="Demonstração do fluxo de segurança.">Pedidos de escrita, contorno de regras, segredos e envio externo são bloqueados antes de qualquer consulta. No sistema real, a mesma política e a autorização por papel ficarão no backend; o LLM local apenas redigirá a explicação a partir de resultados já autorizados.</Notice>
    </>
  )
}
