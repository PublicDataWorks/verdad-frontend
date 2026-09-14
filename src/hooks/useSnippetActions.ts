// src/hooks/useSnippetActions.ts

import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from '@tanstack/react-query'

import { snippetKeys } from './useSnippets'
import {
  likeSnippet,
  hideSnippet,
  unhideSnippet,
  dismissWelcomeCard,
  toggleWelcomeCard,
  starSnippet
} from '@/apis/snippet'
import type {
  LikeSnippetVariables,
  LikeResponse,
  HideResponse,
  Snippet,
  IRelatedSnippet,
  PaginatedResponse
} from '@/types/snippet'
import { useAuth } from '@/providers/auth'

// Everything cached under `snippetKeys.all`: infinite lists, single details and related lists.
type CachedSnippetData = InfiniteData<PaginatedResponse> | Snippet | IRelatedSnippet[] | undefined
interface SnippetMutationContext {
  previousSnippets: [QueryKey, unknown][]
}

const restorePreviousSnippets = (
  queryClient: ReturnType<typeof useQueryClient>,
  context: SnippetMutationContext | undefined
) => {
  context?.previousSnippets.forEach(([key, data]) => {
    queryClient.setQueryData(key, data)
  })
}

export function useLikeSnippet() {
  const queryClient = useQueryClient()

  return useMutation<LikeResponse, Error, LikeSnippetVariables, SnippetMutationContext>({
    mutationFn: likeSnippet,
    onMutate: async ({ snippetId, likeStatus }) => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: CachedSnippetData) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) =>
          snippet.id === snippetId ? { ...snippet, user_like_status: likeStatus } : snippet

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (!Array.isArray(oldData) && oldData.id === snippetId) {
          return { ...oldData, user_like_status: likeStatus }
        }

        return oldData
      })

      return { previousSnippets }
    },
    onSuccess: (response, { snippetId }) => {
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: CachedSnippetData) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) =>
          snippet.id === snippetId
            ? {
                ...snippet,
                like_count: response.like_count,
                dislike_count: response.dislike_count
              }
            : snippet

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (!Array.isArray(oldData) && oldData.id === snippetId) {
          return {
            ...oldData,
            like_count: response.like_count,
            dislike_count: response.dislike_count
          }
        }

        return oldData
      })
    },
    onError: (err, variables, context) => {
      restorePreviousSnippets(queryClient, context)
    }
  })
}

export function useHideSnippet() {
  const queryClient = useQueryClient()

  return useMutation<HideResponse, Error, string, SnippetMutationContext>({
    mutationFn: hideSnippet,
    onMutate: async snippetId => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      // Optimistically update snippets in cache
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: CachedSnippetData) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) => (snippet.id === snippetId ? { ...snippet, hidden: true } : snippet)

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (!Array.isArray(oldData) && oldData.id === snippetId) {
          return { ...oldData, hidden: true }
        }

        return oldData
      })

      return { previousSnippets }
    },
    onError: (err, snippetId, context) => {
      restorePreviousSnippets(queryClient, context)
    }
  })
}

export function useUnhideSnippet() {
  const queryClient = useQueryClient()

  return useMutation<HideResponse, Error, string, SnippetMutationContext>({
    mutationFn: unhideSnippet,
    onMutate: async snippetId => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      // Optimistically update snippets in cache
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: CachedSnippetData) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) => (snippet.id === snippetId ? { ...snippet, hidden: false } : snippet)

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (!Array.isArray(oldData) && oldData.id === snippetId) {
          return { ...oldData, hidden: false }
        }

        return oldData
      })

      return { previousSnippets }
    },
    onError: (err, snippetId, context) => {
      restorePreviousSnippets(queryClient, context)
    }
  })
}

export function useDismissWelcomeCard() {
  const { refreshUser } = useAuth()

  return useMutation<void, Error, void>({
    mutationFn: dismissWelcomeCard,
    onSuccess: () => {
      void refreshUser()
    }
  })
}

export function useToggleWelcomeCard() {
  const { refreshUser } = useAuth()

  return useMutation<void, Error, boolean>({
    mutationFn: toggleWelcomeCard,
    onSuccess: () => {
      void refreshUser()
    }
  })
}

export function useStarSnippet(parentSnippetId: string, language: string) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string, { previousSnippets: IRelatedSnippet[] | undefined }>({
    mutationFn: starSnippet,
    onMutate: async (snippetId: string) => {
      // Cancel any outgoing refetches for this query
      await queryClient.cancelQueries({ queryKey: snippetKeys.related(parentSnippetId, language) })

      // Snapshot previous value
      const previousSnippets = queryClient.getQueryData<IRelatedSnippet[]>(
        snippetKeys.related(parentSnippetId, language)
      )

      // Optimistically update cache
      queryClient.setQueryData<IRelatedSnippet[]>(snippetKeys.related(parentSnippetId, language), old => {
        if (old) {
          return old.map(snippet => {
            if (snippet.id === snippetId) {
              return { ...snippet, starred_by_user: !snippet.starred_by_user }
            }
            return snippet
          })
        }
        return old
      })

      return { previousSnippets }
    },
    onError: (err, snippetId, context) => {
      // Revert the cache to the previous value
      if (context?.previousSnippets) {
        queryClient.setQueryData<IRelatedSnippet[]>(
          snippetKeys.related(parentSnippetId, language),
          context.previousSnippets
        )
      }
    },
    onSettled: () => {
      // Invalidate queries so they refetch
      void queryClient.invalidateQueries({ queryKey: snippetKeys.related(parentSnippetId, language) })
    }
  })
}
