'use client'

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Info, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InboxPopover } from './InboxPopover'
import { useAuth } from '@/providers/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import supabase from '@/lib/supabase'
import { useLanguage } from '../providers/language'
import { translations } from '@/constants/translations'
import LanguageDropdown from './LanguageDropdown'
import { useToggleWelcomeCard } from '@/hooks/useSnippetActions'
import { useSidebar } from '@/providers/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ModeToggle } from './ui/mode-toggle'

const HeaderBar: React.FC = () => {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { showSidebar, setShowSidebar } = useSidebar()

  const { mutate: toggleWelcomeCard } = useToggleWelcomeCard()

  const t = translations[language]
  const showInfoIcon = !user?.user_metadata?.dismiss_welcome_card

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className='flex items-center justify-between bg-gradient-to-r from-background-header-from to-background-header-to px-8 py-2'>
      <div className='flex items-center gap-4'>
        {!pathname.includes('snippet') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='shrink-0' onClick={() => setShowSidebar(!showSidebar)}>
                <Menu
                  className={cn(
                    'h-5 w-5 text-white transition-transform duration-200 ease-in-out hover:text-text-primary',
                    showSidebar
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>{t.tooltips.toggleSidebar}</TooltipContent>
          </Tooltip>
        )}
        <Link to='/' className='flex items-center gap-2 no-underline'>
          <span className='font-inter text-xl font-bold tracking-tight text-white'>VERDAD</span>
        </Link>
      </div>
      <div className='flex items-center space-x-4'>
        {showInfoIcon && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' onClick={() => toggleWelcomeCard(true)}>
                <Info className='h-5 w-5 text-white hover:text-text-primary' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>{t.tooltips.showWelcomeCard}</TooltipContent>
          </Tooltip>
        )}
        <ModeToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon'>
              <InboxPopover />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>{t.tooltips.showInbox}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon'>
              <LanguageDropdown />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>{t.tooltips.changeLanguage}</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 p-0 hover:bg-transparent'>
              {user?.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url as string}
                  alt='User Avatar'
                  className='h-6 w-6 rounded-full'
                  referrerPolicy='no-referrer'
                />
              ) : (
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
                  {getInitials(user?.email ?? '')}
                </div>
              )}
              <span className='sr-only'>{t.userMenu}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>{t.logOut}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default HeaderBar
