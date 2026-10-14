// Preferências locais da demonstração (tema e linhas por página), mantidas só em memória.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface Preferences {
  dark: boolean
  setDark: (dark: boolean) => void
  pageSize: number
  setPageSize: (size: number) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return <PreferencesContext.Provider value={{ dark, setDark, pageSize, setPageSize }}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences deve ser usado dentro de PreferencesProvider')
  return ctx
}
