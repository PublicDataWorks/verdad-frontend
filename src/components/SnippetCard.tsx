import type React from 'react'
import { useState } from 'react'
import { Share2 } from 'lucide-react'

import Upvote from 'assets/upvote.svg'
import Upvoted from 'assets/upvoted.svg'
import UpvoteHover from 'assets/upvote_hover.svg'
import Star from 'assets/star.svg'
import Starred from 'assets/starred.svg'
import StarHover from 'assets/star_hover.svg'
import { Button } from 'components/ui/button'
import LiveblocksComments from 'components/LiveblocksComments'

interface Snippet {
  id: number;
  radio_code: string;
  name: string;
  type: string;
  channel: string;
  state: string;
  human_upvotes: number;
}

interface SnippetCardProps {
  snippet: Snippet;
  onSnippetClick: (id: number) => void;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isStarred, setIsStarred] = useState(false)
  const [isStarHovered, setIsStarHovered] = useState(false)

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUpvoted(!isUpvoted)
  }

  const getUpvoteButtonClasses = () => {
    const baseClasses = 'font-normal rounded-full border-none'
    return isUpvoted
      ? `${baseClasses} bg-gradient-to-r from-blue-deep to-blue-rich text-white hover:from-blue-deep hover:to-blue-rich hover:text-white`
      : `${baseClasses} bg-blue-light text-blue-accent hover:bg-blue-light hover:text-blue-accent`
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsStarred(!isStarred)
  }

  const getStarIcon = () => {
    if (isStarred) return Starred
    if (isStarHovered) return StarHover
    return Star
  }

  const getGradientWrapperClasses = () => `
      inline-block rounded-full
      ${isUpvoted
      ? 'p-0'
      : `p-[1px] ${isHovered ? 'bg-gradient-to-b' : 'bg-gradient-to-t'} from-blue-accent to-blue-light`
    }
    `

  const getUpvoteIconSrc = () => {
    if (isUpvoted) return Upvoted
    return isHovered ? UpvoteHover : Upvote
  }

  return (
    <div
      className="p-6 border rounded-lg cursor-pointer bg-white mt-2"
      onClick={() => onSnippetClick(snippet.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">ID {snippet.radio_code} - {snippet.name}</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onMouseEnter={() => setIsStarHovered(true)}
            onMouseLeave={() => setIsStarHovered(false)}
            onClick={handleStarClick}
          >
            <img
              src={getStarIcon()}
              alt="Star"
              className="h-5 w-5"
            />
          </Button>
        </div>
      </div>
      <p className="mb-4">{snippet.type} - {snippet.channel}</p>
      <div className={getGradientWrapperClasses()}>
        <Button
          variant="outline"
          size="sm"
          className={getUpvoteButtonClasses()}
          onClick={handleUpvoteClick}
          onMouseEnter={() => !isUpvoted && setIsHovered(true)}
          onMouseLeave={() => !isUpvoted && setIsHovered(false)}
        >
          {snippet.state}
          <img
            src={getUpvoteIconSrc()}
            alt="Upvote"
            className="h-4 w-4 ml-2 mr-1"
          />
          {snippet.human_upvotes}
        </Button>
      </div>
      <LiveblocksComments
        snippetId={snippet.id.toString()}
        showFullComments={false}
      />
    </div>
  )
}

export default SnippetCard
