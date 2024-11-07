import type { ReactNode } from 'react'
import type React from 'react'
import { createContext, useState, useContext, useCallback, useMemo } from 'react'

import { getUserLanguage } from '@/utils/language'

export type Language = 'english' | 'spanish'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [internalLanguage, setInternalLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem('language')

    if (storedLanguage !== 'english' && storedLanguage !== 'spanish') {
      return getUserLanguage() === 'es' ? 'spanish' : 'english'
    }

    return storedLanguage
  })

  const setLanguage = useCallback((l: Language) => {
    localStorage.setItem('language', l)
    setInternalLanguage(l)
  }, [])

  const contextValue = useMemo(
    () => ({
      language: internalLanguage,
      setLanguage
    }),
    [internalLanguage, setLanguage]
  )

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}
