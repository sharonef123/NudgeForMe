import { useEffect, useState } from 'react';
import { Bell, X, Info, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { proactiveEngine, ProactiveNotification } from '../../services/proactiveEngine';

const ProactiveNotifications = () => {
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // טען התראות קיימות
    setNotifications(proactiveEngine.getNotifications());

    // האזן להתראות חדשות
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail as ProactiveNotification;
      setNotifications(prev => [notification, ...prev]);
      setIsOpen(true); // פתח אוטומטית
      
      // סגור אוטומטית אחרי 10 שניות אם זה info
      if (notification.type === 'info') {
        setTimeout(() => setIsOpen(false), 10000);
      }
    };

    window.addEventListener('nudge-notification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('nudge-notification', handleNewNotification as EventListener);
    };
  }, []);

  const getIcon = (type: ProactiveNotification['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getColors = (type: ProactiveNotification['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'reminder':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.length;

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* כפתור פעמון */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-full hover:bg-slate-700 transition-all shadow-lg"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* פאנל התראות */}
      {isOpen && (
        <div 
          className="absolute top-16 left-0 w-96 max-h-[500px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl"
          style={{ direction: 'rtl' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white">התראות חכמות</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* התראות */}
          <div className="p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>אין התראות חדשות</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border-2 ${getColors(notif.type)} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{notif.title}</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{notif.message}</p>
                      
                      {notif.action && (
                        <button
                          onClick={notif.action.callback}
                          className="mt-3 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
                        >
                          {notif.action.label}
                        </button>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(notif.timestamp).toLocaleTimeString('he-IL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProactiveNotifications;