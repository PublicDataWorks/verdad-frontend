import { timedRpc } from '@/lib/timedRpc'
import { useQuery } from '@tanstack/react-query'

const fetchRoles = async (): Promise<string[]> => {
  try {
    const { data } = await timedRpc('get_roles')

    return data
  } catch (err) {
    console.error('Unexpected error fetching roles:', err)
    return []
  }
}

export const useIsAdmin = () =>
  useQuery({
    queryKey: ['isAdmin'],
    queryFn: fetchRoles,
    select: roles => roles.includes('admin')
  })
