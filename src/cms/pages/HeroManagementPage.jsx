import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  FaCheckCircle,
  FaCrosshairs,
  FaExclamationTriangle,
  FaEye,
  FaInfoCircle,
  FaMinus,
  FaPlus,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import { STATIC_MEDIA_FALLBACKS } from '../../data/staticFallback';
import { InteractiveImageReveal } from '../../components/ui/InteractiveImageReveal';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useMediaUrl } from '../hooks/useMediaUrl';
import { useToast } from '../hooks/useToast';
import { getMediaAssetById } from '../repositories/mediaRepository';
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
  SelectField,
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

const OVERLAY_ALLOWED_MIMES = ['image/png', 'image/webp'];
const OVERLAY_ALLOWED_EXTS = ['png', 'webp'];

const heroSchema = z.object({
  badge_text: z.string().trim().min(1, 'Teks badge Hero wajib diisi.'),
  subheadline: z.string().trim().min(1, 'Subheadline wajib diisi.'),
  lanyard_name: z.string().trim().min(1, 'Nama pada caption portrait wajib diisi.'),
  lanyard_role: z.string().trim().min(1, 'Role pada caption portrait wajib diisi.'),
  profile_image_scale: z.coerce
    .number()
    .int('Skala foto profil harus berupa bilangan bulat.')
    .min(50, 'Skala foto profil minimal 50%.')
    .max(200, 'Skala foto profil maksimal 200%.'),
  profile_image_offset_x: z.coerce
    .number()
    .int('Offset horizontal foto profil harus berupa bilangan bulat.')
    .min(-50, 'Offset horizontal foto profil minimal -50%.')
    .max(50, 'Offset horizontal foto profil maksimal 50%.'),
  profile_image_offset_y: z.coerce
    .number()
    .int('Offset vertikal foto profil harus berupa bilangan bulat.')
    .min(-50, 'Offset vertikal foto profil minimal -50%.')
    .max(50, 'Offset vertikal foto profil maksimal 50%.'),
  reveal_overlay_scale: z.coerce
    .number()
    .int('Skala overlay harus berupa bilangan bulat.')
    .min(50, 'Skala overlay minimal 50%.')
    .max(200, 'Skala overlay maksimal 200%.'),
  reveal_overlay_offset_x: z.coerce
    .number()
    .int('Offset horizontal overlay harus berupa bilangan bulat.')
    .min(-50, 'Offset horizontal overlay minimal -50%.')
    .max(50, 'Offset horizontal overlay maksimal 50%.'),
  reveal_overlay_offset_y: z.coerce
    .number()
    .int('Offset vertikal overlay harus berupa bilangan bulat.')
    .min(-50, 'Offset vertikal overlay minimal -50%.')
    .max(50, 'Offset vertikal overlay maksimal 50%.'),
  reveal_radius: z.coerce
    .number()
    .int('Reveal radius harus berupa bilangan bulat.')
    .min(40, 'Reveal radius minimal 40 px.')
    .max(250, 'Reveal radius maksimal 250 px.'),
  reveal_softness: z.coerce
    .number()
    .int('Edge softness harus berupa bilangan bulat.')
    .min(0, 'Edge softness minimal 0%.')
    .max(100, 'Edge softness maksimal 100%.'),
  reveal_behavior: z.enum(['smooth', 'direct']),
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
    profile_image_scale: effective.profile_image_scale ?? 100,
    profile_image_offset_x: effective.profile_image_offset_x ?? 0,
    profile_image_offset_y: effective.profile_image_offset_y ?? 0,
    reveal_enabled: effective.reveal_enabled ?? false,
    reveal_overlay_id: effective.reveal_overlay_id ?? null,
    reveal_overlay_scale: effective.reveal_overlay_scale ?? 100,
    reveal_overlay_offset_x: effective.reveal_overlay_offset_x ?? 0,
    reveal_overlay_offset_y: effective.reveal_overlay_offset_y ?? 0,
    reveal_radius: effective.reveal_radius ?? 120,
    reveal_softness: effective.reveal_softness ?? 65,
    reveal_behavior: effective.reveal_behavior === 'direct' ? 'direct' : 'smooth',
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
  const [previewFailedOverlayUrl, setPreviewFailedOverlayUrl] = useState(null);
  const [activeAlignmentLayer, setActiveAlignmentLayer] = useState('overlay');
  const [previewMode, setPreviewMode] = useState('interactive');
  const [calibrationOpacity, setCalibrationOpacity] = useState(55);
  const [showGuideGrid, setShowGuideGrid] = useState(true);

  const baseAssetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', form.profile_image_id],
    queryFn: () => getMediaAssetById(form.profile_image_id),
    enabled: Boolean(form.profile_image_id),
  });

  const overlayAssetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', form.reveal_overlay_id],
    queryFn: () => getMediaAssetById(form.reveal_overlay_id),
    enabled: Boolean(form.reveal_overlay_id),
  });

  const baseAsset = form.profile_image_id ? baseAssetQuery.data : null;
  const overlayAsset = form.reveal_overlay_id ? overlayAssetQuery.data : null;
  const { url: resolvedBaseUrl } = useMediaUrl(baseAsset);
  const { url: resolvedOverlayUrl } = useMediaUrl(overlayAsset);
  const previewBaseUrl = resolvedBaseUrl || STATIC_MEDIA_FALLBACKS.profileImageUrl;
  const isOverlayLoadError =
    Boolean(resolvedOverlayUrl) && previewFailedOverlayUrl === resolvedOverlayUrl;
  const isOverlayMissing =
    Boolean(form.reveal_overlay_id) &&
    !overlayAssetQuery.isLoading &&
    !overlayAssetQuery.isError &&
    !overlayAsset;

  const alignmentWarning = (() => {
    if (!baseAsset?.width || !baseAsset?.height || !overlayAsset?.width || !overlayAsset?.height) {
      return null;
    }
    const baseRatio = baseAsset.width / baseAsset.height;
    const overlayRatio = overlayAsset.width / overlayAsset.height;
    const ratioDiff = Math.abs(baseRatio - overlayRatio) / baseRatio;
    const sameDims =
      overlayAsset.width === baseAsset.width && overlayAsset.height === baseAsset.height;
    if (sameDims && ratioDiff <= 0.05) return null;

    return ratioDiff > 0.05
      ? `Rasio aspek overlay (${overlayAsset.width}×${overlayAsset.height}) berbeda >5% dari foto profil dasar (${baseAsset.width}×${baseAsset.height}). Overlay tetap ditampilkan tanpa distorsi otomatis; disarankan ekspor ulang dengan proporsi yang sama agar posisi topeng presisi.`
      : `Dimensi overlay (${overlayAsset.width}×${overlayAsset.height} px) berbeda dengan foto profil (${baseAsset.width}×${baseAsset.height} px). Pastikan komposisi wajah sejajar.`;
  })();

  const isNonTransparentOverlay =
    Boolean(overlayAsset?.mime_type) &&
    overlayAsset.mime_type !== 'image/png' &&
    overlayAsset.mime_type !== 'image/webp';

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetLayerTransform = (layer) => {
    setForm((prev) => ({
      ...prev,
      ...(layer === 'base' || layer === 'all'
        ? {
            profile_image_scale: 100,
            profile_image_offset_x: 0,
            profile_image_offset_y: 0,
          }
        : {}),
      ...(layer === 'overlay' || layer === 'all'
        ? {
            reveal_overlay_scale: 100,
            reveal_overlay_offset_x: 0,
            reveal_overlay_offset_y: 0,
          }
        : {}),
    }));
    setIsDirty(true);
    setErrors((prev) => ({
      ...prev,
      ...(layer === 'base' || layer === 'all'
        ? {
            profile_image_scale: undefined,
            profile_image_offset_x: undefined,
            profile_image_offset_y: undefined,
          }
        : {}),
      ...(layer === 'overlay' || layer === 'all'
        ? {
            reveal_overlay_scale: undefined,
            reveal_overlay_offset_x: undefined,
            reveal_overlay_offset_y: undefined,
          }
        : {}),
    }));
  };

  const nudgeNumericField = (fieldKey, delta, min, max) => {
    const currentVal = Number(form[fieldKey]) || 0;
    const nextVal = Math.min(max, Math.max(min, currentVal + delta));
    if (nextVal !== currentVal) {
      updateField(fieldKey, nextVal);
    }
  };

  const formatSignedPercent = (val) => {
    const n = Number(val) || 0;
    return `${n > 0 ? `+${n}` : n}%`;
  };

  const hasBaseTransformChanges =
    form.profile_image_scale !== 100 ||
    form.profile_image_offset_x !== 0 ||
    form.profile_image_offset_y !== 0;
  const hasOverlayTransformChanges =
    form.reveal_overlay_scale !== 100 ||
    form.reveal_overlay_offset_x !== 0 ||
    form.reveal_overlay_offset_y !== 0;

  const isOverlayLayer = activeAlignmentLayer === 'overlay';
  const scaleKey = isOverlayLayer ? 'reveal_overlay_scale' : 'profile_image_scale';
  const offsetXKey = isOverlayLayer ? 'reveal_overlay_offset_x' : 'profile_image_offset_x';
  const offsetYKey = isOverlayLayer ? 'reveal_overlay_offset_y' : 'profile_image_offset_y';
  const activeLayerHasChanges = isOverlayLayer
    ? hasOverlayTransformChanges
    : hasBaseTransformChanges;
  const isCalibrationActive = previewMode === 'calibration' && Boolean(resolvedOverlayUrl);

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
        mediaIds: [valid.profile_image_id, valid.reveal_overlay_id, valid.cv_media_id],
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
            helperText="Rekomendasi rasio 1:1 atau 4:5 (format WebP) untuk frame lingkaran portrait. Ukuran & posisi framing juga dapat disesuaikan di panel Penyesuaian Ukuran & Posisi pada bagian Interactive Image Reveal di bawah."
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

      {/* Interactive Image Reveal */}
      <SectionCard
        title="Interactive Image Reveal"
        description="Konfigurasikan efek pengungkapan gambar overlay (mis. topeng Spider-Man transparan PNG/WebP) mengikuti kursor di foto profil Hero Section."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Controls */}
          <div className="lg:col-span-7 space-y-5">
            <ToggleField
              label="Aktifkan Interactive Image Reveal"
              description="Jika nonaktif atau overlay belum dipilih, Hero Section hanya menampilkan foto profil utama tanpa layer efek."
              checked={Boolean(form.reveal_enabled)}
              onChange={(val) => updateField('reveal_enabled', val)}
            />

            <MediaField
              label="Overlay Reveal Image (PNG / WebP Transparan)"
              value={form.reveal_overlay_id}
              onChange={(id) => {
                setPreviewFailedOverlayUrl(null);
                updateField('reveal_overlay_id', id);
              }}
              accept="image"
              defaultCategory="profile"
              allowedMimeTypes={OVERLAY_ALLOWED_MIMES}
              allowedExtensions={OVERLAY_ALLOWED_EXTS}
              missingAssetText="Aset overlay yang sebelumnya dipilih sudah terhapus atau tidak ditemukan di Media Library. Pilih ulang atau upload overlay baru."
              helperText="Gunakan PNG/WebP berlatar transparan dengan dimensi & framing yang selaras dengan foto profil utama agar mask/overlay menempel presisi."
            />

            {isOverlayMissing && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold">Overlay image belum siap</p>
                  <p className="opacity-90 mt-0.5">
                    Efek reveal sedang diaktifkan, tetapi aset overlay belum dipilih atau file tidak lagi tersedia. Website publik tetap aman dan hanya menampilkan foto dasar.
                  </p>
                </div>
              </div>
            )}

            {isNonTransparentOverlay && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold">Format gambar tidak mendukung transparansi penuh</p>
                  <p className="opacity-90 mt-0.5">
                    Aset overlay terdeteksi sebagai {overlayAsset?.mime_type || overlayAsset?.file_extension?.toUpperCase()}. Gunakan PNG atau WebP transparan agar foto utama tidak tertutup latar solid.
                  </p>
                </div>
              </div>
            )}

            {alignmentWarning && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-800 dark:text-blue-200 text-xs">
                <FaInfoCircle className="mt-0.5 shrink-0 text-blue-500" />
                <div>
                  <p className="font-semibold">Catatan Penyelarasan Dimensi (Alignment)</p>
                  <p className="opacity-90 mt-0.5">{alignmentWarning}</p>
                </div>
              </div>
            )}

            {isOverlayLoadError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 text-xs">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold">Gagal memuat gambar overlay di preview</p>
                  <p className="opacity-90 mt-0.5">
                    Periksa kembali file di Media Library atau unggah ulang aset PNG/WebP yang valid.
                  </p>
                </div>
              </div>
            )}

            {/* Framing & Alignment Controls */}
            <div className="p-4 rounded-xl bg-canvas border border-border-subtle space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Penyesuaian Ukuran &amp; Posisi (Alignment)
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Atur skala dan pergeseran tiap layer dalam persentase agar proporsi di preview CMS &amp; halaman publik identik.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!activeLayerHasChanges}
                    onClick={() => resetLayerTransform(activeAlignmentLayer)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-subtle bg-surface text-[11px] font-semibold text-muted hover:text-ink disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    <FaUndo className="text-[10px]" />
                    Reset Layer
                  </button>
                  {(hasBaseTransformChanges || hasOverlayTransformChanges) && (
                    <button
                      type="button"
                      onClick={() => resetLayerTransform('all')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-subtle bg-surface text-[11px] font-semibold text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      Reset Semua
                    </button>
                  )}
                </div>
              </div>

              {/* Layer Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setActiveAlignmentLayer('base')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeAlignmentLayer === 'base'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Foto Profil (Base)
                  {hasBaseTransformChanges ? ' •' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAlignmentLayer('overlay')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeAlignmentLayer === 'overlay'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Overlay Reveal
                  {hasOverlayTransformChanges ? ' •' : ''}
                </button>
              </div>

              {isOverlayLayer && !resolvedOverlayUrl && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Pilih atau unggah Overlay Reveal Image terlebih dahulu untuk melihat perubahan layer overlay secara langsung di preview.
                </p>
              )}

              {/* Scale & Offsets */}
              <div className="space-y-3">
                {/* Scale */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`align-${scaleKey}`} className="text-xs font-semibold text-ink">
                      Ukuran / Skala
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={(Number(form[scaleKey]) || 100) <= 50}
                        onClick={() => nudgeNumericField(scaleKey, -1, 50, 200)}
                        aria-label="Kurangi skala 1%"
                        className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface text-muted hover:text-ink disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FaMinus className="text-[9px]" />
                      </button>
                      <span className="min-w-[48px] text-center text-xs font-mono font-semibold text-primary">
                        {form[scaleKey]}%
                      </span>
                      <button
                        type="button"
                        disabled={(Number(form[scaleKey]) || 100) >= 200}
                        onClick={() => nudgeNumericField(scaleKey, 1, 50, 200)}
                        aria-label="Tambah skala 1%"
                        className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface text-muted hover:text-ink disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FaPlus className="text-[9px]" />
                      </button>
                    </div>
                  </div>
                  <input
                    id={`align-${scaleKey}`}
                    type="range"
                    min={50}
                    max={200}
                    step={1}
                    value={form[scaleKey]}
                    onChange={(e) => updateField(scaleKey, Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>50%</span>
                    <span>100% (Default)</span>
                    <span>200%</span>
                  </div>
                  {errors[scaleKey] && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors[scaleKey]}</p>
                  )}
                </div>

                {/* Offset X & Y */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`align-${offsetXKey}`}
                        className="text-xs font-semibold text-ink"
                      >
                        Posisi Horizontal (X)
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={(Number(form[offsetXKey]) || 0) <= -50}
                          onClick={() => nudgeNumericField(offsetXKey, -1, -50, 50)}
                          aria-label="Geser kiri 1%"
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface text-muted hover:text-ink disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <FaMinus className="text-[9px]" />
                        </button>
                        <span className="min-w-[44px] text-center text-xs font-mono font-semibold text-primary">
                          {formatSignedPercent(form[offsetXKey])}
                        </span>
                        <button
                          type="button"
                          disabled={(Number(form[offsetXKey]) || 0) >= 50}
                          onClick={() => nudgeNumericField(offsetXKey, 1, -50, 50)}
                          aria-label="Geser kanan 1%"
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface text-muted hover:text-ink disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <FaPlus className="text-[9px]" />
                        </button>
                      </div>
                    </div>
                    <input
                      id={`align-${offsetXKey}`}
                      type="range"
                      min={-50}
                      max={50}
                      step={1}
                      value={form[offsetXKey]}
                      onChange={(e) => updateField(offsetXKey, Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted">
                      <span>Kiri</span>
                      <span>Tengah</span>
                      <span>Kanan</span>
                    </div>
                    {errors[offsetXKey] && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors[offsetXKey]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`align-${offsetYKey}`}
                        className="text-xs font-semibold text-ink"
                      >
                        Posisi Vertikal (Y)
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={(Number(form[offsetYKey]) || 0) <= -50}
                          onClick={() => nudgeNumericField(offsetYKey, -1, -50, 50)}
                          aria-label="Geser atas 1%"
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface text-muted hover:text-ink disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <FaMinus className="text-[9px]" />
                        </button>
                        <span className="min-w-[44px] text-center text-xs font-mono font-semibold text-primary">
                          {formatSignedPercent(form[offsetYKey])}
                        </span>
                        <button
                          type="button"
                          disabled={(Number(form[offsetYKey]) || 0) >= 50}
                          onClick={() => nudgeNumericField(offsetYKey, 1, -50, 50)}
                          aria-label="Geser bawah 1%"
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface text-muted hover:text-ink disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <FaPlus className="text-[9px]" />
                        </button>
                      </div>
                    </div>
                    <input
                      id={`align-${offsetYKey}`}
                      type="range"
                      min={-50}
                      max={50}
                      step={1}
                      value={form[offsetYKey]}
                      onChange={(e) => updateField(offsetYKey, Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted">
                      <span>Atas</span>
                      <span>Tengah</span>
                      <span>Bawah</span>
                    </div>
                    {errors[offsetYKey] && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors[offsetYKey]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-canvas border border-border-subtle space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="reveal-radius-range"
                    className="text-xs font-semibold text-ink"
                  >
                    Reveal Radius
                  </label>
                  <span className="text-xs font-mono font-semibold text-primary">
                    {form.reveal_radius} px
                  </span>
                </div>
                <input
                  id="reveal-radius-range"
                  type="range"
                  min={40}
                  max={250}
                  step={5}
                  value={form.reveal_radius}
                  onChange={(e) => updateField('reveal_radius', Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>40 px (Fokus)</span>
                  <span>250 px (Luas)</span>
                </div>
                {errors.reveal_radius && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.reveal_radius}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border-subtle space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="reveal-softness-range"
                    className="text-xs font-semibold text-ink"
                  >
                    Edge Feather Softness
                  </label>
                  <span className="text-xs font-mono font-semibold text-primary">
                    {form.reveal_softness}%
                  </span>
                </div>
                <input
                  id="reveal-softness-range"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.reveal_softness}
                  onChange={(e) => updateField('reveal_softness', Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>0% (Tegas)</span>
                  <span>100% (Sangat Halus)</span>
                </div>
                {errors.reveal_softness && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.reveal_softness}</p>
                )}
              </div>
            </div>

            <SelectField
              label="Reveal Tracking Behavior"
              value={form.reveal_behavior || 'smooth'}
              onChange={(e) => updateField('reveal_behavior', e.target.value)}
              options={[
                { value: 'smooth', label: 'Smooth Follow (Gerakan halus mengikuti kursor)' },
                { value: 'direct', label: 'Direct Snap (Mengikuti kursor secara instan)' },
              ]}
              error={errors.reveal_behavior}
              helperText="Jika pengguna mengaktifkan prefers-reduced-motion, sistem otomatis meminimalkan animasi berlebih."
            />
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <div className="p-5 rounded-2xl bg-canvas border border-border-subtle flex flex-col items-center text-center">
              <div className="w-full flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <FaEye className="text-primary" />
                  Live Reveal Preview
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isCalibrationActive
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : !form.reveal_enabled
                        ? 'bg-surface border-border-subtle text-muted'
                        : isOverlayLoadError
                          ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                          : !resolvedOverlayUrl
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isCalibrationActive ? (
                    'Mode Kalibrasi'
                  ) : !form.reveal_enabled ? (
                    'Efek Nonaktif'
                  ) : isOverlayLoadError ? (
                    'Overlay Error'
                  ) : !resolvedOverlayUrl ? (
                    'Overlay Kosong'
                  ) : (
                    <>
                      <FaCheckCircle className="text-[10px]" />
                      Aktif — Arahkan Kursor
                    </>
                  )}
                </span>
              </div>

              {resolvedOverlayUrl && (
                <div className="w-full grid grid-cols-2 gap-1.5 p-1 mb-4 rounded-xl bg-surface border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('interactive')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      previewMode === 'interactive'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    Uji Hover
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('calibration')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      previewMode === 'calibration'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    Kalibrasi Transparan
                  </button>
                </div>
              )}

              <div
                className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full p-[3px] shadow-md select-none"
                style={{
                  background:
                    'conic-gradient(from 135deg, #FF705B, #F9B87A, #E85D75, #8B7CF6, #FF705B)',
                }}
              >
                <div
                  className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-canvas"
                  style={{
                    background:
                      'linear-gradient(160deg, #49345F 0%, #8E4A73 34%, #FF6B6B 72%, #FFB38A 100%)',
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 75% 18%, rgba(255, 179, 138, 0.35), transparent 55%)',
                    }}
                  />

                  <InteractiveImageReveal
                    baseImage={previewBaseUrl}
                    baseAlt={form.lanyard_name || 'Portrait preview'}
                    baseTransform={{
                      scale: form.profile_image_scale,
                      offsetX: form.profile_image_offset_x,
                      offsetY: form.profile_image_offset_y,
                    }}
                    overlayImage={resolvedOverlayUrl}
                    overlayTransform={{
                      scale: form.reveal_overlay_scale,
                      offsetX: form.reveal_overlay_offset_x,
                      offsetY: form.reveal_overlay_offset_y,
                    }}
                    enabled={Boolean(form.reveal_enabled)}
                    revealRadius={form.reveal_radius}
                    revealSoftness={form.reveal_softness}
                    revealBehavior={form.reveal_behavior}
                    calibrationMode={isCalibrationActive}
                    calibrationOpacity={calibrationOpacity / 100}
                    objectPosition="50% 20%"
                    onOverlayError={(failedUrl) => setPreviewFailedOverlayUrl(failedUrl)}
                    onOverlayLoad={() => {
                      if (previewFailedOverlayUrl) setPreviewFailedOverlayUrl(null);
                    }}
                    className="relative z-10 w-full h-full rounded-full"
                    imageClassName=""
                  />

                  {isCalibrationActive && showGuideGrid && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/45 shadow-[0_0_2px_rgba(0,0,0,0.45)]" />
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/45 shadow-[0_0_2px_rgba(0,0,0,0.45)]" />
                      <div className="absolute left-1/2 top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 shadow-[0_0_2px_rgba(0,0,0,0.45)]" />
                    </div>
                  )}
                </div>
              </div>

              {isCalibrationActive && (
                <div className="w-full mt-4 p-3 rounded-xl bg-surface border border-border-subtle space-y-2.5 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="calibration-opacity-range"
                      className="text-[11px] font-semibold text-ink"
                    >
                      Opasitas Overlay
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-primary">
                        {calibrationOpacity}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGuideGrid((prev) => !prev)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold cursor-pointer transition-colors ${
                          showGuideGrid
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-canvas border-border-subtle text-muted hover:text-ink'
                        }`}
                      >
                        <FaCrosshairs className="text-[9px]" />
                        Garis Bantu
                      </button>
                    </div>
                  </div>
                  <input
                    id="calibration-opacity-range"
                    type="range"
                    min={15}
                    max={100}
                    step={5}
                    value={calibrationOpacity}
                    onChange={(e) => setCalibrationOpacity(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              )}

              <div className="mt-4 space-y-1 text-xs text-muted max-w-xs">
                <p className="font-medium text-ink">
                  {isCalibrationActive
                    ? 'Sesuaikan skala & posisi agar topeng sejajar dengan wajah foto profil.'
                    : form.reveal_enabled && resolvedOverlayUrl
                      ? 'Arahkan kursor (atau sentuh) pada foto di atas untuk menguji efek reveal.'
                      : 'Aktifkan toggle dan pilih aset overlay PNG/WebP untuk menguji efek reveal secara langsung.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] pt-1">
                  <span>
                    Base:{' '}
                    <strong className="text-ink">
                      {baseAsset?.width && baseAsset?.height
                        ? `${baseAsset.width}×${baseAsset.height}`
                        : 'Fallback'}
                    </strong>{' '}
                    ({form.profile_image_scale}%, {formatSignedPercent(form.profile_image_offset_x)},{' '}
                    {formatSignedPercent(form.profile_image_offset_y)})
                  </span>
                  <span>•</span>
                  <span>
                    Overlay:{' '}
                    <strong className="text-ink">
                      {overlayAsset?.width && overlayAsset?.height
                        ? `${overlayAsset.width}×${overlayAsset.height}`
                        : form.reveal_overlay_id
                          ? 'Memuat...'
                          : 'Belum dipilih'}
                    </strong>{' '}
                    ({form.reveal_overlay_scale}%, {formatSignedPercent(form.reveal_overlay_offset_x)},{' '}
                    {formatSignedPercent(form.reveal_overlay_offset_y)})
                  </span>
                </div>
              </div>
            </div>
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
