import { useQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'
import shuffle from 'lodash/shuffle'

interface ContentLanguageMap {
  english: string
  spanish: string
}

interface Snippet {
  id: string
  title: ContentLanguageMap
  labels: ContentLanguageMap[]
}

export interface TranslatedLandingPageContent {
  hero_title: string
  hero_description: string
  footer_text: string
  snippets: {
    id: string
    titleEn: string
    titleEs: string
    labels: string[]
  }[]
}

async function fetchLandingPageContent(language: 'en' | 'es'): Promise<TranslatedLandingPageContent> {
  const { data, error } = await supabase.rpc('get_landing_page_content')

  if (error) {
    throw new Error(`Error fetching landing page content: ${error.message}`)
  }

  if (!data || typeof data !== 'object' || !Array.isArray(data.snippets)) {
    throw new Error('Unexpected data format received from Supabase')
  }

  const langKey = language === 'en' ? 'english' : 'spanish'

  const translatedContent: TranslatedLandingPageContent = {
    hero_title: data.content.hero_title[langKey],
    hero_description: data.content.hero_description[langKey],
    footer_text: data.content.footer_text[langKey],
    snippets: shuffle(data.snippets.map((snippet: Snippet) => ({
      id: snippet.id,
      titleEn: snippet.title['english'],
      titleEs: snippet.title['spanish'],
      labels: snippet.labels.map(label => label[langKey])
    })))
  }

  return translatedContent
}

export function useLandingPageContentQuery(language: string) {
  let userLanguage = language

  // Validate language input
  if (userLanguage !== 'en' && userLanguage !== 'es') {
    userLanguage = 'en'
  }

  return useQuery<TranslatedLandingPageContent, Error>({
    queryKey: ['landingPageContent', userLanguage],
    queryFn: () => fetchLandingPageContent(userLanguage as 'en' | 'es')
  })
}
