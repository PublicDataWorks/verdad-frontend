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
  created_at: string
  transcription: string
  translation: string
  explanation: string
  context: Context
  recorded_at: string
  duration: string
  start_time: string
  end_time: string
  file_path: string
  file_size: number
  title: string
  summary: string
  confidence_scores: ConfidenceScores
  starred_by_user: boolean
  status: string
  error_message: string | null
  audio_file: AudioFileInfo
  labels: Label[]
}

const fetchLabels = async (snippetId: string) => {
  const { data, error } = await supabase.rpc('get_snippet_labels', { snippet_id: snippetId })
  if (error) {
    console.error('Error fetching labels:', error)
    return { labels: [] }
  }
  return { labels: data?.labels || [] }
}

interface PaginatedResponse {
  snippets: Snippet[]
  currentPage: number
  total_pages: number
}

const snippetKeys = {
  all: ['snippets'] as const,
  lists: (pageSize: number, filters: any) => [...snippetKeys.all, 'list', { pageSize, filters }] as const,
  detail: (id: string) => [...snippetKeys.all, 'detail', id] as const
}

const fetchSnippet = async (id: string): Promise<Snippet> => {
  const { data, error } = await supabase.rpc('get_snippet', {
    snippet_id: id
  })

  if (error) throw error
  return data
}

const fetchSnippets = async ({ pageParam = 0, pageSize, filters }): Promise<PaginatedResponse> => {
  const actualPageSize = pageSize || 10

  const { data, error } = await supabase.rpc('get_snippets', {
    page: pageParam,
    page_size: actualPageSize,
    filter
  })

  if (error) throw error

  return {
    snippets: data.snippets,
    total_pages: Number(data.total_pages),
    currentPage: pageParam
  }
}

export function useSnippets(pageSize: number, filters: any) {
  return useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: snippetKeys.lists(pageSize, filters),
    queryFn: ({ pageParam = 0 }) => fetchSnippets({ pageParam, pageSize, filters }),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      if (lastPage.currentPage >= lastPage.total_pages - 1) {
        return undefined
      }
      return lastPage.currentPage + 1
    }
  })
}

export function useSnippet(id: string) {
  return useQuery({
    queryKey: snippetKeys.detail(id),
    queryFn: () => fetchSnippet(id),
    enabled: !!id
  })
}

export const sortSnippets = (snippets: Snippet[], sortBy: string) => {
  return [...snippets].sort((a, b) => {
    if (sortBy === 'Most Recent') {
      return new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    } else if (sortBy === 'Oldest') {
      return new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    }
    return 0
  })
}
