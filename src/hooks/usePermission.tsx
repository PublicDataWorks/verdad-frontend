import supabase from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

const fetchRoles = async () => {
  try {
    const { data, error } = await supabase.rpc('get_roles')

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

export const useIsAdmin = () => {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: fetchRoles,
    select: roles => roles.includes('admin')
  })
}
