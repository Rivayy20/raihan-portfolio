import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FaCopy,
  FaDownload,
  FaExchangeAlt,
  FaExternalLinkAlt,
  FaFilePdf,
  FaGlobe,
  FaLink,
  FaLock,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { buildStorageDownloadUrl } from '../../../constants/storageConfig';
import { QUERY_KEYS } from '../../../lib/queryClient';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { useToast } from '../../hooks/useToast';
import {
  deleteMediaAsset,
  getMediaAssetUsage,
  promoteMediaAssetToPublic,
  replaceMediaAsset,
  resolveMediaPreviewUrl,
  updateMediaAssetMeta,
} from '../../repositories/mediaRepository';
import { formatFileSize, getMediaCategoryMeta } from '../../utils/mediaValidation';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TextField } from '../ui/FormField';

function formatTimestamp(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function MediaDetailContent({ asset, onClose, onAssetUpdated, onAssetDeleted }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const replaceInputRef = useRef(null);

  const [altText, setAltText] = useState(asset.alt_text || '');
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isConfirmPromoteOpen, setIsConfirmPromoteOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPdf = asset.mime_type === 'application/pdf';
  const categoryMeta = getMediaCategoryMeta(asset.category);
  const { url, isLoading: isUrlLoading } = useMediaUrl(asset);

  const usageQuery = useQuery({
    queryKey: ['cms', 'mediaUsage', asset.id],
    queryFn: () => getMediaAssetUsage(asset.id),
  });

  const usageList = usageQuery.data || [];
  const isInUse = usageList.length > 0;
  const isBusy =
    isSavingMeta || replaceProgress !== null || isPromoting || isDeleting;

  const acceptAttr =
    categoryMeta?.kind === 'pdf'
      ? '.pdf,application/pdf'
      : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isBusy && !isConfirmDeleteOpen && !isConfirmPromoteOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBusy, isConfirmDeleteOpen, isConfirmPromoteOpen, onClose]);

  const handleCopyUrl = async () => {
    try {
      const resolved = await resolveMediaPreviewUrl(asset);
      await navigator.clipboard.writeText(resolved);
      toast.success(
        asset.is_public
          ? 'URL publik disalin ke clipboard.'
          : 'Signed URL sementara (5 menit) disalin ke clipboard.'
      );
    } catch (err) {
      toast.error(err?.message || 'Gagal menyalin URL.');
    }
  };

  const handleSaveMeta = async (e) => {
    e.preventDefault();
    setIsSavingMeta(true);
    try {
      const updated = await updateMediaAssetMeta(asset.id, { alt_text: altText });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia });
      onAssetUpdated?.(updated);
      toast.success('Informasi aset diperbarui.');
    } catch (err) {
      toast.error(err?.message || 'Gagal memperbarui metadata.');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplaceProgress(10);
    try {
      const updated = await replaceMediaAsset({
        asset,
        file,
        onProgress: setReplaceProgress,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia }),
        queryClient.invalidateQueries({ queryKey: ['cms', 'mediaAsset', asset.id] }),
        queryClient.invalidateQueries({ queryKey: ['cms', 'mediaSignedUrl', asset.id] }),
      ]);
      onAssetUpdated?.(updated);
      toast.success('File aset berhasil diganti tanpa memutus referensi konten.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mengganti file aset.');
    } finally {
      setReplaceProgress(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleConfirmPromote = async () => {
    setIsPromoting(true);
    try {
      const updated = await promoteMediaAssetToPublic(asset);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia }),
        queryClient.invalidateQueries({ queryKey: ['cms', 'mediaAsset', asset.id] }),
      ]);
      onAssetUpdated?.(updated);
      setIsConfirmPromoteOpen(false);
      toast.success('Aset berhasil dipromosikan ke bucket publik.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempromosikan aset.');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMediaAsset(asset);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsMedia }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cmsStats }),
      ]);
      setIsConfirmDeleteOpen(false);
      toast.success('Aset berhasil dihapus dari Media Library dan Storage.');
      onAssetDeleted?.(asset);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus aset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadHref = asset.is_public ? buildStorageDownloadUrl(url, asset.original_name) : url;

  return (
    <div
      className="fixed inset-0 z-65 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail media ${asset.original_name}`}
      onClick={() => {
        if (!isBusy) onClose();
      }}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold text-ink truncate">
              {asset.original_name}
            </h2>
            <p className="text-xs text-muted">
              {categoryMeta?.label || asset.category} · {asset.bucket_id}/{asset.storage_path}
            </p>
          </div>

          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            aria-label="Tutup modal detail"
            className="p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-subtle cursor-pointer transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Preview Area */}
          <div className="lg:col-span-7 bg-surface-subtle/60 p-4 sm:p-6 flex flex-col items-center justify-center min-h-70 border-b lg:border-b-0 lg:border-r border-border-subtle">
            {isUrlLoading || !url ? (
              <div className="w-full h-64 rounded-xl bg-surface-subtle animate-pulse" />
            ) : isPdf ? (
              <div className="w-full flex flex-col gap-3">
                <iframe
                  src={`${url}#toolbar=0`}
                  title={asset.original_name}
                  className="hidden md:block w-full h-115 rounded-xl border border-border-subtle bg-white"
                />
                <div className="flex md:hidden flex-col items-center text-center py-8 px-4 bg-surface rounded-xl border border-border-subtle">
                  <FaFilePdf className="text-5xl text-red-500 mb-3" />
                  <p className="text-sm font-semibold text-ink">Pratinjau PDF Inline Terbatas di Mobile</p>
                  <p className="text-xs text-muted mt-1">
                    Buka dokumen di tab baru atau unduh langsung ke perangkat Anda.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2.5">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-semibold text-ink hover:bg-surface-subtle transition-colors"
                  >
                    <FaExternalLinkAlt className="text-[11px]" /> Buka di Tab Baru
                  </a>
                  <a
                    href={downloadHref}
                    download={asset.original_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold transition-colors"
                  >
                    <FaDownload className="text-[11px]" /> Download PDF
                  </a>
                </div>
              </div>
            ) : (
              <img
                src={url}
                alt={asset.alt_text || asset.original_name}
                className="max-h-120 w-auto object-contain rounded-xl border border-border-subtle bg-surface"
              />
            )}
          </div>

          {/* Info & Actions Area */}
          <div className="lg:col-span-5 p-5 sm:p-6 space-y-5">
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
              >
                <FaCopy className="text-[11px]" /> Copy URL
              </button>

              <input
                ref={replaceInputRef}
                type="file"
                accept={acceptAttr}
                onChange={handleReplaceFile}
                className="sr-only"
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => replaceInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
              >
                <FaExchangeAlt className="text-[11px]" /> Replace File
              </button>

              {!asset.is_public && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setIsConfirmPromoteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <FaGlobe className="text-[11px]" /> Promote to Public
                </button>
              )}
            </div>

            {replaceProgress !== null && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">
                  Mengganti file... {replaceProgress}%
                </p>
                <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${replaceProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* File Metadata */}
            <dl className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-subtle/60 border border-border-subtle text-xs">
              <div>
                <dt className="text-muted font-semibold">Visibilitas</dt>
                <dd className="font-semibold text-ink mt-0.5 flex items-center gap-1">
                  {asset.is_public ? (
                    <>
                      <FaGlobe className="text-emerald-500" /> Public CDN
                    </>
                  ) : (
                    <>
                      <FaLock className="text-amber-500" /> Private Draft
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted font-semibold">Ukuran</dt>
                <dd className="font-semibold text-ink mt-0.5">{formatFileSize(asset.size_bytes)}</dd>
              </div>
              <div>
                <dt className="text-muted font-semibold">MIME Type</dt>
                <dd className="font-mono text-ink mt-0.5">{asset.mime_type}</dd>
              </div>
              <div>
                <dt className="text-muted font-semibold">Dimensi</dt>
                <dd className="font-semibold text-ink mt-0.5">
                  {asset.width && asset.height ? `${asset.width} × ${asset.height} px` : '—'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted font-semibold">Diunggah</dt>
                <dd className="font-medium text-ink mt-0.5">{formatTimestamp(asset.created_at)}</dd>
              </div>
            </dl>

            {/* Edit Alt Text */}
            <form onSubmit={handleSaveMeta} className="space-y-2.5">
              <TextField
                label="Alt Text / Keterangan Aset"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Deskripsi untuk aksesibilitas dan SEO..."
                disabled={isBusy}
              />
              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink hover:opacity-90 text-canvas text-xs font-semibold disabled:opacity-50 cursor-pointer transition-opacity"
              >
                <FaSave className="text-[11px]" />
                {isSavingMeta ? 'Menyimpan...' : 'Simpan Metadata'}
              </button>
            </form>

            {/* Usage Dependency Guard */}
            <div className="pt-4 border-t border-border-subtle space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <FaLink /> Referensi Konten ({usageList.length})
              </p>

              {usageQuery.isLoading ? (
                <p className="text-xs text-muted">
                  Memeriksa dependensi aset...
                </p>
              ) : usageQuery.isError ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Gagal memeriksa dependensi aset.
                </p>
              ) : isInUse ? (
                <ul className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                  {usageList.map((u, idx) => (
                    <li
                      key={`${u.source_table}-${u.record_id}-${u.field_name}-${idx}`}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300"
                    >
                      <strong>{u.source_table}</strong> · {u.record_label || u.record_id} (
                      <code className="font-mono">{u.field_name}</code>)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">
                  Aset ini belum dipakai di modul konten mana pun.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isBusy || usageQuery.isLoading || usageQuery.isError || isInUse}
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <FaTrash className="text-[11px]" /> Hapus Aset Permanen
                </button>
                {isInUse && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
                    Tidak dapat dihapus karena masih digunakan. Gunakan tombol Replace File jika ingin mengganti media secara aman.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmPromoteOpen}
        title="Promosikan Aset ke Bucket Publik?"
        description="File akan dipindahkan ke bucket publik agar dapat ditampilkan pada website portfolio publik."
        confirmLabel="Ya, Jadikan Publik"
        variant="primary"
        isLoading={isPromoting}
        onConfirm={handleConfirmPromote}
        onCancel={() => setIsConfirmPromoteOpen(false)}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Hapus Aset Media?"
        description={`File "${asset.original_name}" akan dihapus permanen dari database dan Supabase Storage.`}
        confirmLabel="Ya, Hapus Permanen"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
}

export function MediaDetailModal({ asset, isOpen, onClose, onAssetUpdated, onAssetDeleted }) {
  if (!isOpen || !asset) return null;

  return (
    <MediaDetailContent
      key={asset.id}
      asset={asset}
      onClose={onClose}
      onAssetUpdated={onAssetUpdated}
      onAssetDeleted={onAssetDeleted}
    />
  );
}
