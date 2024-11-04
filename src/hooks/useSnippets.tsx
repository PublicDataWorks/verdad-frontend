import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
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
  recorded_at: string
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

export interface Snippet {
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
}

interface PaginatedResponse {
  snippets: Snippet[]
  currentPage: number
  total_pages: number
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

  const { data, error } = await supabase.rpc('get_snippets', {
    page: pageParam,
    page_size: actualPageSize,
    p_language: language
    // filters,
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
