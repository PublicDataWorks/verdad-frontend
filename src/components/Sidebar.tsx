import { X } from 'lucide-react'
import CountUp from 'react-countup'

import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import RoundedToggleButton from './RoundedToggleButton'
import PoliticalSpectrum from '@/components/ui/political-spectrum-slider'
import { useSidebar } from '@/providers/sidebar'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { useFilters } from '@/hooks/useFilterOptions'
import useSnippetFilters, { SnippetFilters } from '@/hooks/useSnippetFilters'
import { useSnippets } from '@/hooks/useSnippets'
import { useEffect, useRef } from 'react'
import { PAGE_SIZE } from '@/constants'
export default function Sidebar() {
  const { setShowSidebar } = useSidebar()
  const { filters, setFilter, clearAll, isEmpty } = useSnippetFilters()

  const {
    languages: selectedLanguages,
    states: selectedStates,
    sources: selectedSources,
    labeledBy: selectedLabeledBy,
    starredBy: selectedStarredBy,
    upvotedBy: selectedUpvotedBy,
    labels: selectedLabels,
    politicalSpectrum
  } = filters

  const { language } = useLanguage()
  const { data } = useFilters(language)

  const t = translations[language]

  const BY_OPTIONS = [
    { label: t.byMe, value: 'by_me' },
    { label: t.byOthers, value: 'by_others' }
  ]

  const { languages = [], states = [], sources = [], labels = { items: [] } } = data || {}

  const { data: snippetData, isLoading } = useSnippets({
    pageSize: PAGE_SIZE,
    filters,
    language,
    orderBy: filters.order_by || 'latest',
    searchTerm: filters.searchTerm || ''
  })

  const lastValueRef = useRef(0)

  useEffect(() => {
    if (!isLoading && snippetData?.pages[0].total_snippets !== undefined) {
      lastValueRef.current = snippetData.pages[0].total_snippets
    }
  }, [isLoading, snippetData])

  const handleClearAll = () => {
    clearAll()
  }

  const handleToggle = (category: keyof SnippetFilters, value: string) => {
    const currentSet = new Set(filters[category] || [])
    if (currentSet.has(value)) {
      currentSet.delete(value)
    } else {
      currentSet.add(value)
    }
    const newValues = Array.from(currentSet)
    setFilter(category, newValues)
  }

  const handlePoliticalSpectrumChange = (value: number) => {
    setFilter('politicalSpectrum', value)
  }

  return (
    <div className='hide-scrollbar bg-background-gray-lightest  fixed inset-0 z-50 h-[100svh] overflow-y-auto md:relative md:inset-auto  md:h-full md:w-80'>
      <div className='p-6'>
        <div className='mb-4 flex h-[24px] items-center justify-between'>
          <CountUp
            start={lastValueRef.current}
            end={isLoading ? lastValueRef.current : snippetData?.pages[0].total_snippets}
            duration={1.5}
            separator=','
            preserveValue={true}
            className='text-sm font-medium text-gray-600'
            formattingFn={n => {
              if (n >= 1000) {
                return `${(n / 1000).toFixed(1)}k snippets`
              }
              return `${n} ${n === 1 ? 'snippet' : 'snippets'}`
            }}
          />
          <div className='flex items-center gap-2'>
            {!isEmpty() && (
              <Button variant='ghost' onClick={handleClearAll} className='px-2 font-normal text-blue-600'>
                {t.reset}
              </Button>
            )}
            <Button variant='ghost' onClick={() => setShowSidebar(false)} className='md:hidden'>
              <X className='h-6 w-6' />
            </Button>
          </div>
        </div>

        <div>
          <h3 className='mb-2 mt-6 font-medium'>{t.sourceLanguage}</h3>
          <MultiSelect
            options={languages}
            onValueChange={values => setFilter('languages', values)}
            value={selectedLanguages}
            placeholder={t.selectLanguages}
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>{t.state}</h3>
          <MultiSelect
            options={states}
            onValueChange={values => setFilter('states', values)}
            value={selectedStates}
            placeholder={t.selectStates}
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>{t.source}</h3>
          <MultiSelect
            options={sources}
            onValueChange={values => setFilter('sources', values)}
            value={selectedSources}
            placeholder={t.selectSources}
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>{t.label}</h3>
          <MultiSelect
            options={labels.items}
            onValueChange={values => setFilter('labels', values)}
            value={selectedLabels}
            placeholder={t.selectLabels}
            maxCount={3}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>{t.politicalSpectrum}</h3>
          <PoliticalSpectrum value={politicalSpectrum} onChange={handlePoliticalSpectrumChange} />
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>{t.labeled}</h3>
        <div className='flex flex-wrap gap-2'>
          {BY_OPTIONS.map(option => (
            <RoundedToggleButton
              key={`labelled-${option.value}`}
              label={option.label}
              isActive={selectedLabeledBy.includes(option.value)}
              onClick={() => handleToggle('labeledBy', option.value)}
            />
          ))}
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>{t.starred}</h3>
        <div className='flex flex-wrap gap-2'>
          {BY_OPTIONS.map(option => (
            <RoundedToggleButton
              key={`starred-${option.value}`}
              label={option.label}
              isActive={selectedStarredBy.includes(option.value)}
              onClick={() => handleToggle('starredBy', option.value)}
            />
          ))}
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>{t.upvoted}</h3>
        <div className='flex flex-wrap gap-2'>
          {BY_OPTIONS.map(option => (
            <RoundedToggleButton
              key={`upvoted-${option.value}`}
              label={option.label}
              isActive={selectedUpvotedBy.includes(option.value)}
              onClick={() => handleToggle('upvotedBy', option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
