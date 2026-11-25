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
    () =>
      (navigation || []).filter(
        (item) => item.showInNavbar && item.isVisible !== false
      ),
    [navigation]
  );

  const navSectionKey = useMemo(
    () => navLinks.map((item) => item.sectionId || item.href).join('|'),
    [navLinks]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-38% 0px -58% 0px',
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
    window.addEventListener('scroll', handleScrollTop, { passive: true });

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

  return (
    <>
      <header
        style={{ top: previewOffsetTop || 0 }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'editorial-glass border-b border-border-subtle'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Minimalist Wordmark */}
          <button
            type="button"
            onClick={(e) => smoothScrollTo(e, '#')}
            className="flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded"
          >
            {settings?.logoUrl && (
              <img
                src={settings.logoUrl}
                alt={settings.brandName || 'Logo'}
                decoding="async"
                className="h-7 w-7 object-contain rounded-md shrink-0"
              />
            )}
            <span className="font-heading font-semibold text-base sm:text-lg tracking-[0.18em] uppercase text-ink hover:text-primary transition-colors">
              {settings?.brandName || 'RAZH'}
            </span>
          </button>

          {/* Center Nav Links (Desktop) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-8"
          >
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
                  className={`relative py-1.5 font-body text-[13px] font-medium tracking-[0.04em] transition-colors ${
                    isActive ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-primary opacity-100 scale-x-100'
                        : 'bg-ink/30 opacity-0 scale-x-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {settings?.showThemeToggle !== false && (
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full border border-border-subtle bg-surface/60 hover:bg-surface hover:border-border-strong flex items-center justify-center text-muted hover:text-ink transition-all cursor-pointer"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? (
                  <FaSun className="text-xs text-accent" />
                ) : (
                  <FaMoon className="text-xs" />
                )}
              </button>
            )}

            {settings?.showNavbarCta !== false && settings?.navbarCtaLabel && (
              <Button
                variant="primary"
                className="hidden lg:inline-flex py-2 px-5 text-xs tracking-wider"
                onClick={handleCtaClick}
              >
                {settings.navbarCtaLabel}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden w-9 h-9 rounded-full border border-border-subtle bg-surface/70 flex items-center justify-center text-ink hover:border-border-strong transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-sm" />
              ) : (
                <FaBars className="text-sm" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Clean Frosted Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            style={{ top: 68 + (previewOffsetTop || 0) }}
            className="fixed inset-x-4 z-40 lg:hidden"
          >
            <div className="editorial-glass border border-border-subtle rounded-2xl p-5 shadow-xl flex flex-col gap-1">
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
                    className={`flex items-center justify-between min-h-11 px-3 rounded-xl font-heading text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/12 text-ink'
                        : 'text-muted hover:text-ink hover:bg-surface-subtle/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </a>
                );
              })}

              {(settings?.showNavbarCta !== false ||
                (settings?.showMobileCvBtn !== false && hero?.cvUrl)) && (
                <div className="flex flex-col gap-2.5 mt-3 pt-4 border-t border-border-subtle">
                  {settings?.showNavbarCta !== false && settings?.navbarCtaLabel && (
                    <Button
                      variant="primary"
                      className="w-full py-3 text-sm"
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
                      className="w-full py-3 text-sm"
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
