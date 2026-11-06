import { FlaskConical } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'

// Shown above the snippet list while the research view (`?view=research`) is on.
export default function ResearchViewBanner() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <Card
      role='note'
      className='mb-6 w-full overflow-hidden border-none bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800'
    >
      <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
        <FlaskConical className='h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-300' aria-hidden='true' />
        <h2 className='text-base font-bold text-amber-900 dark:text-amber-100'>{t.researchViewBannerTitle}</h2>
      </CardHeader>
      <CardContent className='grid gap-2 pb-4 text-sm text-amber-900 dark:text-amber-100'>
        <p>{t.researchViewBannerBody}</p>
        <p className='font-medium'>{t.researchViewBannerCaution}</p>
      </CardContent>
    </Card>
  )
}
