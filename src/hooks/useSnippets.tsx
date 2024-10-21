import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'

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
}

export interface Snippet {
  id: string
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
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSnippets = async () => {
    setLoading(true)

    const select = `
      id,
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
      setSnippets(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    void fetchSnippets()
  }, [])

  const getSnippetById = (id: number) => {
    return snippets.find(snippet => snippet.id === id) || null
  }

  const sortSnippets = (snippets: Snippet[], sortBy: string) => {
    return [...snippets].sort((a, b) => {
      if (sortBy === 'Most Recent') {
        return new Date(b.audio_file.recorded_at).getTime() - new Date(a.audio_file.recorded_at).getTime()
      } else if (sortBy === 'Oldest') {
        return new Date(a.audio_file.recorded_at).getTime() - new Date(b.audio_file.recorded_at).getTime()
      }
      return 0
    })
  }

  return { snippets, loading, fetchSnippets, sortSnippets }
}
