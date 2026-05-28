'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, DEFAULT_LANGUAGE, LANGUAGE_COOKIE_NAME } from './config';
import { en } from './dictionaries/en';
import { hi } from './dictionaries/hi';

type Dictionary = typeof en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries: Record<Language, any> = { en, hi };

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_COOKIE_NAME) as Language;
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLangState(saved);
    }
    setIsReady(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(LANGUAGE_COOKIE_NAME, newLang);
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLang}; path=/; max-age=31536000`;
  };

  const t = useCallback((path: string, variables?: Record<string, string>): string => {
    const dict = dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
    const keys = path.split('.');
    let value: any = dict;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English if key missing in current language
        let fallbackValue: any = dictionaries[DEFAULT_LANGUAGE];
        for (const fkey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fkey in fallbackValue) {
            fallbackValue = fallbackValue[fkey];
          } else {
            fallbackValue = path;
            break;
          }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value !== 'string') return path;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        value = (value as string).replace(`{{${k}}}`, v);
      });
    }

    return value;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
