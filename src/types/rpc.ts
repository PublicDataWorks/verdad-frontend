// What each Supabase RPC actually resolves to.
//
// The generated types in ./database.ts only say `Json` for every `RETURNS jsonb` function, so
// the shapes below are hand-written - one per RPC this app calls - and derived from the live
// function bodies (`pg_get_functiondef`), not from the SQL checked into the backend repo,
// which has drifted. Nothing validates them at runtime: when a function changes, fix the
// shape here and the call sites will follow.

import type { Database } from './database'
import type {
  HideResponse,
  IRelatedSnippet,
  Label,
  LikeResponse,
  LocalizedText,
  PublicSnippetData,
  Snippet
} from './snippet'
import type { TopicDetailsResponse, TrendingTopicsResponse } from './trending'

type DatabaseFunctions = Database['public']['Functions']

/** `'{}'::jsonb` - how several RPCs say "not found" or "not visible to you". */
export type EmptyObject = Record<string, never>

/** `jsonb_build_object('status', ..., 'message', ...)`, the shape most mutations return. */
export interface StatusResponse {
  status: string
  message: string
}

export interface GetSnippetsResult {
  snippets: Snippet[]
  num_of_snippets: number
  current_page: number
  page_size: number
  total_pages: number
}

/** `get_snippet_labels`, also returned by `create_apply_and_upvote_label`. */
export interface SnippetLabelsResult {
  snippet_id: string
  labels: Label[]
}

export interface ToggleStarResponse {
  data: {
    message: string
    snippet_starred: boolean
  }
}

/** `toggle_upvote_label` returns a message and nothing else - no label list. */
export interface ToggleUpvoteLabelResponse {
  data: {
    message: string
  }
}

export interface AppUser {
  id: string
  email: string | null
  raw_user_meta_data: { name?: string; avatar_url?: string } | null
}

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

export interface LandingPageSnippet {
  id: string
  title: LocalizedText
  labels: LocalizedText[]
}

export interface LandingPageContentResult {
  content: {
    hero_title: LocalizedText
    hero_description: LocalizedText
    footer_text: LocalizedText
  }
  snippets: LandingPageSnippet[]
}

export interface WelcomeCardFeature {
  icon: string
  text: string
}

/** Exactly the keys `get_welcome_card` builds; the whole object is null when no card exists. */
export interface WelcomeCard {
  id: string
  language: string
  title: string
  subtitle: string | null
  features: WelcomeCardFeature[] | null
  footer_text: string | null
  contact_email: string | null
  contact_text: string | null
}

/** Fails to compile when a key below is not a function in the generated schema. */
type RpcReturnsOf<T extends Partial<Record<keyof DatabaseFunctions, unknown>>> = T

export type RpcReturns = RpcReturnsOf<{
  create_apply_and_upvote_label: SnippetLabelsResult
  dismiss_welcome_card: StatusResponse
  get_filtering_options: FilteringOptions
  get_landing_page_content: LandingPageContentResult
  get_public_snippet: PublicSnippetData | EmptyObject
  get_snippet: Snippet | EmptyObject
  get_snippets: GetSnippetsResult
  get_topic_details: TopicDetailsResponse
  get_trending_topics: TrendingTopicsResponse
  get_users: AppUser[]
  get_welcome_card: WelcomeCard | null
  hide_snippet: HideResponse
  like_snippet: LikeResponse
  search_related_snippets_public: IRelatedSnippet[]
  setup_profile: StatusResponse
  toggle_star_snippet: ToggleStarResponse
  toggle_upvote_label: ToggleUpvoteLabelResponse
  toggle_welcome_card: StatusResponse
  track_user_signups: StatusResponse
  unhide_snippet: HideResponse
}>
