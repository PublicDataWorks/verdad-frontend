import type React from 'react'
import { useThreads, RoomProvider } from '@liveblocks/react'
import { Composer, Thread } from '@liveblocks/react-ui'
import Spinner from './Spinner'
import { Comment, CommentBodyLinkProps, CommentBodyMentionProps } from '@liveblocks/react-ui/primitives'

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

  return (
    <div className='mx-6 mt-8'>
      {threads.map(thread => (
        <Thread key={thread.id} thread={thread} />
      ))}
      <Composer
        metadata={{
          snippetId
        }}
      />
    </div>
  )
}

export default LiveblocksComments
