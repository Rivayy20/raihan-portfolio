import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaCheck, FaEye, FaPalette, FaSave, FaUndo } from 'react-icons/fa';
import { THEME_COLOR_PRESETS } from '../../constants/colorPresets';
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
    <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
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
              <span className="font-heading font-bold uppercase text-sm text-slate-900 dark:text-zinc-100">
                {section.section_key}
              </span>
              <StatusBadge status={badgeStatus} />
              <StatusBadge status={isVisible ? 'visible' : 'hidden'} />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {title || '(Tanpa judul section)'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 text-xs font-semibold cursor-pointer"
        >
          {isExpanded ? 'Tutup' : 'Edit Section'}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-4">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-semibold cursor-pointer"
              >
                <FaUndo className="text-[10px]" /> Discard Draft
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold cursor-pointer"
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
  });

  const [errors, setErrors] = useState({});
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
    };
  };

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
        description="Gunakan preset warna terkurasi agar konsistensi kontras & Neo-Brutalism tetap terjaga."
        actions={<FaPalette className="text-[#00B4D8]" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="space-y-2">
            <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
              Color Preset
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(THEME_COLOR_PRESETS).map(([key, preset]) => {
                const selected = form.color_preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField('color_preset', key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30 bg-cyan-50/40 dark:bg-cyan-950/30'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: preset.light['--color-primary'] }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: preset.light['--color-secondary'] }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: preset.light['--color-accent'] }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-tight">
                      {preset.label}
                    </p>
                  </button>
                );
              })}
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
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold"
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
