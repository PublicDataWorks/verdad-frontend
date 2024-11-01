'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader } from 'lucide-react'
import { useFilter } from '@/providers/filter'
import { useLanguage } from '../providers/language'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import ResponsiveSidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import InfiniteScroll from 'react-infinite-scroll-component'

const PAGE_SIZE = 20 // Increased to ensure initial scrolling

const SearchInterface: React.FC = () => {
  const { showSidebar, filters, setShowSidebar, setFilter } = useFilter()
  const { language } = useLanguage()

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

  const STARRED_BY_RESULTS = [
    {
      label: language === 'spanish' ? 'Destacado por mí' : 'Starred by Me',
      value: 'by Me'
    },
    {
      label: language === 'spanish' ? 'Destacado por otros' : 'Starred by Others',
      value: 'by Others'
    }
  ]

  return (
    <div className='flex flex-1'>
      {showSidebar && <ResponsiveSidebar />}
      <div className={`${showSidebar ? 'px-16' : 'md:px-20 lg:px-40'} flex w-full flex-col`}>
        <div className='mb-6 flex items-center justify-between px-4 pt-2'>
          <div className='flex space-x-2'>
            <RoundedToggleButton
              label={language === 'spanish' ? 'Filtrar' : 'Filter'}
              isActive={showSidebar}
              onClick={toggleSidebar}
              icon={<Filter className='mr-2 h-4 w-4' />}
            />
            {STARRED_BY_RESULTS.map(starred => (
              <RoundedToggleButton
                key={`result-${starred.value}`}
                label={starred.label}
                isActive={starredBy.includes(starred.value)}
                onClick={() => handleStarredFilter(starred.value)}
              />
            ))}
          </div>
        </div>
        <div id='scrollableDiv' style={{ height: '80vh', overflow: 'auto' }}>
          {status === 'error' ? (
            <div>{language === 'spanish' ? `Error: ${error.message}` : `Error: ${error.message}`}</div>
          ) : (
            <InfiniteScroll
              dataLength={snippets.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollableTarget='scrollableDiv'
              loader={
                <div className='my-2 flex w-full justify-center'>
                  <Loader />
                </div>
              }
              threshold={250} // Adjust as needed
            >
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

export default SearchInterface
