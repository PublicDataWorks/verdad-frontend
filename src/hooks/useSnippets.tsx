import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'

interface Upvoter {
  id: string
  email: string
  upvoted_at: string
}

export interface Label {
  id: string
  text: string
  applied_at: string
  applied_by: string | null
  created_by: string | null
  upvoted_by: Upvoter[]
  is_ai_suggested: boolean
}

interface ConfidenceScore {
  score: number
  category: string
}

interface ConfidenceScores {
  overall: number
  categories: ConfidenceScore[]
}

interface AudioFileInfo {
  recorded_at: string
  location_state: string
  radio_station_code: string
  radio_station_name: string
}

interface Context {
  main: string
  before: string
  after: string
  before_en: string
  main_en: string
  after_en: string
}

export interface Snippet {
  id: string
  created_at: string
  transcription: string
  translation: string
  explanation: string
  context: Context
  start_time: string
  end_time: string
  keywords_detected: string[]
  title: string
  summary: string
  file_path: string
  confidence_scores: ConfidenceScores
  audio_file: AudioFileInfo
  labels: Label[]
}

const fetchLabels = async (snippetId: string) => {
  const { data, error } = await supabase.rpc('get_snippet_labels', { snippet_id: snippetId })
  if (error) {
    console.error('Error fetching labels:', error)
    return { labels: [] }
  }
  return { labels: data?.labels || [] }
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSnippets = async () => {
    setLoading(true)

    const select = `
      id,
      created_at,
      transcription,
      translation,
      explanation,
      context,
      start_time,
      end_time,
      keywords_detected,
      title,
      summary,
      file_path,
      confidence_scores,
      audio_file(
        radio_station_name,
        radio_station_code,
        location_state,
        recorded_at
      )
    `
    const { data, error } = await supabase.from('snippets').select(select).order('id')

    if (error) {
      console.error('Error fetching snippets:', error)
    } else {
      const snippetsWithLabels = await Promise.all(
        (data || []).map(async snippet => {
          const { labels } = await fetchLabels(snippet.id)
          return { ...snippet, labels } as Snippet
        })
      )
      setSnippets(snippetsWithLabels)
    }
    setLoading(false)
  }

  useEffect(() => {
    void fetchSnippets()
  }, [])

  const getSnippetById = (id: string) => snippets.find(snippet => snippet.id === id) ?? null

  const sortSnippets = (snippets: Snippet[], sortBy: string) => {
    return [...snippets].sort((a, b) => {
      if (sortBy === 'Most Recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'Oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return 0
    })
  }

  return { snippets, loading, fetchSnippets, sortSnippets, getSnippetById }
}
