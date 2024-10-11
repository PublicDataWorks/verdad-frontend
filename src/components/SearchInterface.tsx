import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import xor from 'lodash/xor'
import includes from 'lodash/includes'
import without from 'lodash/without'
import isEqual from 'lodash/isEqual'

import { useSnippets } from 'hooks/useSnippets'
import { Button } from 'components/ui/button'
import { X, Filter, ChevronDown } from 'lucide-react'
import MultiSelectDropdown from 'components/MultiSelectDropdown'
import RoundedToggleButton from 'components/RoundedToggleButton'
import SingleSelectDropdown from './SingleSelectDropdown'
import SnippetCard from './SnippetCard'

interface Source {
  id: number;
  radio_code: string;
  name: string;
  type: string;
  channel: string;
  state: string;
  human_upvotes: number;
}

const RADIO_STATIONS = ['All sources', 'KZZZ-123', 'WXYZ-456', 'ABCD-789', 'EFGH-012', 'IJKL-345']
const LANGUAGES = ['All languages', 'Spanish', 'Arabic']
const STATES = ['All States', 'Arizona', 'Florida', 'Georgia', 'Michigan', 'Nevada', 'Pennsylvania']
const STARRED = ['by Me', 'by Others']
const STARRED_BY_RESULTS = ['Starred by Me', 'Starred by Others']
const LABELS = ['Human Right', 'Woman Right', 'Equality', 'Label xxx', 'Label xyz']
const SORTED_BY = ['Most Recent', 'Oldest', 'Most Popular']

const SearchInterface: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true)
  const [sources, setSources] = useState<string[]>([RADIO_STATIONS[0]])
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
  const { snippets } = useSnippets()

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
      const newSelection = includes(prev, item)
        ? without(prev, item)
        : [...prev, item]
      if (isEqual(newSelection.sort(), otherOptions.sort())) {
        return allOptionsArray
      }
      return newSelection
    })
  }

  const clearAll = () => {
    setSources([RADIO_STATIONS[0]])
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
    <div className="flex flex-grow overflow-hidden">
      {showSidebar && <div className="w-1/6 overflow-y-auto px-6 pt-2 bg-white">
        <div className="flex justify-end">
          <Button variant="ghost" onClick={clearAll} className="text-text-blue font-normal px-2">
            Clear all <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div>
          <h3 className="font-medium mt-6 mb-2">Source Language</h3>
          <MultiSelectDropdown
            selectedItems={languages}
            items={LANGUAGES}
            onItemToggle={(language: string) => handleMultiSelect(setLanguages, LANGUAGES, language)}
            placeholder="Select languages"
            allItemsLabel={LANGUAGES[0]}
          />

          <h3 className="font-medium mt-6 mb-2">State</h3>
          <MultiSelectDropdown
            selectedItems={states}
            items={STATES}
            onItemToggle={(state: string) => handleMultiSelect(setStates, STATES, state)}
            placeholder="Select states"
            allItemsLabel={STATES[0]}
          />

          <h3 className="font-medium mt-6 mb-2">Source</h3>
          <MultiSelectDropdown
            selectedItems={sources}
            items={RADIO_STATIONS}
            onItemToggle={(source: string) => handleMultiSelect(setSources, RADIO_STATIONS, source)}
            placeholder="Select languages"
            allItemsLabel={RADIO_STATIONS[0]}
          />
        </div>

        <h3 className="font-semibold mt-6 mb-2">Labeled</h3>
        <div className="flex flex-wrap gap-2">
          {STARRED.map(labelled => (
            <RoundedToggleButton
              key={`labelled-${labelled}`}
              label={labelled}
              isActive={labeledBy.includes(labelled)}
              onClick={() => setLabeledBy(prev => xor(prev, [labelled]))}
            />
          ))}
        </div>

        <h3 className="font-semibold mt-6 mb-2">Starred</h3>
        <div className="flex flex-wrap gap-2">
          {STARRED.map(starred => (
            <RoundedToggleButton
              key={`starred-${starred}`}
              label={starred}
              isActive={starredByFilter.includes(starred)}
              onClick={() => setStarredByFilter(prev => xor(prev, [starred]))}
            />
          ))}
        </div>

        <h3 className="font-semibold mt-6 mb-2">Label</h3>
        <div className="flex flex-wrap gap-2">
          {LABELS.map((label) => (
            <RoundedToggleButton
              key={`label-${label}`}
              label={label}
              isActive={labels.includes(label)}
              onClick={() => setLabels(prev => xor(prev, [label]))}
            />
          ))}
        </div>
        <Button variant="link" className="p-0 text-text-blue mt-4 font-normal">
          Show more <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>}
      <div className={`${showSidebar ? 'px-16' : 'px-56'} w-full flex flex-col overflow-hidden`}>
        <div className="flex justify-between items-center px-4 mb-6 pt-2">
          <div className="flex space-x-2">
            <RoundedToggleButton
              label="Filter"
              isActive={showSidebar}
              onClick={() => setShowSidebar(!showSidebar)}
              icon={<Filter className="mr-2 h-4 w-4" />}
            />
            {STARRED_BY_RESULTS.map((starred) => (
              <RoundedToggleButton
                key={`result-${starred}`}
                label={starred}
                isActive={starredByFilter.includes(starred)}
                onClick={() => setStarredByFilter(prev => xor(prev, [starred]))}
              />
            ))}
          </div>
          <div className="w-52">
            <SingleSelectDropdown
              selectedItem={sortedBy}
              items={SORTED_BY}
              onItemSelect={i => setSortedBy(i)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-grow mx-4">
          {snippets.map(snippet => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onSnippetClick={handleSnippetClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchInterface
