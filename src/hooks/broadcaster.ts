import { UpdateBroadcast, getBroadcastDashboard, updateBroadcast } from '../apis/broadcastApi'
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'

const useBroadcastDashboardQuery = () =>
  useQuery({
    queryKey: ['broadcastDashboard'],
    queryFn: getBroadcastDashboard
  })

const useUpdateBroadcast = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: (newData: UpdateBroadcast) => updateBroadcast(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcastDashboard'] })
    }
  })

export { useBroadcastDashboardQuery, useUpdateBroadcast }
