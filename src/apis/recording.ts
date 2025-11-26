import supabase from '@/lib/supabase'
import {
  RecordingsResponse,
  RecordingDetail,
  RecordingFilterOptions,
  RecordingFilters,
  ToggleStarResponse
} from '@/types/recording'

export const fetchRecordingPreviews = async ({
  cursor = null,
  limit = 20,
  filters = {},
  searchTerm = ''
}: {
  cursor?: string | null
  limit?: number
  filters?: RecordingFilters
  searchTerm?: string
}): Promise<RecordingsResponse> => {
  const { data, error } = await supabase.rpc('get_recordings_preview', {
    p_cursor: cursor,
    p_limit: limit,
    p_filter: filters,
    p_search_term: searchTerm
  })

  if (error) {
    console.error('Error fetching recording previews:', error)
    throw error
  }

  return {
    recordings: data.recordings || [],
    next_cursor: data.next_cursor,
    has_more: data.has_more
  }
}

export const fetchRecordingDetails = async (
  recordingId: string,
  language: string = 'english'
): Promise<RecordingDetail> => {
  const { data, error } = await supabase.rpc('get_recording_details', {
    p_recording_id: recordingId,
    p_language: language
  })

  if (error) {
    console.error('Error fetching recording details:', error)
    throw error
  }

  if (data.error) {
    throw new Error(data.error)
  }

  return data
}

export const toggleRecordingStar = async (recordingId: string): Promise<ToggleStarResponse> => {
  const { data, error } = await supabase.rpc('toggle_recording_star', {
    p_recording_id: recordingId
  })

  if (error) {
    console.error('Error toggling recording star:', error)
    throw error
  }

  return data
}

export const fetchRecordingFilterOptions = async (): Promise<RecordingFilterOptions> => {
  const { data, error } = await supabase.rpc('get_recording_filter_options')

  if (error) {
    console.error('Error fetching recording filter options:', error)
    throw error
  }

  return {
    states: data.states || [],
    radio_stations: data.radio_stations || [],
    languages: data.languages || [],
    labels: data.labels || []
  }
}
