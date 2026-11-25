import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  FaArrowLeft,
  FaEdit,
  FaExchangeAlt,
  FaImage,
  FaPlus,
  FaStar,
  FaTrash,
} from 'react-icons/fa';
import { PROJECT_PANEL_COLORS } from '../../constants/colorPresets';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useToast } from '../hooks/useToast';
import { getMediaAssetById } from '../repositories/mediaRepository';
import {
  deleteProject,
  discardProjectDraft,
  listProjectsWithMedia,
  publishProject,
  reorderProjects,
  resolveEffectiveProject,
  saveProjectDraft,
  unpublishProject,
} from '../repositories/projectAdminRepository';
import { invalidateCmsCaches } from '../services/contentWorkflowService';
import { extractZodErrors, isSafeUrl, slugify } from '../utils/urlValidation';
import { MediaPickerModal } from '../components/media/MediaPickerModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import {
  SectionCard,
  TagInputField,
  TextAreaField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

const PROJECT_SWATCHES = [
  { key: 'primary', label: 'Primary (Cyan)' },
  { key: 'secondary', label: 'Secondary (Blue)' },
  { key: 'accent', label: 'Accent (Yellow)' },
  { key: 'teal', label: 'Teal' },
  { key: 'purple', label: 'Purple' },
  { key: 'blue', label: 'Soft Blue' },
  { key: 'white', label: 'White' },
];

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Nama project wajib diisi.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug wajib diisi.')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-).'),
  category: z.string().trim().min(1, 'Kategori wajib diisi.'),
  subtitle: z.string().trim().min(1, 'Subtitle wajib diisi.'),
  problem: z.string().trim().min(1, 'Bagian Problem wajib diisi.'),
  solution: z.string().trim().min(1, 'Bagian Solution wajib diisi.'),
  live_demo_url: z
    .string()
    .trim()
    .refine(
      (v) => isSafeUrl(v, { allowAnchor: true }),
      'Gunakan URL http/https atau anchor (#home).'
    ),
  github_url: z
    .string()
    .trim()
    .refine((v) => isSafeUrl(v), 'Gunakan URL http/https GitHub yang valid.'),
});

