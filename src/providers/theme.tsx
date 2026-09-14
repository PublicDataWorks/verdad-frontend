import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ResolvedTheme = 'dark' | 'light'
type Theme = ResolvedTheme | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

const toResolvedTheme = (prefersDark: boolean): ResolvedTheme => (prefersDark ? 'dark' : 'light')

const getSystemTheme = (): ResolvedTheme => toResolvedTheme(window.matchMedia(DARK_SCHEME_QUERY).matches)

const getStoredTheme = (storageKey: string): Theme => {
  const stored = localStorage.getItem(storageKey)
  return stored === 'dark' || stored === 'light' ? stored : 'system'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, storageKey = 'app-theme', ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme(storageKey))
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY)
    const onChange = (event: MediaQueryListEvent) => setSystemTheme(toResolvedTheme(event.matches))
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme: Theme) => {
        if (nextTheme === 'system') localStorage.removeItem(storageKey)
        else localStorage.setItem(storageKey, nextTheme)
        setTheme(nextTheme)
      }
    }),
    [theme, resolvedTheme, storageKey]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
