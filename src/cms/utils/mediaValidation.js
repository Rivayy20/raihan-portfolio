import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  STORAGE_BUCKETS,
  STORAGE_LIMITS,
} from '../../constants/storageConfig.js';

export const MEDIA_CATEGORIES = [
  {
    value: 'profile',
    label: 'Profile Images',
    kind: 'image',
    publicBucket: STORAGE_BUCKETS.PUBLIC_ASSETS,
    publicFolder: 'profile',
    draftFolder: 'images',
  },
  {
    value: 'logos',
    label: 'Organization Logos',
    kind: 'image',
    publicBucket: STORAGE_BUCKETS.PUBLIC_ASSETS,
    publicFolder: 'logos',
    draftFolder: 'images',
  },
  {
    value: 'projects',
    label: 'Project Screenshots',
    kind: 'image',
    publicBucket: STORAGE_BUCKETS.PUBLIC_ASSETS,
    publicFolder: 'projects',
    draftFolder: 'images',
  },
  {
    value: 'icons',
    label: 'Technology Icons',
    kind: 'image',
    publicBucket: STORAGE_BUCKETS.PUBLIC_ASSETS,
    publicFolder: 'icons',
    draftFolder: 'images',
  },
  {
    value: 'seo',
    label: 'SEO Assets',
    kind: 'image',
    publicBucket: STORAGE_BUCKETS.PUBLIC_ASSETS,
    publicFolder: 'seo',
    draftFolder: 'images',
  },
  {
    value: 'other',
    label: 'Other Assets',
    kind: 'image',
    publicBucket: STORAGE_BUCKETS.PUBLIC_ASSETS,
    publicFolder: 'other',
    draftFolder: 'images',
  },
  {
    value: 'certificates',
    label: 'Certificates (PDF)',
    kind: 'pdf',
    publicBucket: STORAGE_BUCKETS.PUBLIC_DOCUMENTS,
    publicFolder: 'certificates',
    draftFolder: 'documents',
  },
  {
    value: 'cv',
    label: 'CV Documents (PDF)',
    kind: 'pdf',
    publicBucket: STORAGE_BUCKETS.PUBLIC_DOCUMENTS,
    publicFolder: 'cv',
    draftFolder: 'documents',
  },
];

const CATEGORY_MAP = new Map(MEDIA_CATEGORIES.map((item) => [item.value, item]));

export function getMediaCategoryMeta(category) {
  return CATEGORY_MAP.get(category) || null;
}

export function getCategoriesByKind(kind = 'all') {
  if (kind === 'image') {
    return MEDIA_CATEGORIES.filter((c) => c.kind === 'image');
  }
  if (kind === 'pdf') {
    return MEDIA_CATEGORIES.filter((c) => c.kind === 'pdf');
  }
  return MEDIA_CATEGORIES;
}

export function formatFileSize(bytes) {
  const num = Number(bytes);
  if (!Number.isFinite(num) || num <= 0) return '0 B';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

function generateRandomHex(length = 8) {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length);
  }
  return Math.random().toString(16).slice(2, 2 + length).padEnd(length, '0');
}

export function sanitizeFileName(originalName) {
  const leaf = String(originalName || 'asset')
    .split(/[\\/]/)
    .pop() || 'asset';

  const lastDot = leaf.lastIndexOf('.');
  const rawBase = lastDot > 0 ? leaf.slice(0, lastDot) : leaf;
  const rawExt = lastDot > 0 ? leaf.slice(lastDot + 1) : '';

  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanBase = rawBase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  const baseName = cleanBase || 'asset';
  const uniqueSuffix = `${Date.now()}-${generateRandomHex(6)}`;
  const fileName = ext ? `${baseName}-${uniqueSuffix}.${ext}` : `${baseName}-${uniqueSuffix}`;

  return { fileName, baseName, ext };
}

export function normalizeMimeType(mimeType, ext) {
  const normalized = String(mimeType || '').trim().toLowerCase();
  if (normalized === 'image/jpg') return 'image/jpeg';
  if (normalized) return normalized;

  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'pdf') return 'application/pdf';
  return '';
}

