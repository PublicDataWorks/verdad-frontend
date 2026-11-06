import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLikeSnippet } from '../useSnippetActions'
import { snippetKeys } from '../useSnippets'
import { likeSnippet } from '@/apis/snippet'

vi.mock('@/apis/snippet', () => ({ likeSnippet: vi.fn() }))
vi.mock('@/providers/auth', () => ({ useAuth: () => ({ refreshUser: vi.fn() }) }))

const withClient =
  (queryClient: QueryClient) =>
  ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

describe('useLikeSnippet', () => {
  it('applies the like optimistically and restores each query from its own snapshot on error', async () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const listKey = snippetKeys.lists(10, {}, 'english', 'latest', '')
    const detailKey = snippetKeys.detail('a', 'english')
    const list = {
      pages: [{ snippets: [{ id: 'a', user_like_status: 0 }], currentPage: 0, total_pages: 1, total_snippets: 1 }],
      pageParams: [0]
    }
    const detail = { id: 'a', user_like_status: 0 }
    queryClient.setQueryData(listKey, list)
    queryClient.setQueryData(detailKey, detail)
    queryClient.setQueryData(['other'], 'untouched')

    let detailWhileInFlight: unknown
    vi.mocked(likeSnippet).mockImplementation(() => {
      detailWhileInFlight = queryClient.getQueryData(detailKey)
      return Promise.reject(new Error('boom'))
    })

    const { result } = renderHook(() => useLikeSnippet(), { wrapper: withClient(queryClient) })
    act(() => result.current.mutate({ snippetId: 'a', likeStatus: 1 }))
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(detailWhileInFlight).toEqual({ id: 'a', user_like_status: 1 })
    expect(queryClient.getQueryData(listKey)).toEqual(list)
    expect(queryClient.getQueryData(detailKey)).toEqual(detail)
    expect(queryClient.getQueryData(['other'])).toBe('untouched')
  })
})
