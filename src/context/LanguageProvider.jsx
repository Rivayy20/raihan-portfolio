import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './LanguageContext';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getUiString,
  normalizeLocale,
} from '../utils/i18n';

function readInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'id') {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return DEFAULT_LOCALE;
}

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(readInitialLocale);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((nextLocale) => {
    const safeLocale = normalizeLocale(nextLocale);
    setLocaleState(safeLocale);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, safeLocale);
      } catch {
        // Ignore storage quota / private mode restrictions
      }
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'id' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (pathKey, fallback = '') => getUiString(locale, pathKey, fallback),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};
