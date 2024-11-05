import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../providers/auth'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

type SignupFormData = {
  email: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp, loginWithGoogle } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError
  } = useForm<SignupFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { error } = await signUp(data.email, data.password)
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error creating account',
          description: error.message
        })
        setError('root', {
          message: error.message
        })
      } else {
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
          className: 'bg-green-500 text-white'
        })
        navigate('/login')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred'
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await loginWithGoogle()
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Google Sign-in Failed',
          description: error.message
        })
        setError('root', {
          message: error.message
        })
      } else {
        toast({
          title: 'Success!',
          description: 'Successfully signed in with Google',
          className: 'bg-green-500 text-white'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect with Google'
      })
    }
  }

  return (
    <>
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <div className='w-full max-w-md space-y-8'>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>Create your account</h2>

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
                  placeholder='Enter your Email'
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
                  placeholder='Create Password'
                  className='h-12 pr-12'
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                {errors.password && <p className='mt-1 text-sm text-red-500'>{errors.password.message}</p>}
              </div>

              <div className='relative'>
                <Input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === watch('password') || 'Passwords do not match'
                  })}
                  type='password'
                  placeholder='Confirm Password'
                  className='h-12 pr-12'
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                {errors.confirmPassword && (
                  <p className='mt-1 text-sm text-red-500'>{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className='flex items-center justify-end'>
                <Button
                  variant='link'
                  className='h-auto p-0 text-blue-600'
                  type='button'
                  onClick={() => navigate('/login')}>
                  Already have an account? Login
                </Button>
              </div>
            </div>

            {errors.root && <p className='text-sm text-red-500'>{errors.root.message}</p>}

            <Button type='submit' className='h-12 w-full bg-[#005EF4] hover:bg-[#004ED1]' disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Sign up'}
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
                Sign up with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}
