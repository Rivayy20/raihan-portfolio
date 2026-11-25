export const DEFAULT_ORIGIN = 'https://raihan-portfolio-two.vercel.app';

const FORBIDDEN_EXTRA_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '@context',
  '@type',
]);

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtmlAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeHtmlText(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function serializeSafeJsonLd(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function sanitizeExtraJsonLd(extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
    return {};
  }
  const clean = {};
  for (const [key, value] of Object.entries(extra)) {
    if (!FORBIDDEN_EXTRA_KEYS.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

export function isSafeHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveFaviconMimeType(url = '') {
  const clean = String(url).split('?')[0].split('#')[0].toLowerCase();
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.ico')) return 'image/x-icon';
  return '';
}

function replaceOrInsertMeta(html, attrName, attrValue, content) {
  const escaped = escapeHtmlAttr(content);
  const tagRegex = new RegExp(
    `<meta\\b(?=[^>]*\\b${attrName}=["']${escapeRegExp(attrValue)}["'])[^>]*>`,
    'i'
  );
  const replacement = `<meta ${attrName}="${attrValue}" content="${escaped}" />`;

  if (tagRegex.test(html)) {
    return html.replace(tagRegex, () => replacement);
  }
  return html.replace('</head>', () => `    ${replacement}\n  </head>`);
}

function replaceOrInsertLink(html, relValue, hrefValue, extraAttrs = '') {
  const escapedHref = escapeHtmlAttr(hrefValue);
  const tagRegex = new RegExp(
    `<link\\b(?=[^>]*\\brel=["']${escapeRegExp(relValue)}["'])[^>]*>`,
    'i'
  );
  const replacement = extraAttrs
    ? `<link rel="${relValue}" ${extraAttrs} href="${escapedHref}" />`
    : `<link rel="${relValue}" href="${escapedHref}" />`;

  if (tagRegex.test(html)) {
    return html.replace(tagRegex, () => replacement);
  }
  return html.replace('</head>', () => `    ${replacement}\n  </head>`);
}

export function buildSeoPayload({
  seo = {},
  settings = {},
  socialLinks = [],
  mediaLookup = {},
  fallbackOrigin = DEFAULT_ORIGIN,
} = {}) {
  const cleanOrigin = isSafeHttpUrl(fallbackOrigin)
    ? fallbackOrigin.replace(/\/+$/, '')
    : DEFAULT_ORIGIN;

  const siteName =
    String(seo?.og_site_name || settings?.brand_name || 'RAZH').trim() || 'RAZH';

  const title =
    String(
      seo?.seo_title ||
        settings?.site_title ||
        'RAZH — Information Systems Student & Developer'
    ).trim() || 'RAZH — Information Systems Student & Developer';

  const description = String(
    seo?.meta_description || settings?.default_description || ''
  ).trim();

  const rawCanonical = seo?.canonical_url || settings?.site_url || `${cleanOrigin}/`;
  const canonicalUrl = isSafeHttpUrl(rawCanonical)
    ? rawCanonical.trim()
    : `${cleanOrigin}/`;

  const ogMediaUrl = seo?.og_image_media_id
    ? mediaLookup?.[seo.og_image_media_id]?.public_url
    : null;
  const settingsOgMediaUrl = settings?.default_og_image_id
    ? mediaLookup?.[settings.default_og_image_id]?.public_url
    : null;

  const candidateOgImage = ogMediaUrl || settingsOgMediaUrl || '';
  const ogImage = isSafeHttpUrl(candidateOgImage)
    ? candidateOgImage.trim()
    : `${cleanOrigin}/og-image.png`;

  const rawFavicon = settings?.favicon_media_id
    ? mediaLookup?.[settings.favicon_media_id]?.public_url
    : null;
  const faviconUrl = isSafeHttpUrl(rawFavicon) ? rawFavicon.trim() : null;

  const ogTitle = String(seo?.og_title || title).trim() || title;
  const ogDescription = String(seo?.og_description || description).trim();
  const twitterCard =
    seo?.twitter_card === 'summary' ? 'summary' : 'summary_large_image';
  const twitterTitle = String(seo?.twitter_title || title).trim() || title;
  const twitterDescription = String(
    seo?.twitter_description || description
  ).trim();

  const structuredDataEnabled = seo?.structured_data_enabled !== false;
  const sameAs = (socialLinks || [])
    .filter((item) => item && item.show_in_seo_same_as !== false && isSafeHttpUrl(item.url))
    .map((item) => item.url.trim());

  const jsonLd = structuredDataEnabled
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: String(settings?.full_name || 'Raihan Azka Hidayat').trim(),
        alternateName: siteName,
        url: canonicalUrl,
        jobTitle: String(
          seo?.structured_data_job_title || 'Information Systems Student & Developer'
        ).trim(),
        sameAs,
        ...sanitizeExtraJsonLd(seo?.structured_data_extra),
      }
    : null;

  return {
    title,
    description,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogSiteName: siteName,
    twitterCard,
    twitterTitle,
    twitterDescription,
    faviconUrl,
    structuredDataEnabled,
    jsonLd,
  };
}

export function injectSeoIntoHtml(htmlTemplate, payload) {
  let html = String(htmlTemplate || '');

  // Document title
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(
      /<title>[\s\S]*?<\/title>/i,
      () => `<title>${escapeHtmlText(payload.title)}</title>`
    );
  } else {
    html = html.replace(
      '</head>',
      () => `    <title>${escapeHtmlText(payload.title)}</title>\n  </head>`
    );
  }

  // Primary description & canonical
  html = replaceOrInsertMeta(html, 'name', 'description', payload.description);
  html = replaceOrInsertLink(html, 'canonical', payload.canonicalUrl);

  // Optional custom favicon uploaded via CMS
  if (payload.faviconUrl && isSafeHttpUrl(payload.faviconUrl)) {
    const mime = resolveFaviconMimeType(payload.faviconUrl);
    html = replaceOrInsertLink(
      html,
      'icon',
      payload.faviconUrl,
      mime ? `type="${mime}"` : ''
    );
  }

  // Open Graph
  html = replaceOrInsertMeta(html, 'property', 'og:url', payload.canonicalUrl);
  html = replaceOrInsertMeta(html, 'property', 'og:title', payload.ogTitle);
  html = replaceOrInsertMeta(html, 'property', 'og:description', payload.ogDescription);
  html = replaceOrInsertMeta(html, 'property', 'og:image', payload.ogImage);
  html = replaceOrInsertMeta(html, 'property', 'og:site_name', payload.ogSiteName);

  // Twitter
  html = replaceOrInsertMeta(html, 'property', 'twitter:card', payload.twitterCard);
  html = replaceOrInsertMeta(html, 'property', 'twitter:url', payload.canonicalUrl);
  html = replaceOrInsertMeta(html, 'property', 'twitter:title', payload.twitterTitle);
  html = replaceOrInsertMeta(
    html,
    'property',
    'twitter:description',
    payload.twitterDescription
  );
  html = replaceOrInsertMeta(html, 'property', 'twitter:image', payload.ogImage);

  // JSON-LD Structured Data
  const jsonLdScriptRegex =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi;

  if (payload.structuredDataEnabled && payload.jsonLd) {
    const safeBlock = `<script type="application/ld+json">\n${serializeSafeJsonLd(
      payload.jsonLd
    )}\n    </script>`;

    if (jsonLdScriptRegex.test(html)) {
      let replacedFirst = false;
      html = html.replace(jsonLdScriptRegex, () => {
        if (replacedFirst) return '';
        replacedFirst = true;
        return safeBlock;
      });
    } else {
      html = html.replace('</head>', () => `    ${safeBlock}\n  </head>`);
    }
  } else {
    html = html.replace(jsonLdScriptRegex, () => '');
  }

  return html;
}
