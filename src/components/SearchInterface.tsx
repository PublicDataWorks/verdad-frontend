'use client'

import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import xor from 'lodash/xor'
import { Filter } from 'lucide-react'
import { useFilter } from '@/providers/filter'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import ResponsiveSidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

const STARRED_BY_RESULTS = ['Starred by Me', 'Starred by Others']
const PAGE_SIZE = 5

const SearchInterface: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const { showSidebar, starredByFilter, setShowSidebar, setStarredByFilter } = useFilter()

  const { data, isLoading } = useSnippets(currentPage, PAGE_SIZE)
  const navigate = useNavigate()
  const snippets = data?.data

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippet/${snippetId}`)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleStarredFilter = (starred: string) => {
    setStarredByFilter(xor(starredByFilter, [starred]))
  }

  return (
    <div className='flex flex-grow overflow-hidden'>
      {showSidebar && <ResponsiveSidebar />}
      <div className={`${showSidebar ? 'px-16' : 'md:px-56'} flex w-full flex-col overflow-hidden`}>
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
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {snippets?.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} onSnippetClick={handleSnippetClick} />
              ))}
              <div className='my-6'>
                <Pagination className='mt-8'>
                  <PaginationContent className='flex items-center gap-6 rounded-xl border bg-white p-2 shadow-sm'>
                    <PaginationItem>
                      <PaginationPrevious
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200
                          ${
                            currentPage === 0
                              ? 'cursor-not-allowed text-gray-300'
                              : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationLink
                        className='rounded-lg bg-blue-50 px-6 py-2 font-semibold text-blue-700'
                        isActive={true}>
                        <span className='text-sm'>
                          {currentPage + 1} / {data?.total_page}
                        </span>
                      </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200
                          ${
                            currentPage >= (data?.total_page || 0) - 1
                              ? 'cursor-not-allowed text-gray-300'
                              : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= (data?.total_page || 0) - 1}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchInterface
