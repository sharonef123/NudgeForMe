import { useState } from "react";
import { Sparkles, Shield, ChefHat, Brain, Briefcase, Heart, Zap } from "lucide-react";

interface SmartSuggestionsProps {
  isDarkMode?: boolean;
  onSuggestionClick?: (text: string) => void;
  onManualNudge?: () => void;
}

const categories = [
  {
    icon: Shield,
    label: "ביטוח לאומי",
    color: "emerald",
    suggestions: [
      "מה הסטטוס שלי מול ביטוח לאומי?",
      "בדוק היקף עבודה - כמה אני יכול לעבוד?",
      "מה הזכויות שלי כבעל 96%?",
      "עזור לי לכתוב מכתב לביטוח לאומי",
    ],
  },
  {
    icon: ChefHat,
    label: "ארוחות",
    color: "orange",
    suggestions: [
      "תכנן ארוחת ערב לילדים (לא דגים!)",
      "מה אפשר לבשל עם מה שיש במקרר?",
      "תכנן תפריט שבועי לכל המשפחה",
      "ארוחה מהירה לנועם וכפיר ורותם",
    ],
  },
  {
    icon: Briefcase,
    label: "עבודה",
    color: "blue",
    suggestions: [
      "בדוק אם עבודה זו בטוחה לקצבה שלי",
      "חשב היקף משרה - כמה שעות מותר?",
      "עזור לי לכתוב קורות חיים",
      "הכן אותי לראיון עבודה",
    ],
  },
  {
    icon: Brain,
    label: "מנטלי",
    color: "purple",
    suggestions: [
      "עזור לי עם חרדה עכשיו",
      "תרגיל נשימה מהיר",
      "אני צריך לדבר על משהו",
      "תן לי מוטיבציה להיום",
    ],
  },
  {
    icon: Heart,
    label: "ילדים",
    color: "pink",
    suggestions: [
      "מה עושים עם נועם (16) בסוף שבוע?",
      "רעיונות לפעילות עם כפיר (14)",
      "איך מסבירים לרותם (9) על הגירושין?",
      "תכנן בילוי לשלושתם ביחד",
    ],
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
  orange: "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
  blue: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  purple: "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
  pink: "text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20",
};

const SmartSuggestions = ({
  isDarkMode = true,
  onSuggestionClick,
  onManualNudge,
}: SmartSuggestionsProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const active = categories.find((c) => c.label === activeCategory);

  return (
    <div
      className={`border-t px-3 py-2 ${
        isDarkMode
          ? "border-white/10 bg-slate-900/50 backdrop-blur-sm"
          : "border-slate-200 bg-white/80 backdrop-blur-sm"
      }`}
    >
      {/* כפתור מה יש לי עכשיו — ראש הרשימה */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onManualNudge}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-gradient-to-r from-emerald-500/20 to-teal-500/20
            border border-emerald-500/30 hover:border-emerald-500/60
            text-emerald-300 hover:text-emerald-200
            text-xs font-semibold transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>מה יש לי עכשיו?</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-white/10" />

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            const colorClass = COLOR_MAP[cat.color];
            return (
              <button
                key={cat.label}
                onClick={() =>
                  setActiveCategory(isActive ? null : cat.label)
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border
                  text-xs font-medium whitespace-nowrap transition-all
                  ${
                    isActive
                      ? colorClass + " opacity-100"
                      : isDarkMode
                      ? "text-gray-400 bg-white/5 hover:bg-white/10 border-white/10"
                      : "text-gray-500 bg-gray-100 hover:bg-gray-200 border-gray-200"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestions for active category */}
      {active && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {active.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                onSuggestionClick?.(s);
                setActiveCategory(null);
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg border
                text-xs transition-all active:scale-95
                ${COLOR_MAP[active.color]}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;