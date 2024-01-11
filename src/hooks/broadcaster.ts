import type { UpdateBroadcaster } from '../apis/broadcaster'
import { getBroadcasters, updateBroadcaster } from '../apis/broadcaster'
import { useMutation, useQuery } from '@tanstack/react-query'

const useBroadcastersQuery = () =>
  useQuery({
    queryKey: ['broadcasters'],
    queryFn: getBroadcasters
  })

const useUpdateBroadcaster = (queryClient) =>
  useMutation({
    mutationFn: (data: UpdateBroadcaster) => updateBroadcaster({...data}),
    onSuccess: () => {
      // Invalidate the cache for the specific query key
      queryClient.invalidateQueries('broadcasters');
    },
  })

export { useBroadcastersQuery, useUpdateBroadcaster }
