'use client'

import React, { useState, useEffect } from 'react'
import { Share2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Star from '../assets/star.svg'
import Starred from '../assets/starred.svg'
import StarHover from '../assets/star_hover.svg'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LabelButton from './LabelButton'
import LiveblocksComments from './LiveblocksComments'
import type { Snippet, Label } from '../hooks/useSnippets'
import { formatDate } from '../lib/utils'
import AddLabelButton from './AddLabelButton'
import { useLanguage } from '../providers/language'
import { getLocalStorageItem, setLocalStorageItem } from '../lib/storage'
import supabase from '@/lib/supabase'
import ShareButton from './ShareButton'
import { useToast } from '../hooks/use-toast'

interface SnippetCardProps {
  snippet: Snippet
  onSnippetClick: (id: string) => void
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const [isStarHovered, setIsStarHovered] = useState(false)
  const [labels, setLabels] = useState(snippet.labels || [])
  const [isExpanded, setIsExpanded] = useState(false)
  const formattedDate = formatDate(snippet.recorded_at)

  const [isStarred, setIsStarred] = useState(() => {
    const localStarred = getLocalStorageItem(`starred_${snippet.id}`)
    return localStarred !== null ? localStarred : snippet.starred_by_user
  })

  useEffect(() => {
    setLocalStorageItem(`starred_${snippet.id}`, isStarred)
  }, [isStarred, snippet.id])

  useEffect(() => {
    setLabels(snippet.labels || [])
  }, [snippet.labels])

  const getStarIcon = () => {
    if (isStarred) return Starred
    if (isStarHovered) return StarHover
    return Star
  }

  const { toast } = useToast()

  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStarred = !isStarred
    setIsStarred(newStarred)

    try {
      const { data, error } = await supabase.rpc('toggle_star_snippet', {
        snippet_id: snippet.id
      })

      if (error) throw error

      const serverStarred = data.data.snippet_starred
      const message = data.data.message

      if (serverStarred !== newStarred) {
        setIsStarred(serverStarred)
        setLocalStorageItem(`starred_${snippet.id}`, serverStarred)
      }

      toast({
        title: 'Success',
        description: message,
        duration: 2000
      })
    } catch (error) {
      console.error('Error toggling star:', error)
      setIsStarred(!newStarred)
      setLocalStorageItem(`starred_${snippet.id}`, !newStarred)

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update star status. Please try again.',
        duration: 3000
      })
    }
  }

  const handleLabelAdded = (newLabels: Label[]) => {
    setLabels(newLabels)
  }

  const handleLabelDeleted = (labelId: string) => {
    setLabels(prevLabels => prevLabels.filter(l => l.id !== labelId))
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className='mt-2 cursor-pointer rounded-lg border bg-white p-6' onClick={() => onSnippetClick(snippet.id)}>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='text-lg font-medium'>
          {snippet.audio_file.radio_station_code} - {snippet.audio_file.radio_station_name} -{' '}
          {snippet.audio_file.location_state}
        </h3>
        <div className='flex space-x-2'>
          <ShareButton snippetId={snippet.id} />
          <Button
            variant='ghost'
            size='icon'
            className='hover:bg-transparent'
            onMouseEnter={() => setIsStarHovered(true)}
            onMouseLeave={() => setIsStarHovered(false)}
            onClick={handleStarClick}>
            <img src={getStarIcon()} alt='Star' className='h-5 w-5' />
          </Button>
        </div>
      </div>
      <p className='mb-4 text-xs text-zinc-400'>{formattedDate}</p>
      <p className='mb-4'>{snippet.summary}</p>
      <div className='flex justify-between'>
        <div className='flex flex-wrap items-baseline gap-2'>
          {labels.map((label, index) => (
            <LabelButton
              key={`${snippet.id}-${label.id}-${index}`}
              label={label}
              snippetId={snippet.id}
              onLabelDeleted={handleLabelDeleted}
            />
          ))}
          <AddLabelButton snippetId={snippet.id} onLabelAdded={handleLabelAdded} />
        </div>
      </div>

      <LiveblocksComments snippetId={snippet.id} showFullComments={true} />
    </div>
  )
}

export default SnippetCard
