import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type SnippetFilters = {
  languages: string[]
  states: string[]
  sources: string[]
  labels: string[]
  labeledBy: string[]
  starredBy: string[]
  politicalSpectrum?: 'center' | 'center_left' | 'center_right' | 'left' | 'right'
}

const parseArrayParam = (param: string | null): string[] => {
  return param ? param.split(',') : []
}

const setArrayParam = (newParams: URLSearchParams, key: string, value: string[]) => {
  if (value.length > 0) {
    newParams.set(key, value.join(','))
  }
}

function useSnippetFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const languages = parseArrayParam(searchParams.get('languages')) as SnippetFilters['languages']
  const states = parseArrayParam(searchParams.get('states')) as SnippetFilters['states']
  const sources = parseArrayParam(searchParams.get('sources')) as SnippetFilters['sources']
  const labels = parseArrayParam(searchParams.get('labels')) as SnippetFilters['labels']
  const labeledBy = parseArrayParam(searchParams.get('labeledBy')) as SnippetFilters['labeledBy']
  const starredBy = parseArrayParam(searchParams.get('starredBy')) as SnippetFilters['starredBy']
  const politicalSpectrum = searchParams.get('politicalSpectrum') as SnippetFilters['politicalSpectrum']

  const setSnippetFilters = useCallback(
    (filters: SnippetFilters) => {
      const newParams = new URLSearchParams()

      setArrayParam(newParams, 'languages', filters.languages)
      setArrayParam(newParams, 'states', filters.states)
      setArrayParam(newParams, 'sources', filters.sources)
      setArrayParam(newParams, 'labels', filters.labels)
      setArrayParam(newParams, 'labeledBy', filters.labeledBy)
      setArrayParam(newParams, 'starredBy', filters.starredBy)

      if (filters.politicalSpectrum) {
        newParams.set('politicalSpectrum', filters.politicalSpectrum)
      }

      setSearchParams(newParams)
    },
    [setSearchParams]
  )

  const filters = {
    languages,
    states,
    sources,
    labels,
    labeledBy,
    starredBy,
    politicalSpectrum
  }


  // Use this to follow the old API
  const setFilter = useCallback(
    (category: keyof SnippetFilters, values: any) => {
      setSnippetFilters({ ...filters, [category]: values })
    },
    [setSnippetFilters]
  )

  const clearAll = useCallback(() => {
    const newParams = new URLSearchParams()
    setSearchParams(newParams)
  }, [setSearchParams])

  return {
    filters,
    setFilter,
    clearAll
  }
}

export default useSnippetFilters