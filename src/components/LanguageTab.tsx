import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface LanguageTabsProps {
  language: string
  setLanguage: (language: string) => void
  spanishText: string
  englishText: string
}

export default function LanguageTabs({ language, setLanguage, spanishText, englishText }: LanguageTabsProps) {
  return (
    <Tabs value={language} onValueChange={setLanguage} className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='spanish'>Spanish</TabsTrigger>
        <TabsTrigger value='english'>English</TabsTrigger>
      </TabsList>
      <TabsContent value='spanish' className='h-40 overflow-y-auto text-sm'>
        <p>{spanishText}</p>
      </TabsContent>
      <TabsContent value='english' className='h-40 overflow-y-auto text-sm'>
        <p>{englishText}</p>
      </TabsContent>
    </Tabs>
  )
}
