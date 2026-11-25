import { assertSupabaseClient, supabaseAdmin } from '../../lib/supabase';
import {
  getMediaCategoryMeta,
  readImageDimensions,
  resolveUploadDestination,
  sanitizeFileName,
  validateMediaFile,
} from '../utils/mediaValidation';

const MEDIA_SELECT =
  'id, bucket_id, storage_path, public_url, file_name, original_name, mime_type, file_ext, size_bytes, width, height, category, alt_text, is_public, uploaded_by, created_at, updated_at';

export async function listMediaAssets({
  category = 'all',
  type = 'all',
  visibility = 'all',
  search = '',
} = {}) {
  const client = assertSupabaseClient(supabaseAdmin);

  let query = client
    .from('media_assets')
    .select(MEDIA_SELECT)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (type === 'image') {
    query = query.like('mime_type', 'image/%');
  } else if (type === 'pdf') {
    query = query.eq('mime_type', 'application/pdf');
  }

  if (visibility === 'public') {
    query = query.eq('is_public', true);
  } else if (visibility === 'private') {
    query = query.eq('is_public', false);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || 'Gagal memuat daftar Media Library.');
  }

  const items = data || [];
  const trimmedSearch = search.trim().toLowerCase();
  if (!trimmedSearch) return items;

  return items.filter((item) => {
    const haystack = `${item.original_name} ${item.file_name} ${item.alt_text} ${item.category}`.toLowerCase();
    return haystack.includes(trimmedSearch);
  });
}

export async function getMediaAssetById(id) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client
    .from('media_assets')
    .select(MEDIA_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Gagal memuat detail aset media.');
  }
  return data;
}

export async function getMediaSignedUrl(bucketId, storagePath, expiresIn = 300) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client.storage
    .from(bucketId)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Gagal membuat tautan sementara untuk file privat.');
  }
  return data.signedUrl;
}

export async function resolveMediaPreviewUrl(asset) {
  if (!asset) return '';
  if (asset.is_public && asset.public_url) {
    return asset.public_url;
  }
  return getMediaSignedUrl(asset.bucket_id, asset.storage_path, 300);
}

