import React, { useState, useEffect } from 'react'
import { InboxNotification, InboxNotificationList } from '@liveblocks/react-ui'
import * as Popover from '@radix-ui/react-popover'
import {
  useDeleteAllInboxNotifications,
  useInboxNotifications,
  useMarkAllInboxNotificationsAsRead,
  useUnreadInboxNotificationsCount
} from '@liveblocks/react'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from 'react-error-boundary'
import { ClientSideSuspense } from '@liveblocks/react'
import { useSnippet } from '@/hooks/useSnippets'

function Inbox({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { inboxNotifications } = useInboxNotifications()

  const NotificationContent = ({ roomId, user }: { roomId: string; user?: string }) => {
    const { data: snippet } = useSnippet(roomId, 'english')
    const title = snippet?.title || roomId

    if (user) {
      return (
        <>
          {user} mentioned you in snippet <strong>{title}</strong>
        </>
      )
    }
    return (
      <>
        New comment on snippet <strong>{title}</strong>
      </>
    )
  }

  return inboxNotifications.length === 0 ? (
    <div className='p-4 text-center text-gray-500'>There aren't any notifications yet.</div>
  ) : (
    <div className={className} {...props}>
      <InboxNotificationList className='max-h-[calc(100vh-10rem)] divide-y divide-gray-200 overflow-y-auto'>
        {inboxNotifications.map(inboxNotification => (
          <InboxNotification
            key={inboxNotification.id}
            inboxNotification={inboxNotification}
            href={`/snippet/${inboxNotification.roomId}`}
            showActions='hover'
            overrides={{
              INBOX_NOTIFICATION_THREAD_COMMENTS_LIST: (list, room) => (
                <NotificationContent roomId={inboxNotification.roomId} />
              ),
              INBOX_NOTIFICATION_THREAD_MENTION: (user, room) => (
                <NotificationContent roomId={inboxNotification.roomId} user={user} />
              ),
              INBOX_NOTIFICATION_TEXT_MENTION: (user, room) => (
                <NotificationContent roomId={inboxNotification.roomId} user={user} />
              )
            }}
          />
        ))}
      </InboxNotificationList>
    </div>
  )
}

function InboxPopoverUnreadCount() {
  const { count } = useUnreadInboxNotificationsCount()
  return count ? (
    <div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
      {count}
    </div>
  ) : null
}

export function InboxPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const markAllInboxNotificationsAsRead = useMarkAllInboxNotificationsAsRead()
  const deleteAllInboxNotifications = useDeleteAllInboxNotifications()

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant='ghost' size='icon' className='relative h-8 w-8 p-0 hover:bg-transparent'>
          <ErrorBoundary fallback={null}>
            <ClientSideSuspense fallback={null}>
              <InboxPopoverUnreadCount />
            </ClientSideSuspense>
          </ErrorBoundary>
          <svg className='h-8 w-8 text-white' fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
            <path
              d='m3.6 9.8 1.9-4.6A2 2 0 0 1 7.3 4h5.4a2 2 0 0 1 1.8 1.2l2 4.6V13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V9.8Z'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinejoin='round'
            />
            <path
              d='M3.5 10h3c.3 0 .6.1.8.4l.9 1.2c.2.3.5.4.8.4h2c.3 0 .6-.1.8-.4l.9-1.2c.2-.3.5-.4.8-.4h3'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinejoin='round'
            />
          </svg>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='flex max-h-[calc(100vh-5rem)] w-[460px] flex-col overflow-hidden rounded-xl bg-white shadow-lg outline-none'
          sideOffset={5}>
          <ErrorBoundary fallback={<div className='p-4 text-center text-red-500'>Error loading notifications</div>}>
            <ClientSideSuspense fallback={<div className='p-4 text-center'>Loading...</div>}>
              <div className='sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4'>
                <h3 className='text-lg font-semibold'>Notifications</h3>
                <div className='flex space-x-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={markAllInboxNotificationsAsRead}
                    className='text-sm text-blue-600 hover:text-blue-700'>
                    Mark all as read
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={deleteAllInboxNotifications}
                    className='text-sm text-red-600 hover:text-red-700'>
                    Delete all
                  </Button>
                </div>
              </div>
              <Inbox />
            </ClientSideSuspense>
          </ErrorBoundary>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
