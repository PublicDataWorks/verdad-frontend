import PublicHeader from './PublicHeader'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Upload } from 'lucide-react'
import supabase from '../lib/supabase'

export default function OnboardingPage() {
  const [error, setError] = useState('')

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

  return (
    <div className='flex min-h-screen flex-col'>
      <PublicHeader />
      <div className='flex flex-grow items-center justify-center'>
        <Card className='w-full max-w-md border-0 shadow-none'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl font-semibold text-primary'>Welcome to VERDAD</CardTitle>
            <p className='mt-4 text-base font-normal'>Let's set up your profile.</p>
          </CardHeader>
          <CardContent className='mt-4 border-0 bg-white shadow-none'>
            <div className='space-y-6'>
              <div className='flex'>
                <Avatar className='h-16 w-16 bg-purple-500'>
                  <AvatarFallback className='text-4xl font-bold text-white'>T</AvatarFallback>
                </Avatar>
                <div className='ml-2 flex flex-col gap-3'>
                  <p className='text-sm'>Profile picture</p>
                  <Button
                    variant='outline'
                    className='w-40 px-3 py-1.5 text-text-blue'
                    onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <Upload className='mr-2 h-4 w-4' />
                    Upload Avatar
                  </Button>
                  <input id='avatar-upload' type='file' accept='image/*' className='sr-only' />
                  <p className='text-tertiary mt-1 text-xs'>*.png, *.jpeg files up to 10MB at least 400px by 400px</p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='email'>
                    Email
                  </Label>
                  <Input id='email' placeholder='Email' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='firstName'>
                    First Name
                  </Label>
                  <Input id='firstName' placeholder='First Name' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='lastName'>
                    Last Name
                  </Label>
                  <Input id='lastName' placeholder='Last Name' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-primary' htmlFor='password'>
                    Password
                  </Label>
                  <Input id='password' type='password' placeholder='Create a Password' />
                </div>
              </div>

              <Button className='w-full'>Continue</Button>

              <div className='text-center'>
                <span className='text-sm text-gray-500'>or</span>
              </div>

              <Button onClick={handleGoogleSignIn} variant='outline' className='h-12 w-full'>
                <img
                  className='mr-2 h-5 w-5'
                  src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                  alt='Google logo'
                />
                Sign in with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
