'use client'

import React from 'react'
import { Link } from 'react-router-dom'
import { Moon, LogOut, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InboxPopover } from './InboxPopover'
import { useAuth } from '@/providers/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import supabase from '@/lib/supabase'
import { useLanguage } from '../providers/language'

const HeaderBar: React.FC = () => {
  const { user } = useAuth()
  const { language, setLanguage } = useLanguage()

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleLanguageChange = (newLanguage: 'spanish' | 'english') => {
    setLanguage(newLanguage)
  }

  return (
    <header className='flex items-center justify-between border-b border-blue-600 bg-blue-50 px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text py-2 text-2xl font-bold leading-7 tracking-wide text-transparent'>
          VERDAD
        </div>
      </Link>
      <div className='flex items-center space-x-4'>
        <InboxPopover />
        <Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
          <Moon className='h-6 w-6 text-blue-600 hover:bg-gray-50' />
          <span className='sr-only'>Toggle dark mode</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 p-0 hover:bg-gray-50'>
              <Globe className='h-6 w-6 text-blue-600' />
              <span className='sr-only'>Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem className='cursor-pointer' onClick={() => handleLanguageChange('spanish')}>
              <span>Español</span>
              {language === 'spanish' && <span className='ml-2'>✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer' onClick={() => handleLanguageChange('english')}>
              <span>English</span>
              {language === 'english' && <span className='ml-2'>✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 p-0 hover:bg-gray-50'>
              {user?.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt='User Avatar'
                  className='h-6 w-6 rounded-full'
                  referrerPolicy='no-referrer'
                />
              ) : (
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
                  {getInitials(user?.email || '')}
                </div>
              )}
              <span className='sr-only'>User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>{language === 'spanish' ? 'Cerrar sesión' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default HeaderBar
