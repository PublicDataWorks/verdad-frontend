import { Label, LikeStatus, AudioFileInfo, ConfidenceScores } from './snippet'

export interface SnippetPreview {
  id: string
  title: string
  summary: string
  file_path: string
  start_time: string
  recorded_at: string
  labels: Label[]
  starred_by_user: boolean
  user_like_status: LikeStatus | null
  like_count: number
  dislike_count: number
  hidden: boolean | null
  audio_file?: AudioFileInfo  // Optional since not returned by get_snippets_preview
  political_leaning?: {
    score: number
    explanation?: {
      english: string
      spanish: string
    }
  }
  confidence_scores?: ConfidenceScores
}

export interface PaginatedPreviewResponse {
  snippets: SnippetPreview[]
  currentPage: number
  total_pages: number
  total_snippets: number
}
