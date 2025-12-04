import React, { createContext, useEffect, useState, ReactNode, useContext } from 'react'
import supabase from '../lib/supabase'
import { User, AuthError, Session } from '@supabase/supabase-js'
interface AuthContextType {
  user: User | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>
  logout: () => Promise<{ error: AuthError | null }>
  loginWithGoogle: (redirectTo?: string) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    metadata?: { [key: string]: any }
  ) => Promise<{
    error: AuthError | null
    success?: boolean
  }>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setSession(session)
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }

    checkUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setSession(session)
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
      const redirectUrl = `${window.location.origin}${redirectTo ? redirectTo : import.meta.env.VITE_AUTH_REDIRECT_URL}`
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
      const { error, data } = await supabase.auth.signUp({
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
      data: { session }
    } = await supabase.auth.refreshSession()
    setUser(session?.user ?? null)
    setSession(session)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
        loginWithGoogle,
        signUp,
        refreshUser
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
