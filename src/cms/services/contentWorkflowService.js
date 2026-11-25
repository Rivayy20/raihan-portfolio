import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import { QUERY_KEYS } from '../../lib/queryClient';
import {
  getMediaAssetById,
  promoteMediaAssetToPublic,
} from '../repositories/mediaRepository';

const RESERVED_KEYS = new Set([
  'id',
  'publication_status',
  'has_unpublished_changes',
  'draft_data',
  'published_at',
  'created_at',
  'updated_at',
]);

function stripReservedKeys(obj = {}) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!RESERVED_KEYS.has(k)) {
      out[k] = v;
    }
  }
  return out;
}

export function resolveEffectiveRecord(row) {
  if (!row) return null;
  if (
    row.publication_status === 'published' &&
    row.has_unpublished_changes &&
    row.draft_data &&
    typeof row.draft_data === 'object'
  ) {
    return { ...row, ...row.draft_data };
  }
  return row;
}

export async function promoteReferencedMediaIds(mediaIds = []) {
  const uniqueIds = [...new Set((mediaIds || []).filter(Boolean))];
  if (!uniqueIds.length) return [];

  const promoted = [];
  for (const id of uniqueIds) {
    const asset = await getMediaAssetById(id);
    if (asset && !asset.is_public) {
      const updated = await promoteMediaAssetToPublic(asset);
      promoted.push(updated);
    }
  }
  return promoted;
}

export async function recordRevision({
  entityTable,
  entityId,
  action,
  snapshot,
  summaryNote = null,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client.rpc('record_content_revision', {
    p_entity_table: entityTable,
    p_entity_id: String(entityId),
    p_action: action,
    p_snapshot: snapshot,
    p_summary_note: summaryNote,
  });

  if (error) {
    throw new Error(error.message || 'Gagal mencatat riwayat revisi.');
  }
  return data;
}

export async function invalidateCmsCaches(queryClient, moduleKeys = []) {
  const targets = [
    QUERY_KEYS.cmsStats,
    ['cms', 'pendingDrafts'],
    QUERY_KEYS.cmsRevisions,
    QUERY_KEYS.cmsPreview,
    QUERY_KEYS.cmsMedia,
    QUERY_KEYS.publicPortfolio,
    ...moduleKeys,
  ];
  await Promise.all(
    targets.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  );
}

// ----------------------------------------------------------------------------
// Singleton Helpers (id = 1)
// ----------------------------------------------------------------------------
export async function fetchSingleton(table) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from(table)
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || `Gagal memuat data ${table}.`);
  }
  return data;
}

