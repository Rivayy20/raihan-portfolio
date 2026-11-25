import { fetchPublicRest, isPublicSupabaseConfigured } from '../lib/supabasePublic';
import { PUBLIC_COLUMNS } from '../constants/publicColumns';
import {
  STATIC_MEDIA_FALLBACKS,
  STATIC_PORTFOLIO_DATA,
} from '../data/staticFallback';
import { mapRawPortfolioToViewModel } from '../utils/portfolioMapper';

const PUBLIC_CACHE_KEY = 'razh_public_portfolio_v1';
const CACHE_TTL_MS = 2 * 60 * 1000;

export function readCachedPublicPortfolio() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PUBLIC_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== 1 ||
      typeof parsed.cachedAt !== 'number' ||
      !parsed.data
    ) {
      return null;
    }
    if (Date.now() - parsed.cachedAt >= CACHE_TTL_MS) {
      return null;
    }
    return {
      data: parsed.data,
      cachedAt: parsed.cachedAt,
      source: 'cache',
    };
  } catch {
    return null;
  }
}

export function writeCachedPublicPortfolio(data) {
  if (typeof window === 'undefined' || !data) return;
  try {
    sessionStorage.setItem(
      PUBLIC_CACHE_KEY,
      JSON.stringify({
        version: 1,
        cachedAt: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage quota / private mode restrictions
  }
}

function buildPublicMediaLookup(mediaRows = []) {
  const lookup = {};
  for (const asset of mediaRows) {
    if (!asset?.id || !asset.is_public || !asset.public_url) continue;
    lookup[asset.id] = {
      url: asset.public_url,
      altText: asset.alt_text || '',
      isPublic: true,
    };
  }
  return lookup;
}

function fetchPublishedSingleton(table) {
  return fetchPublicRest({
    table,
    columns: PUBLIC_COLUMNS[table],
    filters: ['id=eq.1', 'publication_status=eq.published'],
    limit: 1,
  }).then((rows) => (Array.isArray(rows) ? rows[0] ?? null : null));
}

function fetchVisibleCollection(table) {
  return fetchPublicRest({
    table,
    columns: PUBLIC_COLUMNS[table],
    filters: ['publication_status=eq.published', 'is_visible=eq.true'],
    order: 'display_order.asc',
  });
}

export async function fetchPublicPortfolioData() {
  const forceStatic = import.meta.env.VITE_FORCE_STATIC_MODE === 'true';
  if (forceStatic || !isPublicSupabaseConfigured) {
    return { data: STATIC_PORTFOLIO_DATA, source: 'static' };
  }

  try {
    const [
      siteSettings,
      siteSections,
      navigationItems,
      profile,
      aboutContent,
      education,
      experiences,
      experienceDetails,
      skillCategories,
      skills,
      projects,
      projectMedia,
      certifications,
      contactSettings,
      socialLinks,
      footerSettings,
      seoSettings,
      mediaAssets,
    ] = await Promise.all([
      fetchPublishedSingleton('site_settings'),
      fetchVisibleCollection('site_sections'),
      fetchVisibleCollection('navigation_items'),
      fetchPublishedSingleton('profile'),
      fetchPublishedSingleton('about_content'),
      fetchVisibleCollection('education'),
      fetchVisibleCollection('experiences'),
      fetchVisibleCollection('experience_details'),
      fetchVisibleCollection('skill_categories'),
      fetchVisibleCollection('skills'),
      fetchVisibleCollection('projects'),
      fetchPublicRest({
        table: 'project_media',
        columns: PUBLIC_COLUMNS.project_media,
        filters: ['publication_status=eq.published'],
        order: 'is_primary.desc,display_order.asc',
      }),
      fetchVisibleCollection('certifications'),
      fetchPublishedSingleton('contact_settings'),
      fetchVisibleCollection('social_links'),
      fetchPublishedSingleton('footer_settings'),
      fetchPublishedSingleton('seo_settings'),
      fetchPublicRest({
        table: 'media_assets',
        columns: PUBLIC_COLUMNS.media_assets,
        filters: ['is_public=eq.true'],
      }),
    ]);

    const raw = {
      site_settings: siteSettings,
      site_sections: siteSections || [],
      navigation_items: navigationItems || [],
      profile,
      about_content: aboutContent,
      education: education || [],
      experiences: experiences || [],
      experience_details: experienceDetails || [],
      skill_categories: skillCategories || [],
      skills: skills || [],
      projects: projects || [],
      project_media: projectMedia || [],
      certifications: certifications || [],
      contact_settings: contactSettings,
      social_links: socialLinks || [],
      footer_settings: footerSettings,
      seo_settings: seoSettings,
    };

    const mediaLookup = buildPublicMediaLookup(mediaAssets || []);
    const mapped = mapRawPortfolioToViewModel(
      raw,
      mediaLookup,
      STATIC_MEDIA_FALLBACKS,
      { mode: 'published' }
    );

    writeCachedPublicPortfolio(mapped);
    return { data: mapped, source: 'supabase' };
  } catch (err) {
    if (import.meta.env.VITE_USE_STATIC_FALLBACK !== 'false') {
      console.warn(
        '[RAZH] Falling back to static portfolio data:',
        err?.message || err
      );
      return {
        data: STATIC_PORTFOLIO_DATA,
        source: 'fallback',
        error: err?.message || 'Supabase fetch failed',
      };
    }
    throw err;
  }
}
