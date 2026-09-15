import { rpc } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

const fetchRoles = async (): Promise<string[]> => {
  try {
    const { data, error } = await rpc('get_roles')

    if (error) {
      console.error('Error fetching roles:', error)
      return []
    }

    return data || []
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
