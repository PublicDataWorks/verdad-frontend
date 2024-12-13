import type React from 'react'

import PropTypes from 'prop-types'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface MultiSelectDropdownProps {
  selectedItems: string[]
  items: string[]
  onItemToggle: (item: string) => void
  placeholder?: string
  allItemsLabel: string
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  selectedItems,
  items,
  onItemToggle,
  placeholder,
  allItemsLabel
}) => {
  const allSelected = selectedItems.includes(allItemsLabel)

  let displayValue: string
  if (allSelected) {
    displayValue = allItemsLabel
  } else if (selectedItems.length === 1) {
    displayValue = selectedItems[0]
  } else if (selectedItems.length > 1) {
    displayValue = `${selectedItems.length} selected`
  } else {
    displayValue = placeholder ?? 'Select items'
  }

  const handleItemClick = (item: string, event: Event) => {
    event.preventDefault()
    onItemToggle(item)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-between'
          aria-label={`Select ${allItemsLabel.toLowerCase()}`}>
          <span className='font-normal text-dropdown-text'> {displayValue} </span>
          <ChevronDown className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-full'>
        <DropdownMenuItem
          onSelect={e => handleItemClick(allItemsLabel, e)}
          className={allSelected ? 'bg-background-gray-lightest' : ''}>
          {allItemsLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {items
          .filter(item => item !== allItemsLabel)
          .map(item => (
            <DropdownMenuItem
              key={item}
              onSelect={e => handleItemClick(item, e)}
              className={selectedItems.includes(item) ? 'bg-background-gray-lightest' : ''}>
              {item}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

MultiSelectDropdown.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  items: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onItemToggle: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  allItemsLabel: PropTypes.string.isRequired
}

export default MultiSelectDropdown
