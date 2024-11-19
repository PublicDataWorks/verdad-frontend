import React, { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { isNil } from 'lodash'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import LabelButton from './LabelButton'
import LiveblocksComments from './LiveblocksComments'
import AddLabelButton from './AddLabelButton'
import ShareButton from './ShareButton'
import SnippetVisibilityToggle from './ui/hide-button'
import { translations } from '@/constants/translations'

import type { Snippet, Label, LikeStatus } from '@/types/snippet'
import { useLikeSnippet } from '@/hooks/useSnippetActions'
import { useLanguage } from '@/providers/language'
import { useIsAdmin } from '@/hooks/usePermission'

import { getSnippetSubtitle } from '@/utils/getSnippetSubtitle'
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage'
import supabaseClient from '@/lib/supabase'

import Star from '../assets/star.svg'
import Starred from '../assets/starred.svg'
import StarHover from '../assets/star_hover.svg'

interface SnippetCardProps {
  snippet: Snippet
  onSnippetClick: (id: string) => void
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onSnippetClick }) => {
  const { language } = useLanguage()
  const t = translations[language]

  const { data: isAdmin } = useIsAdmin()

  const [labels, setLabels] = useState<Label[]>(snippet?.labels || [])
  const [currentLikeStatus, setCurrentLikeStatus] = useState<LikeStatus | null>(() => snippet?.user_like_status ?? null)
  const [counts, setCounts] = useState({
    likeCount: snippet?.like_count || 0,
    dislikeCount: snippet?.dislike_count || 0
  })

  const [isStarred, setIsStarred] = useState<boolean>(() => {
    const localStarred = getLocalStorageItem(`starred_${snippet.id}`)
    return localStarred !== null ? localStarred : snippet?.starred_by_user || false
  })
  const [isStarHovered, setIsStarHovered] = useState<boolean>(false)

  const likeSnippetMutation = useLikeSnippet()

  const isHidden = snippet.hidden

  const getStarIcon = () => {
    if (isStarred) return Starred
    if (isStarHovered) return StarHover
    return Star
  }

  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStarred = !isStarred
    setIsStarred(newStarred)

    try {
      const { data, error } = await supabaseClient.rpc('toggle_star_snippet', {
        snippet_id: snippet.id
      })

      if (error) throw error

      const serverStarred = data.data.snippet_starred

      if (serverStarred !== newStarred) {
        setIsStarred(serverStarred)
        setLocalStorageItem(`starred_${snippet.id}`, serverStarred)
      }
    } catch (error) {
      setIsStarred(!newStarred)
      setLocalStorageItem(`starred_${snippet.id}`, !newStarred)
    }
  }

  const handleLikeClick = async (e: React.MouseEvent, newLikeStatus: 1 | -1) => {
    e.stopPropagation()

    try {
      const likeStatus =
        isNil(currentLikeStatus) || currentLikeStatus === 0
          ? newLikeStatus
          : currentLikeStatus === newLikeStatus
            ? 0
            : newLikeStatus

      setCurrentLikeStatus(likeStatus)

      const response = await likeSnippetMutation.mutateAsync({
        snippetId: snippet.id,
        likeStatus: likeStatus
      })

      setCounts({
        likeCount: response.like_count,
        dislikeCount: response.dislike_count
      })
    } catch (error) {
      setCurrentLikeStatus(snippet.user_like_status ?? null)
      setCounts({
        likeCount: snippet.like_count || 0,
        dislikeCount: snippet.dislike_count || 0
      })
    }
  }

  const handleLabelAdded = (newLabels: Label[]) => {
    setLabels(newLabels)
  }

  const handleLabelDeleted = (labelId: string) => {
    setLabels(prevLabels => prevLabels.filter(l => l.id !== labelId))
  }

  useEffect(() => {
    setLocalStorageItem(`starred_${snippet.id}`, isStarred)
  }, [isStarred, snippet.id])

  useEffect(() => {
    setCurrentLikeStatus(snippet.user_like_status ?? null)
  }, [snippet.user_like_status])

  useEffect(() => {
    setLabels(snippet.labels || [])
  }, [snippet.labels])

  useEffect(() => {
    setCounts({
      likeCount: snippet.like_count || 0,
      dislikeCount: snippet.dislike_count || 0
    })
  }, [snippet.like_count, snippet.dislike_count])

  return (
    <div className={`mt-2 rounded-lg border bg-white p-6 ${isHidden ? 'opacity-50' : ''}`}>
      <div className='mb-2 flex items-start justify-between'>
        <h3 className='cursor-pointer text-lg font-medium' onClick={() => onSnippetClick(snippet.id)}>
          {snippet.title}
        </h3>
        <div className='flex space-x-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ShareButton snippetId={snippet.id} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltips.share}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center space-x-2'
                onMouseEnter={() => setIsStarHovered(true)}
                onMouseLeave={() => setIsStarHovered(false)}
                onClick={handleStarClick}>
                <img src={getStarIcon()} alt='Star' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isStarred ? t.tooltips.removeFavorite : t.tooltips.addFavorite}</p>
            </TooltipContent>
          </Tooltip>

          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SnippetVisibilityToggle isHidden={isHidden} snippetId={snippet.id} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isHidden ? t.tooltips.showSnippet : t.tooltips.hideSnippet}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <p className='mb-4 text-xs text-zinc-400'>{getSnippetSubtitle(snippet, language)}</p>
      <p className='mb-4'>{snippet.summary}</p>
      <div className='mb-4 flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant='outline'
                size='sm'
                onClick={e => handleLikeClick(e, 1)}
                className={`flex items-center gap-4 ${
                  currentLikeStatus === 1 ? 'bg-green-100 hover:bg-green-200' : ''
                }`}>
                <ThumbsUp className='h-4 w-4' />
                <span>{counts.likeCount}</span>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltips.misinfo}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant='outline'
                size='sm'
                onClick={e => handleLikeClick(e, -1)}
                className={`flex items-center gap-4 ${currentLikeStatus === -1 ? 'bg-red-100 hover:bg-red-200' : ''}`}>
                <ThumbsDown className='h-4 w-4' />
                <span>{counts.dislikeCount}</span>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.tooltips.notMisinfo}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <LiveblocksComments snippetId={snippet.id} showFullComments={true} />
    </div>
  )
}

export default SnippetCard
