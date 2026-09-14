// src/api/api.ts

import { capture } from '@/lib/posthog'
import { SLOW_THRESHOLD_MS, timedRpc } from '@/lib/timedRpc'
import {
  Snippet,
  PaginatedResponse,
  LikeSnippetVariables,
  LikeResponse,
  HideResponse,
  PublicSnippetData,
  IRelatedSnippet
} from '../types/snippet'

interface GetSnippetsRpcResult {
  snippets: Snippet[]
  total_pages: number | null
  num_of_snippets: number | null
}

export const fetchSnippet = async (id: string, language: string): Promise<Snippet> => {
  const { data } = await timedRpc<Snippet>('get_snippet', {
    snippet_id: id,
    p_language: language
  })
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
    p_search_term: searchTerm,
    // The total count is expensive; only the first page needs it (see getNextSnippetsPageParam).
    p_include_count: pageParam === 0
  }

  const { data, durationMs } = await timedRpc<GetSnippetsRpcResult>('get_snippets', getSnippetsOptions, {
    abortSignal
  })

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
  const { data } = await timedRpc<LikeResponse>('like_snippet', {
    snippet_id: snippetId,
    value: likeStatus
  })
  return data
}

export const hideSnippet = async (snippetId: string): Promise<HideResponse> => {
  const { data } = await timedRpc<HideResponse>('hide_snippet', {
    snippet_id: snippetId
  })
  return data
}

export const unhideSnippet = async (snippetId: string): Promise<HideResponse> => {
  const { data } = await timedRpc<HideResponse>('unhide_snippet', {
    snippet_id: snippetId
  })
  return data
}

export const fetchPublicSnippet = async (snippetId: string): Promise<PublicSnippetData> => {
  const { data } = await timedRpc<PublicSnippetData>('get_public_snippet', { snippet_id: snippetId })
  return data
}

export const dismissWelcomeCard = async (): Promise<void> => {
  const { data } = await timedRpc<void>('dismiss_welcome_card')
  return data
}

export const toggleWelcomeCard = async (status: boolean): Promise<void> => {
  const { data } = await timedRpc<void>('toggle_welcome_card', {
    p_status: status
  })
  return data
}

export const fetchRelatedSnippets = async ({
  snippetId,
  language
}: {
  snippetId: string
  language: string
}): Promise<IRelatedSnippet[]> => {
  const { data } = await timedRpc<IRelatedSnippet[]>('search_related_snippets_public', {
    snippet_id: snippetId,
    p_language: language
  })
  return data
}

export const starSnippet = async (snippetId: string): Promise<void> => {
  const { data } = await timedRpc<void>('toggle_star_snippet', {
    snippet_id: snippetId
  })
  return data
}