function GalleryItemCard({
  entry,
  index,
  total,
  onSetPrimary,
  onReplace,
  onMove,
  onUpdateMeta,
  onRemove,
}) {
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  const assetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', entry.media_id],
    queryFn: () => getMediaAssetById(entry.media_id),
    enabled: Boolean(entry.media_id),
    initialData: entry.media || undefined,
  });

  const asset = assetQuery.data;
  const { url } = useMediaUrl(asset);

  return (
    <div
      className={`rounded-2xl border p-3.5 bg-slate-50/60 dark:bg-zinc-950/60 space-y-3 ${
        entry.is_primary
          ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30'
          : 'border-slate-200 dark:border-zinc-800'
      }`}
    >
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
        {url ? (
          <img
            src={url}
            alt={entry.alt_text || asset?.original_name || `Screenshot ${index + 1}`}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <FaImage className="text-2xl text-slate-400" />
        )}

        {entry.is_primary && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD60A] text-black text-[10px] font-black shadow-xs">
            <FaStar /> Main Showcase
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <OrderControls
          index={index}
          total={total}
          onMoveUp={() => onMove(index, index - 1)}
          onMoveDown={() => onMove(index, index + 1)}
        />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSetPrimary}
            title="Jadikan Main Showcase"
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
              entry.is_primary
                ? 'bg-[#FFD60A] text-black'
                : 'border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-[#FFD60A]'
            }`}
          >
            <FaStar className="text-[10px]" /> {entry.is_primary ? 'Utama' : 'Set Utama'}
          </button>

          <button
            type="button"
            onClick={() => setIsReplaceOpen(true)}
            title="Ganti Screenshot"
            className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-[#00B4D8] cursor-pointer"
          >
            <FaExchangeAlt className="text-[11px]" />
          </button>

          <button
            type="button"
            onClick={onRemove}
            title="Hapus dari Galeri"
            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            <FaTrash className="text-[11px]" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={entry.alt_text || ''}
          onChange={(e) => onUpdateMeta({ alt_text: e.target.value })}
          placeholder="Alt text screenshot..."
          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
        />
        <input
          type="text"
          value={entry.caption || ''}
          onChange={(e) => onUpdateMeta({ caption: e.target.value })}
          placeholder="Caption Lightbox (opsional)..."
          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
        />
      </div>

      <MediaPickerModal
        isOpen={isReplaceOpen}
        onClose={() => setIsReplaceOpen(false)}
        accept="image"
        defaultCategory="projects"
        title="Ganti Screenshot Project"
        selectedIds={[entry.media_id]}
        onSelect={(assetPicked) => {
          if (assetPicked?.id) {
            onReplace(assetPicked);
          }
        }}
      />
    </div>
  );
}

function ProjectEditor({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveProject(item);

  const [form, setForm] = useState({
    name: effective?.name ?? '',
    slug: effective?.slug ?? '',
    category: effective?.category ?? 'Web Development',
    subtitle: effective?.subtitle ?? '',
    description: effective?.description ?? '',
    problem: effective?.problem ?? '',
    solution: effective?.solution ?? '',
    impact: Array.isArray(effective?.impact) ? effective.impact : [],
    tech_stack: Array.isArray(effective?.tech_stack) ? effective.tech_stack : [],
    color_preset: effective?.color_preset ?? 'primary',
    live_demo_url: effective?.live_demo_url ?? '',
    github_url: effective?.github_url ?? '',
    is_featured: effective?.is_featured ?? true,
    is_visible: effective?.is_visible ?? true,
  });

  const [gallery, setGallery] = useState(() =>
    Array.isArray(effective?.gallery) ? effective.gallery : []
  );
  const [isAddGalleryOpen, setIsAddGalleryOpen] = useState(false);

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'name' && !item && !prev.slug) {
        next.slug = slugify(val);
      }
      return next;
    });
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleAddScreenshots = (pickedAssets = []) => {
    const existingIds = new Set(gallery.map((g) => g.media_id));
    const additions = pickedAssets
      .filter((a) => a?.id && !existingIds.has(a.id))
      .map((a, idx) => ({
        media_id: a.id,
        media: a,
        alt_text: a.alt_text || '',
        caption: '',
        is_primary: gallery.length === 0 && idx === 0,
        display_order: gallery.length + idx,
      }));

    if (!additions.length) {
      toast.info('Screenshot tersebut sudah ada di galeri project.');
      return;
    }

    setGallery((prev) => [...prev, ...additions]);
    setIsDirty(true);
  };

  const setPrimaryScreenshot = (targetIdx) => {
    setGallery((prev) =>
      prev.map((itemG, idx) => ({ ...itemG, is_primary: idx === targetIdx }))
    );
    setIsDirty(true);
  };

  const moveScreenshot = (from, to) => {
    setGallery((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setIsDirty(true);
  };

  const replaceScreenshot = (targetIdx, newAsset) => {
    setGallery((prev) =>
      prev.map((itemG, idx) =>
        idx === targetIdx
          ? {
              ...itemG,
              media_id: newAsset.id,
              media: newAsset,
              alt_text: itemG.alt_text || newAsset.alt_text || '',
            }
          : itemG
      )
    );
    setIsDirty(true);
  };

  const removeScreenshot = (targetIdx) => {
    setGallery((prev) => {
      const filtered = prev.filter((_, idx) => idx !== targetIdx);
      if (filtered.length > 0 && !filtered.some((g) => g.is_primary)) {
        filtered[0] = { ...filtered[0], is_primary: true };
      }
      return filtered;
    });
    setIsDirty(true);
  };

  const validate = ({ requireGallery = false } = {}) => {
    const candidate = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
    };
    const parsed = projectSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field project yang belum valid.');
      return null;
    }

    if (requireGallery && gallery.length === 0) {
      toast.error('Tambahkan minimal 1 screenshot project sebelum mempublikasikan.');
      return null;
    }

    return {
      slug: parsed.data.slug,
      name: parsed.data.name,
      category: parsed.data.category,
      subtitle: parsed.data.subtitle,
      description: form.description.trim() || null,
      problem: parsed.data.problem,
      solution: parsed.data.solution,
      impact: form.impact,
      tech_stack: form.tech_stack,
      color_preset: form.color_preset,
      live_demo_url: parsed.data.live_demo_url || null,
      github_url: parsed.data.github_url || null,
      is_featured: Boolean(form.is_featured),
      is_visible: Boolean(form.is_visible),
      display_order: item ? item.display_order : totalCount,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate({ requireGallery: false });
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveProjectDraft({
        currentRow: item,
        payload: valid,
        galleryItems: gallery,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProjects]);
      toast.success('Draft Project disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const valid = validate({ requireGallery: true });
    if (!valid) return;
    setIsPublishing(true);
    try {
      await publishProject({
        currentRow: item,
        payload: valid,
        galleryItems: gallery,
        summaryNote: `Published project: ${valid.name}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProjects]);
      toast.success(`Project "${valid.name}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan project.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishProject({ currentRow: item });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProjects]);
      toast.info(`Project "${item.name}" ditarik ke draft.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await discardProjectDraft(item.id);
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProjects]);
      toast.info('Draft perubahan project dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
        >
          <FaArrowLeft className="text-[11px]" /> Kembali ke Daftar Projects
        </button>
      </div>

      <SectionCard
        title={item ? `Edit Project: ${effective.name}` : 'Tambah Project Baru'}
        description="Kelola informasi utama, Problem/Solution/Impact, Tech Stack, serta tautan proyek."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Project Name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
            required
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => updateField('slug', slugify(e.target.value))}
            error={errors.slug}
            required
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            placeholder="Web Development / Game Development / Data"
            error={errors.category}
            required
          />
          <TextField
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Modern Swimming Attendance System"
            error={errors.subtitle}
            required
          />
          <TextField
            label="Live Demo URL (Opsional)"
            value={form.live_demo_url}
            onChange={(e) => updateField('live_demo_url', e.target.value)}
            placeholder="https://... atau #home"
            error={errors.live_demo_url}
          />
          <TextField
            label="GitHub Repository URL (Opsional)"
            value={form.github_url}
            onChange={(e) => updateField('github_url', e.target.value)}
            placeholder="https://github.com/..."
            error={errors.github_url}
          />
        </div>

        <div className="mt-4 space-y-4">
          <TextAreaField
            label="Deskripsi Umum (Opsional)"
            rows={2}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
          <TextAreaField
            label="Problem"
            rows={3}
            value={form.problem}
            onChange={(e) => updateField('problem', e.target.value)}
            error={errors.problem}
            required
          />
          <TextAreaField
            label="Solution"
            rows={3}
            value={form.solution}
            onChange={(e) => updateField('solution', e.target.value)}
            error={errors.solution}
            required
          />
          <TagInputField
            label="Impact / Outcome"
            value={form.impact}
            onChange={(tags) => updateField('impact', tags)}
            placeholder="Contoh: Faster administration, Reduced human error"
          />
          <TagInputField
            label="Tech Stack"
            value={form.tech_stack}
            onChange={(tags) => updateField('tech_stack', tags)}
            placeholder="Contoh: React, Supabase, Tailwind CSS"
          />
        </div>

        <div className="mt-5 space-y-2">
          <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Warna Panel Showcase (Color Preset)
          </span>
          <div className="flex flex-wrap gap-2">
            {PROJECT_SWATCHES.map((sw) => {
              const active = form.color_preset === sw.key;
              return (
                <button
                  key={sw.key}
                  type="button"
                  onClick={() => updateField('color_preset', sw.key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    active
                      ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30'
                      : 'border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-md border border-black/30 ${
                      PROJECT_PANEL_COLORS[sw.key] || ''
                    }`}
                  />
                  {sw.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <ToggleField
            label="Featured Project"
            description="Tandai sebagai karya unggulan pada showcase."
            checked={form.is_featured}
            onChange={(val) => updateField('is_featured', val)}
          />
          <ToggleField
            label="Visible di Portfolio"
            checked={form.is_visible}
            onChange={(val) => updateField('is_visible', val)}
          />
        </div>
      </SectionCard>

      {/* Multi-Screenshot Gallery Manager */}
      <SectionCard
        title={`Project Gallery (${gallery.length} Screenshot)`}
        description="Unggah atau pilih beberapa screenshot, atur urutan tampil, dan pilih 1 gambar sebagai Main Showcase."
        actions={
          <button
            type="button"
            onClick={() => setIsAddGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold cursor-pointer"
          >
            <FaPlus className="text-[10px]" /> Tambah Screenshot
          </button>
        }
      >
        {gallery.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Belum ada screenshot di galeri project ini. Klik "+ Tambah Screenshot" untuk memilih dari Media Library atau mengunggah gambar baru.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((entry, idx) => (
              <GalleryItemCard
                key={`${entry.media_id}-${idx}`}
                entry={entry}
                index={idx}
                total={gallery.length}
                onSetPrimary={() => setPrimaryScreenshot(idx)}
                onMove={moveScreenshot}
                onReplace={(newAsset) => replaceScreenshot(idx, newAsset)}
                onUpdateMeta={(patch) => {
                  setGallery((prev) =>
                    prev.map((g, i) => (i === idx ? { ...g, ...patch } : g))
                  );
                  setIsDirty(true);
                }}
                onRemove={() => removeScreenshot(idx)}
              />
            ))}
          </div>
        )}

        <MediaPickerModal
          isOpen={isAddGalleryOpen}
          onClose={() => setIsAddGalleryOpen(false)}
          multiple
          accept="image"
          defaultCategory="projects"
          title="Tambah Screenshot Project"
          selectedIds={gallery.map((g) => g.media_id)}
          onSelect={handleAddScreenshots}
        />
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

export function ProjectsManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const projectsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsProjects,
    queryFn: listProjectsWithMedia,
  });

  const items = projectsQuery.data || [];

  if (isCreating || editingItem) {
    return (
      <ProjectEditor
        key={editingItem ? `${editingItem.id}-${editingItem.updated_at}` : 'new-proj'}
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
    const eff = resolveEffectiveProject(row);
    if (statusFilter !== 'all' && row.publication_status !== statusFilter) return false;
    if (search.trim()) {
      const hay = `${eff.name} ${eff.category} ${eff.subtitle}`.toLowerCase();
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
      await reorderProjects(reordered.map((x) => x.id));
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProjects]);
      toast.success('Urutan project diperbarui.');
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
      await deleteProject(deleteTarget);
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProjects]);
      toast.success(`Project "${deleteTarget.name}" dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus project.');
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
            disabled={Boolean(search.trim()) || statusFilter !== 'all' || isReordering}
            onMoveUp={() => handleMove(idx, idx - 1)}
            onMoveDown={() => handleMove(idx, idx + 1)}
          />
        );
      },
    },
    {
      key: 'name',
      label: 'Project',
      render: (row) => {
        const eff = resolveEffectiveProject(row);
        return (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{eff.name}</p>
              {eff.is_featured && (
                <FaStar className="text-[#FFD60A] text-xs" title="Featured" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {eff.category} · {eff.subtitle}
            </p>
          </div>
        );
      },
    },
    {
      key: 'gallery',
      label: 'Galeri',
      render: (row) => {
        const eff = resolveEffectiveProject(row);
        return (
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
            {eff.gallery.length} gambar
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const eff = resolveEffectiveProject(row);
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
            className="p-2 rounded-lg text-slate-500 hover:text-[#0096B4] hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
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
        title="Projects & Gallery Management"
        description="Kelola proyek portfolio, tech stack, tautan demo/source, dan multi-screenshot showcase."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold cursor-pointer"
          >
            <FaPlus /> Tambah Project
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama atau kategori project..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        }
        isLoading={projectsQuery.isLoading}
        error={projectsQuery.error}
        onRetry={() => projectsQuery.refetch()}
        emptyTitle="Belum ada project"
        emptyDescription="Tambahkan project pertama Anda."
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Project?"
        description={
          deleteTarget
            ? `Project "${deleteTarget.name}" akan dihapus permanen. File gambar di Media Library tetap aman.`
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
