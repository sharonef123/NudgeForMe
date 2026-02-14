import { useEffect, useState } from 'react';
import { Command, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

const KeyboardShortcuts = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [shortcuts] = useState<Shortcut[]>([
    {
      keys: ['Ctrl', 'M'],
      description: 'הפעל/כבה מיקרופון',
      action: () => {
        const voiceBtn = document.querySelector('[aria-label*="מיקרופון"]') as HTMLButtonElement;
        voiceBtn?.click();
      }
    },
    {
      keys: ['Ctrl', 'Enter'],
      description: 'שלח הודעה',
      action: () => {
        const sendBtn = document.querySelector('[aria-label*="שלח"]') as HTMLButtonElement;
        sendBtn?.click();
      }
    },
    {
      keys: ['Ctrl', '/'],
      description: 'הצג עזרה (רשימה זו)',
      action: () => setIsHelpOpen(prev => !prev)
    },
    {
      keys: ['Ctrl', 'K'],
      description: 'נקה שיחה',
      action: () => {
        if (window.confirm('למחוק את השיחה הנוכחית?')) {
          console.log('ניקוי שיחה');
        }
      }
    },
    {
      keys: ['Ctrl', 'N'],
      description: 'שיחה חדשה',
      action: () => console.log('שיחה חדשה')
    },
    {
      keys: ['Esc'],
      description: 'סגור חלונות',
      action: () => setIsHelpOpen(false)
    }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + M (מיקרופון)
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        shortcuts[0].action();
      }
      
      // Ctrl + Enter (שלח)
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        shortcuts[1].action();
      }
      
      // Ctrl + / (עזרה)
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        shortcuts[2].action();
      }
      
      // Ctrl + K (נקה)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        shortcuts[3].action();
      }
      
      // Ctrl + N (חדש)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        shortcuts[4].action();
      }
      
      // Esc (סגור)
      if (e.key === 'Escape') {
        shortcuts[5].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  return (
    <>
      {/* כפתור עזרה */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-full hover:bg-slate-700 transition-all shadow-lg z-40"
        aria-label="עזרה - קיצורי מקלדת"
      >
        <Command className="w-5 h-5 text-white" />
      </button>

      {/* חלון עזרה */}
      {isHelpOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsHelpOpen(false)}
        >
          <div 
            className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: 'rtl' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Command className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">קיצורי מקלדת</h2>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="סגור"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <span className="text-gray-300">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <kbd
                        key={keyIdx}
                        className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm font-mono text-white shadow-sm"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* טיפ */}
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <p className="text-sm text-gray-300">
                💡 <strong>טיפ:</strong> לחץ על <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">Ctrl + /</kbd> בכל זמן להצגת רשימה זו
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;