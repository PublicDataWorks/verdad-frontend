import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from '@/types/snippet'
import supabase from '@/lib/supabase'
import { useLabels } from '@/hooks/useLabels'
import { useQueryClient } from '@tanstack/react-query'

interface AddLabelButtonProps {
  snippetId: string
  onLabelAdded: (newLabels: Label[] | ((prevLabels: Label[]) => Label[])) => void
}

const AddLabelButton: React.FC<AddLabelButtonProps> = ({ snippetId, onLabelAdded }) => {
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: allLabels } = useLabels()
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsInputVisible(false)
        setInputValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const createLabel = async (labelText: string) => {
    const newLabel: Label = {
      id: Date.now().toString(),
      text: labelText,
      upvote_count: 1,
      upvoted_by_me: true
    }

    // Optimistic update - add the new label to the existing list
    onLabelAdded(prevLabels => [...prevLabels, newLabel])

    try {
      const { data, error } = await supabase.rpc('create_apply_and_upvote_label', {
        snippet_id: snippetId,
        label_text: labelText
      })

      if (error) throw error

      // Replace entire label list with server response
      if (data && data.labels) {
        onLabelAdded(data.labels)
      }

      // Invalidate all snippets lists to refresh data
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'snippets' && query.queryKey[1] === 'list'
      })
    } catch (error) {
      console.error('Error creating label:', error)
      // Remove the optimistically added label if there's an error
      onLabelAdded(prevLabels => prevLabels.filter(label => label.id !== newLabel.id))
    }

    setIsInputVisible(false)
    setInputValue('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value.length > 0) {
      const filteredSuggestions = allLabels
        .filter(label => label.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10)
      setSuggestions(filteredSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      createLabel(inputValue)
    }
  }

  return (
    <div className='relative' onClick={e => e.stopPropagation()}>
      {!isInputVisible ? (
        <Button variant='outline' size='icon' className='h-8 w-8 rounded-full' onClick={() => setIsInputVisible(true)}>
          +
        </Button>
      ) : (
        <div className='w-48' ref={inputRef}>
          <Input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder='Type to add label...'
            className='w-full'
            autoFocus
          />
          {suggestions.length > 0 && (
            <ul className='absolute z-10 mt-1 max-h-32 w-full overflow-y-auto rounded-md border border-border-gray-dark bg-background-gray-lightest shadow-lg'>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className='cursor-pointer px-2 py-1 hover:bg-background-gray-light'
                  onClick={() => createLabel(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default AddLabelButton
