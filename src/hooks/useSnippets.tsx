import { useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { fetchSnippet, fetchSnippets, fetchPublicSnippet, fetchRelatedSnippets } from '@/apis/snippet'
import type { PaginatedResponse, Snippet, PublicSnippetData, IRelatedSnippet } from '@/types/snippet'
import type { SnippetFilters } from './useSnippetFilters'

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: (pageSize: number, filters: Partial<SnippetFilters>, language: string, orderBy: string, searchTerm: string) =>
    [...snippetKeys.all, 'list', { pageSize, filters, language, orderBy, searchTerm }] as const,
  detail: (id: string, language: string) => [...snippetKeys.all, 'detail', id, { language }] as const,
  related: (id: string, language: string) => [...snippetKeys.all, 'related', id, { language }] as const
}

/**
 * The total page count is only requested (and returned) for the first page, so read it from
 * `pages[0]` rather than the page that was just fetched.
 */
export const getNextSnippetsPageParam = (lastPage: PaginatedResponse, allPages: PaginatedResponse[]) => {
  const totalPages = allPages[0].total_pages
  if (totalPages === null || lastPage.currentPage >= totalPages - 1) {
    return undefined
  }
  return lastPage.currentPage + 1
}

export function useSnippets({
  pageSize = 10,
  filters = {},
  language = 'english',
  orderBy = 'latest',
  searchTerm = ''
}: {
  pageSize?: number
  filters?: Partial<SnippetFilters>
  language?: string
  orderBy?: string
  searchTerm?: string
}) {
  return useInfiniteQuery<
    PaginatedResponse,
    Error,
    InfiniteData<PaginatedResponse>,
    ReturnType<typeof snippetKeys.lists>,
    number
  >({
    queryKey: snippetKeys.lists(pageSize, filters, language, orderBy, searchTerm),
    queryFn: ({ pageParam, signal }) =>
      fetchSnippets({
        pageParam,
        pageSize,
        filters,
        language,
        orderBy,
        searchTerm,
        abortSignal: signal
      }),
    initialPageParam: 0,
    getNextPageParam: getNextSnippetsPageParam,
    // Slow searches hit the database statement timeout; the default 3 exponential retries would
    // keep the user waiting for minutes before the timeout message appears.
    retry: 1,
    retryDelay: 1000
  })
}

export function useSnippet(id: string, language: string) {
  return useQuery<Snippet, Error>({
    queryKey: snippetKeys.detail(id, language),
    queryFn: () => fetchSnippet(id, language),
    enabled: !!id
  })
}

export function usePublicSnippet(snippetId: string) {
  return useQuery<PublicSnippetData, Error>({
    queryKey: snippetKeys.detail(snippetId, 'english'),
    queryFn: () => fetchPublicSnippet(snippetId),
    enabled: !!snippetId
  })
}

export function useRelatedSnippets({ snippetId, language }: { snippetId: string; language: string }) {
  return useQuery<IRelatedSnippet[], Error>({
    queryKey: snippetKeys.related(snippetId, language),
    queryFn: () => fetchRelatedSnippets({ snippetId, language }),
    enabled: !!snippetId
  })
}
