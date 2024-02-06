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
      lastPage.data.past.length === ITEMS_PER_PAGE ? lastPage.data.currentCursor : undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    initialData,
    staleTime: 24 * 60 * 60 * 1000
  })

const useUpdateBroadcast = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: async (newData: UpdateBroadcast) => updateBroadcast(newData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['broadcastDashboard'] })
      // TODO: remove await
      // Get new content from response
    }
  })

export { useBroadcastDashboardQuery, useUpdateBroadcast, usePastBroadcastsQuery }
