// src/api/api.ts

import supabase from '@/lib/supabase'
import {
  Snippet,
  PaginatedResponse,
  LikeSnippetVariables,
  LikeResponse,
  HideResponse,
  PublicSnippetData
} from '../types/snippet'

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
  language
}: {
  pageParam: number
  pageSize: number
  filters: any
  language: string
}): Promise<PaginatedResponse> => {
  // Remove unset filter properties
  const actualFilters = { ...filters }
  if (!actualFilters?.politicalSpectrum) {
    delete actualFilters.politicalSpectrum
  }

  const { data, error } = await supabase.rpc('get_snippets', {
    page: pageParam,
    page_size: pageSize,
    p_language: language,
    p_filter: actualFilters
  })

  if (error) {
    console.error('Error fetching snippets:', error)
    throw error
  }

  return {
    snippets: data.snippets,
    total_pages: Number(data.total_pages),
    currentPage: pageParam
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
