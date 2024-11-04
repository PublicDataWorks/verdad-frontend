'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import RoundedToggleButton from './RoundedToggleButton'
import PoliticalSpectrum from '@/components/ui/political-spectrum-slider'
import { useFilter } from '@/providers/filter'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { useFilters } from '@/hooks/useFilterOptions'

export default function Sidebar() {
  const { setShowSidebar, filters, setFilter, clearAll } = useFilter()
  const { language } = useLanguage()
  const { data } = useFilters(language)

  const t = translations[language]

  const {
    languages: selectedLanguages = [],
    states: selectedStates = [],
    sources: selectedSources = [],
    labeledBy: selectedLabeledBy = [],
    starredBy: selectedStarredBy = [],
    labels: selectedLabels = [],
    politicalSpectrum = 0
  } = filters

  const BY_OPTIONS = [
    { label: t.byMe, value: 'by_me' },
    { label: t.byOthers, value: 'by_others' }
  ]

  const { languages = [], states = [], sources = [], labels = { items: [] } } = data || {}

  const handleClearAll = () => {
    clearAll()
  }

  const handleToggle = (category: string, value: string) => {
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
    <div className='fixed inset-0 z-50 overflow-y-auto bg-white md:relative md:inset-auto md:w-80'>
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>{t.filters}</h2>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={handleClearAll} className='px-2 font-normal text-blue-600'>
              {t.reset}
            </Button>
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
      </div>
    </div>
  )
}
