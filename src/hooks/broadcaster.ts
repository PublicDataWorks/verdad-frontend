import { getBroadcastDashboard } from '../apis/broadcaster'
import { useQuery } from '@tanstack/react-query'

const useBroadcastDashboardQuery = () =>
  useQuery({
    queryKey: ['broadcastDashboard'],
    queryFn: getBroadcastDashboard
  })

// TODO: use later
// const useUpdateBroadcaster = queryClient =>
//   useMutation({
//     mutationFn: (data: UpdateBroadcaster) => updateBroadcaster({ ...data }),
//     onSuccess: () => {
//       // Invalidate the cache for the specific query key
//       queryClient.invalidateQueries('broadcasters')
//     }
//   })

export { useBroadcastDashboardQuery }
