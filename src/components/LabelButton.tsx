import React, { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import Upvote from '../assets/upvote.svg'
import Upvoted from '../assets/upvoted.svg'
import supabase from '@/lib/supabase'
import { Label } from '../hooks/useSnippets'
import { useAuth } from '@/providers/auth'
import { getLocalStorageItem, setLocalStorageItem } from '../lib/storage'
import { toast } from '@/components/ui/use-toast'

interface LabelButtonProps {
  label: Label
  snippetId: string
  onLabelDeleted: (labelId: string) => void
}

const LabelButton: React.FC<LabelButtonProps> = ({ label, snippetId, onLabelDeleted }) => {
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuth()

  const [isUpvoted, setIsUpvoted] = useState(() => {
    const localUpvoted = getLocalStorageItem(`upvoted_${snippetId}_${label.id}`)
    return localUpvoted !== null ? localUpvoted : label.upvoted_by.some(upvoter => upvoter.email === user?.email)
  })

  const [upvoteCount, setUpvoteCount] = useState(() => {
    const localCount = getLocalStorageItem(`upvoteCount_${snippetId}_${label.id}`)
    return localCount !== null ? localCount : label.upvoted_by.length
  })

  useEffect(() => {
    return () => {
      localStorage.removeItem(`upvoted_${snippetId}_${label.id}`)
      localStorage.removeItem(`upvoteCount_${snippetId}_${label.id}`)
    }
  }, [snippetId, label.id])

  useEffect(() => {
    if (user) {
      const isCurrentlyUpvoted = label.upvoted_by.some(upvoter => upvoter.email === user.email)
      setIsUpvoted(isCurrentlyUpvoted)
      setUpvoteCount(label.upvoted_by.length)
    }
  }, [user, label.upvoted_by])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updates = {
        [`upvoted_${snippetId}_${label.id}`]: isUpvoted,
        [`upvoteCount_${snippetId}_${label.id}`]: upvoteCount
      }
      Object.entries(updates).forEach(([key, value]) => setLocalStorageItem(key, value))
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [isUpvoted, upvoteCount, snippetId, label.id])

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return // Prevent upvoting if not logged in

    const newIsUpvoted = !isUpvoted

    setIsUpvoted(newIsUpvoted)
    setUpvoteCount(prevCount => (newIsUpvoted ? prevCount + 1 : prevCount - 1))

    try {
      const { data, error } = await supabase.rpc('toggle_upvote_label', {
        snippet_id: snippetId,
        label_text: label.text
      })

      if (error) throw error

      if (!data || (Array.isArray(data) && data.length === 0) || (data.labels && data.labels.length === 0)) {
        onLabelDeleted(label.id)
      }
    } catch (error) {
      console.error('Error toggling upvote:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update upvote. Please try again.'
      })
      // Revert optimistic updates
      setIsUpvoted(!newIsUpvoted)
      setUpvoteCount(prevCount => (newIsUpvoted ? prevCount - 1 : prevCount + 1))
    }
  }

  const getGradientWrapperClasses = () =>
    isUpvoted ? 'p-0' : `p-[1px] ${isHovered ? 'bg-gradient-to-b' : 'bg-gradient-to-t'} from-blue-accent`

  const getUpvoteButtonClasses = () => {
    const baseClasses = 'rounded-full border-none flex items-center space-x-1'
    return isUpvoted
      ? `${baseClasses} bg-gradient-to-r from-blue-deep to-blue-rich text-white hover:from-blue-deep hover:to-blue-rich hover:text-white`
      : `${baseClasses} bg-blue-light text-blue-accent hover:bg-blue-200`
  }

  return (
    <div className={`rounded-full ${getGradientWrapperClasses()}`}>
      <div>
        <Button
          variant='outline'
          size='sm'
          className={`${getUpvoteButtonClasses()} whitespace-nowrap`}
          onClick={handleUpvote}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>{label?.text}</span>
          <img src={isUpvoted ? Upvoted : Upvote} alt='Upvote' className='h-4 w-4' />
          <span>{upvoteCount}</span>
        </Button>
      </div>
    </div>
  )
}

export default LabelButton
