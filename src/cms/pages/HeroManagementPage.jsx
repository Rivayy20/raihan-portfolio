import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
import {
  discardSingletonDraft,
  fetchSingleton,
  invalidateCmsCaches,
  publishSingleton,
  resolveEffectiveRecord,
  saveSingletonDraft,
} from '../services/contentWorkflowService';
import { extractZodErrors, isSafeUrl } from '../utils/urlValidation';
import { MediaField } from '../components/media/MediaField';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import { ErrorState } from '../components/ui/ErrorState';
import {
  SectionCard,
  TextAreaField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { FormSkeleton } from '../components/ui/LoadingSkeleton';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';

const FLOATING_SLOTS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

const heroSchema = z.object({
  badge_text: z.string().trim().min(1, 'Teks badge Hero wajib diisi.'),
  subheadline: z.string().trim().min(1, 'Subheadline wajib diisi.'),
  lanyard_name: z.string().trim().min(1, 'Nama pada Lanyard ID Badge wajib diisi.'),
  lanyard_role: z.string().trim().min(1, 'Role pada Lanyard ID Badge wajib diisi.'),
  primary_cta_text: z.string().trim().min(1, 'Teks CTA utama wajib diisi.'),
  primary_cta_href: z
    .string()
    .trim()
    .min(1, 'Target CTA utama wajib diisi.')
    .refine(
      (v) => isSafeUrl(v, { allowAnchor: true }),
      'Gunakan anchor (#projects) atau URL http/https yang valid.'
    ),
  secondary_cta_text: z.string().trim().min(1, 'Teks tombol CV wajib diisi.'),
  cv_modal_title: z.string().trim().min(1, 'Judul modal CV wajib diisi.'),
});

function HeroForm({ rawProfile }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawProfile) || {};

  const [form, setForm] = useState({
    badge_text: effective.badge_text ?? "Hello, I'm a Student & Developer",
    show_badge: effective.show_badge ?? true,
    headline_segments: Array.isArray(effective.headline_segments)
      ? effective.headline_segments
      : [{ text: 'Building Digital Experiences.', highlight: 'none' }],
    subheadline: effective.subheadline ?? '',
    profile_image_id: effective.profile_image_id ?? null,
    lanyard_header: effective.lanyard_header ?? 'ID Badge',
    lanyard_status: effective.lanyard_status ?? 'Access Granted',
    lanyard_name: effective.lanyard_name ?? 'RAIHAN AZKA H.',
    lanyard_role: effective.lanyard_role ?? 'Developer',
    show_lanyard: effective.show_lanyard ?? true,
    floating_labels: Array.isArray(effective.floating_labels)
      ? effective.floating_labels
      : [],
    show_floating_labels: effective.show_floating_labels ?? true,
    primary_cta_text: effective.primary_cta_text ?? 'View My Projects',
    primary_cta_href: effective.primary_cta_href ?? '#projects',
    show_primary_cta: effective.show_primary_cta ?? true,
    secondary_cta_text: effective.secondary_cta_text ?? 'View CV',
    show_secondary_cta: effective.show_secondary_cta ?? true,
    cv_media_id: effective.cv_media_id ?? null,
    cv_modal_title: effective.cv_modal_title ?? 'My CV',
    show_scroll_indicator: effective.show_scroll_indicator ?? true,
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

  // Headline segments helpers
  const updateSegment = (idx, patch) => {
    const next = form.headline_segments.map((seg, i) =>
      i === idx ? { ...seg, ...patch } : seg
    );
    updateField('headline_segments', next);
  };

  const addSegment = () => {
    updateField('headline_segments', [
      ...form.headline_segments,
      { text: ' ', highlight: 'none' },
    ]);
  };

  const removeSegment = (idx) => {
    if (form.headline_segments.length <= 1) return;
    updateField(
      'headline_segments',
      form.headline_segments.filter((_, i) => i !== idx)
    );
  };

  const moveSegment = (from, to) => {
    const next = [...form.headline_segments];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateField('headline_segments', next);
  };

  // Floating labels helpers (max 4, unique slot)
  const addFloatingLabel = () => {
    if (form.floating_labels.length >= 4) {
      toast.warning('Maksimal 4 floating labels agar layout Lanyard tetap rapi.');
      return;
    }
    const usedSlots = new Set(form.floating_labels.map((item) => item.slot));
    const freeSlot = FLOATING_SLOTS.find((s) => !usedSlots.has(s.value))?.value || 'top-left';
    updateField('floating_labels', [
      ...form.floating_labels,
      {
        id: `fl-${Date.now()}`,
        text: 'New Badge',
        slot: freeSlot,
        color_preset: 'accent',
        is_visible: true,
      },
    ]);
  };

  const updateFloatingLabel = (idx, patch) => {
    const next = form.floating_labels.map((item, i) =>
      i === idx ? { ...item, ...patch } : item
    );
    updateField('floating_labels', next);
  };

  const removeFloatingLabel = (idx) => {
    updateField(
      'floating_labels',
      form.floating_labels.filter((_, i) => i !== idx)
    );
  };

  const validate = () => {
    const parsed = heroSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field Hero yang belum valid.');
      return null;
    }

    const cleanSegments = form.headline_segments.filter((s) => String(s.text || '').length > 0);
    if (cleanSegments.length === 0) {
      toast.error('Minimal harus ada 1 segmen teks headline.');
      return null;
    }

    const usedSlots = new Set();
    for (const label of form.floating_labels) {
      if (!label.text?.trim()) {
        toast.error('Setiap floating label harus memiliki teks.');
        return null;
      }
      if (usedSlots.has(label.slot)) {
        toast.error('Setiap floating label harus menempati posisi slot yang berbeda.');
        return null;
      }
      usedSlots.add(label.slot);
    }

    return {
      ...form,
      ...parsed.data,
      headline_segments: cleanSegments,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveSingletonDraft({
        table: 'profile',
        currentRow: rawProfile,
        payload: valid,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProfile]);
      setIsDirty(false);
      toast.success('Draft Hero & CV disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft Hero.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const valid = validate();
    if (!valid) return;
    setIsPublishing(true);
    try {
      await publishSingleton({
        table: 'profile',
        currentRow: rawProfile,
        payload: valid,
        mediaIds: [valid.profile_image_id, valid.cv_media_id],
        summaryNote: 'Published Hero & CV section',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProfile]);
      setIsDirty(false);
      toast.success('Hero & CV berhasil dipublikasikan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan Hero.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'profile' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsProfile]);
      toast.info('Draft perubahan Hero dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Headline & Copy */}
      <SectionCard
        title="Badge, Headline & Subheadline"
        description="Bangun headline berstruktur dengan highlight gelombang SVG tanpa menginjeksikan HTML mentah."
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <TextField
              label="Hero Badge Text"
              value={form.badge_text}
              onChange={(e) => updateField('badge_text', e.target.value)}
              error={errors.badge_text}
              className="md:col-span-2"
              required
            />
            <ToggleField
              label="Tampilkan Badge"
              checked={form.show_badge}
              onChange={(val) => updateField('show_badge', val)}
            />
          </div>

          {/* Headline Segments Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  Headline Segments
                </span>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Pecah kalimat headline menjadi beberapa segmen untuk memberi highlight warna/garis gelombang.
                </p>
              </div>
              <button
                type="button"
                onClick={addSegment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                <FaPlus className="text-[10px]" /> Segmen
              </button>
            </div>

            <div className="space-y-2">
              {form.headline_segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center gap-2.5"
                >
                  <OrderControls
                    index={idx}
                    total={form.headline_segments.length}
                    onMoveUp={() => moveSegment(idx, idx - 1)}
                    onMoveDown={() => moveSegment(idx, idx + 1)}
                  />
                  <input
                    type="text"
                    value={seg.text}
                    onChange={(e) => updateSegment(idx, { text: e.target.value })}
                    placeholder="Teks segmen (spasi dipertahankan)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                  />
                  <select
                    value={seg.highlight || 'none'}
                    onChange={(e) => updateSegment(idx, { highlight: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                  >
                    <option value="none">Normal Text</option>
                    <option value="secondary_wave">Sky Blue + Yellow Wave</option>
                    <option value="primary_wave">Cyan + Blue Wave</option>
                    <option value="accent_bg">Accent Background</option>
                  </select>
                  <button
                    type="button"
                    disabled={form.headline_segments.length <= 1}
                    onClick={() => removeSegment(idx)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer self-end sm:self-auto"
                    aria-label="Hapus segmen"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Preview Headline
              </p>
              <p className="font-heading text-xl sm:text-2xl font-black leading-snug">
                {form.headline_segments.map((seg, idx) => (
                  <span
                    key={idx}
                    className={
                      seg.highlight === 'secondary_wave'
                        ? 'text-[#00B4D8] underline decoration-[#FFD60A] decoration-4 underline-offset-4'
                        : seg.highlight === 'primary_wave'
                          ? 'text-[#0096B4] dark:text-[#00E5FF] underline decoration-[#00B4D8] decoration-4 underline-offset-4'
                          : seg.highlight === 'accent_bg'
                            ? 'bg-[#FFD60A] text-black px-1.5 rounded'
                            : ''
                    }
                  >
                    {seg.text}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <TextAreaField
            label="Subheadline"
            rows={3}
            value={form.subheadline}
            onChange={(e) => updateField('subheadline', e.target.value)}
            error={errors.subheadline}
            required
          />
        </div>
      </SectionCard>

      {/* Lanyard & Profile Photo */}
      <SectionCard
        title="Interactive Lanyard & Foto Profil"
        description="Atur foto portrait dan label pada kartu lanyard interaktif."
      >
        <div className="space-y-4">
          <ToggleField
            label="Tampilkan Interactive Lanyard"
            checked={form.show_lanyard}
            onChange={(val) => updateField('show_lanyard', val)}
          />

          <MediaField
            label="Foto Portrait Lanyard"
            value={form.profile_image_id}
            onChange={(id) => updateField('profile_image_id', id)}
            accept="image"
            defaultCategory="profile"
            helperText="Rekomendasi portrait rasio 4:5 (format WebP)."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Lanyard Header"
              value={form.lanyard_header}
              onChange={(e) => updateField('lanyard_header', e.target.value)}
            />
            <TextField
              label="Lanyard Status Text"
              value={form.lanyard_status}
              onChange={(e) => updateField('lanyard_status', e.target.value)}
            />
            <TextField
              label="Lanyard Name"
              value={form.lanyard_name}
              onChange={(e) => updateField('lanyard_name', e.target.value)}
              error={errors.lanyard_name}
              required
            />
            <TextField
              label="Lanyard Role Badge"
              value={form.lanyard_role}
              onChange={(e) => updateField('lanyard_role', e.target.value)}
              error={errors.lanyard_role}
              required
            />
          </div>
        </div>
      </SectionCard>

      {/* Floating Labels */}
      <SectionCard
        title="Floating Labels (Maks. 4 Slot)"
        description="Tambahkan hingga 4 badge mengambang pada posisi sudut tetap di sekitar Lanyard."
        actions={
          <button
            type="button"
            disabled={form.floating_labels.length >= 4}
            onClick={addFloatingLabel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            <FaPlus className="text-[10px]" /> Floating Label
          </button>
        }
      >
        <div className="space-y-4">
          <ToggleField
            label="Aktifkan Floating Labels"
            checked={form.show_floating_labels}
            onChange={(val) => updateField('show_floating_labels', val)}
          />

          {form.floating_labels.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Belum ada floating labels ditambahkan.
            </p>
          ) : (
            <div className="space-y-2.5">
              {form.floating_labels.map((label, idx) => (
                <div
                  key={label.id || idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <input
                    type="text"
                    value={label.text}
                    onChange={(e) => updateFloatingLabel(idx, { text: e.target.value })}
                    placeholder="Teks label..."
                    className="sm:col-span-4 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                  />
                  <select
                    value={label.slot}
                    onChange={(e) => updateFloatingLabel(idx, { slot: e.target.value })}
                    className="sm:col-span-3 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                  >
                    {FLOATING_SLOTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={label.color_preset || 'accent'}
                    onChange={(e) =>
                      updateFloatingLabel(idx, { color_preset: e.target.value })
                    }
                    className="sm:col-span-3 px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                  >
                    <option value="accent">Accent (Yellow)</option>
                    <option value="primary">Primary (Cyan)</option>
                    <option value="white">White</option>
                  </select>
                  <div className="sm:col-span-2 flex items-center justify-end gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={label.is_visible !== false}
                        onChange={(e) =>
                          updateFloatingLabel(idx, { is_visible: e.target.checked })
                        }
                      />
                      Aktif
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFloatingLabel(idx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* CTAs & CV PDF */}
      <SectionCard
        title="Tombol CTA, Dokumen CV & Scroll Indicator"
        description="Atur tombol aksi utama Hero dan file PDF CV yang dibuka pada Document Viewer Modal."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Primary CTA Text"
            value={form.primary_cta_text}
            onChange={(e) => updateField('primary_cta_text', e.target.value)}
            error={errors.primary_cta_text}
            required
          />
          <TextField
            label="Primary CTA Target"
            value={form.primary_cta_href}
            onChange={(e) => updateField('primary_cta_href', e.target.value)}
            error={errors.primary_cta_href}
            required
          />
          <TextField
            label="Secondary CTA Text (CV Button)"
            value={form.secondary_cta_text}
            onChange={(e) => updateField('secondary_cta_text', e.target.value)}
            error={errors.secondary_cta_text}
            required
          />
          <TextField
            label="CV Modal Title"
            value={form.cv_modal_title}
            onChange={(e) => updateField('cv_modal_title', e.target.value)}
            error={errors.cv_modal_title}
            required
          />
        </div>

        <div className="mt-4">
          <MediaField
            label="Dokumen CV (PDF)"
            value={form.cv_media_id}
            onChange={(id) => updateField('cv_media_id', id)}
            accept="pdf"
            defaultCategory="cv"
            helperText="Digunakan di tombol View CV pada Hero dan Mobile Navbar."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <ToggleField
            label="Tampilkan CTA Utama"
            checked={form.show_primary_cta}
            onChange={(val) => updateField('show_primary_cta', val)}
          />
          <ToggleField
            label="Tampilkan Tombol View CV"
            checked={form.show_secondary_cta}
            onChange={(val) => updateField('show_secondary_cta', val)}
          />
          <ToggleField
            label="Tampilkan Scroll Indicator"
            checked={form.show_scroll_indicator}
            onChange={(val) => updateField('show_scroll_indicator', val)}
          />
        </div>
      </SectionCard>

      <DraftPublishBar
        publicationStatus={rawProfile?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawProfile?.has_unpublished_changes)}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscardDraft={handleDiscard}
        onPreview={() => navigate('/preview')}
      />
    </div>
  );
}

export function HeroManagementPage() {
  const profileQuery = useQuery({
    queryKey: QUERY_KEYS.cmsProfile,
    queryFn: () => fetchSingleton('profile'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero & CV Management"
        description="Kelola headline, badge, subheadline, Interactive Lanyard, floating labels, dan dokumen CV."
      />

      {profileQuery.isLoading ? (
        <FormSkeleton fields={8} />
      ) : profileQuery.isError ? (
        <ErrorState
          message={profileQuery.error?.message}
          onRetry={() => profileQuery.refetch()}
        />
      ) : (
        <HeroForm
          key={`${profileQuery.data?.updated_at}-${profileQuery.data?.has_unpublished_changes}`}
          rawProfile={profileQuery.data}
        />
      )}
    </div>
  );
}
