import { format } from 'date-fns-tz'
import { getPoliticalLabel } from './getPoliticalLabel'
import { ConfidenceChart } from '@/components/ui/ConfidenceScoreBar'
import { Language } from '@/providers/language'
import { translations } from '@/constants/translations'
import { Snippet } from '@/types/snippet'
import { SnippetPreview } from '@/types/snippet-preview'

export function getSnippetSubtitle(snippet: Snippet | SnippetPreview | any, language: Language): JSX.Element {
  // Handle both full Snippet objects and SnippetPreview objects
  const parts = []
  
  // For SnippetPreview objects, we might not have the audio_file property
  // since it's not returned by the get_snippets_preview function
  if (snippet?.audio_file) {
    if (snippet.audio_file.radio_station_name) parts.push(snippet.audio_file.radio_station_name)
    if (snippet.audio_file.radio_station_code) parts.push(snippet.audio_file.radio_station_code)
    if (snippet.audio_file.location_state) parts.push(snippet.audio_file.location_state)
  }
  
  // Both types have recorded_at
  if (snippet?.recorded_at) {
    // Make sure to have at least the date for preview displays
    parts.push(format(new Date(snippet.recorded_at), 'MMM d, yyyy HH:mm zzz'))
  }

  // The political_leaning might not be available in SnippetPreview objects
  const score = snippet?.political_leaning?.score
  const label = score !== null && score !== undefined ? getPoliticalLabel(score, language) : ''

  // Map the political label to the appropriate color class
  const labelColorClass = (() => {
    if (label === translations[language].center) return 'text-purple-600'
    if (label === translations[language].left || label === translations[language]['center-left']) return 'text-blue-400'
    if (label === translations[language].right || label === translations[language]['center-right'])
      return 'text-red-500'
    return ''
  })()

  return (
    <>
      {parts.length > 0 ? parts.join(' • ') : ''}
      {parts.length > 0 && label && ' • '}
      {label && <span className={labelColorClass}>{label}</span>}
      {snippet?.confidence_scores?.level && (
        <>
          {(parts.length > 0 || label) && ' • '}
          <span className='inline-flex items-center'>
            <ConfidenceChart level={snippet.confidence_scores.level} />
          </span>
        </>
      )}
    </>
  )
}
