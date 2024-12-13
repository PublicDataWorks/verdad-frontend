import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTheme } from '../../providers/theme'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
                {theme === 'light' ? (
                  <Sun className='hover:text-text-primary h-6 w-6 text-white transition-all dark:-rotate-90' />
                ) : (
                  <Moon className='hover:text-text-primary h-6 w-6 rotate-90 scale-0 text-white transition-all dark:rotate-0 dark:scale-100' />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  )
}
