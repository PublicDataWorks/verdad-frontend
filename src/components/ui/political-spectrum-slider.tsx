import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import type { PoliticalSpectrum } from '@/hooks/useSnippetFilters'

export const POLITICAL_SPECTRUM_POSITIONS: PoliticalSpectrum[] = [
  'left',
  'center-left',
  'center',
  'center-right',
  'right'
]

const LABEL_POSITIONS: PoliticalSpectrum[] = ['left', 'center', 'right']

const DEFAULT_THUMB_INDEX = POLITICAL_SPECTRUM_POSITIONS.indexOf('center')

interface PoliticalSpectrumSliderProps {
  className?: string
  value: PoliticalSpectrum | undefined
  onChange: (value: PoliticalSpectrum | undefined) => void
}

export default function PoliticalSpectrumSlider({ className, value, onChange }: PoliticalSpectrumSliderProps) {
  const { language } = useLanguage()
  const t = translations[language]

  const getLabel = (position: PoliticalSpectrum | undefined): string => {
    if (position === undefined) return t.all
    return t[position]
  }

  const hasValue = value !== undefined
  const thumbIndex = hasValue ? POLITICAL_SPECTRUM_POSITIONS.indexOf(value) : DEFAULT_THUMB_INDEX

  const handleSliderChange = ([index]: number[]) => {
    onChange(POLITICAL_SPECTRUM_POSITIONS[index])
  }

  const handleClear = () => {
    onChange(undefined)
  }

  return (
    <div className={cn('w-full max-w-sm', className)}>
      <div className='flex items-center justify-end'>
        <Button variant='ghost' size='sm' onClick={handleClear} disabled={!hasValue}>
          {t.clear}
        </Button>
      </div>

      <SliderPrimitive.Root
        id='political-spectrum'
        value={[thumbIndex]}
        min={0}
        max={POLITICAL_SPECTRUM_POSITIONS.length - 1}
        step={1}
        onValueChange={handleSliderChange}
        className='relative flex h-6 w-full touch-none select-none items-center'>
        <SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-background-gray-medium' />
        <SliderPrimitive.Thumb
          aria-label={t.politicalSpectrum}
          aria-valuetext={getLabel(value)}
          className={cn(
            'block h-4 w-4 cursor-grab rounded-full border-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing',
            hasValue
              ? 'border-primary bg-primary'
              : 'border-dashed border-background-gray-dark bg-background-gray-lightest'
          )}
        />
      </SliderPrimitive.Root>

      <div className='-mx-1 -mt-1.5 flex justify-between'>
        {POLITICAL_SPECTRUM_POSITIONS.map(position => {
          const isActive = value === position
          return (
            <button
              key={position}
              type='button'
              title={getLabel(position)}
              aria-label={getLabel(position)}
              aria-pressed={isActive}
              onClick={() => onChange(position)}
              className='group flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
              <span
                aria-hidden='true'
                className={cn(
                  'block rounded-full transition-all',
                  isActive
                    ? 'h-2.5 w-2.5 bg-primary'
                    : 'h-2 w-2 bg-background-gray-medium group-hover:bg-background-gray-dark'
                )}
              />
            </button>
          )
        })}
      </div>

      <div className='mt-1 grid grid-cols-3 text-sm'>
        {LABEL_POSITIONS.map((position, index) => {
          const isActive = value === position
          return (
            <button
              key={position}
              type='button'
              aria-pressed={isActive}
              onClick={() => onChange(position)}
              className={cn(
                '-my-1 rounded py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                index === 0 && 'justify-self-start',
                index === 1 && 'justify-self-center',
                index === 2 && 'justify-self-end',
                isActive ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'
              )}>
              {getLabel(position)}
            </button>
          )
        })}
      </div>

      <div className='mt-4 text-center text-sm font-medium text-primary'>{getLabel(value)}</div>
    </div>
  )
}
