'use client'

import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
  const [activeTab, setActiveTab] = useState(sourceLanguage)

  const isSourceEnglish = sourceLanguage && sourceLanguage?.toLowerCase() === 'english'

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
    setLanguage(isSourceEnglish ? 'english' : newLanguage)
    setActiveTab(isSourceEnglish ? 'english' : newLanguage)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleLanguageChange} className='w-full'>
      <TabsList className={`grid w-full ${isSourceEnglish ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <TabsTrigger className='capitalize' value={sourceLanguage}>
          {isSourceEnglish ? 'English' : sourceLanguage}
        </TabsTrigger>
        {!isSourceEnglish && (
          <TabsTrigger className='capitalize' value='english'>
            English
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value={sourceLanguage} className='max-h-80 overflow-y-auto text-sm'>
        <p className='group'>
          <span className='text-text-tertiary transition-colors duration-200 group-focus-within:text-foreground group-hover:text-text-secondary'>
            {sourceText.before}
          </span>{' '}
          <span ref={sourceRef} className='bg-background-blue-medium font-medium text-primary'>
            {sourceText.main}
          </span>{' '}
          <span className='text-text-tertiary transition-colors duration-200 group-focus-within:text-foreground group-hover:text-text-secondary'>
            {sourceText.after}
          </span>
        </p>
      </TabsContent>
      {!isSourceEnglish && (
        <TabsContent value='english' className='max-h-80 overflow-y-auto text-sm'>
          <p className='group'>
            <span className='text-text-tertiary transition-colors duration-200 group-focus-within:text-foreground group-hover:text-text-secondary'>
              {englishText.before_en}
            </span>{' '}
            <span ref={englishRef} className='bg-background-blue-medium font-medium text-primary'>
              {englishText.main_en}
            </span>{' '}
            <span className='text-text-tertiary transition-colors duration-200 group-focus-within:text-foreground group-hover:text-text-secondary'>
              {englishText.after_en}
            </span>
          </p>
        </TabsContent>
      )}
    </Tabs>
  )
}
