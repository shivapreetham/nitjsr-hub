export interface Notification {
  id: string;
  type: 'message' | 'video_call' | 'market_update' | 'system' | 'attendance_reminder' | 'anonymous_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
  avatarUrl?: string;
  actionUrl?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}