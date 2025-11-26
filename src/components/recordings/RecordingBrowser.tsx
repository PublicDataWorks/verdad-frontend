import { useState, useEffect, useCallback } from 'react'
import { Search, Menu, Loader2, AlertCircle } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RecordingCard from './RecordingCard'
import RecordingFilters from './RecordingFilters'
import { useRecordings } from '@/hooks/useRecordings'
import useRecordingFilters from '@/hooks/useRecordingFilters'
import { useDebounce } from '@/hooks/useDebounce'

export default function RecordingBrowser() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const { filters, searchTerm, setSearchTerm } = useRecordingFilters()

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage
  } = useRecordings({ filters, searchTerm })

  // Flatten pages into single array
  const recordings = data?.pages.flatMap(page => page.recordings) ?? []
  const totalCount = recordings.length

  // Restore scroll position on back navigation
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('recordingBrowserScrollPosition')
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10))
        sessionStorage.removeItem('recordingBrowserScrollPosition')
      }, 100)
    }
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
  }, [searchInput, setSearchTerm])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title */}
          <h1 className="text-xl font-bold hidden sm:block">Recording Browser</h1>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transcripts..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <RecordingFilters
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          totalCount={totalCount}
        />

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Error state */}
          {isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || 'Failed to load recordings. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && recordings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recordings found matching your filters.</p>
            </div>
          )}

          {/* Recording list with infinite scroll */}
          {recordings.length > 0 && (
            <InfiniteScroll
              dataLength={recordings.length}
              next={fetchNextPage}
              hasMore={hasNextPage ?? false}
              loader={
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
              endMessage={
                <p className="text-center text-sm text-muted-foreground py-4">
                  No more recordings to load
                </p>
              }
              scrollThreshold={0.8}
            >
              <div className="space-y-3">
                {recordings.map(recording => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </main>
      </div>
    </div>
  )
}
