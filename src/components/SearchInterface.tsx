import { useNavigate } from 'react-router-dom'
import { Filter, Loader, FileX, X, ArrowUpDown } from 'lucide-react'
import { useSidebar } from '@/providers/sidebar'
import { useLanguage } from '../providers/language'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import Sidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import InfiniteScroll from 'react-infinite-scroll-component'
import { fetchFilteringOptions } from '@/hooks/useFilterOptions'
import supabaseClient from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { filterKeys } from '@/hooks/useFilterOptions'
import useSnippetFilters from '@/hooks/useSnippetFilters'
import { isMobile } from 'react-device-detect'
import { TooltipProvider } from './ui/tooltip'
import WelcomeCard from './ui/welcome-card'
import { useAuth } from '@/providers/auth'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

export const PAGE_SIZE = 20

export default function SearchInterface() {
  const { showSidebar, setShowSidebar } = useSidebar()
  const { filters, setFilter } = useSnippetFilters()
  const { user } = useAuth()
  const showWelcomeCard = user?.user_metadata?.dismiss_welcome_card

  const { language } = useLanguage()

  const navigate = useNavigate()

  const { data, error, fetchNextPage, hasNextPage, status } = useSnippets({
    pageSize: PAGE_SIZE,
    filters,
    language,
    orderBy: filters.order_by || 'latest'
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSnippetClick = (snippetId: string) => {
    localStorage.setItem('searchScrollPosition', String(scrollAreaRef.current?.scrollTop) ?? '')
    navigate(`/snippet/${snippetId}`)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [showWelcomeCard])

  useEffect(() => {
    const searchScrollPosition = localStorage.getItem('searchScrollPosition')
    if (searchScrollPosition && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, Number(searchScrollPosition))
      localStorage.removeItem('searchScrollPosition')
    }
  }, [scrollAreaRef.current])

  const queryClient = useQueryClient()

  useEffect(() => {
    const trackUserSignup = async () => {
      try {
        await supabaseClient.rpc('track_user_signups', { origin: '/knight' })
      } catch (error) {}
    }

    const signupPath = localStorage.getItem('signup')

    if (signupPath === '/knight') {
      localStorage.removeItem('signup')
      trackUserSignup()
    }
  }, [])

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: filterKeys.options(language),
      queryFn: () => fetchFilteringOptions(language)
    })
  }, [queryClient, language])

  const snippets = data?.pages.flatMap(page => page.snippets) || []

  const NoSnippetsMessage = () => (
    <div className='flex h-full flex-col items-center justify-center p-4 text-center'>
      <FileX className='mb-4 h-16 w-16 text-muted-foreground' />
      <h2 className='mb-2 text-2xl font-semibold'>
        {language === 'spanish' ? 'No se encontraron snippets' : 'No snippets found'}
      </h2>
      <p className='text-muted-foreground'>
        {language === 'spanish'
          ? 'Intenta ajustar tus filtros o busca algo diferente.'
          : 'Try adjusting your filters or search for something different.'}
      </p>
    </div>
  )

  const padding = showSidebar ? 'px-20 md:px-20 lg:px-40 2xl:px-80' : 'px-6 md:px-20 lg:px-40 2xl:px-80'

  return (
    <div className='flex h-[calc(-60px+100svh)] flex-1 rounded-lg'>
      {showSidebar && <Sidebar />}
      <div className={`flex w-full flex-col pt-6`}>
        <div className={`${padding} mb-6 flex justify-between`}>
          {isMobile && (
            <div className='flex'>
              <div className='flex space-x-2'>
                <RoundedToggleButton
                  label={language === 'spanish' ? 'Filtrar' : 'Filter'}
                  isActive={showSidebar}
                  onClick={toggleSidebar}
                  icon={<Filter className='mr-2 h-4 w-4' />}
                />
              </div>
            </div>
          )}
          <div className={isMobile ? '' : 'ml-auto'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <ArrowUpDown className='mr-2 h-4 w-4' />
                  Sort:{' '}
                  {filters.order_by === 'activities'
                    ? 'Most recent activities'
                    : filters.order_by === 'upvotes'
                      ? 'Most upvotes'
                      : filters.order_by === 'comments'
                        ? 'Most comments'
                        : 'Most recent recordings'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[200px] justify-between'>
                <DropdownMenuRadioGroup
                  value={filters.order_by || 'latest'}
                  onValueChange={value => setFilter('order_by', value)}>
                  <DropdownMenuRadioItem value='activities'>Most recent activities</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='upvotes'>Most upvotes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='comments'>Most comments</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='latest'>Most recent recordings</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          ref={scrollAreaRef}
          id='scrollableDiv'
          className={`${padding} custom-scrollbar flex-1 overflow-y-scroll rounded-lg`}>
          {status === 'error' ? (
            <div className='p-4 text-center text-destructive'>
              {language === 'spanish' ? `Error: ${error.message}` : `Error: ${error.message}`}
            </div>
          ) : status === 'pending' ? (
            <div className='flex h-full items-center justify-center'>
              <Loader className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : snippets.length === 0 ? (
            <NoSnippetsMessage />
          ) : (
            <>
              {showWelcomeCard && <WelcomeCard />}
              <InfiniteScroll
                dataLength={snippets.length}
                next={fetchNextPage}
                hasMore={hasNextPage}
                className='flex h-full flex-col gap-3'
                scrollableTarget='scrollableDiv'
                loader={
                  <div className='my-4 flex w-full justify-center'>
                    <Loader className='h-6 w-6 animate-spin text-primary' />
                  </div>
                }
                scrollThreshold={0.8}>
                <TooltipProvider delayDuration={100}>
                  {snippets.map(snippet => (
                    <SnippetCard
                      key={`${language}-${snippet.id}`}
                      snippet={snippet}
                      onSnippetClick={handleSnippetClick}
                    />
                  ))}
                </TooltipProvider>
              </InfiniteScroll>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
