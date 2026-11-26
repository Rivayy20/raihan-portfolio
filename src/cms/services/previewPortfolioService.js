import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import { STATIC_MEDIA_FALLBACKS } from '../../data/staticFallback';
import { mapRawPortfolioToViewModel } from '../../utils/portfolioMapper';
import { getMediaSignedUrl } from '../repositories/mediaRepository';
import { resolveEffectiveRecord } from './contentWorkflowService';

function extractMediaIdsFromRows(rows = [], keys = []) {
  const ids = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    for (const k of keys) {
      if (row[k]) ids.push(row[k]);
      if (row.draft_data && typeof row.draft_data === 'object' && row.draft_data[k]) {
        ids.push(row.draft_data[k]);
      }
    }
  }
  return ids;
}

function collectReferencedMediaIds(raw) {
  const ids = [
    ...extractMediaIdsFromRows([raw.site_settings], [
      'profile_image_id',
      'logo_media_id',
      'favicon_media_id',
      'default_og_image_id',
    ]),
    ...extractMediaIdsFromRows([raw.profile], [
      'profile_image_id',
      'reveal_overlay_id',
      'cv_media_id',
    ]),
    ...extractMediaIdsFromRows(raw.education, ['logo_media_id']),
    ...extractMediaIdsFromRows(raw.experiences, ['logo_media_id']),
    ...extractMediaIdsFromRows(raw.skills, ['icon_media_id']),
    ...extractMediaIdsFromRows(raw.certifications, ['pdf_media_id']),
    ...extractMediaIdsFromRows([raw.seo_settings], ['og_image_media_id']),
    ...extractMediaIdsFromRows(raw.project_media, ['media_id']),
  ];

  for (const proj of raw.projects || []) {
    const draftGallery = proj?.draft_data?.gallery;
    if (Array.isArray(draftGallery)) {
      for (const item of draftGallery) {
        if (item?.media_id) ids.push(item.media_id);
      }
    }
  }

  return new Set(ids.filter(Boolean));
}

function countPendingDrafts(raw) {
  const singletonTables = [
    raw.site_settings,
    raw.profile,
    raw.about_content,
    raw.contact_settings,
    raw.footer_settings,
    raw.seo_settings,
  ];
  const collectionTables = [
    ...(raw.site_sections || []),
    ...(raw.navigation_items || []),
    ...(raw.education || []),
    ...(raw.experiences || []),
    ...(raw.skill_categories || []),
    ...(raw.skills || []),
    ...(raw.projects || []),
    ...(raw.certifications || []),
    ...(raw.social_links || []),
  ];

  let count = 0;
  for (const row of [...singletonTables, ...collectionTables]) {
    if (!row) continue;
    if (row.publication_status === 'draft' || Boolean(row.has_unpublished_changes)) {
      count += 1;
    }
  }
  return count;
}

async function buildPreviewMediaLookup(mediaRows = [], referencedIds = new Set()) {
  const lookup = {};
  const privateToSign = [];

  for (const asset of mediaRows) {
    if (!asset?.id) continue;
    if (asset.is_public && asset.public_url) {
      lookup[asset.id] = {
        url: asset.public_url,
        altText: asset.alt_text || '',
        isPublic: true,
      };
    } else if (referencedIds.has(asset.id)) {
      privateToSign.push(asset);
    }
  }

  if (privateToSign.length > 0) {
    const signedResults = await Promise.allSettled(
      privateToSign.map(async (asset) => {
        const signedUrl = await getMediaSignedUrl(
          asset.bucket_id,
          asset.storage_path,
          900
        );
        return { asset, signedUrl };
      })
    );

    for (const res of signedResults) {
      if (res.status === 'fulfilled') {
        const { asset, signedUrl } = res.value;
        lookup[asset.id] = {
          url: signedUrl,
          altText: asset.alt_text || '',
          isPublic: false,
        };
      }
    }
  }

  return lookup;
}

export async function fetchPreviewPortfolioData({ mode = 'draft' } = {}) {
  const client = assertSupabaseClient(supabaseAdmin);

  const [
    siteSettingsRes,
    siteSectionsRes,
    navigationRes,
    profileRes,
    aboutRes,
    educationRes,
    experiencesRes,
    expDetailsRes,
    skillCategoriesRes,
    skillsRes,
    projectsRes,
    projectMediaRes,
    certificationsRes,
    contactRes,
    socialLinksRes,
    footerRes,
    seoRes,
    mediaAssetsRes,
  ] = await Promise.all([
    client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    client.from('site_sections').select('*'),
    client.from('navigation_items').select('*'),
    client.from('profile').select('*').eq('id', 1).maybeSingle(),
    client.from('about_content').select('*').eq('id', 1).maybeSingle(),
    client.from('education').select('*'),
    client.from('experiences').select('*'),
    client.from('experience_details').select('*'),
    client.from('skill_categories').select('*'),
    client.from('skills').select('*'),
    client.from('projects').select('*'),
    client.from('project_media').select('*'),
    client.from('certifications').select('*'),
    client.from('contact_settings').select('*').eq('id', 1).maybeSingle(),
    client.from('social_links').select('*'),
    client.from('footer_settings').select('*').eq('id', 1).maybeSingle(),
    client.from('seo_settings').select('*').eq('id', 1).maybeSingle(),
    client
      .from('media_assets')
      .select('id, bucket_id, storage_path, public_url, alt_text, is_public'),
  ]);

  const queryPairs = [
    ['site_settings', siteSettingsRes],
    ['site_sections', siteSectionsRes],
    ['navigation_items', navigationRes],
    ['profile', profileRes],
    ['about_content', aboutRes],
    ['education', educationRes],
    ['experiences', experiencesRes],
    ['experience_details', expDetailsRes],
    ['skill_categories', skillCategoriesRes],
    ['skills', skillsRes],
    ['projects', projectsRes],
    ['project_media', projectMediaRes],
    ['certifications', certificationsRes],
    ['contact_settings', contactRes],
    ['social_links', socialLinksRes],
    ['footer_settings', footerRes],
    ['seo_settings', seoRes],
    ['media_assets', mediaAssetsRes],
  ];

  for (const [tableName, res] of queryPairs) {
    if (res.error) {
      throw new Error(
        res.error.message || `Gagal memuat tabel ${tableName} untuk Preview Mode.`
      );
    }
  }

  const raw = {
    site_settings: siteSettingsRes.data,
    site_sections: siteSectionsRes.data || [],
    navigation_items: navigationRes.data || [],
    profile: profileRes.data,
    about_content: aboutRes.data,
    education: educationRes.data || [],
    experiences: experiencesRes.data || [],
    experience_details: expDetailsRes.data || [],
    skill_categories: skillCategoriesRes.data || [],
    skills: skillsRes.data || [],
    projects: projectsRes.data || [],
    project_media: projectMediaRes.data || [],
    certifications: certificationsRes.data || [],
    contact_settings: contactRes.data,
    social_links: socialLinksRes.data || [],
    footer_settings: footerRes.data,
    seo_settings: seoRes.data,
  };

  const referencedIds = collectReferencedMediaIds(raw);
  const mediaLookup = await buildPreviewMediaLookup(
    mediaAssetsRes.data || [],
    referencedIds
  );

  const mappedData = mapRawPortfolioToViewModel(
    raw,
    mediaLookup,
    STATIC_MEDIA_FALLBACKS,
    {
      mode,
      resolveRow: mode === 'draft' ? resolveEffectiveRecord : (row) => row,
    }
  );

  return {
    data: mappedData,
    pendingDraftCount: countPendingDrafts(raw),
    mode,
  };
}
