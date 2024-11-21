// src/hooks/useSnippetActions.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { snippetKeys } from './useSnippets'
import { likeSnippet, hideSnippet, unhideSnippet, dismissWelcomeCard, toggleWelcomeCard } from '@/apis/snippet'
import { LikeSnippetVariables, LikeResponse, HideResponse, Snippet } from '@/types/snippet'
import { useAuth } from '@/providers/auth'

export function useLikeSnippet() {
  const queryClient = useQueryClient()

  return useMutation<LikeResponse, Error, LikeSnippetVariables>({
    mutationFn: likeSnippet,
    onMutate: async ({ snippetId, likeStatus }) => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: any) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) =>
          snippet.id === snippetId ? { ...snippet, user_like_status: likeStatus } : snippet

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (oldData.id === snippetId) {
          return { ...oldData, user_like_status: likeStatus }
        }

        return oldData
      })

      return { previousSnippets }
    },
    onSuccess: (response, { snippetId }) => {
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: any) => {
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
            pages: oldData.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (oldData.id === snippetId) {
          return {
            ...oldData,
            like_count: response.like_count,
            dislike_count: response.dislike_count
          }
        }

        return oldData
      })
    },
    onError: (err, variables, context: unknown) => {
      if (context && typeof context === 'object' && 'previousSnippets' in context) {
        ;(context.previousSnippets as [any, any][]).forEach(([key, data]: [any, any]) => {
          queryClient.setQueriesData(key, data)
        })
      }
    }
  })
}

export function useHideSnippet() {
  const queryClient = useQueryClient()

  return useMutation<HideResponse, Error, string>({
    mutationFn: hideSnippet,
    onMutate: async snippetId => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      // Optimistically update snippets in cache
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: any) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) => (snippet.id === snippetId ? { ...snippet, hidden: true } : snippet)

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (oldData.id === snippetId) {
          return { ...oldData, hidden: true }
        }

        return oldData
      })

      return { previousSnippets }
    },
    onError: (err, snippetId, context) => {
      if (context && typeof context === 'object' && 'previousSnippets' in context) {
        ;(context.previousSnippets as [any, any][]).forEach(([key, data]: [any, any]) => {
          queryClient.setQueriesData(key, data)
        })
      }
    }
  })
}

export function useUnhideSnippet() {
  const queryClient = useQueryClient()

  return useMutation<HideResponse, Error, string>({
    mutationFn: unhideSnippet,
    onMutate: async snippetId => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      // Optimistically update snippets in cache
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (oldData: any) => {
        if (!oldData) return oldData

        const updateSnippet = (snippet: Snippet) => (snippet.id === snippetId ? { ...snippet, hidden: false } : snippet)

        if ('pages' in oldData) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map(updateSnippet)
            }))
          }
        }

        if (oldData.id === snippetId) {
          return { ...oldData, hidden: false }
        }

        return oldData
      })

      return { previousSnippets }
    },
    onError: (err, snippetId, context) => {
      if (context && typeof context === 'object' && 'previousSnippets' in context) {
        ;(context.previousSnippets as [any, any][]).forEach(([key, data]: [any, any]) => {
          queryClient.setQueriesData(key, data)
        })
      }
    }
  })
}

export function useDismissWelcomeCard() {
  const { refreshUser } = useAuth()

  return useMutation<void, Error, void>({
    mutationFn: dismissWelcomeCard,
    onSuccess: data => {
      refreshUser()
    }
  })
}

export function useToggleWelcomeCard() {
  const { refreshUser } = useAuth()

  return useMutation<void, Error, boolean>({
    mutationFn: toggleWelcomeCard,
    onSuccess: () => {
      refreshUser()
    }
  })
}
