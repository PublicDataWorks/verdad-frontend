import { format } from 'date-fns-tz'
import { getPoliticalLabel } from './getPoliticalLabel'
import { ConfidenceChart } from '@/components/ui/ConfidenceScoreBar'

export function getSnippetSubtitle(snippet: any): JSX.Element {
  const parts = [
    snippet.audio_file.radio_station_code,
    snippet.audio_file.location_state,
    format(new Date(snippet.recorded_at), 'HH:mm zzz')
  ].filter(Boolean)

  // Get the political label
  const score = snippet.political_leaning?.score
  const label = score !== null && score !== undefined ? getPoliticalLabel(score) : ''

  // Map the political label to the appropriate color class
  const labelColorClass = (() => {
    if (label === 'Center') return 'text-purple-600'
    if (label === 'Left' || label === 'Center Left') return 'text-blue-400'
    if (label === 'Right' || label === 'Center Right') return 'text-red-500'
    return ''
  })()

  return (
    <>
      {parts.join(' • ')}
      {parts.length > 0 && ' • '}
      {label && <span className={labelColorClass}>{label}</span>}
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
