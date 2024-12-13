import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const PublicHeaderBar: React.FC = () => {
  const navigate = useNavigate()
  const { snippetId } = useParams<{ snippetId: string }>()

  const handleLogin = () => {
    const redirectTo = snippetId ? `/snippet/${snippetId}` : '/search'
    navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  return (
    <header className='flex items-center justify-between bg-gradient-to-b from-header-blue to-header-white px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer py-2 text-2xl font-bold leading-7 tracking-wide text-white'>
          VERDAD
        </div>
      </Link>
      <Button variant='ghost' onClick={handleLogin} className='text-white hover:bg-blue-100 hover:text-blue-700'>
        Login
      </Button>
    </header>
  )
}

export default PublicHeaderBar
