import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (session) {
        const from = (location.state as { from?: string })?.from ?? '/search'
        navigate(from, { replace: true })
      } else {
        setIsLoading(false)
      }
    }
    void checkSession()
  }, [navigate, location])

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      setError(error.message)
    } else {
      const from = (location.state as { from?: string })?.from ?? '/search'
      navigate(from, { replace: true })
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + (location.state as { from?: string })?.from || '/search'
      }
    })
    if (error) {
      setError(error.message)
    } else if (data.url) {
      window.location.href = data.url
    }
  }

  const isEmailEntered = email.trim() !== ''

  return (
    <div className='flex min-h-screen items-center justify-center bg-white'>
      <div className='w-full max-w-md space-y-8'>
        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>Login to VERDAD</h2>
        <form onSubmit={handleLogin} className='mt-8 space-y-6'>
          <div className='space-y-4'>
            <Input
              id='email'
              type='email'
              placeholder='Sign in with Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className='h-12'
            />
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className='h-12 pr-12'
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 flex items-center pr-3'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5 text-gray-400' />
                ) : (
                  <Eye className='h-5 w-5 text-gray-400' />
                )}
              </button>
            </div>
            <div className='flex items-center justify-end'>
              <Button variant='link' className='h-auto p-0 text-blue-600'>
                Forgot password?
              </Button>
            </div>
          </div>
          {error ? <p className='text-sm text-red-500'>{error}</p> : null}
          <Button
            type='submit'
            className={`h-12 w-full ${isEmailEntered ? 'bg-[#005EF4] hover:bg-[#004ED1]' : 'cursor-not-allowed bg-gray-300'}`}
            disabled={!isEmailEntered}
          >
            Continue
          </Button>
        </form>
        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-white px-2 text-gray-500'>or</span>
            </div>
          </div>
          <div className='mt-6'>
            <Button onClick={handleGoogleSignIn} variant='outline' className='h-12 w-full'>
              <img
                className='mr-2 h-5 w-5'
                src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                alt='Google logo'
              />
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