export async function saveSingletonDraft({
  table,
  currentRow,
  payload,
  mergePartial = false,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  const cleanPayload = stripReservedKeys(payload);

  if (!currentRow) {
    const { data, error } = await client
      .from(table)
      .upsert(
        {
          id: 1,
          ...cleanPayload,
          publication_status: 'draft',
          has_unpublished_changes: false,
          draft_data: null,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(error.message || `Gagal menyimpan draft ${table}.`);
    return data;
  }

  if (currentRow.publication_status === 'published') {
    const nextDraftData = mergePartial
      ? { ...(currentRow.draft_data || {}), ...cleanPayload }
      : cleanPayload;

    const { data, error } = await client
      .from(table)
      .update({
        draft_data: nextDraftData,
        has_unpublished_changes: true,
      })
      .eq('id', 1)
      .select('*')
      .single();

    if (error) throw new Error(error.message || `Gagal menyimpan draft ${table}.`);
    return data;
  }

  const { data, error } = await client
    .from(table)
    .update({
      ...cleanPayload,
      publication_status: 'draft',
      has_unpublished_changes: false,
      draft_data: null,
    })
    .eq('id', 1)
    .select('*')
    .single();

  if (error) throw new Error(error.message || `Gagal menyimpan draft ${table}.`);
  return data;
}

export async function publishSingleton({
  table,
  currentRow,
  payload,
  mergePartial = false,
  mediaIds = [],
  summaryNote,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  await promoteReferencedMediaIds(mediaIds);

  const cleanPayload = stripReservedKeys(payload);
  const merged = mergePartial
    ? { ...stripReservedKeys(currentRow?.draft_data || {}), ...cleanPayload }
    : cleanPayload;

  const updateBody = {
    ...merged,
    publication_status: 'published',
    has_unpublished_changes: false,
    draft_data: null,
    published_at: new Date().toISOString(),
  };

  let saved;
  if (!currentRow) {
    const { data, error } = await client
      .from(table)
      .upsert({ id: 1, ...updateBody }, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) throw new Error(error.message || `Gagal mempublikasikan ${table}.`);
    saved = data;
  } else {
    const { data, error } = await client
      .from(table)
      .update(updateBody)
      .eq('id', 1)
      .select('*')
      .single();
    if (error) throw new Error(error.message || `Gagal mempublikasikan ${table}.`);
    saved = data;
  }

  await recordRevision({
    entityTable: table,
    entityId: '1',
    action: 'publish',
    snapshot: saved,
    summaryNote: summaryNote || `Published ${table}`,
  });

  return saved;
}

export async function discardSingletonDraft({ table }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from(table)
    .update({
      draft_data: null,
      has_unpublished_changes: false,
    })
    .eq('id', 1)
    .select('*')
    .single();

  if (error) throw new Error(error.message || `Gagal membuang draft ${table}.`);
  return data;
}

// ----------------------------------------------------------------------------
// Collection Helpers
// ----------------------------------------------------------------------------
export async function listCollection(
  table,
  { orderBy = 'display_order', ascending = true } = {}
) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from(table)
    .select('*')
    .order(orderBy, { ascending });

  if (error) {
    throw new Error(error.message || `Gagal memuat daftar ${table}.`);
  }
  return data || [];
}

export async function createCollectionItem({
  table,
  payload,
  publishImmediately = false,
  mediaIds = [],
  summaryNote,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  const cleanPayload = stripReservedKeys(payload);

  if (publishImmediately) {
    await promoteReferencedMediaIds(mediaIds);
  }

  const insertBody = {
    ...cleanPayload,
    publication_status: publishImmediately ? 'published' : 'draft',
    has_unpublished_changes: false,
    draft_data: null,
    published_at: publishImmediately ? new Date().toISOString() : null,
  };

  const { data, error } = await client
    .from(table)
    .insert(insertBody)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || `Gagal menambahkan data pada ${table}.`);
  }

  if (publishImmediately) {
    await recordRevision({
      entityTable: table,
      entityId: data.id,
      action: 'publish',
      snapshot: data,
      summaryNote: summaryNote || `Published new ${table} item`,
    });
  }

  return data;
}

export async function saveCollectionDraft({ table, currentRow, payload }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const cleanPayload = stripReservedKeys(payload);

  if (currentRow.publication_status === 'published') {
    const { data, error } = await client
      .from(table)
      .update({
        draft_data: cleanPayload,
        has_unpublished_changes: true,
      })
      .eq('id', currentRow.id)
      .select('*')
      .single();

    if (error) throw new Error(error.message || `Gagal menyimpan draft ${table}.`);
    return data;
  }

  const { data, error } = await client
    .from(table)
    .update({
      ...cleanPayload,
      has_unpublished_changes: false,
      draft_data: null,
    })
    .eq('id', currentRow.id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || `Gagal menyimpan draft ${table}.`);
  return data;
}

export async function publishCollectionItem({
  table,
  currentRow,
  payload,
  mediaIds = [],
  summaryNote,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  await promoteReferencedMediaIds(mediaIds);

  const cleanPayload = stripReservedKeys(payload);
  const { data, error } = await client
    .from(table)
    .update({
      ...cleanPayload,
      publication_status: 'published',
      has_unpublished_changes: false,
      draft_data: null,
      published_at: new Date().toISOString(),
    })
    .eq('id', currentRow.id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || `Gagal mempublikasikan ${table}.`);

  await recordRevision({
    entityTable: table,
    entityId: data.id,
    action: 'publish',
    snapshot: data,
    summaryNote: summaryNote || `Published ${table} item`,
  });

  return data;
}

export async function unpublishCollectionItem({ table, currentRow, summaryNote }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from(table)
    .update({
      publication_status: 'draft',
    })
    .eq('id', currentRow.id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || `Gagal menarik publikasi ${table}.`);

  await recordRevision({
    entityTable: table,
    entityId: data.id,
    action: 'unpublish',
    snapshot: data,
    summaryNote: summaryNote || `Unpublished ${table} item`,
  });

  return data;
}

export async function discardCollectionDraft({ table, id }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from(table)
    .update({
      draft_data: null,
      has_unpublished_changes: false,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || `Gagal membuang draft ${table}.`);
  return data;
}

export async function deleteCollectionItem({ table, currentRow, summaryNote }) {
  const client = assertSupabaseClient(supabaseAdmin);
  await recordRevision({
    entityTable: table,
    entityId: currentRow.id,
    action: 'delete',
    snapshot: currentRow,
    summaryNote: summaryNote || `Deleted ${table} item`,
  });

  const { error } = await client.from(table).delete().eq('id', currentRow.id);
  if (error) throw new Error(error.message || `Gagal menghapus data ${table}.`);
  return true;
}

export async function reorderCollectionItems({ table, orderedIds = [] }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      client.from(table).update({ display_order: index }).eq('id', id)
    )
  );

  for (const res of results) {
    if (res.error) {
      throw new Error(res.error.message || `Gagal menyimpan urutan ${table}.`);
    }
  }
  return true;
}
