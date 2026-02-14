import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages } from '../../i18n/config';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const langName = supportedLanguages.find(l => l.code === langCode)?.name || '';
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    window.notify?.success('שפה שונתה', 'השפה עודכנה ל' + langName);
  };

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-gray-400 
                 hover:text-white transition-colors"
      >
        <Globe className="w-5 h-5" />
        <span className="text-2xl">{currentLanguage.flag}</span>
        <span className="hidden md:inline text-sm font-medium">{currentLanguage.name}</span>
        <ChevronDown className={'w-4 h-4 transition-transform ' + (isOpen ? 'rotate-180' : '')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 glass-panel rounded-xl border border-white/10 
                      shadow-2xl overflow-hidden animate-slide-down z-50">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={'w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ' + 
                        (i18n.language === lang.code ? 'bg-white/5' : '')}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="flex-1 text-left text-sm text-white font-medium">{lang.name}</span>
              {i18n.language === lang.code && (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;