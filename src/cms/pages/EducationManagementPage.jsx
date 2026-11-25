import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
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
import { extractZodErrors } from '../utils/urlValidation';
import { MediaField } from '../components/media/MediaField';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import { OrderControls } from '../components/ui/OrderControls';
import {
  SectionCard,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

const educationSchema = z.object({
  institution: z.string().trim().min(1, 'Nama institusi wajib diisi.'),
  period: z.string().trim().min(1, 'Periode atau tahun lulus wajib diisi.'),
});

function EducationForm({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(item);

  const [form, setForm] = useState({
    institution: effective?.institution ?? '',
    education_level: effective?.education_level ?? 'previous',
    degree: effective?.degree ?? '',
    major: effective?.major ?? '',
    period: effective?.period ?? '',
    description: effective?.description ?? '',
    logo_media_id: effective?.logo_media_id ?? null,
    is_visible: effective?.is_visible ?? true,
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const parsed = educationSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field pendidikan yang belum valid.');
      return null;
    }
    return {
      institution: parsed.data.institution,
      education_level: form.education_level,
      degree: form.degree.trim() || null,
      major: form.major.trim() || null,
      period: parsed.data.period,
      description: form.description.trim() || null,
      logo_media_id: form.logo_media_id || null,
      is_visible: form.is_visible,
      display_order: item ? item.display_order : totalCount,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      if (item) {
        await saveCollectionDraft({ table: 'education', currentRow: item, payload: valid });
      } else {
        await createCollectionItem({
          table: 'education',
          payload: valid,
          publishImmediately: false,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsEducation]);
      toast.success('Draft pendidikan disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft pendidikan.');
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
          table: 'education',
          currentRow: item,
          payload: valid,
          mediaIds: [valid.logo_media_id],
          summaryNote: `Published education: ${valid.institution}`,
        });
      } else {
        await createCollectionItem({
          table: 'education',
          payload: valid,
          publishImmediately: true,
          mediaIds: [valid.logo_media_id],
          summaryNote: `Published education: ${valid.institution}`,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsEducation]);
      toast.success(`Pendidikan "${valid.institution}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan pendidikan.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'education',
        currentRow: item,
        summaryNote: `Unpublished education: ${item.institution}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsEducation]);
      toast.info(`"${item.institution}" ditarik ke draft.`);
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
      await discardCollectionDraft({ table: 'education', id: item.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsEducation]);
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
      title={item ? `Edit Pendidikan: ${effective?.institution}` : 'Tambah Riwayat Pendidikan'}
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
          label="Institusi"
          value={form.institution}
          onChange={(e) => updateField('institution', e.target.value)}
          placeholder="Telkom University / SMK Negeri 2 Magelang"
          error={errors.institution}
          required
        />
        <SelectField
          label="Tingkat / Penempatan"
          value={form.education_level}
          onChange={(e) => updateField('education_level', e.target.value)}
          options={[
            { value: 'current', label: 'Current Education (Tampil di Kartu Utama)' },
            { value: 'previous', label: 'Previous Education (Tampil di Drawer Expandable)' },
          ]}
        />
        <TextField
          label="Degree / Gelar (Opsional)"
          value={form.degree}
          onChange={(e) => updateField('degree', e.target.value)}
          placeholder="Bachelor of Information Systems"
        />
        <TextField
          label="Major / Jurusan (Opsional)"
          value={form.major}
          onChange={(e) => updateField('major', e.target.value)}
          placeholder="Pengembangan Perangkat Lunak dan Gim (PPLG)"
        />
        <TextField
          label="Period / Tahun Lulus"
          value={form.period}
          onChange={(e) => updateField('period', e.target.value)}
          placeholder="2025 - Present / Graduation Year: 2025"
          error={errors.period}
          required
        />
        <ToggleField
          label="Visible di Website"
          description="Sembunyikan sementara tanpa menghapus data."
          checked={form.is_visible}
          onChange={(val) => updateField('is_visible', val)}
        />
        <div className="md:col-span-2">
          <TextAreaField
            label="Deskripsi Tambahan (Opsional)"
            rows={2}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <MediaField
            label="Logo Institusi (Opsional)"
            value={form.logo_media_id}
            onChange={(id) => updateField('logo_media_id', id)}
            accept="image"
            defaultCategory="logos"
            helperText="Jika kosong, komponen EducationCard menampilkan ikon topi toga default."
          />
        </div>
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
    </SectionCard>
  );
}

export function EducationManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const eduQuery = useQuery({
    queryKey: QUERY_KEYS.cmsEducation,
    queryFn: () => listCollection('education', { orderBy: 'display_order' }),
  });

  const items = eduQuery.data || [];
  const filtered = items.filter((row) => {
    const eff = resolveEffectiveRecord(row);
    if (levelFilter !== 'all' && eff.education_level !== levelFilter) return false;
    if (search.trim()) {
      const hay = `${eff.institution} ${eff.degree || ''} ${eff.major || ''} ${eff.period}`.toLowerCase();
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
        table: 'education',
        orderedIds: reordered.map((x) => x.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsEducation]);
      toast.success('Urutan pendidikan diperbarui.');
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
        table: 'education',
        currentRow: deleteTarget,
        summaryNote: `Deleted education: ${deleteTarget.institution}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsEducation]);
      toast.success(`"${deleteTarget.institution}" dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus data pendidikan.');
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
            disabled={Boolean(search.trim()) || levelFilter !== 'all' || isReordering}
            onMoveUp={() => handleMove(idx, idx - 1)}
            onMoveDown={() => handleMove(idx, idx + 1)}
          />
        );
      },
    },
    {
      key: 'institution',
      label: 'Institusi',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div>
            <p className="font-semibold text-ink">{eff.institution}</p>
            <p className="text-xs text-muted">
              {eff.degree || eff.major || 'General'} · {eff.period}
            </p>
          </div>
        );
      },
    },
    {
      key: 'level',
      label: 'Tipe',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-subtle text-ink">
            {eff.education_level === 'current' ? 'Current' : 'Previous'}
          </span>
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
            title="Edit"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
            title="Hapus"
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
        title="Education Management"
        description="Kelola riwayat pendidikan saat ini (kartu utama) dan pendidikan sebelumnya (expandable drawer)."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <FaPlus /> Tambah Pendidikan
          </button>
        }
      />

      {(isCreating || editingItem) && (
        <EducationForm
          key={editingItem ? `${editingItem.id}-${editingItem.updated_at}` : 'new-edu'}
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
        searchPlaceholder="Cari institusi atau jurusan..."
        filters={
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink"
          >
            <option value="all">Semua Tingkat</option>
            <option value="current">Current Education</option>
            <option value="previous">Previous Education</option>
          </select>
        }
        isLoading={eduQuery.isLoading}
        error={eduQuery.error}
        onRetry={() => eduQuery.refetch()}
        emptyTitle="Belum ada data pendidikan"
        emptyDescription="Tambahkan institusi pendidikan Anda."
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Data Pendidikan?"
        description={
          deleteTarget
            ? `"${deleteTarget.institution}" akan dihapus permanen.`
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
