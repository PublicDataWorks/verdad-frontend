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
  { label: 'Texas', value: 'texas' },
  { label: 'Arizona', value: 'arizona' },
  { label: 'Nevada', value: 'nevada' },
  { label: 'Wisconsin', value: 'wisconsin' },
  { label: 'Pennsylvania', value: 'pennsylvania' },
  { label: 'Georgia', value: 'georgia' },
  { label: 'Florida', value: 'florida' },
  { label: 'Michigan', value: 'michigan' }
]

const SOURCE_OPTIONS = [
  { label: 'KNOG-FM 91.7 MHz', value: '91.7' },
  { label: 'KZLZ-FM 105.3 MHz', value: '105.3' },
  { label: 'KISF-FM 103.5 MHz', value: '103.5' },
  { label: 'WLMV-AM 1480 kHz', value: '1480' },
  { label: 'WLCH-FM 91.3 MHz', value: '91.3' },
  { label: 'WUMR-FM 106.1 MHz', value: '106.1' },
  { label: 'WLEL-FM 94.3 MHz', value: '94.3' },
  { label: 'WPHE-AM 690 kHz', value: '690' },
  { label: 'WAXY-AM 790 kHz', value: '790' }
]

const BY_OPTIONS = [
  { label: 'by Me', value: 'by Me' },
  { label: 'by Others', value: 'by Others' }
]

const LABELS = [
  { label: 'Important', value: 'Important' },
  { label: 'Urgent', value: 'Urgent' },
  { label: 'Review', value: 'Review' }
]

export default function Sidebar() {
  const { setShowSidebar, filters, setFilter, clearAll } = useFilter()

  const languages = filters.languages || []
  const states = filters.states || []
  const sources = filters.sources || []
  const labeledBy = filters.labeledBy || []
  const starredBy = filters.starredBy || []
  const labels = filters.labels || []

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

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-white md:relative md:inset-auto md:w-80'>
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Filters</h2>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={handleClearAll} className='px-2 font-normal text-blue-600'>
              Reset
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
            onValueChange={values => setFilter('languages', values)}
            value={languages}
            placeholder='Select languages'
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>State</h3>
          <MultiSelect
            options={STATE_OPTIONS}
            onValueChange={values => setFilter('states', values)}
            value={states}
            placeholder='Select states'
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>Source</h3>
          <MultiSelect
            options={SOURCE_OPTIONS}
            onValueChange={values => setFilter('sources', values)}
            value={sources}
            placeholder='Select sources'
            maxCount={2}
            className='w-full'
          />
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Labeled</h3>
        <div className='flex flex-wrap gap-2'>
          {BY_OPTIONS.map(labelled => (
            <RoundedToggleButton
              key={`labelled-${labelled}`}
              label={labelled.label}
              isActive={labeledBy.includes(labelled.value)}
              onClick={() => handleToggle('labeledBy', labelled.value)}
            />
          ))}
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Starred</h3>
        <div className='flex flex-wrap gap-2'>
          {BY_OPTIONS.map(starred => (
            <RoundedToggleButton
              key={`starred-${starred}`}
              label={starred.label}
              isActive={starredBy.includes(starred.value)}
              onClick={() => handleToggle('starredBy', starred.value)}
            />
          ))}
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Label</h3>
        <div className='flex flex-wrap gap-2'>
          {LABELS.map(label => (
            <RoundedToggleButton
              key={`label-${label}`}
              label={label.label}
              isActive={labels.includes(label.label)}
              onClick={() => handleToggle('labels', label.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
