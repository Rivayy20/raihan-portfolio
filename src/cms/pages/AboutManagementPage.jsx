import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaExternalLinkAlt, FaPlus, FaTrash } from 'react-icons/fa';
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
  TagInputField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { FormSkeleton } from '../components/ui/LoadingSkeleton';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';

const aboutSchema = z.object({
  narrative_title: z.string().trim().min(1, 'Judul narasi wajib diisi.'),
  education_card_title: z.string().trim().min(1, 'Judul kartu Education wajib diisi.'),
  previous_edu_heading: z.string().trim().min(1, 'Judul riwayat pendidikan wajib diisi.'),
  experience_card_title: z.string().trim().min(1, 'Judul kartu Experience wajib diisi.'),
  experience_card_subtitle: z.string().trim().min(1, 'Subjudul kartu Experience wajib diisi.'),
  certifications_heading: z.string().trim().min(1, 'Judul sub-section Certifications wajib diisi.'),
});

function AboutForm({ rawAbout }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawAbout) || {};

  const [form, setForm] = useState({
    narrative_title: effective.narrative_title ?? 'The Narrative',
    narrative_paragraphs: Array.isArray(effective.narrative_paragraphs)
      ? effective.narrative_paragraphs
      : [''],
    narrative_highlights: Array.isArray(effective.narrative_highlights)
      ? effective.narrative_highlights
      : [],
    show_narrative: effective.show_narrative ?? true,
    education_card_title: effective.education_card_title ?? 'Education',
    previous_edu_heading: effective.previous_edu_heading ?? 'Previous Education',
    show_education_card: effective.show_education_card ?? true,
    experience_card_title: effective.experience_card_title ?? 'Experience',
    experience_card_subtitle:
      effective.experience_card_subtitle ?? 'Academic & Industry Experience',
    show_experience_card: effective.show_experience_card ?? true,
    certifications_heading: effective.certifications_heading ?? 'Certifications',
    show_certifications: effective.show_certifications ?? true,
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

  const updateParagraph = (idx, text) => {
    const next = form.narrative_paragraphs.map((p, i) => (i === idx ? text : p));
    updateField('narrative_paragraphs', next);
  };

  const addParagraph = () => {
    updateField('narrative_paragraphs', [...form.narrative_paragraphs, '']);
  };

  const removeParagraph = (idx) => {
    if (form.narrative_paragraphs.length <= 1) return;
    updateField(
      'narrative_paragraphs',
      form.narrative_paragraphs.filter((_, i) => i !== idx)
    );
  };

  const moveParagraph = (from, to) => {
    const next = [...form.narrative_paragraphs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateField('narrative_paragraphs', next);
  };

  const validate = () => {
    const parsed = aboutSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field About yang belum valid.');
      return null;
    }

    const cleanParagraphs = form.narrative_paragraphs
      .map((p) => String(p || '').trim())
      .filter(Boolean);

    if (cleanParagraphs.length === 0) {
      toast.error('Minimal harus ada 1 paragraf narasi.');
      return null;
    }

    return {
      ...form,
      ...parsed.data,
      narrative_paragraphs: cleanParagraphs,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveSingletonDraft({
        table: 'about_content',
        currentRow: rawAbout,
        payload: valid,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsAbout]);
      setIsDirty(false);
      toast.success('Draft About Section disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft About.');
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
        table: 'about_content',
        currentRow: rawAbout,
        payload: valid,
        summaryNote: 'Published About narrative & labels',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsAbout]);
      setIsDirty(false);
      toast.success('About Section berhasil dipublikasikan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan About.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'about_content' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsAbout]);
      toast.info('Draft perubahan About dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Personal Narrative"
        description="Atur judul, paragraf cerita personal, serta frasa teks yang ingin disorot."
        actions={
          <button
            type="button"
            onClick={addParagraph}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <FaPlus className="text-[10px]" /> Paragraf
          </button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <TextField
              label="Narrative Title"
              value={form.narrative_title}
              onChange={(e) => updateField('narrative_title', e.target.value)}
              error={errors.narrative_title}
              className="md:col-span-2"
              required
            />
            <ToggleField
              label="Tampilkan Kartu Narasi"
              checked={form.show_narrative}
              onChange={(val) => updateField('show_narrative', val)}
            />
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-semibold text-ink">
              Paragraf Narasi
            </span>
            {form.narrative_paragraphs.map((paragraph, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle/60 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <OrderControls
                      index={idx}
                      total={form.narrative_paragraphs.length}
                      onMoveUp={() => moveParagraph(idx, idx - 1)}
                      onMoveDown={() => moveParagraph(idx, idx + 1)}
                    />
                    <span className="text-xs font-bold text-muted">
                      Paragraf {idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={form.narrative_paragraphs.length <= 1}
                    onClick={() => removeParagraph(idx)}
                    aria-label="Hapus paragraf"
                    className="p-1.5 rounded-lg text-muted hover:text-red-500 disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={paragraph}
                  onChange={(e) => updateParagraph(idx, e.target.value)}
                  placeholder="Tulis isi paragraf..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            ))}
          </div>

          <TagInputField
            label="Highlighted Text Phrases (Opsional)"
            value={form.narrative_highlights}
            onChange={(tags) => updateField('narrative_highlights', tags)}
            placeholder="Contoh: Information Systems, Unity, Telkom University"
            helperText="Frasa teks yang cocok akan disorot otomatis di narasi secara aman tanpa HTML."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Label & Visibilitas Blok Bento Section About"
        description="Atur heading kartu Bento Education, Vertical Timeline Experience, dan Expandable Certifications."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-ink">Kartu Education (Bento)</span>
              <Link
                to="/admin/education"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Kelola Data <FaExternalLinkAlt className="text-[10px]" />
              </Link>
            </div>
            <TextField
              label="Judul Kartu"
              value={form.education_card_title}
              onChange={(e) => updateField('education_card_title', e.target.value)}
              error={errors.education_card_title}
              required
            />
            <TextField
              label="Heading Previous Education"
              value={form.previous_edu_heading}
              onChange={(e) => updateField('previous_edu_heading', e.target.value)}
              error={errors.previous_edu_heading}
              required
            />
            <ToggleField
              label="Tampilkan Kartu Education"
              checked={form.show_education_card}
              onChange={(val) => updateField('show_education_card', val)}
            />
          </div>

          <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-ink">Blok Experience (Timeline)</span>
              <Link
                to="/admin/experience"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Kelola Data <FaExternalLinkAlt className="text-[10px]" />
              </Link>
            </div>
            <TextField
              label="Judul Kartu"
              value={form.experience_card_title}
              onChange={(e) => updateField('experience_card_title', e.target.value)}
              error={errors.experience_card_title}
              required
            />
            <TextField
              label="Subjudul Kartu"
              value={form.experience_card_subtitle}
              onChange={(e) => updateField('experience_card_subtitle', e.target.value)}
              error={errors.experience_card_subtitle}
              required
            />
            <ToggleField
              label="Tampilkan Blok Experience"
              checked={form.show_experience_card}
              onChange={(val) => updateField('show_experience_card', val)}
            />
          </div>

          <div className="md:col-span-2 p-4 rounded-xl border border-border-subtle bg-surface-subtle/30 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <TextField
              label="Heading Sub-Section Certifications"
              value={form.certifications_heading}
              onChange={(e) => updateField('certifications_heading', e.target.value)}
              error={errors.certifications_heading}
              required
            />
            <div className="flex items-center justify-between gap-4">
              <ToggleField
                label="Tampilkan Certifications"
                checked={form.show_certifications}
                onChange={(val) => updateField('show_certifications', val)}
              />
              <Link
                to="/admin/certifications"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
              >
                Kelola Sertifikat <FaExternalLinkAlt className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </SectionCard>

      <DraftPublishBar
        publicationStatus={rawAbout?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawAbout?.has_unpublished_changes)}
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

export function AboutManagementPage() {
  const aboutQuery = useQuery({
    queryKey: QUERY_KEYS.cmsAbout,
    queryFn: () => fetchSingleton('about_content'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="About Section Management"
        description="Kelola narasi personal, highlight teks, serta heading kartu Education, Experience, dan Certifications."
      />

      {aboutQuery.isLoading ? (
        <FormSkeleton fields={6} />
      ) : aboutQuery.isError ? (
        <ErrorState
          message={aboutQuery.error?.message}
          onRetry={() => aboutQuery.refetch()}
        />
      ) : (
        <AboutForm
          key={`${aboutQuery.data?.updated_at}-${aboutQuery.data?.has_unpublished_changes}`}
          rawAbout={aboutQuery.data}
        />
      )}
    </div>
  );
}
