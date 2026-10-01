import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LanguageProvider } from '@/providers/language'
import { THEME_STORAGE_KEY, ThemeProvider } from '@/providers/theme'

const renderToggle = () =>
  render(
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          <ModeToggle />
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  )

describe('ModeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('language', 'english')
    document.documentElement.className = ''
  })

  it('flips the resolved theme in one click and stores the explicit choice', () => {
    renderToggle()

    act(() => {
      screen.getByRole('button', { name: 'Switch to dark mode' }).click()
    })

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      screen.getByRole('button', { name: 'Switch to light mode' }).click()
    })

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('labels the action in Spanish', () => {
    localStorage.setItem('language', 'spanish')

    renderToggle()

    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Cambiar a modo oscuro')
  })
})
