import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from '../theme'

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'
const STORAGE_KEY = 'app-theme'

type ChangeListener = (event: MediaQueryListEvent) => void

let prefersDark = false
let listeners: ChangeListener[] = []

// Minimal `matchMedia` stand-in: jsdom does not implement it, and the provider needs one that
// both reports the current preference and can emit a change.
const installMatchMedia = () => {
  prefersDark = false
  listeners = []

  const matchMedia = (query: string): MediaQueryList =>
    ({
      matches: query === DARK_SCHEME_QUERY && prefersDark,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: ChangeListener) => listeners.push(listener),
      removeEventListener: (_type: string, listener: ChangeListener) => {
        listeners = listeners.filter(registered => registered !== listener)
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    }) as unknown as MediaQueryList

  Object.defineProperty(window, 'matchMedia', { value: matchMedia, writable: true, configurable: true })
}

const emitSystemChange = (dark: boolean) => {
  prefersDark = dark
  act(() => {
    listeners.forEach(listener => listener({ matches: dark } as MediaQueryListEvent))
  })
}

const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    installMatchMedia()
  })

  afterEach(() => {
    listeners = []
  })

  it('defaults to system and resolves it from the OS preference', () => {
    prefersDark = true

    const { result } = renderHook(useTheme, { wrapper })

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('follows later OS changes while no explicit choice is stored', () => {
    const { result } = renderHook(useTheme, { wrapper })

    expect(result.current.resolvedTheme).toBe('light')

    emitSystemChange(true)

    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('persists an explicit choice and stops following the OS', () => {
    const { result } = renderHook(useTheme, { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')

    emitSystemChange(false)

    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('honours a stored preference from a previous session over the OS', () => {
    localStorage.setItem(STORAGE_KEY, 'light')
    prefersDark = true

    const { result } = renderHook(useTheme, { wrapper })

    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('setTheme("system") clears the stored choice and follows the OS again', () => {
    localStorage.setItem(STORAGE_KEY, 'light')

    const { result } = renderHook(useTheme, { wrapper })

    act(() => {
      result.current.setTheme('system')
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    emitSystemChange(true)

    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('falls back to light when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', { value: undefined, writable: true, configurable: true })

    const { result } = renderHook(useTheme, { wrapper })

    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('removes its change listener on unmount', () => {
    const { unmount } = renderHook(useTheme, { wrapper })

    expect(listeners).toHaveLength(1)

    unmount()

    expect(listeners).toHaveLength(0)
  })
})