export function validateMediaFile(file, category, options = {}) {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan.' };
  }

  const categoryMeta = getMediaCategoryMeta(category);
  if (!categoryMeta) {
    return { valid: false, error: `Kategori media "${category}" tidak valid.` };
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { valid: false, error: 'File kosong atau berukuran 0 byte tidak diizinkan.' };
  }

  const { ext } = sanitizeFileName(file.name);
  if (!ext) {
    return { valid: false, error: 'File harus memiliki ekstensi yang valid (.jpg, .png, .webp, atau .pdf).' };
  }

  const mimeType = normalizeMimeType(file.type, ext);
  const isImageExt = ALLOWED_EXTENSIONS.IMAGES.includes(ext);
  const isPdfExt = ALLOWED_EXTENSIONS.DOCUMENTS.includes(ext);
  const isImageMime = ALLOWED_MIME_TYPES.IMAGES.includes(mimeType);
  const isPdfMime = ALLOWED_MIME_TYPES.DOCUMENTS.includes(mimeType);

  if ((!isImageExt && !isPdfExt) || (!isImageMime && !isPdfMime)) {
    return {
      valid: false,
      error: `Format file ".${ext}" (${mimeType || 'unknown'}) tidak diizinkan. Hanya JPG, JPEG, PNG, WebP, dan PDF yang didukung.`,
    };
  }

  if (isImageExt !== isImageMime || isPdfExt !== isPdfMime) {
    return {
      valid: false,
      error: 'Ekstensi file tidak cocok dengan tipe MIME file.',
    };
  }

  const fileKind = isPdfExt ? 'pdf' : 'image';
  if (fileKind !== categoryMeta.kind) {
    return {
      valid: false,
      error:
        categoryMeta.kind === 'pdf'
          ? `Kategori "${categoryMeta.label}" hanya menerima dokumen PDF.`
          : `Kategori "${categoryMeta.label}" hanya menerima gambar (JPG, PNG, WebP).`,
    };
  }

  if (Array.isArray(options.allowedExtensions) && options.allowedExtensions.length > 0) {
    const allowedExts = options.allowedExtensions.map((e) => String(e).toLowerCase());
    if (!allowedExts.includes(ext)) {
      return {
        valid: false,
        error: `Format ".${ext}" tidak didukung untuk slot ini. Gunakan: ${allowedExts.map((e) => e.toUpperCase()).join(', ')}.`,
      };
    }
  }

  if (Array.isArray(options.allowedMimeTypes) && options.allowedMimeTypes.length > 0) {
    const allowedMimes = options.allowedMimeTypes.map((m) => String(m).toLowerCase());
    if (!allowedMimes.includes(mimeType)) {
      return {
        valid: false,
        error: `Tipe MIME "${mimeType}" tidak didukung untuk slot ini.`,
      };
    }
  }

  const maxBytes =
    fileKind === 'pdf' ? STORAGE_LIMITS.DOCUMENT_MAX_BYTES : STORAGE_LIMITS.IMAGE_MAX_BYTES;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Ukuran file (${formatFileSize(file.size)}) melebihi batas maksimal ${formatFileSize(maxBytes)}.`,
    };
  }

  return { valid: true, kind: fileKind, ext, mimeType };
}

export function resolveUploadDestination({ category, isPublic = true, fileName }) {
  const categoryMeta = getMediaCategoryMeta(category);
  if (!categoryMeta) {
    throw new Error(`Kategori media "${category}" tidak dikenal.`);
  }

  const safeName = String(fileName || '').replace(/^\/+/, '');
  if (!safeName || safeName.includes('..') || safeName.includes('/') || safeName.includes('\\')) {
    throw new Error('Nama file tujuan tidak valid.');
  }

  if (isPublic) {
    return {
      bucketId: categoryMeta.publicBucket,
      storagePath: `${categoryMeta.publicFolder}/${safeName}`,
    };
  }

  return {
    bucketId: STORAGE_BUCKETS.PRIVATE_DRAFTS,
    storagePath: `${categoryMeta.draftFolder}/${categoryMeta.publicFolder}-${safeName}`,
  };
}

export function readImageDimensions(file) {
  if (typeof Image === 'undefined' || typeof URL === 'undefined' || !file) {
    return Promise.resolve({ width: null, height: null });
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      const dims = {
        width: Number.isFinite(img.naturalWidth) ? img.naturalWidth : null,
        height: Number.isFinite(img.naturalHeight) ? img.naturalHeight : null,
      };
      cleanup();
      resolve(dims);
    };

    img.onerror = () => {
      cleanup();
      resolve({ width: null, height: null });
    };

    img.src = objectUrl;
  });
}
