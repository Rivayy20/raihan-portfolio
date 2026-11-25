import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import {
  promoteReferencedMediaIds,
  recordRevision,
  reorderCollectionItems,
} from '../services/contentWorkflowService';

export async function listProjectsWithMedia() {
  const client = assertSupabaseClient(supabaseAdmin);

  const [projRes, mediaRes] = await Promise.all([
    client.from('projects').select('*').order('display_order', { ascending: true }),
    client
      .from('project_media')
      .select(
        'id, project_id, media_id, caption, alt_text, is_primary, display_order, publication_status, created_at, media:media_assets(id, bucket_id, storage_path, public_url, original_name, mime_type, size_bytes, width, height, alt_text, is_public)'
      )
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true }),
  ]);

  if (projRes.error) {
    throw new Error(projRes.error.message || 'Gagal memuat daftar projects.');
  }
  if (mediaRes.error) {
    throw new Error(mediaRes.error.message || 'Gagal memuat galeri project.');
  }

  const galleryByProject = new Map();
  for (const pm of mediaRes.data || []) {
    if (!galleryByProject.has(pm.project_id)) {
      galleryByProject.set(pm.project_id, []);
    }
    galleryByProject.get(pm.project_id).push(pm);
  }

  return (projRes.data || []).map((proj) => ({
    ...proj,
    gallery: galleryByProject.get(proj.id) || [],
  }));
}

export function resolveEffectiveProject(row) {
  if (!row) return null;
  if (
    row.publication_status === 'published' &&
    row.has_unpublished_changes &&
    row.draft_data &&
    typeof row.draft_data === 'object'
  ) {
    const draftGallery = Array.isArray(row.draft_data.gallery)
      ? row.draft_data.gallery
      : row.gallery || [];
    return {
      ...row,
      ...row.draft_data,
      gallery: draftGallery,
    };
  }
  return {
    ...row,
    gallery: row.gallery || [],
  };
}

function normalizeGalleryForStorage(galleryItems = []) {
  if (!galleryItems.length) return [];
  const firstPrimary = galleryItems.findIndex((g) => Boolean(g.is_primary));
  const primaryIdx = firstPrimary >= 0 ? firstPrimary : 0;

  return galleryItems.map((item, idx) => ({
    media_id: item.media_id,
    caption: item.caption ? String(item.caption).trim() : null,
    alt_text: item.alt_text ? String(item.alt_text).trim() : null,
    is_primary: idx === primaryIdx,
    display_order: idx,
  }));
}

async function syncProjectMedia(projectId, galleryItems = [], publicationStatus) {
  const client = assertSupabaseClient(supabaseAdmin);

  const { error: delError } = await client
    .from('project_media')
    .delete()
    .eq('project_id', projectId);

  if (delError) {
    throw new Error(delError.message || 'Gagal memperbarui galeri screenshot.');
  }

  const normalized = normalizeGalleryForStorage(galleryItems);
  if (!normalized.length) return [];

  const rows = normalized.map((item) => ({
    ...item,
    project_id: projectId,
    publication_status: publicationStatus,
  }));

  const { data, error: insError } = await client
    .from('project_media')
    .insert(rows)
    .select('*');

  if (insError) {
    throw new Error(insError.message || 'Gagal menyimpan screenshot project.');
  }
  return data || [];
}

export async function saveProjectDraft({ currentRow, payload, galleryItems }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const serializedGallery = normalizeGalleryForStorage(galleryItems);

  if (currentRow && currentRow.publication_status === 'published') {
    const { data, error } = await client
      .from('projects')
      .update({
        draft_data: {
          ...payload,
          gallery: serializedGallery,
        },
        has_unpublished_changes: true,
      })
      .eq('id', currentRow.id)
      .select('*')
      .single();

    if (error) throw new Error(error.message || 'Gagal menyimpan draft project.');
    return data;
  }

  let savedProj;
  if (!currentRow) {
    const { data, error } = await client
      .from('projects')
      .insert({
        ...payload,
        publication_status: 'draft',
        has_unpublished_changes: false,
        draft_data: null,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal membuat project baru.');
    savedProj = data;
  } else {
    const { data, error } = await client
      .from('projects')
      .update({
        ...payload,
        has_unpublished_changes: false,
        draft_data: null,
      })
      .eq('id', currentRow.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal menyimpan draft project.');
    savedProj = data;
  }

  await syncProjectMedia(savedProj.id, serializedGallery, 'draft');
  return savedProj;
}

export async function publishProject({
  currentRow,
  payload,
  galleryItems,
  summaryNote,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  const mediaIds = (galleryItems || []).map((g) => g.media_id);
  await promoteReferencedMediaIds(mediaIds);

  const liveBody = {
    ...payload,
    publication_status: 'published',
    has_unpublished_changes: false,
    draft_data: null,
    published_at: new Date().toISOString(),
  };

  let savedProj;
  if (!currentRow) {
    const { data, error } = await client
      .from('projects')
      .insert(liveBody)
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal mempublikasikan project.');
    savedProj = data;
  } else {
    const { data, error } = await client
      .from('projects')
      .update(liveBody)
      .eq('id', currentRow.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal mempublikasikan project.');
    savedProj = data;
  }

  const savedMedia = await syncProjectMedia(savedProj.id, galleryItems, 'published');

  await recordRevision({
    entityTable: 'projects',
    entityId: savedProj.id,
    action: 'publish',
    snapshot: { ...savedProj, gallery: savedMedia },
    summaryNote: summaryNote || `Published project: ${savedProj.name}`,
  });

  return savedProj;
}

export async function unpublishProject({ currentRow }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from('projects')
    .update({ publication_status: 'draft' })
    .eq('id', currentRow.id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal unpublish project.');

  await client
    .from('project_media')
    .update({ publication_status: 'draft' })
    .eq('project_id', currentRow.id);

  await recordRevision({
    entityTable: 'projects',
    entityId: currentRow.id,
    action: 'unpublish',
    snapshot: currentRow,
    summaryNote: `Unpublished project: ${currentRow.name}`,
  });

  return data;
}

export async function discardProjectDraft(id) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from('projects')
    .update({
      draft_data: null,
      has_unpublished_changes: false,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal membuang draft project.');
  return data;
}

export async function deleteProject(currentRow) {
  const client = assertSupabaseClient(supabaseAdmin);
  await recordRevision({
    entityTable: 'projects',
    entityId: currentRow.id,
    action: 'delete',
    snapshot: currentRow,
    summaryNote: `Deleted project: ${currentRow.name}`,
  });

  const { error } = await client.from('projects').delete().eq('id', currentRow.id);
  if (error) throw new Error(error.message || 'Gagal menghapus project.');
  return true;
}

export async function reorderProjects(orderedIds) {
  return reorderCollectionItems({ table: 'projects', orderedIds });
}
