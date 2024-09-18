import type React from 'react'

const sortOptions = ['date-time of original broadcast', 'date-time of last comment', '# of upvotes', '# of comments']

interface SortByProps {
  value: string
  onChange: (value: string) => void
}

const SortBy: React.FC<SortByProps> = ({ value, onChange }) => (
    <div className='flex justify-end'>
      <div className='w-48'>
        <label htmlFor='sort-select' className='sr-only'>
          Sort by
        </label>
        <select
          id='sort-select'
          className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value=''>Sort by...</option>
          {sortOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

export default SortBy
