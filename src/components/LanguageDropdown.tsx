import { Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'

export default function LanguageDropdown() {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 p-0 hover:bg-transparent'>
          <Globe className='hover:text-text-primary h-6 w-6 text-white' />
          <span className='sr-only'>{t.changeLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem className='cursor-pointer' onClick={() => setLanguage('spanish')}>
          <span>Español</span>
          {language === 'spanish' && <span className='ml-2'>✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer' onClick={() => setLanguage('english')}>
          <span>English</span>
          {language === 'english' && <span className='ml-2'>✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
