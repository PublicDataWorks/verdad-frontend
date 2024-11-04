'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'

interface PoliticalSpectrumProps {
  value?: number
  onChange: (value: number) => void
}

export default function PoliticalSpectrum({ value, onChange }: PoliticalSpectrumProps) {
  const { language } = useLanguage()
  const t = translations[language]

  // Define the discrete positions as an array
  const positions = ['left', 'centerLeft', 'center', 'centerRight', 'right'] as const
  type Position = (typeof positions)[number]

  // Map each position to a numerical value
  const positionValues: { [key in Position]: number } = {
    left: -1,
    centerLeft: -0.5,
    center: 0,
    centerRight: 0.5,
    right: 1
  }

  // Inverse mapping from value to position
  const valueToPosition = (val: number): Position => {
    const closest = positions.reduce(
      (prev, curr) => (Math.abs(positionValues[curr] - val) < Math.abs(positionValues[prev] - val) ? curr : prev),
      positions[0]
    )
    return closest
  }

  // Initialize currentValue based on props
  const initialValue = value !== undefined ? (Object.values(positionValues).includes(value) ? value : 0) : 0

  const [currentValue, setCurrentValue] = useState<number>(initialValue)

  const handleChange = (newValue: number[]) => {
    const value = newValue[0]
    // Snap to the closest defined position
    const alignedValue = positions
      .map(pos => positionValues[pos])
      .reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev), 0)
    setCurrentValue(alignedValue)
    onChange(alignedValue)
  }

  const handleClear = () => {
    setCurrentValue(0)
    onChange(0)
  }

  useEffect(() => {
    if (value !== undefined && Object.values(positionValues).includes(value)) {
      setCurrentValue(value)
    }
  }, [value])

  return (
    <div className='w-full'>
      <div className='px-2'>
        <Slider
          value={[currentValue]}
          min={-1}
          max={1}
          step={0.5} // Set step to 0.5 to align with positionValues
          onValueChange={handleChange}
          className='py-4'
          aria-label={t.politicalSpectrum}
          aria-valuetext={t[valueToPosition(currentValue)]}
        />

        <div className='mt-4 text-center text-sm font-medium text-primary'>{t[valueToPosition(currentValue)]}</div>
      </div>
    </div>
  )
}
