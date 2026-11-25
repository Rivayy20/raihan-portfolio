import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import { QUERY_KEYS } from '../../lib/queryClient';
import { recordRevision } from '../services/contentWorkflowService';

export const REVISION_TABLE_META = {
  site_settings: {
    label: 'General Settings',
    route: '/admin/settings',
    queryKey: QUERY_KEYS.cmsSiteSettings,
    isSingleton: true,
  },
  site_sections: {
    label: 'Section Layout & Order',
    route: '/admin/settings',
    queryKey: QUERY_KEYS.cmsSections,
    isSingleton: false,
  },
  navigation_items: {
    label: 'Navbar & Navigation',
    route: '/admin/navbar',
    queryKey: QUERY_KEYS.cmsNavigation,
    isSingleton: false,
  },
  profile: {
    label: 'Hero & CV',
    route: '/admin/hero',
    queryKey: QUERY_KEYS.cmsProfile,
    isSingleton: true,
  },
  about_content: {
    label: 'About Content',
    route: '/admin/about',
    queryKey: QUERY_KEYS.cmsAbout,
    isSingleton: true,
  },
  education: {
    label: 'Education',
    route: '/admin/education',
    queryKey: QUERY_KEYS.cmsEducation,
    isSingleton: false,
  },
  experiences: {
    label: 'Experience',
    route: '/admin/experience',
    queryKey: QUERY_KEYS.cmsExperiences,
    isSingleton: false,
  },
  skill_categories: {
    label: 'Expertise Categories',
    route: '/admin/expertise',
    queryKey: QUERY_KEYS.cmsExpertise,
    isSingleton: false,
  },
  skills: {
    label: 'Expertise Skills',
    route: '/admin/expertise',
    queryKey: QUERY_KEYS.cmsExpertise,
    isSingleton: false,
  },
  projects: {
    label: 'Projects',
    route: '/admin/projects',
    queryKey: QUERY_KEYS.cmsProjects,
    isSingleton: false,
  },
  certifications: {
    label: 'Certifications',
    route: '/admin/certifications',
    queryKey: QUERY_KEYS.cmsCertifications,
    isSingleton: false,
  },
  contact_settings: {
    label: 'Contact Settings',
    route: '/admin/contact',
    queryKey: QUERY_KEYS.cmsContact,
    isSingleton: true,
  },
  social_links: {
    label: 'Social Links',
    route: '/admin/contact',
    queryKey: QUERY_KEYS.cmsSocialLinks,
    isSingleton: false,
  },
  footer_settings: {
    label: 'Footer',
    route: '/admin/footer',
    queryKey: QUERY_KEYS.cmsFooter,
    isSingleton: true,
  },
  seo_settings: {
    label: 'SEO Settings',
    route: '/admin/seo',
    queryKey: QUERY_KEYS.cmsSeo,
    isSingleton: true,
  },
};

const RESERVED_KEYS = new Set([
  'id',
  'publication_status',
  'has_unpublished_changes',
  'draft_data',
  'published_at',
  'created_at',
  'updated_at',
  'detail_sections',
  'gallery',
]);

const MEDIA_FK_COLUMNS_BY_TABLE = {
  site_settings: [
    'profile_image_id',
    'logo_media_id',
    'favicon_media_id',
    'default_og_image_id',
  ],
  profile: ['profile_image_id', 'cv_media_id'],
  education: ['logo_media_id'],
  experiences: ['logo_media_id'],
  skills: ['icon_media_id'],
  certifications: ['pdf_media_id'],
  seo_settings: ['og_image_media_id'],
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function extractColumnPayload(snapshot) {
  const out = {};
  for (const [key, value] of Object.entries(snapshot || {})) {
    if (!RESERVED_KEYS.has(key)) {
      out[key] = value;
    }
  }
  return out;
}

function normalizeDetailSections(rawDetails) {
  if (!Array.isArray(rawDetails)) return [];
  return rawDetails.map((sec, idx) => ({
    title: String(sec?.title || '').trim(),
    body_text: sec?.body_text ? String(sec.body_text).trim() : null,
    facts: Array.isArray(sec?.facts) ? sec.facts : [],
    items: Array.isArray(sec?.items) ? sec.items : [],
    chips: Array.isArray(sec?.chips) ? sec.chips : [],
    note: sec?.note ? String(sec.note).trim() : null,
    display_order: typeof sec?.display_order === 'number' ? sec.display_order : idx,
    is_visible: sec?.is_visible !== false,
  }));
}

function normalizeGalleryItems(rawGallery) {
  if (!Array.isArray(rawGallery)) return [];
  const filtered = rawGallery.filter((item) => item && item.media_id);
  if (!filtered.length) return [];
  const firstPrimary = filtered.findIndex((g) => Boolean(g.is_primary));
  const primaryIdx = firstPrimary >= 0 ? firstPrimary : 0;

  return filtered.map((item, idx) => ({
    media_id: item.media_id,
    caption: item.caption ? String(item.caption).trim() : null,
    alt_text: item.alt_text ? String(item.alt_text).trim() : null,
    is_primary: idx === primaryIdx,
    display_order: idx,
  }));
}

async function fetchValidMediaIdSet(client, candidateIds = []) {
  const uniqueIds = [...new Set(candidateIds.filter(Boolean))];
  if (!uniqueIds.length) return new Set();

  const { data, error } = await client
    .from('media_assets')
    .select('id')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(error.message || 'Gagal memverifikasi referensi Media Library.');
  }

  return new Set((data || []).map((row) => row.id));
}

