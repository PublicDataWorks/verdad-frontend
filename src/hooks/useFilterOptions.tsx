// src/hooks/useFilters.ts
import { useQuery } from '@tanstack/react-query'
import { rpc } from '@/lib/supabase'
import type { FilteringOptions } from '@/types/rpc'

export type { FilterOption, FilteringOptions, LabelsResponse } from '@/types/rpc'

export const filterKeys = {
  all: ['filters'] as const,
  options: (language: string) => [...filterKeys.all, { language }] as const
}

export const fetchFilteringOptions = async (language = 'english'): Promise<FilteringOptions> => {
  const { data, error } = await rpc('get_filtering_options', {
    p_language: language,
    p_label_page: 0,
    p_label_page_size: 1000
  })

  if (error) {
    console.error('Error fetching filtering options:', error)
    throw error
  }

  return data
}

export function useFilters(language = 'english') {
  return useQuery({
    queryKey: filterKeys.options(language),
    queryFn: () => fetchFilteringOptions(language),
    staleTime: 1000 * 60 * 5 // Optional: Cache data for 5 minutes
  })
}
