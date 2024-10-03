"use client"
import type React from 'react';
import { useSnippets } from '../hooks/useSnippets';
import { useThreads } from "@liveblocks/react";
import { Thread, Composer } from "@liveblocks/react-ui";
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2, Star, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AudioPlayer from "./AudioPlayer"
import LanguageTabs from "./LanguageTab"
import { useNavigate, useParams } from 'react-router-dom';

const LiveblocksComments: React.FC<{ snippetId: string }> = ({ snippetId }) => {
  const { threads, error, isLoading } = useThreads({
    query: {
      metadata: {
        snippetId,
      },
    },
  });

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div>Error loading comments: {error.message}</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {threads && threads.length > 0 ? (
        threads.map((thread) => (
          <Thread key={thread.id} thread={thread} />
        ))
      ) : (
        <div className="mt-4">
          <p>No comments yet.</p>
          <Composer
            metadata={{ snippetId }}
          />
        </div>
      )}
    </div>
  );
};

const SnippetDetail: React.FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>();
  const navigate = useNavigate();
  const { snippets, loading } = useSnippets();
  const snippet = snippetId ? snippets.find(s => s.id === parseInt(snippetId, 10)) : null;
  const [language, setLanguage] = useState("spanish")

  const spanishText = "Texto en español: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  const englishText = "English text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!snippet || !snippetId) {
    return <div>Snippet not found</div>;
  }

  return (
    <LiveblocksProvider publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBKEY as string}>
      <RoomProvider id={import.meta.env.VITE_LIVEBLOCKS_ROOM as string}>
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Original transcript (Spanish)</DropdownMenuItem>
                  <DropdownMenuItem>Translated transcript (English)</DropdownMenuItem>
                  <DropdownMenuItem>
                    Audio
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
                <span className="sr-only">Favorite</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">ID {snippet.radio_code} - {snippet.name} - {snippet.channel}</h2>
                <p className="text-sm text-muted-foreground">Date placeholder</p>
              </div>
              <CardTitle>AI-generated title placeholder</CardTitle>
              <div className="space-y-2">
                <h3 className="font-semibold">Summary</h3>
                <p className="text-sm">
                  Summary placeholder: Phasellus lacinia felis est, placerat commodo odio tincidunt iaculis. Sed felis magna, iaculis a metus
                  id, ullamcorper suscipit nulla. Fusce facilisis, nunc ultricies posuere porttitor, nisl lacus tincidunt
                  diam, vel feugiat nisi elit id massa.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">An explanation of why it suspected of being disinfo</h3>
                <p className="text-sm text-muted-foreground">
                  Disinfo explanation placeholder: Phasellus lacinia felis est, placerat commodo odio tincidunt iaculis. Sed felis magna, iaculis a metus
                  id, ullamcorper suscipit nulla. Fusce facilisis, nunc ultricies posuere porttitor, nisl lacus tincidunt
                  diam, vel feugiat nisi elit id massa.
                </p>
              </div>
              <AudioPlayer />
              <LanguageTabs
                language={language}
                setLanguage={setLanguage}
                spanishText={spanishText}
                englishText={englishText}
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex items-center space-x-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                >
                  <span>{snippet.state}</span>
                  <span className="flex items-center justify-center">
                    <ArrowLeft className="h-3 w-3 rotate-90" />
                    {snippet.human_upvotes}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                >
                  <span>{snippet.type}</span>
                  <span className="flex items-center justify-center">
                    <ArrowLeft className="h-3 w-3 rotate-90" />
                    0
                  </span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  +
                </Button>
              </div>
            </div>
          </CardContent>
          <LiveblocksComments snippetId={snippetId} />
        </Card>
      </RoomProvider>
    </LiveblocksProvider>
  );
};


export default SnippetDetail;