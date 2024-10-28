import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface LanguageTabsProps {
  language: string
  setLanguage: (language: string) => void
  spanishText: {
    before: string
    main: string
    after: string
  }
  englishText: {
    before_en: string
    main_en: string
    after_en: string
  }
}

export default function LanguageTabs({ language, setLanguage, spanishText, englishText }: LanguageTabsProps) {
  return (
    <Tabs value={language} onValueChange={setLanguage} className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='spanish'>Spanish</TabsTrigger>
        <TabsTrigger value='english'>English</TabsTrigger>
      </TabsList>
      <TabsContent value='spanish' className='max-h-80 overflow-y-auto text-sm'>
        <p className='group'>
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {spanishText.before}
          </span>{' '}
          <span className='bg-blue-100 font-medium'>{spanishText.main}</span>{' '}
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {spanishText.after}
          </span>
        </p>
      </TabsContent>
      <TabsContent value='english' className='max-h-80 overflow-y-auto text-sm'>
        <p className='group'>
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {englishText.before_en}
          </span>{' '}
          <span className='bg-blue-100 font-medium'>{englishText.main_en}</span>{' '}
          <span className='text-dropdown-text transition-colors duration-200 group-focus-within:text-foreground group-hover:text-foreground'>
            {englishText.after_en}
          </span>
        </p>
      </TabsContent>
    </Tabs>
  )
}
