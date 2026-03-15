import { i18n } from '@lingui/core';
import { messages as zhMessages } from './locales/zh';
import { messages as enMessages } from './locales/en';

export const locales = {
  zh: '繁體中文',
  en: 'English',
} as const;

export type Locale = keyof typeof locales;

export function initI18n(locale: Locale = 'zh') {
  i18n.load({
    zh: zhMessages,
    en: enMessages,
  });
  i18n.activate(locale);
}

export { i18n };
