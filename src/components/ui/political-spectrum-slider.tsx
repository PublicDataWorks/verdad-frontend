'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'

import './political-spectrum-slider.scss'

type Position = 'left' | 'center-left' | 'center' | 'center-right' | 'right'

interface PoliticalSpectrumSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  value: Position | undefined
  onChange: (value: Position | undefined) => void
}

export default function PoliticalSpectrumSlider({
  className,
  value,
  onChange,
  ...props
}: PoliticalSpectrumSliderProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const positions: Position[] = ['left', 'center-left', 'center', 'center-right', 'right']
  const labels = [t.left || 'Left', t.center || 'Center', t.right || 'Right']

  const getLabel = (position: Position | undefined) => {
    if (position === undefined || position === null) return t.all || 'All'
    return t[position as keyof typeof t] || position
  }

  const handleSliderChange = (newValue: number[]) => {
    const index = newValue[0]
    const newPosition = index >= 0 && index < positions.length ? positions[index] : undefined
    onChange(newPosition)
  }

  const handleClear = () => {
    onChange(undefined)
  }

  return (
    <div className='w-full max-w-sm space-y-4'>
      <div className='flex items-center justify-end'>
        <Button variant='ghost' size='sm' onClick={handleClear} disabled={value === null}>
          {t.clear || 'Clear'}
        </Button>
      </div>
      <div className='relative'>
        <SliderPrimitive.Root
          id='political-spectrum'
          value={value !== undefined && value !== null ? [positions.indexOf(value)] : [2]}
          min={0}
          max={positions.length - 1}
          step={1}
          onValueChange={handleSliderChange}
          className={cn(
            'political-spectrum-slider relative flex w-full touch-none select-none items-center',
            value === null && 'is-grayed-out',
            className
          )}
          {...props}>
          <SliderPrimitive.Track className='slider-track relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200'></SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              'slider-thumb bg-background-gray-light border-background-gray-light block h-3 w-3 rounded-full border-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              value === null && 'is-grayed-out'
            )}
          />
        </SliderPrimitive.Root>
        <div className='absolute left-0 right-0 top-full mt-1 flex justify-between'>
          {positions.map(position => (
            <div key={position} className={cn('bg-background-gray-medium h-2 w-2 rounded-full')} />
          ))}
        </div>
      </div>

      <div className='flex justify-between text-sm'>
        {labels.map(label => (
          <span key={label} className={cn('text-muted-foreground')}>
            {label}
          </span>
        ))}
      </div>

      <div className='text-center text-sm font-medium text-primary'>{getLabel(value)}</div>
    </div>
  )
}
