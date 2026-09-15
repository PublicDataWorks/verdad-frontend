import { useQuery } from '@tanstack/react-query'
import { rpc } from '@/lib/supabase'
import shuffle from 'lodash/shuffle'
import type { Language } from '@/providers/language'

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
  const { data, error } = await rpc('get_landing_page_content')

  if (error) {
    throw new Error(`Error fetching landing page content: ${error.message}`)
  }

  // `get_landing_page_content` always builds an object, but the payload is not validated.
  if (!Array.isArray(data.snippets)) {
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
