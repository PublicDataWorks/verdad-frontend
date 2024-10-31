'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import xor from 'lodash/xor'
import { Filter, Loader } from 'lucide-react'
import { useFilter } from '@/providers/filter'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import ResponsiveSidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import InfiniteScroll from 'react-infinite-scroller'

const STARRED_BY_RESULTS = ['Starred by Me', 'Starred by Others']
const PAGE_SIZE = 5

const SearchInterface: React.FC = () => {
  const { showSidebar, starredByFilter, setShowSidebar, setStarredByFilter } = useFilter()

  const { data, error, fetchNextPage, hasNextPage, status } = useSnippets(PAGE_SIZE)

  const navigate = useNavigate()

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippet/${snippetId}`)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleStarredFilter = (starred: string) => {
    setStarredByFilter(xor(starredByFilter, [starred]))
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
                label={starred}
                isActive={starredByFilter.includes(starred)}
                onClick={() => handleStarredFilter(starred)}
              />
            ))}
          </div>
        </div>
        <div className='mx-4 flex-grow overflow-y-auto'>
          {status === 'loading' ? (
            <div>Loading...</div>
          ) : status === 'error' ? (
            <div>Error: {error.message}</div>
          ) : (
            <div className='h-full overflow-auto'>
              <InfiniteScroll
                pageStart={0}
                loadMore={fetchNextPage}
                hasMore={hasNextPage}
                loader={
                  <div className='mt-2 flex w-full justify-center' key="loader">
                    <Loader />
                  </div>
                }
                useWindow={false} // Change to false to use the parent container
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
