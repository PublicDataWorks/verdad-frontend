import React, { useState } from 'react'
import { Share2 } from 'lucide-react'

import Upvote from '../assets/upvote.svg'
import Upvoted from '../assets/upvoted.svg'
import UpvoteHover from '../assets/upvote_hover.svg'
import Star from '../assets/star.svg'
import Starred from '../assets/starred.svg'
import StarHover from '../assets/star_hover.svg'
import { Button } from './ui/button'
import LabelButton from './LabelButton'
import LiveblocksComments from './LiveblocksComments'
import { Snippet } from '../hooks/useSnippets'
import { formatDate } from '../lib/utils'

interface SnippetCardProps {
  snippet: Snippet
  onSnippetClick: (id: string) => void
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const [upvotedCategories, setUpvotedCategories] = useState<{ [key: string]: boolean }>({})
  const [hoveredCategories, setHoveredCategories] = useState<{ [key: string]: boolean }>({})
  const [isStarred, setIsStarred] = useState(false)
  const [isStarHovered, setIsStarHovered] = useState(false)
  const formattedDate = formatDate(snippet.audio_file.recorded_at)

  const handleUpvoteClick = (category: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setUpvotedCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleHover = (category: string, isHovered: boolean) => {
    setHoveredCategories(prev => ({ ...prev, [category]: isHovered }))
  }

  const getStarIcon = () => {
    if (isStarred) return Starred
    if (isStarHovered) return StarHover
    return Star
  }

  const getUpvoteIconSrc = (category: string) => {
    if (upvotedCategories[category]) return Upvoted
    return hoveredCategories[category] ? UpvoteHover : Upvote
  }

  return (
    <div className='mt-2 cursor-pointer rounded-lg border bg-white p-6' onClick={() => onSnippetClick(snippet.id)}>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='text-lg font-medium'>
          ID {snippet.audio_file.radio_station_code} {snippet.audio_file.radio_station_name} -{' '}
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
            onClick={() => setIsStarred(!isStarred)}
          >
            <img src={getStarIcon()} alt='Star' className='h-5 w-5' />
          </Button>
        </div>
      </div>
      <p className='mb-4 text-xs text-zinc-400'>{formattedDate}</p>
      <p className='mb-4'>{snippet.summary}</p>
      <div className='flex flex-wrap gap-2'>
        {snippet.confidence_scores.categories.map(category => (
          <LabelButton
            key={`${snippet.id}-${category.category}`}
            label={category.category}
            upvotes={0} // You might want to add an upvote count to your category object
            isUpvoted={upvotedCategories[category.category]}
            onUpvote={e => handleUpvoteClick(category.category)(e)}
            onHover={isHovered => handleHover(category.category, isHovered)}
          />
        ))}
        <Button variant='outline' size='icon' className='rounded-full'>
          +
        </Button>
      </div>
      <LiveblocksComments snippetId={snippet.id} showFullComments={false} />
    </div>
  )
}

export default SnippetCard
