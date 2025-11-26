import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToggleRecordingStar } from '@/hooks/useRecordings'
import { useToast } from '@/hooks/use-toast'

interface RecordingStarToggleProps {
  recordingId: string
  starred: boolean
  onOptimisticUpdate?: (starred: boolean) => void
}

export default function RecordingStarToggle({ recordingId, starred, onOptimisticUpdate }: RecordingStarToggleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const toggleStar = useToggleRecordingStar()

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Optimistic update
    onOptimisticUpdate?.(!starred)

    try {
      await toggleStar.mutateAsync(recordingId)
    } catch (error) {
      // Rollback on error
      onOptimisticUpdate?.(starred)
      toast({
        title: 'Error',
        description: 'Failed to update star status',
        variant: 'destructive'
      })
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={toggleStar.isPending}
        >
          <Star
            className="h-4 w-4"
            fill={starred ? 'gold' : isHovered ? 'lightgray' : 'none'}
            stroke={starred ? 'gold' : 'currentColor'}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{starred ? 'Unstar recording' : 'Star recording'}</p>
      </TooltipContent>
    </Tooltip>
  )
}
