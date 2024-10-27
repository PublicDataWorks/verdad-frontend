import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInboxNotifications } from '@liveblocks/react'
import { InboxNotification } from '@liveblocks/react-ui'
import { User } from '@supabase/supabase-js'
import { InboxPopover } from './InboxPopover'
import { useAuth } from '@/providers/auth'

const NotificationsList = () => {
  const { inboxNotifications, error, isLoading } = useInboxNotifications()

  if (isLoading) {
    return <div className='p-4 text-center'>Loading notifications...</div>
  }

  if (error) {
    return <div className='p-4 text-center text-red-500'>Error loading notifications: {error.message}</div>
  }

  if (inboxNotifications.length === 0) {
    return <div className='p-4 text-center'>No notifications</div>
  }

  return (
    <DropdownMenuContent className='max-h-96 w-80 overflow-y-auto'>
      {inboxNotifications.map(notification => (
        <InboxNotification key={notification.id} inboxNotification={notification} />
      ))}
    </DropdownMenuContent>
  )
}

const HeaderBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <header className='flex items-center justify-between border-b border-blue-600 bg-blue-50 px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text py-2 text-2xl font-bold leading-7 tracking-wide text-transparent'>
          VERDAD
        </div>
      </Link>
      <div className='flex items-center space-x-4'>
        <InboxPopover />
        <Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
          <Moon className='h-6 w-6 text-blue-600 hover:bg-gray-50' />
        </Button>
        <Button variant='ghost' size='icon' className='h-8 w-8 p-0 hover:bg-gray-50'>
          {user?.user_metadata.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt='User Avatar'
              className='h-6 w-6 rounded-full'
              referrerPolicy='no-referrer'
            />
          ) : (
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
              {getInitials(user?.email || '')}
            </div>
          )}
        </Button>
      </div>
    </header>
  )
}

export default HeaderBar
