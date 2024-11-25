import { Mail, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDismissWelcomeCard, useToggleWelcomeCard } from '@/hooks/useSnippetActions'
import { useWelcomeCard } from '@/hooks/useWelcomeCard'
import { useLanguage } from '@/providers/language'
import { DynamicIcon } from './dynamic-icon'
import Spinner from '../Spinner'

export default function WelcomeCard() {
  // const { mutate: dismissWelcomeCard } = useDismissWelcomeCard()
  const { mutate: toggleWelcomeCard } = useToggleWelcomeCard()
  const { language } = useLanguage()
  const { data, isLoading } = useWelcomeCard(language)
  const { title, subtitle, features, footer_text, contact_email, contact_text } = data || {}

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <Card className='relative mb-6 w-full overflow-hidden border-none bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800'>
        <CardHeader className='pb-2'>
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-2 top-2'
            onClick={() => toggleWelcomeCard(false)}
            aria-label='Dismiss welcome message'>
            <X className='h-4 w-4' />
          </Button>
          <h2 className='text-xl font-bold text-blue-900 dark:text-blue-100'>{title}</h2>
          {subtitle && <p className='text-sm text-blue-800 dark:text-blue-200'>{subtitle}</p>}
        </CardHeader>
        <CardContent className='grid gap-4 pb-4'>
          <div className='grid gap-2 text-sm'>
            {features?.map((feature, index) => {
              return (
                <div key={index} className='flex items-start gap-2'>
                  <DynamicIcon
                    name={feature.icon as any}
                    className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400'
                  />
                  <p className='text-blue-800 dark:text-blue-200'>{feature.text}</p>
                </div>
              )
            })}
          </div>
          {footer_text && <p className='text-xs text-blue-700 dark:text-blue-300'>{footer_text}</p>}
          {contact_email && contact_text && (
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <div className='flex items-center gap-2'>
                <Mail className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                <span className='text-blue-700 dark:text-blue-300'>{contact_text}</span>
              </div>
              <a href={`mailto:${contact_email}`} className='inline text-blue-600 hover:underline dark:text-blue-400'>
                {contact_email}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
