import { useTranslation } from 'react-i18next';
import { Calendar, FileText, Calculator, User, Bell, Star, Zap, TrendingUp } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (actionId: string) => void;
  className?: string;
}

const QuickActions = ({ onActionClick, className = '' }: QuickActionsProps) => {
  const { t } = useTranslation();

  const actions = [
    {
      id: 'check-insurance',
      icon: FileText,
      label: t('suggestions.insurance'),
      color: 'from-blue-500 to-cyan-500',
      shortcut: '1',
    },
    {
      id: 'meetings',
      icon: Calendar,
      label: t('suggestions.meetings'),
      color: 'from-purple-500 to-pink-500',
      shortcut: '2',
    },
    {
      id: 'work-hours',
      icon: Calculator,
      label: t('suggestions.workHours'),
      color: 'from-emerald-500 to-teal-500',
      shortcut: '3',
    },
    {
      id: 'kids',
      icon: User,
      label: t('suggestions.kids'),
      color: 'from-orange-500 to-red-500',
      shortcut: '4',
    },
    {
      id: 'reminders',
      icon: Bell,
      label: t('nudge.reminders'),
      color: 'from-yellow-500 to-amber-500',
      shortcut: '5',
    },
    {
      id: 'favorites',
      icon: Star,
      label: 'מועדפים',
      color: 'from-pink-500 to-rose-500',
      shortcut: '6',
    },
  ];

  return (
    <div className={\\\} dir="rtl">
      <div className="glass-panel rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">פעולות מהירות</h3>
            <p className="text-sm text-gray-400">גישה מהירה למשימות נפוצות</p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onActionClick(action.id)}
                className="group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 
                         hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={\bsolute inset-0 bg-gradient-to-br \ opacity-0 
                            group-hover:opacity-10 transition-opacity\}
                />

                {/* Content */}
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div
                    className={\p-4 rounded-xl bg-gradient-to-br \ text-white 
                              shadow-lg group-hover:scale-110 transition-transform\}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-white font-medium group-hover:text-white transition-colors">
                    {action.label}
                  </span>

                  {/* Keyboard Shortcut */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-mono">{action.shortcut}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">שעות השבוע</span>
            </div>
            <p className="text-lg font-bold text-white">42/75%</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">פגישות היום</span>
            </div>
            <p className="text-lg font-bold text-white">3</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">תזכורות</span>
            </div>
            <p className="text-lg font-bold text-white">5</p>
          </div>
        </div>

        {/* Hint */}
        <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300 text-center">
            💡 השתמש במקשי 1-6 לגישה מהירה
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;