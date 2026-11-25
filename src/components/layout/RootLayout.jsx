import { useLenis } from '../../hooks/useLenis';
import { Navbar } from './Navbar';
import { BackToTop } from '../ui/BackToTop';

export const RootLayout = ({ children }) => {
  useLenis();

  return (
    <div className="min-h-screen bg-canvas text-ink overflow-x-hidden selection:bg-primary/20 selection:text-ink">
      <Navbar />
      <main className="w-full max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {children}
      </main>
      <BackToTop />
    </div>
  );
};
