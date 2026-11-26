import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaCheck, FaEye, FaMoon, FaPalette, FaSave, FaSun, FaUndo } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { SpiderIcon } from '../../components/ui/SpiderManElements';
import { THEME_COLOR_PRESETS } from '../../constants/colorPresets';
import {
  ACCENT_BOUNDARY_SWATCHES,
  DEFAULT_THEME_CONFIG,
  normalizeThemeConfig,
  resolveThemeTokens,
  sanitizeBoundedAccentHex,
} from '../../utils/themeTokens';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
import {
  discardCollectionDraft,
  discardSingletonDraft,
  fetchSingleton,
  invalidateCmsCaches,
  listCollection,
  publishCollectionItem,
  publishSingleton,
  reorderCollectionItems,
  resolveEffectiveRecord,
  saveCollectionDraft,
  saveSingletonDraft,
  unpublishCollectionItem,
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
import { StatusBadge } from '../components/ui/StatusBadge';

const generalSettingsSchema = z.object({
  brand_name: z.string().trim().min(1, 'Brand Name wajib diisi.'),
  full_name: z.string().trim().min(1, 'Full Name wajib diisi.'),
  site_title: z.string().trim().min(1, 'Website Title wajib diisi.'),
  default_description: z.string().trim(),
  site_url: z
    .string()
    .trim()
    .min(1, 'Website URL wajib diisi.')
    .refine((v) => isSafeUrl(v), 'Gunakan URL http:// atau https:// yang valid.'),
  copyright_text: z.string().trim().min(1, 'Copyright wajib diisi.'),
  color_preset: z.enum(['razh_cyan', 'electric_amber', 'cobalt_mint', 'spider_man']),
});

function SectionRowEditor({ section, index, total, onMove, isReordering }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(section);

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(effective.title || '');
  const [subtitle, setSubtitle] = useState(effective.subtitle || '');
  const [isVisible, setIsVisible] = useState(Boolean(effective.is_visible));
  const [alignment, setAlignment] = useState(effective.content_alignment || 'left');
  const [isSaving, setIsSaving] = useState(false);

  const buildPayload = () => ({
    section_key: section.section_key,
    title: title.trim() || null,
    subtitle: subtitle.trim() || null,
    is_visible: isVisible,
    layout_variant: effective.layout_variant || 'default',
    content_alignment: alignment,
    display_order: section.display_order,
  });

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveCollectionDraft({
        table: 'site_sections',
        currentRow: section,
        payload: buildPayload(),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSections]);
      toast.success(`Draft section "${section.section_key}" disimpan.`);
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft section.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await publishCollectionItem({
        table: 'site_sections',
        currentRow: section,
        payload: buildPayload(),
        summaryNote: `Published section: ${section.section_key}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSections]);
      toast.success(`Section "${section.section_key}" dipublikasikan.`);
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan section.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'site_sections',
        currentRow: section,
        summaryNote: `Unpublished section: ${section.section_key}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSections]);
      toast.info(`Section "${section.section_key}" ditarik dari publik.`);
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish section.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardCollectionDraft({ table: 'site_sections', id: section.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSections]);
      toast.info(`Draft section "${section.section_key}" dibuang.`);
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft section.');
    } finally {
      setIsSaving(false);
    }
  };

  const badgeStatus =
    section.publication_status === 'published' && section.has_unpublished_changes
      ? 'edited'
      : section.publication_status;

  return (
    <div className="border border-border-subtle rounded-xl p-4 bg-surface-subtle/40 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <OrderControls
            index={index}
            total={total}
            disabled={isReordering || isSaving}
            onMoveUp={() => onMove(index, index - 1)}
            onMoveDown={() => onMove(index, index + 1)}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-bold uppercase text-sm text-ink">
                {section.section_key}
              </span>
              <StatusBadge status={badgeStatus} />
              <StatusBadge status={isVisible ? 'visible' : 'hidden'} />
            </div>
            <p className="text-xs text-muted truncate mt-0.5">
              {title || '(Tanpa judul section)'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
        >
          {isExpanded ? 'Tutup' : 'Edit Section'}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-3 border-t border-border-subtle space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Judul Section (Opsional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: About Me, Core Expertise..."
              disabled={isSaving}
            />
            <SelectField
              label="Alignment Header"
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              disabled={isSaving}
              options={[
                { value: 'left', label: 'Left Aligned (Default)' },
                { value: 'center', label: 'Center Aligned' },
              ]}
            />
          </div>

          <TextAreaField
            label="Subjudul Section (Opsional)"
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Deskripsi singkat di bawah judul section..."
            disabled={isSaving}
          />

          <ToggleField
            label="Tampilkan Section di Portfolio Publik"
            description="Jika dimatikan, section disembunyikan dari halaman utama."
            checked={isVisible}
            onChange={setIsVisible}
            disabled={isSaving}
          />

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            {section.has_unpublished_changes && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDiscard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
              >
                <FaUndo className="text-[10px]" /> Discard Draft
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink hover:opacity-90 text-canvas text-xs font-semibold cursor-pointer transition-opacity"
            >
              <FaSave className="text-[10px]" /> Save Draft
            </button>
            {section.publication_status === 'published' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleUnpublish}
                className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer"
              >
                Unpublish
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <FaCheck className="text-[10px]" /> Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneralSettingsForm({ rawSettings, sections, isReordering, onMoveSection }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawSettings) || {};
  const initialThemeConfig = normalizeThemeConfig(effective.theme_config);

  const [form, setForm] = useState({
    brand_name: effective.brand_name ?? 'RAZH',
    full_name: effective.full_name ?? 'Raihan Azka Hidayat',
    site_title: effective.site_title ?? '',
    default_description: effective.default_description ?? '',
    site_url: effective.site_url ?? 'https://raihan-portfolio-two.vercel.app/',
    copyright_text: effective.copyright_text ?? '© 2026 All rights reserved.',
    profile_image_id: effective.profile_image_id ?? null,
    logo_media_id: effective.logo_media_id ?? null,
    favicon_media_id: effective.favicon_media_id ?? null,
    default_og_image_id: effective.default_og_image_id ?? null,
    default_theme: effective.default_theme ?? 'system',
    color_preset: effective.color_preset ?? 'razh_cyan',
    theme_config: initialThemeConfig,
  });

  const [errors, setErrors] = useState({});
  const [accentDrafts, setAccentDrafts] = useState(() => ({
    spiderRed: initialThemeConfig.accentOverrides.spiderRed,
    electricBlue: initialThemeConfig.accentOverrides.electricBlue,
    interactiveAccent: initialThemeConfig.accentOverrides.interactiveAccent,
  }));
  const [accentErrors, setAccentErrors] = useState({});
  const [previewMode, setPreviewMode] = useState('dark');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const updateAccentOverride = (accentKey, rawVal) => {
    const cleaned = sanitizeBoundedAccentHex(rawVal);
    if (rawVal.trim() !== '' && !cleaned) {
      setAccentErrors((prev) => ({
        ...prev,
        [accentKey]: 'Gunakan hex #RRGGBB dalam batas kontras aman (tidak terlalu gelap/putih).',
      }));
      return;
    }

    setAccentErrors((prev) => ({ ...prev, [accentKey]: undefined }));
    setAccentDrafts((prev) => ({ ...prev, [accentKey]: cleaned }));
    setForm((prev) => ({
      ...prev,
      theme_config: {
        ...prev.theme_config,
        accentOverrides: {
          ...prev.theme_config.accentOverrides,
          [accentKey]: cleaned,
        },
      },
    }));
    setIsDirty(true);
  };

  const updateEffectToggle = (effectKey, checked) => {
    setForm((prev) => ({
      ...prev,
      theme_config: {
        ...prev.theme_config,
        effects: {
          ...prev.theme_config.effects,
          [effectKey]: Boolean(checked),
        },
      },
    }));
    setIsDirty(true);
  };

  const updateAnimationPref = (animKey, value) => {
    setForm((prev) => ({
      ...prev,
      theme_config: {
        ...prev.theme_config,
        animation: {
          ...prev.theme_config.animation,
          [animKey]: value,
        },
      },
    }));
    setIsDirty(true);
  };

  const resetThemeCustomizations = () => {
    const resetConfig = normalizeThemeConfig(DEFAULT_THEME_CONFIG);
    setForm((prev) => ({ ...prev, theme_config: resetConfig }));
    setAccentDrafts({ spiderRed: '', electricBlue: '', interactiveAccent: '' });
    setAccentErrors({});
    setIsDirty(true);
  };

  const validate = () => {
    const parsed = generalSettingsSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field yang belum valid.');
      return null;
    }
    return {
      ...form,
      ...parsed.data,
      theme_config: normalizeThemeConfig(form.theme_config),
    };
  };

  const livePreviewTokens = resolveThemeTokens({
    colorPreset: form.color_preset,
    mode: previewMode,
    themeConfig: form.theme_config,
    includeBaseVars: true,
  });

  const collectMediaIds = (data) => [
    data.profile_image_id,
    data.logo_media_id,
    data.favicon_media_id,
    data.default_og_image_id,
  ];

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveSingletonDraft({
        table: 'site_settings',
        currentRow: rawSettings,
        payload: valid,
        mergePartial: true,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSiteSettings]);
      setIsDirty(false);
      toast.success('Draft General Settings disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft.');
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
        table: 'site_settings',
        currentRow: rawSettings,
        payload: valid,
        mergePartial: true,
        mediaIds: collectMediaIds(valid),
        summaryNote: 'Published General Website Settings',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSiteSettings]);
      setIsDirty(false);
      toast.success('General Settings dipublikasikan ke website.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan pengaturan.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'site_settings' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSiteSettings]);
      toast.info('Perubahan draft General Settings dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Brand & Identitas Website"
        description="Pengaturan identitas global yang tampil di header, judul halaman, dan informasi hak cipta."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Brand Name"
            value={form.brand_name}
            onChange={(e) => updateField('brand_name', e.target.value)}
            error={errors.brand_name}
            required
          />
          <TextField
            label="Full Name"
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            error={errors.full_name}
            required
          />
          <TextField
            label="Website Title (Default)"
            value={form.site_title}
            onChange={(e) => updateField('site_title', e.target.value)}
            error={errors.site_title}
            required
          />
          <TextField
            label="Website URL"
            value={form.site_url}
            onChange={(e) => updateField('site_url', e.target.value)}
            error={errors.site_url}
            required
          />
          <TextField
            label="Copyright Information"
            value={form.copyright_text}
            onChange={(e) => updateField('copyright_text', e.target.value)}
            error={errors.copyright_text}
            className="md:col-span-2"
            required
          />
          <TextAreaField
            label="Default Description"
            rows={3}
            value={form.default_description}
            onChange={(e) => updateField('default_description', e.target.value)}
            className="md:col-span-2"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Aset Visual Global"
        description="Pilih gambar profil default, logo, favicon, serta default OG image dari Media Library."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaField
            label="Profile Image (Default / Contact Avatar)"
            value={form.profile_image_id}
            onChange={(id) => updateField('profile_image_id', id)}
            accept="image"
            defaultCategory="profile"
          />
          <MediaField
            label="Brand Logo (Opsional)"
            value={form.logo_media_id}
            onChange={(id) => updateField('logo_media_id', id)}
            accept="image"
            defaultCategory="logos"
            helperText="Jika kosong, navbar tetap menampilkan teks Brand Name."
          />
          <MediaField
            label="Favicon (PNG/WebP)"
            value={form.favicon_media_id}
            onChange={(id) => updateField('favicon_media_id', id)}
            accept="image"
            defaultCategory="icons"
          />
          <MediaField
            label="Default OG Image"
            value={form.default_og_image_id}
            onChange={(id) => updateField('default_og_image_id', id)}
            accept="image"
            defaultCategory="seo"
            helperText="Rekomendasi 1200 × 630 px."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Theme & Batas Kustomisasi Warna"
        description="Sumber kebenaran tunggal untuk palet warna, batas kontras kustom, efek Spider-Verse, preferensi animasi, dan live preview portofolio publik."
        actions={<FaPalette className="text-primary" />}
      >
        <div className="space-y-6">
          {/* 1. Base Theme & Presets */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5">
              <SelectField
                label="Tema Default Pengunjung Baru"
                value={form.default_theme}
                onChange={(e) => updateField('default_theme', e.target.value)}
                options={[
                  { value: 'system', label: 'Ikuti Sistem Perangkat (System)' },
                  { value: 'light', label: 'Light Mode' },
                  { value: 'dark', label: 'Dark Mode' },
                ]}
              />
            </div>

            <div className="md:col-span-7 space-y-2">
              <span className="block text-sm font-semibold text-ink">
                Color Preset
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(THEME_COLOR_PRESETS).map(([key, preset]) => {
                  const selected = form.color_preset === key;
                  const isSpiderManOption = key === 'spider_man';
                  const swatchList = preset.swatches || [
                    preset.light['--color-primary'],
                    preset.light['--color-secondary'],
                    preset.light['--color-accent'],
                  ];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateField('color_preset', key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selected
                          ? isSpiderManOption
                            ? 'border-[#E62429] ring-2 ring-[#E62429]/30 bg-[#E62429]/8'
                            : 'border-primary ring-2 ring-primary/30 bg-primary/8'
                          : 'border-border-subtle hover:border-border-strong bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          {swatchList.map((swatchColor, sIdx) => (
                            <span
                              key={sIdx}
                              className="w-4 h-4 rounded-full border border-border-strong"
                              style={{ backgroundColor: swatchColor }}
                            />
                          ))}
                        </div>
                        {preset.badge && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E62429]/15 text-[#E62429] dark:text-[#FF6369] border border-[#E62429]/30">
                            {isSpiderManOption && <SpiderIcon className="w-2.5 h-2.5" />}
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-ink leading-tight">
                        {preset.label}
                      </p>
                      {preset.description && (
                        <p className="text-[11px] text-muted mt-1 leading-snug">
                          {preset.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Bounded Spider-Verse Accent Overrides */}
          <div className="pt-5 border-t border-border-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">
                  Spider-Verse Accent Customization (Bounded)
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Opsional: sesuaikan warna aksen dalam batas kontras aman. Web Line, Web Glow, &amp; Spider-Sense Glow diturunkan otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={resetThemeCustomizations}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-muted hover:text-ink cursor-pointer transition-colors"
              >
                <FaUndo className="text-[10px]" /> Reset Kustomisasi
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[
                {
                  key: 'spiderRed',
                  label: 'Spider Red',
                  helper: 'Web & Spider-Sense',
                  fallback: livePreviewTokens.palette.spiderRed,
                },
                {
                  key: 'electricBlue',
                  label: 'Electric Blue',
                  helper: 'Secondary Glow & Spark',
                  fallback: livePreviewTokens.palette.electricBlue,
                },
                {
                  key: 'interactiveAccent',
                  label: 'Interactive Accent',
                  helper: 'Primary CTA & Hover',
                  fallback: livePreviewTokens.palette.interactiveAccent,
                },
              ].map((accent) => {
                const currentOverride = form.theme_config.accentOverrides[accent.key];
                const effectiveHex = currentOverride || accent.fallback;
                const inputVal = accentDrafts[accent.key] ?? currentOverride ?? '';

                return (
                  <div
                    key={accent.key}
                    className="p-3.5 rounded-xl bg-canvas border border-border-subtle space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-ink">{accent.label}</p>
                        <p className="text-[11px] text-muted">{accent.helper}</p>
                      </div>
                      {currentOverride && (
                        <button
                          type="button"
                          onClick={() => updateAccentOverride(accent.key, '')}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Default
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label={`Pilih warna ${accent.label}`}
                        value={effectiveHex}
                        onChange={(e) => updateAccentOverride(accent.key, e.target.value)}
                        className="w-9 h-9 rounded-lg border border-border-subtle bg-surface p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={inputVal}
                        placeholder={accent.fallback}
                        maxLength={7}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setAccentDrafts((prev) => ({ ...prev, [accent.key]: raw }));
                          if (raw.trim() === '' || raw.trim().length === 7) {
                            updateAccentOverride(accent.key, raw);
                          }
                        }}
                        onBlur={(e) => {
                          if (!sanitizeBoundedAccentHex(e.target.value) && e.target.value.trim() !== '') {
                            updateAccentOverride(accent.key, e.target.value);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {ACCENT_BOUNDARY_SWATCHES[accent.key].map((sw) => (
                        <button
                          key={sw}
                          type="button"
                          title={sw}
                          aria-label={`${accent.label} ${sw}`}
                          onClick={() => updateAccentOverride(accent.key, sw)}
                          className={`w-5 h-5 rounded-full border cursor-pointer transition-transform hover:scale-110 ${
                            currentOverride === sw
                              ? 'border-ink ring-2 ring-primary/40'
                              : 'border-border-strong'
                          }`}
                          style={{ backgroundColor: sw }}
                        />
                      ))}
                    </div>

                    {accentErrors[accent.key] && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        {accentErrors[accent.key]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Auto-derived CSS tokens readout */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface-subtle/60 border border-border-subtle text-[11px] text-muted">
              <span className="font-semibold text-ink">Token Turunan Otomatis:</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border-strong"
                  style={{ backgroundColor: livePreviewTokens.cssVars['--color-web-line'] }}
                />
                Web Line
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border-strong"
                  style={{ backgroundColor: livePreviewTokens.cssVars['--color-web-glow'] }}
                />
                Web Glow
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border-strong"
                  style={{ backgroundColor: livePreviewTokens.cssVars['--color-spider-sense-glow'] }}
                />
                Spider-Sense Glow
              </span>
            </div>
          </div>

          {/* 3. Visual Effects & 4. Animation Preferences */}
          <div className="pt-5 border-t border-border-subtle grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <h4 className="text-sm font-semibold text-ink">
                Visual Effects Visibility
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'webBackground', label: 'Hero Web Background', desc: 'Garis jaring SVG & parallax halus' },
                  { key: 'spiderSensePulse', label: 'Hero Spider-Sense Pulse', desc: 'Denyut lingkaran pada portrait' },
                  { key: 'cursorTrail', label: 'Custom Spider-Web Cursor', desc: 'Jejak jaring desktop (non-touch)' },
                  { key: 'timelineAnimation', label: 'About Timeline Web Rail', desc: 'Node bercahaya & animasi garis' },
                  { key: 'skillNetwork', label: 'Expertise Web-Skill Network', desc: 'Jaringan node & konektor skill' },
                  { key: 'projectHover', label: 'Project Comic Hover Frame', desc: 'Nomor edisi & glow hover kartu' },
                  { key: 'contactInteraction', label: 'Contact Web-Shooting CTA', desc: 'Efek tembak jaring saat submit' },
                  { key: 'loadingIntro', label: 'Spider-Verse Loading Intro', desc: 'Animasi intro & pembuka jaring' },
                ].map((fx) => (
                  <div
                    key={fx.key}
                    className="p-2.5 rounded-xl bg-canvas border border-border-subtle"
                  >
                    <ToggleField
                      label={fx.label}
                      description={fx.desc}
                      checked={Boolean(form.theme_config.effects[fx.key])}
                      onChange={(val) => updateEffectToggle(fx.key, val)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-sm font-semibold text-ink">
                Animation Preferences
              </h4>
              <SelectField
                label="Intensitas Efek & Glow"
                value={form.theme_config.animation.intensity}
                onChange={(e) => updateAnimationPref('intensity', e.target.value)}
                options={[
                  { value: 'subtle', label: 'Subtle (Minimal & Tenang)' },
                  { value: 'balanced', label: 'Balanced (Default Editorial)' },
                  { value: 'cinematic', label: 'Cinematic (Spider-Verse Penuh)' },
                ]}
              />
              <SelectField
                label="Kecepatan Animasi"
                value={form.theme_config.animation.speed}
                onChange={(e) => updateAnimationPref('speed', e.target.value)}
                options={[
                  { value: 'slow', label: 'Slow (Halus & Santai)' },
                  { value: 'normal', label: 'Normal (Standar)' },
                  { value: 'snappy', label: 'Snappy (Responsif Cepat)' },
                ]}
                helperText="Tetap otomatis dinonaktifkan bila pengunjung mengaktifkan prefers-reduced-motion."
              />
              <div className="p-2.5 rounded-xl bg-canvas border border-border-subtle">
                <ToggleField
                  label="Ulangi Animasi Saat Scroll"
                  description="Putar ulang animasi masuk tiap section (termasuk Hero & Typewriter) saat scroll ke bawah maupun balik ke atas."
                  checked={form.theme_config.animation.replayOnScroll !== false}
                  onChange={(val) => updateAnimationPref('replayOnScroll', val)}
                />
              </div>
            </div>
          </div>

          {/* 5. Live Theme Preview */}
          <div className="pt-5 border-t border-border-subtle space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-ink">
                  Live Theme Preview (Real-Time)
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Semua komponen di bawah langsung mengonsumsi token CSS dari pengaturan di atas.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-canvas border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setPreviewMode('light')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    previewMode === 'light'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <FaSun className="text-[11px]" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('dark')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    previewMode === 'dark'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <FaMoon className="text-[11px]" /> Dark
                </button>
              </div>
            </div>

            <div
              data-portfolio-theme={form.color_preset}
              style={livePreviewTokens.cssVars}
              className="relative overflow-hidden rounded-2xl border border-border-subtle p-5 transition-colors duration-300 bg-canvas text-ink"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Mini Hero + Spider-Sense */}
                <div className="md:col-span-4 rounded-xl border border-border-subtle bg-surface p-4 flex flex-col items-center text-center gap-3">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {form.theme_config.effects.spiderSensePulse && (
                      <span
                        aria-hidden="true"
                        className="absolute -inset-2 rounded-full border-2 spider-sense-pulse-ring"
                      />
                    )}
                    <div
                      className="w-16 h-16 rounded-full p-0.5 flex items-center justify-center"
                      style={{
                        background: `conic-gradient(from 0deg, var(--color-spider-red), var(--color-electric-blue), var(--color-interactive-accent), var(--color-spider-red))`,
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-canvas flex items-center justify-center">
                        <SpiderIcon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold sunset-text-accent">
                      RAZH Experience
                    </p>
                    <p className="text-[11px] text-muted">
                      Hero &amp; Spider-Sense
                    </p>
                  </div>
                </div>

                {/* Mini Timeline + Web-Skill Network */}
                <div className="md:col-span-4 rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex flex-col items-center">
                      <span
                        className="w-3 h-3 rounded-full bg-primary"
                        style={{ boxShadow: '0 0 12px var(--color-spider-sense-glow)' }}
                      />
                      <span
                        className="w-0.5 h-6 mt-1 rounded-full"
                        style={{ backgroundColor: 'var(--color-web-line)' }}
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-ink">Spider-Verse Timeline</p>
                      <p className="text-[11px] text-muted">Active node &amp; web rail</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full border border-border-strong bg-surface-subtle text-[11px] font-medium text-ink">
                      React
                    </span>
                    <span
                      className="flex-1 h-px"
                      style={{ backgroundColor: 'var(--color-web-line)' }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-spider-red)',
                        boxShadow: '0 0 10px var(--color-web-glow)',
                      }}
                    />
                    <span
                      className="flex-1 h-px"
                      style={{ backgroundColor: 'var(--color-web-line)' }}
                    />
                    <span className="px-2.5 py-1 rounded-full border border-border-strong bg-surface-subtle text-[11px] font-medium text-ink">
                      Unity
                    </span>
                  </div>
                </div>

                {/* Mini Comic Panel + Contact CTA */}
                <div className="md:col-span-4 rounded-xl border border-border-subtle bg-surface p-4 space-y-3 comic-panel-card">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-primary/15 text-primary border border-primary/30">
                      ISSUE #01
                    </span>
                    <span className="text-[11px] text-muted">Comic Showcase</span>
                  </div>
                  <p className="font-heading text-xs font-semibold text-ink">
                    Featured Project Card
                  </p>
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-default"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      boxShadow: '0 6px 18px -6px var(--color-web-glow)',
                    }}
                  >
                    Shoot Web Message
                  </button>
                </div>
              </div>

              {form.color_preset === 'spider_man' && (
                <p className="text-[11px] text-muted mt-3 pt-2.5 border-t border-border-subtle">
                  Tip: Kombinasikan dengan efek{' '}
                  <Link
                    to="/admin/hero"
                    className="font-semibold text-primary hover:underline"
                  >
                    Interactive Image Reveal
                  </Link>{' '}
                  di Hero &amp; CV untuk memunculkan topeng Spider-Man saat kursor menyentuh foto profil.
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <DraftPublishBar
        publicationStatus={rawSettings?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawSettings?.has_unpublished_changes)}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscardDraft={handleDiscardDraft}
        onPreview={() => navigate('/preview')}
      />

      <SectionCard
        title="Pengaturan Urutan & Visibilitas Section"
        description="Atur urutan tampil section utama pada halaman portfolio serta judul masing-masing section."
      >
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <SectionRowEditor
              key={`${section.id}-${section.updated_at}-${section.has_unpublished_changes}-${section.display_order}`}
              section={section}
              index={idx}
              total={sections.length}
              isReordering={isReordering}
              onMove={onMoveSection}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function GeneralSettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isReordering, setIsReordering] = useState(false);

  const settingsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsSiteSettings,
    queryFn: () => fetchSingleton('site_settings'),
  });

  const sectionsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsSections,
    queryFn: () => listCollection('site_sections', { orderBy: 'display_order' }),
  });

  const handleMoveSection = async (fromIdx, toIdx) => {
    const items = [...(sectionsQuery.data || [])];
    if (toIdx < 0 || toIdx >= items.length) return;
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);

    setIsReordering(true);
    try {
      await reorderCollectionItems({
        table: 'site_sections',
        orderedIds: items.map((s) => s.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSections]);
      toast.success('Urutan section diperbarui.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mengubah urutan section.');
    } finally {
      setIsReordering(false);
    }
  };

  const rawSettings = settingsQuery.data;
  const sections = sectionsQuery.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Website Settings"
        description="Kelola branding RAZH, profil default, preset warna, dan pengaturan urutan section portfolio."
        actions={
          <a
            href="/preview"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink transition-colors"
          >
            <FaEye /> Preview Website
          </a>
        }
      />

      {settingsQuery.isLoading || sectionsQuery.isLoading ? (
        <FormSkeleton fields={7} />
      ) : settingsQuery.isError ? (
        <ErrorState
          message={settingsQuery.error?.message}
          onRetry={() => settingsQuery.refetch()}
        />
      ) : sectionsQuery.isError ? (
        <ErrorState
          message={sectionsQuery.error?.message}
          onRetry={() => sectionsQuery.refetch()}
        />
      ) : (
        <GeneralSettingsForm
          key={`${rawSettings?.updated_at}-${rawSettings?.has_unpublished_changes}`}
          rawSettings={rawSettings}
          sections={sections}
          isReordering={isReordering}
          onMoveSection={handleMoveSection}
        />
      )}
    </div>
  );
}
