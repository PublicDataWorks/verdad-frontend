'use client'

import { useEffect, useState } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import { cn } from '@/lib/utils'

type Position = 'left' | 'center_left' | 'center' | 'center_right' | 'right'

interface PoliticalSpectrumProps {
  value?: Position
  onChange: (value: Position | undefined) => void
}

export default function PoliticalSpectrum({ value, onChange }: PoliticalSpectrumProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const positions: Position[] = ['left', 'center_left', 'center', 'center_right', 'right']

  const positionToIndex: { [key in Position]: number } = {
    left: 0,
    center_left: 1,
    center: 2,
    center_right: 3,
    right: 4
  }

  const [currentPosition, setCurrentPosition] = useState<Position | undefined>(value)

  const handleChange = (newValue: number[]) => {
    const index = newValue[0]
    const newPosition = index === 2 && currentPosition === undefined ? undefined : positions[index]
    setCurrentPosition(newPosition)
    onChange(newPosition)
  }

  const handleReset = () => {
    setCurrentPosition(undefined)
    onChange(undefined)
  }

  useEffect(() => {
    if (value !== currentPosition) {
      setCurrentPosition(value)
    }
  }, [value])

  return (
    <div className='w-full'>
      <SliderPrimitive.Root
        value={currentPosition !== undefined ? [positionToIndex[currentPosition]] : [2]}
        min={0}
        max={positions.length - 1}
        step={1}
        onValueChange={handleChange}
        className='relative flex w-full touch-none select-none items-center py-4'>
        <SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-secondary'>
          <SliderPrimitive.Range
            className={cn('absolute h-full', currentPosition !== undefined ? 'bg-primary' : 'bg-gray-400')}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            currentPosition !== undefined ? 'border-primary' : 'border-gray-400'
          )}
        />
      </SliderPrimitive.Root>

      <div className='mt-4 flex justify-center'>
        <Button
          onClick={handleReset}
          variant='outline'
          size='sm'
          disabled={currentPosition === undefined}
          className={cn(
            'transition-opacity duration-200',
            currentPosition === undefined ? 'cursor-not-allowed opacity-50' : 'opacity-100'
          )}>
          {t.reset || 'Reset'}
        </Button>
      </div>
    </div>
  )
}
