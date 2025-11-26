import { useCallback } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRecordingPreviews,
  fetchRecordingDetails,
  toggleRecordingStar,
  fetchRecordingFilterOptions
} from '@/apis/recording'
import { RecordingsResponse, RecordingDetail, RecordingFilters, RecordingFilterOptions } from '@/types/recording'

export const recordingKeys = {
  all: ['recordings'] as const,
  lists: (filters: RecordingFilters, searchTerm: string) =>
    [...recordingKeys.all, 'list', { filters, searchTerm }] as const,
  detail: (id: string, language: string) => [...recordingKeys.all, 'detail', id, { language }] as const,
  filterOptions: () => [...recordingKeys.all, 'filterOptions'] as const
}

export function useRecordings({
  filters = {},
  searchTerm = ''
}: {
  filters?: RecordingFilters
  searchTerm?: string
}) {
  const queryClient = useQueryClient()

  return useInfiniteQuery<RecordingsResponse, Error>({
    queryKey: recordingKeys.lists(filters, searchTerm),
    queryFn: ({ pageParam }) =>
      fetchRecordingPreviews({
        cursor: pageParam as string | null,
        limit: 20,
        filters,
        searchTerm
      }),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => {
      if (!lastPage.has_more) {
        return undefined
      }
      return lastPage.next_cursor
    }
  })
}

export function useRecordingDetails(recordingId: string, language: string = 'english') {
  return useQuery<RecordingDetail, Error>({
    queryKey: recordingKeys.detail(recordingId, language),
    queryFn: () => fetchRecordingDetails(recordingId, language),
    enabled: !!recordingId
  })
}

export function useRecordingFilterOptions() {
  return useQuery<RecordingFilterOptions, Error>({
    queryKey: recordingKeys.filterOptions(),
    queryFn: fetchRecordingFilterOptions,
    staleTime: 10 * 60 * 1000 // 10 minutes - filter options don't change often
  })
}

export function useToggleRecordingStar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recordingId: string) => toggleRecordingStar(recordingId),
    onMutate: async recordingId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: recordingKeys.all })

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: recordingKeys.all })

      // Optimistically update all queries containing this recording
      queryClient.setQueriesData({ queryKey: recordingKeys.all }, (old: any) => {
        if (!old) return old

        // Handle infinite query data structure
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: RecordingsResponse) => ({
              ...page,
              recordings: page.recordings.map(rec =>
                rec.id === recordingId ? { ...rec, starred: !rec.starred } : rec
              )
            }))
          }
        }

        // Handle detail query data structure
        if (old.id === recordingId) {
          return { ...old, starred: !old.starred }
        }

        return old
      })

      return { previousData }
    },
    onError: (_err, _recordingId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: recordingKeys.all })
    }
  })
}

export function usePrefetchRecordingDetails() {
  const queryClient = useQueryClient()

  return useCallback(
    (recordingId: string, language: string = 'english') => {
      if (recordingId) {
        queryClient.prefetchQuery({
          queryKey: recordingKeys.detail(recordingId, language),
          queryFn: () => fetchRecordingDetails(recordingId, language)
        })
      }
    },
    [queryClient]
  )
}
