import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import {
  promoteReferencedMediaIds,
  recordRevision,
  reorderCollectionItems,
} from '../services/contentWorkflowService';

export async function listExperiencesWithDetails() {
  const client = assertSupabaseClient(supabaseAdmin);
  const [expRes, detRes] = await Promise.all([
    client.from('experiences').select('*').order('display_order', { ascending: true }),
    client
      .from('experience_details')
      .select('*')
      .order('display_order', { ascending: true }),
  ]);

  if (expRes.error) {
    throw new Error(expRes.error.message || 'Gagal memuat daftar pengalaman.');
  }
  if (detRes.error) {
    throw new Error(detRes.error.message || 'Gagal memuat detail pengalaman.');
  }

  const detailsByExp = new Map();
  for (const d of detRes.data || []) {
    if (!detailsByExp.has(d.experience_id)) {
      detailsByExp.set(d.experience_id, []);
    }
    detailsByExp.get(d.experience_id).push(d);
  }

  return (expRes.data || []).map((exp) => ({
    ...exp,
    detail_sections: detailsByExp.get(exp.id) || [],
  }));
}

export function resolveEffectiveExperience(row) {
  if (!row) return null;
  if (
    row.publication_status === 'published' &&
    row.has_unpublished_changes &&
    row.draft_data &&
    typeof row.draft_data === 'object'
  ) {
    const draftDetails = Array.isArray(row.draft_data.detail_sections)
      ? row.draft_data.detail_sections
      : row.detail_sections || [];
    return {
      ...row,
      ...row.draft_data,
      detail_sections: draftDetails,
    };
  }
  return {
    ...row,
    detail_sections: row.detail_sections || [],
  };
}

async function syncExperienceDetails(experienceId, detailSections = [], publicationStatus) {
  const client = assertSupabaseClient(supabaseAdmin);

  const { error: delError } = await client
    .from('experience_details')
    .delete()
    .eq('experience_id', experienceId);

  if (delError) {
    throw new Error(delError.message || 'Gagal menyinkronkan detail pengalaman.');
  }

  if (!detailSections.length) return [];

  const rows = detailSections.map((sec, idx) => ({
    experience_id: experienceId,
    title: String(sec.title || '').trim(),
    body_text: sec.body_text ? String(sec.body_text).trim() : null,
    facts: Array.isArray(sec.facts) ? sec.facts : [],
    items: Array.isArray(sec.items) ? sec.items : [],
    chips: Array.isArray(sec.chips) ? sec.chips : [],
    note: sec.note ? String(sec.note).trim() : null,
    display_order: idx,
    is_visible: sec.is_visible !== false,
    publication_status: publicationStatus,
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

export async function saveExperienceDraft({ currentRow, payload, detailSections }) {
  const client = assertSupabaseClient(supabaseAdmin);

  if (currentRow && currentRow.publication_status === 'published') {
    const { data, error } = await client
      .from('experiences')
      .update({
        draft_data: {
          ...payload,
          detail_sections: detailSections,
        },
        has_unpublished_changes: true,
      })
      .eq('id', currentRow.id)
      .select('*')
      .single();

    if (error) throw new Error(error.message || 'Gagal menyimpan draft pengalaman.');
    return data;
  }

  let savedExp;
  if (!currentRow) {
    const { data, error } = await client
      .from('experiences')
      .insert({
        ...payload,
        publication_status: 'draft',
        has_unpublished_changes: false,
        draft_data: null,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal membuat pengalaman baru.');
    savedExp = data;
  } else {
    const { data, error } = await client
      .from('experiences')
      .update({
        ...payload,
        has_unpublished_changes: false,
        draft_data: null,
      })
      .eq('id', currentRow.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal menyimpan draft pengalaman.');
    savedExp = data;
  }

  await syncExperienceDetails(savedExp.id, detailSections, 'draft');
  return savedExp;
}

export async function publishExperience({
  currentRow,
  payload,
  detailSections,
  summaryNote,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  await promoteReferencedMediaIds([payload.logo_media_id]);

  const liveBody = {
    ...payload,
    publication_status: 'published',
    has_unpublished_changes: false,
    draft_data: null,
    published_at: new Date().toISOString(),
  };

  let savedExp;
  if (!currentRow) {
    const { data, error } = await client
      .from('experiences')
      .insert(liveBody)
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal mempublikasikan pengalaman.');
    savedExp = data;
  } else {
    const { data, error } = await client
      .from('experiences')
      .update(liveBody)
      .eq('id', currentRow.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message || 'Gagal mempublikasikan pengalaman.');
    savedExp = data;
  }

  const savedDetails = await syncExperienceDetails(savedExp.id, detailSections, 'published');

  await recordRevision({
    entityTable: 'experiences',
    entityId: savedExp.id,
    action: 'publish',
    snapshot: { ...savedExp, detail_sections: savedDetails },
    summaryNote: summaryNote || `Published experience: ${savedExp.organization}`,
  });

  return savedExp;
}

export async function unpublishExperience({ currentRow }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from('experiences')
    .update({ publication_status: 'draft' })
    .eq('id', currentRow.id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal menarik publikasi pengalaman.');

  await client
    .from('experience_details')
    .update({ publication_status: 'draft' })
    .eq('experience_id', currentRow.id);

  await recordRevision({
    entityTable: 'experiences',
    entityId: currentRow.id,
    action: 'unpublish',
    snapshot: currentRow,
    summaryNote: `Unpublished experience: ${currentRow.organization}`,
  });

  return data;
}

export async function discardExperienceDraft(id) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from('experiences')
    .update({
      draft_data: null,
      has_unpublished_changes: false,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Gagal membuang draft pengalaman.');
  return data;
}

export async function deleteExperience(currentRow) {
  const client = assertSupabaseClient(supabaseAdmin);
  await recordRevision({
    entityTable: 'experiences',
    entityId: currentRow.id,
    action: 'delete',
    snapshot: currentRow,
    summaryNote: `Deleted experience: ${currentRow.organization}`,
  });

  const { error } = await client.from('experiences').delete().eq('id', currentRow.id);
  if (error) throw new Error(error.message || 'Gagal menghapus pengalaman.');
  return true;
}

export async function reorderExperiences(orderedIds) {
  return reorderCollectionItems({ table: 'experiences', orderedIds });
}
