import { timedRpc } from '@/lib/timedRpc'
import type { WelcomeCard } from '@/types/rpc'

export const getWelcomeContent = async (language: string): Promise<WelcomeCard | null> => {
  const { data } = await timedRpc('get_welcome_card', { p_language: language })
  return data
}
