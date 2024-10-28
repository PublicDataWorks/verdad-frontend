'use client'

import type React from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import xor from 'lodash/xor'
import { Filter } from 'lucide-react'
import { useFilter } from '@/providers/filter'

import RoundedToggleButton from './RoundedToggleButton'
import SnippetCard from './SnippetCard'
import ResponsiveSidebar from './Sidebar'
import { useSnippets } from '@/hooks/useSnippets'

// Import shadcn pagination components
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

const STARRED_BY_RESULTS = ['Starred by Me', 'Starred by Others']
const SORTED_BY = ['Most Recent', 'Oldest', 'Most Popular']
const PAGE_SIZE = 10

const SearchInterface: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const { showSidebar, setShowSidebar, starredByFilter, setStarredByFilter } = useFilter()

  const { data, isLoading } = useSnippets(currentPage, PAGE_SIZE)
  const navigate = useNavigate()

  const handleSnippetClick = (snippetId: string) => {
    navigate(`/snippet/${snippetId}`)
  }

  // Calculate total pages (if you have total count from API)
  const totalPages = Math.ceil((data?.count || 0) / PAGE_SIZE)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Number of page buttons to show

    if (totalPages <= showPages) {
      // If total pages is less than or equal to showPages, show all pages
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(0)

      // Calculate start and end of current group
      let start = Math.max(currentPage - 1, 1)
      let end = Math.min(currentPage + 1, totalPages - 2)

      // Add ellipsis if there's a gap after first page
      if (start > 1) {
        pages.push('ellipsis')
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if there's a gap before last page
      if (end < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      pages.push(totalPages - 1)
    }

    return pages
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
              onClick={() => setShowSidebar(!showSidebar)}
              icon={<Filter className='mr-2 h-4 w-4' />}
            />
            {STARRED_BY_RESULTS.map(starred => (
              <RoundedToggleButton
                key={`result-${starred}`}
                label={starred}
                isActive={starredByFilter.includes(starred)}
                onClick={() => setStarredByFilter(prev => xor(prev, [starred]))}
              />
            ))}
          </div>
        </div>
        <div className='mx-4 flex-grow overflow-y-auto'>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {data?.data.map(snippet => (
                <SnippetCard key={snippet.id} snippet={snippet} onSnippetClick={handleSnippetClick} />
              ))}

              {/* Shadcn Pagination */}
              <div className='my-6'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((pageNum, index) => (
                      <PaginationItem key={index}>
                        {pageNum === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum as number)}
                            isActive={currentPage === pageNum}>
                            {(pageNum as number) + 1}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(prev => prev + 1)} disabled={!data?.hasMore} />
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
