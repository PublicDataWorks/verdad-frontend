import { useQuery, useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import supabase from '@/lib/supabase'

interface Context {
  main: string
  before: string
  after: string
  main_en: string
  before_en: string
  after_en: string
}

interface AudioFileInfo {
  id: string
  location_city: string | null
  location_state: string
  radio_station_code: string
  radio_station_name: string
}

interface Upvoter {
  id: string
  email: string
  upvoted_at: string
}

export interface Label {
  id: string
  text: string
  applied_at: string
  applied_by: string | null
  created_by: string | null
  upvoted_by: Upvoter[]
  is_ai_suggested: boolean
}

interface ConfidenceScore {
  score: number
  category: string
}

interface ConfidenceScores {
  overall: number
  categories: ConfidenceScore[]
}

interface AudioFileInfo {
  location_state: string
  radio_station_code: string
  radio_station_name: string
}

interface Context {
  main: string
  before: string
  after: string
  before_en: string
  main_en: string
  after_en: string
}

export type LikeStatus = 1 | 0 | -1

export interface Snippet {
  hidden: boolean | null
  id: string
  title: string
  labels: Label[]
  status: string
  context: Context
  summary: string
  duration: string
  end_time: string
  file_path: string
  file_size: number
  audio_file: AudioFileInfo
  start_time: string
  explanation: string
  recorded_at: string
  error_message: string | null
  starred_by_user: boolean
  confidence_scores: ConfidenceScores
  language: {
    dialect: string
    primary_language: string
    register: string
  }
  political_leaning: {
    score: number
    explanation: {
      english: string
      spanish: string
    }
  }
  user_like_status: LikeStatus | null
  like_count: number
  dislike_count: number
}

interface LikeSnippetVariables {
  snippetId: string
  likeStatus: LikeStatus
}

interface PaginatedResponse {
  snippets: Snippet[]
  currentPage: number
  total_pages: number
}

interface HideSnippetVariables {
  snippetId: string
  hidden: boolean
}

interface HideResponse {
  hidden: boolean
}

const snippetKeys = {
  all: ['snippets'] as const,
  lists: (pageSize: number, filters: any, language: string) =>
    [...snippetKeys.all, 'list', { pageSize, filters, language }] as const,
  detail: (id: string, language: string) => [...snippetKeys.all, 'detail', id, { language }] as const
}

const fetchSnippet = async (id: string, language: string): Promise<Snippet> => {
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

const fetchSnippets = async ({
  pageParam = 0,
  pageSize,
  filters,
  language
}: {
  pageParam: number
  pageSize: number
  filters: any
  language: string
}): Promise<PaginatedResponse> => {
  const actualPageSize = pageSize || 10

  // We won't pass political spectrum when it's unset
  if (filters && !filters?.politicalSpectrum) {
    delete filters?.politicalSpectrum
  }

  const { data, error } = await supabase.rpc('get_snippets', {
    page: pageParam,
    page_size: actualPageSize,
    p_language: language,
    p_filter: filters
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

export function useSnippets({ pageSize = 0, filters = {}, language = 'english' }) {
  return useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: snippetKeys.lists(pageSize, filters, language),
    queryFn: ({ pageParam = 0 }) => fetchSnippets({ pageParam, pageSize, filters, language }),
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
  return useQuery({
    queryKey: snippetKeys.detail(id, language),
    queryFn: () => fetchSnippet(id, language),
    enabled: !!id
  })
}

export const sortSnippets = (snippets: Snippet[], sortBy: string) => {
  return [...snippets].sort((a, b) => {
    if (sortBy === 'Most Recent') {
      return new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    }
    if (sortBy === 'Oldest') {
      return new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    }
    return 0
  })
}

interface LikeResponse {
  like_count: number
  dislike_count: number
}

const likeSnippet = async ({ snippetId, likeStatus }: LikeSnippetVariables): Promise<LikeResponse> => {
  const { data, error } = await supabase.rpc('like_snippet', {
    snippet_id: snippetId,
    value: likeStatus
  })
  if (error) {
    throw error
  }
  return data
}

export function useLikeSnippet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: likeSnippet,
    onMutate: async ({ snippetId, likeStatus }) => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (old: any) => {
        if (!old) return old

        if ('pages' in old) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map((snippet: Snippet) =>
                snippet.id === snippetId ? { ...snippet, user_like_status: likeStatus } : snippet
              )
            }))
          }
        }

        return {
          ...old,
          user_like_status: likeStatus
        }
      })

      return { previousSnippets }
    },
    onSuccess: (response, { snippetId }) => {
      // Update the counts in the cache when the mutation succeeds
      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (old: any) => {
        if (!old) return old

        if ('pages' in old) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map((snippet: Snippet) =>
                snippet.id === snippetId
                  ? {
                      ...snippet,
                      like_count: response.like_count,
                      dislike_count: response.dislike_count
                    }
                  : snippet
              )
            }))
          }
        }

        return {
          ...old,
          like_count: response.like_count,
          dislike_count: response.dislike_count
        }
      })
    },
    onError: (err, variables, context: any) => {
      if (context?.previousSnippets) {
        context.previousSnippets.forEach(([queryKey, previousValue]: [unknown[], any]) => {
          queryClient.setQueriesData({ queryKey }, previousValue)
        })
      }
    }
  })
}

const hideSnippet = async ({ snippetId, hidden }: HideSnippetVariables): Promise<HideResponse> => {
  const { data, error } = await supabase.rpc('hide_snippet', {
    snippet_id: snippetId,
    hidden
  })
  if (error) {
    throw error
  }
  return data
}

export function useHideSnippet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hideSnippet,

    // Optimistically update the cache before the mutation happens
    onMutate: async ({ snippetId, hidden }) => {
      await queryClient.cancelQueries({ queryKey: snippetKeys.all })

      const previousSnippets = queryClient.getQueriesData({ queryKey: snippetKeys.all })

      queryClient.setQueriesData({ queryKey: snippetKeys.all }, (old: any) => {
        if (!old) return old

        if ('pages' in old) {
          // For paginated data
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              snippets: page.snippets.map((snippet: Snippet) =>
                snippet.id === snippetId ? { ...snippet, hidden } : snippet
              )
            }))
          }
        }

        // For individual snippet data
        if (old.id === snippetId) {
          return {
            ...old,
            hidden
          }
        }

        return old
      })

      return { previousSnippets }
    },

    onError: (err, variables, context: any) => {
      if (context?.previousSnippets) {
        context.previousSnippets.forEach(([queryKey, previousValue]: [unknown[], any]) => {
          queryClient.setQueriesData({ queryKey }, previousValue)
        })
      }
    }
  })
}
