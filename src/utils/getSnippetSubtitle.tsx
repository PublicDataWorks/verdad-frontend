import { format } from 'date-fns-tz'
import { getPoliticalLabel } from './getPoliticalLabel'
import { ConfidenceChart } from '@/components/ui/ConfidenceScoreBar'

export function getSnippetSubtitle(snippet: any): JSX.Element {
  const parts = [
    snippet.audio_file.radio_station_code,
    snippet.audio_file.location_state,
    format(new Date(snippet.recorded_at), 'HH:mm zzz')
  ].filter(Boolean)

  return (
    <>
      {parts.join(' • ')}
      {parts.length > 0 && ' • '}
      {snippet.political_leaning?.score && (
        <span className='text-blue-500'>{getPoliticalLabel(snippet.political_leaning.score)}</span>
      )}
      {snippet.confidence_scores?.level && (
        <>
          {' • '}
          <span className='inline-flex items-center'>
            <ConfidenceChart level={snippet.confidence_scores.level} />
          </span>
        </>
      )}
    </>
  )
}
