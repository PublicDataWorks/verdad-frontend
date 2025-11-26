import supabase from '@/lib/supabase'
import { TrendingTopicsResponse, TopicDetailsResponse } from '@/types/trending'
import { SnippetFilters } from '@/hooks/useSnippetFilters'

export const fetchTopicDetails = async ({
  topicId,
  timespan = '7d',
  filters,
  language
}: {
  topicId: string
  timespan: string
  filters: Partial<SnippetFilters>
  language: string
}): Promise<TopicDetailsResponse> => {
  const filterObj: Record<string, unknown> = {}

  if (filters.languages && filters.languages.length > 0) {
    filterObj.languages = filters.languages
  }
  if (filters.states && filters.states.length > 0) {
    filterObj.states = filters.states
  }
  if (filters.sources && filters.sources.length > 0) {
    filterObj.sources = filters.sources
  }
  if (filters.politicalSpectrum) {
    filterObj.politicalSpectrum = filters.politicalSpectrum
  }

  const { data, error } = await supabase.rpc('get_topic_details', {
    p_topic_id: topicId,
    p_timespan: timespan,
    p_filter: Object.keys(filterObj).length > 0 ? filterObj : null,
    p_language: language
  })

  if (error) {
    console.error('Error fetching topic details:', error)
    throw error
  }

  return data as TopicDetailsResponse
}

export const fetchTrendingTopics = async ({
  timespan = '7d',
  filters,
  language,
  limit = 10
}: {
  timespan: string
  filters: Partial<SnippetFilters>
  language: string
  limit?: number
}): Promise<TrendingTopicsResponse> => {
  // Build filter object matching the backend expectations
  const filterObj: Record<string, unknown> = {}

  if (filters.languages && filters.languages.length > 0) {
    filterObj.languages = filters.languages
  }
  if (filters.states && filters.states.length > 0) {
    filterObj.states = filters.states
  }
  if (filters.sources && filters.sources.length > 0) {
    filterObj.sources = filters.sources
  }
  if (filters.politicalSpectrum) {
    filterObj.politicalSpectrum = filters.politicalSpectrum
  }

  const { data, error } = await supabase.rpc('get_trending_topics', {
    p_timespan: timespan,
    p_filter: Object.keys(filterObj).length > 0 ? filterObj : null,
    p_language: language,
    p_limit: limit
  })

  if (error) {
    console.error('Error fetching trending topics:', error)
    throw error
  }

  return data as TrendingTopicsResponse
}
