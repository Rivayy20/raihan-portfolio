import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaEdit, FaFilePdf, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { DocumentViewerModal } from '../../components/ui/DocumentViewerModal';
import { CERTIFICATION_CARD_COLORS } from '../../constants/colorPresets';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useToast } from '../hooks/useToast';
import { getMediaAssetById } from '../repositories/mediaRepository';
import {
  createCollectionItem,
  deleteCollectionItem,
  discardCollectionDraft,
  invalidateCmsCaches,
  listCollection,
  publishCollectionItem,
  reorderCollectionItems,
  resolveEffectiveRecord,
  saveCollectionDraft,
  unpublishCollectionItem,
} from '../services/contentWorkflowService';
import { extractZodErrors, isSafeUrl } from '../utils/urlValidation';
import { MediaField } from '../components/media/MediaField';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import {
  SectionCard,
  SelectField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

const CERT_SWATCHES = [
  { key: 'white', label: 'Editorial Surface' },
  { key: 'primary', label: 'Coral Tint' },
  { key: 'accent', label: 'Peach Tint' },
  { key: 'teal', label: 'Rose Tint' },
  { key: 'yellow', label: 'Sunset Orange Tint' },
];

const certificationSchema = z.object({
  title: z.string().trim().min(1, 'Nama sertifikasi wajib diisi.'),
  issuer: z.string().trim().min(1, 'Issuer wajib diisi.'),
  issue_date_label: z.string().trim().min(1, 'Tanggal terbit (teks) wajib diisi.'),
  verification_url: z
    .string()
    .trim()
    .refine((v) => isSafeUrl(v), 'Gunakan URL http/https verifikasi yang valid.'),
});

function CertificationForm({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(item);

  const [form, setForm] = useState({
    title: effective?.title ?? '',
    credential_name: effective?.credential_name ?? '',
    credential_code: effective?.credential_code ?? '',
    issuer: effective?.issuer ?? '',
    issue_date: effective?.issue_date ?? '',
    issue_date_label: effective?.issue_date_label ?? '',
    verification_status: effective?.verification_status ?? 'verified',
    verification_url: effective?.verification_url ?? '',
    pdf_media_id: effective?.pdf_media_id ?? null,
    color_preset: effective?.color_preset ?? 'white',
    is_visible: effective?.is_visible ?? true,
  });

  const [isTestViewerOpen, setIsTestViewerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const pdfAssetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', form.pdf_media_id],
    queryFn: () => getMediaAssetById(form.pdf_media_id),
    enabled: Boolean(form.pdf_media_id),
  });
  const { url: pdfPreviewUrl } = useMediaUrl(pdfAssetQuery.data);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const parsed = certificationSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field sertifikasi yang belum valid.');
      return null;
    }

    return {
      title: parsed.data.title,
      credential_name: form.credential_name.trim() || parsed.data.title,
      credential_code: form.credential_code.trim() || null,
      issuer: parsed.data.issuer,
      issue_date: form.issue_date || null,
      issue_date_label: parsed.data.issue_date_label,
      verification_status: form.verification_status,
      verification_url: parsed.data.verification_url || null,
      pdf_media_id: form.pdf_media_id || null,
      color_preset: form.color_preset,
      is_visible: Boolean(form.is_visible),
      display_order: item ? item.display_order : totalCount,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      if (item) {
        await saveCollectionDraft({
          table: 'certifications',
          currentRow: item,
          payload: valid,
        });
      } else {
        await createCollectionItem({
          table: 'certifications',
          payload: valid,
          publishImmediately: false,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsCertifications]);
      toast.success('Draft sertifikasi disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan sertifikasi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const valid = validate();
    if (!valid) return;
    setIsPublishing(true);
    try {
      if (item) {
        await publishCollectionItem({
          table: 'certifications',
          currentRow: item,
          payload: valid,
          mediaIds: [valid.pdf_media_id],
          summaryNote: `Published certification: ${valid.title}`,
        });
      } else {
        await createCollectionItem({
          table: 'certifications',
          payload: valid,
          publishImmediately: true,
          mediaIds: [valid.pdf_media_id],
          summaryNote: `Published certification: ${valid.title}`,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsCertifications]);
      toast.success(`Sertifikasi "${valid.title}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan sertifikasi.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'certifications',
        currentRow: item,
        summaryNote: `Unpublished certification: ${item.title}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsCertifications]);
      toast.info(`Sertifikasi "${item.title}" ditarik ke draft.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await discardCollectionDraft({ table: 'certifications', id: item.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsCertifications]);
      toast.info('Draft perubahan dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title={item ? `Edit Sertifikasi: ${effective?.title}` : 'Tambah Sertifikasi Baru'}
      actions={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
        >
          <FaTimes /> Tutup
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Nama Sertifikasi"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Junior Programmer"
          error={errors.title}
          required
        />
        <TextField
          label="Issuer / Penerbit"
          value={form.issuer}
          onChange={(e) => updateField('issuer', e.target.value)}
          placeholder="BNSP / Google"
          error={errors.issuer}
          required
        />
        <TextField
          label="Credential Name (Opsional)"
          value={form.credential_name}
          onChange={(e) => updateField('credential_name', e.target.value)}
          helperText="Default mengikuti Nama Sertifikasi jika dikosongkan."
        />
        <TextField
          label="Credential ID / Kode (Opsional)"
          value={form.credential_code}
          onChange={(e) => updateField('credential_code', e.target.value)}
          placeholder="62033 2512 2 0001024 2025"
        />
        <TextField
          label="Issue Date (Label Tampil)"
          value={form.issue_date_label}
          onChange={(e) => updateField('issue_date_label', e.target.value)}
          placeholder="July 2025"
          error={errors.issue_date_label}
          required
        />
        <TextField
          label="Issue Date (Untuk Sorting, Opsional)"
          type="date"
          value={form.issue_date}
          onChange={(e) => updateField('issue_date', e.target.value)}
        />
        <SelectField
          label="Verification Status"
          value={form.verification_status}
          onChange={(e) => updateField('verification_status', e.target.value)}
          options={[
            { value: 'verified', label: 'Verified Credential' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'expired', label: 'Expired' },
            { value: 'unverified', label: 'Unverified' },
          ]}
        />
        <TextField
          label="Verification URL (Opsional)"
          value={form.verification_url}
          onChange={(e) => updateField('verification_url', e.target.value)}
          placeholder="https://coursera.org/verify/..."
          error={errors.verification_url}
        />
      </div>

      <div className="mt-4 space-y-3">
        <MediaField
          label="File Sertifikat (PDF)"
          value={form.pdf_media_id}
          onChange={(id) => updateField('pdf_media_id', id)}
          accept="pdf"
          defaultCategory="certificates"
        />
        {form.pdf_media_id && pdfPreviewUrl && (
          <button
            type="button"
            onClick={() => setIsTestViewerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:border-primary text-xs font-semibold text-ink cursor-pointer transition-colors"
          >
            <FaFilePdf className="text-red-500" /> Test PDF di Certificate Viewer Modal
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <span className="block text-sm font-semibold text-ink">
          Warna Kartu Sertifikasi
        </span>
        <div className="flex flex-wrap gap-2">
          {CERT_SWATCHES.map((sw) => {
            const active = form.color_preset === sw.key;
            return (
              <button
                key={sw.key}
                type="button"
                onClick={() => updateField('color_preset', sw.key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold text-ink cursor-pointer transition-all ${
                  active
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/8'
                    : 'border-border-subtle bg-surface hover:border-border-strong'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-md border border-border-strong ${
                    CERTIFICATION_CARD_COLORS[sw.key] || ''
                  }`}
                />
                {sw.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <ToggleField
          label="Visible di Website"
          checked={form.is_visible}
          onChange={(val) => updateField('is_visible', val)}
        />
      </div>

      <DraftPublishBar
        publicationStatus={item?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(item?.has_unpublished_changes)}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUnpublish={item ? handleUnpublish : undefined}
        onDiscardDraft={item ? handleDiscard : undefined}
        onPreview={() => navigate('/preview')}
      />

      <DocumentViewerModal
        isOpen={isTestViewerOpen}
        onClose={() => setIsTestViewerOpen(false)}
        pdfUrl={pdfPreviewUrl}
        title={form.title || 'Certificate Preview'}
      />
    </SectionCard>
  );
}

export function CertificationsManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [verFilter, setVerFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const certsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsCertifications,
    queryFn: () => listCollection('certifications', { orderBy: 'display_order' }),
  });

  const items = certsQuery.data || [];
  const filtered = items.filter((row) => {
    const eff = resolveEffectiveRecord(row);
    if (verFilter !== 'all' && eff.verification_status !== verFilter) return false;
    if (search.trim()) {
      const hay = `${eff.title} ${eff.issuer} ${eff.credential_code || ''}`.toLowerCase();
      if (!hay.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  const handleMove = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setIsReordering(true);
    try {
      await reorderCollectionItems({
        table: 'certifications',
        orderedIds: reordered.map((x) => x.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsCertifications]);
      toast.success('Urutan sertifikasi diperbarui.');
    } catch (err) {
      toast.error(err?.message || 'Gagal memperbarui urutan.');
    } finally {
      setIsReordering(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCollectionItem({
        table: 'certifications',
        currentRow: deleteTarget,
        summaryNote: `Deleted certification: ${deleteTarget.title}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsCertifications]);
      toast.success(`Sertifikasi "${deleteTarget.title}" dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus sertifikasi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'order',
      label: 'Urutan',
      render: (row) => {
        const idx = items.findIndex((x) => x.id === row.id);
        return (
          <OrderControls
            index={idx}
            total={items.length}
            disabled={Boolean(search.trim()) || verFilter !== 'all' || isReordering}
            onMoveUp={() => handleMove(idx, idx - 1)}
            onMoveDown={() => handleMove(idx, idx + 1)}
          />
        );
      },
    },
    {
      key: 'title',
      label: 'Sertifikasi',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div>
            <p className="font-semibold text-ink">{eff.title}</p>
            <p className="text-xs text-muted">
              {eff.issuer} · {eff.issue_date_label}
            </p>
          </div>
        );
      },
    },
    {
      key: 'pdf',
      label: 'PDF',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return eff.pdf_media_id ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <FaFilePdf className="text-red-500" /> Terlampir
          </span>
        ) : (
          <span className="text-xs text-muted">Belum dilampirkan</span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        const st =
          row.publication_status === 'published' && row.has_unpublished_changes
            ? 'edited'
            : row.publication_status;
        return (
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={st} />
            <StatusBadge status={eff.is_visible ? 'visible' : 'hidden'} />
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setEditingItem(row);
            }}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-subtle cursor-pointer transition-colors"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
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
        title="Certifications Management"
        description="Kelola kartu sertifikasi Bento expandable, status verifikasi, dan dokumen PDF sertifikat."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <FaPlus /> Tambah Sertifikasi
          </button>
        }
      />

      {(isCreating || editingItem) && (
        <CertificationForm
          key={editingItem ? `${editingItem.id}-${editingItem.updated_at}` : 'new-cert'}
          item={editingItem}
          totalCount={items.length}
          onClose={() => {
            setIsCreating(false);
            setEditingItem(null);
          }}
        />
      )}

      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari sertifikasi, issuer, atau kode..."
        filters={
          <select
            value={verFilter}
            onChange={(e) => setVerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink"
          >
            <option value="all">Semua Verifikasi</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="expired">Expired</option>
            <option value="unverified">Unverified</option>
          </select>
        }
        isLoading={certsQuery.isLoading}
        error={certsQuery.error}
        onRetry={() => certsQuery.refetch()}
        emptyTitle="Belum ada sertifikasi"
        emptyDescription="Tambahkan sertifikasi pertama Anda."
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Sertifikasi?"
        description={
          deleteTarget
            ? `Sertifikasi "${deleteTarget.title}" akan dihapus permanen.`
            : ''
        }
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
