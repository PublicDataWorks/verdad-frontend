import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInboxNotifications } from '@liveblocks/react'
import { InboxNotification } from '@liveblocks/react-ui'
import { User } from '@supabase/supabase-js';
import { InboxPopover } from './InboxPopover';

interface HeaderBarProps {
  user: User;
}

const NotificationsList = () => {
  const { inboxNotifications, error, isLoading } = useInboxNotifications();

  if (isLoading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading notifications: {error.message}</div>;
  }

  if (inboxNotifications.length === 0) {
    return <div className="p-4 text-center">No notifications</div>;
  }

  return (
    <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
      {inboxNotifications.map((notification) => (
        <InboxNotification
          key={notification.id}
          inboxNotification={notification}
        />
      ))}
    </DropdownMenuContent>
  );
};


const HeaderBar: React.FC<HeaderBarProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-blue-50 flex items-center justify-between px-8 py-2 border-b border-blue-600">
      <Link to="/" className="no-underline">
        <div className="font-inter text-2xl font-bold leading-7 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 py-2 cursor-pointer">
          VERDAD
        </div>
      </Link>
      <div className="flex items-center space-x-4">
        <InboxPopover />
        <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
          <Moon className="h-6 w-6 text-blue-600 hover:bg-gray-50" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 p-0 hover:bg-gray-50">
          {user.user_metadata.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User Avatar"
              className="h-6 w-6 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
              {getInitials(user.email || '')}
            </div>
          )}
        </Button>
      </div>
    </header>
  );
};

export default HeaderBar;
