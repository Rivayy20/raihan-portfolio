import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_ORIGIN,
  buildSeoPayload,
  injectSeoIntoHtml,
} from './_lib/seoHtmlInjector.js';

let cachedTemplate = null;

function loadHtmlTemplate() {
  if (cachedTemplate) return cachedTemplate;

  const distDir = path.join(process.cwd(), 'dist');
  const candidates = [
    path.join(distDir, 'app.html'),
    path.join(distDir, 'index.html'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      cachedTemplate = fs.readFileSync(filePath, 'utf8');
      return cachedTemplate;
    }
  }

  return null;
}

function sendHtml(res, statusCode, html, seoSource) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );
  if (seoSource) {
    res.setHeader('X-SEO-Source', seoSource);
  }
  if (typeof res.send === 'function') {
    return res.send(html);
  }
  res.end(html);
  return undefined;
}

async function fetchJsonWithTimeout(url, publishableKey, signal) {
  const response = await fetch(url, {
    method: 'GET',
    signal,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase REST ${response.status}`);
  }
  return response.json();
}

async function fetchPublicSeoSnapshot({ supabaseUrl, publishableKey }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const seoSelect =
      'seo_title,meta_description,canonical_url,og_title,og_description,og_image_media_id,og_site_name,twitter_card,twitter_title,twitter_description,structured_data_enabled,structured_data_job_title,structured_data_extra';
    const settingsSelect =
      'brand_name,full_name,site_title,default_description,site_url,favicon_media_id,default_og_image_id';
    const socialSelect = 'url,show_in_seo_same_as,display_order';

    const [seoRows, settingsRows, socialRows] = await Promise.all([
      fetchJsonWithTimeout(
        `${supabaseUrl}/rest/v1/seo_settings?select=${seoSelect}&id=eq.1&publication_status=eq.published`,
        publishableKey,
        controller.signal
      ),
      fetchJsonWithTimeout(
        `${supabaseUrl}/rest/v1/site_settings?select=${settingsSelect}&id=eq.1&publication_status=eq.published`,
        publishableKey,
        controller.signal
      ),
      fetchJsonWithTimeout(
        `${supabaseUrl}/rest/v1/social_links?select=${socialSelect}&publication_status=eq.published&is_visible=eq.true&order=display_order.asc`,
        publishableKey,
        controller.signal
      ),
    ]);

    const seo = Array.isArray(seoRows) ? seoRows[0] || {} : {};
    const settings = Array.isArray(settingsRows) ? settingsRows[0] || {} : {};
    const socialLinks = Array.isArray(socialRows) ? socialRows : [];

    const mediaIds = [
      seo.og_image_media_id,
      settings.default_og_image_id,
      settings.favicon_media_id,
    ].filter((id) => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id));

    const uniqueMediaIds = [...new Set(mediaIds)];
    const mediaLookup = {};

    if (uniqueMediaIds.length > 0) {
      const idFilter = `(${uniqueMediaIds.join(',')})`;
      const mediaRows = await fetchJsonWithTimeout(
        `${supabaseUrl}/rest/v1/media_assets?select=id,public_url,alt_text,is_public&is_public=eq.true&id=in.${idFilter}`,
        publishableKey,
        controller.signal
      );

      for (const asset of Array.isArray(mediaRows) ? mediaRows : []) {
        if (asset?.id && asset?.public_url) {
          mediaLookup[asset.id] = asset;
        }
      }
    }

    return { seo, settings, socialLinks, mediaLookup };
  } finally {
    clearTimeout(timer);
  }
}

function resolveRequestOrigin(req) {
  const protoHeader = req?.headers?.['x-forwarded-proto'];
  const hostHeader = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  if (!hostHeader) return DEFAULT_ORIGIN;
  const proto = String(protoHeader || 'https').split(',')[0].trim();
  const host = String(hostHeader).split(',')[0].trim();
  const candidate = `${proto}://${host}`;
  return /^https?:\/\//i.test(candidate) ? candidate : DEFAULT_ORIGIN;
}

export default async function handler(req, res) {
  const template = loadHtmlTemplate();
  if (!template) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (typeof res.send === 'function') {
      return res.send('HTML template missing in build output.');
    }
    res.end('HTML template missing in build output.');
    return undefined;
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');
  const publishableKey = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  if (
    !supabaseUrl ||
    !publishableKey ||
    process.env.VITE_FORCE_STATIC_MODE === 'true'
  ) {
    return sendHtml(res, 200, template, 'static-fallback');
  }

  try {
    const snapshot = await fetchPublicSeoSnapshot({
      supabaseUrl,
      publishableKey,
    });

    const payload = buildSeoPayload({
      ...snapshot,
      fallbackOrigin: resolveRequestOrigin(req),
    });

    const injectedHtml = injectSeoIntoHtml(template, payload);
    return sendHtml(res, 200, injectedHtml, 'supabase');
  } catch {
    return sendHtml(res, 200, template, 'static-fallback');
  }
}
