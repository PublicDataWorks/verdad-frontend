// Shapes returned by the snippet RPCs. They are derived from the live function bodies
// (`jsonb_build_object` keys, COALESCEs) and from the nullability of the underlying columns
// in src/types/database.ts. Nothing validates them at runtime, so keep them honest:
// see src/types/rpc.ts for the RPC -> shape mapping.

/** A `{english, spanish}` jsonb column returned as-is, without picking a language. */
export interface LocalizedText {
  english: string
  spanish: string
}

export interface Context {
  main: string
  before: string
  after: string
  main_en: string
  before_en: string
  after_en: string
}

/**
 * `audio_files` joined onto a snippet. Every field is nullable: the join is a LEFT JOIN on a
 * nullable `snippets.audio_file`, and `location_*` are nullable columns.
 */
export interface AudioFileInfo {
  id: string | null
  location_city: string | null
  location_state: string | null
  radio_station_code: string | null
  radio_station_name: string | null
}

/** `get_public_snippet` builds the same object without the audio file id. */
export type PublicAudioFileInfo = Omit<AudioFileInfo, 'id'>

export interface Upvoter {
  id: string
  email: string
  upvoted_at: string
}

export interface Label {
  id: string
  text: string
  upvote_count: number
  upvoted_by_me: boolean
}

export interface ConfidenceScore {
  score: number
  category: string
}

export interface ConfidenceScores {
  overall: number
  categories: ConfidenceScore[]
  level?: 'high' | 'low' | 'medium'
}

/** `snippets.language` jsonb. Unvalidated model output, so every key is optional. */
export interface SnippetLanguage {
  primary_language?: string
  dialect?: string
  register?: string
}

export interface PoliticalLeaning {
  score: number
  explanation: {
    english: string
    spanish: string
  }
}

export type LikeStatus = 1 | 0 | -1

/**
 * An item of `get_snippets.snippets` and the result of `get_snippet`. The two differ
 * slightly, so the keys only one of them returns are optional.
 */
export interface Snippet {
  id: string
  hidden: boolean
  title: string | null
  summary: string | null
  explanation: string | null
  context: Context | null
  labels: Label[] | null
  duration: string | null
  start_time: string | null
  end_time: string | null
  recorded_at: string | null
  file_path: string
  file_size: number
  audio_file: AudioFileInfo | null
  confidence_scores: ConfidenceScores | null
  language: SnippetLanguage | null
  political_leaning: PoliticalLeaning | null
  starred_by_user: boolean
  user_like_status: LikeStatus | null
  like_count: number
  dislike_count: number
  /** `get_snippets` only. */
  user_last_activity?: string | null
  /** `get_snippet` only. */
  status?: string
  /** `get_snippet` only. */
  error_message?: string | null
}

export interface LikeSnippetVariables {
  snippetId: string
  likeStatus: LikeStatus
}

export interface PaginatedResponse {
  snippets: Snippet[]
  currentPage: number
  total_pages: number
  total_snippets: number
}

export interface PublicSnippetData {
  id: string
  recorded_at: string | null
  file_path: string
  start_time: string | null
  end_time: string | null
  duration: string | null
  file_size: number
  context: Context | null
  /** `language -> 'primary_language'`, null when the snippet has no language. */
  language: string | null
  audio_file: PublicAudioFileInfo | null
  title: string | null
  summary: string | null
}

/** `hide_snippet` / `unhide_snippet`: a denied hide comes back as `status: 'error'`. */
export interface HideResponse {
  status: 'success' | 'error'
  message: string
}

export interface LikeResponse {
  status: string
  id: string
  like_count: number
  dislike_count: number
}

export interface RelatedSnippetLabel {
  text: string
  text_spanish: string | null
}

export interface IRelatedSnippet {
  id: string
  /** The raw `title` jsonb: `search_related_snippets_public` does not pick a language. */
  title: LocalizedText | null
  radio_station_name: string
  radio_station_code: string
  location_state: string | null
  summary: string | null
  labels: RelatedSnippetLabel[]
  recorded_at: string | null
  comment_count: number | null
  file_path: string
  start_time: string | null
  /**
   * Not returned by `search_related_snippets_public`; only the optimistic update in
   * `useStarSnippet` puts it in the cache.
   */
  starred_by_user?: boolean
}
