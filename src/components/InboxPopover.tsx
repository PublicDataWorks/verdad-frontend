'use client'

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'
import { useState } from 'react'
import type { InboxNotificationData } from '@liveblocks/client'
import * as Popover from '@radix-ui/react-popover'
import {
  useDeleteAllInboxNotifications,
  useDeleteInboxNotification,
  useInboxNotifications,
  useMarkAllInboxNotificationsAsRead,
  useMarkInboxNotificationAsRead,
  useUnreadInboxNotificationsCount
} from '@liveblocks/react'
import { Link } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { InboxIcon, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { useSnippet } from '../hooks/useSnippets'

interface InboxNotificationItemProps {
  notification: InboxNotificationData
}

function isNotificationUnread(notification: InboxNotificationData) {
  return !notification.readAt || notification.notifiedAt > notification.readAt
}

function formatNotificationDate(date: Date) {
  return date.toLocaleString(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short'
  })
}

function InboxNotificationTitle({
  notification,
  title
}: {
  notification: InboxNotificationData
  title: string
}): ReactNode {
  if (notification.kind === 'textMention') {
    return (
      <>
        {notification.createdBy} mentioned you in snippet <strong className='break-words'>{title}</strong>
      </>
    )
  }

  if (notification.kind === 'thread') {
    return (
      <>
        New comment on snippet <strong className='break-words'>{title}</strong>
      </>
    )
  }

  return (
    <>
      New notification on snippet <strong className='break-words'>{title}</strong>
    </>
  )
}

function InboxNotificationItem({ notification }: InboxNotificationItemProps) {
  const markInboxNotificationAsRead = useMarkInboxNotificationAsRead()
  const deleteInboxNotification = useDeleteInboxNotification()
  const { data: snippet } = useSnippet(notification.roomId ?? '', 'english')
  const title = snippet?.title ?? notification.roomId ?? 'this item'
  const isUnread = isNotificationUnread(notification)

  const handleOpen = () => {
    if (isUnread) {
      markInboxNotificationAsRead(notification.id)
    }
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    deleteInboxNotification(notification.id)
  }

  const content = (
    <div className='flex items-start gap-2'>
      <span
        aria-hidden='true'
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-blue-600' : 'bg-transparent'}`}
      />
      <div className='min-w-0 flex-1'>
        <p className='text-sm leading-5 text-gray-900'>
          <InboxNotificationTitle notification={notification} title={title} />
        </p>
        <p className='mt-1 text-xs text-gray-500'>{formatNotificationDate(notification.notifiedAt)}</p>
      </div>
    </div>
  )

  return (
    <li className={`group flex items-start border-b border-gray-200 ${isUnread ? 'bg-blue-50/70' : 'bg-white'}`}>
      {notification.roomId ? (
        <Link
          className='min-w-0 flex-1 p-3 no-underline hover:bg-gray-50'
          to={`/snippet/${notification.roomId}`}
          onClick={handleOpen}
        >
          {content}
        </Link>
      ) : (
        <div className='min-w-0 flex-1 p-3'>{content}</div>
      )}
      <Button
        aria-label='Delete notification'
        className='mr-2 mt-2 h-8 w-8 shrink-0 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100'
        onClick={handleDelete}
        size='icon'
        type='button'
        variant='ghost'
      >
        <Trash2 className='h-4 w-4 text-red-600' />
      </Button>
    </li>
  )
}

function Inbox({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const { inboxNotifications, error, fetchMore, fetchMoreError, hasFetchedAll, isFetchingMore, isLoading } =
    useInboxNotifications()

  if (isLoading) {
    return <div className='p-3 text-center text-sm text-gray-500'>Loading...</div>
  }

  if (error) {
    return <div className='p-3 text-center text-sm text-red-500'>Error loading notifications</div>
  }

  return inboxNotifications.length === 0 ? (
    <div className='p-3 text-center text-sm text-gray-500'>There are no notifications yet.</div>
  ) : (
    <div className={className} {...props}>
      <ol className='max-h-[calc(100svh-180px)] overflow-y-auto'>
        {inboxNotifications.map(inboxNotification => (
          <InboxNotificationItem key={inboxNotification.id} notification={inboxNotification} />
        ))}
        {fetchMoreError ? (
          <li className='p-3 text-center text-sm text-red-500'>Error loading more notifications</li>
        ) : null}
        {hasFetchedAll ? null : (
          <li className='p-3'>
            <Button
              className='w-full text-xs text-blue-600 hover:text-blue-700'
              disabled={isFetchingMore}
              onClick={fetchMore}
              size='sm'
              type='button'
              variant='ghost'
            >
              {isFetchingMore ? 'Loading...' : 'Load more'}
            </Button>
          </li>
        )}
      </ol>
    </div>
  )
}

function InboxPopoverUnreadCount() {
  const { count, error, isLoading } = useUnreadInboxNotificationsCount()

  if (isLoading) {
    return null
  }

  if (error) {
    return null
  }

  if (count === 0) {
    return null
  }

  return (
    <div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white'>
      {count}
    </div>
  )
}

function InboxPopover() {
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
          aria-label='Open notifications'
        >
          <ErrorBoundary fallback={null}>
            <InboxPopoverUnreadCount />
          </ErrorBoundary>
          <InboxIcon className='h-6 w-6 text-white hover:text-text-primary' />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className='mr-2 flex max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-[460px] flex-col overflow-hidden rounded-xl bg-white shadow-lg outline-none'
          sideOffset={5}
        >
          <ErrorBoundary
            fallback={<div className='p-3 text-center text-sm text-red-500'>Error loading notifications</div>}
          >
            <div className='sticky top-0 z-10 flex flex-col border-b border-gray-200 bg-background-gray-lightest p-3'>
              <h3 className='mb-2 text-base font-semibold'>Notifications</h3>
              <div className='flex space-x-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={markAllInboxNotificationsAsRead}
                  className='flex-1 text-xs text-blue-600 hover:text-blue-700 sm:text-sm'
                >
                  Mark all as read
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={deleteAllInboxNotifications}
                  className='flex-1 text-xs text-red-600 hover:text-red-700 sm:text-sm'
                >
                  Delete all
                </Button>
              </div>
            </div>
            <Inbox />
          </ErrorBoundary>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default InboxPopover
