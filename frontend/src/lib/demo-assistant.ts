// Simula o fluxo planejado do assistente sem LLM: pergunta → política → intenção do catálogo → resultado.
// Bloqueia pedidos de escrita, contorno de regras, segredos e envio externo antes de qualquer consulta.
// Os números vêm do resumo sintético, nunca de texto gerado.
import type { ResumoDataset } from '@/types'
import { formatNumber, label } from './format'

export type TipoResposta = 'resposta' | 'negada' | 'sem_intencao'
export interface RespostaDemo {
  tipo: TipoResposta
  texto: string
  intencao?: string
}

const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const BLOQUEIOS: { padrao: RegExp; motivo: string }[] = [
  { padrao: /\b(apag|delet|remov|exclu|update|insert|drop|alter|truncat|grav|modifi)/, motivo: 'o assistente não executa operações de escrita' },
  { padrao: /\b(ignore|ignora|desconsider|voce agora|finja|administrador)/, motivo: 'instruções não alteram as políticas de acesso' },
  { padrao: /\b(senha|credencia|token|caminho do arquivo|gabarito)/, motivo: 'segredos, caminhos internos e o gabarito de avaliação não são expostos' },
  { padrao: /https?:\/\/|\benvie\b|\benviar\b/, motivo: 'resultados não são enviados a destinos externos' },
  { padrao: /\b(gere|gerar|escreva|execute|rode)\b.*\bsql\b|\bselect\b.+\bfrom\b/, motivo: 'SQL livre não é aceito; apenas consultas do catálogo' },
]

const STATUS: Record<string, string> = { manutencao: 'manutencao', descartad: 'descartado', estoque: 'estoque', ativo: 'ativo' }

export function responder(pergunta: string, dados: ResumoDataset): RespostaDemo {
  const q = normalizar(pergunta)
  const bloqueio = BLOQUEIOS.find((b) => b.padrao.test(q))
  if (bloqueio) return { tipo: 'negada', texto: `Pedido negado: ${bloqueio.motivo}. Nenhuma consulta foi executada e nenhum dado foi alterado.` }

  if (/\b(fonte|conjunto|tabela)s?\b/.test(q)) {
    const lista = Object.entries(dados.totais).map(([nome, n]) => `${nome} (${formatNumber(n)})`).join(', ')
    return { tipo: 'resposta', intencao: 'listar_fontes', texto: `Fontes sintéticas disponíveis: ${lista}.` }
  }
  if (/chamados?/.test(q) && /abert/.test(q)) {
    const abertos = dados.chamadosPorStatus.find(([s]) => s === 'aberto')?.[1] ?? 0
    return { tipo: 'resposta', intencao: 'chamados_abertos', texto: `Há ${formatNumber(abertos)} chamados abertos no dataset sintético.` }
  }
  const categoria = dados.equipamentosPorCategoria.find(([nome]) => q.includes(normalizar(nome).slice(0, Math.max(5, nome.length - 2))))
  if (categoria && /quant|total|exist/.test(q)) {
    return { tipo: 'resposta', intencao: 'contagem_por_categoria', texto: `Existem ${formatNumber(categoria[1])} equipamentos da categoria ${categoria[0]}.` }
  }
  const status = Object.entries(STATUS).find(([radical]) => q.includes(radical))
  if (status && /quant|total/.test(q)) {
    const n = dados.equipamentosPorStatus.find(([s]) => s === status[1])?.[1] ?? 0
    return { tipo: 'resposta', intencao: 'contagem_por_status', texto: `${formatNumber(n)} equipamentos com status "${label(status[1])}".` }
  }
  return {
    tipo: 'sem_intencao',
    texto: 'Não há uma consulta autorizada para essa pergunta no catálogo da demonstração. Experimente perguntar sobre fontes, categorias, status ou chamados abertos.',
  }
}
