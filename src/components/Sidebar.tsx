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

const STARRED = ['by Me', 'by Others']
const LABELS = ['Important', 'Urgent', 'Review']

export default function Sidebar() {
  const {
    setShowSidebar,
    languages,
    states,
    sources,
    labeledBy,
    starredByFilter,
    labels,
    setLanguages,
    setStates,
    setSources,
    setLabeledBy,
    setStarredByFilter,
    setLabels,
    clearAll
  } = useFilter()

  const handleClearAll = () => {
    // First call the context's clearAll
    clearAll()

    // Then explicitly set all values to empty arrays
    setLanguages([])
    setStates([])
    setSources([])
    setLabeledBy([])
    setStarredByFilter([])
    setLabels([])
  }

  const handleLabeledToggle = (labelled: string) => {
    const newLabeledBy = labeledBy.includes(labelled)
      ? labeledBy.filter(item => item !== labelled)
      : [...labeledBy, labelled]
    setLabeledBy(newLabeledBy)
  }

  const handleStarredToggle = (starred: string) => {
    const newStarredBy = starredByFilter.includes(starred)
      ? starredByFilter.filter(item => item !== starred)
      : [...starredByFilter, starred]
    setStarredByFilter(newStarredBy)
  }

  const handleLabelToggle = (label: string) => {
    const newLabels = labels.includes(label) ? labels.filter(item => item !== label) : [...labels, label]
    setLabels(newLabels)
  }

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-white md:relative md:inset-auto md:h-screen md:w-80'>
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Filters</h2>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={handleClearAll} className='px-2 font-normal text-blue-600'>
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
            value={languages}
            placeholder='Select languages'
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>State</h3>
          <MultiSelect
            options={STATE_OPTIONS}
            onValueChange={setStates}
            value={states}
            placeholder='Select states'
            maxCount={2}
            className='w-full'
          />

          <h3 className='mb-2 mt-6 font-medium'>Source</h3>
          <MultiSelect
            options={SOURCE_OPTIONS}
            onValueChange={setSources}
            value={sources}
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
