import { useEffect, useMemo, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MailWarning } from 'lucide-react'
import type { AuthError, EmailOtpType } from '@supabase/supabase-js'
import supabase from '../lib/supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PublicHeader from './PublicHeader'

type FormData = {
  password: string
  confirmPassword: string
}

const EXPIRED_LINK_MESSAGE =
  'This password reset link is invalid or has expired. Please request a new reset email and try again.'

const getResetErrorMessage = (error: AuthError | null): string => {
  if (!error) return EXPIRED_LINK_MESSAGE
  // Expired, already-consumed (e.g. by an email link scanner), or malformed tokens
  // surface as 403s with an "expired or is invalid" message.
  if (error.status === 403 || /expired|invalid/i.test(error.message)) return EXPIRED_LINK_MESSAGE
  return error.message
}

export function ResetPassword() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Scanner-safe recovery flow: the email links here with a one-time token in the
  // query string. We do NOT redeem it on load — only when the user submits a new
  // password, so email security scanners that merely fetch the page can't consume it.
  const tokenHash = searchParams.get('token_hash')
  const tokenType = searchParams.get('type')

  // Legacy implicit flow: older in-flight reset emails redirect here with session
  // tokens in the URL hash. Keep supporting them until they age out.
  const legacyHashParams = useMemo(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash
    return Object.fromEntries(new URLSearchParams(hash))
  }, [])

  const hasLegacyTokens = Boolean(legacyHashParams.access_token && legacyHashParams.refresh_token)
  const hasResetCredential = Boolean(tokenHash) || hasLegacyTokens

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>()

  useEffect(() => {
    if (!hasLegacyTokens) return

    const establishLegacySession = async () => {
      try {
        await supabase.auth.setSession({
          access_token: legacyHashParams.access_token,
          refresh_token: legacyHashParams.refresh_token
        })
      } catch {
        setError(EXPIRED_LINK_MESSAGE)
      }
    }

    void establishLegacySession()
  }, [hasLegacyTokens, legacyHashParams.access_token, legacyHashParams.refresh_token])

  const password = watch('password')

  const onSubmit: SubmitHandler<FormData> = async data => {
    setError('')
    setIsLoading(true)

    try {
      // Redeem the one-time recovery token now (scanner-safe), establishing a session
      // before we change the password.
      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (tokenType ?? 'recovery') as EmailOtpType
        })
        if (verifyError) {
          setError(getResetErrorMessage(verifyError))
          return
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })
      if (updateError) {
        setError(getResetErrorMessage(updateError))
        return
      }

      navigate('/login', {
        state: {
          message: 'Password successfully reset. Please login with your new password.'
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while resetting the password.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasResetCredential) {
    return (
      <div className='min-h-screen'>
        <PublicHeader />
        <div className='mx-auto px-4 py-16'>
          <Card className='mx-auto max-w-lg rounded-xl p-8'>
            <CardHeader className='space-y-3 text-center'>
              <MailWarning className='mx-auto h-12 w-12 text-destructive' aria-hidden='true' />
              <CardTitle className='text-3xl font-bold tracking-tight text-gray-900'>Reset link required</CardTitle>
              <p className='text-gray-500'>
                Open the most recent password reset email and use its link, or request a new one.
              </p>
            </CardHeader>
            <CardContent className='mt-8 flex flex-col gap-3'>
              <Button
                className='w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700'
                onClick={() => navigate('/forget-password')}>
                Request a new reset link
              </Button>
              <Button variant='link' type='button' onClick={() => navigate('/login')}>
                Back to login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
                      onClick={() => setShowPassword(!showPassword)}>
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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
                disabled={isLoading}>
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
