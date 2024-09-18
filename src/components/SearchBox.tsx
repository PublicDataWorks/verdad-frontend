import type React from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange }) => (
    <input
      type='text'
      className='flex-grow rounded border border-gray-300 px-3 py-2 text-lg'
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder='Search...'
    />
  )

export default SearchBox
