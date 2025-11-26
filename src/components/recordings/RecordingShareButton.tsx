import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'

interface RecordingShareButtonProps {
  recordingId: string
  showLabel?: boolean
}

export default function RecordingShareButton({ recordingId, showLabel = false }: RecordingShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/recordings/${recordingId}`

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        // Fallback for Safari
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard',
        variant: 'destructive'
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Share2 className="h-4 w-4" />
          {showLabel && <span className="ml-1">Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={e => e.stopPropagation()}>
        <div className="space-y-3">
          <h4 className="font-medium">Share Recording</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-2 py-1 text-sm truncate">{shareUrl}</code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {copied && <p className="text-sm text-green-600">Copied to clipboard!</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}
