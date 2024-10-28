import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import supabase from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import PublicHeader from './PublicHeader'

type FormData = {
  password: string
  confirmPassword: string
}

export function ResetPassword() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const hash = location.hash.substring(1)
  const searchParams = new URLSearchParams(hash)
  const params = Object.fromEntries(searchParams)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>()

  useEffect(() => {
    const updateSession = async () => {
      try {
        if (params.access_token && params.refresh_token) {
          const response = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token
          })
        }
      } catch (error) {
        console.log(error)
        setError('Invalid or expired reset link')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    updateSession()
  }, [params.access_token, params.refresh_token, navigate])

  const password = watch('password')

  const onSubmit: SubmitHandler<FormData> = async data => {
    setError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        throw error
      }
      // Show success message or redirect
      navigate('/login', {
        state: {
          message: 'Password successfully reset. Please login with your new password.'
        }
      })
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while resetting the password.')
    } finally {
      setIsLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className='min-h-screen'>
      <PublicHeader />
      <div className='mx-auto px-4 py-16'>
        <Card className='mx-auto max-w-lg rounded-xl p-8'>
          <CardHeader className='space-y-3 text-center'>
            <CardTitle className='text-3xl font-bold tracking-tight text-gray-900'>Reset your Password</CardTitle>
            <p className='text-gray-500'>Almost done. Enter your new password below.</p>
          </CardHeader>

          <CardContent className='mt-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='space-y-6'>
                <div className='relative'>
                  <Label className='block text-sm font-medium text-gray-700' htmlFor='password'>
                    New Password
                  </Label>
                  <div className='relative mt-2'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters long'
                        }
                      })}
                      className='block w-full rounded-lg border-gray-300 px-4 py-3 pr-10 focus:border-blue-500 focus:ring-blue-500'
                      placeholder='Enter new password'
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                    </button>
                  </div>
                  {errors.password && <p className='mt-2 text-sm text-red-600'>{errors.password.message}</p>}
                </div>

                <div className='relative'>
                  <Label className='block text-sm font-medium text-gray-700' htmlFor='confirmPassword'>
                    Confirm Password
                  </Label>
                  <div className='relative mt-2'>
                    <Input
                      id='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'The passwords do not match'
                      })}
                      className='block w-full rounded-lg border-gray-300 px-4 py-3 pr-10 focus:border-blue-500 focus:ring-blue-500'
                      placeholder='Confirm new password'
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className='mt-2 text-sm text-red-600'>{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className='rounded-md bg-red-50 p-4'>
                  <p className='text-sm text-red-600'>{error}</p>
                </div>
              )}

              <Button
                type='submit'
                className='w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
