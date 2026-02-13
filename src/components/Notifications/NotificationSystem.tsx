import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'from-emerald-500/20 to-green-500/20 border-emerald-500/30';
      case 'error':
        return 'from-red-500/20 to-rose-500/20 border-red-500/30';
      case 'warning':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'info':
      default:
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl backdrop-blur-xl border
                bg-gradient-to-br ${getColors()} shadow-2xl
                ${isLeaving ? 'animate-fade-out' : 'animate-slide-in-right'}`}
      dir="rtl"
    >
      <div className="flex-shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium">{notification.title}</h4>
        {notification.message && (
          <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
        )}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-sm font-medium text-white hover:underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        aria-label="סגור"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Expose methods globally
  useEffect(() => {
    (window as any).notify = {
      success: (title: string, message?: string, duration?: number) =>
        addNotification({ type: 'success', title, message, duration }),
      error: (title: string, message?: string, duration?: number) =>
        addNotification({ type: 'error', title, message, duration }),
      info: (title: string, message?: string, duration?: number) =>
        addNotification({ type: 'info', title, message, duration }),
      warning: (title: string, message?: string, duration?: number) =>
        addNotification({ type: 'warning', title, message, duration }),
      custom: (notification: Omit<Notification, 'id'>) =>
        addNotification(notification),
    };

    return () => {
      delete (window as any).notify;
    };
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-[9999] space-y-3 max-w-md pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;

// TypeScript declarations for global notify
declare global {
  interface Window {
    notify: {
      success: (title: string, message?: string, duration?: number) => void;
      error: (title: string, message?: string, duration?: number) => void;
      info: (title: string, message?: string, duration?: number) => void;
      warning: (title: string, message?: string, duration?: number) => void;
      custom: (notification: Omit<Notification, 'id'>) => void;
    };
  }
}