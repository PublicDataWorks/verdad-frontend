import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Menu, Loader2 } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import RecordingCard from './RecordingCard'
import RecordingFilters from './RecordingFilters'
import { useRecordings } from '@/hooks/useRecordings'
import useRecordingFilters from '@/hooks/useRecordingFilters'
import { useDebounce } from '@/hooks/useDebounce'

export default function RecordingBrowser() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const { filters, searchTerm, setSearchTerm } = useRecordingFilters()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update URL search term when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch)
    }
  }, [debouncedSearch, searchTerm, setSearchTerm])

  // Sync search input with URL on mount
  useEffect(() => {
    if (searchTerm && searchInput !== searchTerm) {
      setSearchInput(searchTerm)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data, fetchNextPage, hasNextPage, status, error } = useRecordings({ filters, searchTerm })

  // Flatten pages into single array
  const recordings = data?.pages.flatMap(page => page.recordings) ?? []
  // Get total count from first page (server-side count of all matching records)
  const totalCount = data?.pages[0]?.total_count ?? 0
  const loadedCount = recordings.length

  // Restore scroll position on back navigation
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('recordingBrowserScrollPosition')
    if (savedPosition && scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo(0, parseInt(savedPosition, 10))
        sessionStorage.removeItem('recordingBrowserScrollPosition')
      }, 100)
    }
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSearchTerm(searchInput)
    },
    [searchInput, setSearchTerm]
  )

  return (
    <div className="bg-background-gray-light flex h-screen">
      {/* Sidebar */}
      <RecordingFilters
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalCount={totalCount}
        loadedCount={loadedCount}
      />

      {/* Main content area */}
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background border-b px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transcripts..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="bg-background-gray-lightest border-border-gray-lightest h-8 pl-9"
                />
              </div>
            </form>
          </div>
        </header>

        {/* Scrollable content area */}
        <div
          ref={scrollAreaRef}
          id="recordingsScrollableDiv"
          className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4"
        >
          {status === 'error' ? (
            <div className="p-4 text-center text-destructive">Error: {error?.message}</div>
          ) : status === 'pending' ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recordings found matching your filters.</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={recordings.length}
              next={fetchNextPage}
              hasMore={hasNextPage ?? false}
              className="flex flex-col gap-3"
              scrollableTarget="recordingsScrollableDiv"
              loader={
                <div className="my-4 flex w-full justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              }
              endMessage={<div className="my-4 flex w-full justify-center text-muted-foreground">No more recordings</div>}
              scrollThreshold={0.8}
            >
              {recordings.map(recording => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  )
}
