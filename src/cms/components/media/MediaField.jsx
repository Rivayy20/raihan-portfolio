import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaFilePdf, FaImage, FaTimes } from 'react-icons/fa';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { getMediaAssetById } from '../../repositories/mediaRepository';
import { formatFileSize } from '../../utils/mediaValidation';
import { MediaPickerModal } from './MediaPickerModal';

export function MediaField({
  label,
  value,
  onChange,
  accept = 'image',
  defaultCategory = 'other',
  defaultIsPublic = true,
  allowedMimeTypes,
  allowedExtensions,
  missingAssetText = 'Referensi media tidak ditemukan atau telah dihapus dari Media Library.',
  helperText,
  error,
  required = false,
  disabled = false,
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const assetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', value],
    queryFn: () => getMediaAssetById(value),
    enabled: Boolean(value),
  });

  const asset = value ? assetQuery.data : null;
  const { url } = useMediaUrl(asset);
  const isPdf = asset?.mime_type === 'application/pdf';
  const isMissingAsset = Boolean(value) && !assetQuery.isLoading && !assetQuery.isError && !asset;

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="block text-sm font-semibold text-ink">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}

      <div
        className={`p-3 rounded-xl border bg-surface-subtle/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          error ? 'border-red-400 dark:border-red-700' : 'border-border-subtle'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl border border-border-subtle bg-surface flex items-center justify-center overflow-hidden shrink-0">
            {!value ? (
              accept === 'pdf' ? (
                <FaFilePdf className="text-xl text-muted" />
              ) : (
                <FaImage className="text-xl text-muted" />
              )
            ) : assetQuery.isLoading ? (
              <div className="w-full h-full animate-pulse bg-surface-subtle" />
            ) : isPdf ? (
              <FaFilePdf className="text-2xl text-red-500" />
            ) : url ? (
              <img
                src={url}
                alt={asset?.alt_text || asset?.original_name || 'Media preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaImage className="text-xl text-muted" />
            )}
          </div>

          <div className="min-w-0">
            {value && asset ? (
              <>
                <p className="text-sm font-semibold text-ink truncate">
                  {asset.original_name}
                </p>
                <p className="text-xs text-muted">
                  {formatFileSize(asset.size_bytes)}
                  {asset.file_ext ? ` · ${asset.file_ext.toUpperCase()}` : ''}
                  {asset.width && asset.height ? ` · ${asset.width}×${asset.height} px` : ''}
                  {' · '}
                  {asset.is_public ? 'Public' : 'Private Draft'}
                </p>
              </>
            ) : value && assetQuery.isLoading ? (
              <p className="text-xs text-muted">Memuat info media...</p>
            ) : value && assetQuery.isError ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                Gagal memuat metadata aset media.
              </p>
            ) : isMissingAsset ? (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {missingAssetText}
              </p>
            ) : (
              <p className="text-xs text-muted">
                Belum ada media dipilih
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsPickerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:border-primary text-xs font-semibold text-ink disabled:opacity-50 cursor-pointer transition-colors"
          >
            {value ? 'Ganti' : 'Pilih Media'}
          </button>

          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange?.(null)}
              aria-label="Hapus pilihan media"
              className="p-2 rounded-xl border border-border-subtle text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-muted">{helperText}</p>
        )
      )}

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        accept={accept}
        defaultCategory={defaultCategory}
        defaultIsPublic={defaultIsPublic}
        allowedMimeTypes={allowedMimeTypes}
        allowedExtensions={allowedExtensions}
        title={label ? `Pilih ${label}` : 'Pilih Media'}
        selectedIds={value ? [value] : []}
        onSelect={(selected) => {
          onChange?.(selected?.id || null, selected || null);
        }}
      />
    </div>
  );
}
