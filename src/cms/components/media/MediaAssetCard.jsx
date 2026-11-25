import {
  FaCheck,
  FaCopy,
  FaEye,
  FaFilePdf,
  FaGlobe,
  FaLock,
  FaTrash,
} from 'react-icons/fa';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { formatFileSize, getMediaCategoryMeta } from '../../utils/mediaValidation';

export function MediaAssetCard({
  asset,
  selectable = false,
  selected = false,
  onSelect,
  onOpenDetail,
  onCopyUrl,
  onDelete,
}) {
  const isPdf = asset.mime_type === 'application/pdf';
  const { url, isLoading } = useMediaUrl(asset);
  const categoryMeta = getMediaCategoryMeta(asset.category);

  const handleCardClick = () => {
    if (selectable) {
      onSelect?.(asset);
    } else {
      onOpenDetail?.(asset);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onDoubleClick={() => {
        if (selectable && onOpenDetail) {
          onOpenDetail(asset);
        }
      }}
      className={`group bg-white dark:bg-zinc-900 rounded-2xl border overflow-hidden transition-all flex flex-col cursor-pointer ${
        selected
          ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/40 shadow-sm'
          : 'border-slate-200 dark:border-zinc-800 hover:border-[#00B4D8]/60 hover:shadow-sm'
      }`}
    >
      {/* Visual Preview */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-zinc-800">
        {isPdf ? (
          <div className="flex flex-col items-center gap-2 text-red-500 p-4 text-center">
            <FaFilePdf className="text-4xl" />
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
              PDF Document
            </span>
          </div>
        ) : isLoading || !url ? (
          <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-zinc-800" />
        ) : (
          <img
            src={url}
            alt={asset.alt_text || asset.original_name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Visibility Badge */}
        <span
          className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
            asset.is_public
              ? 'bg-emerald-500/90 text-white'
              : 'bg-zinc-900/90 text-amber-300'
          }`}
        >
          {asset.is_public ? <FaGlobe /> : <FaLock />}
          {asset.is_public ? 'Public' : 'Private'}
        </span>

        {/* Selection Checkmark */}
        {selectable && (
          <span
            className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
              selected
                ? 'bg-[#00B4D8] border-[#00B4D8] text-white'
                : 'bg-white/90 dark:bg-zinc-900/90 border-slate-300 dark:border-zinc-600 text-transparent'
            }`}
          >
            <FaCheck />
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
        <div className="min-w-0">
          <p
            className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate"
            title={asset.original_name}
          >
            {asset.original_name}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500 dark:text-zinc-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-medium text-[11px]">
              {categoryMeta?.label || asset.category}
            </span>
            <span>{formatFileSize(asset.size_bytes)}</span>
            {asset.width && asset.height && (
              <span>
                {asset.width}×{asset.height}
              </span>
            )}
          </div>
        </div>

        {!selectable && (
          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.(asset);
              }}
              title="Detail & Preview"
              aria-label="Detail & Preview"
              className="p-2 rounded-lg text-slate-500 hover:text-[#0096B4] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <FaEye className="text-xs" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl?.(asset);
              }}
              title="Salin URL"
              aria-label="Salin URL"
              className="p-2 rounded-lg text-slate-500 hover:text-[#0096B4] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <FaCopy className="text-xs" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(asset);
              }}
              title="Hapus Aset"
              aria-label="Hapus Aset"
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
