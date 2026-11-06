import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { HarmfulRhetoric } from '@/types/snippet'
import type { Language } from '@/providers/language'
import { getHarmfulRhetoric, getSnippetSubtitle } from '../getSnippetSubtitle'
import type { SubtitleSnippet } from '../getSnippetSubtitle'

const rhetoric = (overrides: Partial<HarmfulRhetoric> = {}): HarmfulRhetoric => ({
  score: 82,
  kind: 'gender',
  quote: 'la mujer debe callar',
  harm: { english: 'Says women must stay silent.', spanish: 'Dice que las mujeres deben callar.' },
  ...overrides
})

const renderSubtitle = (snippet: SubtitleSnippet, language: Language = 'english') =>
  render(
    <TooltipProvider delayDuration={0}>
      <p>{getSnippetSubtitle(snippet, language)}</p>
    </TooltipProvider>
  )

describe('getHarmfulRhetoric', () => {
  it.each([
    ['missing scores', undefined],
    ['null scores', null],
    ['no rhetoric block', { level: 'high' as const }],
    ['a null rhetoric block', { harmful_rhetoric: null }],
    ['a score below 70', { harmful_rhetoric: rhetoric({ score: 69 }) }],
    ['a non-numeric score', { harmful_rhetoric: rhetoric({ score: Number.NaN }) }]
  ])('returns null for %s', (_name, scores) => {
    expect(getHarmfulRhetoric(scores)).toBeNull()
  })

  it.each([70, 100])('returns the block at score %i', score => {
    const block = rhetoric({ score })

    expect(getHarmfulRhetoric({ harmful_rhetoric: block })).toBe(block)
  })
})

describe('getSnippetSubtitle harmful-rhetoric badge', () => {
  it('shows no badge below the threshold', () => {
    renderSubtitle({ confidence_scores: { harmful_rhetoric: rhetoric({ score: 40 }) } })

    expect(screen.queryByRole('button', { name: /harmful rhetoric/i })).not.toBeInTheDocument()
  })

  it('shows the English label with the kind and the harm text in its tooltip', async () => {
    renderSubtitle({
      audio_file: { radio_station_code: 'KABC' },
      confidence_scores: { harmful_rhetoric: rhetoric({ kind: 'electioneering' }) }
    })

    const badge = screen.getByRole('button', { name: 'Harmful rhetoric: elections' })
    expect(badge).toBeInTheDocument()

    // Keyboard focus opens the tooltip without the hover delay; the async act also flushes the
    // Popper positioning update so React does not warn about it.
    await act(async () => {
      badge.focus()
      await Promise.resolve()
    })

    expect(screen.getByRole('tooltip')).toHaveTextContent('Says women must stay silent.')
  })

  it('uses Spanish strings and the Spanish harm text', async () => {
    renderSubtitle({ confidence_scores: { harmful_rhetoric: rhetoric() } }, 'spanish')

    const badge = screen.getByRole('button', { name: 'Retórica dañina: género' })
    expect(badge).toBeInTheDocument()

    await act(async () => {
      badge.focus()
      await Promise.resolve()
    })

    expect(screen.getByRole('tooltip')).toHaveTextContent('Dice que las mujeres deben callar.')
  })

  it('still shows the badge, without a qualifier, for an unknown kind', () => {
    renderSubtitle({
      confidence_scores: { harmful_rhetoric: rhetoric({ kind: 'other' as HarmfulRhetoric['kind'] }) }
    })

    expect(screen.getByRole('button', { name: 'Harmful rhetoric' })).toBeInTheDocument()
  })
})
