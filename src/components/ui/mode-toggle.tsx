import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { translations } from '@/constants/translations'
import { useLanguage } from '../../providers/language'
import { useTheme } from '../../providers/theme'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { language } = useLanguage()
  const t = translations[language]

  const isDark = resolvedTheme === 'dark'
  const label = isDark ? t.tooltips.switchToLightMode : t.tooltips.switchToDarkMode
  const Icon = isDark ? Moon : Sun

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 p-0'
          aria-label={label}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <Icon className='h-6 w-6 text-white transition-all hover:text-text-primary' />
          <span className='sr-only'>{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
