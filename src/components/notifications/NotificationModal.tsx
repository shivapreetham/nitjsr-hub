'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Bell, MessageCircle, Video, ShoppingBag, Settings, Check, CheckCheck } from 'lucide-react';
import { useNotification } from '@/context/NotificationProvider';
import { Notification } from '@/shared/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageCircle;
    case 'video_call':
      return Video;
    case 'market_update':
      return ShoppingBag;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return 'text-blue-500';
    case 'video_call':
      return 'text-green-500';
    case 'market_update':
      return 'text-purple-500';
    default:
      return 'text-gray-500';
  }
};

const NotificationModal: React.FC = () => {
  const { isOpen, setIsOpen, notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotification();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-hidden">
          <div className="flex min-h-full items-center justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-background border-l shadow-xl transition-all h-full">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-foreground" />
                      <Dialog.Title className="text-lg font-semibold text-foreground">
                        Notifications
                      </Dialog.Title>
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="flex items-center gap-1 text-xs"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearNotifications}
                      disabled={notifications.length === 0}
                      className="flex items-center gap-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </Button>
                  </div>

                  {/* Notifications list */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.map((notification) => {
                          const Icon = getNotificationIcon(notification.type);
                          const colorClass = getNotificationColor(notification.type);
                          
                          return (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                                !notification.read ? 'bg-muted/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 ${colorClass}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="flex-shrink-0 ml-2">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NotificationModal;