import { format } from 'date-fns-tz'
import { getPoliticalLabel } from './getPoliticalLabel'
import { ConfidenceChart } from '@/components/ui/ConfidenceScoreBar'
import { badgeVariants } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Language } from '@/providers/language'
import { translations } from '@/constants/translations'
import type { AudioFileInfo, ConfidenceScores, HarmfulRhetoric } from '@/types/snippet'

// Matches the backend research-view predicate (`harmful_rhetoric.score >= 70` in `get_snippets`).
export const HARMFUL_RHETORIC_THRESHOLD = 70

// The subset of snippet fields the subtitle needs; accepts Snippet and PublicSnippetData.
export interface SubtitleSnippet {
  audio_file?: Partial<AudioFileInfo> | null
  recorded_at?: string | null
  political_leaning?: { score?: number | null } | null
  confidence_scores?: Pick<ConfidenceScores, 'level' | 'harmful_rhetoric'> | null
}

// Returns the harmful-rhetoric block only when it is present and scores at or above the threshold.
export function getHarmfulRhetoric(
  confidenceScores: SubtitleSnippet['confidence_scores'] | undefined
): HarmfulRhetoric | null {
  const rhetoric = confidenceScores?.harmful_rhetoric
  if (!rhetoric || typeof rhetoric.score !== 'number' || !Number.isFinite(rhetoric.score)) return null
  return rhetoric.score >= HARMFUL_RHETORIC_THRESHOLD ? rhetoric : null
}

function HarmfulRhetoricBadge({ rhetoric, language }: { rhetoric: HarmfulRhetoric; language: Language }) {
  const t = translations[language]
  // An unknown kind (from a newer backend) still gets the badge, just without the qualifier.
  const kind = (t.harmfulRhetoricKinds as Partial<Record<string, string>>)[rhetoric.kind]
  const harm = rhetoric.harm?.[language] || rhetoric.harm?.english

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          badgeVariants({ variant: 'outline' }),
          'border-amber-500 px-1.5 py-0 font-medium text-amber-700 dark:border-amber-400 dark:text-amber-300'
        )}
      >
        {kind ? `${t.harmfulRhetoric}: ${kind}` : t.harmfulRhetoric}
      </TooltipTrigger>
      {harm && (
        <TooltipContent className='max-w-xs'>
          <p>{harm}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
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

  const confidenceLevel = snippet?.confidence_scores?.level
  const rhetoric = getHarmfulRhetoric(snippet?.confidence_scores)

  return (
    <>
      {parts.length > 0 ? parts.join(' • ') : ''}
      {parts.length > 0 && label && ' • '}
      {label && <span className={labelColorClass}>{label}</span>}
      {confidenceLevel && (
        <>
          {(parts.length > 0 || label) && ' • '}
          <span className='inline-flex items-center'>
            <ConfidenceChart level={confidenceLevel} />
          </span>
        </>
      )}
      {rhetoric && (
        <>
          {(parts.length > 0 || label || confidenceLevel) && ' • '}
          <HarmfulRhetoricBadge rhetoric={rhetoric} language={language} />
        </>
      )}
    </>
  )
}
