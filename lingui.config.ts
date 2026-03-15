import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['zh', 'en'],
  sourceLocale: 'zh',
  catalogs: [
    {
      path: 'src/i18n/locales/{locale}',
      include: ['app/**/*.tsx', 'src/**/*.tsx'],
    },
  ],
};

export default config;
