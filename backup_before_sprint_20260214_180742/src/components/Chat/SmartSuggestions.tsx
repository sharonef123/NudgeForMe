import { Sparkles } from 'lucide-react';
const SmartSuggestions = ({ onSuggestionClick }: any) => {
  const suggestions = [
    'מה המצב שלי עם ביטוח לאומי?',
    'תזכיר לי על פגישות השבוע',
    'חשב לי כמה אני יכול לעבוד השבוע'
  ];
  return (
    <div className="glass-panel rounded-2xl p-6" dir="rtl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        הצעות חכמות
      </h3>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => onSuggestionClick(s)} 
            className="w-full text-right p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
export default SmartSuggestions;