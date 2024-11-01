import React, { useState } from 'react'
import type { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Download, Share2, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AudioPlayer from './AudioPlayer'
import LanguageTabs from './LanguageTab'
import Spinner from './Spinner'
import { formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import supabase from '@/lib/supabase'
import PublicHeaderBar from './PublicHeaderBar'
import ShareButton from './ShareButton'

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
  const { snippetId } = useParams<{ snippetId: string }>()
  const navigate = useNavigate()
  const [language, setLanguage] = useState('spanish')

  const { data: snippet, isLoading } = useQuery({
    queryKey: ['publicSnippet', snippetId],
    queryFn: () => fetchPublicSnippet(snippetId || ''),
    enabled: !!snippetId
  })

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

  const formattedDate = formatDate(snippet.recorded_at)
  const audioBaseUrl = import.meta.env.VITE_AUDIO_BASE_URL

  return (
    <>
      <PublicHeaderBar />
      <Card className='mx-auto w-full max-w-3xl'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div />
          <div className='flex items-center space-x-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='flex items-center space-x-2'>
                  <Download className='h-4 w-4' />
                  <span>Download</span>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Original transcript (Spanish)</DropdownMenuItem>
                <DropdownMenuItem>Translated transcript (English)</DropdownMenuItem>
                <DropdownMenuItem>Audio</DropdownMenuItem>
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
              language={language}
              setLanguage={setLanguage}
              spanishText={{
                before: snippet.context.before,
                main: snippet.context.main,
                after: snippet.context.after
              }}
              englishText={{
                before_en: snippet.context.before_en,
                main_en: snippet.context.main_en,
                after_en: snippet.context.after_en
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default PublicSnippet
