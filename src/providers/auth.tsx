import React, { createContext, useEffect, useState, ReactNode, useContext } from 'react'
import supabase from '../lib/supabase'
import { User, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>
  logout: () => Promise<{ error: AuthError | null }>
  loginWithGoogle: () => Promise<{ error: AuthError | null }>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ error: null }),
  logout: async () => ({ error: null }),
  loginWithGoogle: async () => ({ error: null })
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mounted) return // Skip if already mounted

    const abortController = new AbortController()

    const checkUser = async () => {
      try {
        if (abortController.signal.aborted) return

        const {
          data: { session }
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error checking user:', error)
        }
      }
    }

    checkUser()
    setMounted(true)

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' && !abortController.signal.aborted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      abortController.abort()
      subscription.unsubscribe()
    }
  }, [mounted])

  const login = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error logging in:', error)
      return { error: error as AuthError }
    }
  }

  const loginWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    try {
      const redirectUrl = (import.meta.env.VITE_AUTH_REDIRECT_URL as string) || '/search'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error logging in with Google:', error)
      return { error: error as AuthError }
    }
  }

  const logout = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error logging out:', error)
      return { error: error as AuthError }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loginWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
