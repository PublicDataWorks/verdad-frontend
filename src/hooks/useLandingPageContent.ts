import { useQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'

interface ContentRow {
  key: string
  content_en: string
  content_es: string
}

export interface LandingPageContent {
  hero_title: string
  hero_description: string
  footer_text: string
}

async function fetchLandingPageContent(language: 'en' | 'es'): Promise<LandingPageContent> {
  const { data, error } = await supabase.rpc('get_latest_landing_page_content')

  if (error) {
    throw new Error(`Error fetching landing page content: ${error.message}`)
  }

  if (!Array.isArray(data)) {
    throw new Error('Unexpected data format received from Supabase')
  }

  return data.reduce<LandingPageContent>(
    (acc, item: ContentRow) => {
      const key = item.key as keyof LandingPageContent
      acc[key] = language === 'en' ? item.content_en : item.content_es
      return acc
    },
    {
      hero_title: '',
      hero_description: '',
      footer_text: ''
    }
  )
}

export function useLandingPageContentQuery(language: string) {
  let userLanguage = language

  // Validate language input
  if (userLanguage !== 'en' && userLanguage !== 'es') {
    userLanguage = 'en'
  }

  return useQuery<LandingPageContent, Error>({
    queryKey: ['landingPageContent', userLanguage],
    queryFn: () => fetchLandingPageContent(userLanguage as 'en' | 'es')
  })
}
