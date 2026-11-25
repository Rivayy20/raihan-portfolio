import { useEffect } from 'react';
import { usePortfolioData } from '../../hooks/usePortfolioData';

const DEFAULT_CANONICAL = 'https://raihan-portfolio-two.vercel.app/';
const FORBIDDEN_EXTRA_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '@context',
  '@type',
]);

function isSafeHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function upsertMetaTag(attrName, attrValue, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content ?? ''));
}

function upsertLinkTag(relValue, hrefValue, mimeType = '') {
  let el = document.head.querySelector(`link[rel="${relValue}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', relValue);
    document.head.appendChild(el);
  }
  el.setAttribute('href', String(hrefValue ?? ''));
  if (mimeType) {
    el.setAttribute('type', mimeType);
  } else {
    el.removeAttribute('type');
  }
}

function resolveFaviconMime(url = '') {
  const clean = String(url).split('?')[0].split('#')[0].toLowerCase();
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.ico')) return 'image/x-icon';
  return '';
}

function buildSafeExtra(extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return {};
  const out = {};
  for (const [k, v] of Object.entries(extra)) {
    if (!FORBIDDEN_EXTRA_KEYS.has(k)) {
      out[k] = v;
    }
  }
  return out;
}

export function SeoHead() {
  const { data } = usePortfolioData();
  const seo = data?.seo;
  const settings = data?.settings;
  const socialLinks = data?.socialLinks;

  useEffect(() => {
    if (!seo && !settings) return;

    const title =
      seo?.seoTitle ||
      settings?.siteTitle ||
      'RAZH — Information Systems Student & Developer';
    const description = seo?.metaDescription || settings?.defaultDescription || '';
    const rawCanonical = seo?.canonicalUrl || settings?.siteUrl || DEFAULT_CANONICAL;
    const canonicalUrl = isSafeHttpUrl(rawCanonical) ? rawCanonical : DEFAULT_CANONICAL;
    const origin = new URL(canonicalUrl).origin;
    const rawOgImage = seo?.ogImageUrl || settings?.defaultOgImageUrl;
    const ogImage = isSafeHttpUrl(rawOgImage)
      ? rawOgImage
      : `${origin}/og-image.png`;
    const ogSiteName = seo?.ogSiteName || settings?.brandName || 'RAZH';

    document.title = title;

    upsertMetaTag('name', 'description', description);
    upsertLinkTag('canonical', canonicalUrl);

    if (settings?.faviconUrl && isSafeHttpUrl(settings.faviconUrl)) {
      upsertLinkTag('icon', settings.faviconUrl, resolveFaviconMime(settings.faviconUrl));
    }

    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:title', seo?.ogTitle || title);
    upsertMetaTag('property', 'og:description', seo?.ogDescription || description);
    upsertMetaTag('property', 'og:image', ogImage);
    upsertMetaTag('property', 'og:site_name', ogSiteName);

    upsertMetaTag(
      'property',
      'twitter:card',
      seo?.twitterCard === 'summary' ? 'summary' : 'summary_large_image'
    );
    upsertMetaTag('property', 'twitter:url', canonicalUrl);
    upsertMetaTag('property', 'twitter:title', seo?.twitterTitle || title);
    upsertMetaTag(
      'property',
      'twitter:description',
      seo?.twitterDescription || description
    );
    upsertMetaTag('property', 'twitter:image', ogImage);

    const existingJsonLd = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    if (seo?.structuredDataEnabled !== false) {
      const sameAs = (socialLinks || [])
        .filter(
          (item) =>
            item &&
            item.showInSeoSameAs !== false &&
            item.isVisible !== false &&
            isSafeHttpUrl(item.url)
        )
        .map((item) => item.url.trim());

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: settings?.fullName || 'Raihan Azka Hidayat',
        alternateName: ogSiteName,
        url: canonicalUrl,
        jobTitle:
          seo?.structuredDataJobTitle || 'Information Systems Student & Developer',
        sameAs,
        ...buildSafeExtra(seo?.structuredDataExtra),
      };

      const scriptEl = existingJsonLd || document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.textContent = JSON.stringify(jsonLd, null, 2);
      if (!existingJsonLd) {
        document.head.appendChild(scriptEl);
      }
    } else if (existingJsonLd) {
      existingJsonLd.remove();
    }
  }, [seo, settings, socialLinks]);

  return null;
}
