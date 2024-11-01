import React, { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

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
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setOpen(true)
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant='ghost' 
          className={showLabel ? 'flex items-center space-x-2' : 'size-icon'}
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className={showLabel ? 'h-4 w-4' : 'h-5 w-5'} />
          {showLabel && <span>Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[300px] p-0'>
        <DropdownMenuItem className='flex-col items-start' onSelect={(e) => e.preventDefault()}>
          <div className='mb-2 text-sm font-medium'>Share snippet</div>
          <div className='flex w-full items-center gap-2'>
            <code className='flex-1 truncate rounded bg-muted px-2 py-1'>{publicUrl}</code>
            <TooltipProvider delayDuration={100}>
              <Tooltip open={open}>
                <TooltipTrigger asChild>
                  <Button variant='outline' size='sm' onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy link'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ShareButton
