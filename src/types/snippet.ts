export interface Context {
  main: string
  before: string
  after: string
  main_en: string
  before_en: string
  after_en: string
}

export interface AudioFileInfo {
  id: string
  location_city: string | null
  location_state: string
  radio_station_code: string
  radio_station_name: string
}

export interface Upvoter {
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

export interface ConfidenceScore {
  score: number
  category: string
}

export interface ConfidenceScores {
  overall: number
  categories: ConfidenceScore[]
}

export type LikeStatus = 1 | 0 | -1

export interface Snippet {
  hidden: boolean | null
  id: string
  title: string
  labels: Label[]
  status: string
  context: Context
  summary: string
  duration: string
  end_time: string
  file_path: string
  file_size: number
  audio_file: AudioFileInfo
  start_time: string
  explanation: string
  recorded_at: string
  error_message: string | null
  starred_by_user: boolean
  confidence_scores: ConfidenceScores
  language: {
    dialect: string
    primary_language: string
    register: string
  }
  political_leaning: {
    score: number
    explanation: {
      english: string
      spanish: string
    }
  }
  user_like_status: LikeStatus | null
  like_count: number
  dislike_count: number
}

export interface LikeSnippetVariables {
  snippetId: string
  likeStatus: LikeStatus
}

export interface PaginatedResponse {
  snippets: Snippet[]
  currentPage: number
  total_pages: number
}

export interface PublicSnippetData {
  id: string
  recorded_at: string
  file_path: string
  start_time: string
  end_time: string
  duration: string
  file_size: number
  context: Context
  language: string
  audio_file: AudioFileInfo
}

export interface HideResponse {
  hidden: boolean
}

export interface LikeResponse {
  like_count: number
  dislike_count: number
}
