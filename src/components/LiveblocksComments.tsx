import type React from 'react'
import { useThreads } from '@liveblocks/react'
import { Composer, Thread } from '@liveblocks/react-ui'
import { MessageCircle } from 'lucide-react'
import Spinner from './Spinner'
import { Comment, CommentBodyLinkProps, CommentBodyMentionProps } from '@liveblocks/react-ui/primitives'

interface LiveblocksCommentsProps {
  snippetId: string
  showFullComments?: boolean
}

// Render a mention in the comment, e.g. "@Emil Joyce"
function Mention({ userId }: CommentBodyMentionProps) {
  return <Comment.Mention>@{userId}</Comment.Mention>
}

// Render a link in the comment, e.g. "https://liveblocks.io"
function Link({ href, children }: CommentBodyLinkProps) {
  return <Comment.Link href={href}>{children}</Comment.Link>
}

const LiveblocksComments: React.FC<LiveblocksCommentsProps> = ({ snippetId, showFullComments = false }) => {
  const { threads, error, isLoading } = useThreads({
    query: {
      metadata: {
        snippetId
      }
    }
  })

  if (isLoading) {
    return (
      <div className='mx-6'>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className='mx-6'>Error loading comments: {error.message}</div>
  }

  const allComments = threads.flatMap(thread => thread.comments)
  const commentCount = allComments.length

  return (
    <div className='mt-8 border-t-2'>
      {showFullComments ? (
        <div className=''>
          {threads.length > 0 ? (
            threads.map(thread => <Thread key={thread.id} thread={thread} showComposer={showFullComments} />)
          ) : (
            <div className=''>
              <Composer
                metadata={{
                  snippetId
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className='flex items-center justify-end'>
          <MessageCircle className='mr-1 h-4 w-4' />
          <span>{commentCount} comments</span>
          {threads.length > 0
            ? threads.map(thread => <Thread key={thread.id} thread={thread} showComposer={showFullComments} />)
            : ''}
        </div>
      )}
    </div>
  )
}

export default LiveblocksComments
