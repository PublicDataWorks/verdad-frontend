import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Radio,
  FileAudio,
  ExternalLink,
  Loader2,
  AlertCircle,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import RecordingShareButton from './RecordingShareButton'
import RecordingStarToggle from './RecordingStarToggle'
import RecordingTranscript from './RecordingTranscript'
import { useRecordingDetails } from '@/hooks/useRecordings'
import { cn } from '@/lib/utils'

export default function RecordingDetail() {
  const { recordingId } = useParams<{ recordingId: string }>()
  const navigate = useNavigate()
  const [language, setLanguage] = useState<'english' | 'spanish'>('english')
  const [localStarred, setLocalStarred] = useState<boolean | null>(null)

  const { data: recording, isLoading, isError, error } = useRecordingDetails(recordingId || '', language)

  const starred = localStarred ?? recording?.starred ?? false

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const handleBack = () => {
    navigate('/recordings')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !recording) {
    return (
      <div className="min-h-screen p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to recordings
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Recording not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const audioUrl = `${import.meta.env.VITE_AUDIO_BASE_URL}/${recording.file_path}`

  return (
    <div
      className={cn(
        'min-h-screen',
        recording.has_snippets && 'bg-yellow-50/50 dark:bg-yellow-950/10'
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <RecordingShareButton recordingId={recording.id} showLabel />
            <RecordingStarToggle
              recordingId={recording.id}
              starred={starred}
              onOptimisticUpdate={setLocalStarred}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Recording info card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  {recording.radio_station_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {recording.radio_station_code}
                </p>
              </div>
              {recording.has_snippets && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Tag className="h-3 w-3 mr-1" />
                  {recording.snippet_count} snippet{recording.snippet_count !== 1 && 's'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(recording.recorded_at)}</span>
              </div>
              {recording.location_state && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {recording.location_city && `${recording.location_city}, `}
                    {recording.location_state}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileAudio className="h-4 w-4" />
                <span>{formatFileSize(recording.file_size)}</span>
              </div>
            </div>

            {/* Audio player */}
            <div className="pt-4">
              <audio controls className="w-full" src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transcript</CardTitle>
              {recording.transcript.transcriptor && (
                <Badge variant="outline" className="text-xs">
                  {recording.transcript.transcriptor}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <RecordingTranscript transcript={recording.transcript} snippets={recording.snippets} />
          </CardContent>
        </Card>

        {/* Derived Snippets */}
        {recording.has_snippets && recording.snippets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Derived Snippets ({recording.snippets.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-flagged segments from this recording
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recording.snippets.map(snippet => (
                  <div
                    key={snippet.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{snippet.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {snippet.summary}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            {snippet.start_time} - {snippet.end_time}
                          </span>
                          {snippet.confidence_scores && (
                            <span>Confidence: {snippet.confidence_scores.overall}%</span>
                          )}
                        </div>
                        {/* Labels */}
                        {snippet.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {snippet.labels.map(label => (
                              <Badge key={label.id} variant="secondary" className="text-xs">
                                {label.text}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/snippet/${snippet.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
