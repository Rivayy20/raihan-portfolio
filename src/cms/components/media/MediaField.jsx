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

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}

      <div
        className={`p-3 rounded-xl border bg-slate-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          error ? 'border-red-400 dark:border-red-700' : 'border-slate-200 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
            {!value ? (
              accept === 'pdf' ? (
                <FaFilePdf className="text-xl text-slate-400" />
              ) : (
                <FaImage className="text-xl text-slate-400" />
              )
            ) : assetQuery.isLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-zinc-800" />
            ) : isPdf ? (
              <FaFilePdf className="text-2xl text-red-500" />
            ) : url ? (
              <img
                src={url}
                alt={asset?.alt_text || asset?.original_name || 'Media preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaImage className="text-xl text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            {value && asset ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {asset.original_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {formatFileSize(asset.size_bytes)} · {asset.is_public ? 'Public' : 'Private Draft'}
                </p>
              </>
            ) : value && assetQuery.isLoading ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">Memuat info media...</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
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
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 hover:border-[#00B4D8] text-xs font-semibold text-slate-800 dark:text-zinc-200 disabled:opacity-50 cursor-pointer"
          >
            {value ? 'Ganti' : 'Pilih Media'}
          </button>

          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange?.(null)}
              aria-label="Hapus pilihan media"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
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
          <p className="text-xs text-slate-500 dark:text-zinc-400">{helperText}</p>
        )
      )}

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        accept={accept}
        defaultCategory={defaultCategory}
        defaultIsPublic={defaultIsPublic}
        title={label ? `Pilih ${label}` : 'Pilih Media'}
        selectedIds={value ? [value] : []}
        onSelect={(selected) => {
          onChange?.(selected?.id || null, selected || null);
        }}
      />
    </div>
  );
}
