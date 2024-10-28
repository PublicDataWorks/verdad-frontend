'use client'

import { X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import RoundedToggleButton from './RoundedToggleButton'
import { useFilter } from '@/providers/filter'

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'english' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'French', value: 'french' }
]

const STATE_OPTIONS = [
  { label: 'California', value: 'california' },
  { label: 'New York', value: 'new-york' },
  { label: 'Texas', value: 'texas' }
]

const SOURCE_OPTIONS = [
  { label: 'Source 1', value: 'source-1' },
  { label: 'Source 2', value: 'source-2' },
  { label: 'Source 3', value: 'source-3' }
]

const STARRED = ['by Me', 'by Others']
const LABELS = ['Important', 'Urgent', 'Review']

export default function Sidebar() {
  const {
    setShowSidebar,
    languages,
    setLanguages,
    states,
    setStates,
    sources,
    setSources,
    labeledBy,
    starredByFilter,
    labels,
    clearAll,
    setLabeledBy,
    setStarredByFilter,
    setLabels
  } = useFilter()

  const handleLabeledToggle = (labelled: string) => {
    setLabeledBy(prev => (prev.includes(labelled) ? prev.filter(item => item !== labelled) : [...prev, labelled]))
  }

  const handleStarredToggle = (starred: string) => {
    setStarredByFilter(prev => (prev.includes(starred) ? prev.filter(item => item !== starred) : [...prev, starred]))
  }

  const handleLabelToggle = (label: string) => {
    setLabels(prev => (prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]))
  }

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-white md:relative md:inset-auto md:h-screen md:w-80'>
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Filters</h2>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={clearAll} className='px-2 font-normal text-blue-600'>
              Clear all <X className='ml-2 h-4 w-4' aria-hidden='true' />
            </Button>
            <Button variant='ghost' onClick={() => setShowSidebar(false)} className='md:hidden'>
              <X className='h-6 w-6' />
            </Button>
          </div>
        </div>

        <div>
          <h3 className='mb-2 mt-6 font-medium'>Source Language</h3>
          <MultiSelect
            options={LANGUAGE_OPTIONS}
            onValueChange={setLanguages}
            defaultValue={languages}
            placeholder='Select languages'
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>State</h3>
          <MultiSelect
            options={STATE_OPTIONS}
            onValueChange={setStates}
            defaultValue={states}
            placeholder='Select states'
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>Source</h3>
          <MultiSelect
            options={SOURCE_OPTIONS}
            onValueChange={setSources}
            defaultValue={sources}
            placeholder='Select sources'
            maxCount={2}
            className='w-full'
          />
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Labeled</h3>
        <div className='flex flex-wrap gap-2'>
          {STARRED.map(labelled => (
            <RoundedToggleButton
              key={`labelled-${labelled}`}
              label={labelled}
              isActive={labeledBy.includes(labelled)}
              onClick={() => handleLabeledToggle(labelled)}
            />
          ))}
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Starred</h3>
        <div className='flex flex-wrap gap-2'>
          {STARRED.map(starred => (
            <RoundedToggleButton
              key={`starred-${starred}`}
              label={starred}
              isActive={starredByFilter.includes(starred)}
              onClick={() => handleStarredToggle(starred)}
            />
          ))}
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Label</h3>
        <div className='flex flex-wrap gap-2'>
          {LABELS.map(label => (
            <RoundedToggleButton
              key={`label-${label}`}
              label={label}
              isActive={labels.includes(label)}
              onClick={() => handleLabelToggle(label)}
            />
          ))}
        </div>
        <Button variant='link' className='mt-4 p-0 font-normal text-blue-600'>
          Show more <ChevronDown className='ml-2 h-4 w-4' aria-hidden='true' />
        </Button>
      </div>
    </div>
  )
}
