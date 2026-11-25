import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FaCloudUploadAlt,
  FaCopy,
  FaEye,
  FaFilePdf,
  FaGlobe,
  FaImages,
  FaList,
  FaLock,
  FaMagic,
  FaSearch,
  FaSyncAlt,
  FaThLarge,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useToast } from '../hooks/useToast';
import {
  deleteMediaAsset,
  getMediaAssetUsage,
  listMediaAssets,
  resolveMediaPreviewUrl,
} from '../repositories/mediaRepository';
import {
  MEDIA_CATEGORIES,
  formatFileSize,
  getMediaCategoryMeta,
} from '../utils/mediaValidation';
import { MediaAssetCard } from '../components/media/MediaAssetCard';
import { MediaDetailModal } from '../components/media/MediaDetailModal';
import { MediaUploadZone } from '../components/media/MediaUploadZone';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { invalidateCmsCaches } from '../services/contentWorkflowService';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHeader } from '../components/ui/PageHeader';

function ListThumb({ asset }) {
  const isPdf = asset.mime_type === 'application/pdf';
  const { url } = useMediaUrl(asset);

  if (isPdf) {
    return (
      <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-500 shrink-0">
        <FaFilePdf />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl bg-surface-subtle border border-border-subtle overflow-hidden shrink-0">
      {url && (
        <img
          src={url}
          alt={asset.alt_text || asset.original_name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const [detailAsset, setDetailAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMigrateConfirmOpen, setIsMigrateConfirmOpen] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);

  const mediaQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.cmsMedia,
      'library',
      categoryFilter,
      typeFilter,
      visibilityFilter,
      search,
    ],
    queryFn: () =>
      listMediaAssets({
        category: categoryFilter,
        type: typeFilter,
        visibility: visibilityFilter,
        search,
      }),
  });

  const assets = mediaQuery.data || [];

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia }),
      mediaQuery.refetch(),
    ]);
    toast.info('Media Library diperbarui.');
  };

  const handleConfirmMigrate = async () => {
    setMigrationProgress({ current: 0, total: 17, label: 'Menyiapkan migrasi...', status: 'processing' });
    try {
      const { migrateLocalAssetsToSupabase } = await import(
        '../services/assetMigrationService'
      );
      const summary = await migrateLocalAssetsToSupabase({
        onProgress: (prog) => setMigrationProgress(prog),
      });

      await invalidateCmsCaches(queryClient, [
        QUERY_KEYS.cmsSiteSettings,
        QUERY_KEYS.cmsProfile,
        QUERY_KEYS.cmsExperiences,
        QUERY_KEYS.cmsProjects,
        QUERY_KEYS.cmsCertifications,
        QUERY_KEYS.cmsSeo,
      ]);
      await mediaQuery.refetch();

      setIsMigrateConfirmOpen(false);
      setMigrationProgress(null);

      if (summary.errors.length > 0) {
        toast.warning(
          `Migrasi selesai sebagian: ${summary.uploaded} diunggah, ${summary.skipped} dilewati, ${summary.linked} relasi ditautkan (${summary.errors.length} gagal).`
        );
      } else {
        toast.success(
          `Migrasi selesai: ${summary.uploaded} aset diunggah, ${summary.skipped} sudah ada, ${summary.linked} relasi NULL ditautkan.`
        );
      }
    } catch (err) {
      setMigrationProgress(null);
      toast.error(err?.message || 'Gagal menjalankan migrasi aset lokal.');
    }
  };

  const handleCopyUrl = async (asset) => {
    try {
      const url = await resolveMediaPreviewUrl(asset);
      await navigator.clipboard.writeText(url);
      toast.success(
        asset.is_public
          ? 'URL publik disalin ke clipboard.'
          : 'Signed URL sementara (5 menit) disalin ke clipboard.'
      );
    } catch (err) {
      toast.error(err?.message || 'Gagal menyalin URL aset.');
    }
  };

  const handleRequestDelete = async (asset) => {
    if (isCheckingUsage) return;
    setIsCheckingUsage(true);
    try {
      const usage = await getMediaAssetUsage(asset.id);
      if (usage.length > 0) {
        toast.warning(
          `Aset masih dipakai oleh ${usage.length} konten. Buka detail untuk melihat referensi atau Replace File.`
        );
        setDetailAsset(asset);
        return;
      }
      setDeleteTarget(asset);
    } catch (err) {
      toast.error(err?.message || 'Gagal memeriksa dependensi aset.');
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMediaAsset(deleteTarget);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsStats }),
      ]);
      if (detailAsset?.id === deleteTarget.id) {
        setDetailAsset(null);
      }
      toast.success(`Aset "${deleteTarget.original_name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus aset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const listColumns = [
    {
      key: 'asset',
      label: 'File',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <ListThumb asset={row} />
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate max-w-65">
              {row.original_name}
            </p>
            <p className="text-xs text-muted truncate max-w-65">
              {row.alt_text || row.storage_path}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Kategori',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-surface-subtle text-xs font-semibold text-ink">
          {getMediaCategoryMeta(row.category)?.label || row.category}
        </span>
      ),
    },
    {
      key: 'visibility',
      label: 'Visibilitas',
      render: (row) =>
        row.is_public ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <FaGlobe /> Public
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <FaLock /> Private Draft
          </span>
        ),
    },
    {
      key: 'meta',
      label: 'Ukuran',
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-ink">{formatFileSize(row.size_bytes)}</p>
          <p className="text-muted">
            {row.width && row.height ? `${row.width}×${row.height}` : row.file_ext.toUpperCase()}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDetailAsset(row)}
            title="Detail & Preview"
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-subtle cursor-pointer transition-colors"
          >
            <FaEye className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => handleCopyUrl(row)}
            title="Salin URL"
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-subtle cursor-pointer transition-colors"
          >
            <FaCopy className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => handleRequestDelete(row)}
            title="Hapus Aset"
            className="p-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Kelola gambar dan dokumen PDF yang tersimpan pada Supabase Storage secara terpusat."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle border border-border-subtle text-xs font-semibold text-ink">
            {assets.length} Aset
          </span>
        }
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
            >
              <FaSyncAlt className={mediaQuery.isFetching ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => setIsMigrateConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
            >
              <FaMagic className="text-primary" /> Migrasi Aset Lokal
            </button>
            <button
              type="button"
              onClick={() => setShowUploadPanel((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FaCloudUploadAlt />
              {showUploadPanel ? 'Tutup Upload Panel' : 'Upload Media'}
            </button>
          </>
        }
      />

      {showUploadPanel && (
        <MediaUploadZone
          defaultCategory={categoryFilter !== 'all' ? categoryFilter : 'projects'}
          onUploaded={() => {
            setShowUploadPanel(false);
          }}
        />
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-1 gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/70 text-xs pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama file atau alt text..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          <select
            aria-label="Filter kategori"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink"
          >
            <option value="all">Semua Kategori</option>
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter tipe file"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink"
          >
            <option value="all">Semua Tipe</option>
            <option value="image">Images (JPG/PNG/WebP)</option>
            <option value="pdf">Documents (PDF)</option>
          </select>

          <select
            aria-label="Filter visibilitas"
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink"
          >
            <option value="all">Semua Visibilitas</option>
            <option value="public">Public Only</option>
            <option value="private">Private Drafts</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 self-end lg:self-auto bg-surface-subtle border border-border-subtle p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Tampilan Grid"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <FaThLarge /> Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="Tampilan List"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <FaList /> List
          </button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <DataTable
          columns={listColumns}
          data={assets}
          isLoading={mediaQuery.isLoading}
          error={mediaQuery.error}
          onRetry={() => mediaQuery.refetch()}
          emptyTitle="Media Library masih kosong"
          emptyDescription="Unggah gambar atau PDF untuk mulai mengelola aset website RAZH."
          emptyAction={
            <button
              type="button"
              onClick={() => setShowUploadPanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <FaCloudUploadAlt /> Upload Media Pertama
            </button>
          }
        />
      ) : mediaQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-60 rounded-2xl bg-surface border border-border-subtle animate-pulse"
            />
          ))}
        </div>
      ) : mediaQuery.isError ? (
        <ErrorState
          title="Gagal memuat Media Library"
          message={mediaQuery.error?.message}
          onRetry={() => mediaQuery.refetch()}
        />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={FaImages}
          title="Belum ada aset media"
          description="Unggah gambar atau sertifikat/CV PDF untuk langsung digunakan di seluruh modul CMS."
          action={
            <button
              type="button"
              onClick={() => setShowUploadPanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <FaCloudUploadAlt /> Upload Media Sekarang
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <MediaAssetCard
              key={asset.id}
              asset={asset}
              onOpenDetail={(item) => setDetailAsset(item)}
              onCopyUrl={handleCopyUrl}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      <MediaDetailModal
        asset={detailAsset}
        isOpen={Boolean(detailAsset)}
        onClose={() => setDetailAsset(null)}
        onAssetUpdated={(updated) => setDetailAsset(updated)}
        onAssetDeleted={() => setDetailAsset(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Aset Media?"
        description={
          deleteTarget
            ? `File "${deleteTarget.original_name}" akan dihapus permanen dari database dan Supabase Storage.`
            : ''
        }
        confirmLabel="Ya, Hapus Permanen"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={isMigrateConfirmOpen}
        title="Migrasi Aset Lokal ke Supabase Storage?"
        description={
          migrationProgress
            ? `Memproses (${migrationProgress.current}/${migrationProgress.total}): ${migrationProgress.label}`
            : 'Seluruh aset awal portfolio (foto profil terkompresi WebP, OG image, CV PDF, logo organisasi, 9 screenshot project, dan 3 sertifikat PDF) akan diunggah secara idempoten ke bucket publik & hanya mengisi kolom media_id yang masih kosong.'
        }
        confirmLabel="Mulai Migrasi"
        cancelLabel="Batal"
        variant="primary"
        isLoading={Boolean(migrationProgress)}
        onConfirm={handleConfirmMigrate}
        onCancel={() => {
          if (!migrationProgress) setIsMigrateConfirmOpen(false);
        }}
      />
    </div>
  );
}
