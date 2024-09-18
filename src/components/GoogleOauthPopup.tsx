import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ACCESS_TOKEN, GOOGLE_OAUTH } from '@/constants/misc'

const GoogleOauthPopup = () => {
  const navigate = useNavigate()
  const { onTokenChanged } = useAuth()
  const [externalWindow, setExternalWindow] = useState<Window | null>(null)
  const intervalRef = useRef<number>()

  const clearTimer = () => {
    window.clearInterval(intervalRef.current)
  }

  const handleToken = (token: string) => {
    onTokenChanged(token)
    navigate('/', { replace: true })
  }

  const handleClick = () => {
    const left = window.screenX + (window.outerWidth - 500) / 2
    const top = window.screenY + (window.outerHeight - 500) / 2.5
    setExternalWindow(
      window.open(
        import.meta.env.VITE_GOOGLE_OAUTH_URL as string,
        '_blank',
        `width=500,height=500,left=${left},top=${top}`
      )
    )
  }

  useEffect(() => {
    if (!externalWindow) return

    intervalRef.current = window.setInterval(() => {
      try {
        if (!externalWindow || externalWindow.closed) {
          clearTimer()
          return
        }
        const { hash } = externalWindow.location
        if (!hash) return

        const parameters = new URLSearchParams(hash.slice(1))
        const accessToken = parameters.get(ACCESS_TOKEN)
        if (accessToken) {
          handleToken(accessToken)
          clearTimer()
          externalWindow.close()
        }
      } catch (error) {
        // Ignore errors from cross-origin access attempts
      }
    }, 300)

    return () => {
      clearTimer()
      if (externalWindow) externalWindow.close()
    }
  }, [externalWindow])

  return (
    <Button variant='outline' className='w-full' onClick={handleClick} aria-label={GOOGLE_OAUTH}>
      Login with Google
    </Button>
  )
}

export default GoogleOauthPopup
