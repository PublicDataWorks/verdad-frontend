import type React from 'react'
import { useThreads, RoomProvider } from '@liveblocks/react'
import { Composer, Thread } from '@liveblocks/react-ui'
import Spinner from './Spinner'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { useEffect } from 'react'

interface LiveblocksCommentsProps {
  snippetId: string
  showFullComments?: boolean
}

const LiveblocksComments: React.FC<LiveblocksCommentsProps> = ({ snippetId, showFullComments = false }) => {
  if (!showFullComments) {
    return null
  }

  return (
    <RoomProvider id={snippetId}>
      <LiveblocksCommentsContent snippetId={snippetId} />
    </RoomProvider>
  )
}

const LiveblocksCommentsContent: React.FC<LiveblocksCommentsProps> = ({ snippetId }) => {
  const { threads, error, isLoading } = useThreads()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (e.target instanceof HTMLElement && e.target.closest('.comment-input')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('scroll', handleScroll, { passive: false })
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className='mx-6'>Error loading comments: {error.message}</div>
  }

  return (
    <div className='mt-8'>
      {threads.map(thread => (
        <Thread
          key={thread.id}
          thread={thread}
          overrides={{
            THREAD_COMPOSER_PLACEHOLDER: t.replyToThread
          }}
        />
      ))}
      <Composer
        metadata={{
          snippetId
        }}
        overrides={{
          COMPOSER_PLACEHOLDER: t.writeAComment
        }}
      />
    </div>
  )
}

export default LiveblocksComments
