import type React from 'react';
import { useState } from 'react'
import SearchBox from './SearchBox'
import FilterList from './FilterList'
import SortBy from './SortBy'

const SearchInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('')

  return (
    <div className='mx-auto max-w-3xl'>
      <div className='mb-4 flex flex-col gap-4'>
        <div className='flex gap-2'>
          <SearchBox value={searchQuery} onChange={setSearchQuery} />
          <button className='rounded bg-blue-500 px-4 py-2 text-white'>Share</button>
        </div>
      </div>
      <FilterList selectedFilters={selectedFilters} onFilterChange={setSelectedFilters} />
      <SortBy value={sortBy} onChange={setSortBy} />
    </div>
  )
}

export default SearchInterface
