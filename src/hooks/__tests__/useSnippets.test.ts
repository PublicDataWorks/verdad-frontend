import { describe, expect, it, vi } from 'vitest'
import { getNextSnippetsPageParam } from '@/hooks/useSnippets'
import type { PaginatedResponse } from '@/types/snippet'

vi.mock('@/apis/snippet', () => ({}))

const page = (
  currentPage: number,
  totals: Partial<Pick<PaginatedResponse, 'total_pages' | 'total_snippets'>> = {}
) => ({
  snippets: [],
  currentPage,
  total_pages: totals.total_pages ?? null,
  total_snippets: totals.total_snippets ?? null
})

describe('getNextSnippetsPageParam', () => {
  it('reads total_pages from the first page even when later pages omit the count', () => {
    const first = page(0, { total_pages: 3, total_snippets: 25 })
    const second = page(1)

    expect(getNextSnippetsPageParam(second, [first, second])).toBe(2)
  })

  it('stops when the last page is the final page according to the first page', () => {
    const first = page(0, { total_pages: 2, total_snippets: 15 })
    const last = page(1)

    expect(getNextSnippetsPageParam(last, [first, last])).toBeUndefined()
  })

  it('stops on an empty result set', () => {
    const only = page(0, { total_pages: 0, total_snippets: 0 })

    expect(getNextSnippetsPageParam(only, [only])).toBeUndefined()
  })

  it('stops when no page count is available at all', () => {
    const only = page(0)

    expect(getNextSnippetsPageParam(only, [only])).toBeUndefined()
  })
})
