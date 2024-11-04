'use client'

import { useNavigate } from 'react-router-dom'
import { Filter, Loader, FileX } from 'lucide-react'
import { useFilter } from '@/providers/filter'
import { useLanguage } from '../providers/language'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import ResponsiveSidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import InfiniteScroll from 'react-infinite-scroll-component'
import { fetchFilteringOptions } from '@/hooks/useFilterOptions'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { filterKeys } from '@/hooks/useFilterOptions'
import { translations } from '@/constants/translations'

const PAGE_SIZE = 20

export default function SearchInterface() {
  const { showSidebar, filters, setShowSidebar, setFilter } = useFilter()
  const { language } = useLanguage()
  const t = translations[language]

  const navigate = useNavigate()

  const { data, error, fetchNextPage, hasNextPage, status } = useSnippets({ pageSize: PAGE_SIZE, filters, language })

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippet/${snippetId}`)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const starredBy = filters.starredBy || []

  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: filterKeys.options(language),
      queryFn: () => fetchFilteringOptions(language)
    })
  }, [queryClient, language])

  const handleStarredFilter = (starred: string) => {
    const currentSet = new Set(starredBy)
    if (currentSet.has(starred)) {
      currentSet.delete(starred)
    } else {
      currentSet.add(starred)
    }
    const newValues = Array.from(currentSet)
    setFilter('starredBy', newValues)
  }

  const snippets = data?.pages.flatMap(page => page.snippets) || []

  const STARRED_BY_RESULTS = [
    {
      label: t.byMe,
      value: 'by_me'
    },
    {
      label: t.byOthers,
      value: 'by_others'
    }
  ]

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

  return (
    <div className='flex flex-1 rounded-lg'>
      {showSidebar && <ResponsiveSidebar />}
      <div
        className={`${showSidebar ? 'px-20 md:px-20 lg:px-40 2xl:px-80' : 'md:px-20 lg:px-40 2xl:px-80'} flex w-full flex-col`}>
        <div className='mb-6 flex items-center justify-between px-4 pt-2'>
          <div className='flex space-x-2'>
            <RoundedToggleButton
              label={language === 'spanish' ? 'Filtrar' : 'Filter'}
              isActive={showSidebar}
              onClick={toggleSidebar}
              icon={<Filter className='mr-2 h-4 w-4' />}
            />
            {STARRED_BY_RESULTS.map((starred, index) => (
              <RoundedToggleButton
                key={index}
                label={starred.label}
                isActive={starredBy.includes(starred.value)}
                onClick={() => handleStarredFilter(starred.value)}
              />
            ))}
          </div>
        </div>
        <div
          id='scrollableDiv'
          className='custom-scrollbar rounded-lg bg-background shadow-inner'
          style={{
            height: 'calc(100svh - 128px)',
            overflow: 'auto'
          }}>
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
            <InfiniteScroll
              dataLength={snippets.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              className='flex flex-col gap-3 shadow-sm'
              scrollableTarget='scrollableDiv'
              loader={
                <div className='my-4 flex w-full justify-center'>
                  <Loader className='h-6 w-6 animate-spin text-primary' />
                </div>
              }
              scrollThreshold={0.8}>
              {snippets.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} onSnippetClick={handleSnippetClick} />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  )
}
