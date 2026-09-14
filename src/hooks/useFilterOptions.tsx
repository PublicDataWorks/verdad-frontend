// src/hooks/useFilters.ts
import { useQuery } from '@tanstack/react-query'
import { timedRpc } from '@/lib/timedRpc'

export interface FilterOption {
  label: string
  value: string
}

export interface LabelsResponse {
  items: FilterOption[]
  page_size: number
  total_pages: number
  current_page: number
}

export interface FilteringOptions {
  labels: LabelsResponse
  states: FilterOption[]
  sources: FilterOption[]
  labeledBy: FilterOption[]
  languages: FilterOption[]
  starredBy: FilterOption[]
}

export const filterKeys = {
  all: ['filters'] as const,
  options: (language: string) => [...filterKeys.all, { language }] as const
}

export const fetchFilteringOptions = async (language: string = 'english'): Promise<FilteringOptions> => {
  const { data } = await timedRpc<FilteringOptions>('get_filtering_options', {
    p_language: language,
    p_label_page: 0,
    p_label_page_size: 1000
  })

  return data
}

export function useFilters(language: string = 'english') {
  return useQuery({
    queryKey: filterKeys.options(language),
    queryFn: () => fetchFilteringOptions(language),
    staleTime: 1000 * 60 * 5 // Optional: Cache data for 5 minutes
  })
}
