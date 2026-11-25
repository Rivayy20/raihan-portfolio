import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaArrowLeft, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
import {
  deleteExperience,
  discardExperienceDraft,
  listExperiencesWithDetails,
  publishExperience,
  reorderExperiences,
  resolveEffectiveExperience,
  saveExperienceDraft,
  unpublishExperience,
} from '../repositories/experienceAdminRepository';
import { invalidateCmsCaches } from '../services/contentWorkflowService';
import { extractZodErrors, slugify } from '../utils/urlValidation';
import { MediaField } from '../components/media/MediaField';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import {
  SectionCard,
  SelectField,
  TagInputField,
  TextAreaField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

const POSITION_TYPES = [
  { value: 'academic', label: 'Academic' },
  { value: 'internship', label: 'Internship' },
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'organization', label: 'Organization' },
];

const experienceSchema = z.object({
  job_title: z.string().trim().min(1, 'Job title wajib diisi.'),
  organization: z.string().trim().min(1, 'Nama organisasi wajib diisi.'),
  short_name: z.string().trim().min(1, 'Short name wajib diisi.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug wajib diisi.')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).'),
});

function DetailBlockCard({ block, index, total, onChange, onRemove, onMove }) {
  const updateBlock = (patch) => onChange({ ...block, ...patch });

  // Facts helpers ([{ label, value }])
  const facts = Array.isArray(block.facts) ? block.facts : [];
  const addFact = () => updateBlock({ facts: [...facts, { label: '', value: '' }] });
  const updateFact = (i, patch) =>
    updateBlock({ facts: facts.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });
  const removeFact = (i) =>
    updateBlock({ facts: facts.filter((_, idx) => idx !== i) });

  // Items helpers (string | { label, text })
  const items = Array.isArray(block.items) ? block.items : [];
  const addItem = (asLabeled = false) =>
    updateBlock({
      items: [...items, asLabeled ? { label: '', text: '' } : ''],
    });
  const updateItem = (i, val) =>
    updateBlock({ items: items.map((it, idx) => (idx === i ? val : it)) });
  const removeItem = (i) =>
    updateBlock({ items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-border-subtle rounded-2xl p-4 sm:p-5 bg-surface-subtle/40 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <OrderControls
            index={index}
            total={total}
            onMoveUp={() => onMove(index, index - 1)}
            onMoveDown={() => onMove(index, index + 1)}
          />
          <span className="font-heading font-bold text-sm text-ink">
            Detail Section #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={block.is_visible !== false}
              onChange={(e) => updateBlock({ is_visible: e.target.checked })}
              className="accent-primary"
            />
            Visible
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            <FaTrash className="text-[11px]" /> Hapus Blok
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Judul Detail Section"
          value={block.title || ''}
          onChange={(e) => updateBlock({ title: e.target.value })}
          placeholder="Contoh: Role Overview, Responsibilities, Tools Used..."
          required
        />
        <TextField
          label="Catatan Kaki / Note (Opsional)"
          value={block.note || ''}
          onChange={(e) => updateBlock({ note: e.target.value })}
          placeholder="Catatan kecil italic di bagian bawah blok..."
        />
      </div>

      <TextAreaField
        label="Paragraf Pembuka (Opsional)"
        rows={2}
        value={block.body_text || ''}
        onChange={(e) => updateBlock({ body_text: e.target.value })}
      />

      {/* Facts Builder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Key-Value Facts ({facts.length})
          </span>
          <button
            type="button"
            onClick={addFact}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <FaPlus className="text-[10px]" /> Fact
          </button>
        </div>
        {facts.map((fact, fIdx) => (
          <div key={fIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <input
              type="text"
              value={fact.label || ''}
              onChange={(e) => updateFact(fIdx, { label: e.target.value })}
              placeholder="Label (mis. Division)"
              className="sm:col-span-4 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={fact.value || ''}
              onChange={(e) => updateFact(fIdx, { value: e.target.value })}
              placeholder="Value (mis. Applied Tools)"
              className="sm:col-span-7 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => removeFact(fIdx)}
              className="sm:col-span-1 p-2 text-muted hover:text-red-500 cursor-pointer justify-self-end transition-colors"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        ))}
      </div>

      {/* Bullet Items Builder */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Bullet Items ({items.length})
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => addItem(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <FaPlus className="text-[10px]" /> Plain Bullet
            </button>
            <button
              type="button"
              onClick={() => addItem(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <FaPlus className="text-[10px]" /> Labeled Bullet
            </button>
          </div>
        </div>

        {items.map((it, iIdx) => {
          const isLabeled = it && typeof it === 'object';
          return (
            <div key={iIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              {isLabeled ? (
                <>
                  <input
                    type="text"
                    value={it.label || ''}
                    onChange={(e) =>
                      updateItem(iIdx, { ...it, label: e.target.value })
                    }
                    placeholder="Label tebal (mis. IT Governance)"
                    className="sm:col-span-4 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="text"
                    value={it.text || ''}
                    onChange={(e) =>
                      updateItem(iIdx, { ...it, text: e.target.value })
                    }
                    placeholder="Teks penjelasan..."
                    className="sm:col-span-7 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={String(it || '')}
                  onChange={(e) => updateItem(iIdx, e.target.value)}
                  placeholder="Isi poin bullet..."
                  className="sm:col-span-11 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
              <button
                type="button"
                onClick={() => removeItem(iIdx)}
                className="sm:col-span-1 p-2 text-muted hover:text-red-500 cursor-pointer justify-self-end transition-colors"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Chips Builder */}
      <TagInputField
        label="Tag Chips (Tools / Skills)"
        value={Array.isArray(block.chips) ? block.chips : []}
        onChange={(chips) => updateBlock({ chips })}
        placeholder="Contoh: Unity, C#, Microsoft Power BI..."
      />
    </div>
  );
}

function ExperienceEditor({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveExperience(item);

  const [form, setForm] = useState({
    job_title: effective?.job_title ?? '',
    organization: effective?.organization ?? '',
    short_name: effective?.short_name ?? '',
    slug: effective?.slug ?? '',
    position_type: effective?.position_type ?? 'internship',
    logo_media_id: effective?.logo_media_id ?? null,
    logo_alt: effective?.logo_alt ?? '',
    institution: effective?.institution ?? '',
    division: effective?.division ?? '',
    start_date: effective?.start_date ?? '',
    end_date: effective?.end_date ?? '',
    is_current: effective?.is_current ?? false,
    period_label: effective?.period_label ?? '',
    duration_label: effective?.duration_label ?? '',
    summary: effective?.summary ?? '',
    detailed_description: effective?.detailed_description ?? '',
    responsibilities: Array.isArray(effective?.responsibilities)
      ? effective.responsibilities
      : [],
    relevant_skills: Array.isArray(effective?.relevant_skills)
      ? effective.relevant_skills
      : [],
    is_visible: effective?.is_visible ?? true,
  });

  const [detailSections, setDetailSections] = useState(() =>
    Array.isArray(effective?.detail_sections) ? effective.detail_sections : []
  );

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'organization' && !item && !prev.slug) {
        next.slug = slugify(val);
      }
      if (key === 'is_current' && val === true) {
        next.end_date = '';
      }
      return next;
    });
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addDetailSection = () => {
    setDetailSections((prev) => [
      ...prev,
      {
        title: '',
        body_text: '',
        facts: [],
        items: [],
        chips: [],
        note: '',
        is_visible: true,
      },
    ]);
    setIsDirty(true);
  };

  const updateDetailSection = (idx, nextBlock) => {
    setDetailSections((prev) => prev.map((b, i) => (i === idx ? nextBlock : b)));
    setIsDirty(true);
  };

  const removeDetailSection = (idx) => {
    setDetailSections((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const moveDetailSection = (from, to) => {
    setDetailSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setIsDirty(true);
  };

  const validate = () => {
    const candidate = {
      ...form,
      slug: form.slug.trim() || slugify(form.organization || form.job_title),
    };
    const parsed = experienceSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field Experience yang belum valid.');
      return null;
    }

    for (let i = 0; i < detailSections.length; i += 1) {
      if (!String(detailSections[i].title || '').trim()) {
        toast.error(`Judul pada Detail Section #${i + 1} wajib diisi.`);
        return null;
      }
    }

    const cleanDetails = detailSections.map((sec) => ({
      ...sec,
      title: String(sec.title).trim(),
      facts: (sec.facts || []).filter((f) => f.label?.trim() || f.value?.trim()),
      items: (sec.items || []).filter((it) =>
        typeof it === 'string' ? it.trim() : it?.label?.trim() || it?.text?.trim()
      ),
    }));

    return {
      payload: {
        slug: parsed.data.slug,
        job_title: parsed.data.job_title,
        organization: parsed.data.organization,
        short_name: parsed.data.short_name,
        position_type: form.position_type,
        logo_media_id: form.logo_media_id || null,
        logo_alt: form.logo_alt.trim() || `${parsed.data.organization} logo`,
        institution: form.institution.trim() || null,
        division: form.division.trim() || null,
        start_date: form.start_date || null,
        end_date: form.is_current ? null : form.end_date || null,
        is_current: Boolean(form.is_current),
        period_label: form.period_label.trim() || null,
        duration_label: form.duration_label.trim() || null,
        summary: form.summary.trim() || null,
        detailed_description: form.detailed_description.trim() || null,
        responsibilities: form.responsibilities,
        relevant_skills: form.relevant_skills,
        is_visible: Boolean(form.is_visible),
        display_order: item ? item.display_order : totalCount,
      },
      cleanDetails,
    };
  };

  const handleSaveDraft = async () => {
    const validated = validate();
    if (!validated) return;
    setIsSaving(true);
    try {
      await saveExperienceDraft({
        currentRow: item,
        payload: validated.payload,
        detailSections: validated.cleanDetails,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExperiences]);
      toast.success('Draft Experience disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft Experience.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const validated = validate();
    if (!validated) return;
    setIsPublishing(true);
    try {
      await publishExperience({
        currentRow: item,
        payload: validated.payload,
        detailSections: validated.cleanDetails,
        summaryNote: `Published experience: ${validated.payload.organization}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExperiences]);
      toast.success(`Experience "${validated.payload.organization}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan Experience.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishExperience({ currentRow: item });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExperiences]);
      toast.info(`"${item.organization}" ditarik ke draft.`);
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
      await discardExperienceDraft(item.id);
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExperiences]);
      toast.info('Draft perubahan Experience dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
        >
          <FaArrowLeft className="text-[11px]" /> Kembali ke Daftar Experience
        </button>
      </div>

      <SectionCard
        title={item ? `Edit Experience: ${effective.organization}` : 'Tambah Experience Baru'}
        description="Informasi inti pengalaman kerja, magang, atau asisten laboratorium."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Job Title / Posisi"
            value={form.job_title}
            onChange={(e) => updateField('job_title', e.target.value)}
            error={errors.job_title}
            required
          />
          <TextField
            label="Organization"
            value={form.organization}
            onChange={(e) => updateField('organization', e.target.value)}
            error={errors.organization}
            required
          />
          <TextField
            label="Short Name (Untuk Kartu Overview)"
            value={form.short_name}
            onChange={(e) => updateField('short_name', e.target.value)}
            placeholder="SAG Laboratory / PT. Teknoreka"
            error={errors.short_name}
            required
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => updateField('slug', slugify(e.target.value))}
            placeholder="sag-laboratory"
            error={errors.slug}
            required
          />
          <SelectField
            label="Position Type"
            value={form.position_type}
            onChange={(e) => updateField('position_type', e.target.value)}
            options={POSITION_TYPES}
          />
          <TextField
            label="Institution (Opsional)"
            value={form.institution}
            onChange={(e) => updateField('institution', e.target.value)}
            placeholder="Telkom University"
          />
          <TextField
            label="Division (Opsional)"
            value={form.division}
            onChange={(e) => updateField('division', e.target.value)}
            placeholder="Applied Tools"
          />
          <TextField
            label="Period Label (Teks Tampil)"
            value={form.period_label}
            onChange={(e) => updateField('period_label', e.target.value)}
            placeholder="September 2026 – Present"
          />
          <TextField
            label="Start Date"
            type="date"
            value={form.start_date}
            onChange={(e) => updateField('start_date', e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            value={form.is_current ? '' : form.end_date}
            disabled={form.is_current}
            onChange={(e) => updateField('end_date', e.target.value)}
          />
          <TextField
            label="Duration Label (Opsional)"
            value={form.duration_label}
            onChange={(e) => updateField('duration_label', e.target.value)}
            placeholder="5 Months (jika diisi, tampil menggantikan periode di list utama)"
          />
          <TextField
            label="Logo Alt Text"
            value={form.logo_alt}
            onChange={(e) => updateField('logo_alt', e.target.value)}
            placeholder="SAG Laboratory logo"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border-subtle">
          <ToggleField
            label="Current Status (Masih Aktif)"
            description="Menampilkan badge 'Current' dan mengosongkan tanggal selesai."
            checked={form.is_current}
            onChange={(val) => updateField('is_current', val)}
          />
          <ToggleField
            label="Visible di Website"
            checked={form.is_visible}
            onChange={(val) => updateField('is_visible', val)}
          />
        </div>

        <div className="mt-4">
          <MediaField
            label="Organization Logo"
            value={form.logo_media_id}
            onChange={(id) => updateField('logo_media_id', id)}
            accept="image"
            defaultCategory="logos"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <TextAreaField
            label="Summary"
            rows={2}
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
          />
          <TextAreaField
            label="Detailed Description (Opsional)"
            rows={3}
            value={form.detailed_description}
            onChange={(e) => updateField('detailed_description', e.target.value)}
          />
          <TagInputField
            label="Responsibilities Ringkas"
            value={form.responsibilities}
            onChange={(tags) => updateField('responsibilities', tags)}
          />
          <TagInputField
            label="Relevant Skills Ringkas"
            value={form.relevant_skills}
            onChange={(tags) => updateField('relevant_skills', tags)}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Expandable Detail Sections"
        description="Blok detail terstruktur yang muncul saat pengunjung menekan tombol 'View Details'."
        actions={
          <button
            type="button"
            onClick={addDetailSection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <FaPlus className="text-[10px]" /> Detail Section
          </button>
        }
      >
        {detailSections.length === 0 ? (
          <p className="text-sm text-muted">
            Belum ada detail section. Klik tombol "+ Detail Section" untuk menambahkan.
          </p>
        ) : (
          <div className="space-y-4">
            {detailSections.map((block, idx) => (
              <DetailBlockCard
                key={block.id || idx}
                block={block}
                index={idx}
                total={detailSections.length}
                onChange={(next) => updateDetailSection(idx, next)}
                onRemove={() => removeDetailSection(idx)}
                onMove={moveDetailSection}
              />
            ))}
          </div>
        )}
      </SectionCard>

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
    </div>
  );
}

export function ExperienceManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const expQuery = useQuery({
    queryKey: QUERY_KEYS.cmsExperiences,
    queryFn: listExperiencesWithDetails,
  });

  const items = expQuery.data || [];

  if (isCreating || editingItem) {
    return (
      <ExperienceEditor
        key={editingItem ? `${editingItem.id}-${editingItem.updated_at}` : 'new-exp'}
        item={editingItem}
        totalCount={items.length}
        onClose={() => {
          setIsCreating(false);
          setEditingItem(null);
        }}
      />
    );
  }

  const filtered = items.filter((row) => {
    const eff = resolveEffectiveExperience(row);
    if (typeFilter !== 'all' && eff.position_type !== typeFilter) return false;
    if (search.trim()) {
      const hay = `${eff.organization} ${eff.job_title} ${eff.institution || ''}`.toLowerCase();
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
      await reorderExperiences(reordered.map((x) => x.id));
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExperiences]);
      toast.success('Urutan Experience diperbarui.');
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
      await deleteExperience(deleteTarget);
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExperiences]);
      toast.success(`"${deleteTarget.organization}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus Experience.');
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
            disabled={Boolean(search.trim()) || typeFilter !== 'all' || isReordering}
            onMoveUp={() => handleMove(idx, idx - 1)}
            onMoveDown={() => handleMove(idx, idx + 1)}
          />
        );
      },
    },
    {
      key: 'organization',
      label: 'Organisasi & Posisi',
      render: (row) => {
        const eff = resolveEffectiveExperience(row);
        return (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-ink">
                {eff.organization}
              </p>
              {eff.is_current && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/25">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              {eff.job_title} · {eff.duration_label || eff.period_label || '—'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'details',
      label: 'Detail Blocks',
      render: (row) => {
        const eff = resolveEffectiveExperience(row);
        return (
          <span className="text-xs font-semibold text-muted">
            {eff.detail_sections.length} blok detail
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const eff = resolveEffectiveExperience(row);
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
        title="Experience Management"
        description="Kelola pengalaman kerja, magang, dan asisten laboratorium pada Vertical Timeline serta detail accordion."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <FaPlus /> Tambah Experience
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari organisasi atau posisi..."
        filters={
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border-subtle bg-canvas text-sm text-ink"
          >
            <option value="all">Semua Tipe Posisi</option>
            {POSITION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        }
        isLoading={expQuery.isLoading}
        error={expQuery.error}
        onRetry={() => expQuery.refetch()}
        emptyTitle="Belum ada data pengalaman"
        emptyDescription="Tambahkan pengalaman akademik atau industri baru."
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Experience?"
        description={
          deleteTarget
            ? `"${deleteTarget.organization}" beserta seluruh detail section-nya akan dihapus permanen.`
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
