import type React from 'react';
import { useThreads } from "@liveblocks/react";
import { Composer, Thread } from '@liveblocks/react-ui'
import { MessageCircle } from 'lucide-react';
import Spinner from './Spinner'

interface LiveblocksCommentsProps {
  snippetId: string;
  showFullComments?: boolean;
}

const LiveblocksComments: React.FC<LiveblocksCommentsProps> = ({
  snippetId,
  showFullComments = false
}) => {
  const { threads, error, isLoading } = useThreads({
    query: {
      metadata: {
        snippetId,
      },
    },
  });

  if (isLoading) {
    return <div className="mx-6">
        <Spinner />
      </div>;
  }

  if (error) {
    return <div className="mx-6">Error loading comments: {error.message}</div>;
  }

  const commentCount = threads.reduce((sum, thread) => sum + thread.comments.length, 0)

  return (
    <div className="mx-6 mt-8">
      <div className="flex items-center justify-end">
        <MessageCircle className="h-4 w-4 mr-1" />
        <span>{commentCount} comments</span>
      </div>
      {showFullComments ? (
        <div>
          <h3 className="text-xl font-bold mb-4">Comments</h3>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Thread key={thread.id} thread={thread} showComposer={showFullComments}/>
            ))
          ) : (
            <div className="mt-4">
              <p className="mx-4" >No comments yet.</p>
              <Composer />
            </div>
          )}
        </div>
      ) : (
        threads.length > 0 && threads.map((thread) => (
          <Thread key={thread.id} thread={thread} showComposer={showFullComments}/>
        ))
      )}
    </div>
  );
};

export default LiveblocksComments;
