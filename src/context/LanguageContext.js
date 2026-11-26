import { createContext } from 'react';
import { DEFAULT_LOCALE, getUiString } from '../utils/i18n';

export const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  toggleLocale: () => {},
  t: (pathKey, fallback = '') => getUiString(DEFAULT_LOCALE, pathKey, fallback),
});
