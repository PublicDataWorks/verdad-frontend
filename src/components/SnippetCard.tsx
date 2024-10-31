'use client'

import React, { useState } from 'react'
import { Share2, MessageCircle } from 'lucide-react'
import Star from '../assets/star.svg'
import Starred from '../assets/starred.svg'
import StarHover from '../assets/star_hover.svg'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LabelButton from './LabelButton'
import LiveblocksComments from './LiveblocksComments'
import type { Snippet, Label } from '../hooks/useSnippets'
import { formatDate } from '../lib/utils'
import AddLabelButton from './AddLabelButton'
import { useLanguage } from '../providers/language'

interface SnippetCardProps {
  snippet: Snippet
  onSnippetClick: (id: string) => void
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const [isStarred, setIsStarred] = useState(snippet.starred_by_user)
  const [isStarHovered, setIsStarHovered] = useState(false)
  const [labels, setLabels] = useState(snippet.labels || [])
  const [isExpanded, setIsExpanded] = useState(false)
  const formattedDate = formatDate(snippet.recorded_at)
  const { language } = useLanguage()

  const getStarIcon = () => {
    if (isStarred) return Starred
    if (isStarHovered) return StarHover
    return Star
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
    <Card className='mt-2 cursor-pointer' onClick={() => onSnippetClick(snippet.id)}>
      <CardHeader>
        <CardTitle className='flex items-start justify-between'>
          <h3 className='text-base font-medium'>
            {snippet.audio_file.radio_station_code} - {snippet.audio_file.radio_station_name} -{' '}
            {snippet.audio_file.location_state}
          </h3>
          <div className='flex space-x-2'>
            <Button variant='ghost' size='icon'>
              <Share2 className='h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='hover:bg-transparent'
              onMouseEnter={() => setIsStarHovered(true)}
              onMouseLeave={() => setIsStarHovered(false)}
              onClick={e => {
                e.stopPropagation()
                setIsStarred(!isStarred)
              }}>
              <img src={getStarIcon()} alt='Star' className='h-5 w-5' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-3'>
          <h4 className='text-lg font-semibold'>{snippet.title}</h4>
          <p className='text-xs text-muted-foreground'>{formattedDate}</p>
          <p className='text-sm'>{snippet.summary}</p>
          <div className='flex items-center justify-between'>
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
            <div className='mt-4 flex items-center justify-end'>
              <Button variant='ghost' size='sm' className='flex items-center space-x-1' onClick={toggleExpand}>
                <MessageCircle className='h-4 w-4' />
                <span>{language === 'spanish' ? 'Comentario' : 'Comment'}</span>
              </Button>
            </div>
          </div>
        </div>

        <LiveblocksComments snippetId={snippet.id} showFullComments={true} />
      </CardContent>
    </Card>
  )
}

export default SnippetCard
