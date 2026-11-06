// src/api/api.ts

import { capture } from '@/lib/posthog'
import { SLOW_THRESHOLD_MS, timedRpc } from '@/lib/timedRpc'
import type { SnippetFilters } from '@/hooks/useSnippetFilters'
import type { EmptyObject } from '@/types/rpc'
import type {
  Snippet,
  PaginatedResponse,
  LikeSnippetVariables,
  LikeResponse,
  HideResponse,
  PublicSnippetData,
  IRelatedSnippet,
  StarSnippetResponse
} from '../types/snippet'

// `get_snippet` and `get_public_snippet` return `'{}'::jsonb` when the snippet does not
// exist, is not `Processed`, or is hidden from the caller. Callers get `null` instead.
const isEmptyObject = (value: object): value is EmptyObject => Object.keys(value).length === 0

export const fetchSnippet = async (id: string, language: string): Promise<Snippet | null> => {
  const { data } = await timedRpc('get_snippet', {
    snippet_id: id,
    p_language: language
  })
  return isEmptyObject(data) ? null : data
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
  filters: Partial<SnippetFilters>
  language: string
  orderBy: string
  searchTerm?: string
  abortSignal: AbortSignal
}): Promise<PaginatedResponse> => {
  // Remove unset filter properties
  const actualFilters = { ...filters }
  if (!actualFilters.politicalSpectrum) {
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

  const { data, durationMs } = await timedRpc('get_snippets', getSnippetsOptions, {
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
  const { data } = await timedRpc('like_snippet', {
    snippet_id: snippetId,
    value: likeStatus
  })
  return data
}

export const hideSnippet = async (snippetId: string): Promise<HideResponse> => {
  const { data } = await timedRpc('hide_snippet', {
    snippet_id: snippetId
  })
  // A caller without the admin role gets `status: 'error'` instead of a Postgres error.
  // Returning it as a success would leave the optimistic "hidden" state in the cache.
  if (data.status === 'error') {
    throw new Error(data.message)
  }
  return data
}

export const unhideSnippet = async (snippetId: string): Promise<HideResponse> => {
  const { data } = await timedRpc('unhide_snippet', {
    snippet_id: snippetId
  })
  if (data.status === 'error') {
    throw new Error(data.message)
  }
  return data
}

export const fetchPublicSnippet = async (snippetId: string): Promise<PublicSnippetData | null> => {
  const { data } = await timedRpc('get_public_snippet', { snippet_id: snippetId })
  return isEmptyObject(data) ? null : data
}

export const dismissWelcomeCard = async (): Promise<void> => {
  await timedRpc('dismiss_welcome_card')
}

export const toggleWelcomeCard = async (status: boolean): Promise<void> => {
  await timedRpc('toggle_welcome_card', {
    p_status: status
  })
}

export const fetchRelatedSnippets = async ({
  snippetId,
  language
}: {
  snippetId: string
  language: string
}): Promise<IRelatedSnippet[]> => {
  const { data } = await timedRpc('search_related_snippets_public', {
    snippet_id: snippetId,
    p_language: language
  })
  return data
}

export const starSnippet = async (snippetId: string): Promise<StarSnippetResponse> => {
  const { data } = await timedRpc('toggle_star_snippet', {
    snippet_id: snippetId
  })
  return data
}
