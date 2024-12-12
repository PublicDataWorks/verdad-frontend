import { Mail, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToggleWelcomeCard } from '@/hooks/useSnippetActions'
import { useWelcomeCard } from '@/hooks/useWelcomeCard'
import { useLanguage } from '@/providers/language'
import { DynamicIcon } from './dynamic-icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

export default function WelcomeCard() {
  const { mutate: toggleWelcomeCard } = useToggleWelcomeCard()
  const { language } = useLanguage()
  const { data, isLoading } = useWelcomeCard(language)
  const { title, subtitle, features, footer_text, contact_email, contact_text } = data || {}

  if (isLoading) {
    return null
  }

  return (
    <TooltipProvider>
      <Card className='from-background-header-from to-background-header-to relative mb-6 w-full overflow-hidden border-none bg-gradient-to-b'>
        <CardHeader className='pb-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-2 top-2'
                onClick={() => toggleWelcomeCard(false)}
                aria-label='Dismiss welcome message'>
                <X className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dismiss</TooltipContent>
          </Tooltip>
          <h2 className='text-xl font-bold text-white'>{title}</h2>
          {subtitle && <p className='text-sm text-white'>{subtitle}</p>}
        </CardHeader>
        <CardContent className='grid gap-4 pb-4'>
          <div className='grid gap-2 text-sm'>
            {features?.map((feature, index) => {
              return (
                <div key={index} className='flex items-start gap-2'>
                  <DynamicIcon name={feature.icon as any} className='mt-0.5 h-4 w-4 flex-shrink-0 text-ghost-white' />
                  <p className='text-ghost-white'>{feature.text}</p>
                </div>
              )
            })}
          </div>
          {footer_text && <p className='text-xs text-ghost-white'>{footer_text}</p>}
          {contact_email && contact_text && (
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <div className='flex items-center gap-2'>
                <Mail className='h-3 w-3 text-ghost-white' />
                <span className='text-ghost-white'>{contact_text}</span>
              </div>
              <a href={`mailto:${contact_email}`} className='inline text-ghost-white hover:underline'>
                {contact_email}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