export async function uploadMediaAsset({
  file,
  category,
  altText = '',
  isPublic = true,
  onProgress,
}) {
  const client = assertSupabaseClient(supabaseAdmin);
  onProgress?.(10);

  const validation = validateMediaFile(file, category);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  onProgress?.(25);
  const dimensions =
    validation.kind === 'image'
      ? await readImageDimensions(file)
      : { width: null, height: null };

  const { fileName } = sanitizeFileName(file.name);
  const { bucketId, storagePath } = resolveUploadDestination({
    category,
    isPublic,
    fileName,
  });

  const {
    data: { user },
  } = await client.auth.getUser();

  onProgress?.(50);
  const { error: uploadError } = await client.storage
    .from(bucketId)
    .upload(storagePath, file, {
      contentType: validation.mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Gagal mengunggah file ke Supabase Storage.');
  }

  onProgress?.(80);
  const publicUrl = isPublic
    ? client.storage.from(bucketId).getPublicUrl(storagePath).data.publicUrl
    : null;

  const { data: inserted, error: dbError } = await client
    .from('media_assets')
    .insert({
      bucket_id: bucketId,
      storage_path: storagePath,
      public_url: publicUrl,
      file_name: fileName,
      original_name: file.name,
      mime_type: validation.mimeType,
      file_ext: validation.ext,
      size_bytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
      category,
      alt_text: altText.trim(),
      is_public: Boolean(isPublic),
      uploaded_by: user?.id ?? null,
    })
    .select(MEDIA_SELECT)
    .single();

  if (dbError) {
    // Roll back Storage object so failed metadata writes never leave orphan files.
    await client.storage.from(bucketId).remove([storagePath]);
    throw new Error(dbError.message || 'Gagal menyimpan metadata aset ke database.');
  }

  onProgress?.(100);
  return inserted;
}

export async function replaceMediaAsset({ asset, file, onProgress }) {
  const client = assertSupabaseClient(supabaseAdmin);
  if (!asset) throw new Error('Aset target tidak ditemukan.');

  onProgress?.(10);
  const validation = validateMediaFile(file, asset.category);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  onProgress?.(25);
  const dimensions =
    validation.kind === 'image'
      ? await readImageDimensions(file)
      : { width: null, height: null };

  const { fileName } = sanitizeFileName(file.name);
  const { bucketId, storagePath } = resolveUploadDestination({
    category: asset.category,
    isPublic: Boolean(asset.is_public),
    fileName,
  });

  onProgress?.(55);
  const { error: uploadError } = await client.storage
    .from(bucketId)
    .upload(storagePath, file, {
      contentType: validation.mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Gagal mengunggah file pengganti.');
  }

  onProgress?.(80);
  const publicUrl = asset.is_public
    ? client.storage.from(bucketId).getPublicUrl(storagePath).data.publicUrl
    : null;

  const { data: updated, error: dbError } = await client
    .from('media_assets')
    .update({
      bucket_id: bucketId,
      storage_path: storagePath,
      public_url: publicUrl,
      file_name: fileName,
      original_name: file.name,
      mime_type: validation.mimeType,
      file_ext: validation.ext,
      size_bytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
    })
    .eq('id', asset.id)
    .select(MEDIA_SELECT)
    .single();

  if (dbError) {
    await client.storage.from(bucketId).remove([storagePath]);
    throw new Error(dbError.message || 'Gagal memperbarui metadata aset.');
  }

  if (asset.storage_path && (asset.bucket_id !== bucketId || asset.storage_path !== storagePath)) {
    await client.storage.from(asset.bucket_id).remove([asset.storage_path]);
  }

  onProgress?.(100);
  return updated;
}

export async function updateMediaAssetMeta(id, { alt_text, category }) {
  const client = assertSupabaseClient(supabaseAdmin);
  const payload = {};

  if (typeof alt_text === 'string') {
    payload.alt_text = alt_text.trim();
  }
  if (category) {
    const meta = getMediaCategoryMeta(category);
    if (!meta) throw new Error('Kategori media tidak valid.');
    payload.category = category;
  }

  const { data, error } = await client
    .from('media_assets')
    .update(payload)
    .eq('id', id)
    .select(MEDIA_SELECT)
    .single();

  if (error) {
    throw new Error(error.message || 'Gagal memperbarui informasi aset.');
  }
  return data;
}

export async function promoteMediaAssetToPublic(asset) {
  const client = assertSupabaseClient(supabaseAdmin);
  if (!asset) throw new Error('Aset tidak ditemukan.');
  if (asset.is_public) return asset;

  const { data: blob, error: downloadError } = await client.storage
    .from(asset.bucket_id)
    .download(asset.storage_path);

  if (downloadError || !blob) {
    throw new Error(downloadError?.message || 'Gagal membaca file dari bucket private.');
  }

  const { bucketId: targetBucket, storagePath: targetPath } = resolveUploadDestination({
    category: asset.category,
    isPublic: true,
    fileName: asset.file_name,
  });

  const { error: uploadError } = await client.storage
    .from(targetBucket)
    .upload(targetPath, blob, {
      contentType: asset.mime_type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Gagal mempromosikan file ke bucket publik.');
  }

  const publicUrl = client.storage.from(targetBucket).getPublicUrl(targetPath).data.publicUrl;

  const { data: updated, error: dbError } = await client
    .from('media_assets')
    .update({
      bucket_id: targetBucket,
      storage_path: targetPath,
      public_url: publicUrl,
      is_public: true,
    })
    .eq('id', asset.id)
    .select(MEDIA_SELECT)
    .single();

  if (dbError) {
    await client.storage.from(targetBucket).remove([targetPath]);
    throw new Error(dbError.message || 'Gagal memperbarui status publik aset.');
  }

  await client.storage.from(asset.bucket_id).remove([asset.storage_path]);
  return updated;
}

export async function getMediaAssetUsage(assetId) {
  const client = assertSupabaseClient(supabaseAdmin);
  const { data, error } = await client.rpc('get_media_asset_usage', {
    p_asset_id: assetId,
  });

  if (error) {
    throw new Error(error.message || 'Gagal memeriksa dependensi aset media.');
  }

  return data || [];
}

export async function deleteMediaAsset(asset) {
  const client = assertSupabaseClient(supabaseAdmin);
  if (!asset) throw new Error('Aset tidak ditemukan.');

  const usage = await getMediaAssetUsage(asset.id);
  if (usage.length > 0) {
    throw new Error(
      `Aset ini masih digunakan oleh ${usage.length} item konten. Lepaskan referensi atau gunakan Replace Asset terlebih dahulu.`
    );
  }

  const { error: dbError } = await client
    .from('media_assets')
    .delete()
    .eq('id', asset.id);

  if (dbError) {
    throw new Error(dbError.message || 'Gagal menghapus aset dari database.');
  }

  const { error: storageError } = await client.storage
    .from(asset.bucket_id)
    .remove([asset.storage_path]);

  if (storageError) {
    throw new Error(
      `Metadata dihapus, namun file Storage gagal dihapus (${storageError.message}).`
    );
  }

  return true;
}
