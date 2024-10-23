import React from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicHeader() {
  return (
    <header className='flex w-full items-center justify-between border-b border-blue-600 bg-blue-50 px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text py-2 text-2xl font-bold leading-7 tracking-wide text-transparent'>
          VERDAD
        </div>
      </Link>
      <Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
        <Sun className='h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
        <Moon className='absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
        <span className='sr-only'>Toggle theme</span>
      </Button>
    </header>
  )
}
