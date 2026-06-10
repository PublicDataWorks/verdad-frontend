import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { AuthError, EmailOtpType } from '@supabase/supabase-js'
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react'

import PublicHeader from './PublicHeader'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { LOGIN_PATH, ONBOARDING_PATH, SIGNUP_PATH } from '../constants/routes'
import supabase from '../lib/supabase'

// Only signup-confirmation tokens belong on this page. Recovery and magic-link
// emails have their own landing pages (e.g. /reset-password).
const VALID_EMAIL_OTP_TYPES = new Set(['email', 'signup'])

const resolveNextPath = (next: string | null): string => {
  if (!next) return ONBOARDING_PATH

  try {
    const nextUrl = new URL(next, window.location.origin)
    if (nextUrl.origin !== window.location.origin) {
      return ONBOARDING_PATH
    }

    return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  } catch {
    return ONBOARDING_PATH
  }
}

const EXPIRED_OR_USED_LINK_MESSAGE =
  'This link is invalid or was already used. If you already confirmed your email, your account may be ready; try logging in. Otherwise, sign up again to receive a new confirmation email.'

const getErrorMessage = (error: AuthError | null): string => {
  if (!error) return EXPIRED_OR_USED_LINK_MESSAGE
  // Expired, already-consumed (e.g. by an email link scanner), or malformed tokens
  // surface as 403s with an "expired or is invalid" message.
  if (error.status === 403 || /expired|invalid/i.test(error.message)) return EXPIRED_OR_USED_LINK_MESSAGE
  return error.message
}

export default function AuthConfirmPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isConfirming, setIsConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const nextPath = useMemo(() => resolveNextPath(searchParams.get('next')), [searchParams])
  const isValidType = type ? VALID_EMAIL_OTP_TYPES.has(type) : false
  const canConfirm = Boolean(tokenHash && isValidType)

  const handleConfirm = async () => {
    if (!tokenHash || !type || !isValidType) {
      setErrorMessage('This confirmation link is missing required verification details.')
      return
    }

    setIsConfirming(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType
    })

    setIsConfirming(false)

    if (error) {
      setErrorMessage(getErrorMessage(error))
      return
    }

    navigate(nextPath, { replace: true })
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <PublicHeader />
      <main className='flex flex-grow items-center justify-center px-4 py-10'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            {errorMessage ? (
              <MailWarning className='mx-auto h-12 w-12 text-destructive' aria-hidden='true' />
            ) : (
              <CheckCircle2 className='mx-auto h-12 w-12 text-blue-600' aria-hidden='true' />
            )}
            <CardTitle className='text-2xl'>Confirm your email</CardTitle>
            <CardDescription>Continue to finish creating your VERDAD account.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-center'>
            {errorMessage ? (
              <p className='text-sm text-destructive'>{errorMessage}</p>
            ) : (
              <p className='text-sm text-muted-foreground'>
                This final step verifies your email address and opens onboarding.
              </p>
            )}
          </CardContent>
          <CardFooter className='flex flex-col gap-3'>
            {errorMessage ? (
              <>
                <Button className='h-11 w-full bg-[#005EF4] hover:bg-[#004ED1]' onClick={() => navigate(LOGIN_PATH)}>
                  Back to login
                </Button>
                <Button variant='link' type='button' onClick={() => navigate(SIGNUP_PATH)}>
                  Sign up again
                </Button>
              </>
            ) : (
              <>
                <Button
                  className='h-11 w-full bg-[#005EF4] hover:bg-[#004ED1]'
                  onClick={() => {
                    void handleConfirm()
                  }}
                  disabled={!canConfirm || isConfirming}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
                      Confirming...
                    </>
                  ) : (
                    'Confirm email'
                  )}
                </Button>
                <Button variant='link' type='button' onClick={() => navigate(LOGIN_PATH)}>
                  Back to login
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
