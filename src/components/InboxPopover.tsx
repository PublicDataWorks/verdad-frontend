'use client'

import React, { useState } from 'react'
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
import { InboxIcon } from 'lucide-react'

function Inbox({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { inboxNotifications } = useInboxNotifications()

  const NotificationContent = ({ roomId, user }: { roomId: string; user?: string }) => {
    const { data: snippet } = useSnippet(roomId, 'english')
    const title = snippet?.title || roomId

    if (user) {
      return (
        <>
          {user} mentioned you in snippet <strong className='break-words'>{title}</strong>
        </>
      )
    }
    return (
      <>
        New comment on snippet <strong className='break-words'>{title}</strong>
      </>
    )
  }

  return inboxNotifications.length === 0 ? (
    <div className='p-3 text-center text-sm text-gray-500'>There aren't any notifications yet.</div>
  ) : (
    <div className={className} {...props}>
      <InboxNotificationList className='max-h-[calc(100svh-180px)] divide-y divide-gray-200 overflow-y-auto'>
        {inboxNotifications.map(inboxNotification => (
          <InboxNotification
            key={inboxNotification.id}
            inboxNotification={inboxNotification}
            href={`/snippet/${inboxNotification.roomId}`}
            showActions='hover'
            className='p-3 text-sm'
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
        <Button
          variant='ghost'
          size='icon'
          className='relative h-8 w-8 translate-y-[1px] transform p-0 hover:bg-transparent'
          aria-label='Open notifications'>
          <ErrorBoundary fallback={null}>
            <ClientSideSuspense fallback={null}>
              <InboxPopoverUnreadCount />
            </ClientSideSuspense>
          </ErrorBoundary>
          <InboxIcon className='hover:text-text-primary h-6 w-6 text-white' />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='mr-2 flex max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-[460px] flex-col overflow-hidden rounded-xl bg-white shadow-lg outline-none'
          sideOffset={5}>
          <ErrorBoundary
            fallback={<div className='p-3 text-center text-sm text-red-500'>Error loading notifications</div>}>
            <ClientSideSuspense fallback={<div className='p-3 text-center text-sm'>Loading...</div>}>
              <div className='bg-background-gray-lightest sticky top-0 z-10 flex flex-col border-b border-gray-200 p-3'>
                <h3 className='mb-2 text-base font-semibold'>Notifications</h3>
                <div className='flex space-x-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={markAllInboxNotificationsAsRead}
                    className='flex-1 text-xs text-blue-600 hover:text-blue-700 sm:text-sm'>
                    Mark all as read
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={deleteAllInboxNotifications}
                    className='flex-1 text-xs text-red-600 hover:text-red-700 sm:text-sm'>
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
