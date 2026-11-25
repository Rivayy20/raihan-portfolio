export const STORAGE_BUCKETS = {
  PUBLIC_ASSETS: 'public-assets',
  PUBLIC_DOCUMENTS: 'public-documents',
  PRIVATE_DRAFTS: 'private-drafts',
};

export const STORAGE_FOLDERS = {
  [STORAGE_BUCKETS.PUBLIC_ASSETS]: ['profile', 'logos', 'projects', 'icons', 'seo', 'other'],
  [STORAGE_BUCKETS.PUBLIC_DOCUMENTS]: ['cv', 'certificates'],
  [STORAGE_BUCKETS.PRIVATE_DRAFTS]: ['images', 'documents'],
};

export const STORAGE_LIMITS = {
  IMAGE_MAX_BYTES: 5 * 1024 * 1024, // 5 MB
  DOCUMENT_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  DRAFT_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
};

export const ALLOWED_MIME_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
  DOCUMENTS: ['application/pdf'],
  ALL_DRAFTS: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

export const ALLOWED_EXTENSIONS = {
  IMAGES: ['jpg', 'jpeg', 'png', 'webp'],
  DOCUMENTS: ['pdf'],
  ALL_DRAFTS: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
};

/**
 * Appends Supabase Storage's `?download=` query parameter so cross-origin PDF
 * downloads trigger reliably instead of being ignored by `<a download>`.
 */
export function buildStorageDownloadUrl(publicUrl, filename) {
  if (!publicUrl) return '';
  try {
    const url = new URL(publicUrl);
    if (filename) {
      url.searchParams.set('download', filename);
    } else {
      url.searchParams.set('download', '');
    }
    return url.toString();
  } catch {
    return publicUrl;
  }
}
