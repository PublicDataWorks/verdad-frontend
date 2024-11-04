'use client'

import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'

interface LanguageTabsProps {
  language: string
  setLanguage: (language: string) => void
  sourceText: {
    before: string
    main: string
    after: string
  }
  englishText: {
    before_en: string
    main_en: string
    after_en: string
  }
  sourceLanguage: string
}

export default function LanguageTabs({
  language,
  setLanguage,
  sourceText,
  englishText,
  sourceLanguage
}: LanguageTabsProps) {
  const sourceRef = useRef<HTMLSpanElement>(null)
  const englishRef = useRef<HTMLSpanElement>(null)
  const [activeTab, setActiveTab] = useState(language)
  const { language: currentLanguage } = useLanguage()
  const t = translations[currentLanguage]

  const scrollToHighlight = (ref: React.RefObject<HTMLSpanElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === sourceLanguage) {
        scrollToHighlight(sourceRef)
      } else {
        scrollToHighlight(englishRef)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [activeTab, sourceLanguage])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setActiveTab(newLanguage)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleLanguageChange} className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger className='capitalize' value={sourceLanguage}>
          {sourceLanguage}
        </TabsTrigger>
        <TabsTrigger className='capitalize' value='english'>
          English
        </TabsTrigger>
      </TabsList>
      <TabsContent value={sourceLanguage} className='max-h-80 overflow-y-auto text-sm'>
        <p className='group'>
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {sourceText.before}
          </span>{' '}
          <span ref={sourceRef} className='bg-blue-100 font-medium'>
            {sourceText.main}
          </span>{' '}
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {sourceText.after}
          </span>
        </p>
      </TabsContent>
      <TabsContent value='english' className='max-h-80 overflow-y-auto text-sm'>
        <p className='group'>
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {englishText.before_en}
          </span>{' '}
          <span ref={englishRef} className='bg-blue-100 font-medium'>
            {englishText.main_en}
          </span>{' '}
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {englishText.after_en}
          </span>
        </p>
      </TabsContent>
    </Tabs>
  )
}
