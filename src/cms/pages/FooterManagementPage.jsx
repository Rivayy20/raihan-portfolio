import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaExternalLinkAlt } from 'react-icons/fa';
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
import { extractZodErrors } from '../utils/urlValidation';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import { ErrorState } from '../components/ui/ErrorState';
import {
  SectionCard,
  TextAreaField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { FormSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';

const footerSchema = z.object({
  brand_text: z.string().trim().min(1, 'Brand text wajib diisi.'),
  tagline: z.string().trim().min(1, 'Tagline footer wajib diisi.'),
  copyright_text: z.string().trim().min(1, 'Copyright text wajib diisi.'),
  quick_links_heading: z.string().trim().min(1, 'Heading Quick Links wajib diisi.'),
  connect_heading: z.string().trim().min(1, 'Heading Connect wajib diisi.'),
});

function FooterForm({ rawFooter }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawFooter) || {};

  const [form, setForm] = useState({
    brand_text: effective.brand_text ?? 'RAZH.',
    tagline:
      effective.tagline ??
      'Building Digital Experiences with Logic and Creativity.',
    copyright_text: effective.copyright_text ?? '© 2026 All rights reserved.',
    quick_links_heading: effective.quick_links_heading ?? 'Quick Links',
    connect_heading: effective.connect_heading ?? 'Connect',
    show_availability_badge: effective.show_availability_badge ?? true,
    show_quick_links: effective.show_quick_links ?? true,
    show_social_links: effective.show_social_links ?? true,
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
    const parsed = footerSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field Footer yang belum valid.');
      return null;
    }
    return {
      ...form,
      ...parsed.data,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveSingletonDraft({
        table: 'footer_settings',
        currentRow: rawFooter,
        payload: valid,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsFooter]);
      setIsDirty(false);
      toast.success('Draft Footer disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft Footer.');
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
        table: 'footer_settings',
        currentRow: rawFooter,
        payload: valid,
        summaryNote: 'Published Footer Settings',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsFooter]);
      setIsDirty(false);
      toast.success('Footer Settings dipublikasikan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan Footer.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'footer_settings' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsFooter]);
      toast.info('Draft Footer dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Konten & Visibilitas Footer"
        description="Atur brand text, tagline, copyright, serta elemen yang ditampilkan pada footer."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Brand Text"
            value={form.brand_text}
            onChange={(e) => updateField('brand_text', e.target.value)}
            error={errors.brand_text}
            required
          />
          <TextField
            label="Copyright Text"
            value={form.copyright_text}
            onChange={(e) => updateField('copyright_text', e.target.value)}
            error={errors.copyright_text}
            required
          />
          <TextAreaField
            label="Brand Tagline"
            rows={2}
            value={form.tagline}
            onChange={(e) => updateField('tagline', e.target.value)}
            error={errors.tagline}
            className="md:col-span-2"
            required
          />
          <TextField
            label="Quick Links Heading"
            value={form.quick_links_heading}
            onChange={(e) => updateField('quick_links_heading', e.target.value)}
            error={errors.quick_links_heading}
            required
          />
          <TextField
            label="Connect Heading"
            value={form.connect_heading}
            onChange={(e) => updateField('connect_heading', e.target.value)}
            error={errors.connect_heading}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <ToggleField
            label="Tampilkan Availability Badge"
            description="Mengambil teks dari Contact Settings."
            checked={form.show_availability_badge}
            onChange={(val) => updateField('show_availability_badge', val)}
          />
          <ToggleField
            label="Tampilkan Quick Links"
            description="Mengambil link dari Navbar Management."
            checked={form.show_quick_links}
            onChange={(val) => updateField('show_quick_links', val)}
          />
          <ToggleField
            label="Tampilkan Social Links"
            description="Mengambil tautan dari Contact & Social Links."
            checked={form.show_social_links}
            onChange={(val) => updateField('show_social_links', val)}
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/navbar"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#00B4D8] flex items-center justify-between gap-3 transition-colors"
        >
          <div>
            <p className="font-heading font-bold text-sm">Kelola Quick Links</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ubah daftar menu yang muncul di Footer melalui Navbar Management
            </p>
          </div>
          <FaExternalLinkAlt className="text-xs text-[#00B4D8] shrink-0" />
        </Link>

        <Link
          to="/admin/contact"
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#00B4D8] flex items-center justify-between gap-3 transition-colors"
        >
          <div>
            <p className="font-heading font-bold text-sm">
              Kelola Availability &amp; Social Links
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Diambil terpusat dari modul Contact &amp; Social Links
            </p>
          </div>
          <FaExternalLinkAlt className="text-xs text-[#00B4D8] shrink-0" />
        </Link>
      </div>

      <DraftPublishBar
        publicationStatus={rawFooter?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawFooter?.has_unpublished_changes)}
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

export function FooterManagementPage() {
  const footerQuery = useQuery({
    queryKey: QUERY_KEYS.cmsFooter,
    queryFn: () => fetchSingleton('footer_settings'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Footer Management"
        description="Kelola brand text, tagline, copyright, quick links, dan visibilitas elemen footer."
      />

      {footerQuery.isLoading ? (
        <FormSkeleton fields={5} />
      ) : footerQuery.isError ? (
        <ErrorState
          message={footerQuery.error?.message}
          onRetry={() => footerQuery.refetch()}
        />
      ) : (
        <FooterForm
          key={`${footerQuery.data?.updated_at}-${footerQuery.data?.has_unpublished_changes}`}
          rawFooter={footerQuery.data}
        />
      )}
    </div>
  );
}
