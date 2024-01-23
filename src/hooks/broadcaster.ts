import type { UpdateBroadcaster } from '../apis/broadcaster'
import { getBroadcastDashboard, updateBroadcaster } from '../apis/broadcaster'
import { useMutation, useQuery } from '@tanstack/react-query'

const useBroadcastDashboardQuery = () =>
  useQuery({
    queryKey: ['broadcastDashboard'],
    queryFn: getBroadcastDashboard
  })

const useUpdateBroadcaster = queryClient =>
  useMutation({
    mutationFn: (data: UpdateBroadcaster) => updateBroadcaster({ ...data }),
    onSuccess: () => {
      // Invalidate the cache for the specific query key
      queryClient.invalidateQueries('broadcasters')
    }
  })

export { useBroadcastDashboardQuery, useUpdateBroadcaster }
