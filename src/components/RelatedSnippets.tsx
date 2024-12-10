import { Share2, MessageSquare, Check, Copy } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns-tz'
import type { RelatedSnippet } from '@/types/snippet'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { isEmpty } from 'lodash'
import { translations } from '@/constants/translations'
import { useLanguage } from '@/providers/language'

interface RelatedSnippetsProps {
  snippets: RelatedSnippet[]
}

export default function RelatedSnippets({ snippets }: RelatedSnippetsProps) {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = translations[language]

  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const publicUrl = `${window.location.origin}/p`

  const handleCopy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${publicUrl}/${id}`)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = `${publicUrl}/${id}`
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

  const handleSnippetClick = (id: string) => {
    navigate(`/snippet/${id}`)
  }

  if (isEmpty(snippets)) {
    return null
  }

  return (
    <div className='border-border-gray-medium mt-2 border-t'>
      <h2 className='pt-6 text-2xl font-semibold '>{t.relatedSnippets}</h2>
      <div className='py-6'>
        <div className='flex flex-col gap-3'>
          {snippets.map(snippet => (
            <Card
              key={snippet.id}
              className='flex cursor-pointer flex-col gap-3 px-6 py-4'
              onClick={() => handleSnippetClick(snippet.id)}>
              <CardHeader className='flex flex-row items-center gap-2 p-0'>
                <div className='flex-grow'>
                  <h3 className='text-base font-semibold'>
                    {snippet.radio_station_code} - {snippet.radio_station_name} - {snippet.location_state}
                  </h3>
                </div>
                <div className='flex items-center gap-2 space-y-0' onClick={e => e.stopPropagation()}>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button variant='ghost' className='size-icon'>
                        <Share2 className='h-4 w-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent hideWhenDetached align='end' className='z-40 w-[300px]'>
                      <div className='flex-col items-start'>
                        <div className='mb-2 text-sm font-medium'>Share snippet</div>
                        <div className='flex w-full items-center gap-2'>
                          <code className='flex-1 truncate rounded bg-muted px-2 py-1'>{publicUrl}</code>
                          <Tooltip open={open}>
                            <TooltipTrigger asChild>
                              <Button variant='outline' size='sm' onClick={e => handleCopy(e, snippet.id)}>
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
              </CardHeader>
              <CardContent className='p-0 text-sm'>{snippet.summary}</CardContent>
              <CardFooter className='flex flex-col items-start gap-3 p-0'>
                <Label className='text-xs text-muted-foreground'>
                  {format(snippet.recorded_at, 'MMM d, yyyy HH:mm zzz')}
                </Label>
                <div className='flex w-full flex-wrap items-center gap-2'>
                  {snippet.labels.map((label, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='flex h-8 items-center space-x-1 rounded-full border-none bg-blue-light px-3 text-blue-accent hover:bg-blue-light'>
                      {label.text}
                    </Badge>
                  ))}
                  <div className='ml-auto'>
                    <Button variant='ghost' size='sm' className='gap-1 px-2 text-xs' disabled>
                      <MessageSquare className='h-4 w-4' />
                      {snippet.comment_count} {snippet.comment_count < 2 ? t.comment : t.comments}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
