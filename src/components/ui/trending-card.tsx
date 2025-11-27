import { useState, useEffect, useRef, useCallback } from 'react'
import { TrendingUp, Filter, ArrowLeft, TrendingDown, Minus, X, Globe, MapPin, Radio, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Sparkline from '@/components/ui/sparkline'
import DetailChart from '@/components/ui/detail-chart'
import { useTrendingTopics, useTopicDetails, trendingKeys } from '@/hooks/useTrendingTopics'
import { fetchTopicDetails } from '@/apis/trending'
import useSnippetFilters, { Timespan } from '@/hooks/useSnippetFilters'
import { useLanguage } from '@/providers/language'
import { useSidebar } from '@/providers/sidebar'
import { translations } from '@/constants/translations'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

// Check if any filters are currently active (excluding labels and focusedTopic)
const hasActiveFilters = (filters: Record<string, unknown>): boolean => {
  const { languages, states, sources, politicalSpectrum } = filters as {
    languages?: string[]
    states?: string[]
    sources?: string[]
    politicalSpectrum?: string
  }
  return (
    (languages && languages.length > 0) ||
    (states && states.length > 0) ||
    (sources && sources.length > 0) ||
    !!politicalSpectrum
  )
}

// Get active filter summary for display
const getFilterSummary = (filters: Record<string, unknown>) => {
  const { languages, states, sources, politicalSpectrum } = filters as {
    languages?: string[]
    states?: string[]
    sources?: string[]
    politicalSpectrum?: string
  }

  const items: { icon: React.ReactNode; label: string }[] = []

  if (languages && languages.length > 0) {
    items.push({
      icon: <Globe className='h-3 w-3' />,
      label: languages.length === 1 ? languages[0] : `${languages.length} languages`
    })
  }

  if (states && states.length > 0) {
    items.push({
      icon: <MapPin className='h-3 w-3' />,
      label: states.length === 1 ? states[0] : `${states.length} states`
    })
  }

  if (sources && sources.length > 0) {
    items.push({
      icon: <Radio className='h-3 w-3' />,
      label: sources.length === 1 ? sources[0] : `${sources.length} sources`
    })
  }

  if (politicalSpectrum) {
    const spectrumLabels: Record<string, string> = {
      left: 'Left',
      center_left: 'Center-Left',
      center: 'Center',
      center_right: 'Center-Right',
      right: 'Right'
    }
    items.push({
      icon: <Gauge className='h-3 w-3' />,
      label: spectrumLabels[politicalSpectrum] || politicalSpectrum
    })
  }

  return items
}

// Compact filter summary component
function FilterSummary({ filters, label, className }: { filters: Record<string, unknown>; label?: string; className?: string }) {
  const items = getFilterSummary(filters)

  if (items.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {label && (
        <span className='text-xs text-orange-600 dark:text-orange-400'>{label}</span>
      )}
      {items.map((item, index) => (
        <div
          key={index}
          className='flex items-center gap-1 rounded-full bg-orange-200/60 dark:bg-orange-800/60 px-2 py-0.5 text-xs text-orange-700 dark:text-orange-200'
        >
          {item.icon}
          <span className='truncate max-w-[100px]'>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

interface TrendingCardProps {
  expanded?: boolean
  className?: string
}

const TIMESPAN_OPTIONS: { value: Timespan; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All' }
]

// Skeleton loader component for better perceived performance
function TopicSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-2'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex items-center justify-between gap-2 px-2 py-1.5 animate-pulse'>
          <div className='h-4 bg-orange-200/50 dark:bg-orange-700/50 rounded flex-1 max-w-[60%]' />
          <div className='flex items-center gap-2'>
            <div className='w-[60px] h-5 bg-orange-200/50 dark:bg-orange-700/50 rounded' />
            <div className='w-10 h-4 bg-orange-200/50 dark:bg-orange-700/50 rounded' />
          </div>
        </div>
      ))}
    </div>
  )
}

function FocusModeSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='h-6 bg-orange-200/50 dark:bg-orange-700/50 rounded w-3/4 mb-4' />
      <div className='h-[100px] bg-orange-200/30 dark:bg-orange-700/30 rounded mb-4' />
      <div className='flex justify-between'>
        <div>
          <div className='h-8 w-20 bg-orange-200/50 dark:bg-orange-700/50 rounded mb-1' />
          <div className='h-3 w-16 bg-orange-200/30 dark:bg-orange-700/30 rounded' />
        </div>
        <div className='text-right'>
          <div className='h-5 w-16 bg-orange-200/50 dark:bg-orange-700/50 rounded mb-1' />
          <div className='h-3 w-24 bg-orange-200/30 dark:bg-orange-700/30 rounded' />
        </div>
      </div>
    </div>
  )
}

