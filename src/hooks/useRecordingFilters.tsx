import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RecordingFilters } from '@/types/recording'

function useRecordingFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = searchParams.get('state') || undefined
  const radio_station = searchParams.get('radio_station') || undefined
  const has_snippets = (searchParams.get('has_snippets') as RecordingFilters['has_snippets']) || 'all'
  const starred = searchParams.get('starred') === 'true'
  const label = searchParams.get('label') || undefined
  const language = searchParams.get('language') || undefined
  const searchTerm = searchParams.get('search') || ''

  const filters: RecordingFilters = {
    state,
    radio_station,
    has_snippets,
    starred: starred || undefined,
    label,
    language
  }

  const setRecordingFilters = useCallback(
    (newFilters: RecordingFilters, newSearchTerm?: string) => {
      const newParams = new URLSearchParams()

      if (newFilters.state) {
        newParams.set('state', newFilters.state)
      }
      if (newFilters.radio_station) {
        newParams.set('radio_station', newFilters.radio_station)
      }
      if (newFilters.has_snippets && newFilters.has_snippets !== 'all') {
        newParams.set('has_snippets', newFilters.has_snippets)
      }
      if (newFilters.starred) {
        newParams.set('starred', 'true')
      }
      if (newFilters.label) {
        newParams.set('label', newFilters.label)
      }
      if (newFilters.language) {
        newParams.set('language', newFilters.language)
      }
      if (newSearchTerm !== undefined ? newSearchTerm : searchTerm) {
        newParams.set('search', newSearchTerm !== undefined ? newSearchTerm : searchTerm)
      }

      setSearchParams(newParams)
    },
    [setSearchParams, searchTerm]
  )

  const setFilter = useCallback(
    <K extends keyof RecordingFilters>(key: K, value: RecordingFilters[K]) => {
      setRecordingFilters({ ...filters, [key]: value })
    },
    [setRecordingFilters, filters]
  )

  const setSearchTerm = useCallback(
    (term: string) => {
      setRecordingFilters(filters, term)
    },
    [setRecordingFilters, filters]
  )

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  const isEmpty = useCallback(() => {
    return (
      !state &&
      !radio_station &&
      has_snippets === 'all' &&
      !starred &&
      !label &&
      !language &&
      !searchTerm
    )
  }, [state, radio_station, has_snippets, starred, label, language, searchTerm])

  return {
    filters,
    searchTerm,
    setFilter,
    setSearchTerm,
    setRecordingFilters,
    clearAll,
    isEmpty
  }
}

export default useRecordingFilters
