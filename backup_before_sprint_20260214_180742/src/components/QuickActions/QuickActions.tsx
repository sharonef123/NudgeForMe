import { Calendar, FileText, Calculator, User } from 'lucide-react';
const QuickActions = ({ onActionClick }: any) => {
  const actions = [
    { id: 'insurance', icon: FileText, label: 'ביטוח לאומי' },
    { id: 'meetings', icon: Calendar, label: 'פגישות' },
    { id: 'work', icon: Calculator, label: 'שעות עבודה' },
    { id: 'kids', icon: User, label: 'ילדים' }
  ];
  return (
    <div className="glass-panel rounded-2xl p-6" dir="rtl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.id} onClick={() => onActionClick(a.id)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-center transition-colors">
              <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <span className="text-sm text-white">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default QuickActions;