import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Keyboard, MousePointer, Speaker, X, ZoomIn } from 'lucide-react';

interface AccessibilityFeaturesProps {
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

const AccessibilityFeatures = ({ onSettingsChange, onClose }: AccessibilityFeaturesProps) => {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    // Apply settings to document
    document.documentElement.style.fontSize = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '22px',
    }[fontSize];

    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    if (keyboardNav) {
      document.documentElement.classList.add('keyboard-nav');
    } else {
      document.documentElement.classList.remove('keyboard-nav');
    }
  }, [fontSize, highContrast, reduceMotion, keyboardNav]);

  const saveSettings = () => {
    const settings = { fontSize, highContrast, reduceMotion, keyboardNav, screenReader };
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    onSettingsChange(settings);
    window.notify?.success('הגדרות נשמרו', 'העדפות הנגישות שלך עודכנו');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" dir="rtl">
      <div className="w-full max-w-2xl glass-panel rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('accessibility.title')}</h2>
                <p className="text-sm text-gray-400">{t('accessibility.subtitle')}</p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Font Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ZoomIn className="w-5 h-5 text-blue-400" />
              <label className="text-sm font-medium text-white">
                {t('accessibility.fontSize')}
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={'px-4 py-3 rounded-xl border-2 transition-all ' + 
                            (fontSize === size 
                              ? 'border-blue-500 bg-blue-500/20 text-white' 
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20')}
                >
                  <div className="text-center">
                    <div className={'font-bold ' + 
                                   (size === 'small' ? 'text-xs' : 
                                    size === 'medium' ? 'text-sm' : 
                                    size === 'large' ? 'text-base' : 'text-lg')}>
                      Aa
                    </div>
                    <div className="text-xs mt-1">{t('accessibility.' + size)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 
                        hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t('accessibility.highContrast')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('accessibility.highContrastDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={'relative w-14 h-7 rounded-full transition-colors ' + 
                        (highContrast ? 'bg-blue-500' : 'bg-gray-600')}
            >
              <div
                className={'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ' + 
                          (highContrast ? 'translate-x-8' : 'translate-x-1')}
              />
            </button>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 
                        hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <MousePointer className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t('accessibility.reduceMotion')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('accessibility.reduceMotionDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={'relative w-14 h-7 rounded-full transition-colors ' + 
                        (reduceMotion ? 'bg-purple-500' : 'bg-gray-600')}
            >
              <div
                className={'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ' + 
                          (reduceMotion ? 'translate-x-8' : 'translate-x-1')}
              />
            </button>
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 
                        hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <Keyboard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t('accessibility.keyboardNav')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('accessibility.keyboardNavDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setKeyboardNav(!keyboardNav)}
              className={'relative w-14 h-7 rounded-full transition-colors ' + 
                        (keyboardNav ? 'bg-emerald-500' : 'bg-gray-600')}
            >
              <div
                className={'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ' + 
                          (keyboardNav ? 'translate-x-8' : 'translate-x-1')}
              />
            </button>
          </div>

          {/* Screen Reader */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 
                        hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
                <Speaker className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t('accessibility.screenReader')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('accessibility.screenReaderDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setScreenReader(!screenReader)}
              className={'relative w-14 h-7 rounded-full transition-colors ' + 
                        (screenReader ? 'bg-orange-500' : 'bg-gray-600')}
            >
              <div
                className={'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ' + 
                          (screenReader ? 'translate-x-8' : 'translate-x-1')}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-400" />
              {t('accessibility.shortcuts')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono">Ctrl+/</kbd>
                <span>פתח נגישות</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono">Ctrl+K</kbd>
                <span>חיפוש</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono">Ctrl+M</kbd>
                <span>מצב קולי</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white/10 font-mono">Esc</kbd>
                <span>סגור חלון</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 
                     text-white font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={saveSettings}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 
                     hover:shadow-lg hover:shadow-blue-500/50 text-white font-medium transition-all"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityFeatures;