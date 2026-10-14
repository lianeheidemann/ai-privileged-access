// Combina classes condicionais e resolve conflitos de utilitários Tailwind (padrão shadcn/ui).
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
