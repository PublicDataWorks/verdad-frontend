'use client'

import React from 'react'
import { X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MultiSelectDropdown from './MultiSelectDropdown'
import RoundedToggleButton from './RoundedToggleButton'
import { useFilter } from '@/providers/filter'

// Assuming these constants are defined elsewhere in your project
const LANGUAGES = ['All Languages', 'English', 'Spanish', 'French']
const STATES = ['All States', 'California', 'New York', 'Texas']
const STARRED = ['John', 'Jane', 'Bob']
const LABELS = ['Important', 'Urgent', 'Review']

export default function Sidebar() {
  const {
    showSidebar,
    setShowSidebar,
    languages,
    states,
    labeledBy,
    starredByFilter,
    labels,
    handleMultiSelect,
    clearAll,
    setLabeledBy,
    setStarredByFilter,
    setLabels
  } = useFilter()

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-white md:relative md:inset-auto md:h-screen md:w-80'>
      <div className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Filters</h2>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={clearAll} className='px-2 font-normal text-blue-600'>
              Clear all <X className='ml-2 h-4 w-4' aria-hidden='true' />
              <span className='sr-only'>Clear all filters</span>
            </Button>
            <Button
              variant='ghost'
              onClick={() => setShowSidebar(false)}
              className='md:hidden'
              aria-label='Close sidebar'>
              <X className='h-6 w-6' />
            </Button>
          </div>
        </div>
        <div>
          <h3 className='mb-2 mt-6 font-medium'>Source Language</h3>
          <MultiSelectDropdown
            selectedItems={languages}
            items={LANGUAGES}
            onItemToggle={(language: string) => handleMultiSelect(setLanguages, LANGUAGES, language)}
            placeholder='Select languages'
            allItemsLabel={LANGUAGES[0]}
          />

          <h3 className='mb-2 mt-6 font-medium'>State</h3>
          <MultiSelectDropdown
            selectedItems={states}
            items={STATES}
            onItemToggle={(state: string) => handleMultiSelect(setStates, STATES, state)}
            placeholder='Select states'
            allItemsLabel={STATES[0]}
          />

          <h3 className='mb-2 mt-6 font-medium'>Source</h3>
        </div>

        <h3 className='mb-2 mt-6 font-semibold'>Labeled</h3>
        <div className='flex flex-wrap gap-2'>
          {STARRED.map(labelled => (
            <RoundedToggleButton
              key={`labelled-${labelled}`}
              label={labelled}
              isActive={labeledBy.includes(labelled)}
              onClick={() =>
                setLabeledBy(prev =>
                  prev.includes(labelled) ? prev.filter(item => item !== labelled) : [...prev, labelled]
                )
              }
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
              onClick={() =>
                setStarredByFilter(prev =>
                  prev.includes(starred) ? prev.filter(item => item !== starred) : [...prev, starred]
                )
              }
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
              onClick={() =>
                setLabels(prev => (prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]))
              }
            />
          ))}
        </div>
        <Button variant='link' className='mt-4 p-0 font-normal text-blue-600'>
          Show more <ChevronDown className='ml-2 h-4 w-4' aria-hidden='true' />
          <span className='sr-only'>Show more labels</span>
        </Button>
      </div>
    </div>
  )
}
