import { useState, useEffect } from 'react';
import { en } from '../translations/en';
import { es } from '../translations/es';

export type Language = 'en' | 'es';

const translations = {
  en,
  es
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('es');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: keyof typeof en, params?: Record<string, string | number>) => {
    let text = translations[language][key];
    
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
