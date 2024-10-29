import React, { useState } from 'react'
import { Share2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Star from '../assets/star.svg'
import Starred from '../assets/starred.svg'
import StarHover from '../assets/star_hover.svg'
import { Button } from './ui/button'
import LabelButton from './LabelButton'
import LiveblocksComments from './LiveblocksComments'
import type { Snippet, Label } from '../hooks/useSnippets'
import { formatDate } from '../lib/utils'
import AddLabelButton from './AddLabelButton'

interface SnippetCardProps {
  snippet: Snippet
  onSnippetClick: (id: string) => void
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const [isStarred, setIsStarred] = useState(false)
  const [isStarHovered, setIsStarHovered] = useState(false)
  const [labels, setLabels] = useState(snippet.labels || [])
  const [isExpanded, setIsExpanded] = useState(false)
  const formattedDate = formatDate(snippet.recorded_at)

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
    <div className='mt-2 cursor-pointer rounded-lg border bg-white p-6' onClick={() => onSnippetClick(snippet.id)}>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='text-lg font-medium'>
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
        <div className='mt-4 flex items-center justify-end'>
          <Button variant='ghost' size='sm' className='flex items-center space-x-1' onClick={toggleExpand}>
            <MessageCircle className='h-4 w-4' />
            <span>Comment</span>
            {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      {isExpanded && <LiveblocksComments snippetId={snippet.id} showFullComments={true} />}
    </div>
  )
}

export default SnippetCard
