import type React from 'react'
import { useState, useEffect, FC } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { isEmpty, isNil } from 'lodash'

import { ArrowLeft, Download, ChevronDown, ThumbsUp, ThumbsDown, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import AudioPlayer from './AudioPlayer'
import LanguageTabs from './LanguageTab'
import LabelButton from './LabelButton'
import AddLabelButton from './AddLabelButton'
import Spinner from './Spinner'
import LiveblocksComments from '../components/LiveblocksComments'
import ShareButton from './ShareButton'
import SnippetVisibilityToggle from './ui/hide-button'

import { useSnippet } from '@/hooks/useSnippets'
import { useLikeSnippet } from '@/hooks/useSnippetActions'
import { useLanguage } from '@/providers/language'
import { useIsAdmin } from '@/hooks/usePermission'
import { useToast } from '@/hooks/use-toast'

import { downloadAudio, downloadText } from '@/lib/utils'
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage'
import supabase from '@/lib/supabase'

import { translations } from '@/constants/translations'
import { getSnippetSubtitle } from '@/utils/getSnippetSubtitle'

import RelatedSnippets from './RelatedSnippets'

import type { Label, LikeStatus } from '@/types/snippet'

const SnippetDetail: FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const { language } = useLanguage()
  const t = translations[language]

  const { data: snippet, isLoading, isError } = useSnippet(snippetId || '', language)
  const { data: isAdmin } = useIsAdmin()

  const [labels, setLabels] = useState<Label[]>([])
  const [isStarHovered, setIsStarHovered] = useState<boolean>(false)
  const [isStarred, setIsStarred] = useState<boolean>(() => {
    const localStarred = getLocalStorageItem(`starred_${snippetId}`)
    return localStarred !== null ? localStarred : snippet?.starred_by_user || false
  })
  const [currentLikeStatus, setCurrentLikeStatus] = useState<LikeStatus | null>(() => snippet?.user_like_status ?? null)
  const [counts, setCounts] = useState<{ likeCount: number; dislikeCount: number }>({
    likeCount: snippet?.like_count || 0,
    dislikeCount: snippet?.dislike_count || 0
  })
  const [snippetLanguage, setSnippetLanguage] = useState<string | undefined>(
    snippet?.language?.primary_language?.toLowerCase()
  )

  const likeSnippetMutation = useLikeSnippet()
  const { toast } = useToast()

  const isHidden = snippet?.hidden
  const audioBaseUrl = import.meta.env.VITE_AUDIO_BASE_URL

  const getStarIcon = () => {
    const starClasses = 'h-6 w-6 min-w-[24px]'
    if (isStarred) return <Star className={starClasses} fill='gold' stroke='gold' data-testid='star-filled' />
    if (isStarHovered) return <Star className={starClasses} fill='lightgray' />
    return <Star className={starClasses} />
  }

  const calculateOptimisticCounts = (
    currentStatus: LikeStatus | null,
    newStatus: LikeStatus,
    currentCounts: { likeCount: number; dislikeCount: number }
  ) => {
    const updatedCounts = { ...currentCounts }

    if (currentStatus === 1) updatedCounts.likeCount--
    if (currentStatus === -1) updatedCounts.dislikeCount--

    if (newStatus === 1) updatedCounts.likeCount++
    if (newStatus === -1) updatedCounts.dislikeCount++

    return updatedCounts
  }

  const handleLikeClick = async (e: React.MouseEvent, newLikeStatus: 1 | -1) => {
    e.stopPropagation()

    const previousStatus = currentLikeStatus
    const previousCounts = counts

    try {
      const likeStatus =
        isNil(currentLikeStatus) || currentLikeStatus === 0
          ? newLikeStatus
          : currentLikeStatus === newLikeStatus
            ? 0
            : newLikeStatus

      setCurrentLikeStatus(likeStatus)
      setCounts(calculateOptimisticCounts(previousStatus, likeStatus, counts))

      const response = await likeSnippetMutation.mutateAsync({
        snippetId: snippetId!,
        likeStatus: likeStatus
      })

      setCounts({
        likeCount: response.like_count,
        dislikeCount: response.dislike_count
      })
    } catch (error) {
      setCurrentLikeStatus(previousStatus)
      setCounts(previousCounts)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update rating. Please try again.',
        duration: 3000
      })
    }
  }

  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStarred = !isStarred
    setIsStarred(newStarred)

    try {
      const { data, error } = await supabase.rpc('toggle_star_snippet', {
        snippet_id: snippetId
      })

      if (error) throw error

      const serverStarred = data.data.snippet_starred
      const message = data.data.message

      if (serverStarred !== newStarred) {
        setIsStarred(serverStarred)
        setLocalStorageItem(`starred_${snippetId}`, serverStarred)
      }

      toast({
        title: 'Success',
        description: message,
        duration: 2000
      })
    } catch (error) {
      console.error('Error toggling star:', error)
      setIsStarred(!newStarred)
      setLocalStorageItem(`starred_${snippetId}`, !newStarred)

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update star status. Please try again.',
        duration: 3000
      })
    }
  }

  const handleLabelAdded = (newLabels: Label[] | ((prevLabels: Label[]) => Label[])) => {
    if (typeof newLabels === 'function') {
      setLabels(newLabels)
    } else {
      setLabels(newLabels)
    }
  }

  useEffect(() => {
    if (snippet) {
      setLabels(snippet.labels || [])
      setSnippetLanguage(snippet.language?.primary_language?.toLowerCase())
      setCurrentLikeStatus(snippet.user_like_status ?? null)
      setCounts({
        likeCount: snippet.like_count || 0,
        dislikeCount: snippet.dislike_count || 0
      })
    }
  }, [snippet])

  useEffect(() => {
    if (snippet) {
      setIsStarred(snippet.starred_by_user)
    }
  }, [snippet])

  useEffect(() => {
    setLocalStorageItem(`starred_${snippetId}`, isStarred)
  }, [isStarred, snippetId])

  const goBack = () => {
    if (location.key && location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/search')
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (isError || isEmpty(snippet) || !snippetId) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold text-gray-700'>{t.snippetNotFound}</h2>
          <p className='text-gray-500'>{t.snippetNotFoundDesc}</p>
          <Button variant='ghost' className='mt-4' onClick={goBack}>
            {t.goBack}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`mx-auto h-full w-full max-w-3xl bg-background-gray-light p-2 sm:py-6`}>
      <Card className={`mb-8 w-full ${isHidden ? 'opacity-50' : ''}`}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' className='flex items-center space-x-2 px-2' onClick={goBack}>
                <ArrowLeft className='h-4 w-4' />
                <span className='hidden sm:inline'>{t.back}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.tooltips.back}</p>
            </TooltipContent>
          </Tooltip>
          <div className='flex items-center space-x-2' onClick={e => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='flex items-center space-x-2'>
                      <Download className='h-4 w-4' />
                      <span>{t.download}</span>
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className='capitalize'
                      onClick={() => {
                        const content = `${snippet.context.before}\n\n${snippet.context.main}\n\n${snippet.context.after}`
                        downloadText(content, `transcript_${snippetId}_${snippetLanguage}.txt`)
                      }}>
                      {t.originalTranscript} ({snippetLanguage})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const content = `${snippet.context.before_en}\n\n${snippet.context.main_en}\n\n${snippet.context.after_en}`
                        downloadText(content, `transcript_${snippetId}_en.txt`)
                      }}>
                      {t.translatedTranscript} (English)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await downloadAudio(
                            `${audioBaseUrl}/${snippet.file_path}`,
                            `audio_${snippet.audio_file.radio_station_code}_${snippet.audio_file.radio_station_name}_${snippet.audio_file.location_state}.mp3`
                          )
                        } catch (error) {
                          toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Failed to download audio file. Please try again.',
                            duration: 3000
                          })
                        }
                      }}>
                      {t.audio}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t.tooltips.download}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ShareButton snippetId={snippetId} showLabel={false} />
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
                  className='flex items-center justify-center p-2'
                  onMouseEnter={() => setIsStarHovered(true)}
                  onMouseLeave={() => setIsStarHovered(false)}
                  data-testid='star'
                  onClick={handleStarClick}>
                  {getStarIcon()}
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
                    <SnippetVisibilityToggle isHidden={isHidden ? true : false} snippetId={snippet.id} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isHidden ? t.tooltips.showSnippet : t.tooltips.hideSnippet}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h2 className='text-2xl font-bold'>{snippet.title}</h2>
              <p className='text-sm text-muted-foreground text-zinc-400'>{getSnippetSubtitle(snippet, language)}</p>
            </div>

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
                      <ThumbsUp className='h-4 w-4' data-testid='thumbs-up' />
                      <span>{counts?.likeCount}</span>
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
                      <ThumbsDown className='h-4 w-4' data-testid='thumbs-down' />
                      <span>{counts?.dislikeCount}</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t.tooltips.notMisinfo}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className='space-y-2'>
              <h3 className='font-semibold'>{t.summary}</h3>
              <p className='text-sm'>{snippet.summary}</p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>{snippet?.explanation}</p>
            </div>

            <AudioPlayer audioSrc={`${audioBaseUrl}/${snippet?.file_path}`} startTime={snippet?.start_time} />
            <LanguageTabs
              language={snippetLanguage || 'english'}
              setLanguage={setSnippetLanguage}
              sourceText={{
                before: snippet?.context?.before,
                main: snippet?.context?.main,
                after: snippet?.context?.after
              }}
              englishText={{
                before_en: snippet?.context?.before_en,
                main_en: snippet?.context?.main_en,
                after_en: snippet?.context?.after_en
              }}
              sourceLanguage={snippet?.language?.primary_language?.toLowerCase() || 'english'}
            />

            <div className='flex flex-wrap items-center gap-2'>
              {labels.map((label, index) => (
                <LabelButton
                  key={`${snippetId}-${label.id}-${index}`}
                  label={label}
                  snippetId={snippetId}
                  onLabelDeleted={labelId => setLabels(prevLabels => prevLabels.filter(l => l.id !== labelId))}
                />
              ))}
              <AddLabelButton snippetId={snippetId} onLabelAdded={handleLabelAdded} />
            </div>
          </div>
        </CardContent>
        <LiveblocksComments snippetId={snippetId} showFullComments />
      </Card>
      <RelatedSnippets snippetId={snippetId} language={language} />
    </div>
  )
}

export default SnippetDetail
