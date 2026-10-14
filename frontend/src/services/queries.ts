// Hooks TanStack Query sobre a API simulada; trocar demo-api por chamadas fetch('/api/...') na etapa 05.
import { useQuery } from '@tanstack/react-query'
import { getResumo, getTabela } from './demo-api'
import type { NomeTabela } from '@/types'

export const useResumo = () => useQuery({ queryKey: ['resumo'], queryFn: getResumo, staleTime: Infinity })

export const useTabela = <T extends NomeTabela>(nome: T) =>
  useQuery({ queryKey: ['tabela', nome], queryFn: () => getTabela(nome), staleTime: Infinity })
