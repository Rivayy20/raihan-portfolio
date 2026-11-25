import { createElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaEdit, FaPlus, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import { SKILL_CATEGORY_COLORS } from '../../constants/colorPresets';
import { ICON_REGISTRY, getSkillIconComponent } from '../../constants/iconRegistry';
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
import { extractZodErrors, slugify } from '../utils/urlValidation';
import { MediaField } from '../components/media/MediaField';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import {
  SectionCard,
  SelectField,
  TagInputField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

const CATEGORY_SWATCHES = [
  { key: 'teal', label: 'Teal' },
  { key: 'purple', label: 'Purple' },
  { key: 'yellow', label: 'Yellow' },
  { key: 'blue', label: 'Blue' },
  { key: 'cyan', label: 'Cyan' },
  { key: 'coral', label: 'Coral' },
  { key: 'mint', label: 'Mint' },
  { key: 'white', label: 'White' },
];

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug wajib diisi.')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-).'),
  learning_label: z.string().trim().min(1, 'Label group Learning wajib diisi.'),
});

const skillSchema = z.object({
  category_id: z.string().trim().min(1, 'Kategori wajib dipilih.'),
  name: z.string().trim().min(1, 'Nama skill wajib diisi.'),
});

function SkillThumb({ iconType, iconKey, iconMediaId }) {
  const assetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', iconMediaId],
    queryFn: () => getMediaAssetById(iconMediaId),
    enabled: iconType === 'media' && Boolean(iconMediaId),
  });
  const { url } = useMediaUrl(assetQuery.data);

  if (iconType === 'preset') {
    const iconComp = getSkillIconComponent(iconKey);
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-base shrink-0">
        {iconComp ? createElement(iconComp) : <span className="text-[10px] text-slate-400">?</span>}
      </div>
    );
  }

  if (iconType === 'media' && url) {
    return (
      <img
        src={url}
        alt="Skill icon"
        className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 dark:border-zinc-700 p-0.5 shrink-0"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
      —
    </div>
  );
}

