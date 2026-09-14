import { timedRpc } from '@/lib/timedRpc'
import { useQuery } from '@tanstack/react-query'

const fetchRoles = async () => {
  try {
    const { data } = await timedRpc<string[] | null>('get_roles')

    return data ?? []
  } catch (err) {
    console.error('Unexpected error fetching roles:', err)
    return []
  }
}

export const useIsAdmin = () => {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: fetchRoles,
    select: roles => roles.includes('admin')
  })
}
