import React, { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Download, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AudioPlayer from './AudioPlayer'
import Spinner from './Spinner'
import { downloadAudio, downloadText, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'
import PublicHeaderBar from './PublicHeaderBar'
import ShareButton from './ShareButton'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { toast } from '@/hooks/use-toast'
import LanguageTabs from '@/components/LanguageTab'
import { useAuth } from '@/providers/auth'

interface PublicSnippet {
  id: string
  recorded_at: string
  file_path: string
  start_time: string
  end_time: string
  duration: string
  file_size: number
  context: {
    before: string
    main: string
    after: string
    before_en: string
    main_en: string
    after_en: string
  }
  language: string
  audio_file: {
    radio_station_code: string
    radio_station_name: string
    location_state: string
    location_city: string | null
  }
}

const fetchPublicSnippet = async (snippetId: string): Promise<PublicSnippet> => {
  const { data, error } = await supabase.rpc('get_public_snippet', {
    snippet_id: snippetId
  })

  if (error) throw error
  return data
}

const PublicSnippet: FC = () => {
  const { user } = useAuth()
  const { snippetId } = useParams<{ snippetId: string }>()
  const { language } = useLanguage()
  const t = translations[language]
  const [snippetLanguage, setSnippetLanguage] = useState('Spanish')

  const { data: snippet, isLoading } = useQuery({
    queryKey: ['publicSnippet', snippetId],
    queryFn: () => fetchPublicSnippet(snippetId || ''),
    enabled: !!snippetId
  })

  useEffect(() => {
    if (snippet?.language) {
      const sourceLanguage = snippet.language
      setSnippetLanguage(sourceLanguage)
    }
  }, [snippet?.language])

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
          <h2 className='mb-2 text-2xl font-bold text-gray-700'>Snippet Not Found</h2>
          <p className='text-gray-500'>The requested snippet could not be found.</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={`/snippet/${snippetId}`} />
  }


  const sourceLanguage = snippet.language
  const formattedDate = formatDate(snippet.recorded_at)
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
                    downloadText(content, `transcript_${snippetId}_${snippetLanguage}.txt`)
                  }}
                >
                  {t.originalTranscript} ({snippetLanguage})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const content = `${snippet.context.before_en}\n\n${snippet.context.main_en}\n\n${snippet.context.after_en}`
                    downloadText(content, `transcript_${snippetId}_en.txt`)
                  }}
                >
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
                  }}
                >
                  {t.audio}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ShareButton snippetId={snippetId || ''} showLabel />
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h2 className='text-2xl font-bold'>
                {snippet.audio_file.radio_station_code} - {snippet.audio_file.radio_station_name} -{' '}
                {snippet.audio_file.location_state}
              </h2>
              <div className='flex items-center gap-2 text-sm text-muted-foreground text-zinc-400'>
                <span>{formattedDate}</span>
                <span>•</span>
                <span>{snippet.language}</span>
              </div>
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
      </Card>
    </>
  )
}

export default PublicSnippet
