import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Radio, Clock, FileAudio, Tag } from 'lucide-react'
// Using custom card style to match main app
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RecordingPreview } from '@/types/recording'
import RecordingShareButton from './RecordingShareButton'
import RecordingStarToggle from './RecordingStarToggle'
import { usePrefetchRecordingDetails } from '@/hooks/useRecordings'
import { cn } from '@/lib/utils'

interface RecordingCardProps {
  recording: RecordingPreview
}

export default function RecordingCard({ recording }: RecordingCardProps) {
  const navigate = useNavigate()
  const prefetchDetails = usePrefetchRecordingDetails()
  const [localStarred, setLocalStarred] = useState(recording.starred)

  const handleClick = (e: React.MouseEvent) => {
    // Save scroll position for back navigation
    sessionStorage.setItem('recordingBrowserScrollPosition', window.scrollY.toString())

    // Handle cmd/ctrl click for new tab
    if (e.metaKey || e.ctrlKey) {
      window.open(`/recordings/${recording.id}`, '_blank')
      return
    }

    navigate(`/recordings/${recording.id}`)
  }

  const handleMouseEnter = () => {
    prefetchDetails(recording.id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      className={cn(
        'mt-2 rounded-lg border-2 bg-background-gray-lightest p-6 cursor-pointer',
        'border-transparent transition-all duration-700 ease-in-out hover:border-blue-600',
        // Pale yellow highlight for recordings with snippets
        recording.has_snippets && 'bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-400'
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Station and Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Radio className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-foreground truncate">{recording.radio_station_name}</span>
              <span className="text-muted-foreground">({recording.radio_station_code})</span>
            </div>

            {/* Location */}
            {recording.location_state && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {recording.location_city && `${recording.location_city}, `}
                  {recording.location_state}
                </span>
              </div>
            )}

            {/* Date and Day */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(recording.recorded_at)}</span>
              <span className="text-muted-foreground">({recording.recording_day_of_week})</span>
            </div>

            {/* File info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileAudio className="h-4 w-4" />
                <span>{formatFileSize(recording.file_size)}</span>
              </div>
              {recording.primary_language && recording.primary_language !== 'Unknown' && (
                <div className="flex items-center gap-1">
                  <span className="text-xs px-2 py-0.5 bg-muted rounded">{recording.primary_language}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - actions and snippet count */}
          <div className="flex flex-col items-end gap-2">
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <RecordingShareButton recordingId={recording.id} />
              <RecordingStarToggle
                recordingId={recording.id}
                starred={localStarred}
                onOptimisticUpdate={setLocalStarred}
              />
            </div>

            {/* Snippet count badge */}
            {recording.has_snippets && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Tag className="h-3 w-3 mr-1" />
                    {recording.snippet_count} snippet{recording.snippet_count !== 1 && 's'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This recording has {recording.snippet_count} flagged snippet{recording.snippet_count !== 1 && 's'}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Status indicator */}
            {recording.status !== 'Processed' && (
              <Badge variant="outline" className="text-xs">
                {recording.status}
              </Badge>
            )}
          </div>
        </div>
    </div>
  )
}
