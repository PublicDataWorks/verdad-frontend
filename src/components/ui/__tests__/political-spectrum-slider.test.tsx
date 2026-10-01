import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PoliticalSpectrumSlider from '@/components/ui/political-spectrum-slider'
import type { PoliticalSpectrum } from '@/hooks/useSnippetFilters'
import { LanguageProvider } from '@/providers/language'

// The Radix slider measures its thumb with ResizeObserver, which jsdom does not implement.
const ResizeObserverStub = function ResizeObserverStub() {
  return { observe: () => {}, unobserve: () => {}, disconnect: () => {} }
} as unknown as typeof ResizeObserver

globalThis.ResizeObserver ??= ResizeObserverStub

const showSlider = (value: PoliticalSpectrum | undefined) => {
  const onChange = vi.fn()
  render(
    <LanguageProvider>
      <PoliticalSpectrumSlider value={value} onChange={onChange} />
    </LanguageProvider>
  )
  return onChange
}

describe('PoliticalSpectrumSlider', () => {
  beforeEach(() => {
    localStorage.setItem('language', 'english')
  })

  it('selects an unlabeled position from its tick', async () => {
    const onChange = showSlider(undefined)

    await userEvent.click(screen.getByRole('button', { name: 'Center Right' }))

    expect(onChange).toHaveBeenCalledWith('center-right')
  })

  it('selects a position from its text label', async () => {
    const onChange = showSlider(undefined)

    await userEvent.click(screen.getByText('Left'))

    expect(onChange).toHaveBeenCalledWith('left')
  })

  it('ignores a click on the position that is already selected', async () => {
    const onChange = showSlider('center')

    const [tick, label] = screen.getAllByRole('button', { name: 'Center' })
    await userEvent.click(tick)
    await userEvent.click(label)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps ticks and labels out of the tab order, leaving the thumb as the keyboard control', () => {
    showSlider(undefined)

    screen
      .getAllByRole('button')
      .filter(button => button.textContent !== 'Clear')
      .forEach(button => expect(button).toHaveAttribute('tabindex', '-1'))
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'All')
  })

  it('disables Clear while All is selected', () => {
    showSlider(undefined)

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  it('clears a selected position', async () => {
    const onChange = showSlider('left')

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})
