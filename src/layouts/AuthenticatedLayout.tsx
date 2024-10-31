import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react/suspense'
import type { Session, User } from '@supabase/supabase-js'
import HeaderBar from '../components/HeaderBar'
import supabase from '../lib/supabase'
import { useAuth } from '@/providers/auth'

const AuthenticatedLayout: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
  }

  return (
    // <LiveblocksProvider
    //   authEndpoint={async room => {
    //     const response = await fetch(`${baseUrl}/api/liveblocks-auth`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${session.access_token}`
    //       },
    //       body: JSON.stringify({ room })
    //     })
    //     if (!response.ok) throw new Error('Failed to authenticate with Liveblocks')
    //     return response.json()
    //   }}
    //   resolveUsers={async ({ userIds }) => {
    //     try {
    //       const response = await fetch(`${baseUrl}/api/users-by-emails`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Authorization: `Bearer ${session.access_token}`
    //         },
    //         body: JSON.stringify({ userIds })
    //       })

    //       if (!response.ok) {
    //         throw new Error('Failed to fetch users')
    //       }

    //       return await response.json()
    //     } catch (error) {
    //       console.error('Error in resolveUsers:', error)
    //       return []
    //     }
    //   }}
    //   resolveMentionSuggestions={async ({ text, roomId }) => {
    //     try {
    //       const response = await fetch(`${baseUrl}/api/search-users?query=${encodeURIComponent(text)}`, {
    //         method: 'GET',
    //         headers: {
    //           Authorization: `Bearer ${session.access_token}`
    //         }
    //       })

    //       if (!response.ok) {
    //         throw new Error('Failed to fetch user suggestions')
    //       }

    //       // Return the list of user IDs
    //       return await response.json()
    //     } catch (error) {
    //       console.error('Error in resolveMentionSuggestions:', error)
    //       return []
    //     }
    //   }}>
    // <RoomProvider id={import.meta.env.VITE_LIVEBLOCKS_ROOM as string}>
    <div className='flex flex-col'>
      <HeaderBar />
      <div className='flex-grow overflow-hidden bg-ghost-white'>
        <Outlet />
      </div>
    </div>
    //   </RoomProvider>
    // </LiveblocksProvider>
  )
}

export default AuthenticatedLayout
