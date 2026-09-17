import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchSnippets, starSnippet } from '../snippet'
import { rpc } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({ rpc: vi.fn(), default: {} }))
vi.mock('@/lib/posthog', () => ({ capture: vi.fn(), captureException: vi.fn() }))

const mockedRpc = vi.mocked(rpc)

// Builds the thenable-with-abortSignal shape that `rpc()` returns.
const rpcResult = (result: { data: unknown; error: { message: string } | null }) => {
  const thenable = Promise.resolve(result)
  return { abortSignal: () => thenable, then: thenable.then.bind(thenable) }
}

beforeEach(() => {
  mockedRpc.mockReset()
})

describe('fetchSnippets', () => {
  it('calls get_snippets with the paging options and maps the result', async () => {
    const snippets = [{ id: 'a' }, { id: 'b' }]
    mockedRpc.mockReturnValue(
      rpcResult({ data: { snippets, total_pages: 4, num_of_snippets: 37 }, error: null }) as never
    )

    const page = await fetchSnippets({
      pageParam: 2,
      pageSize: 10,
      filters: { languages: ['spanish'], politicalSpectrum: undefined },
      language: 'english',
      orderBy: 'latest',
      searchTerm: 'vote',
      abortSignal: new AbortController().signal
    })

    expect(mockedRpc).toHaveBeenCalledWith('get_snippets', {
      page: 2,
      page_size: 10,
      p_language: 'english',
      // An unset politicalSpectrum must not be sent to the backend at all.
      p_filter: { languages: ['spanish'] },
      p_order_by: 'latest',
      p_search_term: 'vote'
    })
    expect(page).toEqual({ snippets, total_pages: 4, currentPage: 2, total_snippets: 37 })
  })

  it('rethrows the Supabase error', async () => {
    mockedRpc.mockReturnValue(rpcResult({ data: null, error: { message: 'canceling statement' } }) as never)

    await expect(
      fetchSnippets({
        pageParam: 0,
        pageSize: 10,
        filters: {},
        language: 'english',
        orderBy: 'latest',
        abortSignal: new AbortController().signal
      })
    ).rejects.toEqual({ message: 'canceling statement' })
  })
})

describe('starSnippet', () => {
  it('calls toggle_star_snippet and returns its payload', async () => {
    const payload = { data: { snippet_starred: true, message: 'Snippet starred' } }
    mockedRpc.mockReturnValue(rpcResult({ data: payload, error: null }) as never)

    await expect(starSnippet('a')).resolves.toEqual(payload)
    expect(mockedRpc).toHaveBeenCalledWith('toggle_star_snippet', { snippet_id: 'a' })
  })
})
