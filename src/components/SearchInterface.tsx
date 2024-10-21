import type React from 'react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import xor from 'lodash/xor'
import includes from 'lodash/includes'
import without from 'lodash/without'
import isEqual from 'lodash/isEqual'

import { useSnippets } from '../hooks/useSnippets'
import { Button } from './ui/button'
import { X, Filter, ChevronDown } from 'lucide-react'
import MultiSelectDropdown from './MultiSelectDropdown'
import RoundedToggleButton from './RoundedToggleButton'
import SingleSelectDropdown from './SingleSelectDropdown'
import SnippetCard from './SnippetCard'

const LANGUAGES = ['All languages', 'Spanish', 'Arabic']
const STATES = ['All States', 'Arizona', 'Florida', 'Georgia', 'Michigan', 'Nevada', 'Pennsylvania']
const STARRED = ['by Me', 'by Others']
const STARRED_BY_RESULTS = ['Starred by Me', 'Starred by Others']
const LABELS = ['Human Right', 'Woman Right', 'Equality', 'Label xxx', 'Label xyz']
const SORTED_BY = ['Most Recent', 'Oldest', 'Most Popular']

const SearchInterface: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true)
  const [languages, setLanguages] = useState([LANGUAGES[0]])
  const [states, setStates] = useState([STATES[0]])
  const [labeledBy, setLabeledBy] = useState<string[]>([])
  const [starredByFilter, setStarredByFilter] = useState<string[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [sortedBy, setSortedBy] = useState(SORTED_BY[0])
  const [starredByResult, setStarredByResult] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const navigate = useNavigate()
  const { snippets: unsortedSnippets, loading, sortSnippets } = useSnippets()
  const snippets = useMemo(() => sortSnippets(unsortedSnippets, sortedBy), [unsortedSnippets, sortedBy, sortSnippets])

  const handleMultiSelect = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    allOptionsArray: string[],
    item: string
  ) => {
    setter(prev => {
      const [allLabel, ...otherOptions] = allOptionsArray
      if (item === allLabel) {
        return includes(prev, allLabel) ? [] : allOptionsArray
      }
      if (includes(prev, allLabel)) {
        return [item]
      }
      const newSelection = includes(prev, item) ? without(prev, item) : [...prev, item]
      if (isEqual(newSelection.sort(), otherOptions.sort())) {
        return allOptionsArray
      }
      return newSelection
    })
  }

  const clearAll = () => {
    setLanguages([LANGUAGES[0]])
    setStates([STATES[0]])
    setLabeledBy([])
    setStarredByFilter([])
    setLabels([])
    setSortedBy(SORTED_BY[0])
    setStarredByResult([])
    setSearchQuery('')
    setSelectedFilters([])
  }

  const handleSnippetClick = (snippetId: number) => {
    navigate(`/snippet/${snippetId}`)
  }

  return (
    <div className='flex flex-grow overflow-hidden'>
      {showSidebar && (
        <div className='w-1/6 overflow-y-auto bg-white px-6 pt-2'>
          <div className='flex justify-end'>
            <Button variant='ghost' onClick={clearAll} className='px-2 font-normal text-text-blue'>
              Clear all <X className='ml-2 h-4 w-4' />
            </Button>
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
                onClick={() => setLabeledBy(prev => xor(prev, [labelled]))}
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
                onClick={() => setStarredByFilter(prev => xor(prev, [starred]))}
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
                onClick={() => setLabels(prev => xor(prev, [label]))}
              />
            ))}
          </div>
          <Button variant='link' className='mt-4 p-0 font-normal text-text-blue'>
            Show more <ChevronDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )}
      <div className={`${showSidebar ? 'px-16' : 'px-56'} flex w-full flex-col overflow-hidden`}>
        <div className='mb-6 flex items-center justify-between px-4 pt-2'>
          <div className='flex space-x-2'>
            <RoundedToggleButton
              label='Filter'
              isActive={showSidebar}
              onClick={() => setShowSidebar(!showSidebar)}
              icon={<Filter className='mr-2 h-4 w-4' />}
            />
            {STARRED_BY_RESULTS.map(starred => (
              <RoundedToggleButton
                key={`result-${starred}`}
                label={starred}
                isActive={starredByFilter.includes(starred)}
                onClick={() => setStarredByFilter(prev => xor(prev, [starred]))}
              />
            ))}
          </div>
          <div className='w-52'>
            <SingleSelectDropdown selectedItem={sortedBy} items={SORTED_BY} onItemSelect={setSortedBy} />
          </div>
        </div>
        <div className='mx-4 flex-grow overflow-y-auto'>
          {snippets.map(snippet => (
            <SnippetCard key={snippet.id} snippet={snippet} onSnippetClick={handleSnippetClick} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchInterface
