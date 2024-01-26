import {
  ITEMS_PER_PAGE,
  type UpdateBroadcast,
  getBroadcastDashboard,
  getPastBroadcasts,
  updateBroadcast
} from '../apis/broadcastApi'
import { type QueryClient, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'

const useBroadcastDashboardQuery = () =>
  useQuery({
    queryKey: ['broadcastDashboard'],
    queryFn: getBroadcastDashboard
  })

const usePastBroadcastsQuery = initialData =>
  useInfiniteQuery({
    queryKey: ['pastBroadcasts'],
    queryFn: getPastBroadcasts,
    initialPageParam: undefined,
    getNextPageParam: lastPage =>
      lastPage.data.past.length === ITEMS_PER_PAGE - 1 ? lastPage.data.currentCursor : undefined,
    initialData: initialData
  })

const useUpdateBroadcast = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: async (newData: UpdateBroadcast) => updateBroadcast(newData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['broadcastDashboard'] })
    }
  })

export { useBroadcastDashboardQuery, useUpdateBroadcast, usePastBroadcastsQuery }
