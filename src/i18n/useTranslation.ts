import { useLanguageStore } from '../store/language';
import { translations } from './translations';

/**
 * Returns a translation function `t` that:
 * - In 'zh' locale: returns the original Chinese string
 * - In 'en' locale: looks up the English translation, falls back to Chinese
 */
export function useT() {
  const { locale } = useLanguageStore();

  return (zh: string): string => {
    if (locale === 'zh') return zh;
    return translations[zh] ?? zh;
  };
}
