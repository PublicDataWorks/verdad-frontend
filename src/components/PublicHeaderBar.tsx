import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const PublicHeaderBar: React.FC = () => {
  const navigate = useNavigate()

  return (
    <header className='flex items-center justify-between border-b border-blue-600 bg-blue-50 px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text py-2 text-2xl font-bold leading-7 tracking-wide text-transparent'>
          VERDAD
        </div>
      </Link>
      <Button
        variant='ghost'
        onClick={() => navigate('/login')}
        className='text-blue-600 hover:bg-blue-100 hover:text-blue-700'
      >
        Login
      </Button>
    </header>
  )
}

export default PublicHeaderBar
