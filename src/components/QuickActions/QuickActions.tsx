import { Calendar, FileText, Calculator, User, Bell, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  onActionClick: (actionId: string) => void;
  className?: string;
}

const QuickActions = ({ onActionClick, className = '' }: QuickActionsProps) => {
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      id: 'check-insurance',
      icon: <FileText className="w-5 h-5" />,
      label: t('suggestions.insurance'),
      color: 'from-blue-500 to-cyan-500',
      action: () => onActionClick('check-insurance'),
    },
    {
      id: 'meetings',
      icon: <Calendar className="w-5 h-5" />,
      label: t('suggestions.meetings'),
      color: 'from-purple-500 to-pink-500',
      action: () => onActionClick('meetings'),
    },
    {
      id: 'work-hours',
      icon: <Calculator className="w-5 h-5" />,
      label: t('suggestions.workHours'),
      color: 'from-emerald-500 to-teal-500',
      action: () => onActionClick('work-hours'),
    },
    {
      id: 'kids',
      icon: <User className="w-5 h-5" />,
      label: t('suggestions.kids'),
      color: 'from-orange-500 to-red-500',
      action: () => onActionClick('kids'),
    },
    {
      id: 'reminders',
      icon: <Bell className="w-5 h-5" />,
      label: t('nudge.reminders'),
      color: 'from-yellow-500 to-amber-500',
      action: () => onActionClick('reminders'),
    },
    {
      id: 'favorites',
      icon: <Star className="w-5 h-5" />,
      label: 'מועדפים',
      color: 'from-pink-500 to-rose-500',
      action: () => onActionClick('favorites'),
    },
  ];

  return (
    <div className={`${className}`} dir="rtl">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span>פעולות מהירות</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 
                     hover:bg-white/10 hover:border-white/20 transition-all"
          >
            {/* Gradient Background on Hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 
                        group-hover:opacity-10 transition-opacity`}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-2 text-center">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white 
                          shadow-lg group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-300 text-center">
          💡 לחץ על כל כפתור לפעולה מהירה
        </p>
      </div>
    </div>
  );
};

export default QuickActions;