import { useState, useEffect, FC } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { isEmpty } from 'lodash'

import { Download, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import AudioPlayer from './AudioPlayer'
import LanguageTabs from '@/components/LanguageTab'
import Spinner from './Spinner'
import PublicHeaderBar from './PublicHeaderBar'
import ShareButton from './ShareButton'

import { useLanguage } from '@/providers/language'
import { useAuth } from '@/providers/auth'

import { downloadAudio, downloadText } from '@/lib/utils'
import { getSnippetSubtitle } from '@/utils/getSnippetSubtitle'
import { toast } from '@/hooks/use-toast'
import { translations } from '@/constants/translations'
import { usePublicSnippet } from '@/hooks/useSnippets'
import RelatedSnippets from './RelatedSnippets'

const PublicSnippet: FC = () => {
  const navigate = useNavigate()
  const { snippetId } = useParams<{ snippetId: string }>()

  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]

  const [snippetLanguage, setSnippetLanguage] = useState<string>('Spanish')
  const { data: snippet, isLoading, isError } = usePublicSnippet(snippetId || '')

  useEffect(() => {
    if (snippet?.language) {
      setSnippetLanguage(snippet.language)
    }
  }, [snippet?.language])

  const goBack = () => {
    navigate('/login')
  }

  const handleDownloadTranscript = (content: string, filename: string) => {
    downloadText(content, filename)
  }

  const handleDownloadAudio = async () => {
    const audioBaseUrl = import.meta.env.VITE_AUDIO_BASE_URL
    try {
      await downloadAudio(
        `${audioBaseUrl}/${snippet?.file_path}`,
        `audio_${snippet?.audio_file.radio_station_code}_${snippet?.audio_file.radio_station_name}_${snippet?.audio_file.location_state}.mp3`
      )
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download audio file. Please try again.',
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

  if (user) {
    return <Navigate to={`/snippet/${snippetId}`} />
  }

  const sourceLanguage = snippet.language
  const audioBaseUrl = import.meta.env.VITE_AUDIO_BASE_URL

  return (
    <>
      <PublicHeaderBar />
      <Card className='mx-auto mt-6 w-full max-w-3xl'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div />
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
                    handleDownloadTranscript(content, `transcript_${snippetId}_${snippetLanguage}.txt`)
                  }}>
                  {t.originalTranscript} ({snippetLanguage})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const content = `${snippet.context.before_en}\n\n${snippet.context.main_en}\n\n${snippet.context.after_en}`
                    handleDownloadTranscript(content, `transcript_${snippetId}_en.txt`)
                  }}>
                  {t.translatedTranscript} (English)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadAudio}>{t.audio}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ShareButton snippetId={snippetId || ''} showLabel />
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h2 className='text-2xl font-bold'>{snippet.title}</h2>
              <p className='text-sm text-muted-foreground text-zinc-400'>{getSnippetSubtitle(snippet, language)}</p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-semibold'>{t.summary}</h3>
              <p className='text-sm'>{snippet.summary}</p>
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
          </div>
        </CardContent>
        <RelatedSnippets snippetId={snippetId} language={'english'} isPublic={true} />
      </Card>
    </>
  )
}

export default PublicSnippet
