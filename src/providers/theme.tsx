import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeProviderProps {
  children: React.ReactNode
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, storageKey = 'app-theme', ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme | null) || 'light')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// The context is created with a default value, so there is nothing to guard against here.
export const useTheme = () => useContext(ThemeProviderContext)
