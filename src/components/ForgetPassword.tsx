import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import supabase from '../lib/supabase'

type FormData = {
  email: string
}

export default function ForgetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()

  const onSubmit: SubmitHandler<FormData> = async data => {
    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setMessage('Password reset link sent to your email.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-semibold'>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4 text-center text-sm text-gray-600'>
            To reset your password, please enter the email of your VERDAD account.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Input
                id='email'
                type='email'
                placeholder='Your Email'
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
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
          {message && <p className='mt-4 text-center text-sm text-blue-600'>{message}</p>}
          <div className='mt-4 text-center'>
            <a href='/login' className='text-sm text-blue-600 hover:underline'>
              Go to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
