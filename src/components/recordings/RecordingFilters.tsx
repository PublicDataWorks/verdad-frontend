import { X, RotateCcw, Star, Tag, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRecordingFilterOptions } from '@/hooks/useRecordings'
import useRecordingFilters from '@/hooks/useRecordingFilters'
import { cn } from '@/lib/utils'

interface RecordingFiltersProps {
  isOpen: boolean
  onClose: () => void
  totalCount?: number
  loadedCount?: number
}

export default function RecordingFilters({ isOpen, onClose, totalCount, loadedCount }: RecordingFiltersProps) {
  const { data: filterOptions, isLoading: optionsLoading } = useRecordingFilterOptions()
  const { filters, setFilter, clearAll, isEmpty } = useRecordingFilters()

  const hasSnippetsOptions = [
    { value: 'all', label: 'All Recordings' },
    { value: 'with', label: 'With Snippets' },
    { value: 'without', label: 'Without Snippets' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-200 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 className="font-semibold">Filters</h2>
            </div>
            <div className="flex items-center gap-2">
              {!isEmpty() && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Recording count */}
          {totalCount !== undefined && totalCount > 0 && (
            <div className="px-4 py-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {loadedCount !== undefined && loadedCount < totalCount ? (
                  <>
                    Showing <span className="font-semibold text-foreground">{loadedCount.toLocaleString()}</span> of{' '}
                    <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> recordings
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> recordings
                  </>
                )}
              </p>
            </div>
          )}

          {/* Filters */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Has Snippets Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Snippet Status
                </Label>
                <Select
                  value={filters.has_snippets || 'all'}
                  onValueChange={value => setFilter('has_snippets', value as 'all' | 'with' | 'without')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Recordings" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasSnippetsOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Starred Filter */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4" />
                  Starred Only
                </Label>
                <Switch
                  checked={filters.starred || false}
                  onCheckedChange={checked => setFilter('starred', checked || undefined)}
                />
              </div>

              <Separator />

              {/* State Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">State / Region</Label>
                <Select
                  value={filters.state || 'all'}
                  onValueChange={value => setFilter('state', value === 'all' ? undefined : value)}
                  disabled={optionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {filterOptions?.states.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Radio Station Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Radio Station</Label>
                <Select
                  value={filters.radio_station || 'all'}
                  onValueChange={value => setFilter('radio_station', value === 'all' ? undefined : value)}
                  disabled={optionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {filterOptions?.radio_stations.map(station => (
                      <SelectItem key={station.code} value={station.name}>
                        {station.name} ({station.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <Select
                  value={filters.language || 'all'}
                  onValueChange={value => setFilter('language', value === 'all' ? undefined : value)}
                  disabled={optionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {filterOptions?.languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Label Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Snippet Label</Label>
                <Select
                  value={filters.label || 'all'}
                  onValueChange={value => setFilter('label', value === 'all' ? undefined : value)}
                  disabled={optionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Labels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labels</SelectItem>
                    {filterOptions?.labels.slice(0, 50).map(label => (
                      <SelectItem key={label.id} value={label.text}>
                        {label.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  )
}
