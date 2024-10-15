import React, { useState } from 'react';
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import * as Popover from "@radix-ui/react-popover";
import {
  useDeleteAllInboxNotifications,
  useInboxNotifications,
  useMarkAllInboxNotificationsAsRead,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react";
import { Button } from "@/components/ui/button";

function Inbox() {
  const { inboxNotifications } = useInboxNotifications();

  return inboxNotifications.length === 0 ? (
    <div className="p-4 text-center text-gray-500">
      There aren't any notifications yet.
    </div>
  ) : (
    <InboxNotificationList className="max-h-[calc(100vh-10rem)] overflow-y-auto divide-y divide-gray-200">
      {inboxNotifications.map((inboxNotification) => (
        <InboxNotification
          key={inboxNotification.id}
          inboxNotification={inboxNotification}
        />
      ))}
    </InboxNotificationList>
  );
}

function InboxPopoverUnreadCount() {
  const { count } = useUnreadInboxNotificationsCount();
  return count ? (
    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
      {count}
    </div>
  ) : null;
}

export function InboxPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const markAllInboxNotificationsAsRead = useMarkAllInboxNotificationsAsRead();
  const deleteAllInboxNotifications = useDeleteAllInboxNotifications();

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8 p-0 relative">
          <InboxPopoverUnreadCount />
          <svg className="w-5 h-5 text-blue-600" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="m3.6 9.8 1.9-4.6A2 2 0 0 1 7.3 4h5.4a2 2 0 0 1 1.8 1.2l2 4.6V13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V9.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M3.5 10h3c.3 0 .6.1.8.4l.9 1.2c.2.3.5.4.8.4h2c.3 0 .6-.1.8-.4l.9-1.2c.2-.3.5-.4.8-.4h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="bg-white shadow-lg rounded-xl w-[460px] max-h-[calc(100vh-5rem)] flex flex-col outline-none overflow-hidden" sideOffset={5}>
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllInboxNotificationsAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteAllInboxNotifications}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Delete all
              </Button>
            </div>
          </div>
          <Inbox />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
