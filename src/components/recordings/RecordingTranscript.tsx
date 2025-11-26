import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RecordingTranscript as TranscriptData, TranscriptSegment, DerivedSnippet } from '@/types/recording'
import { cn } from '@/lib/utils'

interface RecordingTranscriptProps {
  transcript: TranscriptData
  snippets?: DerivedSnippet[]
  searchTerm?: string
}

export default function RecordingTranscript({ transcript, snippets = [], searchTerm }: RecordingTranscriptProps) {
  // Parse timestamped transcription into segments
  const segments = useMemo<TranscriptSegment[]>(() => {
    const rawText = transcript.timestamped_transcription?.timestamped_transcription || transcript.initial_transcription

    if (!rawText) return []

    // If it's timestamped format [MM:SS], parse into segments
    if (rawText.includes('[')) {
      const timestampRegex = /\[(\d{1,2}:\d{2})\]\s*/g
      const parts = rawText.split(timestampRegex)
      const result: TranscriptSegment[] = []

      // parts array alternates between empty/text and timestamp
      // e.g., ["", "00:00", "text1", "00:10", "text2", ...]
      for (let i = 1; i < parts.length; i += 2) {
        const timestamp = parts[i]
        const text = parts[i + 1]?.trim()

        if (text) {
          result.push({
            timestamp,
            text
          })
        }
      }

      return result
    }

    // If no timestamps, return as single segment
    return [{ timestamp: '', text: rawText }]
  }, [transcript])

  // Calculate which segments overlap with snippets
  const snippetTimeRanges = useMemo(() => {
    return snippets.map(s => ({
      id: s.id,
      start: timeToSeconds(s.start_time),
      end: timeToSeconds(s.end_time),
      title: s.title
    }))
  }, [snippets])

  const isSegmentInSnippet = (timestamp: string) => {
    if (!timestamp) return null
    const seconds = timestampToSeconds(timestamp)
    return snippetTimeRanges.find(range => seconds >= range.start && seconds <= range.end)
  }

  // Highlight search term in text
  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transcript available for this recording.
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px] rounded-md border p-4">
      <div className="space-y-4">
        {segments.map((segment, index) => {
          const snippetMatch = isSegmentInSnippet(segment.timestamp)

          return (
            <div
              key={index}
              className={cn(
                'flex gap-3 p-2 rounded-lg transition-colors',
                snippetMatch && 'bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-l-yellow-400'
              )}
            >
              {segment.timestamp && (
                <div className="flex items-start gap-1 text-xs text-muted-foreground font-mono shrink-0 pt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{segment.timestamp}</span>
                </div>
              )}
              <p className="text-sm leading-relaxed flex-1">
                {highlightText(segment.text)}
              </p>
              {snippetMatch && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 shrink-0">
                  Snippet
                </span>
              )}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

// Helper functions
function timeToSeconds(time: string): number {
  // Handle HH:MM:SS or MM:SS format
  if (!time) return 0
  const parts = time.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

function timestampToSeconds(timestamp: string): number {
  // Handle [MM:SS] format
  const parts = timestamp.split(':').map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
