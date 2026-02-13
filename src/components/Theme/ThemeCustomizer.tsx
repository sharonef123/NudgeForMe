import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette, Check, Sparkles, X } from 'lucide-react';

interface ThemeCustomizerProps {
  onClose: () => void;
}

const ThemeCustomizer = ({ onClose }: ThemeCustomizerProps) => {
  const { t } = useTranslation();
  const [selectedTheme, setSelectedTheme] = useState('default');

  const themes = [
    {
      id: 'default',
      name: 'ברירת מחדל',
      gradient: 'from-emerald-500 to-blue-500',
      bg: 'from-slate-900 via-slate-800 to-slate-900',
      icon: '🌊',
    },
    {
      id: 'sunset',
      name: 'שקיעה',
      gradient: 'from-orange-500 to-pink-500',
      bg: 'from-orange-900 via-pink-900 to-purple-900',
      icon: '🌅',
    },
    {
      id: 'forest',
      name: 'יער',
      gradient: 'from-green-500 to-teal-500',
      bg: 'from-green-900 via-teal-900 to-emerald-900',
      icon: '🌲',
    },
    {
      id: 'ocean',
      name: 'אוקיינוס',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-900 via-cyan-900 to-teal-900',
      icon: '🌊',
    },
    {
      id: 'lavender',
      name: 'לבנדר',
      gradient: 'from-purple-500 to-pink-500',
      bg: 'from-purple-900 via-pink-900 to-rose-900',
      icon: '🌸',
    },
    {
      id: 'dark',
      name: 'כהה',
      gradient: 'from-gray-500 to-slate-500',
      bg: 'from-black via-gray-900 to-slate-900',
      icon: '🌑',
    },
  ];

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setSelectedTheme(themeId);
    localStorage.setItem('theme', themeId);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', themeId);
    
    window.notify?.success('ערכת נושא שונתה', theme.name + ' הופעלה');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" dir="rtl">
      <div className="w-full max-w-3xl glass-panel rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('settings.theme')}</h2>
                <p className="text-sm text-gray-400">בחר ערכת צבעים לממשק</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Themes Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                className={'group relative overflow-hidden p-6 rounded-2xl border-2 transition-all ' + 
                          (selectedTheme === theme.id 
                            ? 'border-white/50 scale-105' 
                            : 'border-white/10 hover:border-white/30 hover:scale-102')}
              >
                {/* Background Preview */}
                <div className={'absolute inset-0 bg-gradient-to-br ' + theme.bg + ' opacity-50'} />
                
                {/* Gradient Preview */}
                <div className="relative">
                  <div className={'w-full h-24 rounded-xl bg-gradient-to-r ' + theme.gradient + ' shadow-lg mb-4'} />
                  
                  {/* Theme Info */}
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-2xl mb-1">{theme.icon}</div>
                      <p className="text-sm font-medium text-white">{theme.name}</p>
                    </div>
                    
                    {selectedTheme === theme.id && (
                      <div className={'p-2 rounded-full bg-gradient-to-r ' + theme.gradient}>
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Custom Theme Teaser */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-300">ערכות נושא מותאמות אישית</p>
                <p className="text-xs text-gray-400 mt-1">בקרוב: צור ערכות צבעים משלך</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 
                     hover:shadow-lg hover:shadow-emerald-500/50 text-white font-medium transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;