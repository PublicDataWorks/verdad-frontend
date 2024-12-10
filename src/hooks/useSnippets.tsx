import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchSnippet, fetchSnippets, fetchPublicSnippet, fetchRelatedSnippets } from '@/apis/snippet'
import { PaginatedResponse, Snippet, PublicSnippetData, IRelatedSnippet } from '@/types/snippet'

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: (pageSize: number, filters: any, language: string, orderBy: string, searchTerm: string) =>
    [...snippetKeys.all, 'list', { pageSize, filters, language, orderBy, searchTerm }] as const,
  detail: (id: string, language: string) => [...snippetKeys.all, 'detail', id, { language }] as const,
  related: (id: string, language: string) => [...snippetKeys.all, 'related', id, { language }] as const
}

export function useSnippets({
  pageSize = 10,
  filters = {},
  language = 'english',
  orderBy = 'latest',
  searchTerm = ''
}) {
  return useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: snippetKeys.lists(pageSize, filters, language, orderBy, searchTerm),
    queryFn: ({ pageParam }) =>
      fetchSnippets({ pageParam: pageParam ?? 0, pageSize, filters, language, orderBy, searchTerm }),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.currentPage >= lastPage.total_pages - 1) {
        return undefined
      }
      return lastPage.currentPage + 1
    }
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
