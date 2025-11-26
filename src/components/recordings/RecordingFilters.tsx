import { X, Star, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'hide-scrollbar bg-background-gray-lightest fixed inset-0 z-50 h-screen overflow-y-auto lg:relative lg:inset-auto lg:h-full lg:w-80',
          'transform transition-transform duration-200 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex h-[24px] items-center justify-between">
            <p className="text-text-primary text-sm font-medium">
              {totalCount !== undefined && totalCount > 0 ? (
                loadedCount !== undefined && loadedCount < totalCount ? (
                  <>
                    {loadedCount.toLocaleString()} of {totalCount.toLocaleString()} recordings
                  </>
                ) : (
                  <>{totalCount.toLocaleString()} recordings</>
                )
              ) : (
                'Recordings'
              )}
            </p>
            <div className="flex items-center gap-2">
              {!isEmpty() && (
                <Button variant="ghost" onClick={clearAll} className="px-2 font-normal text-text-blue">
                  Reset
                </Button>
              )}
              <Button variant="ghost" onClick={onClose} className="lg:hidden">
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-6">
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
                    {filterOptions?.states
                      .filter(state => state && state.trim() !== '')
                      .map(state => (
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
                    {filterOptions?.radio_stations
                      .filter(station => station.name && station.name.trim() !== '')
                      .map(station => (
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
                    {filterOptions?.languages
                      .filter(lang => lang && lang.trim() !== '')
                      .map(lang => (
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
                    {filterOptions?.labels
                      .filter(label => label.text && label.text.trim() !== '')
                      .slice(0, 50)
                      .map(label => (
                        <SelectItem key={label.id} value={label.text}>
                          {label.text}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
          </div>
        </div>
      </aside>
    </>
  )
}
