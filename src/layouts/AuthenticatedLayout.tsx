import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LiveblocksProvider } from '@liveblocks/react/suspense'
import type { Session, User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import HeaderBar from '../components/HeaderBar'
import supabase from '../lib/supabase'
import { timedRpc } from '@/lib/timedRpc'

// Minimal local shape of the `get_users` RPC result (Supabase types are not generated yet).
interface AppUser {
  email: string
  raw_user_meta_data?: { name?: string; avatar_url?: string }
}

const fetchAllUsers = async (): Promise<AppUser[]> => {
  const { data } = await timedRpc<AppUser[] | null>('get_users')
  return data ?? []
}

const AuthenticatedLayout: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const baseUrl = import.meta.env.VITE_BASE_URL

  // Use React Query to fetch and cache users
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
    enabled: !!session,
    select: users =>
      users.map(entry => ({
        ...entry,
        raw_user_meta_data: {
          name: entry.raw_user_meta_data?.name || entry.email,
          avatar_url: entry.raw_user_meta_data?.avatar_url || ''
        }
      }))
  })

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user || null)
      if (!currentSession) {
        const snippetMatch = location.pathname.match(/^\/snippet\/(.+)$/)
        if (snippetMatch) {
          navigate(`/p/${snippetMatch[1]}`)
        } else {
          navigate('/login')
        }
      }
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user || null)
      if (!nextSession) {
        const snippetMatch = location.pathname.match(/^\/snippet\/(.+)$/)
        if (snippetMatch) {
          navigate(`/p/${snippetMatch[1]}`)
        } else {
          navigate('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, location.pathname])

  if (!session || !user) return null

  return (
    <LiveblocksProvider
      authEndpoint={async room => {
        const response = await fetch(`${baseUrl}/api/liveblocks-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ room })
        })
        if (!response.ok) throw new Error('Failed to authenticate with Liveblocks')
        return response.json()
      }}
      resolveUsers={async ({ userIds }) => {
        const users = userIds.map(userId => {
          const match = allUsers.find(u => u.email === userId)
          return {
            name: match?.raw_user_meta_data.name || userId,
            avatar: match?.raw_user_meta_data.avatar_url || ''
          }
        })
        return users
      }}
      resolveMentionSuggestions={async ({ text }) => {
        if (!text) {
          return allUsers.map(entry => entry.email)
        }

        const filteredData = allUsers.filter(entry => {
          const name = entry.raw_user_meta_data.name?.toLowerCase() || ''
          const email = entry.email.toLowerCase()
          const searchText = text.toLowerCase()
          return name.includes(searchText) || email.includes(searchText)
        })

        return filteredData.map(entry => entry.email)
      }}
    >
      <div className='flex min-h-svh flex-col'>
        <HeaderBar />
        <div className='flex-grow overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </LiveblocksProvider>
  )
}

export default AuthenticatedLayout
