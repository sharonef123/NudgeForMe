import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Global notification function
    (window as any).notify = {
      success: (title: string, message?: string) => addNotification('success', title, message),
      error: (title: string, message?: string) => addNotification('error', title, message),
      warning: (title: string, message?: string) => addNotification('warning', title, message),
      info: (title: string, message?: string) => addNotification('info', title, message),
    };

    return () => {
      delete (window as any).notify;
    };
  }, []);

  const addNotification = (type: Notification['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, title, message, duration: 5000 };
    
    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      removeNotification(id);
    }, notification.duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'from-emerald-500 to-teal-500 border-emerald-500/50';
      case 'error': return 'from-red-500 to-rose-500 border-red-500/50';
      case 'warning': return 'from-yellow-500 to-amber-500 border-yellow-500/50';
      case 'info': return 'from-blue-500 to-cyan-500 border-blue-500/50';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-[100] space-y-3 max-w-md" dir="rtl">
      {notifications.map(notification => {
        const Icon = getIcon(notification.type);
        return (
          <div
            key={notification.id}
            className={\glass-panel rounded-xl border-2 \ 
                      shadow-2xl animate-slide-in-left overflow-hidden\}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={\p-2 rounded-lg bg-gradient-to-br \\}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white mb-1">
                    {notification.title}
                  </h4>
                  {notification.message && (
                    <p className="text-xs text-gray-300">
                      {notification.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeNotification(notification.id)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10 overflow-hidden">
              <div
                className={\h-full bg-gradient-to-r \ animate-progress\}
                style={{ animationDuration: \\ms\ }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;