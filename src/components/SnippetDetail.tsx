import type React from 'react'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { useSnippet, useLikeSnippet } from '../hooks/useSnippets'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AudioPlayer from './AudioPlayer'
import LanguageTabs from './LanguageTab'
import LabelButton from './LabelButton'
import Spinner from './Spinner'
import LiveblocksComments from '../components/LiveblocksComments'
import { downloadAudio, downloadText } from '@/lib/utils'
import AddLabelButton from './AddLabelButton'
import type { Label, LikeStatus } from '../hooks/useSnippets'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { useToast } from '@/hooks/use-toast'
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage'
import StarIcon from '../assets/star.svg'
import StarredIcon from '../assets/starred.svg'
import StarHoverIcon from '../assets/star_hover.svg'
import supabase from '@/lib/supabase'
import ShareButton from './ShareButton'
import { getSnippetSubtitle } from '@/utils/getSnippetSubtitle'
import { isEmpty, isNil } from 'lodash'

const SnippetDetail: FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const t = translations[language]

  const { data: snippet, isLoading, isError } = useSnippet(snippetId || '', language)
  const sourceLanguage = snippet?.language?.primary_language?.toLowerCase()
  const [labels, setLabels] = useState<Label[]>([])
  const [isStarHovered, setIsStarHovered] = useState(false)
  const { toast } = useToast()
  const [isStarred, setIsStarred] = useState(() => {
    const localStarred = getLocalStorageItem(`starred_${snippetId}`)
    return localStarred !== null ? localStarred : snippet?.starred_by_user || false
  })
  const [currentLikeStatus, setCurrentLikeStatus] = useState<LikeStatus | null>(() => snippet?.user_like_status ?? null)
  const likeSnippetMutation = useLikeSnippet()

  const [snippetLanguage, setSnippetLanguage] = useState(sourceLanguage)

  useEffect(() => {
    if (snippet) {
      setLabels(snippet.labels)
      setSnippetLanguage(sourceLanguage)
      setCurrentLikeStatus(snippet.user_like_status ?? null)
    }
  }, [snippet, sourceLanguage])

  useEffect(() => {
    if (snippet) {
      setIsStarred(snippet.starred_by_user)
    }
  }, [snippet])

  useEffect(() => {
    setLocalStorageItem(`starred_${snippetId}`, isStarred)
  }, [isStarred, snippetId])

  useEffect(() => {
    return () => {
      likeSnippetMutation.mutate.cancel()
    }
  }, [likeSnippetMutation.mutate])

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

      await likeSnippetMutation.mutateAsync({
        snippetId: snippetId!,
        likeStatus: likeStatus
      })
    } catch (error) {
      setCurrentLikeStatus(snippet?.user_like_status ?? null)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update rating. Please try again.',
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

  const getStarIcon = () => {
    if (isStarred) return StarredIcon
    if (isStarHovered) return StarHoverIcon
    return StarIcon
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

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  const goback = () => {
    if (location.key && location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/search')
    }
  }

  if (isError || isEmpty(snippet) || !snippetId) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold text-gray-700'>{t.snippetNotFound}</h2>
          <p className='text-gray-500'>{t.snippetNotFoundDesc}</p>
          <Button variant='ghost' className='mt-4' onClick={goback}>
            {t.goBack}
          </Button>
        </div>
      </div>
    )
  }

  const audioBaseUrl = import.meta.env.VITE_AUDIO_BASE_URL

  return (
    <div className='mx-auto h-full w-full max-w-3xl p-2 sm:py-6'>
      <Card className='w-full'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <Button variant='ghost' className='flex items-center space-x-2 px-2' onClick={goback}>
            <ArrowLeft className='h-4 w-4' />
            <span>{t.back}</span>
          </Button>
          <div className='flex items-center space-x-2'>
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
            <ShareButton snippetId={snippetId} showLabel />
            <Button
              variant='ghost'
              className='flex items-center space-x-2'
              onMouseEnter={() => setIsStarHovered(true)}
              onMouseLeave={() => setIsStarHovered(false)}
              onClick={handleStarClick}>
              <img src={getStarIcon()} alt='Star' className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h2 className='text-2xl font-bold'>{snippet.title}</h2>
              <p className='text-sm text-muted-foreground text-zinc-400'>{getSnippetSubtitle(snippet, language)}</p>
            </div>
            <div className='mb-4 flex items-center'>
              <Button
                variant='ghost'
                size='sm'
                className={`group relative flex min-w-[72px] items-center rounded-full px-3 py-2 hover:bg-transparent
  ${currentLikeStatus === 1 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'hover:bg-zinc-100'}`}
                onClick={e => handleLikeClick(e, 1)}>
                <ThumbsUp className='h-4 w-4' />
              </Button>

              <Button
                variant='ghost'
                size='sm'
                className={`group relative flex min-w-[72px] items-center rounded-full px-3 py-2 hover:bg-transparent
  ${currentLikeStatus === -1 ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'hover:bg-zinc-100'}`}
                onClick={e => handleLikeClick(e, -1)}>
                <ThumbsDown className='h-4 w-4' />
              </Button>
            </div>
            <div className='space-y-2'>
              <h3 className='font-semibold'>{t.summary}</h3>
              <p className='text-sm'>{snippet.summary}</p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>{snippet.explanation}</p>
            </div>
            <AudioPlayer audioSrc={`${audioBaseUrl}/${snippet.file_path}`} startTime={snippet.start_time} />
            <LanguageTabs
              language={snippetLanguage}
              setLanguage={setSnippetLanguage}
              sourceText={{
                before: snippet.context.before,
                main: snippet.context.main,
                after: snippet.context.after
              }}
              englishText={{
                before_en: snippet.context.before_en,
                main_en: snippet.context.main_en,
                after_en: snippet.context.after_en
              }}
              sourceLanguage={sourceLanguage}
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
    </div>
  )
}

export default SnippetDetail
