import type React from 'react'
import { useThreads } from '@liveblocks/react'
import { Composer, Thread } from '@liveblocks/react-ui'
import { MessageCircle } from 'lucide-react'
import Spinner from './Spinner'
import {
  Comment,
  CommentBodyLinkProps,
  CommentBodyMentionProps,
} from "@liveblocks/react-ui/primitives";

interface LiveblocksCommentsProps {
  snippetId: string
  showFullComments?: boolean
}

// Render a mention in the comment, e.g. "@Emil Joyce"
function Mention({ userId }: CommentBodyMentionProps) {
  return <Comment.Mention>@{userId}</Comment.Mention>;
}

// Render a link in the comment, e.g. "https://liveblocks.io"
function Link({ href, children }: CommentBodyLinkProps) {
  return <Comment.Link href={href}>{children}</Comment.Link>;
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
  const lastTwoComments = allComments.slice(-2)

  return (
    <div className='mx-6 mt-8'>
      <div className='flex items-center justify-end'>
        <MessageCircle className='h-4 w-4 mr-1' />
        <span>{commentCount} comments</span>
      </div>
      {showFullComments ? (
        <div>
          <h3 className='text-xl font-bold mb-4'>Comments</h3>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Thread key={thread.id} thread={thread} showComposer={showFullComments} />
            ))
          ) : (
            <div className='mt-4'>
              <p className='mx-4'>No comments yet.</p>
              <Composer metadata={{
                snippetId
              }}/>
            </div>
          )}
        </div>
      ) : (
        allComments.length > 0 && lastTwoComments.map((comment) => (
          <div key={comment.id}>
            <Comment.Body
              body={comment.body}
              components={{
                Mention,
                Link,
              }}
            />
          </div>
        ))
      )}
    </div>
  )
}

export default LiveblocksComments
