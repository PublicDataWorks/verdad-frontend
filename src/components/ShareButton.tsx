import React, { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { toast } from '@/hooks/use-toast'

interface ShareButtonProps {
  snippetId: string
  showLabel?: boolean
}

const ShareButton: React.FC<ShareButtonProps> = ({ snippetId, showLabel = false }) => {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const publicUrl = `${window.location.origin}/p/${snippetId}`

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl)
      } else {
        // Fallback for Safari
        const textArea = document.createElement('textarea')
        textArea.value = publicUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setOpen(true)
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy link. Please try again.'
      })
    }
  }

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button variant='ghost' className={showLabel ? 'flex items-center space-x-2' : 'size-icon'}>
          <Share2 className={showLabel ? 'h-4 w-4' : 'h-5 w-5'} />
          {showLabel && <span>Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent hideWhenDetached align='end' className='z-40 w-[300px]'>
        <div className='flex-col items-start'>
          <div className='mb-2 text-sm font-medium'>Share snippet</div>
          <div className='flex w-full items-center gap-2'>
            <code className='flex-1 truncate rounded bg-muted px-2 py-1'>{publicUrl}</code>
            <TooltipProvider delayDuration={100}>
              <Tooltip open={open}>
                <TooltipTrigger asChild>
                  <Button variant='outline' size='sm' onClick={handleCopy}>
                    {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy link'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ShareButton
