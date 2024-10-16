import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react/suspense'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import HeaderBar from '../components/HeaderBar'

interface AuthenticatedLayoutProps {
  supabase: SupabaseClient
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ supabase }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const baseUrl = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      if (!session) navigate('/login')
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      if (!session) navigate('/login')
    })

    return () => subscription.unsubscribe()
  }, [supabase, navigate])

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
        try {
          const response = await fetch(`${baseUrl}/api/users-by-emails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ userIds })
          })

          if (!response.ok) {
            throw new Error('Failed to fetch users')
          }

          return await response.json()
        } catch (error) {
          console.error('Error in resolveUsers:', error)
          return []
        }
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        try {
          const response = await fetch(`${baseUrl}/api/search-users?query=${encodeURIComponent(text)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to fetch user suggestions')
          }

          // Return the list of user IDs
          return await response.json()
        } catch (error) {
          console.error('Error in resolveMentionSuggestions:', error)
          return []
        }
      }}
    >
      <RoomProvider id={import.meta.env.VITE_LIVEBLOCKS_ROOM as string}>
        <div className='flex flex-col'>
          <HeaderBar user={user} />
          <div className='flex-grow overflow-hidden bg-ghost-white'>
            <Outlet />
          </div>
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

export default AuthenticatedLayout
