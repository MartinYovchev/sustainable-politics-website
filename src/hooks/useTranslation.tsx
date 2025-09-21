import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Language, Translation, TranslationContext } from '../types/index';
import translations from '../utils/translations';
import { TranslationContextComponent } from '../contexts/TranslationContext';

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>({ code: 'bg', name: 'Български' });

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let current: Translation | string = translations[language.code];

    for (const k of keys) {
      if (typeof current === 'object' && current && k in current) {
        current = current[k] as Translation | string;
      } else {
        console.warn(`Translation key not found: ${key} for language ${language.code}`);
        return key; // Return the key itself if translation not found
      }
    }

    return typeof current === 'string' ? current : key;
  }, [language.code]);

  const changeLanguage = useCallback((langCode: Language['code']) => {
    setLanguage({
      code: langCode,
      name: langCode === 'bg' ? 'Български' : 'English'
    });
    localStorage.setItem('preferred-language', langCode);
  }, []);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') as Language['code'] | null;
    if (savedLang && (savedLang === 'bg' || savedLang === 'en')) {
      changeLanguage(savedLang);
    }
  }, [changeLanguage]);

  const value: TranslationContext = {
    language,
    translations,
    t,
    changeLanguage,
  };

  return (
    <TranslationContextComponent.Provider value={value}>
      {children}
    </TranslationContextComponent.Provider>
  );
}