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
  lanyard_name: z.string().trim().min(1, 'Nama pada caption portrait wajib diisi.'),
  lanyard_role: z.string().trim().min(1, 'Role pada caption portrait wajib diisi.'),
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
      toast.warning('Maksimal 4 floating labels agar layout Hero Portrait tetap rapi.');
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
        description="Bangun headline Editorial dengan animasi Sunset Gradient serta subheadline Typewriter tanpa HTML mentah."
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
                <span className="text-sm font-semibold text-ink">
                  Headline Segments
                </span>
                <p className="text-xs text-muted">
                  Pecah kalimat headline menjadi beberapa segmen untuk memberi efek gradien Sunset atau soft pill highlight.
                </p>
              </div>
              <button
                type="button"
                onClick={addSegment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
              >
                <FaPlus className="text-[10px]" /> Segmen
              </button>
            </div>

            <div className="space-y-2">
              {form.headline_segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border-subtle bg-surface-subtle/60 flex flex-col sm:flex-row sm:items-center gap-2.5"
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
                    className="flex-1 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <select
                    value={seg.highlight || 'none'}
                    onChange={(e) => updateSegment(idx, { highlight: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="none">Normal Text</option>
                    <option value="secondary_wave">Sunset Gradient (Coral · Peach)</option>
                    <option value="primary_wave">Sunset Gradient (Rose · Violet)</option>
                    <option value="accent_bg">Soft Peach Pill Highlight</option>
                  </select>
                  <button
                    type="button"
                    disabled={form.headline_segments.length <= 1}
                    onClick={() => removeSegment(idx)}
                    className="p-2 rounded-lg text-muted hover:text-red-500 disabled:opacity-30 cursor-pointer self-end sm:self-auto transition-colors"
                    aria-label="Hapus segmen"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-xl bg-canvas border border-border-subtle">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                Preview Headline
              </p>
              <p className="font-heading text-xl sm:text-2xl font-bold leading-snug text-ink">
                {form.headline_segments.map((seg, idx) => (
                  <span
                    key={idx}
                    className={
                      seg.highlight === 'secondary_wave' || seg.highlight === 'primary_wave'
                        ? 'hero-gradient-text-animated'
                        : seg.highlight === 'accent_bg'
                          ? 'bg-accent/30 text-ink px-2 py-0.5 rounded-lg'
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
            label="Subheadline (Typewriter Copy)"
            rows={3}
            value={form.subheadline}
            onChange={(e) => updateField('subheadline', e.target.value)}
            error={errors.subheadline}
            helperText="Ditampilkan dengan animasi ketik (Typewriter) secara berurutan di Hero Section."
            required
          />
        </div>
      </SectionCard>

      {/* Circular Portrait Stage & Caption */}
      <SectionCard
        title="Profile Portrait Stage & Editorial Caption"
        description="Atur foto profil lingkaran berbingkai conic-gradient, animasi tilt 3D, serta nama dan role di bawah portrait."
      >
        <div className="space-y-4">
          <ToggleField
            label="Tampilkan Profile Portrait Stage"
            description="Menampilkan kolom foto portrait beserta floating status & role card di Hero Section."
            checked={form.show_lanyard}
            onChange={(val) => updateField('show_lanyard', val)}
          />

          <MediaField
            label="Foto Profil Portrait"
            value={form.profile_image_id}
            onChange={(id) => updateField('profile_image_id', id)}
            accept="image"
            defaultCategory="profile"
            helperText="Rekomendasi rasio 1:1 atau 4:5 (format WebP) untuk frame lingkaran portrait."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Nama Portrait Caption"
              value={form.lanyard_name}
              onChange={(e) => updateField('lanyard_name', e.target.value)}
              error={errors.lanyard_name}
              required
            />
            <TextField
              label="Role / Subjudul Portrait"
              value={form.lanyard_role}
              onChange={(e) => updateField('lanyard_role', e.target.value)}
              error={errors.lanyard_role}
              required
            />
            <TextField
              label="Label Header (Metadata Opsional)"
              value={form.lanyard_header}
              onChange={(e) => updateField('lanyard_header', e.target.value)}
              helperText="Disimpan untuk kompatibilitas profil; portrait minimalis menampilkan Foto, Nama, dan Role."
            />
            <TextField
              label="Status Badge Text (Metadata Opsional)"
              value={form.lanyard_status}
              onChange={(e) => updateField('lanyard_status', e.target.value)}
              helperText="Catatan status internal; status aktif publik disinkronkan dari Contact availability."
            />
          </div>
        </div>
      </SectionCard>

      {/* Floating Labels */}
      <SectionCard
        title="Floating Card & Caption Tags (Maks. 4 Slot)"
        description="Slot pertama tampil pada floating card di samping kanan portrait; slot tambahan tampil sebagai tag rapi di bawah caption."
        actions={
          <button
            type="button"
            disabled={form.floating_labels.length >= 4}
            onClick={addFloatingLabel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer transition-colors"
          >
            <FaPlus className="text-[10px]" /> Floating Label
          </button>
        }
      >
        <div className="space-y-4">
          <ToggleField
            label="Aktifkan Floating Labels & Caption Tags"
            checked={form.show_floating_labels}
            onChange={(val) => updateField('show_floating_labels', val)}
          />

          {form.floating_labels.length === 0 ? (
            <p className="text-xs text-muted">
              Belum ada floating labels ditambahkan.
            </p>
          ) : (
            <div className="space-y-2.5">
              {form.floating_labels.map((label, idx) => (
                <div
                  key={label.id || idx}
                  className="p-3 rounded-xl border border-border-subtle bg-surface-subtle/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <input
                    type="text"
                    value={label.text}
                    onChange={(e) => updateFloatingLabel(idx, { text: e.target.value })}
                    placeholder="Teks label (mis. Web Developer)..."
                    className="sm:col-span-4 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <select
                    value={label.slot}
                    onChange={(e) => updateFloatingLabel(idx, { slot: e.target.value })}
                    className="sm:col-span-3 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    className="sm:col-span-3 px-3 py-2 rounded-xl border border-border-subtle bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="accent">Sunset Peach (Accent)</option>
                    <option value="primary">Sunset Coral (Primary)</option>
                    <option value="white">Editorial Surface (Neutral)</option>
                  </select>
                  <div className="sm:col-span-2 flex items-center justify-end gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={label.is_visible !== false}
                        onChange={(e) =>
                          updateFloatingLabel(idx, { is_visible: e.target.checked })
                        }
                        className="accent-primary"
                      />
                      Aktif
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFloatingLabel(idx)}
                      className="p-2 rounded-lg text-muted hover:text-red-500 cursor-pointer transition-colors"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-subtle">
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
            description="Indikator mouse-scroll interaktif menuju About Section."
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
        description="Kelola badge intro, headline gradient, typewriter subheadline, foto profil portrait, floating card, dan dokumen CV."
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
