'use client'

import { Mail, MessageCircle, Search, Tag, ThumbsUp, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDismissWelcomeCard } from '@/hooks/useSnippetActions'

export default function WelcomeCard() {
  const { mutate: dismissWelcomeCard } = useDismissWelcomeCard()

  return (
    <Card className='relative mb-6 w-full overflow-hidden border-none bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800'>
      <CardHeader className='pb-2'>
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-2 top-2'
          onClick={() => dismissWelcomeCard()}
          aria-label='Dismiss welcome message'>
          <X className='h-4 w-4' />
        </Button>
        <h2 className='text-xl font-bold text-blue-900 dark:text-blue-100'>Welcome to VERDAD</h2>
        <p className='text-sm text-blue-800 dark:text-blue-200'>
          A tool for monitoring potential misinformation in radio broadcasts
        </p>
      </CardHeader>
      <CardContent className='grid gap-4 pb-4'>
        <div className='grid gap-2 text-sm'>
          <div className='flex items-start gap-2'>
            <Search className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-blue-800 dark:text-blue-200'>
              Discover and analyze flagged content from radio broadcasts
            </p>
          </div>
          <div className='flex items-start gap-2'>
            <ThumbsUp className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-blue-800 dark:text-blue-200'>
              Vote on snippets to indicate whether they contain misinformation
            </p>
          </div>
          <div className='flex items-start gap-2'>
            <Tag className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-blue-800 dark:text-blue-200'>Add and upvote labels to help categorize content types</p>
          </div>
          <div className='flex items-start gap-2'>
            <MessageCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-blue-800 dark:text-blue-200'>Leave comments and collaborate using @mentions</p>
          </div>
        </div>
        <p className='text-xs text-blue-700 dark:text-blue-300'>
          Your votes, labels, and comments help improve our detection process
        </p>
        <div className='flex items-center gap-2 text-xs'>
          <Mail className='h-3 w-3 text-blue-600 dark:text-blue-400' />
          <span className='text-blue-700 dark:text-blue-300'>Questions or feedback? Contact us at </span>
          <a href='mailto:help@verdad.app' className='text-blue-600 hover:underline dark:text-blue-400'>
            help@verdad.app
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