export default function TrendingCard({ expanded = false, className }: TrendingCardProps) {
  const { filters, setFilters } = useSnippetFilters()
  const { language } = useLanguage()
  const { setShowSidebar } = useSidebar()
  const t = translations[language]
  const queryClient = useQueryClient()

  // Local state for timespan - doesn't affect URL or other components
  const [timespan, setTimespan] = useState<Timespan>('30d')

  // Track if content is fading for animation
  const [isFading, setIsFading] = useState(false)
  const prevDataRef = useRef<string | null>(null)

  // Check if we're in Focus Mode - either explicitly set or when exactly one label is selected
  const focusedTopicId = filters.focusedTopic || (filters.labels?.length === 1 ? filters.labels[0] : undefined)

  // Fetch trending topics (Discovery Mode)
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useTrendingTopics({
    timespan,
    filters,
    language,
    limit: expanded ? 10 : 5
  })

  // Fetch topic details (Focus Mode)
  const { data: topicData, isLoading: topicLoading, error: topicError } = useTopicDetails({
    topicId: focusedTopicId,
    timespan,
    filters,
    language,
    enabled: !!focusedTopicId
  })

  // Prefetch topic details on hover for faster transitions
  const prefetchTopicDetails = useCallback((topicId: string) => {
    queryClient.prefetchQuery({
      queryKey: trendingKeys.topicDetails(topicId, timespan, filters, language),
      queryFn: () => fetchTopicDetails({ topicId, timespan, filters, language }),
      staleTime: 1000 * 60 * 5
    })
  }, [queryClient, timespan, filters, language])

  const handleTimespanChange = (newTimespan: Timespan) => {
    setTimespan(newTimespan)
  }

  const handleTopicClick = (labelId: string) => {
    // Enter Focus Mode: set focusedTopic and replace labels with just this one
    setFilters({ focusedTopic: labelId, labels: [labelId] })
    setShowSidebar(true)
  }

  const handleExitFocusMode = () => {
    // Exit Focus Mode: clear focusedTopic and labels
    setFilters({ focusedTopic: undefined, labels: [] })
  }

  const topics = trendingData?.topics || []
  const isFiltered = hasActiveFilters(filters)
  const isLoading = focusedTopicId ? topicLoading : trendingLoading
  const error = focusedTopicId ? topicError : trendingError

  // Trigger fade animation when data changes
  useEffect(() => {
    const currentDataKey = focusedTopicId
      ? topicData?.topic?.id
      : JSON.stringify(topics.map(t => t.id))
    if (prevDataRef.current !== null && prevDataRef.current !== currentDataKey) {
      setIsFading(true)
      const timer = setTimeout(() => setIsFading(false), 300)
      return () => clearTimeout(timer)
    }
    prevDataRef.current = currentDataKey as string
  }, [topics, topicData, focusedTopicId])

  // Render Focus Mode UI
  const renderFocusMode = () => {
    if (!topicData?.topic) {
      return (
        <p className='text-sm text-orange-700 dark:text-orange-300'>
          {t.topicNotFound || 'Topic not found'}
        </p>
      )
    }

    const { topic } = topicData
    const changePercent = topic.changePercent
    const isPositive = changePercent > 0
    const isNegative = changePercent < 0

    return (
      <div className={cn(
        'transition-opacity duration-300',
        isFading ? 'opacity-50' : 'opacity-100'
      )}>
        {/* Topic title */}
        <h3 className='mb-3 text-lg font-semibold text-orange-900 dark:text-orange-100'>
          {topic.text}
        </h3>

        {/* Enhanced interactive chart */}
        <div className='mb-3'>
          <DetailChart
            data={topic.sparkline}
            labels={topic.sparklineLabels}
            height={100}
            strokeColor='#ea580c'
            fillColor='#ea580c'
            className='w-full'
          />
        </div>

        {/* Stats row */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-3xl font-bold text-orange-900 dark:text-orange-100'>
              {topic.count.toLocaleString()}
            </span>
            <span className='text-xs text-orange-600 dark:text-orange-400'>
              {t.snippetsInPeriod || 'snippets'}
            </span>
          </div>

          {/* Change indicator */}
          {topicData.timespan !== 'all' && (
            <div className='flex flex-col items-end'>
              <div className={cn(
                'flex items-center gap-1 text-sm font-semibold',
                isPositive && 'text-green-600 dark:text-green-400',
                isNegative && 'text-red-600 dark:text-red-400',
                !isPositive && !isNegative && 'text-orange-600 dark:text-orange-400'
              )}>
                {isPositive && <TrendingUp className='h-4 w-4' />}
                {isNegative && <TrendingDown className='h-4 w-4' />}
                {!isPositive && !isNegative && <Minus className='h-4 w-4' />}
                <span>{isPositive ? '+' : ''}{changePercent}%</span>
              </div>
              <span className='text-xs text-orange-500 dark:text-orange-400'>
                {t.vsPreviousPeriod || 'vs previous period'}
              </span>
            </div>
          )}
        </div>

        {/* Filter indicator in Focus Mode */}
        {isFiltered && (
          <div className='mt-3 pt-3 border-t border-orange-200/50 dark:border-orange-700/50'>
            <FilterSummary filters={filters} label={t.trendingFiltered || 'Based on your filters:'} />
          </div>
        )}
      </div>
    )
  }

  // Render Discovery Mode UI (list of topics)
  const renderDiscoveryMode = () => {
    if (topics.length === 0) {
      return (
        <p className='text-sm text-orange-700 dark:text-orange-300'>
          {t.noTrendingTopics || 'No trending topics found'}
        </p>
      )
    }

    return (
      <div className={cn(
        'transition-opacity duration-300',
        isFading ? 'opacity-50' : 'opacity-100'
      )}>
        <div className='mb-1 flex justify-end pr-2'>
          <span className='text-[10px] uppercase tracking-wide text-orange-500/70 dark:text-orange-400/70'>
            snippets
          </span>
        </div>
        <div className={cn('grid gap-2', expanded ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1')}>
          {topics.map((topic, index) => (
            <button
              key={topic.id}
              onClick={() => handleTopicClick(topic.id)}
              onMouseEnter={() => prefetchTopicDetails(topic.id)}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-orange-200/50 dark:hover:bg-orange-800/50',
                expanded && index >= 5 && 'hidden lg:flex'
              )}>
              <span className='flex-1 truncate text-sm font-medium text-orange-900 dark:text-orange-100'>
                {topic.text}
              </span>
              <div className='flex items-center gap-2'>
                <Sparkline
                  data={topic.sparkline}
                  width={60}
                  height={20}
                  strokeColor='#ea580c'
                  fillColor='#ea580c'
                  strokeWidth={1.5}
                />
                <span className='min-w-[2.5rem] text-right text-xs font-semibold text-orange-600 dark:text-orange-400'>
                  {topic.count.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-800',
        className
      )}>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              {focusedTopicId ? (
                // Focus Mode header with back button
                <button
                  onClick={handleExitFocusMode}
                  className='flex items-center gap-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200'
                >
                  <ArrowLeft className='h-5 w-5' />
                  <span className='text-sm font-medium'>
                    {t.backToTrending || 'Back to trending'}
                  </span>
                </button>
              ) : (
                // Discovery Mode header
                <>
                  <TrendingUp className='h-5 w-5 text-orange-600 dark:text-orange-400' />
                  <h2 className='text-xl font-bold text-orange-900 dark:text-orange-100'>
                    {t.trendingTopics || 'Trending Topics'}
                  </h2>
                </>
              )}
            </div>
            {!focusedTopicId && (
              <div className='ml-7'>
                {isFiltered ? (
                  <FilterSummary filters={filters} label={t.trendingFiltered || 'Based on your filters:'} />
                ) : (
                  <span className='text-xs text-orange-500/70 dark:text-orange-400/60'>
                    {t.trendingAll || 'All snippets'}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {/* Timespan selector */}
            <div className='flex gap-1'>
              {TIMESPAN_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant='ghost'
                  size='sm'
                  onClick={() => handleTimespanChange(option.value)}
                  className={cn(
                    'h-7 px-2 text-xs font-medium',
                    timespan === option.value
                      ? 'bg-orange-200 text-orange-900 hover:bg-orange-200 dark:bg-orange-800 dark:text-orange-100'
                      : 'text-orange-700 hover:bg-orange-200/50 dark:text-orange-300'
                  )}>
                  {option.label}
                </Button>
              ))}
            </div>
            {/* Close button in Focus Mode */}
            {focusedTopicId && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleExitFocusMode}
                className='h-7 w-7 p-0 text-orange-600 hover:bg-orange-200/50 hover:text-orange-800 dark:text-orange-400'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='pb-4'>
        {isLoading ? (
          focusedTopicId ? <FocusModeSkeleton /> : <TopicSkeleton count={expanded ? 5 : 5} />
        ) : error ? (
          <p className='text-sm text-orange-700 dark:text-orange-300'>
            {focusedTopicId
              ? (t.errorLoadingTopic || 'Unable to load topic details')
              : (t.errorLoadingTrending || 'Unable to load trending topics')
            }
          </p>
        ) : focusedTopicId ? (
          renderFocusMode()
        ) : (
          renderDiscoveryMode()
        )}
      </CardContent>
    </Card>
  )
}
