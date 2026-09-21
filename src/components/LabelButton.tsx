import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import Upvote from '../assets/upvote.svg'
import Upvoted from '../assets/upvoted.svg'
import { timedRpc } from '@/lib/timedRpc'
import { Label } from '@/types/snippet'
import { useAuth } from '@/providers/auth'
import { getLocalStorageItem, setLocalStorageItem } from '../lib/storage'
import { toast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

interface LabelButtonProps {
  label: Label
  snippetId: string
  onLabelDeleted: (labelId: string) => void
}

const LabelButton: React.FC<LabelButtonProps> = ({ label, snippetId, onLabelDeleted }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [isUpvoted, setIsUpvoted] = useState<boolean>(() => {
    const localUpvoted = getLocalStorageItem<boolean>(`upvoted_${snippetId}_${label.id}`)
    return localUpvoted !== null ? localUpvoted : label.upvoted_by_me
  })

  const [upvoteCount, setUpvoteCount] = useState<number>(() => {
    const localCount = getLocalStorageItem<number>(`upvoteCount_${snippetId}_${label.id}`)
    return localCount !== null ? localCount : label.upvote_count
  })

  useEffect(
    () => () => {
      localStorage.removeItem(`upvoted_${snippetId}_${label.id}`)
      localStorage.removeItem(`upvoteCount_${snippetId}_${label.id}`)
    },
    [snippetId, label.id]
  )

  useEffect(() => {
    if (user) {
      setIsUpvoted(label.upvoted_by_me)
      setUpvoteCount(label.upvote_count)
    }
  }, [user, label.upvoted_by_me, label.upvote_count])

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
      const { data } = await timedRpc<{ labels?: unknown[] } | unknown[] | null>('toggle_upvote_label', {
        snippet_id: snippetId,
        label_text: label.text
      })

      const remainingLabels = Array.isArray(data) ? data : data?.labels
      if (!data || remainingLabels?.length === 0) {
        onLabelDeleted(label.id)
      }

      // Invalidate all snippets lists to refresh data
      void queryClient.invalidateQueries({
        predicate: query => query.queryKey[0] === 'snippets' && query.queryKey[1] === 'list'
      })
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

  const getUpvoteButtonClasses = () => {
    const baseClasses = 'rounded-full border-none flex items-center space-x-1'
    return isUpvoted
      ? `${baseClasses} bg-gradient-to-b from-button-from to-button-to text-white hover:from-button-from hover:to-button-to hover:text-white`
      : `${baseClasses} bg-background-blue-light text-text-blue hover:border-border-blue hover:bg-background-blue-light hover:text-text-blue  hover:border-solid`
  }

  return (
    <div className='rounded-full'>
      <div>
        <Button
          variant='outline'
          size='sm'
          className={`${getUpvoteButtonClasses()} whitespace-nowrap`}
          onClick={handleUpvote}
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
