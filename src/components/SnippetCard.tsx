import React, { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LabelButton from './LabelButton'
import LiveblocksComments from './LiveblocksComments'
import type { Snippet, Label } from '../hooks/useSnippets'
import { useLikeSnippet } from '../hooks/useSnippets'
import AddLabelButton from './AddLabelButton'
import ShareButton from './ShareButton'
import { getSnippetSubtitle } from '@/utils/getSnippetSubtitle'
import { useLanguage } from '@/providers/language'
interface SnippetCardProps {
  snippet: Snippet
  onSnippetClick: (id: string) => void
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const { language } = useLanguage()
  const [labels, setLabels] = useState(snippet?.labels || [])
  const [currentLikeStatus, setCurrentLikeStatus] = useState<1 | 0 | -1>(snippet.user_like_status)
  const likeSnippetMutation = useLikeSnippet()

  useEffect(() => {
    setCurrentLikeStatus(snippet.user_like_status)
  }, [snippet.user_like_status])

  useEffect(() => {
    setLabels(snippet.labels || [])
  }, [snippet.labels])

  useEffect(() => {
    return () => {
      likeSnippetMutation.mutate.cancel()
    }
  }, [likeSnippetMutation.mutate])

  const handleLikeClick = async (e: React.MouseEvent, newLikeStatus: 1 | -1) => {
    e.stopPropagation()

    try {
      const likeStatus = currentLikeStatus === newLikeStatus ? 0 : newLikeStatus
      setCurrentLikeStatus(likeStatus)

      await likeSnippetMutation.mutateAsync({
        snippetId: snippet.id,
        likeStatus
      })
    } catch (error) {
      setCurrentLikeStatus(snippet.user_like_status)
    }
  }

  const handleLabelAdded = (newLabels: Label[]) => {
    setLabels(newLabels)
  }

  const handleLabelDeleted = (labelId: string) => {
    setLabels(prevLabels => prevLabels.filter(l => l.id !== labelId))
  }

  return (
    <div className='mt-2 rounded-lg border bg-white p-6'>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='cursor-pointer text-lg font-medium' onClick={() => onSnippetClick(snippet.id)}>
          {snippet.title}
        </h3>
        <div className='flex space-x-2'>
          <ShareButton snippetId={snippet.id} />
        </div>
      </div>
      <p className='mb-4 text-xs text-zinc-400'>{getSnippetSubtitle(snippet, language)}</p>
      <p className='mb-4'>{snippet.summary}</p>
      <div className='mb-4 flex items-center'>
        <Button
          variant='ghost'
          size='sm'
          className={`group relative flex min-w-[72px] items-center rounded-full px-3 py-2 hover:bg-transparent
          ${currentLikeStatus === 1 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'hover:bg-zinc-100'}`}
          onClick={e => handleLikeClick(e, 1)}
          disabled={likeSnippetMutation.isPending}>
          <ThumbsUp className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          className={`group relative flex min-w-[72px] items-center rounded-full px-3 py-2 hover:bg-transparent
          ${currentLikeStatus === -1 ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'hover:bg-zinc-100'}`}
          onClick={e => handleLikeClick(e, -1)}
          disabled={likeSnippetMutation.isPending}>
          <ThumbsDown className='h-4 w-4' />
        </Button>
      </div>
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
