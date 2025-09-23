import React, { useEffect, useCallback } from 'react'
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSnippet, fetchSnippetPreviews, fetchSnippetDetails, fetchPublicSnippet, fetchRelatedSnippets } from '@/apis/snippet'
import { PaginatedResponse, Snippet, PublicSnippetData, IRelatedSnippet } from '@/types/snippet'
import { PaginatedPreviewResponse, SnippetPreview } from '@/types/snippet-preview'
import { useLanguage } from '@/providers/language'

export const snippetKeys = {
  all: ['snippets'] as const,
  lists: (pageSize: number, filters: any, language: string, orderBy: string, searchTerm: string) =>
    [...snippetKeys.all, 'list', { pageSize, filters, language, orderBy, searchTerm }] as const,
  detail: (id: string, language: string) => [...snippetKeys.all, 'detail', id, { language }] as const,
  preview: (id: string, language: string) => [...snippetKeys.all, 'preview', id, { language }] as const,
  related: (id: string, language: string) => [...snippetKeys.all, 'related', id, { language }] as const
}

export function useSnippets({
  pageSize = 20,
  filters = {},
  language = 'english',
  orderBy = 'latest',
  searchTerm = ''
}) {
  const queryClient = useQueryClient();

  const result = useInfiniteQuery<PaginatedPreviewResponse, Error>({
    queryKey: snippetKeys.lists(pageSize, filters, language, orderBy, searchTerm),
    queryFn: ({ pageParam }) =>
      fetchSnippetPreviews({ pageParam: pageParam ?? 0, pageSize, filters, language, orderBy, searchTerm }),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.currentPage >= lastPage.total_pages - 1) {
        return undefined
      }
      return lastPage.currentPage + 1
    },
    // Improved caching strategy
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 15 * 60 * 1000, // Keep data in cache for 15 minutes
    refetchOnWindowFocus: false, // Prevent refetching on window focus
    refetchOnMount: false, // Prevent refetching on component mount if data is fresh
  });

  // Background prefetching of next page
  useEffect(() => {
    if (result.data && !result.isFetchingNextPage && result.hasNextPage) {
      const nextPage = result.data.pages[result.data.pages.length - 1].currentPage + 1;
      
      // Prefetch next page in the background
      queryClient.prefetchInfiniteQuery({
        queryKey: snippetKeys.lists(pageSize, filters, language, orderBy, searchTerm),
        queryFn: ({ pageParam }) => 
          fetchSnippetPreviews({ pageParam: nextPage, pageSize, filters, language, orderBy, searchTerm }),
        pages: [...(result.data?.pages || [])],
        pageParams: [...(result.data?.pageParams || []), nextPage]
      });
    }
  }, [result.data, result.isFetchingNextPage, result.hasNextPage, queryClient, pageSize, filters, language, orderBy, searchTerm]);

  return result;
}

export function useSnippetDetails(id: string, language: string) {
  const queryClient = useQueryClient();

  const result = useQuery<Snippet, Error>({
    queryKey: snippetKeys.detail(id, language),
    queryFn: () => fetchSnippetDetails(id, language),
    enabled: !!id
  });

  // Prefetch related snippets when details are loaded
  useEffect(() => {
    if (result.data) {
      queryClient.prefetchQuery({
        queryKey: snippetKeys.related(id, language),
        queryFn: () => fetchRelatedSnippets({ snippetId: id, language })
      });
    }
  }, [id, language, result.data, queryClient]);

  return result;
}

// Use this hook to prefetch snippet details on hover
export function usePrefetchSnippetDetails() {
  const queryClient = useQueryClient();
  const language = useLanguage().language;

  return useCallback(
    (id: string) => {
      if (id) {
        queryClient.prefetchQuery({
          queryKey: snippetKeys.detail(id, language),
          queryFn: () => fetchSnippetDetails(id, language)
        });
      }
    },
    [queryClient, language]
  );
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
