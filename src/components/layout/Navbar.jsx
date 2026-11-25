import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';
import { DocumentViewerModal } from '../ui/DocumentViewerModal';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { smoothScrollTo } from '../../utils/scrollTo';

function isExternalHref(href = '') {
  return /^https?:\/\//i.test(String(href).trim());
}

export const Navbar = () => {
  const { data, previewOffsetTop } = usePortfolioData();
  const { settings, navigation, hero } = data;

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = useMemo(
    () => (navigation || []).filter((item) => item.showInNavbar && item.isVisible !== false),
    [navigation]
  );

  const navSectionKey = useMemo(
    () => navLinks.map((item) => item.sectionId || item.href).join('|'),
    [navLinks]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const observeAll = () => {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((sec) => observer.observe(sec));
    };

    const frameId = requestAnimationFrame(observeAll);

    const handleScrollTop = () => {
      if (window.scrollY < 100) setActiveSection('home');
    };
    window.addEventListener('scroll', handleScrollTop);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTop);
    };
  }, [navSectionKey]);

  const handleLinkClick = (e, href) => {
    if (!href) return;
    if (href === '#' || href.startsWith('#')) {
      smoothScrollTo(e, href);
    }
  };

  const handleCtaClick = (e) => {
    const targetHref = settings?.navbarCtaHref || '#contact';
    if (isExternalHref(targetHref)) {
      window.open(targetHref, '_blank', 'noopener,noreferrer');
      return;
    }
    smoothScrollTo(e, targetHref);
  };

  const ctaVariant = ['primary', 'secondary', 'accent', 'white'].includes(
    settings?.navbarCtaVariant
  )
    ? settings.navbarCtaVariant
    : 'accent';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ top: previewOffsetTop || 0 }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="bg-white border-[3px] border-black brutal-shadow rounded-xl flex items-center justify-between px-4 md:px-6 py-3">
            {/* Brand Logo */}
            <div
              className="flex-shrink-0 cursor-pointer flex items-center gap-2.5"
              onClick={(e) => smoothScrollTo(e, '#')}
            >
              {settings?.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.brandName || 'Logo'}
                  decoding="async"
                  className="h-7 w-7 object-contain shrink-0"
                />
              )}
              <span className="font-heading font-black text-2xl tracking-tighter hover:text-primary transition-colors">
                {settings?.brandName || 'RAZH'}
              </span>
            </div>

            {/* Center Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.sectionId;
                const external = isExternalHref(link.href);
                return (
                  <a
                    key={link.id || link.label}
                    href={link.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`font-body text-lg transition-transform relative group ${
                      isActive
                        ? 'font-black text-secondary -translate-y-1'
                        : 'font-bold text-black hover:text-secondary hover:-translate-y-1'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-1 bg-accent transition-all ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </a>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {settings?.showThemeToggle !== false && (
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black brutal-shadow-hover bg-white hover:-translate-y-1 transition-all"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'dark' ? (
                    <FaSun className="text-black" />
                  ) : (
                    <FaMoon className="text-black" />
                  )}
                </button>
              )}

              {settings?.showNavbarCta !== false && settings?.navbarCtaLabel && (
                <Button
                  variant={ctaVariant}
                  className="hidden lg:flex py-2 px-6 text-sm"
                  onClick={handleCtaClick}
                >
                  {settings.navbarCtaLabel}
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md border-2 border-black bg-white brutal-shadow-hover"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="text-black" />
                ) : (
                  <FaBars className="text-black" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ top: 96 + (previewOffsetTop || 0) }}
            className="fixed inset-x-4 z-40 lg:hidden"
          >
            <div className="bg-white border-[3px] border-black brutal-shadow rounded-xl p-6 flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = activeSection === link.sectionId;
                const external = isExternalHref(link.href);
                return (
                  <a
                    key={link.id || link.label}
                    href={link.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleLinkClick(e, link.href);
                    }}
                    className={`font-heading text-xl border-b-2 py-2 transition-colors flex flex-col relative ${
                      isActive
                        ? 'font-black text-secondary border-transparent'
                        : 'font-bold text-black border-transparent hover:border-black'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-accent" />
                    )}
                  </a>
                );
              })}

              {(settings?.showNavbarCta !== false ||
                (settings?.showMobileCvBtn !== false && hero?.cvUrl)) && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-black border-dashed">
                  {settings?.showNavbarCta !== false && settings?.navbarCtaLabel && (
                    <Button
                      variant={ctaVariant}
                      className="w-full py-4 text-lg"
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleCtaClick(e);
                      }}
                    >
                      {settings.navbarCtaLabel}
                    </Button>
                  )}

                  {settings?.showMobileCvBtn !== false && hero?.cvUrl && (
                    <Button
                      variant="white"
                      className="w-full py-4 text-lg border-2 border-black"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCVModalOpen(true);
                      }}
                    >
                      {hero?.secondaryCtaText || 'View CV'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hero?.cvUrl && (
        <DocumentViewerModal
          isOpen={isCVModalOpen}
          onClose={() => setIsCVModalOpen(false)}
          pdfUrl={hero.cvUrl}
          title={hero.cvModalTitle || 'My CV'}
        />
      )}
    </>
  );
};
