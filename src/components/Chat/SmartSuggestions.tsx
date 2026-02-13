import { useTranslation } from 'react-i18next';
import { Sparkles, Calendar, Calculator, Users, FileText, Clock, Zap } from 'lucide-react';

interface SmartSuggestionsProps {
  onSuggestionClick: (text: string) => void;
}

const SmartSuggestions = ({ onSuggestionClick }: SmartSuggestionsProps) => {
  const { t } = useTranslation();

  const suggestions = [
    {
      icon: FileText,
      text: t('suggestions.insurance'),
      color: 'from-blue-500 to-cyan-500',
      category: 'work',
    },
    {
      icon: Calendar,
      text: t('suggestions.meetings'),
      color: 'from-purple-500 to-pink-500',
      category: 'schedule',
    },
    {
      icon: Calculator,
      text: t('suggestions.workHours'),
      color: 'from-emerald-500 to-teal-500',
      category: 'work',
    },
    {
      icon: Users,
      text: t('suggestions.kids'),
      color: 'from-orange-500 to-red-500',
      category: 'family',
    },
    {
      icon: Clock,
      text: 'מה יש לי היום ביומן?',
      color: 'from-indigo-500 to-blue-500',
      category: 'schedule',
    },
    {
      icon: Sparkles,
      text: 'תזכיר לי דברים חשובים',
      color: 'from-yellow-500 to-amber-500',
      category: 'reminder',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{t('chat.suggestions')}</h3>
          <p className="text-sm text-gray-400">בחר כדי להתחיל שיחה</p>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 
                       hover:bg-white/10 hover:border-white/20 transition-all text-right"
            >
              {/* Gradient Background on Hover */}
              <div
                className={\bsolute inset-0 bg-gradient-to-br \ opacity-0 
                          group-hover:opacity-10 transition-opacity\}
              />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                <div
                  className={\p-3 rounded-xl bg-gradient-to-br \ text-white 
                            shadow-lg group-hover:scale-110 transition-transform flex-shrink-0\}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-white font-medium flex-1">{suggestion.text}</p>
              </div>

              {/* Category Badge */}
              <div className="mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-400">
                  {suggestion.category === 'work' && '💼 עבודה'}
                  {suggestion.category === 'schedule' && '📅 יומן'}
                  {suggestion.category === 'family' && '👨‍👩‍👧‍👦 משפחה'}
                  {suggestion.category === 'reminder' && '⏰ תזכורת'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-emerald-300 font-medium mb-1">
              💡 טיפים לשיחה טובה יותר
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• היה ספציפי בשאלות שלך</li>
              <li>• אפשר להעלות תמונות ומסמכים</li>
              <li>• השתמש במצב הקולי לנוחות מקסימלית</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;