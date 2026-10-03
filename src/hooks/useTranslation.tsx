import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '../translations/en';
import { es } from '../translations/es';

export type Language = 'en' | 'es';
export type TranslationKey = keyof typeof en;

const translations = {
  en,
  es
};

const STORAGE_KEY = 'app-language';

const readSavedLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // Storage can be unavailable (private mode, tests)
  }
  return 'es';
};

const useLanguageState = () => {
  const [language, setLanguage] = useState<Language>(readSavedLanguage);

  // Save language to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage errors
    }
  }, [language]);

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let text: string = translations[language][key];
    
    // Replace parameters in the text
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return text;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  return {
    language,
    t,
    toggleLanguage,
    setLanguage
  };
};

const LanguageContext = createContext<ReturnType<typeof useLanguageState> | null>(null);

// Shared language state, so the UI and the story generator always agree on the language
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useLanguageState();
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used inside a LanguageProvider');
  }
  return context;
};
