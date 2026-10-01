import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useSnippetFilters from '../useSnippetFilters'

const withRouter =
  (initialEntry: string) =>
  ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>

// Exposes both the hook and the live URL so tests can assert on the search string it writes.
const useFiltersWithLocation = () => ({ ...useSnippetFilters(), search: useLocation().search })

describe('useSnippetFilters', () => {
  it('parses comma-separated and scalar params, defaulting timespan to 7d', () => {
    const { result } = renderHook(useFiltersWithLocation, {
      wrapper: withRouter('/search?languages=spanish,english&politicalSpectrum=center-left&order_by=upvotes')
    })

    expect(result.current.filters.languages).toEqual(['spanish', 'english'])
    expect(result.current.filters.politicalSpectrum).toBe('center-left')
    expect(result.current.filters.order_by).toBe('upvotes')
    expect(result.current.filters.timespan).toBe('7d')
    expect(result.current.filters.labels).toEqual([])
    expect(result.current.isEmpty()).toBe(false)
  })

  it('writes a filter to the URL and only serializes non-empty values', () => {
    const { result } = renderHook(useFiltersWithLocation, { wrapper: withRouter('/search') })

    expect(result.current.isEmpty()).toBe(true)

    act(() => {
      result.current.setFilter('states', ['CA', 'TX'])
    })

    expect(result.current.filters.states).toEqual(['CA', 'TX'])
    expect(result.current.search).toBe('?states=CA%2CTX')
    expect(result.current.isEmpty()).toBe(false)
  })

  it('clearAll keeps only order_by and searchTerm', () => {
    const { result } = renderHook(useFiltersWithLocation, {
      wrapper: withRouter('/search?labels=fraud&order_by=comments&searchTerm=border')
    })

    act(() => {
      result.current.clearAll()
    })

    expect(result.current.filters.labels).toEqual([])
    expect(result.current.filters.order_by).toBe('comments')
    expect(result.current.filters.searchTerm).toBe('border')
    expect(result.current.search).toBe('?order_by=comments&searchTerm=border')
  })
})
