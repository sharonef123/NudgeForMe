import { Lightbulb, Calendar, FileText, Calculator, Brain } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';

interface Suggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: 'general' | 'calendar' | 'document' | 'calculation' | 'smart';
}

interface SmartSuggestionsProps {
  onSuggestionClick: (text: string) => void;
  className?: string;
}

const SmartSuggestions = ({ onSuggestionClick, className = '' }: SmartSuggestionsProps) => {
  const { currentSession, getRecentContext } = useConversation();

  const getContextualSuggestions = (): Suggestion[] => {
    const recentMessages = getRecentContext(5);
    
    // If no messages, show initial suggestions
    if (recentMessages.length === 0) {
      return [
        {
          id: '1',
          text: 'מה המצב שלי עם ביטוח לאומי?',
          icon: <FileText className="w-4 h-4" />,
          category: 'document'
        },
        {
          id: '2',
          text: 'תזכיר לי על פגישות השבוע',
          icon: <Calendar className="w-4 h-4" />,
          category: 'calendar'
        },
        {
          id: '3',
          text: 'חשב לי כמה אני יכול לעבוד השבוע',
          icon: <Calculator className="w-4 h-4" />,
          category: 'calculation'
        },
        {
          id: '4',
          text: 'מה הילדים צריכים לבית הספר?',
          icon: <Brain className="w-4 h-4" />,
          category: 'smart'
        }
      ];
    }

    // Context-aware suggestions based on recent conversation
    const lastMessage = recentMessages[recentMessages.length - 1];
    const contextSuggestions: Suggestion[] = [];

    // Check for keywords and suggest related actions
    if (lastMessage.content.includes('עבודה') || lastMessage.content.includes('משרה')) {
      contextSuggestions.push({
        id: 'job-scope',
        text: 'בדוק שזה לא חורג מ-75%',
        icon: <Calculator className="w-4 h-4" />,
        category: 'calculation'
      });
    }

    if (lastMessage.content.includes('פגישה') || lastMessage.content.includes('תור')) {
      contextSuggestions.push({
        id: 'calendar',
        text: 'הוסף ליומן',
        icon: <Calendar className="w-4 h-4" />,
        category: 'calendar'
      });
    }

    if (lastMessage.content.includes('ילד') || lastMessage.content.includes('נועם') || 
        lastMessage.content.includes('כפיר') || lastMessage.content.includes('רותם')) {
      contextSuggestions.push({
        id: 'kids',
        text: 'מה עוד צריך לדאוג להם?',
        icon: <Brain className="w-4 h-4" />,
        category: 'smart'
      });
    }

    if (lastMessage.content.includes('מסמך') || lastMessage.content.includes('טופס')) {
      contextSuggestions.push({
        id: 'docs',
        text: 'מה המסמכים שאני צריך?',
        icon: <FileText className="w-4 h-4" />,
        category: 'document'
      });
    }

    // Add follow-up questions
    contextSuggestions.push({
      id: 'more',
      text: 'ספר לי עוד',
      icon: <Lightbulb className="w-4 h-4" />,
      category: 'general'
    });

    contextSuggestions.push({
      id: 'clarify',
      text: 'הסבר לי בפשטות',
      icon: <Brain className="w-4 h-4" />,
      category: 'smart'
    });

    return contextSuggestions.slice(0, 4);
  };

  const suggestions = getContextualSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Lightbulb className="w-4 h-4" />
        <span>הצעות חכמות:</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all group text-right"
          >
            <div className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
              {suggestion.icon}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>

      {currentSession && currentSession.messages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            💡 הצעות מבוססות על הקשר השיחה האחרונה
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;