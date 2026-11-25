import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaGlobe, FaSearch } from 'react-icons/fa';
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
  TagInputField,
  TextAreaField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { FormSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';

const seoSchema = z.object({
  seo_title: z.string().trim().min(1, 'SEO Title wajib diisi.'),
  meta_description: z.string().trim().min(1, 'Meta Description wajib diisi.'),
  canonical_url: z
    .string()
    .trim()
    .min(1, 'Canonical URL wajib diisi.')
    .refine((v) => isSafeUrl(v), 'Gunakan URL http/https yang valid.'),
  og_title: z.string().trim().min(1, 'Open Graph Title wajib diisi.'),
  og_description: z.string().trim().min(1, 'Open Graph Description wajib diisi.'),
  og_site_name: z.string().trim().min(1, 'OG Site Name wajib diisi.'),
});

function SeoForm({ rawSeo }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawSeo) || {};
  const extra = effective.structured_data_extra || {};

  const [form, setForm] = useState({
    seo_title: effective.seo_title ?? '',
    meta_description: effective.meta_description ?? '',
    canonical_url:
      effective.canonical_url ?? 'https://raihan-portfolio-two.vercel.app/',
    og_title: effective.og_title ?? '',
    og_description: effective.og_description ?? '',
    og_image_media_id: effective.og_image_media_id ?? null,
    og_site_name: effective.og_site_name ?? 'RAZH',
    twitter_card: effective.twitter_card ?? 'summary_large_image',
    twitter_title: effective.twitter_title ?? '',
    twitter_description: effective.twitter_description ?? '',
    structured_data_enabled: effective.structured_data_enabled ?? true,
    structured_data_job_title:
      effective.structured_data_job_title ?? 'Information Systems Student & Developer',
    alumniOf: extra.alumniOf ?? 'Telkom University',
    knowsAbout: Array.isArray(extra.knowsAbout) ? extra.knowsAbout : [],
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const ogAssetQuery = useQuery({
    queryKey: ['cms', 'mediaAsset', form.og_image_media_id],
    queryFn: () => getMediaAssetById(form.og_image_media_id),
    enabled: Boolean(form.og_image_media_id),
  });
  const { url: ogImageUrl } = useMediaUrl(ogAssetQuery.data);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const buildPayload = (parsedData) => ({
    seo_title: parsedData.seo_title,
    meta_description: parsedData.meta_description,
    canonical_url: parsedData.canonical_url,
    og_title: parsedData.og_title,
    og_description: parsedData.og_description,
    og_image_media_id: form.og_image_media_id || null,
    og_site_name: parsedData.og_site_name,
    twitter_card: form.twitter_card,
    twitter_title: form.twitter_title.trim() || parsedData.og_title,
    twitter_description: form.twitter_description.trim() || parsedData.og_description,
    structured_data_enabled: Boolean(form.structured_data_enabled),
    structured_data_job_title: form.structured_data_job_title.trim(),
    structured_data_extra: {
      alumniOf: form.alumniOf.trim() || null,
      knowsAbout: form.knowsAbout,
    },
  });

  const validate = () => {
    const parsed = seoSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field SEO yang belum valid.');
      return null;
    }
    return buildPayload(parsed.data);
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveSingletonDraft({
        table: 'seo_settings',
        currentRow: rawSeo,
        payload: valid,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSeo]);
      setIsDirty(false);
      toast.success('Draft SEO Settings disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft SEO.');
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
        table: 'seo_settings',
        currentRow: rawSeo,
        payload: valid,
        mediaIds: [valid.og_image_media_id],
        summaryNote: 'Published SEO & Open Graph Settings',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSeo]);
      setIsDirty(false);
      toast.success('SEO Settings dipublikasikan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan SEO.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'seo_settings' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSeo]);
      toast.info('Draft SEO dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Search Engine Metadata"
        description="Atur judul, meta deskripsi, dan canonical URL utama website."
      >
        <div className="space-y-4">
          <TextField
            label={`SEO Title (${form.seo_title.length} karakter)`}
            value={form.seo_title}
            onChange={(e) => updateField('seo_title', e.target.value)}
            helperText="Rekomendasi optimal: 50–60 karakter."
            error={errors.seo_title}
            required
          />
          <TextAreaField
            label={`Meta Description (${form.meta_description.length} karakter)`}
            rows={3}
            value={form.meta_description}
            onChange={(e) => updateField('meta_description', e.target.value)}
            helperText="Rekomendasi optimal: 140–160 karakter."
            error={errors.meta_description}
            required
          />
          <TextField
            label="Canonical URL"
            value={form.canonical_url}
            onChange={(e) => updateField('canonical_url', e.target.value)}
            error={errors.canonical_url}
            required
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Open Graph & Twitter Card"
        description="Metadata yang tampil saat link portfolio dibagikan ke WhatsApp, LinkedIn, Discord, dan X."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Open Graph Title"
            value={form.og_title}
            onChange={(e) => updateField('og_title', e.target.value)}
            error={errors.og_title}
            required
          />
          <TextField
            label="OG Site Name"
            value={form.og_site_name}
            onChange={(e) => updateField('og_site_name', e.target.value)}
            error={errors.og_site_name}
            required
          />
          <TextAreaField
            label="Open Graph Description"
            rows={2}
            value={form.og_description}
            onChange={(e) => updateField('og_description', e.target.value)}
            error={errors.og_description}
            className="md:col-span-2"
            required
          />
          <div className="md:col-span-2">
            <MediaField
              label="Open Graph Image (1200 × 630)"
              value={form.og_image_media_id}
              onChange={(id) => updateField('og_image_media_id', id)}
              accept="image"
              defaultCategory="seo"
            />
          </div>
          <SelectField
            label="Twitter Card Type"
            value={form.twitter_card}
            onChange={(e) => updateField('twitter_card', e.target.value)}
            options={[
              { value: 'summary_large_image', label: 'Summary Large Image' },
              { value: 'summary', label: 'Summary (Compact)' },
            ]}
          />
          <TextField
            label="Twitter Title (Opsional)"
            value={form.twitter_title}
            onChange={(e) => updateField('twitter_title', e.target.value)}
            placeholder="Kosongkan untuk mengikuti OG Title"
          />
          <TextAreaField
            label="Twitter Description (Opsional)"
            rows={2}
            value={form.twitter_description}
            onChange={(e) => updateField('twitter_description', e.target.value)}
            placeholder="Kosongkan untuk mengikuti OG Description"
            className="md:col-span-2"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Structured Data (JSON-LD Person)"
        description="Konfigurasi terstruktur Schema.org Person yang aman tanpa menyisipkan skrip mentah."
      >
        <div className="space-y-4">
          <ToggleField
            label="Aktifkan JSON-LD Structured Data"
            checked={form.structured_data_enabled}
            onChange={(val) => updateField('structured_data_enabled', val)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Job Title"
              value={form.structured_data_job_title}
              onChange={(e) => updateField('structured_data_job_title', e.target.value)}
            />
            <TextField
              label="Alumni Of / Universitas"
              value={form.alumniOf}
              onChange={(e) => updateField('alumniOf', e.target.value)}
            />
          </div>
          <TagInputField
            label="Knows About (Keahlian Utama untuk Schema.org)"
            value={form.knowsAbout}
            onChange={(tags) => updateField('knowsAbout', tags)}
            placeholder="Contoh: Web Development, Game Development, React"
          />
        </div>
      </SectionCard>

      {/* Live Preview Widget */}
      <SectionCard
        title="Live Search & Social Preview"
        description="Simulasi tampilan hasil pencarian Google dan kartu pratinjau tautan media sosial."
        actions={<FaSearch className="text-[#00B4D8]" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google SERP Preview */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Google Search Snippet
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 truncate">
              <FaGlobe className="text-[10px]" /> {form.canonical_url}
            </p>
            <p className="text-lg font-semibold text-blue-700 dark:text-blue-400 leading-snug line-clamp-1">
              {form.seo_title || 'RAZH Portfolio'}
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {form.meta_description || 'Belum ada meta description.'}
            </p>
          </div>

          {/* Open Graph Social Card Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            {ogImageUrl && (
              <img
                src={ogImageUrl}
                alt="OG Preview"
                className="w-full h-36 object-cover border-b border-slate-200 dark:border-zinc-800"
              />
            )}
            <div className="p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {form.og_site_name || 'RAZH'}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                {form.og_title || form.seo_title}
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">
                {form.og_description || form.meta_description}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <DraftPublishBar
        publicationStatus={rawSeo?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawSeo?.has_unpublished_changes)}
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

export function SeoManagementPage() {
  const seoQuery = useQuery({
    queryKey: QUERY_KEYS.cmsSeo,
    queryFn: () => fetchSingleton('seo_settings'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO & Open Graph Settings"
        description="Kelola meta tags, canonical URL, Open Graph, Twitter Card, dan Structured Data Person."
      />

      {seoQuery.isLoading ? (
        <FormSkeleton fields={7} />
      ) : seoQuery.isError ? (
        <ErrorState
          message={seoQuery.error?.message}
          onRetry={() => seoQuery.refetch()}
        />
      ) : (
        <SeoForm
          key={`${seoQuery.data?.updated_at}-${seoQuery.data?.has_unpublished_changes}`}
          rawSeo={seoQuery.data}
        />
      )}
    </div>
  );
}
