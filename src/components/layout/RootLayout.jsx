import { useLenis } from '../../hooks/useLenis';
import { useLanguage } from '../../hooks/useLanguage';
import { Navbar } from './Navbar';
import { BackToTop } from '../ui/BackToTop';

export const RootLayout = ({ children }) => {
  useLenis();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-canvas text-ink overflow-x-clip selection:bg-primary/20 selection:text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[120] focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {t('common.skipToContent', 'Skip to main content')}
      </a>
      <Navbar />
      <main
        id="main-content"
        className="w-full max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12"
      >
        {children}
      </main>
      <BackToTop />
    </div>
  );
};
