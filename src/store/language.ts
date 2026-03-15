import { create } from 'zustand';
import { i18n } from '../i18n/setup';
import type { Locale } from '../i18n/setup';

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  locale: 'zh',
  setLocale: (locale) => {
    i18n.activate(locale);
    set({ locale });
  },
}));
