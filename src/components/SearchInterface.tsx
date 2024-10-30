'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader } from 'lucide-react'
import { useFilter } from '@/providers/filter'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import ResponsiveSidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import InfiniteScroll from 'react-infinite-scroller'

const STARRED_BY_RESULTS = [
  { label: 'Starred by Me', value: 'by Me' },
  { label: 'Starred by Others', value: 'by Others' }
]
const PAGE_SIZE = 20

const SearchInterface: React.FC = () => {
  const { showSidebar, filters, setShowSidebar, setFilter } = useFilter()

  const navigate = useNavigate()

  const { data, error, fetchNextPage, hasNextPage, status } = useSnippets(PAGE_SIZE, filters)

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippet/${snippetId}`)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const starredBy = filters.starredBy || []

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

  return (
    <div className='flex flex-grow overflow-hidden'>
      {showSidebar && <ResponsiveSidebar />}
      <div className={`${showSidebar ? 'px-16' : 'md:px-20 lg:px-40'} flex w-full flex-col overflow-hidden`}>
        <div className='mb-6 flex items-center justify-between px-4 pt-2'>
          <div className='flex space-x-2'>
            <RoundedToggleButton
              label='Filter'
              isActive={showSidebar}
              onClick={toggleSidebar}
              icon={<Filter className='mr-2 h-4 w-4' />}
            />
            {STARRED_BY_RESULTS.map(starred => (
              <RoundedToggleButton
                key={`result-${starred}`}
                label={starred.label}
                isActive={starredBy.includes(starred.value)}
                onClick={() => handleStarredFilter(starred.value)}
              />
            ))}
          </div>
        </div>
        <div className='mx-4 flex-grow overflow-y-auto'>
          {status === 'error' ? (
            <div>Error: {error.message}</div>
          ) : (
            <div className='h-full overflow-auto'>
              <InfiniteScroll
                pageStart={0}
                loadMore={fetchNextPage}
                hasMore={hasNextPage}
                loader={
                  <div className='mt-2 flex w-full justify-center' key='loader'>
                    <Loader />
                  </div>
                }
                useWindow={false}
                getScrollParent={() => document.querySelector('.overflow-auto')}>
                {snippets.map(snippet => (
                  <SnippetCard key={snippet.id} snippet={snippet} onSnippetClick={handleSnippetClick} />
                ))}
              </InfiniteScroll>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchInterface
