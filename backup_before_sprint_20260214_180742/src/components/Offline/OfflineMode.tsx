import { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.notify?.success('חיבור חזר!', 'אתה מחובר שוב לאינטרנט');
    };

    const handleOffline = () => {
      setIsOnline(false);
      window.notify?.warning('אין חיבור', 'אתה במצב לא מקוון');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

interface OfflineModeProps {
  isOnline: boolean;
}

const OfflineMode = ({ isOnline }: OfflineModeProps) => {
  const [show, setShow] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  const baseClasses = 'glass-panel rounded-xl border-2 shadow-2xl p-4';
  const statusClasses = isOnline
    ? 'border-emerald-500/50 bg-emerald-500/10'
    : 'border-yellow-500/50 bg-yellow-500/10';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down" dir="rtl">
      <div className={baseClasses + ' ' + statusClasses}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Wifi className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-300">חיבור חזר!</p>
                <p className="text-xs text-emerald-400/70">מחובר לאינטרנט</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <WifiOff className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-300">מצב לא מקוון</p>
                <p className="text-xs text-yellow-400/70">ההודעות ישמרו בתור</p>
              </div>
              <AlertCircle className="w-4 h-4 text-yellow-400 ml-2" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;