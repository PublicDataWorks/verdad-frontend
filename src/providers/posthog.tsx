import { useEffect } from 'react'
import { PostHogProvider as BasePostHogProvider, PostHogErrorBoundary, usePostHog } from '@posthog/react'
import type { PostHogConfig } from 'posthog-js'
import { useAuth } from './auth'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_OPTIONS: Partial<PostHogConfig> = {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  defaults: '2026-01-30',
  autocapture: true,
  capture_exceptions: true
}

interface PostHogProviderProps {
  children: React.ReactNode
}

function PostHogTracking({ children }: PostHogProviderProps) {
  const posthog = usePostHog()
  const { user } = useAuth()
  const userId = user?.id
  const userEmail = user?.email

  useEffect(() => {
    if (!userId) {
      posthog.reset()
      return
    }

    posthog.identify(userId, {
      email: userEmail
    })
  }, [posthog, userId, userEmail])

  return children
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  if (!POSTHOG_KEY) return children

  return (
    <BasePostHogProvider apiKey={POSTHOG_KEY} options={POSTHOG_OPTIONS}>
      <PostHogErrorBoundary>
        <PostHogTracking>{children}</PostHogTracking>
      </PostHogErrorBoundary>
    </BasePostHogProvider>
  )
}
