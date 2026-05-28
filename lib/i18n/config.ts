import { en } from './dictionaries/en';
import { hi } from './dictionaries/hi';

export type Language = 'en' | 'hi';

export const SUPPORTED_LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGE_COOKIE_NAME = 'kaarsetu_lang';

export const dictionaries: Record<Language, any> = { en, hi };

export function getDictionary(lang: Language) {
  return dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
}
