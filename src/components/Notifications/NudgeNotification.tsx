import { useState, useEffect } from 'react';
import { X, MessageCircle, Bell, Clock, Sparkles } from 'lucide-react';
import { NudgeMessage } from '../../services/proactiveService';

interface NudgeNotificationProps {
  nudge: NudgeMessage | null;
  onAccept: (nudge: NudgeMessage) => void;
  onDismiss: () => void;
}

const PRIORITY_STYLES = {
  high: 'border-emerald-500/60 from-emerald-500/20 to-teal-500/10',
  medium: 'border-blue-500/60 from-blue-500/20 to-cyan-500/10',
  low: 'border-purple-500/60 from-purple-500/20 to-pink-500/10',
};

const TYPE_COLORS = {
  morning: 'from-amber-500 to-orange-500',
  evening: 'from-indigo-500 to-purple-500',
  midday: 'from-cyan-500 to-blue-500',
  manual: 'from-emerald-500 to-teal-500',
  reminder: 'from-rose-500 to-pink-500',
};

const NudgeNotification = ({ nudge, onAccept, onDismiss }: NudgeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (nudge) {
      setIsLeaving(false);
      // קצת delay לאנימציה
      setTimeout(() => setIsVisible(true), 50);

      // auto-dismiss אחרי 30 שניות
      const timer = setTimeout(() => handleDismiss(), 30000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [nudge]);

  const handleAccept = () => {
    if (!nudge) return;
    setIsLeaving(true);
    setTimeout(() => {
      onAccept(nudge);
      setIsVisible(false);
    }, 300);
  };

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss();
      setIsVisible(false);
    }, 300);
  };

  if (!nudge || !isVisible) return null;

  const priorityStyle = PRIORITY_STYLES[nudge.priority];
  const typeColor = TYPE_COLORS[nudge.type] || TYPE_COLORS.manual;

  return (
    <div
      dir="rtl"
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm w-full
        transition-all duration-300 ease-out
        ${isLeaving ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}
      `}
    >
      <div
        className={`
          rounded-2xl border-2 bg-gradient-to-br ${priorityStyle}
          backdrop-blur-xl shadow-2xl overflow-hidden
        `}
        style={{ background: 'rgba(15, 23, 42, 0.92)' }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${typeColor} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{nudge.emoji}</span>
            <div>
              <h3 className="text-white font-bold text-sm">{nudge.title}</h3>
              <div className="flex items-center gap-1 text-white/70">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-300 text-sm leading-relaxed">
              {nudge.type === 'morning' && 'נודג׳ שלך מוכן לפתוח את היום יחד'}
              {nudge.type === 'evening' && 'בוא נסכם את היום ונתכנן את הערב'}
              {nudge.type === 'midday' && 'עדכון צהריים — הכל בסדר?'}
              {nudge.type === 'manual' && 'כאן! מה צריך?'}
              {nudge.type === 'reminder' && 'יש לך תזכורת חשובה'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleAccept}
            className={`
              flex-1 flex items-center justify-center gap-2
              bg-gradient-to-r ${typeColor} text-white
              rounded-xl py-2.5 px-4 text-sm font-semibold
              hover:opacity-90 active:scale-95 transition-all
              shadow-lg
            `}
          >
            <MessageCircle className="w-4 h-4" />
            <span>בוא נדבר</span>
          </button>
          <button
            onClick={handleDismiss}
            className="
              px-4 py-2.5 rounded-xl text-sm text-gray-400
              hover:text-gray-200 hover:bg-white/5
              transition-all border border-white/10
            "
          >
            אח"כ
          </button>
        </div>

        {/* Progress bar — auto-dismiss */}
        <div className="h-0.5 bg-white/5">
          <div
            className={`h-full bg-gradient-to-r ${typeColor} opacity-60`}
            style={{ animation: 'countdown 30s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NudgeNotification;