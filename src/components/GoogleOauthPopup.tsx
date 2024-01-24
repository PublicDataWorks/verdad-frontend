import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTokenChanged } from '../providers/auth'
import { ACCESS_TOKEN, GOOGLE_OAUTH } from '../constants/misc'

const GoogleOauthPopup = () => {
  const navigate = useNavigate()
  const { onTokenChanged } = useTokenChanged()
  const [externalWindow, setExternalWindow] = useState<Window | null>()
  const intervalReference = useRef<number>()

  const clearTimer = () => {
    window.clearInterval(intervalReference.current)
  }

  const onToken = (token: string) => {
    onTokenChanged(token)
    navigate('/', { replace: true }) // TODO: make it constant
  }

  const onClick = () => {
    const left = window.screenX + (window.outerWidth - 500) / 2
    const top = window.screenY + (window.outerHeight - 500) / 2.5
    setExternalWindow(
      window.open((import.meta.env.VITE_GOOGLE_OAUTH_URL as string), '_blank', `width=500,height=500,left=${left},top=${top}`)
    )
  }

  useEffect(() => {
    if (externalWindow) {
      intervalReference.current = window.setInterval(() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!externalWindow || externalWindow.closed) {
            clearTimer()
            return
          }
          const { hash } = externalWindow.location
          if (!hash) {
            return
          }
          // hash=#access_token=abcd&refresh_token=1234
          onToken(hash.slice(1))
          const parameters = new URLSearchParams(hash.slice(1))
          const accessToken = parameters.get(ACCESS_TOKEN)
          if (accessToken) {
            onToken(accessToken)
            clearTimer()
            externalWindow.close()
          }
        } catch (error) {
          // thrown by const { hash } = externalWindow.location
          // No need to worry here, wait a bit longer til the oauth flow call back
        }
      }, 300)
    }
    return () => {
      if (externalWindow) externalWindow.close()
    }
  }, [externalWindow])

  return (
    <button type='button' onClick={onClick} aria-label={GOOGLE_OAUTH}>
      Login with Google
    </button>
  )
}

export default GoogleOauthPopup
