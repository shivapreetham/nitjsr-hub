'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '@/context/NotificationProvider';
import { Button } from '@/components/ui/button';

const NotificationButton: React.FC = () => {
  const { setIsOpen, unreadCount } = useNotification();

  return (
    <div className="glass-card p-2 rounded-xl m-2 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-6 w-6 p-0 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 relative"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[16px] h-4">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default NotificationButton;