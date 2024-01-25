import {
  ITEMS_PER_PAGE,
  UpdateBroadcast,
  getBroadcastDashboard,
  getPastBroadcasts,
  updateBroadcast
} from '../apis/broadcastApi'
import { QueryClient, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const useBroadcastDashboardQuery = () =>
  useQuery({
    queryKey: ['broadcastDashboard'],
    queryFn: getBroadcastDashboard
  })

const usePastBroadcastsQuery = (initialData) =>
  useInfiniteQuery({
    queryKey: ['pastBroadcasts'],
    queryFn: getPastBroadcasts,
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.data.past.length < ITEMS_PER_PAGE ? undefined : lastPage.data.currentCursor,
    initialData: initialData,
  })

const useUpdateBroadcast = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: (newData: UpdateBroadcast) => updateBroadcast(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcastDashboard'] })
    }
  })

export { useBroadcastDashboardQuery, useUpdateBroadcast, usePastBroadcastsQuery }
