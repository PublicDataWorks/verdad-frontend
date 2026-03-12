import posthog from 'posthog-js'

const isEnabled = !!import.meta.env.VITE_POSTHOG_KEY

export function capture(
  ...args: Parameters<typeof posthog.capture>
): ReturnType<typeof posthog.capture> | undefined {
  if (!isEnabled) return
  return posthog.capture(...args)
}

export function captureException(
  ...args: Parameters<typeof posthog.captureException>
): ReturnType<typeof posthog.captureException> | undefined {
  if (!isEnabled) return
  return posthog.captureException(...args)
}
