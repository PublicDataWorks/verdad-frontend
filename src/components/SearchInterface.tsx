import { useNavigate } from 'react-router-dom'
import { Loader, ArrowUpDown, Search } from 'lucide-react'
import { useSidebar } from '@/providers/sidebar'
import { useLanguage } from '../providers/language'

import SnippetCard from './SnippetCard'
import Sidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import InfiniteScroll from 'react-infinite-scroll-component'
import { fetchFilteringOptions } from '@/hooks/useFilterOptions'
import supabaseClient from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { filterKeys } from '@/hooks/useFilterOptions'
import useSnippetFilters from '@/hooks/useSnippetFilters'
import { isMobile } from 'react-device-detect'
import WelcomeCard from './ui/welcome-card'
import TrendingCard from './ui/trending-card'
import { useAuth } from '@/providers/auth'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { translations } from '@/constants/translations'
import { Input } from './ui/input'
import { debounce, isEmpty } from 'lodash'
import { NoSnippetsMessage } from './NoSnippetsMessage'
import { PAGE_SIZE } from '@/constants'
import { cn } from '@/lib/utils'

export default function SearchInterface() {
  const { showSidebar } = useSidebar()
  const { filters, setFilter } = useSnippetFilters()
  const { user } = useAuth()
  const showWelcomeCard = user?.user_metadata?.dismiss_welcome_card

  const { language } = useLanguage()
  const t = translations[language]

  const navigate = useNavigate()

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { searchTerm, order_by } = filters

  const { data, error, fetchNextPage, hasNextPage, status } = useSnippets({
    pageSize: PAGE_SIZE,
    filters,
    language,
    orderBy: order_by || 'latest',
    searchTerm: searchTerm || ''
  })

  const handleSnippetClick = (event: React.MouseEvent, snippetId: string) => {
    if (event.ctrlKey || event.metaKey) {
      localStorage.setItem('searchScrollPosition', String(scrollAreaRef.current?.scrollTop) ?? '')
      window.open(`/snippet/${snippetId}`, '_blank')
    } else {
      localStorage.setItem('searchScrollPosition', String(scrollAreaRef.current?.scrollTop) ?? '')
      navigate(`/snippet/${snippetId}`)
    }
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

  const padding = showSidebar ? 'px-20 md:px-20 lg:px-40 2xl:px-80' : 'px-6 md:px-20 lg:px-40 2xl:px-80'

  return (
    <div className='bg-background-gray-light flex h-[calc(-60px+100svh)] flex-1 rounded-lg'>
      {showSidebar && <Sidebar />}
      <div className='flex w-full flex-col pt-6'>
        <div className={`${padding} mb-6 flex justify-between gap-2`}>
          <div className='relative flex-grow'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              defaultValue={searchTerm || ''}
              placeholder={t.searchPlaceholder}
              onChange={debounce(e => setFilter('searchTerm', e.target.value), 300)}
              className='bg-background-gray-lightest border-border-gray-lightest h-8 w-full pl-9'
            />
          </div>
          <div className={isMobile ? '' : 'ml-auto'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <ArrowUpDown className='mr-2 h-4 w-4' />
                  Sort:{' '}
                  {order_by === 'activities'
                    ? t.sortBy.mostRecentActivities
                    : order_by === 'upvotes'
                      ? t.sortBy.mostUpvotes
                      : order_by === 'comments'
                        ? t.sortBy.mostComments
                        : t.sortBy.mostRecentRecordings}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuRadioGroup
                  value={order_by || 'latest'}
                  onValueChange={value => setFilter('order_by', value)}>
                  <DropdownMenuRadioItem value='activities'>{t.sortBy.mostRecentActivities}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='upvotes'>{t.sortBy.mostUpvotes}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='comments'>{t.sortBy.mostComments}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='latest'>{t.sortBy.mostRecentRecordings}</DropdownMenuRadioItem>
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
              {isEmpty(searchTerm) && (
                <div className={cn(
                  'mb-6 grid gap-4',
                  showSidebar ? 'xl:grid-cols-2' : 'md:grid-cols-2'
                )}>
                  {showWelcomeCard && <WelcomeCard />}
                  <TrendingCard
                    expanded={!showWelcomeCard}
                    className={showWelcomeCard ? '' : (showSidebar ? 'xl:col-span-2' : 'md:col-span-2')}
                  />
                </div>
              )}
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
                endMessage={<div className='my-4 flex w-full justify-center'>{t.noMoreSnippets}</div>}
                scrollThreshold={0.8}>
                {snippets.map(snippet => (
                  <SnippetCard
                    key={`${language}-${snippet.id}`}
                    snippet={snippet}
                    searchTerm={searchTerm || ''}
                    onSnippetClick={handleSnippetClick}
                  />
                ))}
              </InfiniteScroll>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
