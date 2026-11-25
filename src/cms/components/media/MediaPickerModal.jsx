import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaCheck, FaCloudUploadAlt, FaImages, FaSearch, FaTimes } from 'react-icons/fa';
import { QUERY_KEYS } from '../../../lib/queryClient';
import { listMediaAssets } from '../../repositories/mediaRepository';
import { getCategoriesByKind } from '../../utils/mediaValidation';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { MediaAssetCard } from './MediaAssetCard';
import { MediaUploadZone } from './MediaUploadZone';

function MediaPickerContent({
  onClose,
  onSelect,
  accept,
  defaultCategory,
  defaultIsPublic,
  multiple,
  selectedIds,
  title,
}) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [pickedIds, setPickedIds] = useState(() => selectedIds || []);

  const categoryOptions = getCategoriesByKind(accept);

  const mediaQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.cmsMedia,
      'picker',
      accept,
      categoryFilter,
      visibilityFilter,
      search,
    ],
    queryFn: () =>
      listMediaAssets({
        category: categoryFilter,
        type: accept === 'image' ? 'image' : accept === 'pdf' ? 'pdf' : 'all',
        visibility: visibilityFilter,
        search,
      }),
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const items = mediaQuery.data || [];

  const toggleAsset = (asset) => {
    if (!multiple) {
      setPickedIds([asset.id]);
      return;
    }
    setPickedIds((prev) =>
      prev.includes(asset.id)
        ? prev.filter((id) => id !== asset.id)
        : [...prev, asset.id]
    );
  };

  const handleConfirm = () => {
    const selectedAssets = items.filter((item) => pickedIds.includes(item.id));
    if (!selectedAssets.length) return;
    if (multiple) {
      onSelect(selectedAssets);
    } else {
      onSelect(selectedAssets[0]);
    }
    onClose();
  };

  const handleUploaded = (uploadedAssets) => {
    if (!uploadedAssets?.length) return;
    if (multiple) {
      onSelect(uploadedAssets);
    } else {
      onSelect(uploadedAssets[0]);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-zinc-100">
              {title}
            </h2>
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                <FaImages /> Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                <FaCloudUploadAlt /> Upload Baru
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup picker media"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'upload' ? (
            <MediaUploadZone
              allowedKind={accept}
              defaultCategory={defaultCategory}
              defaultIsPublic={defaultIsPublic}
              compact
              onUploaded={handleUploaded}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama file atau alt text..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="all">Semua Kategori</option>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="all">Semua Visibilitas</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Drafts</option>
                </select>
              </div>

              {mediaQuery.isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-44 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : mediaQuery.isError ? (
                <ErrorState
                  message={mediaQuery.error?.message}
                  onRetry={() => mediaQuery.refetch()}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  icon={FaImages}
                  title="Belum ada aset yang cocok"
                  description="Unggah file baru melalui tab Upload Baru atau ubah filter pencarian."
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold cursor-pointer"
                    >
                      <FaCloudUploadAlt /> Upload Baru
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {items.map((asset) => (
                    <MediaAssetCard
                      key={asset.id}
                      asset={asset}
                      selectable
                      selected={pickedIds.includes(asset.id)}
                      onSelect={toggleAsset}
                      onOpenDetail={(clicked) => {
                        if (!multiple) {
                          onSelect(clicked);
                          onClose();
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Action */}
        {activeTab === 'library' && (
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-zinc-950/60 shrink-0">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {pickedIds.length > 0
                ? `${pickedIds.length} aset dipilih`
                : 'Klik aset untuk memilih'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={pickedIds.length === 0}
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                <FaCheck className="text-[11px]" />
                {multiple ? `Pilih ${pickedIds.length} Aset` : 'Gunakan Media Ini'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  accept = 'all',
  defaultCategory = 'projects',
  defaultIsPublic = true,
  multiple = false,
  selectedIds = [],
  title = 'Pilih Media',
}) {
  if (!isOpen) return null;

  return (
    <MediaPickerContent
      key={`${accept}-${defaultCategory}-${multiple ? 'm' : 's'}`}
      onClose={onClose}
      onSelect={onSelect}
      accept={accept}
      defaultCategory={defaultCategory}
      defaultIsPublic={defaultIsPublic}
      multiple={multiple}
      selectedIds={selectedIds}
      title={title}
    />
  );
}
