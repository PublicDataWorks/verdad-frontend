import { getWelcomeContent, type WelcomeCard } from '@/apis/welcome-card'
import { useQuery } from '@tanstack/react-query'

export const useWelcomeCard = (language: string) => {
  return useQuery<WelcomeCard, Error>({
    queryKey: ['welcome-card', language],
    queryFn: () => getWelcomeContent(language)
  })
}
