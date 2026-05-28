import { cookies } from 'next/headers';
import { getDictionary, Language, DEFAULT_LANGUAGE, LANGUAGE_COOKIE_NAME } from './config';

export function getServerTranslation() {
  const cookieStore = cookies();
  const lang = (cookieStore.get(LANGUAGE_COOKIE_NAME)?.value as Language) || DEFAULT_LANGUAGE;
  
  const dict = getDictionary(lang);

  return {
    lang,
    t: (path: string, variables?: Record<string, string>): string => {
      const keys = path.split('.');
      let value: any = dict;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          // Fallback to English
          let fallbackValue: any = getDictionary(DEFAULT_LANGUAGE);
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
    }
  };
}
