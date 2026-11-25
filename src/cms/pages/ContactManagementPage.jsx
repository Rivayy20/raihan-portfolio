import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaCheckCircle, FaEdit, FaExclamationTriangle, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { SOCIAL_LINK_COLORS } from '../../constants/colorPresets';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
import {
  createCollectionItem,
  deleteCollectionItem,
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
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
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

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

const SOCIAL_SWATCHES = [
  { key: 'white', label: 'White' },
  { key: 'secondary', label: 'Sky Blue' },
  { key: 'accent', label: 'Yellow' },
  { key: 'primary', label: 'Cyan' },
];

const contactSchema = z.object({
  heading: z.string().trim().min(1, 'Heading wajib diisi.'),
  description: z.string().trim().min(1, 'Deskripsi kontak wajib diisi.'),
  email: z.string().trim().min(1, 'Email wajib diisi.').email('Format email tidak valid.'),
  availability_status: z.string().trim().min(1, 'Availability status wajib diisi.'),
  response_time_text: z.string().trim().min(1, 'Response time wajib diisi.'),
  location_text: z.string().trim().min(1, 'Lokasi wajib diisi.'),
  form_heading: z.string().trim().min(1, 'Heading form wajib diisi.'),
  form_submit_label: z.string().trim().min(1, 'Label tombol submit wajib diisi.'),
});

const socialSchema = z.object({
  label: z.string().trim().min(1, 'Label social link wajib diisi.'),
  url: z
    .string()
    .trim()
    .min(1, 'URL wajib diisi.')
    .refine((v) => isSafeUrl(v), 'Gunakan URL http/https yang valid.'),
});

function ContactForm({ rawContact }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawContact) || {};

  const [form, setForm] = useState({
    heading: effective.heading ?? "LET'S\nTALK.",
    description: effective.description ?? '',
    email: effective.email ?? '',
    availability_status: effective.availability_status ?? 'Available for Freelance',
    is_available: effective.is_available ?? true,
    response_time_text:
      effective.response_time_text ?? 'Usually Replies Within 24 Hours',
    location_text: effective.location_text ?? 'Bandung, Indonesia',
    form_heading: effective.form_heading ?? 'Send a Message',
    form_submit_label: effective.form_submit_label ?? 'Shoot Message',
    show_availability: effective.show_availability ?? true,
    show_response_time: effective.show_response_time ?? true,
    show_location: effective.show_location ?? true,
    show_contact_form: effective.show_contact_form ?? true,
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const hasWeb3FormsKey = Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field kontak yang belum valid.');
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
        table: 'contact_settings',
        currentRow: rawContact,
        payload: valid,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsContact]);
      setIsDirty(false);
      toast.success('Draft Contact Settings disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft Contact.');
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
        table: 'contact_settings',
        currentRow: rawContact,
        payload: valid,
        summaryNote: 'Published Contact Settings',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsContact]);
      setIsDirty(false);
      toast.success('Contact Settings dipublikasikan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan Contact.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'contact_settings' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsContact]);
      toast.info('Draft Contact dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Web3Forms Security Status */}
      <div
        className={`rounded-2xl border p-4 flex items-start gap-3 text-sm ${
          hasWeb3FormsKey
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
        }`}
      >
        {hasWeb3FormsKey ? (
          <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
        ) : (
          <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" />
        )}
        <div>
          <p className="font-semibold">
            Web3Forms Integration:{' '}
            {hasWeb3FormsKey
              ? 'Aktif (Terkonfigurasi via Environment Variable)'
              : 'Belum Terkonfigurasi di .env'}
          </p>
          <p className="text-xs opacity-85 mt-0.5">
            Access key dikelola secara aman melalui{' '}
            <code className="font-mono">VITE_WEB3FORMS_ACCESS_KEY</code> dan tidak pernah
            disimpan di database CMS.
          </p>
        </div>
      </div>

      <SectionCard
        title="Informasi Kontak & Status Ketersediaan"
        description="Atur heading, email, availability badge, waktu respons, lokasi, dan label form."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextAreaField
            label="Contact Heading"
            rows={2}
            value={form.heading}
            onChange={(e) => updateField('heading', e.target.value)}
            helperText="Gunakan Enter/baris baru untuk memisah baris heading."
            error={errors.heading}
            required
          />
          <TextAreaField
            label="Contact Description"
            rows={2}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            required
          />
          <TextField
            label="Availability Status Text"
            value={form.availability_status}
            onChange={(e) => updateField('availability_status', e.target.value)}
            error={errors.availability_status}
            required
          />
          <TextField
            label="Response Time Text"
            value={form.response_time_text}
            onChange={(e) => updateField('response_time_text', e.target.value)}
            error={errors.response_time_text}
            required
          />
          <TextField
            label="Location Text"
            value={form.location_text}
            onChange={(e) => updateField('location_text', e.target.value)}
            error={errors.location_text}
            required
          />
          <TextField
            label="Judul Form Kontak"
            value={form.form_heading}
            onChange={(e) => updateField('form_heading', e.target.value)}
            error={errors.form_heading}
            required
          />
          <TextField
            label="Teks Tombol Submit Form"
            value={form.form_submit_label}
            onChange={(e) => updateField('form_submit_label', e.target.value)}
            error={errors.form_submit_label}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <ToggleField
            label="Status Indikator Hijau (Available)"
            checked={form.is_available}
            onChange={(val) => updateField('is_available', val)}
          />
          <ToggleField
            label="Tampilkan Availability Badge"
            checked={form.show_availability}
            onChange={(val) => updateField('show_availability', val)}
          />
          <ToggleField
            label="Tampilkan Response Time"
            checked={form.show_response_time}
            onChange={(val) => updateField('show_response_time', val)}
          />
          <ToggleField
            label="Tampilkan Lokasi"
            checked={form.show_location}
            onChange={(val) => updateField('show_location', val)}
          />
          <ToggleField
            label="Tampilkan Form Kontak"
            checked={form.show_contact_form}
            onChange={(val) => updateField('show_contact_form', val)}
          />
        </div>
      </SectionCard>

      <DraftPublishBar
        publicationStatus={rawContact?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawContact?.has_unpublished_changes)}
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

function SocialLinkForm({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(item);

  const [form, setForm] = useState({
    platform: effective?.platform ?? 'linkedin',
    label: effective?.label ?? '',
    tooltip_text: effective?.tooltip_text ?? '',
    url: effective?.url ?? '',
    color_preset: effective?.color_preset ?? 'white',
    show_in_contact: effective?.show_in_contact ?? true,
    show_in_footer: effective?.show_in_footer ?? true,
    show_in_seo_same_as: effective?.show_in_seo_same_as ?? true,
    is_visible: effective?.is_visible ?? true,
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
    const parsed = socialSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field social link.');
      return null;
    }

    return {
      platform: form.platform,
      label: parsed.data.label,
      tooltip_text: form.tooltip_text.trim() || `Visit ${parsed.data.label}`,
      url: parsed.data.url,
      color_preset: form.color_preset,
      show_in_contact: Boolean(form.show_in_contact),
      show_in_footer: Boolean(form.show_in_footer),
      show_in_seo_same_as: Boolean(form.show_in_seo_same_as),
      is_visible: Boolean(form.is_visible),
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
          table: 'social_links',
          currentRow: item,
          payload: valid,
        });
      } else {
        await createCollectionItem({
          table: 'social_links',
          payload: valid,
          publishImmediately: false,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSocialLinks]);
      toast.success('Draft social link disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan social link.');
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
          table: 'social_links',
          currentRow: item,
          payload: valid,
          summaryNote: `Published social link: ${valid.label}`,
        });
      } else {
        await createCollectionItem({
          table: 'social_links',
          payload: valid,
          publishImmediately: true,
          summaryNote: `Published social link: ${valid.label}`,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSocialLinks]);
      toast.success(`Social link "${valid.label}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan social link.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'social_links',
        currentRow: item,
        summaryNote: `Unpublished social link: ${item.label}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSocialLinks]);
      toast.info(`"${item.label}" ditarik ke draft.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await discardCollectionDraft({ table: 'social_links', id: item.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSocialLinks]);
      toast.info('Draft dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title={item ? `Edit Social Link: ${effective?.label}` : 'Tambah Social Link Baru'}
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
        <SelectField
          label="Platform"
          value={form.platform}
          onChange={(e) => updateField('platform', e.target.value)}
          options={PLATFORMS}
        />
        <TextField
          label="Label"
          value={form.label}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="LinkedIn / GitHub / Instagram"
          error={errors.label}
          required
        />
        <TextField
          label="URL Profil"
          value={form.url}
          onChange={(e) => updateField('url', e.target.value)}
          placeholder="https://github.com/Rivayy20/"
          error={errors.url}
          required
        />
        <TextField
          label="Tooltip Text"
          value={form.tooltip_text}
          onChange={(e) => updateField('tooltip_text', e.target.value)}
          placeholder="Visit GitHub Profile"
        />
      </div>

      <div className="mt-4 space-y-2">
        <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-200">
          Warna Tombol di Contact
        </span>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_SWATCHES.map((sw) => {
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
                    SOCIAL_LINK_COLORS[sw.key] || ''
                  }`}
                />
                {sw.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <ToggleField
          label="Visible"
          checked={form.is_visible}
          onChange={(val) => updateField('is_visible', val)}
        />
        <ToggleField
          label="Tampil di Contact"
          checked={form.show_in_contact}
          onChange={(val) => updateField('show_in_contact', val)}
        />
        <ToggleField
          label="Tampil di Footer"
          checked={form.show_in_footer}
          onChange={(val) => updateField('show_in_footer', val)}
        />
        <ToggleField
          label="SEO JSON-LD sameAs"
          checked={form.show_in_seo_same_as}
          onChange={(val) => updateField('show_in_seo_same_as', val)}
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

export function ContactManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingSocial, setEditingSocial] = useState(null);
  const [isCreatingSocial, setIsCreatingSocial] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const contactQuery = useQuery({
    queryKey: QUERY_KEYS.cmsContact,
    queryFn: () => fetchSingleton('contact_settings'),
  });

  const socialQuery = useQuery({
    queryKey: QUERY_KEYS.cmsSocialLinks,
    queryFn: () => listCollection('social_links', { orderBy: 'display_order' }),
  });

  const socials = socialQuery.data || [];

  const handleMoveSocial = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= socials.length) return;
    const reordered = [...socials];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setIsReordering(true);
    try {
      await reorderCollectionItems({
        table: 'social_links',
        orderedIds: reordered.map((x) => x.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSocialLinks]);
      toast.success('Urutan social links diperbarui.');
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
      await deleteCollectionItem({
        table: 'social_links',
        currentRow: deleteTarget,
        summaryNote: `Deleted social link: ${deleteTarget.label}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSocialLinks]);
      toast.success(`"${deleteTarget.label}" dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus social link.');
    } finally {
      setIsDeleting(false);
    }
  };

  const socialColumns = [
    {
      key: 'order',
      label: 'Urutan',
      render: (row) => {
        const idx = socials.findIndex((x) => x.id === row.id);
        return (
          <OrderControls
            index={idx}
            total={socials.length}
            disabled={isReordering}
            onMoveUp={() => handleMoveSocial(idx, idx - 1)}
            onMoveDown={() => handleMoveSocial(idx, idx + 1)}
          />
        );
      },
    },
    {
      key: 'label',
      label: 'Platform & URL',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">
              {eff.label}{' '}
              <span className="text-xs font-normal text-slate-400">({eff.platform})</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[260px]">
              {eff.url}
            </p>
          </div>
        );
      },
    },
    {
      key: 'placement',
      label: 'Tampil Di',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div className="flex flex-wrap gap-1 text-xs">
            {eff.show_in_contact && (
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">Contact</span>
            )}
            {eff.show_in_footer && (
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">Footer</span>
            )}
            {eff.show_in_seo_same_as && (
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">SEO</span>
            )}
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
              setIsCreatingSocial(false);
              setEditingSocial(row);
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
    <div className="space-y-8">
      <PageHeader
        title="Contact & Social Links"
        description="Kelola informasi kontak, status ketersediaan, serta tautan media sosial untuk Contact, Footer, dan SEO."
      />

      {contactQuery.isLoading ? (
        <FormSkeleton fields={6} />
      ) : contactQuery.isError ? (
        <ErrorState
          message={contactQuery.error?.message}
          onRetry={() => contactQuery.refetch()}
        />
      ) : (
        <ContactForm
          key={`${contactQuery.data?.updated_at}-${contactQuery.data?.has_unpublished_changes}`}
          rawContact={contactQuery.data}
        />
      )}

      {/* Social Links Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-zinc-100">
              Social Links (Single Source of Truth)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Digunakan otomatis pada Contact Section, Footer, dan Schema JSON-LD Person.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingSocial(null);
              setIsCreatingSocial(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B4D8] hover:bg-[#0096B4] text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
          >
            <FaPlus /> Tambah Social Link
          </button>
        </div>

        {(isCreatingSocial || editingSocial) && (
          <SocialLinkForm
            key={editingSocial ? `${editingSocial.id}-${editingSocial.updated_at}` : 'new-social'}
            item={editingSocial}
            totalCount={socials.length}
            onClose={() => {
              setIsCreatingSocial(false);
              setEditingSocial(null);
            }}
          />
        )}

        <DataTable
          columns={socialColumns}
          data={socials}
          isLoading={socialQuery.isLoading}
          error={socialQuery.error}
          onRetry={() => socialQuery.refetch()}
          emptyTitle="Belum ada social link"
          emptyDescription="Tambahkan LinkedIn, GitHub, Instagram, atau media sosial lainnya."
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Social Link?"
        description={
          deleteTarget
            ? `Social link "${deleteTarget.label}" akan dihapus permanen.`
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
