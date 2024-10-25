// LoginPage.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../providers/auth'
import { useForm } from 'react-hook-form'

// Define the form data type
type LoginFormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    if (user) {
      navigate('/search')
    }
  }, [user, navigate])

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await login(data.email, data.password)
    if (error) {
      // Set form error
      setError('root', {
        message: error.message
      })
    } else {
      navigate('/search')
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await loginWithGoogle()
    if (error) {
      setError('root', {
        message: error.message
      })
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-white'>
      <div className='w-full max-w-md space-y-8'>
        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>Login to VERDAD</h2>

        <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6'>
          <div className='space-y-4'>
            <div>
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type='email'
                placeholder='Sign in with Email'
                className='h-12'
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email.message}</p>}
            </div>

            <div className='relative'>
              <Input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type='password'
                placeholder='Enter your Password'
                className='h-12 pr-12'
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && <p className='mt-1 text-sm text-red-500'>{errors.password.message}</p>}
            </div>

            <div className='flex items-center justify-end'>
              <Button variant='link' className='h-auto p-0 text-blue-600' onClick={() => navigate('/forget-password')}>
                Forgot password?
              </Button>
            </div>
          </div>

          {errors.root && <p className='text-sm text-red-500'>{errors.root.message}</p>}

          <Button type='submit' className='h-12 w-full bg-[#005EF4] hover:bg-[#004ED1]' disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Continue'}
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
            <Button onClick={handleGoogleSignIn} variant='outline' className='h-12 w-full' disabled={isSubmitting}>
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
