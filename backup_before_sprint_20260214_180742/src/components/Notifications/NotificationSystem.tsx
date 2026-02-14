import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    (window as any).notify = {
      success: (title: string, message?: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, type: 'success', title, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
      },
      error: (title: string, message?: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, type: 'error', title, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
      },
      warning: (title: string, message?: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, type: 'warning', title, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
      },
      info: (title: string, message?: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, type: 'info', title, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
      },
    };
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3 max-w-md" dir="rtl">
      {notifications.map(notif => (
        <div key={notif.id} className="glass-panel rounded-xl border-2 border-emerald-500/50 p-4 shadow-2xl animate-slide-in-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{notif.title}</h4>
              {notif.message && <p className="text-xs text-gray-300 mt-1">{notif.message}</p>}
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}>
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;