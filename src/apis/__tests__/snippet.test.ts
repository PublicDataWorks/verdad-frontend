import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { fetchSnippet, fetchSnippets, hideSnippet, unhideSnippet } from '../snippet'
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

describe('fetchSnippet', () => {
  it('maps the empty-object sentinel to null', async () => {
    // `get_snippet` returns '{}' when the snippet is missing, unprocessed or hidden.
    mockedRpc.mockReturnValue(rpcResult({ data: {}, error: null }) as never)

    await expect(fetchSnippet('snippet-1', 'english')).resolves.toBeNull()
  })

  it('returns the snippet when the RPC finds one', async () => {
    const snippet = { id: 'snippet-1', title: 'A title' }
    mockedRpc.mockReturnValue(rpcResult({ data: snippet, error: null }) as never)

    await expect(fetchSnippet('snippet-1', 'english')).resolves.toBe(snippet)
  })
})

describe('hideSnippet / unhideSnippet', () => {
  it('throws when the RPC denies the change', async () => {
    const denied = { status: 'error', message: 'Only admin users can hide the snippet' }
    mockedRpc.mockReturnValue(rpcResult({ data: denied, error: null }) as never)

    await expect(hideSnippet('snippet-1')).rejects.toThrow('Only admin users can hide the snippet')
  })

  it('resolves with the response when the change succeeds', async () => {
    const granted = { status: 'success', message: 'Snippet has been unhidden successfully' }
    mockedRpc.mockReturnValue(rpcResult({ data: granted, error: null }) as never)

    await expect(unhideSnippet('snippet-1')).resolves.toBe(granted)
  })
})

describe('the rpc wrapper types', () => {
  it('only accepts names and arguments from the generated schema', () => {
    void rpc('get_snippet', { snippet_id: 'snippet-1' })
    void rpc('get_roles')
    // every argument of get_filtering_options has a SQL default
    void rpc('get_filtering_options')
    void rpc('get_filtering_options', { p_language: 'spanish' })
    // @ts-expect-error - not a function in src/types/database.ts
    void rpc('not_a_function')
    // @ts-expect-error - get_snippet requires a snippet_id
    void rpc('get_snippet', {})
    // @ts-expect-error - get_roles takes no arguments
    void rpc('get_roles', { snippet_id: 'snippet-1' })

    expect(mockedRpc).toHaveBeenCalledTimes(7)
  })

  it('resolves a non-jsonb function to its generated return type', () => {
    type RolesResponse = Awaited<ReturnType<typeof rpc<'get_roles'>>>

    expectTypeOf<RolesResponse['data']>().toEqualTypeOf<string[] | null>()
  })
})
