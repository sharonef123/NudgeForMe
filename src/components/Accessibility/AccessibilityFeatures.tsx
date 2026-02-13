import { useState, useEffect } from 'react';
import { Eye, Type, Contrast, Keyboard, MonitorSpeaker } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  keyboardNav: boolean;
  screenReader: boolean;
}

interface AccessibilityFeaturesProps {
  onSettingsChange: (settings: AccessibilitySettings) => void;
  onClose: () => void;
}

const AccessibilityFeatures = ({ onSettingsChange, onClose }: AccessibilityFeaturesProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    keyboardNav: true,
    screenReader: false,
  });

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('nudge-accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }

    // Check user's system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      handleSettingChange('reduceMotion', true);
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      handleSettingChange('highContrast', true);
    }
  }, []);

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('nudge-accessibility-settings', JSON.stringify(newSettings));
    
    // Apply settings to document
    applySettings(newSettings);
    
    // Notify parent
    onSettingsChange(newSettings);
  };

  const applySettings = (s: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--base-font-size', fontSizes[s.fontSize]);

    // High contrast
    if (s.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce motion
    if (s.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Keyboard navigation
    if (s.keyboardNav) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }

    // Screen reader
    if (s.screenReader) {
      root.setAttribute('aria-live', 'polite');
    } else {
      root.removeAttribute('aria-live');
    }
  };

  const shortcuts = [
    { keys: 'Ctrl + /', description: 'פתח תפריט נגישות' },
    { keys: 'Ctrl + K', description: 'התמקד בחיפוש' },
    { keys: 'Ctrl + M', description: 'פתח מצב קולי' },
    { keys: 'Escape', description: 'סגור חלון פעיל' },
    { keys: 'Tab', description: 'נווט בין אלמנטים' },
    { keys: 'Enter', description: 'הפעל אלמנט נבחר' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">נגישות</h2>
              <p className="text-sm text-gray-400">התאם את האפליקציה לצרכים שלך</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Font Size */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <Type className="w-5 h-5 text-blue-400" />
              גודל גופן
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleSettingChange('fontSize', size)}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    settings.fontSize === size
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {size === 'small' && 'קטן'}
                  {size === 'medium' && 'בינוני'}
                  {size === 'large' && 'גדול'}
                  {size === 'xlarge' && 'ענק'}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">ניגודיות גבוהה</p>
                <p className="text-sm text-gray-400">הגבר ניגודיות לקריאה טובה יותר</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('highContrast', !settings.highContrast)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.highContrast ? 'bg-purple-500' : 'bg-gray-600'
              }`}
              aria-label="ניגודיות גבוהה"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-white font-medium">הפחת תנועה</p>
                <p className="text-sm text-gray-400">הפחת אנימציות ומעברים</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('reduceMotion', !settings.reduceMotion)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.reduceMotion ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
              aria-label="הפחת תנועה"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.reduceMotion ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Keyboard className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">ניווט מקלדת</p>
                <p className="text-sm text-gray-400">הדגש אלמנטים בניווט מקלדת</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('keyboardNav', !settings.keyboardNav)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.keyboardNav ? 'bg-orange-500' : 'bg-gray-600'
              }`}
              aria-label="ניווט מקלדת"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.keyboardNav ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Screen Reader */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <MonitorSpeaker className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-white font-medium">תמיכה בקורא מסך</p>
                <p className="text-sm text-gray-400">אופטימיזציה לקוראי מסך</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('screenReader', !settings.screenReader)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.screenReader ? 'bg-pink-500' : 'bg-gray-600'
              }`}
              aria-label="תמיכה בקורא מסך"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.screenReader ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-8 space-y-3">
            <h3 className="flex items-center gap-2 text-white font-medium">
              <Keyboard className="w-5 h-5 text-blue-400" />
              קיצורי מקלדת
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <span className="text-gray-300 text-sm">{shortcut.description}</span>
                  <kbd className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-mono border border-white/20">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300">
              💡 ההגדרות נשמרות אוטומטית ויחולו בכל פעם שתפתח את האפליקציה
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 
                     text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityFeatures;