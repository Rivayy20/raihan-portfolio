import { createElement, useMemo } from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { getSocialIconComponent } from '../../utils/socialIcons';
import { smoothScrollTo } from '../../utils/scrollTo';

export const Footer = () => {
  const { data } = usePortfolioData();
  const { footer, contact, navigation, socialLinks } = data;

  const quickLinks = useMemo(
    () => (navigation || []).filter((item) => item.showInFooter && item.isVisible !== false),
    [navigation]
  );

  const visibleSocials = useMemo(
    () => (socialLinks || []).filter((item) => item.showInFooter && item.isVisible !== false),
    [socialLinks]
  );

  const handleLinkClick = (e, href) => {
    if (!href) return;
    if (href === '#' || href.startsWith('#')) {
      smoothScrollTo(e, href);
    }
  };

  return (
    <footer className="w-full bg-base text-black pt-16 pb-8 px-6 md:px-12 border-t-8 border-black relative overflow-hidden">
      {/* Subtle Pattern Background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Grid Area */}
        <div className="flex flex-col md:flex-row justify-between gap-12 text-center md:text-left mb-16">
          {/* Column 1: Brand Identity */}
          <div className="flex flex-col items-center md:items-start gap-4 flex-1">
            <span className="font-heading font-black text-5xl tracking-tighter uppercase text-primary drop-shadow-[3px_3px_0px_var(--color-black)]">
              {footer?.brandText || 'RAZH.'}
            </span>
            {footer?.tagline && (
              <p className="font-bold text-lg md:text-xl max-w-xs leading-snug">
                {footer.tagline}
              </p>
            )}
            {footer?.showAvailabilityBadge !== false && contact?.availabilityStatus && (
              <div className="inline-flex items-center gap-3 bg-white brutal-border px-4 py-2 shadow-[4px_4px_0px_0px_var(--color-black)] mt-2">
                <span className="relative flex h-3 w-3">
                  {contact.isAvailable !== false && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 border border-black ${
                      contact.isAvailable !== false ? 'bg-green-500' : 'bg-amber-400'
                    }`}
                  />
                </span>
                <span className="font-black text-sm uppercase tracking-wide">
                  {contact.availabilityStatus}
                </span>
              </div>
            )}
          </div>

          {/* Column 2: Quick Navigation */}
          {footer?.showQuickLinks !== false && quickLinks.length > 0 && (
            <div className="flex flex-col items-center md:items-start flex-1 md:pl-12 lg:pl-24">
              <h4 className="font-black text-xl mb-6 uppercase border-b-4 border-primary inline-block pb-1">
                {footer?.quickLinksHeading || 'Quick Links'}
              </h4>
              <nav className="flex flex-col gap-3">
                {quickLinks.map((link) => {
                  const isExternal = /^https?:\/\//i.test(String(link.href || '').trim());
                  return (
                    <a
                      key={link.id || link.label}
                      href={link.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="font-bold text-lg hover:text-primary hover:translate-x-2 transition-transform inline-flex w-fit mx-auto md:mx-0"
                    >
                      {link.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Column 3: Connect */}
          {footer?.showSocialLinks !== false && visibleSocials.length > 0 && (
            <div className="flex flex-col items-center md:items-start flex-1">
              <h4 className="font-black text-xl mb-6 uppercase border-b-4 border-secondary inline-block pb-1">
                {footer?.connectHeading || 'Connect'}
              </h4>
              <div className="flex gap-4">
                {visibleSocials.map((social) => {
                  const IconComp = getSocialIconComponent(social.platform);
                  return (
                    <a
                      key={social.id || social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-12 h-12 bg-white brutal-border shadow-[4px_4px_0px_0px_var(--color-black)] flex items-center justify-center text-2xl hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-black)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_var(--color-black)] transition-all"
                    >
                      {createElement(IconComp)}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="border-t-4 border-black mb-8" />

        {/* Bottom Area: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-bold text-sm text-center md:text-left">
            {footer?.copyrightText || '© 2026 All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
