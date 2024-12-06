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
  order_by?: 'activities' | 'upvotes' | 'comments' | 'latest'
  upvotedBy: string[]
  searchTerm?: string
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
  const order_by = searchParams.get('order_by') as SnippetFilters['order_by']
  const upvotedBy = parseArrayParam(searchParams.get('upvotedBy')) as SnippetFilters['upvotedBy']
  const searchTerm = searchParams.get('searchTerm') as SnippetFilters['searchTerm']

  const setSnippetFilters = useCallback(
    (filters: SnippetFilters) => {
      const newParams = new URLSearchParams()

      setArrayParam(newParams, 'languages', filters.languages)
      setArrayParam(newParams, 'states', filters.states)
      setArrayParam(newParams, 'sources', filters.sources)
      setArrayParam(newParams, 'labels', filters.labels)
      setArrayParam(newParams, 'labeledBy', filters.labeledBy)
      setArrayParam(newParams, 'starredBy', filters.starredBy)
      setArrayParam(newParams, 'upvotedBy', filters.upvotedBy)

      if (filters.politicalSpectrum) {
        newParams.set('politicalSpectrum', filters.politicalSpectrum)
      }

      if (filters.order_by) {
        newParams.set('order_by', filters.order_by)
      }

      if (filters.searchTerm) {
        newParams.set('searchTerm', filters.searchTerm.trim())
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
    politicalSpectrum,
    order_by,
    upvotedBy,
    searchTerm
  }

  const isEmpty = useCallback(() => {
    return (
      languages.length === 0 &&
      states.length === 0 &&
      sources.length === 0 &&
      labels.length === 0 &&
      labeledBy.length === 0 &&
      starredBy.length === 0 &&
      !politicalSpectrum
    )
  }, [languages, states, sources, labels, labeledBy, starredBy, politicalSpectrum, order_by, upvotedBy])

  const setFilter = useCallback(
    (category: keyof SnippetFilters, values: any) => {
      setSnippetFilters({ ...filters, [category]: values })
    },
    [setSnippetFilters, filters]
  )

  const clearAll = useCallback(() => {
    const newParams = new URLSearchParams()
    if (order_by) {
      newParams.set('order_by', order_by)
    }
    setSearchParams(newParams)
  }, [setSearchParams, order_by])

  return {
    filters,
    setFilter,
    clearAll,
    isEmpty
  }
}

export default useSnippetFilters
