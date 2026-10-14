// Quinta interface: assistente demonstrativo com respostas pré-definidas, sem modelo de IA conectado.
import { useState } from 'react'
import { ArrowUp, Bot, MessageSquareText, RotateCcw, ShieldCheck, Sparkles, UserRound } from 'lucide-react'

type Message = {role:'assistant'|'user'; text:string}
const prompts=[
  'Quais fontes de dados estão disponíveis?',
  'Quantos registros existem no conjunto de equipamentos?',
  'Como posso consultar os chamados?',
  'Como funcionará a privacidade dos dados?'
]
function answer(question:string) {
  const q=question.toLocaleLowerCase('pt-BR')
  if(q.includes('fonte')||q.includes('disponív'))return 'O projeto possui seis conjuntos sintéticos para demonstração: equipamentos (750 registros), movimentações (2.095), chamados (1.196), responsáveis (90), setores (18) e categorias (12). Eles ainda não estão conectados a este assistente.'
  if(q.includes('equipamento')||q.includes('quantos'))return 'O conjunto sintético de equipamentos possui 750 registros, conforme a documentação do projeto. Este valor é uma referência estática, não o resultado de uma consulta executada.'
  if(q.includes('chamado')||q.includes('consult'))return 'Na interface Consultas, selecione a fonte desejada e experimente os filtros. Atualmente, os resultados são amostras fictícias; consultas reais serão implementadas na API interna.'
  if(q.includes('privacidade')||q.includes('segurança')||q.includes('dados'))return 'A arquitetura planejada prevê processamento local, autorização no backend e acesso restrito às fontes permitidas. Esses controles ainda precisam ser implementados e testados.'
  return 'Esta é uma prévia visual do assistente. Ainda não há modelo de linguagem conectado; experimente uma das perguntas sugeridas para visualizar respostas de demonstração.'
}
export default function Assistant() {
  const [messages,setMessages]=useState<Message[]>([{role:'assistant',text:'Olá! Este é o espaço planejado para conversar com os dados da empresa. Por enquanto, posso mostrar apenas respostas demonstrativas.'}])
  const [draft,setDraft]=useState('')
  const send=(value:string)=>{const question=value.trim();if(!question)return;setMessages(m=>[...m,{role:'user',text:question},{role:'assistant',text:answer(question)}]);setDraft('')}
  return <div className="assistant-page">
    <div className="heading"><div><div className="eyebrow">DATA WORKSPACE / ASSISTANT</div><h1>Assistente</h1><p>Uma forma simples de explorar informações usando linguagem natural.</p></div><span className="pill"><span className="status-dot"/> Modo demonstração</span></div>
    <div className="assistant-shell">
      <div className="assistant-header"><div className="assistant-heading-icon"><Sparkles size={19}/></div><div><strong>Assistente privado</strong><small>Respostas ilustrativas · IA não conectada</small></div><button className="assistant-reset" title="Limpar conversa" onClick={()=>setMessages([{role:'assistant',text:'Conversa reiniciada. Escolha uma pergunta para experimentar a demonstração.'}])}><RotateCcw size={16}/> <span>Limpar</span></button></div>
      <div className="assistant-chat" aria-live="polite">{messages.map((m,i)=><div key={i} className={'assistant-message '+m.role}><span className="assistant-avatar">{m.role==='assistant'?<Bot size={17}/>:<UserRound size={17}/>}</span><div className="assistant-bubble">{m.text}</div></div>)}</div>
      {messages.length===1&&<div className="assistant-suggestions"><div className="assistant-suggest-title"><MessageSquareText size={15}/> Perguntas para experimentar</div><div className="assistant-prompt-grid">{prompts.map(p=><button key={p} onClick={()=>send(p)}>{p}</button>)}</div></div>}
      <form className="assistant-compose" onSubmit={e=>{e.preventDefault();send(draft)}}><label className="assistant-input-wrap"><span className="sr-only">Mensagem</span><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Escreva sua pergunta..." maxLength={500}/></label><button type="submit" className="assistant-send" disabled={!draft.trim()} aria-label="Enviar pergunta"><ArrowUp size={19}/></button></form>
    </div>
    <div className="source-note"><ShieldCheck size={20}/><span><strong>Somente demonstração.</strong> As respostas são textos predefinidos no frontend, não gerados por Ollama nem baseados em consultas reais. Nenhuma mensagem é enviada para um servidor.</span></div>
  </div>
}
