import { useQuery } from '@tanstack/react-query'
import { fetchTrendingTopics, fetchTopicDetails } from '@/apis/trending'
import { TrendingTopicsResponse, TopicDetailsResponse } from '@/types/trending'
import { SnippetFilters } from '@/hooks/useSnippetFilters'

export const trendingKeys = {
  all: ['trending'] as const,
  topics: (timespan: string, filters: Partial<SnippetFilters>, language: string) =>
    [...trendingKeys.all, 'topics', timespan, filters, language] as const,
  topicDetails: (topicId: string, timespan: string, filters: Partial<SnippetFilters>, language: string) =>
    [...trendingKeys.all, 'topicDetails', topicId, timespan, filters, language] as const
}

export const useTrendingTopics = ({
  timespan,
  filters,
  language,
  limit = 10
}: {
  timespan: string
  filters: Partial<SnippetFilters>
  language: string
  limit?: number
}) => {
  return useQuery<TrendingTopicsResponse, Error>({
    queryKey: trendingKeys.topics(timespan, filters, language),
    queryFn: () => fetchTrendingTopics({ timespan, filters, language, limit }),
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  })
}

export const useTopicDetails = ({
  topicId,
  timespan,
  filters,
  language,
  enabled = true
}: {
  topicId: string | undefined
  timespan: string
  filters: Partial<SnippetFilters>
  language: string
  enabled?: boolean
}) => {
  return useQuery<TopicDetailsResponse, Error>({
    queryKey: trendingKeys.topicDetails(topicId || '', timespan, filters, language),
    queryFn: () => fetchTopicDetails({ topicId: topicId!, timespan, filters, language }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: enabled && !!topicId
  })
}
