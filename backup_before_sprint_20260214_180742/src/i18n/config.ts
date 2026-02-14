import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import heTranslation from '../locales/he/translation.json';
import enTranslation from '../locales/en/translation.json';
import arTranslation from '../locales/ar/translation.json';

const resources = {
  he: { translation: heTranslation },
  en: { translation: enTranslation },
  ar: { translation: arTranslation },
};

export const supportedLanguages = [
  { code: 'he', name: 'עברית', dir: 'rtl', flag: '🇮🇱' },
  { code: 'en', name: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇸🇦' },
];

export const getLanguageDirection = (lang: string): 'rtl' | 'ltr' => {
  const language = supportedLanguages.find(l => l.code === lang);
  return language?.dir || 'rtl';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'he',
    defaultNS: 'translation',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nudge-language',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },

    debug: false,
  });

i18n.on('languageChanged', (lng) => {
  const dir = getLanguageDirection(lng);
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
  document.title = lng === 'he' ? 'Nudge Me OS - עוזר אישי' : 'Nudge Me OS';
  localStorage.setItem('nudge-language', lng);
});

const initialDir = getLanguageDirection(i18n.language);
document.documentElement.setAttribute('dir', initialDir);
document.documentElement.setAttribute('lang', i18n.language);

export default i18n;