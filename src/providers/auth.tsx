import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

interface TokenContextValue {
  token: string | null
}

interface TokenChangedValue {
  onTokenChanged: (token: string) => void
}

const TokenContext = createContext<TokenContextValue>(null!)
const TokenChangedContext = createContext<TokenChangedValue>(null!)

interface AuthProviderProps {
  children: React.ReactNode
  supabaseClient: SupabaseClient
}

export function AuthProvider({ children, supabaseClient }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)

  const onTokenChanged = useCallback((accessToken: string) => {
    setToken(accessToken || null)
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabaseClient.auth.getSession()
      if (session) {
        onTokenChanged(session.access_token)
      }
    }
    checkSession()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        onTokenChanged(session.access_token)
      } else {
        onTokenChanged('')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [onTokenChanged, supabaseClient])

  const tokenContextValue = useMemo(() => ({ token }), [token])
  const tokenChangedContextValue = useMemo(() => ({ onTokenChanged }), [onTokenChanged])

  return (
    <TokenChangedContext.Provider value={tokenChangedContextValue}>
      <TokenContext.Provider value={tokenContextValue}>{children}</TokenContext.Provider>
    </TokenChangedContext.Provider>
  )
}

export const useToken = (): TokenContextValue => {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error('useToken must be used within an AuthProvider')
  }
  return context
}

export const useTokenChanged = (): TokenChangedValue['onTokenChanged'] => {
  const context = useContext(TokenChangedContext)
  if (!context) {
    throw new Error('useTokenChanged must be used within an AuthProvider')
  }
  return context.onTokenChanged
}
