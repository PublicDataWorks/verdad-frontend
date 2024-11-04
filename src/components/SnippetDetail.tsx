'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { useSnippet } from '../hooks/useSnippets'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AudioPlayer from './AudioPlayer'
import LanguageTabs from './LanguageTab'
import LabelButton from './LabelButton'
import Spinner from './Spinner'
import LiveblocksComments from '../components/LiveblocksComments'
import { downloadAudio, downloadText, formatDate } from '@/lib/utils'
import AddLabelButton from './AddLabelButton'
import type { Label } from '../hooks/useSnippets'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { useToast } from '@/hooks/use-toast'
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/storage'
import StarIcon from '../assets/star.svg'
import StarredIcon from '../assets/starred.svg'
import StarHoverIcon from '../assets/star_hover.svg'
import supabase from '@/lib/supabase'
import ShareButton from './ShareButton'

const SnippetDetail: FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const t = translations[language]

  const { data: snippet, isLoading } = useSnippet(snippetId || '', language)
  const sourceLanguage = snippet?.language.primary_language.toLowerCase()
  const [labels, setLabels] = useState<Label[]>([])
  const [isStarHovered, setIsStarHovered] = useState(false)
  const { toast } = useToast()
  const [isStarred, setIsStarred] = useState(() => {
    const localStarred = getLocalStorageItem(`starred_${snippetId}`)
    return localStarred !== null ? localStarred : snippet?.starred_by_user || false
  })

  const [snippetLanguage, setSnippetLanguage] = useState(sourceLanguage)

  useEffect(() => {
    if (snippet) {
      setLabels(snippet.labels)
      setSnippetLanguage(sourceLanguage)
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

  if (!snippet || !snippetId) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold text-gray-700'>{t.snippetNotFound}</h2>
          <p className='text-gray-500'>{t.snippetNotFoundDesc}</p>
          <Button variant='ghost' className='mt-4' onClick={() => navigate('/search')}>
            {t.goBack}
          </Button>
        </div>
      </div>
    )
  }

  const formattedDate = formatDate(snippet.recorded_at)

  const audioBaseUrl = import.meta.env.VITE_AUDIO_BASE_URL

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Button variant='ghost' className='flex items-center space-x-2 px-2' onClick={() => navigate('/search')}>
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
            <h2 className='text-2xl font-bold'>
              {snippet.audio_file.radio_station_code} - {snippet.audio_file.radio_station_name} -{' '}
              {snippet.audio_file.location_state}
            </h2>
            <p className='text-sm text-muted-foreground text-zinc-400'>{formattedDate}</p>
          </div>
          <CardTitle className='text-2xl'>{snippet.title}</CardTitle>
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
  )
}

export default SnippetDetail
