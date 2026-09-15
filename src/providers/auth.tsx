import type { ReactNode } from 'react'
import type React from 'react'
import { createContext, useEffect, useMemo, useState, useContext } from 'react'
import supabase from '../lib/supabase'
import type { User, AuthError, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>
  logout: () => Promise<{ error: AuthError | null }>
  loginWithGoogle: (redirectTo?: string) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{
    error: AuthError | null
    success?: boolean
  }>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  login: async () => ({ error: null }),
  logout: async () => ({ error: null }),
  loginWithGoogle: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  refreshUser: async () => {}
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession()
        setUser(currentSession?.user ?? null)
        setSession(currentSession)
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void checkUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setUser(nextSession?.user ?? null)
      setSession(nextSession)
    })
    return () => subscription.unsubscribe()
  }, [])

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

  const loginWithGoogle = async (redirectTo?: string): Promise<{ error: AuthError | null }> => {
    try {
      const redirectUrl = `${window.location.origin}${redirectTo || import.meta.env.VITE_AUTH_REDIRECT_URL}`
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

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null; success?: boolean }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`
        }
      })

      if (error) throw error

      return { error: null, success: true }
    } catch (error) {
      console.error('Error signing up:', error)
      return { error: error as AuthError, success: false }
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

  const refreshUser = async () => {
    const {
      data: { session: refreshedSession }
    } = await supabase.auth.refreshSession()
    setUser(refreshedSession?.user ?? null)
    setSession(refreshedSession)
  }

  // The auth helpers only close over stable module/setter references, so the memo depends on state alone.
  const value = useMemo(
    () => ({ user, session, isLoading, login, logout, loginWithGoogle, signUp, refreshUser }),
    [user, session, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The context is created with a default value, so there is nothing to guard against here.
export const useAuth = () => useContext(AuthContext)
