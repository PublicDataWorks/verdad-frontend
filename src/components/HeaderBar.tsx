'use client'

import React from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InboxPopover } from './InboxPopover'
import { useAuth } from '@/providers/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import supabase from '@/lib/supabase'
import { useLanguage } from '../providers/language'
import { translations } from '@/constants/translations'
import LanguageDropdown from './LanguageDropdown'

const HeaderBar: React.FC = () => {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language]

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className='flex items-center justify-between bg-gradient-to-b from-header-blue to-header-white px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer py-2 text-2xl font-bold leading-7 tracking-wide text-white'>
          VERDAD
        </div>
      </Link>
      <div className='flex items-center space-x-4'>
        <InboxPopover />
        <LanguageDropdown />
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
