'use client'

import { useState } from 'react'
import { MinusCircle, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useHideSnippet, useUnhideSnippet } from '@/hooks/useSnippetActions'

interface SnippetVisibilityToggleProps {
  snippetId: string
  isHidden: boolean | null
}

export default function SnippetVisibilityToggle({ snippetId, isHidden = false }: SnippetVisibilityToggleProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const hideSnippetMutation = useHideSnippet()
  const unhideSnippetMutation = useUnhideSnippet()

  const handleToggleHide = () => {
    if (isHidden) {
      unhideSnippetMutation.mutateAsync(snippetId)
    } else {
      hideSnippetMutation.mutateAsync(snippetId)
    }
  }

  const handleToggleClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    handleToggleHide()
    setShowConfirmation(false)
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  return (
    <>
      {showConfirmation ? (
        <div className='flex space-x-2'>
          <Button variant='destructive' size='sm' onClick={handleConfirm} disabled={hideSnippetMutation.isPending}>
            {hideSnippetMutation.isPending ? (isHidden ? 'Unhiding...' : 'Hiding...') : isHidden ? 'Unhide' : 'Hide'}
          </Button>
          <Button variant='outline' size='sm' onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' onClick={handleToggleClick} disabled={hideSnippetMutation.isPending}>
              {isHidden ? (
                <PlusCircle className='h-6 w-6 min-w-[24px]' />
              ) : (
                <MinusCircle className='h-6 w-6 min-w-[24px]' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isHidden ? 'Unhide snippet' : 'Hide snippet'}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  )
}
