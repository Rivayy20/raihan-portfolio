import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext } from './ThemeContext';
import {
  applyThemeTokensToElement,
  clearThemeTokensFromElement,
  resolveThemeTokens,
} from '../utils/themeTokens';

function resolveSystemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return resolveSystemTheme();
    } catch {
      return 'light';
    }
  });

  const [publicThemeSpec, setPublicThemeSpec] = useState(null);
  const appliedCssVarsRef = useRef([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const resolvedTheme = useMemo(
    () =>
      resolveThemeTokens({
        colorPreset: publicThemeSpec?.colorPreset || 'razh_cyan',
        mode: theme,
        themeConfig: publicThemeSpec?.themeConfig,
      }),
    [publicThemeSpec, theme]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (!publicThemeSpec) {
      clearThemeTokensFromElement(root, appliedCssVarsRef.current);
      appliedCssVarsRef.current = [];
      return undefined;
    }

    appliedCssVarsRef.current = applyThemeTokensToElement(
      root,
      resolvedTheme,
      appliedCssVarsRef.current
    );

    return () => {
      clearThemeTokensFromElement(root, appliedCssVarsRef.current);
    };
  }, [publicThemeSpec, resolvedTheme]);

  const syncPublicTheme = useCallback(({ colorPreset, themeConfig } = {}) => {
    setPublicThemeSpec({
      colorPreset: colorPreset || 'razh_cyan',
      themeConfig,
    });
  }, []);

  const clearPublicTheme = useCallback(() => {
    setPublicThemeSpec(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const next = prevTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', next);
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  }, []);

  /**
   * Applies CMS default_theme ('light' | 'dark' | 'system') ONLY for first-time visitors
   * who have not explicitly toggled and saved a personal theme preference yet.
   */
  const applyDefaultTheme = useCallback((defaultTheme) => {
    if (!defaultTheme) return;
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return;
    } catch {
      // Proceed cleanly if storage is unavailable
    }

    if (defaultTheme === 'dark' || defaultTheme === 'light') {
      setTheme(defaultTheme);
    } else if (defaultTheme === 'system') {
      setTheme(resolveSystemTheme());
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      applyDefaultTheme,
      resolvedTheme,
      syncPublicTheme,
      clearPublicTheme,
    }),
    [theme, toggleTheme, applyDefaultTheme, resolvedTheme, syncPublicTheme, clearPublicTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
