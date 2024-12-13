import { Share2, MessageSquare, Check, Copy, Star } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns-tz'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { IRelatedSnippet } from '@/types/snippet'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { translations } from '@/constants/translations'
import { useStarSnippet } from '@/hooks/useSnippetActions'

import { SnippetAudioPlayer } from './SnippetAudioPlayer'

interface RelatedSnippetProps {
  snippet: IRelatedSnippet
  parentSnippetId: string
  language: 'english' | 'spanish'
  isPublic: boolean
}

export function RelatedSnippet({ snippet, parentSnippetId, language, isPublic }: RelatedSnippetProps) {
  const navigate = useNavigate()
  const t = translations[language]

  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const publicUrl = `${window.location.origin}/p`
  const [isStarHovered, setIsStarHovered] = useState(false)

  const { mutate: toggleStar } = useStarSnippet(parentSnippetId, language)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${publicUrl}/${snippet?.id}`)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = `${publicUrl}/${snippet?.id}`
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

  const handleSnippetClick = (event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      window.open(`/snippet/${snippet?.id}`, '_blank')
    } else {
      navigate(`/snippet/${snippet?.id}`)
    }
  }

  const getStarIcon = () => {
    const starClasses = 'h-6 w-6 min-w-[24px]'
    if (snippet.starred_by_user) return <Star className={starClasses} fill='gold' stroke='gold' />
    if (isStarHovered) return <Star className={starClasses} fill='lightgray' />
    return <Star className={starClasses} />
  }

  return (
    <Card
      className='flex cursor-pointer flex-col gap-3 border-2 border-transparent px-6 py-4 transition-all duration-700 ease-in-out hover:border-blue-600'
      onClick={handleSnippetClick}>
      <CardHeader className='flex flex-row items-center gap-2 p-0'>
        <div className='flex-grow'>
          <h3 className='text-base font-semibold'>
            {snippet?.radio_station_code} - {snippet?.radio_station_name} - {snippet?.location_state}
          </h3>
        </div>
        <div className='flex items-center gap-2 space-y-0' onClick={e => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='ghost' className='size-icon'>
                      <Share2 className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent hideWhenDetached align='end' className='z-40 w-[300px]'>
                    <div className='flex-col items-start'>
                      <div className='mb-2 text-sm font-medium'>Share snippet</div>
                      <div className='flex w-full items-center gap-2'>
                        <code className='flex-1 truncate rounded bg-muted px-2 py-1'>
                          {publicUrl}/{snippet?.id}
                        </code>
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
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltips.share}</p>
            </TooltipContent>
          </Tooltip>
          {!isPublic && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => toggleStar(snippet?.id)}
                  onMouseEnter={() => setIsStarHovered(true)}
                  onMouseLeave={() => setIsStarHovered(false)}>
                  {getStarIcon()}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{snippet?.starred_by_user ? t.tooltips.removeFavorite : t.tooltips.addFavorite}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-0 text-sm'>{snippet?.summary}</CardContent>
      <SnippetAudioPlayer path={snippet?.file_path} initialStartTime={snippet?.start_time || '0'} />
      <CardFooter className='flex flex-col items-start gap-3 p-0'>
        <Label className='text-xs text-muted-foreground'>
          {format(new Date(snippet?.recorded_at), 'MMM d, yyyy HH:mm zzz')}
        </Label>
        <div className='flex w-full flex-wrap items-center gap-2'>
          {snippet?.labels.map((label, index) =>
            label && label.text ? (
              <Badge
                key={index}
                variant='secondary'
                className='flex h-8 items-center space-x-1 rounded-full border-none bg-blue-light px-3 text-blue-accent hover:bg-blue-light'>
                {label?.text}
              </Badge>
            ) : null
          )}
          <div className='ml-auto'>
            <Button variant='ghost' size='sm' className='gap-1 px-2 text-xs' disabled>
              <MessageSquare className='h-4 w-4' />
              {snippet?.comment_count} {snippet?.comment_count == 1 ? t.comment : t.comments}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
