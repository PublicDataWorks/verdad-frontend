import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { AuthError, EmailOtpType } from '@supabase/supabase-js'
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react'

import PublicHeader from './PublicHeader'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { LOGIN_PATH, ONBOARDING_PATH, SIGNUP_PATH } from '../constants/routes'
import supabase from '../lib/supabase'

interface ConfirmCopy {
  title: string
  description: string
  body: string
  cta: string
}

// Per-flow copy for the button-gated confirmation page. Each of these OTP types
// only establishes a session and redirects, so they share this page.
// `recovery` is deliberately excluded — it needs a password-set step and has its
// own page (/reset-password).
const CONFIRM_COPY: Record<string, ConfirmCopy> = {
  email: {
    title: 'Confirm your email',
    description: 'Continue to finish creating your VERDAD account.',
    body: 'This final step verifies your email address and opens onboarding.',
    cta: 'Confirm email'
  },
  signup: {
    title: 'Confirm your email',
    description: 'Continue to finish creating your VERDAD account.',
    body: 'This final step verifies your email address and opens onboarding.',
    cta: 'Confirm email'
  },
  magiclink: {
    title: 'Sign in to VERDAD',
    description: 'Continue to finish signing in.',
    body: 'Click below to securely complete your sign-in.',
    cta: 'Sign in'
  },
  invite: {
    title: 'Accept your invitation',
    description: 'Continue to set up your VERDAD account.',
    body: 'Click below to accept your invitation and get started.',
    cta: 'Accept invitation'
  },
  email_change: {
    title: 'Confirm your email change',
    description: 'Continue to update your email address.',
    body: 'Click below to confirm this change to your VERDAD account email.',
    cta: 'Confirm email change'
  }
}

const VALID_EMAIL_OTP_TYPES = new Set(Object.keys(CONFIRM_COPY))

const resolveNextPath = (next: string | null): string => {
  if (!next) return ONBOARDING_PATH

  try {
    const nextUrl = new URL(next, window.location.origin)
    if (nextUrl.origin !== window.location.origin) {
      return ONBOARDING_PATH
    }

    // Protocol-relative paths (//host) would be treated as cross-origin URLs by history.pushState.
    if (nextUrl.pathname.startsWith('//')) {
      return ONBOARDING_PATH
    }

    return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  } catch {
    return ONBOARDING_PATH
  }
}

const EXPIRED_OR_USED_LINK_MESSAGE =
  'This link is invalid or was already used. If you already confirmed your email, your account may be ready; try logging in. Otherwise, sign up again to receive a new confirmation email.'

const MALFORMED_LINK_MESSAGE =
  'This confirmation link is incomplete or malformed. Open the most recent email we sent you and use its full link, or sign up again to receive a new one.'

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
  const copy = isValidType && type ? CONFIRM_COPY[type] : CONFIRM_COPY.email
  // A malformed link (missing/unknown token_hash or type) can never be confirmed,
  // so surface the error state immediately instead of a silently disabled button.
  const displayError = errorMessage ?? (canConfirm ? null : MALFORMED_LINK_MESSAGE)

  const handleConfirm = async () => {
    if (!tokenHash || !type || !isValidType) {
      setErrorMessage(MALFORMED_LINK_MESSAGE)
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
            {displayError ? (
              <MailWarning className='mx-auto h-12 w-12 text-destructive' aria-hidden='true' />
            ) : (
              <CheckCircle2 className='mx-auto h-12 w-12 text-blue-600' aria-hidden='true' />
            )}
            <CardTitle className='text-2xl'>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-center'>
            {displayError ? (
              <p className='text-sm text-destructive'>{displayError}</p>
            ) : (
              <p className='text-sm text-muted-foreground'>{copy.body}</p>
            )}
          </CardContent>
          <CardFooter className='flex flex-col gap-3'>
            {displayError ? (
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
                    copy.cta
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
