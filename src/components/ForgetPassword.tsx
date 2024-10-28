import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react' // Add CheckCircle2 import
import supabase from '../lib/supabase'
import PublicHeader from './PublicHeader'

type FormData = {
  email: string
}

export default function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()

  const onSubmit: SubmitHandler<FormData> = async data => {
    setIsLoading(true)
    setEmail(data.email)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setIsSuccess(true)
    } catch (error) {
      // Handle error case
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      <PublicHeader />
      <div className='flex flex-grow items-center justify-center px-4'>
        <div className='w-full max-w-lg space-y-6'>
          <h1 className='text-center text-2xl font-semibold text-gray-900'>Reset Password</h1>

          {!isSuccess ? (
            <>
              <p className='text-center text-base text-gray-600'>
                To reset your password, please enter the email of your VERDAD account.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <Input
                  id='email'
                  type='email'
                  placeholder='Your Email'
                  className='w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none'
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}

                <Button
                  type='submit'
                  className='w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none disabled:opacity-70'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Password Link'
                  )}
                </Button>
              </form>

              <div className='text-center'>
                <a href='/login' className='text-sm text-blue-600 hover:underline'>
                  Go to Login
                </a>
              </div>
            </>
          ) : (
            <div className='flex flex-col space-y-6'>
              <div className='flex'>
                <div className='flex justify-center'>
                  <CheckCircle2 className='h-12 w-12 text-green-500' />
                </div>
                <p className='text-center text-base text-gray-600'>
                  We've sent an email to {email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length))} with
                  password reset instructions. Please check your email.
                </p>
              </div>

              <Button
                onClick={() => (window.location.href = '/login')}
                className='w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none'
              >
                Return to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
