import { format } from 'date-fns-tz'
import { getPoliticalLabel } from './getPoliticalLabel'
import { ConfidenceChart } from '@/components/ui/ConfidenceScoreBar'
import { Language } from '@/providers/language'
import { translations } from '@/constants/translations'
import type { AudioFileInfo, ConfidenceScores } from '@/types/snippet'

// The subset of snippet fields the subtitle needs; accepts Snippet and PublicSnippetData.
export interface SubtitleSnippet {
  audio_file?: Partial<AudioFileInfo> | null
  recorded_at?: string | null
  political_leaning?: { score?: number | null } | null
  confidence_scores?: Pick<ConfidenceScores, 'level'> | null
}

export function getSnippetSubtitle(snippet: SubtitleSnippet | null | undefined, language: Language): JSX.Element {
  const parts = [
    snippet?.audio_file?.radio_station_name,
    snippet?.audio_file?.radio_station_code,
    snippet?.audio_file?.location_state,
    snippet?.recorded_at ? format(new Date(snippet.recorded_at), 'MMM d, yyyy HH:mm zzz') : null
  ].filter(Boolean)

  // Get the political label
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
