'use client'

import React, { useState } from 'react'
import type { FC } from 'react'
import { useSnippets } from '../hooks/useSnippets'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Share2, Star, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AudioPlayer from './AudioPlayer'
import LanguageTabs from './LanguageTab'
import LabelButton from './LabelButton'
import Spinner from './Spinner'
import LiveblocksComments from '../components/LiveblocksComments'
import { formatDate } from '@/lib/utils'

const SnippetDetail: FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>()
  const navigate = useNavigate()
  const { snippets, loading } = useSnippets()
  const snippet = snippetId ? snippets.find(s => s.id === snippetId) : null
  const [language, setLanguage] = useState('spanish')
  const [upvotedCategories, setUpvotedCategories] = useState<{ [key: string]: boolean }>({})
  const [hoveredCategories, setHoveredCategories] = useState<{ [key: string]: boolean }>({})

  if (loading) {
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
          <Button variant='ghost' className='mt-4' onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const formattedDate = formatDate(snippet.audio_file.recorded_at)

  const handleUpvoteClick = (category: string) => {
    setUpvotedCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleHover = (category: string, isHovered: boolean) => {
    setHoveredCategories(prev => ({ ...prev, [category]: isHovered }))
  }

  return (
    <Card className='mx-auto w-full max-w-3xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Button variant='ghost' className='flex items-center space-x-2' onClick={() => navigate(-1)}>
          <ArrowLeft className='h-4 w-4' />
          <span>Back</span>
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
          <Button variant='ghost' size='icon'>
            <Star className='h-4 w-4' />
            <span className='sr-only'>Favorite</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h2 className='text-2xl font-bold'>
              ID {snippet.audio_file.radio_station_code} - {snippet.audio_file.radio_station_name} -{' '}
              {snippet.audio_file.location_state}
            </h2>
            <p className='text-sm text-muted-foreground text-zinc-400'>{formattedDate}</p>
          </div>
          <CardTitle className='text-2xl'>{snippet.title}</CardTitle>
          <div className='space-y-2'>
            <h3 className='font-semibold'>Summary</h3>
            <p className='text-sm'>{snippet.summary}</p>
          </div>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>{snippet.explanation}</p>
          </div>
          <AudioPlayer audioSrc={`https://audio.verdad.app/${snippet.file_path}`} />
          <LanguageTabs
            language={language}
            setLanguage={setLanguage}
            spanishText={snippet.transcription}
            englishText={snippet.translation}
          />
          <div className='flex space-x-2'>
            <div className='flex space-x-2'>
              {snippet.confidence_scores.categories.map(category => (
                <LabelButton
                  key={`${snippet.id}-${category.category}`}
                  label={category.category}
                  upvotes={0} // You might want to add an upvote count to your category object
                  isUpvoted={upvotedCategories[category.category]}
                  onUpvote={() => handleUpvoteClick(category.category)}
                  onHover={isHovered => handleHover(category.category, isHovered)}
                />
              ))}
              <Button variant='outline' size='icon' className='rounded-full'>
                +
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <LiveblocksComments snippetId={snippetId} showFullComments />
    </Card>
  )
}

export default SnippetDetail
