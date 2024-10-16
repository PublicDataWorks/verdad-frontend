'use client'

import type React from 'react'
import { useSnippets } from '../hooks/useSnippets'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Share2, Star, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AudioPlayer from './AudioPlayer'
import LanguageTabs from './LanguageTab'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from './Spinner'
import LiveblocksComments from '../components/LiveblocksComments'

const SnippetDetail: React.FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>()
  const navigate = useNavigate()
  const { snippets, loading } = useSnippets()
  const snippet = snippetId ? snippets.find(s => s.id === parseInt(snippetId, 10)) : null
  const [language, setLanguage] = useState('spanish')
  console.log(snippetId)
  const spanishText =
    'Texto en español: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  const englishText =
    'English text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

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
              ID {snippet.radio_code} - {snippet.name} - {snippet.channel}
            </h2>
            <p className='text-sm text-muted-foreground'>Date placeholder</p>
          </div>
          <CardTitle>AI-generated title placeholder</CardTitle>
          <div className='space-y-2'>
            <h3 className='font-semibold'>Summary</h3>
            <p className='text-sm'>
              Summary placeholder: Phasellus lacinia felis est, placerat commodo odio tincidunt iaculis. Sed felis
              magna, iaculis a metus id, ullamcorper suscipit nulla. Fusce facilisis, nunc ultricies posuere porttitor,
              nisl lacus tincidunt diam, vel feugiat nisi elit id massa.
            </p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-semibold'>An explanation of why it suspected of being disinfo</h3>
            <p className='text-sm text-muted-foreground'>
              Disinfo explanation placeholder: Phasellus lacinia felis est, placerat commodo odio tincidunt iaculis. Sed
              felis magna, iaculis a metus id, ullamcorper suscipit nulla. Fusce facilisis, nunc ultricies posuere
              porttitor, nisl lacus tincidunt diam, vel feugiat nisi elit id massa.
            </p>
          </div>
          <AudioPlayer />
          <LanguageTabs
            language={language}
            setLanguage={setLanguage}
            spanishText={spanishText}
            englishText={englishText}
          />
          <div className='flex space-x-2'>
            <Button
              variant='outline'
              className='flex items-center space-x-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200'
            >
              <span>{snippet.state}</span>
              <span className='flex items-center justify-center'>
                <ArrowLeft className='h-3 w-3 rotate-90' />
                {snippet.human_upvotes}
              </span>
            </Button>
            <Button
              variant='outline'
              className='flex items-center space-x-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200'
            >
              <span>{snippet.type}</span>
              <span className='flex items-center justify-center'>
                <ArrowLeft className='h-3 w-3 rotate-90' />0
              </span>
            </Button>
            <Button variant='outline' size='icon' className='rounded-full'>
              +
            </Button>
          </div>
        </div>
      </CardContent>
      <LiveblocksComments snippetId={snippetId} showFullComments={true} />
    </Card>
  )
}

export default SnippetDetail
