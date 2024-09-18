import { useEffect } from 'react'
import { ACCESS_TOKEN } from '@/constants/misc'

const GoogleOAuthCallback = () => {
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get(ACCESS_TOKEN)

    if (accessToken) {
      window.opener.postMessage({ type: 'GOOGLE_OAUTH_TOKEN', token: accessToken }, window.location.origin)
      window.close()
    }
  }, [])

  return <div>Processing Google OAuth...</div>
}

export default GoogleOAuthCallback