function CategoryForm({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(item);

  const [form, setForm] = useState({
    name: effective?.name ?? '',
    slug: effective?.slug ?? '',
    color_preset: effective?.color_preset ?? 'teal',
    accent_preset: effective?.accent_preset ?? 'default',
    learning_label: effective?.learning_label ?? 'Currently Exploring',
    is_visible: effective?.is_visible ?? true,
  });

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

  const validate = () => {
    const candidate = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
    };
    const parsed = categorySchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field kategori.');
      return null;
    }
    return {
      name: parsed.data.name,
      slug: parsed.data.slug,
      color_preset: form.color_preset,
      accent_preset: form.accent_preset,
      learning_label: parsed.data.learning_label,
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
        await saveCollectionDraft({
          table: 'skill_categories',
          currentRow: item,
          payload: valid,
        });
      } else {
        await createCollectionItem({
          table: 'skill_categories',
          payload: valid,
          publishImmediately: false,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success('Draft kategori skill disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan kategori.');
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
          table: 'skill_categories',
          currentRow: item,
          payload: valid,
          summaryNote: `Published skill category: ${valid.name}`,
        });
      } else {
        await createCollectionItem({
          table: 'skill_categories',
          payload: valid,
          publishImmediately: true,
          summaryNote: `Published skill category: ${valid.name}`,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success(`Kategori "${valid.name}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan kategori.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'skill_categories',
        currentRow: item,
        summaryNote: `Unpublished skill category: ${item.name}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.info(`Kategori "${item.name}" ditarik ke draft.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await discardCollectionDraft({ table: 'skill_categories', id: item.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.info('Draft kategori dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title={item ? `Edit Kategori: ${effective?.name}` : 'Tambah Kategori Skill Baru'}
      actions={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-semibold cursor-pointer"
        >
          <FaTimes /> Tutup
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Nama Kategori"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Web Development"
          error={errors.name}
          required
        />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={(e) => updateField('slug', slugify(e.target.value))}
          placeholder="web-development"
          error={errors.slug}
          required
        />
        <SelectField
          label="Accent Preset"
          value={form.accent_preset}
          onChange={(e) => updateField('accent_preset', e.target.value)}
          options={[
            { value: 'default', label: 'Default (Black Border & Cyan Hover)' },
            { value: 'yellow', label: 'Yellow Accent' },
            { value: 'primary', label: 'Primary Cyan Accent' },
          ]}
        />
        <TextField
          label="Learning Sub-Heading"
          value={form.learning_label}
          onChange={(e) => updateField('learning_label', e.target.value)}
          helperText="Subjudul di atas skill berstatus Learning (mis. Networking & Infrastructure)"
          error={errors.learning_label}
          required
        />
      </div>

      <div className="mt-4 space-y-2">
        <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
          Warna Kartu Kategori (Color Preset)
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SWATCHES.map((swatch) => {
            const active = form.color_preset === swatch.key;
            return (
              <button
                key={swatch.key}
                type="button"
                onClick={() => updateField('color_preset', swatch.key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  active
                    ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30'
                    : 'border-slate-200 dark:border-zinc-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-md border border-black/30 ${
                    SKILL_CATEGORY_COLORS[swatch.key] || ''
                  }`}
                />
                {swatch.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <ToggleField
          label="Tampilkan Kategori di Portfolio"
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
    </SectionCard>
  );
}

function SkillForm({ item, categories, skillsInCategoryCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(item);

  const [form, setForm] = useState({
    category_id: effective?.category_id ?? categories[0]?.id ?? '',
    name: effective?.name ?? '',
    tier: effective?.tier ?? 'primary',
    icon_type: effective?.icon_type ?? 'preset',
    icon_key: effective?.icon_key ?? 'FaReact',
    icon_media_id: effective?.icon_media_id ?? null,
    used_in: Array.isArray(effective?.used_in) ? effective.used_in : [],
    is_visible: effective?.is_visible ?? true,
  });

  const [iconSearch, setIconSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const filteredIcons = iconSearch.trim()
    ? ICON_REGISTRY.filter((ic) =>
        `${ic.label} ${ic.key} ${ic.category}`
          .toLowerCase()
          .includes(iconSearch.trim().toLowerCase())
      )
    : ICON_REGISTRY;

  const validate = () => {
    const parsed = skillSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field skill yang belum valid.');
      return null;
    }

    if (form.icon_type === 'preset' && !form.icon_key) {
      toast.error('Pilih ikon preset untuk skill ini.');
      return null;
    }
    if (form.icon_type === 'media' && !form.icon_media_id) {
      toast.error('Pilih gambar ikon custom dari Media Library.');
      return null;
    }

    return {
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      tier: form.tier,
      icon_type: form.icon_type,
      icon_key: form.icon_type === 'preset' ? form.icon_key : null,
      icon_media_id: form.icon_type === 'media' ? form.icon_media_id : null,
      used_in: form.used_in,
      is_visible: form.is_visible,
      display_order: item ? item.display_order : skillsInCategoryCount(parsed.data.category_id),
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      if (item) {
        await saveCollectionDraft({ table: 'skills', currentRow: item, payload: valid });
      } else {
        await createCollectionItem({
          table: 'skills',
          payload: valid,
          publishImmediately: false,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success('Draft skill disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan skill.');
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
          table: 'skills',
          currentRow: item,
          payload: valid,
          mediaIds: [valid.icon_media_id],
          summaryNote: `Published skill: ${valid.name}`,
        });
      } else {
        await createCollectionItem({
          table: 'skills',
          payload: valid,
          publishImmediately: true,
          mediaIds: [valid.icon_media_id],
          summaryNote: `Published skill: ${valid.name}`,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success(`Skill "${valid.name}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan skill.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'skills',
        currentRow: item,
        summaryNote: `Unpublished skill: ${item.name}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.info(`Skill "${item.name}" ditarik ke draft.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish skill.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await discardCollectionDraft({ table: 'skills', id: item.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.info('Draft skill dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title={item ? `Edit Skill: ${effective?.name}` : 'Tambah Skill Baru'}
      actions={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-semibold cursor-pointer"
        >
          <FaTimes /> Tutup
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="Nama Skill / Teknologi"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="React / Supabase / Unity"
          error={errors.name}
          required
        />

        <SelectField
          label="Kategori"
          value={form.category_id}
          onChange={(e) => updateField('category_id', e.target.value)}
          error={errors.category_id}
          options={categories.map((cat) => ({
            value: cat.id,
            label: resolveEffectiveRecord(cat).name,
          }))}
          required
        />

        <SelectField
          label="Status / Tier"
          value={form.tier}
          onChange={(e) => updateField('tier', e.target.value)}
          options={[
            { value: 'primary', label: 'Primary Stack' },
            { value: 'supporting', label: 'Supporting' },
            { value: 'learning', label: 'Learning (Badge Miring)' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <SelectField
          label="Sumber Ikon"
          value={form.icon_type}
          onChange={(e) => updateField('icon_type', e.target.value)}
          options={[
            { value: 'preset', label: 'Icon Registry (React Icons)' },
            { value: 'media', label: 'Custom Logo dari Media Library' },
            { value: 'none', label: 'Tanpa Ikon' },
          ]}
        />

        <div className="flex items-end">
          <ToggleField
            label="Visible di Website"
            checked={form.is_visible}
            onChange={(val) => updateField('is_visible', val)}
          />
        </div>
      </div>

      {form.icon_type === 'preset' && (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Pilih Ikon Teknologi ({filteredIcons.length})
            </span>
            <div className="relative w-full sm:w-60">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder="Cari ikon (mis. react, python)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredIcons.map((entry) => {
              const Icon = entry.component;
              const selected = form.icon_key === entry.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => updateField('icon_key', entry.key)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                    selected
                      ? 'border-[#00B4D8] bg-[#00E5FF]/15 text-[#0096B4] dark:text-[#00E5FF] ring-1 ring-[#00B4D8]'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="text-[10px] font-medium truncate w-full">{entry.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {form.icon_type === 'media' && (
        <div className="mt-4">
          <MediaField
            label="Custom Logo / Ikon Teknologi"
            value={form.icon_media_id}
            onChange={(id) => updateField('icon_media_id', id)}
            accept="image"
            defaultCategory="icons"
          />
        </div>
      )}

      <div className="mt-4">
        <TagInputField
          label="Used In (Tooltip Proyek)"
          value={form.used_in}
          onChange={(tags) => updateField('used_in', tags)}
          placeholder="Contoh: Mecca Swim, Portfolio Website"
          helperText="Ditampilkan saat pengunjung hover/klik badge skill ini."
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
    </SectionCard>
  );
}

export function ExpertiseManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'categories'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);

  const [editingSkill, setEditingSkill] = useState(null);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [deleteSkillTarget, setDeleteSkillTarget] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: [...QUERY_KEYS.cmsExpertise, 'categories'],
    queryFn: () => listCollection('skill_categories', { orderBy: 'display_order' }),
  });

  const skillsQuery = useQuery({
    queryKey: [...QUERY_KEYS.cmsExpertise, 'skills'],
    queryFn: () => listCollection('skills', { orderBy: 'display_order' }),
  });

  const categories = categoriesQuery.data || [];
  const skills = skillsQuery.data || [];
  const categoryNameMap = new Map(
    categories.map((c) => [c.id, resolveEffectiveRecord(c).name])
  );

  const countSkillsInCategory = (catId) =>
    skills.filter((s) => resolveEffectiveRecord(s).category_id === catId).length;

  const filteredSkills = skills.filter((row) => {
    const eff = resolveEffectiveRecord(row);
    if (categoryFilter !== 'all' && eff.category_id !== categoryFilter) return false;
    if (tierFilter !== 'all' && eff.tier !== tierFilter) return false;
    if (search.trim()) {
      const catName = categoryNameMap.get(eff.category_id) || '';
      const hay = `${eff.name} ${catName} ${eff.tier}`.toLowerCase();
      if (!hay.includes(search.trim().toLowerCase())) return false;
    }
    return true;
  });

  const handleMoveCategory = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= categories.length) return;
    const next = [...categories];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setIsReordering(true);
    try {
      await reorderCollectionItems({
        table: 'skill_categories',
        orderedIds: next.map((c) => c.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success('Urutan kategori skill diperbarui.');
    } catch (err) {
      toast.error(err?.message || 'Gagal memperbarui urutan kategori.');
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveSkillInCategory = async (skillRow, delta) => {
    const catId = resolveEffectiveRecord(skillRow).category_id;
    const siblings = skills.filter((s) => resolveEffectiveRecord(s).category_id === catId);
    const idx = siblings.findIndex((s) => s.id === skillRow.id);
    const targetIdx = idx + delta;
    if (idx < 0 || targetIdx < 0 || targetIdx >= siblings.length) return;

    const next = [...siblings];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);

    setIsReordering(true);
    try {
      await reorderCollectionItems({
        table: 'skills',
        orderedIds: next.map((s) => s.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success('Urutan badge skill diperbarui.');
    } catch (err) {
      toast.error(err?.message || 'Gagal memperbarui urutan skill.');
    } finally {
      setIsReordering(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setIsDeleting(true);
    try {
      await deleteCollectionItem({
        table: 'skill_categories',
        currentRow: deleteCategoryTarget,
        summaryNote: `Deleted skill category: ${deleteCategoryTarget.name}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success(`Kategori "${deleteCategoryTarget.name}" dihapus.`);
      setDeleteCategoryTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus kategori.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteSkill = async () => {
    if (!deleteSkillTarget) return;
    setIsDeleting(true);
    try {
      await deleteCollectionItem({
        table: 'skills',
        currentRow: deleteSkillTarget,
        summaryNote: `Deleted skill: ${deleteSkillTarget.name}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsExpertise]);
      toast.success(`Skill "${deleteSkillTarget.name}" dihapus.`);
      setDeleteSkillTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus skill.');
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryColumns = [
    {
      key: 'order',
      label: 'Urutan',
      render: (row) => {
        const idx = categories.findIndex((c) => c.id === row.id);
        return (
          <OrderControls
            index={idx}
            total={categories.length}
            disabled={isReordering}
            onMoveUp={() => handleMoveCategory(idx, idx - 1)}
            onMoveDown={() => handleMoveCategory(idx, idx + 1)}
          />
        );
      },
    },
    {
      key: 'name',
      label: 'Kategori',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div className="flex items-center gap-3">
            <span
              className={`w-6 h-6 rounded-lg border border-black/30 shrink-0 ${
                SKILL_CATEGORY_COLORS[eff.color_preset] || ''
              }`}
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{eff.name}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {countSkillsInCategory(row.id)} skill · /{eff.slug}
              </p>
            </div>
          </div>
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
              setIsCreatingCategory(false);
              setEditingCategory(row);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-[#0096B4] hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteCategoryTarget(row)}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ),
    },
  ];

  const skillColumns = [
    {
      key: 'order',
      label: 'Urutan',
      render: (row) => {
        const catId = resolveEffectiveRecord(row).category_id;
        const siblings = skills.filter((s) => resolveEffectiveRecord(s).category_id === catId);
        const idx = siblings.findIndex((s) => s.id === row.id);
        return (
          <OrderControls
            index={idx}
            total={siblings.length}
            disabled={isReordering || Boolean(search.trim())}
            onMoveUp={() => handleMoveSkillInCategory(row, -1)}
            onMoveDown={() => handleMoveSkillInCategory(row, 1)}
          />
        );
      },
    },
    {
      key: 'skill',
      label: 'Skill & Ikon',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div className="flex items-center gap-3">
            <SkillThumb
              iconType={eff.icon_type}
              iconKey={eff.icon_key}
              iconMediaId={eff.icon_media_id}
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">{eff.name}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {categoryNameMap.get(eff.category_id) || 'Tanpa Kategori'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'tier',
      label: 'Level / Tier',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        const label =
          eff.tier === 'primary'
            ? 'Primary'
            : eff.tier === 'learning'
              ? 'Learning'
              : 'Supporting';
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800">
            {label}
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
              setIsCreatingSkill(false);
              setEditingSkill(row);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-[#0096B4] hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteSkillTarget(row)}
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
        title="Expertise & Skills Management"
        description="Kelola kategori keahlian, warna kartu, badge teknologi, ikon, serta level Primary, Supporting, dan Learning."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('categories');
                setEditingCategory(null);
                setIsCreatingCategory(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
            >
              <FaPlus /> Kategori Baru
            </button>
            <button
              type="button"
              disabled={categories.length === 0}
              onClick={() => {
                setActiveTab('skills');
                setEditingSkill(null);
                setIsCreatingSkill(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              <FaPlus /> Skill Baru
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="inline-flex bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
              : 'text-slate-500 dark:text-zinc-400'
          }`}
        >
          Daftar Skills ({skills.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
              : 'text-slate-500 dark:text-zinc-400'
          }`}
        >
          Kategori Skill ({categories.length})
        </button>
      </div>

      {activeTab === 'categories' ? (
        <>
          {(isCreatingCategory || editingCategory) && (
            <CategoryForm
              key={
                editingCategory
                  ? `${editingCategory.id}-${editingCategory.updated_at}`
                  : 'new-cat'
              }
              item={editingCategory}
              totalCount={categories.length}
              onClose={() => {
                setIsCreatingCategory(false);
                setEditingCategory(null);
              }}
            />
          )}

          <DataTable
            columns={categoryColumns}
            data={categories}
            isLoading={categoriesQuery.isLoading}
            error={categoriesQuery.error}
            onRetry={() => categoriesQuery.refetch()}
            emptyTitle="Belum ada kategori skill"
            emptyDescription="Buat kategori pertama (mis. Web Development, Data & Backend)."
          />
        </>
      ) : (
        <>
          {(isCreatingSkill || editingSkill) && categories.length > 0 && (
            <SkillForm
              key={editingSkill ? `${editingSkill.id}-${editingSkill.updated_at}` : 'new-skill'}
              item={editingSkill}
              categories={categories}
              skillsInCategoryCount={countSkillsInCategory}
              onClose={() => {
                setIsCreatingSkill(false);
                setEditingSkill(null);
              }}
            />
          )}

          <DataTable
            columns={skillColumns}
            data={filteredSkills}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari nama skill..."
            filters={
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {resolveEffectiveRecord(cat).name}
                    </option>
                  ))}
                </select>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="all">Semua Level</option>
                  <option value="primary">Primary Stack</option>
                  <option value="supporting">Supporting</option>
                  <option value="learning">Learning</option>
                </select>
              </div>
            }
            isLoading={skillsQuery.isLoading || categoriesQuery.isLoading}
            error={skillsQuery.error || categoriesQuery.error}
            onRetry={() => {
              skillsQuery.refetch();
              categoriesQuery.refetch();
            }}
            emptyTitle="Belum ada skill"
            emptyDescription="Tambahkan badge teknologi ke dalam kategori."
          />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteCategoryTarget)}
        title="Hapus Kategori Skill?"
        description={
          deleteCategoryTarget
            ? `Kategori "${deleteCategoryTarget.name}" memiliki ${countSkillsInCategory(deleteCategoryTarget.id)} skill di dalamnya yang akan ikut terhapus permanen.`
            : ''
        }
        confirmLabel="Ya, Hapus Kategori"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setDeleteCategoryTarget(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteSkillTarget)}
        title="Hapus Skill?"
        description={
          deleteSkillTarget
            ? `Skill "${deleteSkillTarget.name}" akan dihapus permanen.`
            : ''
        }
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteSkill}
        onCancel={() => setDeleteSkillTarget(null)}
      />
    </div>
  );
}
