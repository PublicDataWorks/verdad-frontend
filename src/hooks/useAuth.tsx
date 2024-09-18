import { useState } from 'react'

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null)

  const onTokenChanged = (newToken: string) => {
    setToken(newToken)
    // Add any other logic for token change
  }

  return { onTokenChanged, token }
}
