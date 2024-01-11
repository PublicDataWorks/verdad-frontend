import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import axios from '../lib/axios'

interface TokenContextValue {
  token: string | undefined
}

interface TokenChangedValue {
  onTokenChanged: (token: string) => void
}

const TokenContext = createContext<TokenContextValue>({} as TokenContextValue)
const TokenChangedContext = createContext<TokenChangedValue>({} as TokenChangedValue)

interface AuthProviderProperties {
  children: React.ReactNode
}

function AuthProvider({ children }: AuthProviderProperties) {
  const [token, setToken] = useState<string>()

  const onTokenChanged = useCallback((accessToken: string | null) => {
    if (accessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      // Missive.storeSet('token', accessToken)
      localStorage.setItem('token', accessToken)
      setToken(accessToken)
    } else {
      delete axios.defaults.headers.common.Authorization
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      // Missive.storeSet('token', '')
      localStorage.setItem('token', '')
      setToken('')
    }
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('token')
    onTokenChanged(accessToken)
    // // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    // Missive.storeGet('token')
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //   .then((accessToken: string) => {
    //     onTokenChanged(accessToken)
    //   })
  })

  const tokenContextValue = useMemo(() => ({ token }), [token])

  const tokenChangedContextValue = useMemo(() => ({ onTokenChanged }), [onTokenChanged])

  return (
    <TokenChangedContext.Provider value={tokenChangedContextValue}>
      <TokenContext.Provider value={tokenContextValue}>{children}</TokenContext.Provider>
    </TokenChangedContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export const useToken = () => useContext(TokenContext)
export const useTokenChanged = () => useContext(TokenChangedContext)

export default AuthProvider
