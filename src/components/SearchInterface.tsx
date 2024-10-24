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
import ResponsiveSidebar from './Sidebar'
import supabase from '../lib/supabase'

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
      {showSidebar && <ResponsiveSidebar />}
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
