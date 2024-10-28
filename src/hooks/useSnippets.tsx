import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'

// Types
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

interface ConfidenceScore {
  score: number
  category: string
}

interface ConfidenceScores {
  overall: number
  categories: ConfidenceScore[]
}

export interface Snippet {
  id: string
  context: Context
  recorded_at: string
  duration: string
  start_time: string
  end_time: string
  file_path: string
  file_size: number
  audio_file: AudioFileInfo
  title: string
  summary: string
  explanation: string
  confidence_scores: ConfidenceScores
  starred_by_user: boolean
  status: string
  error_message: string | null
}

interface PaginatedResponse {
  data: Snippet[]
  total_page: number
}

// Query keys
const snippetKeys = {
  all: ['snippets'] as const,
  lists: (page?: number, pageSize?: number) => [...snippetKeys.all, 'list', { page, pageSize }] as const,
  detail: (id: string) => [...snippetKeys.all, 'detail', id] as const
}

// API functions
const fetchSnippet = async (id: string): Promise<Snippet> => {
  const { data, error } = await supabase.rpc('get_snippet', {
    snippet_id: id
  })

  if (error) throw error
  return data
}

const fetchSnippets = async (page: number = 0, pageSize: number = 10): Promise<PaginatedResponse> => {
  const { data, error } = await supabase.rpc('get_snippets', {
    page,
    page_size: pageSize
  })

  if (error) throw error

  return {
    data: data.snippets,
    total_page: data.total_pages
  }
}

// Modified useSnippets hook using useQuery
export function useSnippets(page: number = 0, pageSize: number = 10) {
  return useQuery({
    queryKey: snippetKeys.lists(page, pageSize),
    queryFn: () => fetchSnippets(page, pageSize),
    enabled: true // Query will run immediately
  })
}

// Hooks
export function useSnippet(id: string) {
  return useQuery({
    queryKey: snippetKeys.detail(id),
    queryFn: () => fetchSnippet(id),
    enabled: !!id
  })
}

// Optional: Helper function for sorting
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
