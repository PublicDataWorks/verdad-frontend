import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LiveblocksProvider } from '@liveblocks/react/suspense'
import type { Session, User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import HeaderBar from '../components/HeaderBar'
import supabase from '../lib/supabase'

const fetchAllUsers = async () => {
  const { data, error } = await supabase.rpc('get_users')
  if (error) throw error
  return data
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
      users.map(user => ({
        ...user,
        raw_user_meta_data: {
          name: user.raw_user_meta_data?.name || user.email,
          avatar_url: user.raw_user_meta_data?.avatar_url || ''
        }
      }))
  })

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      if (!session) {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      if (!session) {
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
          const user = allUsers.find(u => u.email === userId)
          return {
            name: user?.raw_user_meta_data.name || userId,
            avatar: user?.raw_user_meta_data.avatar_url || ''
          }
        })
        return users
      }}
      resolveMentionSuggestions={async ({ text }) => {
        if (!text) {
          return allUsers.map(user => user.email)
        }

        const filteredData = allUsers.filter(user => {
          const name = user.raw_user_meta_data?.name?.toLowerCase() || ''
          const email = user.email.toLowerCase()
          const searchText = text.toLowerCase()
          return name.includes(searchText) || email.includes(searchText)
        })

        return filteredData.map(user => user.email)
      }}>
      <div className='flex min-h-svh flex-col'>
        <HeaderBar />
        <div className='flex-grow overflow-hidden bg-background'>
          <Outlet />
        </div>
      </div>
    </LiveblocksProvider>
  )
}

export default AuthenticatedLayout
