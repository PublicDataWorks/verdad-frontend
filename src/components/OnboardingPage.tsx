import { useState, ChangeEvent, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, Loader2 } from 'lucide-react'
import supabase from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

type FormData = {
  email: string
  firstName: string
  lastName: string
  password: string
}

export default function OnboardingPage() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const navigate = useNavigate()
  const hash = location.hash.substring(1)
  const searchParams = new URLSearchParams(hash)
  const params = Object.fromEntries(searchParams)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>()

  useEffect(() => {
    const updateSessionAndEmail = async () => {
      try {
        if (params.access_token && params.refresh_token) {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token
          })
        }

        const {
          data: { session }
        } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setValue('email', session.user.email)
        }
      } catch (error) {
        console.log(error)
      }
    }

    updateSessionAndEmail()
  }, [params.access_token, params.refresh_token, setValue])

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should not exceed 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = event => {
        if (event.target && typeof event.target.result === 'string') {
          setAvatarPreview(event.target.result)
        }
      }
      reader.readAsDataURL(file)
      setAvatar(file)
      setError('')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    const redirectUrl = (import.meta.env.VITE_AUTH_REDIRECT_URL as string) || '/search'
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
    if (error) {
      setError(error.message)
    } else if (data.url) {
      window.location.href = data.url
    }
  }

  const onSubmit: SubmitHandler<FormData> = async data => {
    setError('')
    setIsLoading(true)

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      const user = session?.user
      const { firstName, lastName, password } = data

      if (!user) throw new Error('No user found')

      let avatarUrl = null

      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatar, {
          cacheControl: '3600',
          upsert: true
        })

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl }
        } = supabase.storage.from('avatars').getPublicUrl(filePath)
        avatarUrl = publicUrl
      }

      await supabase.rpc('setup_profile', {
        first_name: firstName,
        last_name: lastName,
        password: password,
        avatar_url: avatarUrl
      })

      navigate('/search')
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the form.')
    } finally {
      setIsLoading(false)
    }
  }

  const watchFirstName = watch('firstName')

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='flex flex-grow items-center justify-center'>
        <Card className='w-full max-w-md border-0 shadow-none'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl font-semibold text-primary'>Welcome to VERDAD</CardTitle>
            <p className='mt-4 text-base font-normal'>Let's set up your profile.</p>
          </CardHeader>
          <CardContent className='mt-4 border-0 bg-white shadow-none'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='flex items-center'>
                <Avatar className='h-16 w-16 bg-purple-500'>
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt='Profile picture' />
                  ) : (
                    <AvatarFallback className='text-4xl font-bold text-white'>
                      {watchFirstName ? watchFirstName[0].toUpperCase() : 'T'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className='ml-4 flex flex-col gap-3'>
                  <p className='text-sm'>Profile picture</p>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-40 px-3 py-1.5 text-text-blue'
                    onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <Upload className='mr-2 h-4 w-4' />
                    Upload Avatar
                  </Button>
                  <input
                    id='avatar-upload'
                    type='file'
                    accept='image/*'
                    className='sr-only'
                    onChange={handleAvatarChange}
                  />
                  <p className='mt-1 text-xs text-tertiary'>*.png, *.jpeg files up to 10MB at least 400px by 400px</p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='email'>
                    Email
                  </Label>
                  <Input
                    id='email'
                    {...register('email', { required: 'Email is required' })}
                    placeholder='Email'
                    disabled
                  />
                  {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='firstName'>
                    First Name
                  </Label>
                  <Input
                    id='firstName'
                    {...register('firstName', { required: 'First name is required' })}
                    placeholder='First Name'
                  />
                  {errors.firstName && <p className='text-sm text-red-500'>{errors.firstName.message}</p>}
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='lastName'>
                    Last Name
                  </Label>
                  <Input
                    id='lastName'
                    {...register('lastName', { required: 'Last name is required' })}
                    placeholder='Last Name'
                  />
                  {errors.lastName && <p className='text-sm text-red-500'>{errors.lastName.message}</p>}
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='password'>
                    Password
                  </Label>
                  <Input
                    id='password'
                    type='password'
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long'
                      }
                    })}
                    placeholder='Password'
                  />
                  {errors.password && <p className='text-sm text-red-500'>{errors.password.message}</p>}
                </div>
              </div>

              {error && <p className='text-sm text-red-500'>{error}</p>}

              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Please wait
                  </>
                ) : (
                  'Continue'
                )}
              </Button>

              <div className='text-center'>
                <span className='text-sm text-gray-500'>or</span>
              </div>

              <Button type='button' onClick={handleGoogleSignIn} variant='outline' className='h-12 w-full'>
                <img
                  className='mr-2 h-5 w-5'
                  src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                  alt='Google logo'
                />
                Sign in with Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
