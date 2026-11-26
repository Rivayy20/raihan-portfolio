import { useId, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationCircle,
  FaFilePdf,
  FaImage,
} from 'react-icons/fa';
import { QUERY_KEYS } from '../../../lib/queryClient';
import { useToast } from '../../hooks/useToast';
import { uploadMediaAsset } from '../../repositories/mediaRepository';
import {
  formatFileSize,
  getCategoriesByKind,
  getMediaCategoryMeta,
  validateMediaFile,
} from '../../utils/mediaValidation';
import { SelectField, TextField, ToggleField } from '../ui/FormField';

function makeQueueId(index) {
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MediaUploadZone({
  defaultCategory = 'projects',
  allowedKind = 'all',
  defaultIsPublic = true,
  allowedMimeTypes,
  allowedExtensions,
  compact = false,
  onUploaded,
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const inputRef = useRef(null);
  const inputId = useId();

  const availableCategories = getCategoriesByKind(allowedKind);
  const fallbackCategory = availableCategories[0]?.value || 'other';

  const [category, setCategory] = useState(() =>
    availableCategories.some((c) => c.value === defaultCategory)
      ? defaultCategory
      : fallbackCategory
  );
  const [isPublic, setIsPublic] = useState(Boolean(defaultIsPublic));
  const [altText, setAltText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [queue, setQueue] = useState([]);

  const selectedMeta = getMediaCategoryMeta(category);
  const hasCustomImageFilter =
    selectedMeta?.kind !== 'pdf' &&
    Array.isArray(allowedExtensions) &&
    allowedExtensions.length > 0;
  const acceptAttr =
    selectedMeta?.kind === 'pdf'
      ? '.pdf,application/pdf'
      : hasCustomImageFilter
        ? [
            ...allowedExtensions.map((ext) => `.${ext.toLowerCase()}`),
            ...(allowedMimeTypes || []),
          ].join(',')
        : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

  const updateQueueItem = (id, patch) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || isUploading) return;

    const initialQueue = files.map((file, idx) => {
      const validation = validateMediaFile(file, category, {
        allowedMimeTypes,
        allowedExtensions,
      });
      return {
        id: makeQueueId(idx),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.valid ? '' : validation.error,
      };
    });

    setQueue(initialQueue);

    const validItems = initialQueue.filter((item) => item.status === 'pending');
    const invalidCount = initialQueue.length - validItems.length;
    if (invalidCount > 0) {
      toast.warning(`${invalidCount} file ditolak karena format/ukuran tidak sesuai.`);
    }

    if (!validItems.length) return;

    setIsUploading(true);
    const uploadedAssets = [];

    try {
      for (const item of validItems) {
        updateQueueItem(item.id, { status: 'uploading', progress: 5 });
        try {
          const asset = await uploadMediaAsset({
            file: item.file,
            category,
            altText,
            isPublic,
            allowedMimeTypes,
            allowedExtensions,
            onProgress: (pct) => updateQueueItem(item.id, { progress: pct }),
          });
          updateQueueItem(item.id, { status: 'done', progress: 100 });
          uploadedAssets.push(asset);
        } catch (err) {
          updateQueueItem(item.id, {
            status: 'error',
            error: err?.message || 'Upload gagal.',
          });
        }
      }

      if (uploadedAssets.length > 0) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia }),
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsStats }),
        ]);
        toast.success(`${uploadedAssets.length} file berhasil diunggah.`);
        setAltText('');
        onUploaded?.(uploadedAssets);
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        <SelectField
          label="Kategori Media"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
          options={availableCategories.map((c) => ({ value: c.value, label: c.label }))}
        />

        <TextField
          label="Alt Text Default (Opsional)"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Deskripsi singkat aksesibilitas..."
          disabled={isUploading}
        />

        <div className="flex items-end">
          <div className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-subtle/60">
            <ToggleField
              label={isPublic ? 'Bucket Publik' : 'Private Draft'}
              description={
                isPublic
                  ? 'Langsung dapat diakses CDN publik.'
                  : 'Tersimpan di private-drafts (khusus admin).'
              }
              checked={isPublic}
              onChange={setIsPublic}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer?.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl transition-colors text-center ${
          compact ? 'p-6' : 'p-8'
        } ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border-strong hover:border-primary bg-surface-subtle/40'
        }`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={acceptAttr}
          disabled={isUploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/12 text-primary flex items-center justify-center text-xl">
            <FaCloudUploadAlt />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Drag &amp; drop file ke sini, atau{' '}
              <label
                htmlFor={inputId}
                className="text-primary hover:underline cursor-pointer"
              >
                pilih dari perangkat
              </label>
            </p>
            <p className="text-xs text-muted mt-1 flex items-center justify-center gap-1.5">
              {selectedMeta?.kind === 'pdf' ? (
                <>
                  <FaFilePdf className="text-red-500" /> Khusus PDF · Maksimal 10 MB
                </>
              ) : hasCustomImageFilter ? (
                <>
                  <FaImage className="text-primary" />{' '}
                  {allowedExtensions.map((ext) => ext.toUpperCase()).join(', ')} (Transparan) · Maksimal 5 MB
                </>
              ) : (
                <>
                  <FaImage className="text-primary" /> JPG, JPEG, PNG, WebP · Maksimal 5 MB
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Live Upload Queue */}
      {queue.length > 0 && (
        <ul className="space-y-2">
          {queue.map((item) => (
            <li
              key={item.id}
              className="p-3 rounded-xl border border-border-subtle bg-surface-subtle/50 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">
                    {item.name}
                  </p>
                  <p className="text-muted">
                    {formatFileSize(item.size)}
                  </p>
                </div>

                {item.status === 'done' && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                    <FaCheckCircle /> Selesai
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold shrink-0">
                    <FaExclamationCircle /> Gagal
                  </span>
                )}
                {(item.status === 'uploading' || item.status === 'pending') && (
                  <span className="font-semibold text-primary shrink-0">
                    {item.progress}%
                  </span>
                )}
              </div>

              {(item.status === 'uploading' || item.status === 'done') && (
                <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      item.status === 'done' ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {item.error && (
                <p className="text-xs text-red-600 dark:text-red-400">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
