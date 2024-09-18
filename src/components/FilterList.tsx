import type React from 'react'

const filters = [
  'sources',
  'labels',
  'snippets with zero upvoted labels',
  'snippets with an @mention of me',
  'snippets that were labeled by me',
  'snippets that were starred by me',
  'snippets that were labeled by my team',
  'snippets that were starred by my team'
]

interface FilterListProps {
  selectedFilters: string[]
  onFilterChange: (filters: string[]) => void
}

const FilterList: React.FC<FilterListProps> = ({ selectedFilters, onFilterChange }) => {
  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter(f => f !== filter))
    } else {
      onFilterChange([...selectedFilters, filter])
    }
  }

  return (
    <div className='mb-4'>
      <h3 className='mb-2 text-lg font-semibold'>Filters:</h3>
      {filters.map(filter => (
        <button
          key={filter}
          className={`mb-2 mr-2 rounded border px-3 py-1 text-sm ${
            selectedFilters.includes(filter) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => toggleFilter(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}

export default FilterList
