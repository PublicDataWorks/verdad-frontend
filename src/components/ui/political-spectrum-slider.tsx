'use client'

import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'

type Position = 'left' | 'center_left' | 'center' | 'center_right' | 'right'

interface PoliticalSpectrumProps {
  value?: Position
  onChange: (value: Position) => void
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

  const initialPosition = value || 'center' // Default to 'center'
  const [currentPosition, setCurrentPosition] = useState<Position>(initialPosition)

  const handleChange = (newValue: number[]) => {
    const index = newValue[0]
    const newPosition = positions[index]
    setCurrentPosition(newPosition)
    onChange(newPosition)
  }

  useEffect(() => {
    if (value && value !== currentPosition) {
      setCurrentPosition(value)
    }
  }, [value])

  return (
    <div className='w-full'>
      <div className='px-2'>
        <Slider
          value={[positionToIndex[currentPosition]]}
          min={0}
          max={positions.length - 1}
          step={1}
          onValueChange={handleChange}
          className='py-4'
          aria-label={t.politicalSpectrum}
          aria-valuetext={t[currentPosition]}
        />

        <div className='mt-4 text-center text-sm font-medium text-primary'>{t[currentPosition]}</div>
      </div>
    </div>
  )
}
