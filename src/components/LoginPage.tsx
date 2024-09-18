import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GoogleOauthPopup from './GoogleOauthPopup'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
      navigate('/search')
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>Enter your credentials to access the search interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='me@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='Enter your password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className='text-red-500'>{error}</p> : null}
            <Button type='submit' className='w-full'>
              Login
            </Button>
          </form>
          <div className='mt-4'>
            <GoogleOauthPopup />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
