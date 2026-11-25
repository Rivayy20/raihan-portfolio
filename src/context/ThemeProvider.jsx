import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext';

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

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
    () => ({ theme, toggleTheme, applyDefaultTheme }),
    [theme, toggleTheme, applyDefaultTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
