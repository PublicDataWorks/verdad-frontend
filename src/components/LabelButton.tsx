import React from 'react'
import { Button } from './ui/button'
import Upvote from '../assets/upvote.svg'
import Upvoted from '../assets/upvoted.svg'

interface LabelButtonProps {
  label: string
  upvotes: number
  isUpvoted: boolean
  onUpvote: (e: React.MouseEvent) => void
  onHover: (isHovered: boolean) => void
}

const LabelButton: React.FC<LabelButtonProps> = ({ label, upvotes, isUpvoted, onUpvote, onHover }) => {
  const getGradientWrapperClasses = (isHovered: boolean) => `
    inline-block rounded-full
    ${
      isUpvoted
        ? 'p-0'
        : `p-[1px] ${isHovered ? 'bg-gradient-to-b' : 'bg-gradient-to-t'} from-blue-accent to-blue-light`
    }
  `

  const getUpvoteButtonClasses = (isHovered: boolean) => {
    const baseClasses = 'font-normal rounded-full border-none flex items-center space-x-1'
    return isUpvoted
      ? `${baseClasses} bg-gradient-to-r from-blue-deep to-blue-rich text-white hover:from-blue-deep hover:to-blue-rich hover:text-white`
      : `${baseClasses} bg-blue-light text-blue-accent hover:bg-blue-200`
  }

  return (
    <div className={getGradientWrapperClasses(false)}>
      <Button
        variant='outline'
        size='sm'
        className={getUpvoteButtonClasses(false)}
        onClick={onUpvote}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <span>{label}</span>
        <img src={isUpvoted ? Upvoted : Upvote} alt='Upvote' className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default LabelButton
