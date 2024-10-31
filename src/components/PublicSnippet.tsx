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

interface PublicSnippet {
  id: string
  recorded_at: string
  file_path: string
  start_time: string
  context: {
    before: string
    main: string
    after: string
    before_en: string
    main_en: string
    after_en: string
  }
  audio_file: {
    radio_station_code: string
    radio_station_name: string
    location_state: string
  }
}

const fetchPublicSnippet = async (snippetId: string): Promise<PublicSnippet> => {
  const response = await fetch(`/api/public/snippets/${snippetId}`)
  if (!response.ok) throw new Error('Failed to fetch snippet')
  return response.json()
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

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Button variant='ghost' className='flex items-center space-x-2' onClick={() => navigate('/login')}>
          Login
        </Button>
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
          <Button variant='ghost' className='flex items-center space-x-2'>
            <Share2 className='h-4 w-4' />
            <span>Share</span>
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
          <AudioPlayer
            audioSrc={`https://audio.verdad.app/${snippet.file_path}`}
            startTime={snippet.start_time}
          />
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
  )
}

export default PublicSnippet