async function sanitizeSnapshotReferences(client, entityTable, columnPayload, rawSnapshot) {
  const fkCols = MEDIA_FK_COLUMNS_BY_TABLE[entityTable] || [];
  const rawGallery = normalizeGalleryItems(rawSnapshot?.gallery);
  const candidateMediaIds = [
    ...fkCols.map((col) => columnPayload[col]).filter(Boolean),
    ...rawGallery.map((g) => g.media_id).filter(Boolean),
  ];

  const validMediaIds = await fetchValidMediaIdSet(client, candidateMediaIds);

  const sanitizedColumns = { ...columnPayload };
  for (const col of fkCols) {
    if (sanitizedColumns[col] && !validMediaIds.has(sanitizedColumns[col])) {
      sanitizedColumns[col] = null;
    }
  }

  if (entityTable === 'skills' && sanitizedColumns.category_id) {
    const { data: catExists, error: catError } = await client
      .from('skill_categories')
      .select('id')
      .eq('id', sanitizedColumns.category_id)
      .maybeSingle();

    if (catError) {
      throw new Error(catError.message || 'Gagal memeriksa kategori skill.');
    }
    if (!catExists) {
      throw new Error(
        'Kategori skill induk untuk revisi ini sudah dihapus. Restore kategori skill tersebut terlebih dahulu.'
      );
    }
  }

  return {
    sanitizedColumns,
    sanitizedDetails:
      entityTable === 'experiences'
        ? normalizeDetailSections(rawSnapshot?.detail_sections)
        : [],
    sanitizedGallery:
      entityTable === 'projects'
        ? normalizeGalleryItems(rawGallery.filter((g) => validMediaIds.has(g.media_id)))
        : [],
  };
}

async function syncRestoredExperienceDetails(client, experienceId, detailSections) {
  const { error: delError } = await client
    .from('experience_details')
    .delete()
    .eq('experience_id', experienceId);

  if (delError) {
    throw new Error(delError.message || 'Gagal menyinkronkan detail pengalaman saat restore.');
  }

  if (!detailSections.length) return [];

  const rows = detailSections.map((sec, idx) => ({
    experience_id: experienceId,
    title: sec.title,
    body_text: sec.body_text,
    facts: sec.facts,
    items: sec.items,
    chips: sec.chips,
    note: sec.note,
    display_order: idx,
    is_visible: sec.is_visible,
    publication_status: 'draft',
  }));

  const { data, error: insError } = await client
    .from('experience_details')
    .insert(rows)
    .select('*');

  if (insError) {
    throw new Error(insError.message || 'Gagal menyimpan blok detail pengalaman.');
  }
  return data || [];
}

async function syncRestoredProjectMedia(client, projectId, galleryItems) {
  const { error: delError } = await client
    .from('project_media')
    .delete()
    .eq('project_id', projectId);

  if (delError) {
    throw new Error(delError.message || 'Gagal menyinkronkan galeri project saat restore.');
  }

  if (!galleryItems.length) return [];

  const rows = galleryItems.map((item, idx) => ({
    project_id: projectId,
    media_id: item.media_id,
    caption: item.caption,
    alt_text: item.alt_text,
    is_primary: item.is_primary,
    display_order: idx,
    publication_status: 'draft',
  }));

  const { data, error: insError } = await client
    .from('project_media')
    .insert(rows)
    .select('*');

  if (insError) {
    throw new Error(insError.message || 'Gagal menyimpan galeri project saat restore.');
  }
  return data || [];
}

export async function listRevisions({
  entityTable = 'all',
  action = 'all',
  limit = 100,
} = {}) {
  const client = assertSupabaseClient(supabaseAdmin);

  let query = client
    .from('content_revisions')
    .select('id, entity_table, entity_id, action, snapshot, changed_by, summary_note, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (entityTable && entityTable !== 'all') {
    query = query.eq('entity_table', entityTable);
  }

  if (action && action !== 'all') {
    query = query.eq('action', action);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || 'Gagal memuat riwayat revisi konten.');
  }

  return data || [];
}

