import { useQuery } from '@tanstack/react-query'
import { timedRpc } from '@/lib/timedRpc'
import shuffle from 'lodash/shuffle'
import { Language } from '@/providers/language'

interface ContentLanguageMap {
  english: string
  spanish: string
}

interface Snippet {
  id: string
  title: ContentLanguageMap
  labels: ContentLanguageMap[]
}

interface LandingPageContentResult {
  content: {
    hero_title: ContentLanguageMap
    hero_description: ContentLanguageMap
    footer_text: ContentLanguageMap
  }
  snippets: Snippet[]
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

async function fetchLandingPageContent(language: Language): Promise<TranslatedLandingPageContent> {
  const { data } = await timedRpc<LandingPageContentResult | null>('get_landing_page_content').catch((error: Error) => {
    throw new Error(`Error fetching landing page content: ${error.message}`)
  })

  if (!data || typeof data !== 'object' || !Array.isArray(data.snippets)) {
    throw new Error('Unexpected data format received from Supabase')
  }

  const translatedContent: TranslatedLandingPageContent = {
    hero_title: data.content.hero_title[language],
    hero_description: data.content.hero_description[language],
    footer_text: data.content.footer_text[language],
    snippets: shuffle(
      data.snippets.map(snippet => ({
        id: snippet.id,
        titleEn: snippet.title.english,
        titleEs: snippet.title.spanish,
        labels: snippet.labels.map(label => label[language])
      }))
    )
  }

  return translatedContent
}

export function useLandingPageContentQuery(language: Language) {
  const userLanguage = language

  return useQuery<TranslatedLandingPageContent, Error>({
    queryKey: ['landingPageContent', userLanguage],
    queryFn: () => fetchLandingPageContent(userLanguage)
  })
}
