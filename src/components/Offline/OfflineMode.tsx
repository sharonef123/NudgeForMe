import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Clock, AlertCircle } from 'lucide-react';

interface QueuedMessage {
  id: string;
  text: string;
  timestamp: Date;
  retryCount: number;
}

interface OfflineModeProps {
  isOnline: boolean;
  onRetry?: () => void;
}

const OfflineMode = ({ isOnline, onRetry }: OfflineModeProps) => {
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [showBanner, setShowBanner] = useState(!isOnline);

  useEffect(() => {
    // Load queued messages from localStorage
    const saved = localStorage.getItem('nudge-offline-queue');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const messages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setQueuedMessages(messages);
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    }
  }, []);

  useEffect(() => {
    setShowBanner(!isOnline);
  }, [isOnline]);

  useEffect(() => {
    // Save queued messages to localStorage
    if (queuedMessages.length > 0) {
      localStorage.setItem('nudge-offline-queue', JSON.stringify(queuedMessages));
    }
  }, [queuedMessages]);

  const addToQueue = (text: string) => {
    const message: QueuedMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      timestamp: new Date(),
      retryCount: 0,
    };
    setQueuedMessages(prev => [...prev, message]);
  };

  const removeFromQueue = (id: string) => {
    setQueuedMessages(prev => prev.filter(m => m.id !== id));
    
    // Update localStorage
    const updated = queuedMessages.filter(m => m.id !== id);
    if (updated.length > 0) {
      localStorage.setItem('nudge-offline-queue', JSON.stringify(updated));
    } else {
      localStorage.removeItem('nudge-offline-queue');
    }
  };

  const clearQueue = () => {
    setQueuedMessages([]);
    localStorage.removeItem('nudge-offline-queue');
  };

  const retryAll = () => {
    onRetry?.();
    // Optionally process queued messages
  };

  if (!showBanner && queuedMessages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down" dir="rtl">
          <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl border-b border-orange-400/30">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-medium">מצב לא מקוון</p>
                  <p className="text-sm text-orange-100">אין חיבור לאינטרנט. ההודעות ישמרו בתור.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {queuedMessages.length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                    {queuedMessages.length} בתור
                  </div>
                )}
                <button
                  onClick={retryAll}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
                >
                  נסה שוב
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-white hover:text-orange-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Restored Banner */}
      {!showBanner && isOnline && queuedMessages.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down" dir="rtl">
          <div className="bg-gradient-to-r from-emerald-500/90 to-blue-500/90 backdrop-blur-xl border-b border-emerald-400/30">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-medium">חיבור חזר!</p>
                  <p className="text-sm text-emerald-100">
                    יש {queuedMessages.length} הודעות ממתינות. לשלוח עכשיו?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={retryAll}
                  className="px-4 py-2 rounded-lg bg-white text-emerald-600 hover:bg-emerald-50 font-medium text-sm transition-colors"
                >
                  שלח הכל
                </button>
                <button
                  onClick={clearQueue}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
                >
                  נקה תור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queued Messages Panel (Optional) */}
      {queuedMessages.length > 0 && (
        <div className="fixed bottom-24 right-4 z-40 w-80 glass-panel rounded-2xl shadow-2xl overflow-hidden" dir="rtl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-medium">הודעות בתור</h3>
            </div>
            <button
              onClick={clearQueue}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              נקה הכל
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto p-3 space-y-2">
            {queuedMessages.map(msg => (
              <div
                key={msg.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{msg.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => removeFromQueue(msg.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Hook for detecting online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default OfflineMode;