// src/api/api.ts

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

export const fetchSnippetPreviews = async ({
  pageParam = 0,
  pageSize = 10,
  filters,
  language,
  orderBy,
  searchTerm = ''
}: {
  pageParam: number
  pageSize: number
  filters: any
  language: string
  orderBy: string
  searchTerm?: string
}): Promise<PaginatedPreviewResponse> => {
  // Remove unset filter properties
  const actualFilters = { ...filters }
  if (!actualFilters?.politicalSpectrum) {
    delete actualFilters.politicalSpectrum
  }

  const { data, error } = await supabase.rpc('get_snippets_preview', {
    page: pageParam,
    page_size: pageSize,
    p_language: language,
    p_filter: actualFilters,
    p_order_by: orderBy,
    p_search_term: searchTerm
  })

  if (error) {
    console.error('Error fetching snippet previews:', error)
    throw error
  }

  return {
    snippets: data.snippets,
    total_pages: Number(data.total_pages),
    currentPage: pageParam,
    total_snippets: Number(data.num_of_snippets)
  }
}

export const fetchSnippetDetails = async (id: string, language: string): Promise<Snippet> => {
  const { data, error } = await supabase.rpc('get_snippet_details', {
    snippet_id: id,
    p_language: language
  })

  if (error) {
    console.error('Error fetching snippet details:', error)
    throw error
  }
  return data
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
