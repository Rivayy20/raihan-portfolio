import { createElement, useMemo } from 'react';
import { getSocialLinkColor, isSpiderManPreset } from '../../constants/colorPresets';
import { usePortfolioData } from '../../hooks/usePortfolioData';
import { getSocialIconComponent } from '../../utils/socialIcons';
import { smoothScrollTo } from '../../utils/scrollTo';
import { SpiderIcon, SpiderWebCorner } from '../ui/SpiderManElements';

export const Footer = () => {
  const { data } = usePortfolioData();
  const { settings, footer, contact, navigation, socialLinks } = data;
  const isSpiderMan = isSpiderManPreset(settings?.colorPreset);

  const quickLinks = useMemo(
    () =>
      (navigation || []).filter(
        (item) => item.showInFooter && item.isVisible !== false
      ),
    [navigation]
  );

  const visibleSocials = useMemo(
    () =>
      (socialLinks || []).filter(
        (item) => item.showInFooter && item.isVisible !== false
      ),
    [socialLinks]
  );

  const handleLinkClick = (e, href) => {
    if (!href) return;
    if (href === '#' || href.startsWith('#')) {
      smoothScrollTo(e, href);
    }
  };

  return (
    <footer className="relative overflow-hidden w-full bg-canvas text-ink border-t border-border-subtle pt-16 pb-10">
      {isSpiderMan && (
        <SpiderWebCorner
          position="top-right"
          className="pointer-events-none absolute top-0 right-0 w-44 h-44 text-ink/[0.06] dark:text-primary/[0.11]"
        />
      )}
      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border-subtle">
          {/* Column 1: Brand Identity */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 font-heading font-semibold text-2xl tracking-[0.14em] uppercase text-ink">
              {isSpiderMan && <SpiderIcon className="w-5 h-5 text-primary shrink-0" />}
              {footer?.brandText || 'RAZH.'}
            </span>
            {footer?.tagline && (
              <p className="font-body text-sm sm:text-base text-muted max-w-sm leading-relaxed">
                {footer.tagline}
              </p>
            )}
            {footer?.showAvailabilityBadge !== false &&
              contact?.availabilityStatus && (
                <div className="inline-flex items-center gap-2.5 text-xs font-medium text-muted pt-1">
                  <span className="relative flex h-2 w-2">
                    {contact.isAvailable !== false && (
                      <span
                        aria-hidden="true"
                        className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                      />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        contact.isAvailable !== false
                          ? 'bg-emerald-500'
                          : 'bg-amber-400'
                      }`}
                    />
                  </span>
                  <span>{contact.availabilityStatus}</span>
                </div>
              )}
          </div>

          {/* Column 2: Quick Navigation */}
          {footer?.showQuickLinks !== false && quickLinks.length > 0 && (
            <div className="md:col-span-4 flex flex-col items-start gap-3">
              <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted mb-1">
                {footer?.quickLinksHeading || 'Quick Links'}
              </p>
              <nav aria-label="Footer Quick Links" className="flex flex-col gap-2.5">
                {quickLinks.map((link) => {
                  const isExternal = /^https?:\/\//i.test(
                    String(link.href || '').trim()
                  );
                  return (
                    <a
                      key={link.id || link.label}
                      href={link.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="font-body text-sm text-ink/80 hover:text-primary transition-colors w-fit"
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
            <div className="md:col-span-3 flex flex-col items-start gap-3">
              <p className="font-body text-xs font-medium uppercase tracking-[0.18em] text-muted mb-1">
                {footer?.connectHeading || 'Connect'}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {visibleSocials.map((social) => {
                  const IconComp = getSocialIconComponent(social.platform);
                  const hoverClass = getSocialLinkColor(social.colorPreset);
                  return (
                    <a
                      key={social.id || social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`w-10 h-10 rounded-full border border-border-subtle bg-surface flex items-center justify-center text-base text-muted transition-all duration-200 hover:-translate-y-0.5 ${hoverClass}`}
                    >
                      {createElement(IconComp, { 'aria-hidden': true })}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="font-body text-xs text-muted">
            {footer?.copyrightText || '© 2026 All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
