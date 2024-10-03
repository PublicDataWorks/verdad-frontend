import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnippets } from '../hooks/useSnippets';
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUp, MessageCircle, Share2, Star, X, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThreads } from "@liveblocks/react";
import { Thread } from "@liveblocks/react-ui";
import { SupabaseClient } from '@supabase/supabase-js';

interface Source {
  id: number;
  radio_code: string;
  name: string;
  type: string;
  channel: string;
  state: string;
  human_upvotes: number;
}

const LiveblocksComments: React.FC<{ snippetId: string; onCommentCountChange: (count: number) => void }> = ({ snippetId, onCommentCountChange }) => {
  const { threads, error, isLoading } = useThreads({
    query: {
      metadata: {
        snippetId,
      },
    },
  });

  useEffect(() => {
    if (threads) {
      const totalComments = threads.reduce((sum, thread) => sum + thread.comments.length, 0);
      onCommentCountChange(totalComments);
    }
  }, [threads, onCommentCountChange]);

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div>Error loading comments: {error.message}</div>;
  }

  return (
    <div className="mt-4">
      {threads && threads.length > 0 ? (
        threads.map((thread) => (
          <Thread key={thread.id} thread={thread} showComposer={false} />
        ))
      ) : (
        ''
      )}
    </div>
  );
};

const SearchInterface: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Most Recent');
  const navigate = useNavigate();
  const { snippets } = useSnippets();
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const radioStations = [
    "All Sources",
    "KZZZ-123",
    "WXYZ-456",
    "ABCD-789",
    "EFGH-012",
    "IJKL-345",
  ];

  const handleSnippetClick = (snippetId: number) => {
    navigate(`/snippet/${snippetId}`);
  };

  const handleCommentCountChange = (snippetId: string, count: number) => {
    setCommentCounts(prev => {
      if (prev[snippetId] === count) return prev;
      return { ...prev, [snippetId]: count };
    });
  };

  return (
    <LiveblocksProvider publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBKEY as string}>
      <RoomProvider id={import.meta.env.VITE_LIVEBLOCKS_ROOM as string}>
        <div className="container mx-auto px-4 h-screen flex flex-col">
          <div className="flex flex-grow overflow-hidden">
            {showSidebar && (
              <div className="w-1/4 pr-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="ghost" onClick={() => setShowSidebar(false)} className="text-blue-600">
                      Clear all <X className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Source</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedSource}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {radioStations.map((station) => (
                          <DropdownMenuItem key={station} onSelect={() => setSelectedSource(station)}>
                            {station}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Labeled</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">by Me</Button>
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">by Others</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Starred</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">by Me</Button>
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">by Others</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Label</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">Human Right</Button>
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">Woman Right</Button>
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">Equality</Button>
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">Label xxx</Button>
                      <Button variant="outline" size="sm" className="rounded-full h-7 px-3 text-xs">Label xyz</Button>
                    </div>
                  </div>
                  <Button variant="link" className="p-0 text-blue-600">
                    Show more <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className={`${showSidebar ? 'w-3/4' : 'w-full'} flex flex-col overflow-hidden`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <Button
                    variant={showSidebar ? "secondary" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">Starred by Me</Button>
                  <Button variant="outline" size="sm" className="rounded-full">Starred by Others</Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="">
                      {sortBy}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setSortBy('Most Recent')}>Most Recent</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSortBy('Oldest')}>Oldest</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSortBy('Most Popular')}>Most Popular</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="overflow-y-auto flex-grow">
                {snippets.map((snippet) => (
                  <div key={snippet.id} className="mb-4 p-4 border rounded-lg cursor-pointer" onClick={() => handleSnippetClick(snippet.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">ID {snippet.id} {snippet.radio_code}</h3>
                        <p className="text-sm text-gray-500">{snippet.name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="mb-4">{snippet.type} - {snippet.channel}</p>
                    <div className="flex space-x-2 mb-4">
                      <Button variant="outline" size="sm" className="rounded-full bg-blue-100 text-blue-600">
                        {snippet.state} <ArrowUp className="ml-1 h-3 w-3" /> {snippet.human_upvotes}
                      </Button>
                    </div>
                    <LiveblocksComments 
                      snippetId={snippet.id.toString()} 
                      onCommentCountChange={(count) => handleCommentCountChange(snippet.id.toString(), count)}
                    />
                    <div className="flex justify-end mt-4">
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{commentCounts[snippet.id] || 0} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default SearchInterface;