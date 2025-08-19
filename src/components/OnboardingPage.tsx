'use client'

import { useState, ChangeEvent, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { jwtDecode } from 'jwt-decode'
import supabase from '@/lib/supabase'
import PublicHeader from './PublicHeader'

type FormData = {
  email: string
  firstName: string
  lastName: string
}

const AUTH_CHECK_TIMEOUT_MS = 3000

// Extract email from URL hash containing JWT access token
const extractEmailFromUrl = (): string | null => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')

  if (!accessToken) {
    return null
  }

  try {
    const payload: { email?: string } = jwtDecode(accessToken)
    return payload.email || null
  } catch (error) {
    console.error('Error decoding token from URL:', error)
    return null
  }
}

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>()

  useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout>
    
    // Listen for auth state changes (handles magic link authentication)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      
      if (session?.user?.email) {
        clearTimeout(timeoutId)
        setValue('email', session.user.email)
        setIsCheckingAuth(false)
      } else if (session === null) {
        // Clear email if user signs out (e.g., in another tab)
        setValue('email', '')
      }
    })
    
    const checkSession = async () => {
      try {
        // First, try to extract email from URL (for browsers with stricter cookie policies)
        const urlEmail = extractEmailFromUrl()
        if (urlEmail) {
          setValue('email', urlEmail)
          // Don't stop checking auth yet - wait for proper session
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (session?.user?.email) {
          setValue('email', session.user.email)
          setIsCheckingAuth(false)
        } else {
          // No session found, set timeout to allow for magic link processing
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setIsCheckingAuth(false) // Stop loading to show form
              // Email may already be set from URL extraction
            }
          }, AUTH_CHECK_TIMEOUT_MS)
        }
      } catch (error) {
        console.error('Session retrieval error:', error)
        if (isMounted) {
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Failed to retrieve user session'
          })
          setIsCheckingAuth(false)
        }
      }
    }
    
    checkSession()
    
    // Cleanup
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      authListener?.subscription.unsubscribe()
    }
  }, [setValue, toast])

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Size Error',
          description: 'File size should not exceed 10MB'
        })
        return
      }

      const reader = new FileReader()
      reader.onload = event => {
        if (event.target && typeof event.target.result === 'string') {
          setAvatarPreview(event.target.result)
        }
      }
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Failed to read file'
        })
      }
      reader.readAsDataURL(file)
      setAvatar(file)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: '/search'
        }
      })
      if (error) throw error
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Failed to sign in with Google'
      })
    }
  }

  const onSubmit: SubmitHandler<FormData> = async data => {
    setIsLoading(true)

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      const user = session?.user
      const { firstName, lastName } = data

      if (!user) throw new Error('No user found')

      let avatarUrl = null

      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from('prod-public-resources').upload(filePath, avatar, {
          cacheControl: '3600',
          upsert: true
        })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl }
        } = supabase.storage.from('prod-public-resources').getPublicUrl(filePath)
        avatarUrl = publicUrl
      }

      const { error: rpcError } = await supabase.rpc('setup_profile', {
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl
      })

      if (rpcError) throw rpcError

      navigate('/search')
    } catch (err) {
      console.error('Form submission error:', err)
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: err instanceof Error ? err.message : 'An error occurred while submitting the form.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const watchFirstName = watch('firstName')

  if (isCheckingAuth) {
    return (
      <div className='flex min-h-screen flex-col'>
        <PublicHeader />
        <div className='flex flex-grow items-center justify-center'>
          <div className='text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin' />
            <p className='mt-2 text-sm text-muted-foreground'>Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <PublicHeader />
      <div className='flex flex-grow items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl font-semibold'>Welcome to VERDAD</CardTitle>
            <p className='mt-4 text-base font-normal'>Let's set up your profile.</p>
          </CardHeader>
          <CardContent className='mt-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='flex items-center'>
                <Avatar className='h-16 w-16'>
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt='Profile picture' />
                  ) : (
                    <AvatarFallback className='text-4xl font-bold'>
                      {watchFirstName ? watchFirstName[0].toUpperCase() : 'T'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className='ml-4 flex flex-col gap-3'>
                  <p className='text-sm'>Profile picture</p>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-40'
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
                  <p className='mt-1 text-xs text-muted-foreground'>*.png, *.jpeg files up to 10MB</p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    placeholder='Enter your email'
                    disabled={!!watch('email')}
                  />
                  {errors.email && <p className='text-sm text-destructive'>{errors.email.message}</p>}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    {...register('firstName', { required: 'First name is required' })}
                    placeholder='First Name'
                  />
                  {errors.firstName && <p className='text-sm text-destructive'>{errors.firstName.message}</p>}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    {...register('lastName', { required: 'Last name is required' })}
                    placeholder='Last Name'
                  />
                  {errors.lastName && <p className='text-sm text-destructive'>{errors.lastName.message}</p>}
                </div>
              </div>

              <Button type='submit' className='w-full bg-blue-600 text-white hover:bg-blue-700' disabled={isLoading}>
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
                <span className='text-sm text-muted-foreground'>or</span>
              </div>

              <Button type='button' onClick={handleGoogleSignIn} variant='outline' className='w-full'>
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
