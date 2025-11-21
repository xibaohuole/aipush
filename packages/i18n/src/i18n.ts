import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

export const resources = {
  'en-US': { translation: enUS },
  'zh-CN': { translation: zhCN },
} as const;

export const defaultNS = 'translation';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en-US',
    lng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;

// Language mapping between old and new format
export const languageMap: Record<string, string> = {
  'English': 'en-US',
  'Chinese': 'zh-CN',
  'en-US': 'en-US',
  'zh-CN': 'zh-CN',
};

// Reverse mapping
export const reverseLanguageMap: Record<string, string> = {
  'en-US': 'English',
  'zh-CN': 'Chinese',
};

export type SupportedLanguage = keyof typeof resources;