/**
 * Restore any historical snapshot strictly into draft state:
 * - Published target row -> updates `draft_data` + `has_unpublished_changes = true` (live content stays untouched)
 * - Draft target row -> updates direct columns + child tables
 * - Deleted target row -> recreates row as `publication_status = 'draft'`
 */
export async function restoreRevisionAsDraft(revision) {
  const meta = REVISION_TABLE_META[revision?.entity_table];
  if (!meta) {
    throw new Error(`Tabel "${revision?.entity_table || '-'}" tidak diizinkan untuk restore.`);
  }

  const rawSnapshot = revision?.snapshot;
  if (!rawSnapshot || typeof rawSnapshot !== 'object' || Array.isArray(rawSnapshot)) {
    throw new Error('Snapshot revisi tidak valid atau kosong.');
  }

  const client = assertSupabaseClient(supabaseAdmin);
  const entityTable = revision.entity_table;
  const targetId = meta.isSingleton ? 1 : revision.entity_id;

  const columnPayload = extractColumnPayload(rawSnapshot);
  const { sanitizedColumns, sanitizedDetails, sanitizedGallery } =
    await sanitizeSnapshotReferences(client, entityTable, columnPayload, rawSnapshot);

  const { data: existingRow, error: lookupError } = await client
    .from(entityTable)
    .select('*')
    .eq('id', targetId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message || `Gagal memeriksa entitas ${entityTable}.`);
  }

  let restoredRow;
  let restoreMode;
  let revisionSnapshot;

  if (existingRow && existingRow.publication_status === 'published') {
    const draftPayload = { ...sanitizedColumns };
    if (entityTable === 'experiences') {
      draftPayload.detail_sections = sanitizedDetails;
    } else if (entityTable === 'projects') {
      draftPayload.gallery = sanitizedGallery;
    }

    const { data, error } = await client
      .from(entityTable)
      .update({
        draft_data: draftPayload,
        has_unpublished_changes: true,
      })
      .eq('id', existingRow.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message || 'Gagal menyimpan snapshot ke draft.');
    }

    restoredRow = data;
    restoreMode = 'updated_draft_overlay';
    revisionSnapshot = {
      ...data,
      ...draftPayload,
    };
  } else if (existingRow) {
    const { data, error } = await client
      .from(entityTable)
      .update({
        ...sanitizedColumns,
        publication_status: 'draft',
        has_unpublished_changes: false,
        draft_data: null,
      })
      .eq('id', existingRow.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(
        error.code === '23505'
          ? 'Konflik nilai unik (slug/key sudah digunakan oleh item lain).'
          : error.message || 'Gagal memulihkan item draft.'
      );
    }

    restoredRow = data;
    restoreMode = 'updated_draft_row';
    revisionSnapshot = { ...data };

    if (entityTable === 'experiences') {
      const savedDetails = await syncRestoredExperienceDetails(
        client,
        data.id,
        sanitizedDetails
      );
      revisionSnapshot.detail_sections = savedDetails;
    } else if (entityTable === 'projects') {
      const savedGallery = await syncRestoredProjectMedia(
        client,
        data.id,
        sanitizedGallery
      );
      revisionSnapshot.gallery = savedGallery;
    }
  } else {
    const insertBody = {
      ...(meta.isSingleton
        ? { id: 1 }
        : UUID_REGEX.test(String(revision.entity_id))
          ? { id: revision.entity_id }
          : {}),
      ...sanitizedColumns,
      publication_status: 'draft',
      has_unpublished_changes: false,
      draft_data: null,
      published_at: null,
    };

    const { data, error } = await client
      .from(entityTable)
      .insert(insertBody)
      .select('*')
      .single();

    if (error) {
      throw new Error(
        error.code === '23505'
          ? 'Tidak dapat recreate item karena slug/kode unik sudah dipakai item aktif lain.'
          : error.message || 'Gagal membuat ulang item ke draft.'
      );
    }

    restoredRow = data;
    restoreMode = 'recreated_draft_row';
    revisionSnapshot = { ...data };

    if (entityTable === 'experiences') {
      const savedDetails = await syncRestoredExperienceDetails(
        client,
        data.id,
        sanitizedDetails
      );
      revisionSnapshot.detail_sections = savedDetails;
    } else if (entityTable === 'projects') {
      const savedGallery = await syncRestoredProjectMedia(
        client,
        data.id,
        sanitizedGallery
      );
      revisionSnapshot.gallery = savedGallery;
    }
  }

  const shortRevId = String(revision.id || '').slice(0, 8);
  await recordRevision({
    entityTable,
    entityId: restoredRow.id,
    action: 'restore',
    snapshot: revisionSnapshot,
    summaryNote: `Restored revision ${shortRevId} as draft`,
  });

  return {
    row: restoredRow,
    meta,
    restoreMode,
  };
}
