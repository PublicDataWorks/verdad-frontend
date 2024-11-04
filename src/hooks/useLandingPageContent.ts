import { useQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ContentRow {
  key: string;
  content_en: string;
  content_es: string;
}

export interface LandingPageContent {
  hero_title: string;
  hero_description: string;
  footer_text: string;
}

interface Database {
  public: {
    Tables: {
      landing_page_content: {
        Row: ContentRow;
      };
    };
  };
}

async function fetchLandingPageContent(language: 'en' | 'es'): Promise<LandingPageContent> {
  const client = supabase as SupabaseClient<Database>;
  const { data, error } = await client
    .from('landing_page_content')
    .select('key, content_en, content_es');

  if (error) {
    throw new Error(`Error fetching landing page content: ${error.message}`);
  }

  // Transform the array of rows into an object keyed by content key
  return data.reduce<LandingPageContent>((acc, item: ContentRow) => {
    const key = item.key as keyof LandingPageContent;
    acc[key] = language === 'en' ? item.content_en : item.content_es;
    return acc;
  }, {
    hero_title: '',
    hero_description: '',
    footer_text: ''
  });
}

export function useLandingPageContent(language: 'en' | 'es') {
  return useQuery({
    queryKey: ['landingPageContent', language],
    queryFn: async () => fetchLandingPageContent(language),
  });
}
