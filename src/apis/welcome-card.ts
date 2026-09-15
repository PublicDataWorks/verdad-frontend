import { rpc } from '@/lib/supabase'
import type { WelcomeCard } from '@/types/rpc'

export const getWelcomeContent = async (language: string): Promise<WelcomeCard | null> => {
  const { data, error } = await rpc('get_welcome_card', { p_language: language })
  if (error) throw error
  return data
}
