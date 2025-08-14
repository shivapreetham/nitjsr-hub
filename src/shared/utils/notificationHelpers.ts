import { Notification } from '@/shared/types/notification';

export const createMessageNotification = (
  sender: string,
  message: string,
  avatarUrl?: string,
  chatId?: string
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'message',
  title: `New message from ${sender}`,
  message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
  userId: sender,
  avatarUrl,
  actionUrl: chatId ? `/chat/${chatId}` : '/chat'
});

export const createVideoCallNotification = (
  caller: string,
  callType: 'incoming' | 'missed' = 'incoming',
  avatarUrl?: string
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'video_call',
  title: callType === 'incoming' ? `Incoming call from ${caller}` : `Missed call from ${caller}`,
  message: callType === 'incoming' ? 'Tap to join the call' : 'You missed a video call',
  userId: caller,
  avatarUrl,
  actionUrl: '/videoChat'
});

export const createMarketUpdateNotification = (
  title: string,
  description: string,
  productId?: string
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'market_update',
  title,
  message: description,
  actionUrl: productId ? `/market/product/${productId}` : '/market'
});

export const createSystemNotification = (
  title: string,
  message: string,
  actionUrl?: string
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'system',
  title,
  message,
  actionUrl
});

export const createAttendanceReminderNotification = (
  title: string = 'Attendance Reminder',
  message: string = 'Don\'t forget to mark your attendance for today\'s classes'
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'attendance_reminder',
  title,
  message,
  actionUrl: '/attendance'
});

export const createAnonymousMessageNotification = (
  message: string
): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'anonymous_message',
  title: 'New Anonymous Message',
  message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
  actionUrl: '/anonymous'
});

