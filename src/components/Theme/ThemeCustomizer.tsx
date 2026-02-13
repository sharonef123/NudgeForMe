import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Sparkles, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
}

const themes: Theme[] = [
  {
    id: 'emerald-blue',
    name: 'Emerald Blue (ברירת מחדל)',
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#8b5cf6',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  },
  {
    id: 'purple-pink',
    name: 'Purple Pink',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  },
  {
    id: 'orange-red',
    name: 'Orange Red',
    primary: '#f59e0b',
    secondary: '#ef4444',
    accent: '#ec4899',
    background: 'linear-gradient(135deg, #451a03 0%, #7c2d12 100%)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
  {
    id: 'cyan-teal',
    name: 'Cyan Teal',
    primary: '#06b6d4',
    secondary: '#14b8a6',
    accent: '#10b981',
    background: 'linear-gradient(135deg, #083344 0%, #134e4a 100%)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    primary: '#f43f5e',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    background: 'linear-gradient(135deg, #4c0519 0%, #78350f 100%)',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#06b6d4',
    background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 100%)',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  },
];

interface ThemeCustomizerProps {
  onClose: () => void;
}

const ThemeCustomizer = ({ onClose }: ThemeCustomizerProps) => {
  const { t } = useTranslation();
  const [currentTheme, setCurrentTheme] = useState<string>('emerald-blue');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('nudge-theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }

    const savedDarkMode = localStorage.getItem('nudge-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;

    // Apply CSS variables
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--gradient-primary', theme.gradient);

    // Apply background
    document.body.style.background = theme.background;

    // Save to localStorage
    localStorage.setItem('nudge-theme', themeId);
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('nudge-dark-mode', String(newDarkMode));

    if (newDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-3xl glass-panel rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Palette className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('settings.theme')}</h2>
              <p className="text-sm text-gray-400">בחר את ערכת הצבעים שלך</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Dark/Light Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <p className="text-white font-medium">
                  {darkMode ? 'מצב כהה' : 'מצב בהיר'}
                </p>
                <p className="text-sm text-gray-400">
                  {darkMode ? 'ממשק כהה לעיניים' : 'ממשק בהיר ונקי'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                darkMode ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <Sparkles className="w-5 h-5 text-purple-400" />
              ערכות נושא
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-right ${
                    currentTheme === theme.id
                      ? 'border-white/50 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Theme Preview */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded-lg"
                        style={{ background: theme.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-lg"
                        style={{ background: theme.secondary }}
                      />
                      <div
                        className="w-6 h-6 rounded-lg"
                        style={{ background: theme.accent }}
                      />
                    </div>
                    {currentTheme === theme.id && (
                      <Check className="w-5 h-5 text-emerald-400 mr-auto" />
                    )}
                  </div>

                  {/* Theme Name */}
                  <p className="text-white font-medium">{theme.name}</p>

                  {/* Gradient Preview */}
                  <div
                    className="mt-2 h-2 rounded-full"
                    style={{ background: theme.gradient }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme (Coming Soon) */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              💡 בקרוב: יצירת ערכת נושא מותאמת אישית
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;