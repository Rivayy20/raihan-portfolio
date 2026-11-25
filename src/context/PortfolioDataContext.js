import { createContext } from 'react';
import { STATIC_PORTFOLIO_DATA } from '../data/staticFallback';

export const PortfolioDataContext = createContext({
  data: STATIC_PORTFOLIO_DATA,
  isPreview: false,
  previewMode: 'published',
  previewOffsetTop: 0,
  introReady: true,
});
