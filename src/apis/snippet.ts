// src/api/api.ts

import { capture, captureException } from '@/lib/posthog'
import supabase from '@/lib/supabase'
import {
  Snippet,
  PaginatedResponse,
  LikeSnippetVariables,
  LikeResponse,
  HideResponse,
  PublicSnippetData,
  IRelatedSnippet
} from '../types/snippet'

const SLOW_THRESHOLD_MS = 20_000

export const fetchSnippet = async (id: string, language: string): Promise<Snippet> => {
  const { data, error } = await supabase.rpc('get_snippet', {
    snippet_id: id,
    p_language: language
  })

  if (error) {
    console.error('Error fetching snippet:', error)
    throw error
  }
  return data
}

export const fetchSnippets = async ({
  pageParam = 0,
  pageSize = 10,
  filters,
  language,
  orderBy,
  searchTerm = '',
  abortSignal
}: {
  pageParam: number
  pageSize: number
  filters: any
  language: string
  orderBy: string
  searchTerm?: string
  abortSignal: AbortSignal
}): Promise<PaginatedResponse> => {
  // Remove unset filter properties
  const actualFilters = { ...filters }
  if (!actualFilters?.politicalSpectrum) {
    delete actualFilters.politicalSpectrum
  }
  const getSnippetsOptions = {
    page: pageParam,
    page_size: pageSize,
    p_language: language,
    p_filter: actualFilters,
    p_order_by: orderBy,
    p_search_term: searchTerm
  }

  const startTime = performance.now()

  const { data, error } = await supabase.rpc('get_snippets', getSnippetsOptions).abortSignal(abortSignal)

  const durationMs = Math.round(performance.now() - startTime)

  if (error) {
    console.error('Error fetching snippets:', error)

    const isAborted = /AbortError/i.test(error.message)
    if (!isAborted) {
      const isTimeout = /timeout|canceling statement/i.test(error.message)
      captureException(error, {
        ...getSnippetsOptions,
        duration_ms: durationMs,
        is_timeout: isTimeout
      })
    }

    throw error
  }

  capture('get_snippets_rpc', {
    ...getSnippetsOptions,
    duration_ms: durationMs,
    status: durationMs > SLOW_THRESHOLD_MS ? 'warning' : 'success',
    total_pages: data.total_pages,
    total_snippets: data.num_of_snippets
  })

  return {
    snippets: data.snippets,
    total_pages: data.total_pages,
    currentPage: pageParam,
    total_snippets: data.num_of_snippets
  }
}

export const likeSnippet = async ({ snippetId, likeStatus }: LikeSnippetVariables): Promise<LikeResponse> => {
  const { data, error } = await supabase.rpc('like_snippet', {
    snippet_id: snippetId,
    value: likeStatus
  })
  if (error) {
    throw error
  }
  return data
}

export const hideSnippet = async (snippetId: string): Promise<HideResponse> => {
  const { data, error } = await supabase.rpc('hide_snippet', {
    snippet_id: snippetId
  })
  if (error) {
    throw error
  }
  return data
}

export const unhideSnippet = async (snippetId: string): Promise<HideResponse> => {
  const { data, error } = await supabase.rpc('unhide_snippet', {
    snippet_id: snippetId
  })
  if (error) {
    throw error
  }
  return data
}

export const fetchPublicSnippet = async (snippetId: string): Promise<PublicSnippetData> => {
  const { data, error } = await supabase.rpc('get_public_snippet', { snippet_id: snippetId })

  if (error) throw error
  return data
}

export const dismissWelcomeCard = async (): Promise<void> => {
  const { data, error } = await supabase.rpc('dismiss_welcome_card')
  if (error) {
    throw error
  }

  return data
}

export const toggleWelcomeCard = async (status: boolean): Promise<void> => {
  const { data, error } = await supabase.rpc('toggle_welcome_card', {
    p_status: status
  })

  if (error) {
    throw error
  }

  return data
}

export const fetchRelatedSnippets = async ({
  snippetId,
  language
}: {
  snippetId: string
  language: string
}): Promise<IRelatedSnippet[]> => {
  const { data, error } = await supabase.rpc('search_related_snippets_public', {
    snippet_id: snippetId,
    p_language: language
  })
  if (error) throw error
  return data
}

export const starSnippet = async (snippetId: string): Promise<void> => {
  const { data, error } = await supabase.rpc('toggle_star_snippet', {
    snippet_id: snippetId
  })
  if (error) throw error
  return data
}
