import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeProvider.jsx';
import { queryClient } from './lib/queryClient.js';
import {
  applyThemeTokensToElement,
  readPublicThemeSnapshot,
  resolveThemeTokens,
} from './utils/themeTokens.js';

// Pre-paint theme & cached token hydration (CSP-compliant, avoids initial flash)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  let initialMode = 'light';
  try {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      initialMode = saved;
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      initialMode = 'dark';
    }
  } catch {
    // Fallback cleanly to light mode
  }

  document.documentElement.classList.toggle('dark', initialMode === 'dark');

  if (window.location.pathname === '/') {
    const snap = readPublicThemeSnapshot();
    if (snap) {
      const resolved = resolveThemeTokens({
        colorPreset: snap.colorPreset,
        mode: initialMode,
        themeConfig: snap.themeConfig,
      });
      applyThemeTokensToElement(document.documentElement, resolved);
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
